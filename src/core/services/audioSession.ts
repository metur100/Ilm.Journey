import { setAudioModeAsync } from 'expo-audio';

let audioSession: Promise<void> | null = null;

export function configureAudioSession(): Promise<void> {
  if (!audioSession) {
    audioSession = setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    }).catch((error: unknown) => {
      audioSession = null;
      throw error;
    });
  }
  return audioSession;
}