import { requireOptionalNativeModule } from 'expo';

interface AudioVolumeNative {
  bindVolumeKeys(): void;
  ensureMinMediaVolume(fraction: number): boolean;
}

/** Android only; null on iOS, web and in tests. */
const native = requireOptionalNativeModule<AudioVolumeNative>('AudioVolume');

/** Makes the hardware volume keys change the media volume while the app is open. */
export function bindVolumeKeys(): void {
  try {
    native?.bindVolumeKeys();
  } catch {
    // optional
  }
}

/** Raises a very low media volume to `fraction` of its maximum. Returns true when it changed the volume. */
export function ensureMinMediaVolume(fraction: number): boolean {
  try {
    return native?.ensureMinMediaVolume(fraction) ?? false;
  } catch {
    return false;
  }
}
