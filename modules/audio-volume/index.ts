import { requireOptionalNativeModule } from 'expo';

interface AudioVolumeNative {
  bindVolumeKeys(): void;
  boost(player: object, gainMb: number): Promise<boolean>;
  synthesize(text: string, language: string, voice: string | null, rate: number): Promise<string | null>;
}

/** Android only; null on iOS, web and in tests. */
const native = requireOptionalNativeModule<AudioVolumeNative>('AudioVolume');

/** True when the device voice can be rendered to a file and played boosted (Android). */
export const canSynthesize = !!native;

/** Makes the hardware volume keys change the media volume while the app is open. */
export function bindVolumeKeys(): void {
  try {
    native?.bindVolumeKeys();
  } catch {
    // optional
  }
}

/** Raises the loudness of an expo-audio player (millibels; 100 = 1 dB) without changing the device volume. */
export async function boostPlayer(player: object, gainMb: number): Promise<boolean> {
  try {
    return (await native?.boost(player, gainMb)) ?? false;
  } catch {
    return false;
  }
}

/** Device text-to-speech rendered to a cached WAV file; resolves its path, or null when it could not be spoken. */
export async function synthesizeSpeech(text: string, language: string, voice: string | undefined, rate: number): Promise<string | null> {
  try {
    return (await native?.synthesize(text, language, voice ?? null, rate)) ?? null;
  } catch {
    return null;
  }
}
