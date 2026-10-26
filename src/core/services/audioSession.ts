import { type AudioMode, type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

import { boostPlayer, bindVolumeKeys } from '../../../modules/audio-volume';

/**
 * The one audio mode for the whole app (UI sounds, Quran recitation, game recitation). See docs/AUDIO.md.
 *
 * - `playsInSilentMode: true` – learning audio the child asked for (a letter, an ayah) must be audible; on Android
 *   `false` would suppress all playback while the ringer is on vibrate/silent, which looks like "no sound at all".
 * - `mixWithOthers` – short clips; on Android this requests no audio focus, so nothing else is paused.
 * - speaker output, no background playback.
 */
export const APP_AUDIO_MODE: Partial<AudioMode> = {
  playsInSilentMode: true,
  shouldPlayInBackground: false,
  shouldRouteThroughEarpiece: false,
  interruptionMode: 'mixWithOthers',
};

let audioSession: Promise<void> | null = null;

/**
 * Applies {@link APP_AUDIO_MODE} once. Rejects when the native call fails (and retries on the next call); callers
 * should still play their audio in that case – the mode is an improvement, not a requirement.
 */
export function configureAudioSession(): Promise<void> {
  if (!audioSession) {
    bindVolumeKeys();
    audioSession = setAudioModeAsync(APP_AUDIO_MODE).catch((error: unknown) => {
      audioSession = null;
      if (__DEV__) console.warn('[audio] setAudioModeAsync failed', error);
      throw error;
    });
  }
  return audioSession;
}

/** Waits for the audio mode but never rejects – for "configure, then play anyway". */
export function audioSessionReady(): Promise<void> {
  return configureAudioSession().catch(() => undefined);
}

/**
 * Extra loudness (millibels, 100 = 1 dB) for audio the learner asked for. Android's LoudnessEnhancer has a limiter, so
 * the boost lifts quiet passages without clipping. The device volume is never changed. See docs/AUDIO.md.
 */
export const LOUDNESS_GAIN = {
  /** Quran recitation streams (mastered fairly quietly). */
  recitation: 700,
  /** The device voice (letters, prayer formulas, stories) – TTS engines speak much more quietly than music. */
  speech: 1100,
} as const;

/** Applies the learner-audio boost to an expo-audio player (Android; a no-op elsewhere). Never throws. */
export function boostLearnerAudio(player: object, gainMb: number = LOUDNESS_GAIN.recitation): void {
  void boostPlayer(player, gainMb);
}

const sharedPlayers = new Map<string, AudioPlayer>();

/**
 * One reusable, boosted player per purpose (`replace()` swaps its source). A new expo-audio player per clip registers
 * a new Android media session each time; they pile up until Android refuses new ones and the app falls silent.
 */
export function sharedLearnerPlayer(key: string, gainMb: number = LOUDNESS_GAIN.recitation): AudioPlayer {
  const existing = sharedPlayers.get(key);
  if (existing) return existing;
  const player = createAudioPlayer(null);
  player.volume = 1;
  boostLearnerAudio(player, gainMb);
  sharedPlayers.set(key, player);
  return player;
}

/** Tests: forget the configured session. */
export function resetAudioSessionForTests(): void {
  audioSession = null;
  sharedPlayers.clear();
}
