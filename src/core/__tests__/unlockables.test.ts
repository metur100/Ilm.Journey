import { HEADWEAR_COLORS, HERO_PATTERNS, OUTFIT_COLORS } from '@/core/components/character/Avatar';
import { GARDEN_ELEMENTS } from '@/core/garden';
import { createInitialData, DEFAULT_CHARACTER, sanitizeAppData } from '@/core/services/engine';
import { HERO_UNLOCKS, isHeroItemUnlocked, requiredLevel, unlocksAtLevel, unlocksBetween } from '@/core/unlockables';

describe('level unlockables', () => {
  it('keeps the v1 wardrobe free', () => {
    for (let i = 0; i < 6; i++) expect(requiredLevel({ kind: 'outfitColor', index: i })).toBe(1);
    expect(requiredLevel({ kind: 'headwearColor', index: 0 })).toBe(1);
    expect(requiredLevel({ kind: 'scarfPattern', id: 'plain' })).toBe(1);
    expect(requiredLevel({ kind: 'lanternStyle', id: 'classic' })).toBe(1);
  });

  it('locks new items until their level', () => {
    expect(isHeroItemUnlocked({ kind: 'outfitColor', index: 6 }, 1)).toBe(false);
    expect(isHeroItemUnlocked({ kind: 'outfitColor', index: 6 }, 2)).toBe(true);
    expect(isHeroItemUnlocked({ kind: 'lanternStyle', id: 'crescent' }, 7)).toBe(false);
    expect(isHeroItemUnlocked({ kind: 'lanternStyle', id: 'crescent' }, 8)).toBe(true);
  });

  it('only unlocks items that exist in the hero art', () => {
    for (const { item, level } of HERO_UNLOCKS) {
      expect(level).toBeGreaterThanOrEqual(2);
      if (item.kind === 'outfitColor') expect(item.index).toBeLessThan(OUTFIT_COLORS.length);
      if (item.kind === 'headwearColor') expect(item.index).toBeLessThan(HEADWEAR_COLORS.length);
      if (item.kind === 'scarfPattern' || item.kind === 'backpackPattern') expect(HERO_PATTERNS).toContain(item.id);
    }
    // every colour beyond the free ones has an unlock level
    for (let i = 6; i < OUTFIT_COLORS.length; i++) expect(requiredLevel({ kind: 'outfitColor', index: i })).toBeGreaterThan(1);
    for (let i = 1; i < HEADWEAR_COLORS.length; i++) expect(requiredLevel({ kind: 'headwearColor', index: i })).toBeGreaterThan(1);
  });

  it('lists hero items and garden elements per level (level-up celebration)', () => {
    const two = unlocksAtLevel(2);
    expect(two.hero).toContainEqual({ kind: 'outfitColor', index: 6 });
    expect(two.garden.map((e) => e.id)).toContain('palm');
    expect(unlocksAtLevel(1).hero).toEqual([]);
    const jump = unlocksBetween(1, 4);
    expect(jump.hero.length).toBe(unlocksAtLevel(2).hero.length + unlocksAtLevel(3).hero.length + unlocksAtLevel(4).hero.length);
    expect(jump.garden.length).toBe(GARDEN_ELEMENTS.filter((e) => e.minLevel >= 2 && e.minLevel <= 4).length);
    expect(unlocksBetween(5, 5)).toEqual({ hero: [], garden: [] });
  });

  it('gives older saves the new character defaults', () => {
    const stored = createInitialData('en');
    const legacy = JSON.parse(JSON.stringify(stored));
    for (const key of ['headwearColor', 'scarfPattern', 'backpackPattern', 'lanternStyle']) delete legacy.profile.character[key];
    const repaired = sanitizeAppData(legacy)!;
    expect(repaired.profile.character).toMatchObject({
      headwearColor: DEFAULT_CHARACTER.headwearColor,
      scarfPattern: 'plain',
      backpackPattern: 'plain',
      lanternStyle: 'classic',
    });
  });
});
