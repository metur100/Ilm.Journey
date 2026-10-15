import type { MapPlaceId } from '../models';

export type LabelSide = 'left' | 'right' | 'top' | 'bottom';

/**
 * Approximate positions on the stylised story map (viewBox 400 × 300) – not exact geography. The Levant is drawn
 * larger than it is so that its places do not overlap. `label` says on which side of the pin the name is shown.
 */
export const PLACES: Record<MapPlaceId, { x: number; y: number; label: LabelSide }> = {
  judi: { x: 248, y: 30, label: 'left' },
  nineveh: { x: 270, y: 58, label: 'right' },
  mesopotamia: { x: 290, y: 106, label: 'right' },
  canaan: { x: 140, y: 64, label: 'left' },
  jerusalem: { x: 136, y: 92, label: 'left' },
  lut: { x: 160, y: 106, label: 'right' },
  egypt: { x: 66, y: 132, label: 'left' },
  sinai: { x: 116, y: 146, label: 'bottom' },
  madyan: { x: 154, y: 140, label: 'right' },
  hijr: { x: 178, y: 176, label: 'right' },
  madinah: { x: 198, y: 208, label: 'right' },
  makkah: { x: 216, y: 248, label: 'left' },
  ahqaf: { x: 318, y: 236, label: 'top' },
  saba: { x: 252, y: 276, label: 'right' },
};

export const PLACE_IDS = Object.keys(PLACES) as MapPlaceId[];

export function isMapPlace(value: string): value is MapPlaceId {
  return Object.prototype.hasOwnProperty.call(PLACES, value);
}
