import type { SceneElement, SkyKind } from '@/core/models';

const SKY_FOR: Partial<Record<SceneElement, SkyKind>> = { whale: 'sea', rain: 'storm', waves: 'sea', fire: 'dusk', cave: 'night', sea: 'day' };

/** Background sky for a single illustrated object tile. */
export function skyFor(element: SceneElement): SkyKind {
  return SKY_FOR[element] ?? 'day';
}
