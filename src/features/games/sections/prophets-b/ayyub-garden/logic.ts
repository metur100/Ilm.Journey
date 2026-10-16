/*
 * Garden of Patience – pure rules. Every bed of a withered garden is cared for step by step: an empty bed needs a
 * seed, a seed or a dry plant needs water, a young plant needs water again, then it blooms. After each care the plant
 * grows for a while – patience: it cannot be cared for again until it has grown.
 */

export type Tool = 'seed' | 'water';
export type Bed = 'empty' | 'seeded' | 'dry' | 'sprout' | 'bloom';

export interface GardenConfig {
  beds: Bed[];
  tools: Tool[];
  /** Show what every bed needs (a small bubble). */
  bubbles: boolean;
  hints: boolean;
  /** Tapping a plant while it grows counts as a mistake (L3: patient care). */
  strictPatience: boolean;
}

/** The tool a bed needs next (null = in bloom). */
export function needOf(bed: Bed): Tool | null {
  if (bed === 'empty') return 'seed';
  if (bed === 'bloom') return null;
  return 'water';
}

/** The bed after the right care. */
export function grow(bed: Bed): Bed {
  switch (bed) {
    case 'empty':
      return 'seeded';
    case 'seeded':
    case 'dry':
      return 'sprout';
    default:
      return 'bloom';
  }
}

/** Cares needed until every bed blooms. */
export function caresNeeded(beds: readonly Bed[]): number {
  const steps: Record<Bed, number> = { empty: 3, seeded: 2, dry: 2, sprout: 1, bloom: 0 };
  return beds.reduce((sum, b) => sum + steps[b], 0);
}

export const LEVEL_1: GardenConfig = { beds: ['dry', 'dry', 'dry', 'dry'], tools: ['water'], bubbles: true, hints: true, strictPatience: false };
export const LEVEL_2: GardenConfig = { beds: ['empty', 'dry', 'empty', 'dry', 'sprout', 'empty'], tools: ['seed', 'water'], bubbles: true, hints: false, strictPatience: false };
export const LEVEL_3: GardenConfig = { beds: ['dry', 'empty', 'sprout', 'empty', 'dry', 'empty'], tools: ['seed', 'water'], bubbles: false, hints: false, strictPatience: true };
