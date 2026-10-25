/**
 * Ilm Garden element table: every placeable element, the level that makes it available and its seed cost
 * (paid once to unlock the element; planting an unlocked element is free – the fitting free spots are the limit).
 * Art names follow the art library: `garden.<id>`.
 */

export type GardenElementKind = 'tree' | 'plant' | 'flower' | 'water' | 'decor' | 'building' | 'creature';

/**
 * Kinds of places in the garden. Every spot has exactly one kind and every element lists the kinds it may stand on,
 * so a fountain can only go to a water spot, a tree only into the grove and a bird only into the sky.
 *
 * - `grove`: the back row on the lawn – trees, the arch, other big things
 * - `water`: a water spot (the head of the path, the pond corner)
 * - `bed`: flower beds on the lawn – flowers, bushes, small plants (butterflies and bees hover above them)
 * - `path`: beside the garden path – bench, lantern, stepping stones
 * - `sky`: above the garden – only flying birds
 */
export type GardenSpotKind = 'grove' | 'water' | 'bed' | 'path' | 'sky';

/** Idle animation of an element in the scene (all disabled under reduced motion). */
export type GardenMotion = 'none' | 'sway' | 'flutter' | 'fly' | 'shimmer';

export interface GardenElement {
  id: string;
  kind: GardenElementKind;
  /** Spot kinds the element may be placed on, in order of preference. */
  spots: readonly GardenSpotKind[];
  /** Learner level at which the element becomes available. */
  minLevel: number;
  /** Seeds paid once to unlock it (0 = free once the level is reached). */
  seedCost: number;
  /** Base width in the scene relative to the scene size (scaled by the depth of the spot). */
  size: number;
  motion: GardenMotion;
}

export const GARDEN_ELEMENTS: readonly GardenElement[] = [
  // level 1 – the first things that grow
  { id: 'sapling', kind: 'plant', spots: ['bed', 'grove'], minLevel: 1, seedCost: 0, size: 0.12, motion: 'sway' },
  { id: 'bush', kind: 'plant', spots: ['bed', 'grove'], minLevel: 1, seedCost: 0, size: 0.14, motion: 'sway' },
  { id: 'flower-rose', kind: 'flower', spots: ['bed'], minLevel: 1, seedCost: 0, size: 0.09, motion: 'sway' },
  { id: 'rock', kind: 'decor', spots: ['path', 'bed'], minLevel: 1, seedCost: 0, size: 0.1, motion: 'none' },
  { id: 'path-stone', kind: 'decor', spots: ['path'], minLevel: 1, seedCost: 0, size: 0.12, motion: 'none' },
  { id: 'flower-tulip', kind: 'flower', spots: ['bed'], minLevel: 1, seedCost: 2, size: 0.09, motion: 'sway' },
  { id: 'flower-jasmine', kind: 'flower', spots: ['bed'], minLevel: 1, seedCost: 2, size: 0.09, motion: 'sway' },
  // level 2
  { id: 'palm', kind: 'tree', spots: ['grove'], minLevel: 2, seedCost: 3, size: 0.22, motion: 'sway' },
  { id: 'flower-lily', kind: 'flower', spots: ['bed'], minLevel: 2, seedCost: 2, size: 0.09, motion: 'sway' },
  { id: 'bench', kind: 'decor', spots: ['path', 'grove'], minLevel: 2, seedCost: 2, size: 0.16, motion: 'none' },
  { id: 'butterfly', kind: 'creature', spots: ['bed'], minLevel: 2, seedCost: 2, size: 0.07, motion: 'flutter' },
  // level 3
  { id: 'olive', kind: 'tree', spots: ['grove'], minLevel: 3, seedCost: 4, size: 0.22, motion: 'sway' },
  { id: 'lantern-post', kind: 'decor', spots: ['path'], minLevel: 3, seedCost: 3, size: 0.08, motion: 'none' },
  { id: 'bird', kind: 'creature', spots: ['sky'], minLevel: 3, seedCost: 3, size: 0.07, motion: 'fly' },
  // level 4
  { id: 'fig', kind: 'tree', spots: ['grove'], minLevel: 4, seedCost: 4, size: 0.2, motion: 'sway' },
  { id: 'pond', kind: 'water', spots: ['water'], minLevel: 4, seedCost: 5, size: 0.22, motion: 'shimmer' },
  { id: 'bee', kind: 'creature', spots: ['bed'], minLevel: 4, seedCost: 2, size: 0.05, motion: 'flutter' },
  { id: 'beehive', kind: 'decor', spots: ['bed', 'grove'], minLevel: 4, seedCost: 3, size: 0.09, motion: 'none' },
  // level 5
  { id: 'pomegranate', kind: 'tree', spots: ['grove'], minLevel: 5, seedCost: 5, size: 0.2, motion: 'sway' },
  { id: 'dove', kind: 'creature', spots: ['sky'], minLevel: 5, seedCost: 3, size: 0.08, motion: 'fly' },
  // level 6+
  { id: 'lemon', kind: 'tree', spots: ['grove'], minLevel: 6, seedCost: 5, size: 0.2, motion: 'sway' },
  { id: 'fountain', kind: 'water', spots: ['water'], minLevel: 6, seedCost: 6, size: 0.2, motion: 'shimmer' },
  { id: 'arch', kind: 'building', spots: ['grove'], minLevel: 7, seedCost: 6, size: 0.22, motion: 'none' },
];

