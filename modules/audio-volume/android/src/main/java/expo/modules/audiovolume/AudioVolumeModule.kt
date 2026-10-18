package expo.modules.audiovolume

import android.media.AudioManager
import android.media.audiofx.LoudnessEnhancer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.speech.tts.Voice
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.sharedobjects.SharedRef
import java.io.File
import java.security.MessageDigest
import java.util.Locale

/**
 * Makes learner audio (Quran recitation, Arabic letters, prayer formulas, stories) clearly audible – without touching
 * the device volume.
 *
 * - `boost(player, gainMb)`: attaches Android's LoudnessEnhancer (a gain with a built-in limiter, so it does not clip)
 *   to the audio session of an expo-audio player.
 * - `synthesize(...)`: the device's text-to-speech engine writes the utterance to a WAV file instead of playing it, so
 *   the app can play it through a boosted player (the TTS engine's own playback is quiet and cannot be boosted).
 * - The hardware volume keys change the media volume while the app is open (otherwise Android changes the ringer volume
 *   whenever nothing is playing).
 */
class AudioVolumeModule : Module() {
  private var tts: TextToSpeech? = null
  private var ttsReady = false
  private val waitingForTts = mutableListOf<(Boolean) -> Unit>()
  private val pending = mutableMapOf<String, Promise>()
  private val enhancers = LinkedHashMap<Int, LoudnessEnhancer>()

  private fun bindVolumeKeys() {
    appContext.currentActivity?.let { activity ->
      activity.runOnUiThread { activity.volumeControlStream = AudioManager.STREAM_MUSIC }
    }
  }

  private fun withTts(block: (Boolean) -> Unit) {
    if (ttsReady) return block(true)
    waitingForTts.add(block)
    if (tts != null) return
    val context = appContext.reactContext ?: return block(false)
    tts = TextToSpeech(context) { status ->
      ttsReady = status == TextToSpeech.SUCCESS
      tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
        override fun onStart(utteranceId: String) = Unit
        override fun onDone(utteranceId: String) {
          pending.remove(utteranceId)?.resolve(File(cacheDir(), "$utteranceId.wav").absolutePath)
        }
        @Deprecated("Deprecated in Java")
        override fun onError(utteranceId: String) {
          File(cacheDir(), "$utteranceId.wav").delete()
          pending.remove(utteranceId)?.resolve(null)
        }
        override fun onError(utteranceId: String, errorCode: Int) {
          File(cacheDir(), "$utteranceId.wav").delete()
          pending.remove(utteranceId)?.resolve(null)
        }
      })
      val ready = ttsReady
      val callbacks = waitingForTts.toList()
      waitingForTts.clear()
      callbacks.forEach { it(ready) }
    }
  }

  private fun cacheDir(): File = File(appContext.reactContext!!.cacheDir, "tts").apply { mkdirs() }

  private fun keyOf(vararg parts: String): String {
    val digest = MessageDigest.getInstance("SHA-1").digest(parts.joinToString("\u0000").toByteArray())
    return digest.joinToString("") { "%02x".format(it) }
  }

  override fun definition() = ModuleDefinition {
    Name("AudioVolume")

    OnCreate { bindVolumeKeys() }
    OnActivityEntersForeground { bindVolumeKeys() }
    OnDestroy {
      tts?.shutdown()
      tts = null
      enhancers.values.forEach { runCatching { it.release() } }
      enhancers.clear()
    }

    Function("bindVolumeKeys") { bindVolumeKeys() }

    /** Raises the loudness of an expo-audio player by `gainMb` millibels (100 mB = 1 dB). Returns false when it could not. */
    AsyncFunction("boost") { player: SharedRef<*>, gainMb: Int ->
      try {
        val ref = player.ref ?: return@AsyncFunction false
        val session = ref.javaClass.getMethod("getAudioSessionId").invoke(ref) as Int
        if (session <= 0) return@AsyncFunction false
        val enhancer = enhancers[session] ?: LoudnessEnhancer(session).also { enhancers[session] = it }
        enhancer.setTargetGain(gainMb)
        enhancer.enabled = true
        // players come and go: keep only the newest enhancers
        while (enhancers.size > 12) {
          val oldest = enhancers.keys.first()
          enhancers.remove(oldest)?.let { runCatching { it.release() } }
        }
        true
      } catch (_: Throwable) {
        false
      }
    }.runOnQueue(Queues.MAIN)

    /**
     * Writes `text` spoken by the device voice to a cached WAV file and resolves its path (null when the engine cannot
     * say it, e.g. the voice data is missing and the device is offline). `voice` is a voice name from the engine's list;
     * without it the voice of `language` (a BCP-47 tag) is used.
     */
    AsyncFunction("synthesize") { text: String, language: String, voice: String?, rate: Double, promise: Promise ->
      withTts { ready ->
        val engine = tts
        if (!ready || engine == null) {
          promise.resolve(null)
          return@withTts
        }
        val id = keyOf(text, language, voice ?: "", rate.toString())
        val file = File(cacheDir(), "$id.wav")
        if (file.exists() && file.length() > 0) {
          promise.resolve(file.absolutePath)
          return@withTts
        }
        try {
          val chosen: Voice? = voice?.let { name -> engine.voices?.firstOrNull { it.name == name } }
          if (chosen != null) engine.voice = chosen else engine.language = Locale.forLanguageTag(language)
          engine.setSpeechRate(rate.toFloat())
          pending[id] = promise
          val result = engine.synthesizeToFile(text, null, file, id)
          if (result != TextToSpeech.SUCCESS) {
            pending.remove(id)
            promise.resolve(null)
          }
        } catch (_: Throwable) {
          pending.remove(id)
          promise.resolve(null)
        }
      }
    }
  }
}
