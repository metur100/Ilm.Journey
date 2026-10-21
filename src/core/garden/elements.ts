/**
 * Ilm Garden element table: every placeable element, the level that makes it available and its seed cost
 * (paid once to unlock the element; planting an unlocked element is free – the 16 spots are the limit).
 * Art names follow the art library: `garden.<id>`.
 */

export type GardenElementKind = 'tree' | 'plant' | 'flower' | 'water' | 'decor' | 'building' | 'creature';

/** Idle animation of an element in the scene (all disabled under reduced motion). */
export type GardenMotion = 'none' | 'sway' | 'flutter' | 'fly' | 'shimmer';

export interface GardenElement {
  id: string;
  kind: GardenElementKind;
  /** Learner level at which the element becomes available. */
  minLevel: number;
  /** Seeds paid once to unlock it (0 = free once the level is reached). */
  seedCost: number;
  /** Base width in the scene relative to the scene width (scaled by the depth of the spot). */
  size: number;
  motion: GardenMotion;
}

export const GARDEN_ELEMENTS: readonly GardenElement[] = [
  // level 1 – the first things that grow
  { id: 'sapling', kind: 'plant', minLevel: 1, seedCost: 0, size: 0.12, motion: 'sway' },
  { id: 'bush', kind: 'plant', minLevel: 1, seedCost: 0, size: 0.14, motion: 'sway' },
  { id: 'flower-rose', kind: 'flower', minLevel: 1, seedCost: 0, size: 0.09, motion: 'sway' },
  { id: 'rock', kind: 'decor', minLevel: 1, seedCost: 0, size: 0.1, motion: 'none' },
  { id: 'path-stone', kind: 'decor', minLevel: 1, seedCost: 0, size: 0.12, motion: 'none' },
  { id: 'flower-tulip', kind: 'flower', minLevel: 1, seedCost: 2, size: 0.09, motion: 'sway' },
  { id: 'flower-jasmine', kind: 'flower', minLevel: 1, seedCost: 2, size: 0.09, motion: 'sway' },
  // level 2
  { id: 'palm', kind: 'tree', minLevel: 2, seedCost: 3, size: 0.22, motion: 'sway' },
  { id: 'flower-lily', kind: 'flower', minLevel: 2, seedCost: 2, size: 0.09, motion: 'sway' },
  { id: 'bench', kind: 'decor', minLevel: 2, seedCost: 2, size: 0.16, motion: 'none' },
  { id: 'butterfly', kind: 'creature', minLevel: 2, seedCost: 2, size: 0.07, motion: 'flutter' },
  // level 3
  { id: 'olive', kind: 'tree', minLevel: 3, seedCost: 4, size: 0.22, motion: 'sway' },
  { id: 'lantern-post', kind: 'decor', minLevel: 3, seedCost: 3, size: 0.08, motion: 'none' },
  { id: 'bird', kind: 'creature', minLevel: 3, seedCost: 3, size: 0.07, motion: 'fly' },
  { id: 'fence', kind: 'decor', minLevel: 3, seedCost: 2, size: 0.18, motion: 'none' },
  // level 4
  { id: 'fig', kind: 'tree', minLevel: 4, seedCost: 4, size: 0.2, motion: 'sway' },
  { id: 'pond', kind: 'water', minLevel: 4, seedCost: 5, size: 0.22, motion: 'shimmer' },
  { id: 'bee', kind: 'creature', minLevel: 4, seedCost: 2, size: 0.05, motion: 'flutter' },
  { id: 'beehive', kind: 'decor', minLevel: 4, seedCost: 3, size: 0.09, motion: 'none' },
  // level 5
  { id: 'pomegranate', kind: 'tree', minLevel: 5, seedCost: 5, size: 0.2, motion: 'sway' },
  { id: 'stream', kind: 'water', minLevel: 5, seedCost: 5, size: 0.26, motion: 'shimmer' },
  { id: 'dove', kind: 'creature', minLevel: 5, seedCost: 3, size: 0.08, motion: 'fly' },
  { id: 'gate', kind: 'decor', minLevel: 5, seedCost: 3, size: 0.16, motion: 'none' },
  // level 6+
  { id: 'lemon', kind: 'tree', minLevel: 6, seedCost: 5, size: 0.2, motion: 'sway' },
  { id: 'fountain', kind: 'water', minLevel: 6, seedCost: 6, size: 0.2, motion: 'shimmer' },
  { id: 'arch', kind: 'building', minLevel: 7, seedCost: 6, size: 0.22, motion: 'none' },
  { id: 'minaret', kind: 'building', minLevel: 8, seedCost: 8, size: 0.14, motion: 'none' },
  { id: 'masjid-small', kind: 'building', minLevel: 10, seedCost: 10, size: 0.3, motion: 'none' },
];

