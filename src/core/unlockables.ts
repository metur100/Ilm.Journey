import { elementsUnlockedAtLevel, type GardenElement } from './garden/elements';
import type { HeroPattern, LanternStyle } from './models';

/**
 * Level unlockables (v2): hero items (outfit and headwear colours, scarf and backpack patterns, lantern styles) and
 * garden elements (see `GARDEN_ELEMENTS.minLevel`). Rewards come only from learning – XP → levels. Items that are
 * not in this table (the v1 wardrobe) are always free; nothing a learner already wears is ever taken away.
 */
export type HeroItem =
  | { kind: 'outfitColor'; index: number }
  | { kind: 'headwearColor'; index: number }
  | { kind: 'scarfPattern'; id: HeroPattern }
  | { kind: 'backpackPattern'; id: HeroPattern }
  | { kind: 'lanternStyle'; id: LanternStyle };

/** Outfit colours 0–5 and headwear colour 0 are free; everything below unlocks at its level. */
export const HERO_UNLOCKS: readonly { level: number; item: HeroItem }[] = [
  { level: 2, item: { kind: 'outfitColor', index: 6 } },
  { level: 2, item: { kind: 'scarfPattern', id: 'stripes' } },
  { level: 3, item: { kind: 'headwearColor', index: 1 } },
  { level: 3, item: { kind: 'backpackPattern', id: 'stripes' } },
  { level: 4, item: { kind: 'outfitColor', index: 7 } },
  { level: 4, item: { kind: 'lanternStyle', id: 'star' } },
  { level: 5, item: { kind: 'scarfPattern', id: 'stars' } },
  { level: 5, item: { kind: 'headwearColor', index: 2 } },
  { level: 6, item: { kind: 'outfitColor', index: 8 } },
  { level: 6, item: { kind: 'backpackPattern', id: 'stars' } },
  { level: 7, item: { kind: 'headwearColor', index: 3 } },
  { level: 7, item: { kind: 'scarfPattern', id: 'geometric' } },
  { level: 8, item: { kind: 'outfitColor', index: 9 } },
  { level: 8, item: { kind: 'lanternStyle', id: 'crescent' } },
  { level: 9, item: { kind: 'backpackPattern', id: 'geometric' } },
  { level: 9, item: { kind: 'headwearColor', index: 4 } },
  { level: 10, item: { kind: 'outfitColor', index: 10 } },
  { level: 12, item: { kind: 'outfitColor', index: 11 } },
  { level: 12, item: { kind: 'headwearColor', index: 5 } },
];

const sameItem = (a: HeroItem, b: HeroItem): boolean =>
  a.kind === b.kind && ('index' in a ? a.index === (b as typeof a).index : a.id === (b as typeof a).id);

/** Level needed for a hero item (1 = always available). */
export function requiredLevel(item: HeroItem): number {
  return HERO_UNLOCKS.find((u) => sameItem(u.item, item))?.level ?? 1;
}

export function isHeroItemUnlocked(item: HeroItem, level: number): boolean {
  return level >= requiredLevel(item);
}

export interface LevelUnlocks {
  hero: HeroItem[];
  garden: GardenElement[];
}

/** Everything that becomes available exactly at `level`. */
export function unlocksAtLevel(level: number): LevelUnlocks {
  return { hero: HERO_UNLOCKS.filter((u) => u.level === level).map((u) => u.item), garden: elementsUnlockedAtLevel(level) };
}

/** Everything unlocked by going from level `from` to level `to` (both exclusive/inclusive: from+1 … to). */
export function unlocksBetween(from: number, to: number): LevelUnlocks {
  const result: LevelUnlocks = { hero: [], garden: [] };
  for (let level = Math.max(2, from + 1); level <= to; level++) {
    const u = unlocksAtLevel(level);
    result.hero.push(...u.hero);
    result.garden.push(...u.garden);
  }
  return result;
}
