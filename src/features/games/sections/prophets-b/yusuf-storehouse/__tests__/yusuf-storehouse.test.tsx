import { hasArt } from '@/core/art';
import { getGame, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';
import yusuf from '@/features/stories/content/prophets/yusuf.json';

import { YUSUF_FACTS } from '../facts';
import {
  checkYear,
  emptyStore,
  GOOD_YEARS,
  HARD_YEARS,
  hardYear,
  harvestItems,
  LEVEL_1,
  LEVEL_2,
  LEVEL_3,
  maxStorable,
  type Placements,
  simulateHardYears,
  type Store,
  type StorehouseConfig,
  storehouseResult,
  storeYear,
  targetFor,
  totalNeed,
} from '../logic';
import { registerYusufStorehouseGame, YUSUF_ART, YUSUF_GAME_ID, yusufGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerYusufStorehouseGame();
jest.setTimeout(90000);
/** Plays all good years with a strategy (which items to eat) and returns the storehouse. */
function plan(config: StorehouseConfig, eat: (year: number, items: ReturnType<typeof harvestItems>) => string[]): Store {
  let store = emptyStore;
  for (let year = 0; year < GOOD_YEARS; year++) {
    const items = harvestItems(year, config.harvests[year]);
    const eaten = new Set(eat(year, items));
    const placements: Placements = Object.fromEntries(items.map((i) => [i.id, eaten.has(i.id) ? 'eat' : 'store']));
    expect(checkYear(items, placements, config.minEat).ready).toBe(true);
    store = storeYear(store, items, placements);
  }
  return store;
}

const eatOne = (_: number, items: ReturnType<typeof harvestItems>) => [items[items.length - 1].id];

describe("Yusuf's Storehouse – rules", () => {
  it('has seven good and seven hard years on every level, and every level can be covered', () => {
    for (const config of [LEVEL_1, LEVEL_2, LEVEL_3]) {
      expect(config.harvests).toHaveLength(GOOD_YEARS);
      expect(config.needs).toHaveLength(HARD_YEARS);
      expect(maxStorable(config)).toBeGreaterThanOrEqual(totalNeed(config));
    }
    // Level 1: store 2, eat 1 every year covers exactly 14.
    expect(totalNeed(LEVEL_1)).toBe(14);
    expect(maxStorable(LEVEL_1)).toBe(14);
    expect(targetFor(LEVEL_1, 3)).toEqual({ store: 2, eat: 1 });
  });

  it('checks a year: everything placed and a little kept to eat', () => {
    const items = harvestItems(0, { ears: 0, loose: 3 });
    expect(checkYear(items, {}, 1)).toMatchObject({ placed: 0, ready: false, needsFood: false });
    const allStored = Object.fromEntries(items.map((i) => [i.id, 'store'])) as Placements;
    expect(checkYear(items, allStored, 1)).toMatchObject({ stored: 3, ready: false, needsFood: true });
    const good = { ...allStored, [items[0].id]: 'eat' } as Placements;
    expect(checkYear(items, good, 1)).toMatchObject({ eaten: 1, stored: 2, ready: true, needsFood: false });
    expect(storeYear({ ears: 1, loose: 1 }, items, good)).toEqual({ ears: 1, loose: 3 });
  });

  it('covers every hard year when all but a little is stored', () => {
    for (const config of [LEVEL_1, LEVEL_2]) {
      const outcome = simulateHardYears(plan(config, eatOne), config);
      expect(outcome).toMatchObject({ covered: HARD_YEARS, allCovered: true, spoiled: 0 });
    }
  });

  it('runs short – gently – when too much was eaten', () => {
    const store = plan(LEVEL_1, (_, items) => items.slice(0, 2).map((i) => i.id)); // eat 2, store 1 → 7 sacks
    expect(store).toEqual({ ears: 0, loose: 7 });
    const outcome = simulateHardYears(store, LEVEL_1);
    expect(outcome.allCovered).toBe(false);
    expect(outcome.covered).toBe(3);
    expect(outcome.years[3]).toMatchObject({ need: 2, given: 1, covered: false });
    expect(outcome.years).toHaveLength(4);
  });

  it('L3: grain in its ears keeps, loose grain spoils a little (12:47 rule card)', () => {
    // Eat the loose sack, store the two sheaves: 14 in the ear, nothing spoils.
    const wise = plan(LEVEL_3, (_, items) => items.filter((i) => i.form === 'loose').map((i) => i.id));
    expect(wise).toEqual({ ears: 14, loose: 0 });
    expect(simulateHardYears(wise, LEVEL_3)).toMatchObject({ allCovered: true, spoiled: 0 });

    // Store the loose sack and eat a sheaf: one loose sack spoils every hard year → short.
    const loose = plan(LEVEL_3, (_, items) => [items.find((i) => i.form === 'ears')!.id]);
    expect(loose).toEqual({ ears: 7, loose: 7 });
    const outcome = simulateHardYears(loose, LEVEL_3);
    expect(outcome.allCovered).toBe(false);
    expect(outcome.spoiled).toBeGreaterThan(0);

    // One hard year: spoil first, then loose grain before grain in the ear.
    expect(hardYear({ ears: 3, loose: 2 }, 0, 2, true)).toEqual({ year: 0, need: 2, spoiled: 1, given: 2, covered: true, after: { ears: 2, loose: 0 } });
    expect(hardYear({ ears: 3, loose: 2 }, 0, 2, false)).toMatchObject({ spoiled: 0, after: { ears: 3, loose: 0 } });
    expect(hardYear({ ears: 0, loose: 0 }, 5, 2, true)).toMatchObject({ given: 0, covered: false });
  });

  it('scores plans into stars and review facts', () => {
    expect(storehouseResult({ attempts: 1, spoiledEver: false, planFactId: 'p', earsFactId: 'e' })).toEqual({
      score: 70,
      maxScore: 70,
      stars: 3,
      mistakes: 0,
      factsMissed: [],
    });
    expect(storehouseResult({ attempts: 2, spoiledEver: false, planFactId: 'p' })).toMatchObject({ score: 55, stars: 2, factsMissed: ['p'] });
    expect(storehouseResult({ attempts: 2, spoiledEver: true, planFactId: 'p', earsFactId: 'e' })).toMatchObject({ factsMissed: ['p', 'e'] });
    expect(storehouseResult({ attempts: 9, spoiledEver: false, planFactId: 'p' })).toMatchObject({ score: 20, stars: 1, mistakes: 8 });
  });
});

describe("Yusuf's Storehouse – registration and facts", () => {
  it('registers a valid game, complete in en / de / bs', () => {
    const game = getGame(YUSUF_GAME_ID)!;
    expect(() => validateGame(game)).not.toThrow();
    expect(namespaceProblems(game)).toEqual([]);
    expect(yusufGame.levels.map((l) => [l.config.hints, l.config.spoilage])).toEqual([
      [true, false],
      [false, false],
      [false, true],
    ]);
  });

  it('cites exact references; the storehouse fact keeps the story wording', () => {
    const refs = Object.values(YUSUF_FACTS).map((f) => f.sources.map((s) => `${s.sourceName} ${s.sourceReference}`).join(', '));
    expect(refs).toEqual(['Quran 12:43–49', 'Quran 12:47–49', 'Quran 12:21, Quran 12:55', 'Quran 12:19–41', 'Quran 12:47, Ibn Kathir Tafsir, 12:47', 'Quran 12:48', 'Quran 12:49']);
    const content = JSON.stringify(yusuf);
    for (const lang of ['en', 'de', 'bs'] as const) expect(content.includes(YUSUF_FACTS.storehouses.text[lang])).toBe(true);
  });

  it('uses only art that exists (never people)', () => {
    for (const name of [...YUSUF_ART, yusufGame.coverArt, yusufGame.hintArt!]) expect({ name, ok: hasArt(name) }).toEqual({ name, ok: true });
    expect(YUSUF_ART.some((n) => n.startsWith('pose.') || n.startsWith('body.'))).toBe(false);
  });
});

describe("Yusuf's Storehouse – play", () => {
  it.each([1, 2, 3] as const)('level %s plays to completion with a good plan', async (level) => {
    const game = await renderGame(getGame(YUSUF_GAME_ID)!, level);
    const result = await playToEnd(game, { maxSteps: 600 });
    expect(result).toMatchObject({ stars: 3, factsMissed: [] });
    await game.unmount();
  });

  it('eating a whole harvest empties the storehouse; planning again still finishes', async () => {
    const game = await renderGame(getGame(YUSUF_GAME_ID)!, 1);
    const result = await playToEnd(game, { mistakes: 1, maxSteps: 900 });
    expect(result.stars).toBe(2);
    expect(result.factsMissed).toEqual([YUSUF_FACTS.plan.id]);
    await game.unmount();
  });
});