const BY_ID = new Map(GARDEN_ELEMENTS.map((e) => [e.id, e]));

export function getGardenElement(id: string): GardenElement | undefined {
  return BY_ID.get(id);
}

export const gardenArt = (elementId: string) => `garden.${elementId}`;

/** Sky pieces of the scene (art library names). */
export const GARDEN_SKY_ART = { backdrop: 'scene.garden-backdrop', sun: 'garden.sun', moon: 'garden.moon', stars: 'garden.stars' } as const;

/** Land layers of the backdrop (no sky – the scene draws the sky for the real time of day). */
export const GARDEN_BACKDROP_LAYERS = ['scene.garden-far', 'scene.garden-mid', 'scene.garden-lawn'] as const;

/** Every art name the garden references (checked against the art library by a test). */
export const GARDEN_ART_NAMES: readonly string[] = [...Object.values(GARDEN_SKY_ART), ...GARDEN_BACKDROP_LAYERS, ...GARDEN_ELEMENTS.map((e) => gardenArt(e.id))];

/** Elements whose level is reached, in table order. */
export function elementsForLevel(level: number): GardenElement[] {
  return GARDEN_ELEMENTS.filter((e) => e.minLevel <= level);
}

/** Elements that become available exactly at `level` (shown in the level-up celebration). */
export function elementsUnlockedAtLevel(level: number): GardenElement[] {
  return GARDEN_ELEMENTS.filter((e) => e.minLevel === level);
}

/** Plants grow with watering: sprout → young → full (only trees, plants and flowers grow). */
export function grows(element: GardenElement): boolean {
  return element.kind === 'tree' || element.kind === 'plant' || element.kind === 'flower';
}

export interface GardenSpot {
  /** 0..1 from the left edge of the scene. */
  x: number;
  /** 0..1 from the top: the element's base (feet) stands here. */
  y: number;
}

/**
 * 16 predefined spots in three rows (back → front). Depth scaling makes the back row smaller.
 * Index order is stable – placed elements store their spot index.
 */
export const GARDEN_SPOTS: readonly GardenSpot[] = [
  // back row – trees, buildings and water; feet firmly on the lawn behind the path
  { x: 0.12, y: 0.62 },
  { x: 0.31, y: 0.6 },
  { x: 0.5, y: 0.59 },
  { x: 0.69, y: 0.6 },
  { x: 0.88, y: 0.62 },
  // middle row – plants, flowers and decor
  { x: 0.08, y: 0.75 },
  { x: 0.25, y: 0.73 },
  { x: 0.42, y: 0.74 },
  { x: 0.59, y: 0.73 },
  { x: 0.76, y: 0.74 },
  { x: 0.93, y: 0.76 },
  // front row – small flowers, decor and creatures
  { x: 0.15, y: 0.9 },
  { x: 0.34, y: 0.92 },
  { x: 0.53, y: 0.91 },
  { x: 0.72, y: 0.92 },
  { x: 0.89, y: 0.9 },
];

/** Depth scale of a spot: 0.7 at the back row, ~1.15 at the front. */
export function depthScale(spot: GardenSpot): number {
  const t = Math.max(0, Math.min(1, (spot.y - 0.59) / (0.92 - 0.59)));
  return 0.7 + t * 0.45;
}

/** The tidy rows of the garden: large things at the back, small things in front. */
export const GARDEN_ROWS: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
];

/**
 * Auto-placement for an element: trees, buildings and water go to the back row, plants, flowers and decor to
 * the middle row, creatures to the front. Fills the first free place of its row, never "anywhere".
 */
export function nextSpotFor(element: GardenElement, free: readonly number[]): number | null {
  const row = element.kind === 'tree' || element.kind === 'building' || element.kind === 'water' ? 0 : element.kind === 'creature' ? 2 : 1;
  const preferred = GARDEN_ROWS[row].find((spot) => free.includes(spot));
  return preferred ?? free[0] ?? null;
}

/** Width cap per spot row, so neighbouring elements never overlap. */
export function maxWidthFraction(spot: number): number {
  return spot < 5 ? 0.18 : spot < 11 ? 0.15 : 0.18;
}