/**
 * Elements taken out of the garden because they did not fit it (a lone fence piece or gate, a "stream" sprite that
 * could not lie flat on the lawn, a minaret and a masjid next to the masjid of the backdrop) → the seeds once paid
 * for them. Stored gardens drop them and get those seeds back.
 */
export const REMOVED_GARDEN_ELEMENTS: Readonly<Record<string, number>> = { fence: 2, stream: 5, gate: 3, minaret: 8, 'masjid-small': 10 };

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
  kind: GardenSpotKind;
  /** 0..1 from the left edge of the scene. */
  x: number;
  /**
   * Ground spots: depth on the lawn, 0 = the horizon, 1 = the bottom edge (the element's feet stand here).
   * Sky spots: height in the open sky, 0 = its top, 1 = the horizon (the element's centre is here).
   */
  d: number;
  /** Width cap relative to the scene width, so neighbours never cover each other. */
  maxW: number;
}

/**
 * The fixed places of the garden (back → front, then the sky). Index order is stable – placed elements store their
 * spot index. Ground spots are positioned on the lawn by `gardenLayout` (core/garden/layout.ts), so they stay on the
 * grass on every screen size; the middle of the lawn stays free for the path.
 */
export const GARDEN_SPOTS: readonly GardenSpot[] = [
  // back row – the grove, the fountain at the head of the path
  { kind: 'grove', x: 0.09, d: 0.22, maxW: 0.17 },
  { kind: 'grove', x: 0.27, d: 0.2, maxW: 0.18 },
  { kind: 'water', x: 0.54, d: 0.18, maxW: 0.2 },
  { kind: 'grove', x: 0.76, d: 0.2, maxW: 0.18 },
  { kind: 'grove', x: 0.92, d: 0.22, maxW: 0.15 },
  // middle row – flower beds, both sides of the path, the pond
  { kind: 'bed', x: 0.08, d: 0.5, maxW: 0.14 },
  { kind: 'bed', x: 0.22, d: 0.48, maxW: 0.14 },
  { kind: 'path', x: 0.36, d: 0.5, maxW: 0.14 },
  { kind: 'path', x: 0.66, d: 0.5, maxW: 0.14 },
  { kind: 'water', x: 0.85, d: 0.52, maxW: 0.22 },
  // front row – flower beds and a place beside the path
  { kind: 'bed', x: 0.1, d: 0.86, maxW: 0.13 },
  { kind: 'bed', x: 0.25, d: 0.88, maxW: 0.13 },
  { kind: 'path', x: 0.37, d: 0.9, maxW: 0.11 },
  { kind: 'bed', x: 0.64, d: 0.88, maxW: 0.13 },
  { kind: 'bed', x: 0.79, d: 0.86, maxW: 0.13 },
  { kind: 'bed', x: 0.93, d: 0.88, maxW: 0.12 },
  // the sky – only birds fly here
  { kind: 'sky', x: 0.2, d: 0.45, maxW: 0.1 },
  { kind: 'sky', x: 0.44, d: 0.25, maxW: 0.1 },
  { kind: 'sky', x: 0.62, d: 0.55, maxW: 0.1 },
];

/** Depth scale of a spot: 0.7 at the horizon, 1.15 at the front edge; sky spots are not scaled. */
export function depthScale(spot: GardenSpot): number {
  if (spot.kind === 'sky') return 1;
  return 0.7 + Math.max(0, Math.min(1, spot.d)) * 0.45;
}

/** Whether the element may stand on that spot (valid index, right kind of place). */
export function fitsSpot(element: GardenElement, spot: number): boolean {
  const s = Number.isInteger(spot) ? GARDEN_SPOTS[spot] : undefined;
  return !!s && element.spots.includes(s.kind);
}

/** Spot indices of a kind, in index order. */
export function spotsOfKind(kind: GardenSpotKind): number[] {
  return GARDEN_SPOTS.flatMap((s, i) => (s.kind === kind ? [i] : []));
}

/** Free spots the element may go to, in its order of preference (its spot kinds, then index order). */
export function fittingSpots(element: GardenElement, free: readonly number[]): number[] {
  return element.spots.flatMap((kind) => spotsOfKind(kind).filter((i) => free.includes(i)));
}

/**
 * Auto-placement: the first free spot of a fitting kind – a fountain only ever lands on a water spot, a tree in the
 * grove, a bird in the sky. `null` when no fitting spot is free (never "anywhere").
 */
export function nextSpotFor(element: GardenElement, free: readonly number[]): number | null {
  return fittingSpots(element, free)[0] ?? null;
}

/** Width cap of a spot relative to the scene width, so neighbouring elements never overlap. */
export function maxWidthFraction(spot: number): number {
  return GARDEN_SPOTS[spot]?.maxW ?? 0.12;
}
