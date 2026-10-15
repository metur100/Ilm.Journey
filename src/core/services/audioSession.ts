import { type AudioMode, setAudioModeAsync } from 'expo-audio';

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

/** Tests: forget the configured session. */
export function resetAudioSessionForTests(): void {
  audioSession = null;
}
