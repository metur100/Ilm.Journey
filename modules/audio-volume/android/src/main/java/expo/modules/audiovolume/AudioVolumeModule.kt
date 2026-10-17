package expo.modules.audiovolume

import android.content.Context
import android.media.AudioManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlin.math.ceil

/**
 * Media volume for learner-requested audio (Quran recitation, Arabic letters, narration).
 *
 * - The hardware volume keys always change the media volume while the app is open. Without this, Android changes the
 *   ringer volume whenever nothing is playing, so the learner turns "the volume" up and the recitation stays quiet.
 * - `ensureMinMediaVolume(fraction)` raises a very low media volume (the emulator starts at 5/15) to that fraction
 *   when the learner taps Listen. It never lowers the volume and does nothing when the media stream is muted.
 */
class AudioVolumeModule : Module() {
  private val audioManager: AudioManager?
    get() = appContext.reactContext?.getSystemService(Context.AUDIO_SERVICE) as? AudioManager

  private fun bindVolumeKeys() {
    appContext.currentActivity?.let { activity ->
      activity.runOnUiThread { activity.volumeControlStream = AudioManager.STREAM_MUSIC }
    }
  }

  override fun definition() = ModuleDefinition {
    Name("AudioVolume")

    OnCreate { bindVolumeKeys() }
    OnActivityEntersForeground { bindVolumeKeys() }

    Function("bindVolumeKeys") { bindVolumeKeys() }

    Function("ensureMinMediaVolume") { fraction: Double ->
      val manager = audioManager ?: return@Function false
      try {
        val stream = AudioManager.STREAM_MUSIC
        if (manager.isStreamMute(stream)) return@Function false
        val max = manager.getStreamMaxVolume(stream)
        val target = ceil(max * fraction.coerceIn(0.0, 1.0)).toInt().coerceIn(0, max)
        if (manager.getStreamVolume(stream) >= target) return@Function false
        manager.setStreamVolume(stream, target, AudioManager.FLAG_SHOW_UI)
        true
      } catch (_: Exception) {
        // Do-not-disturb or a fixed-volume device: leave the volume alone.
        false
      }
    }
  }
}
