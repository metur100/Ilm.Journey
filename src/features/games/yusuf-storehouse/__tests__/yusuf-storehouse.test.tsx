import type React from 'react';

import { hasArt } from '@/core/art';
import { type GameApi, type GameResultInput, getGame, validateGame } from '@/core/games';
import { translateNs } from '@/core/i18n';
import { registerArkOfNuhGame } from '@/features/games/ark-of-nuh/register';
import unit from '@/features/learn/content/prophets/prophets-yusuf-yunus-isa.json';
import yusuf from '@/features/stories/content/prophets/yusuf.json';

import { YUSUF_FACTS } from '../facts';
import { yusufI18n } from '../i18n';
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
import { YusufStorehouseGame } from '../YusufStorehouseGame';

// Reanimated 4 needs the worklets runtime – use its official mock in tests.
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

// Only these games (not registerFeatures()): other games' modules must not affect these tests.
registerArkOfNuhGame();
registerYusufStorehouseGame();

/** Minimal local typing of react-test-renderer (the package ships no types here). */
interface ReactTestInstance {
  props: Record<string, any>;
  findAll: (predicate: (node: ReactTestInstance) => boolean) => ReactTestInstance[];
}
interface ReactTestRenderer {
  root: ReactTestInstance;
  unmount: () => void;
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act, create } = require('react-test-renderer') as {
  act: (callback: () => Promise<unknown> | void) => Promise<void>;
  create: (element: React.ReactElement) => ReactTestRenderer;
};

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
  it('registers a valid game', () => {
    const game = getGame(YUSUF_GAME_ID)!;
    expect(game).toBeDefined();
    expect(() => validateGame(game)).not.toThrow();
    expect(yusufGame.levels.map((l) => [l.config.hints, l.config.spoilage])).toEqual([
      [true, false],
      [false, false],
      [false, true],
    ]);
  });

  it('cites exact Quran references; story facts are copied from the content', () => {
    const content = JSON.stringify(yusuf) + JSON.stringify(unit);
    const refs = Object.values(YUSUF_FACTS).map((f) => f.sources.map((s) => `${s.sourceName} ${s.sourceReference}`).join(', '));
    expect(refs).toEqual(['Quran 12:43–49', 'Quran 12:47–49', 'Quran 12:21, Quran 12:55', 'Quran 12:19–41', 'Quran 12:47', 'Quran 12:48', 'Quran 12:49']);
    for (const fact of Object.values(YUSUF_FACTS)) for (const s of fact.sources) expect(s.sourceReference).toMatch(/^12:\d+(–\d+)?$/);
    for (const fact of [YUSUF_FACTS.dream, YUSUF_FACTS.plan, YUSUF_FACTS.storehouses, YUSUF_FACTS.honest]) {
      for (const lang of ['en', 'de', 'bs'] as const) expect({ id: fact.id, lang, found: content.includes(fact.text[lang]) }).toEqual({ id: fact.id, lang, found: true });
    }
  });

  it('uses only art that exists and has complete texts', () => {
    for (const name of [...YUSUF_ART, yusufGame.coverArt, yusufGame.hintArt!]) expect({ name, ok: hasArt(name) }).toEqual({ name, ok: true });
    expect(YUSUF_ART.some((n) => n.startsWith('pose.') || n.startsWith('body.'))).toBe(false);
    for (const lang of ['de', 'bs'] as const) expect(Object.keys(yusufI18n.dictionaries[lang]).sort()).toEqual(Object.keys(yusufI18n.dictionaries.en).sort());
  });
});

// ---------- render smoke tests ----------

function api(level: 1 | 2 | 3, onComplete: (r: GameResultInput) => void): GameApi<StorehouseConfig> {
  const def = yusufGame.levels[level - 1];
  return {
    gameId: YUSUF_GAME_ID,
    level,
    config: def.config,
    facts: def.facts,
    onComplete,
    onExit: jest.fn(),
    playSound: jest.fn(),
    haptic: jest.fn(),
    reducedMotion: true,
    challengeMode: false,
    language: 'en',
    t: (key, params) => translateNs(yusufI18n, 'en', key as 'title', params),
    l: (text) => text?.en ?? '',
  };
}

const byLabel = (root: ReactTestInstance, label: string | RegExp) =>
  root.findAll(
    (n) =>
      typeof n.props.onPress === 'function' &&
      (typeof label === 'string' ? n.props.accessibilityLabel === label : label.test(String(n.props.accessibilityLabel ?? ''))),
  );

async function press(root: ReactTestInstance, label: string | RegExp) {
  const node = byLabel(root, label)[0];
  if (!node) throw new Error(`control not found: ${label}`);
  await act(async () => node.props.onPress());
}

const texts = (root: ReactTestInstance) =>
  root
    .findAll((n) => typeof n.props.children === 'string')
    .map((n) => n.props.children as string)
    .join(' | ');

async function render(level: 1 | 2 | 3) {
  const results: GameResultInput[] = [];
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = create(<YusufStorehouseGame {...api(level, (r) => results.push(r))} />);
  });
  const root = tree.root;
  const layout = root.findAll((n) => typeof n.props.onLayout === 'function')[0];
  await act(async () => layout.props.onLayout({ nativeEvent: { layout: { width: 360, height: 150 } } }));
  return { tree, root, results };
}

/** Taps the basket `eat` times and the storehouse for the rest, then "Next year" – for all seven good years. */
async function goodYears(root: ReactTestInstance, config: StorehouseConfig, eat: (year: number) => number, from = 0) {
  for (let year = from; year < GOOD_YEARS; year++) {
    const size = config.harvests[year].ears + config.harvests[year].loose;
    for (let i = 0; i < eat(year); i++) await press(root, /^Basket/);
    for (let i = eat(year); i < size; i++) await press(root, /^Storehouse/);
    await press(root, 'Next year');
  }
}

async function hardYears(root: ReactTestInstance, count = HARD_YEARS) {
  for (let i = 0; i < count; i++) await press(root, 'Share out the grain');
}

describe("Yusuf's Storehouse – play", () => {
  it('level 1: the hint plan covers every hard year → year of relief, 3 stars', async () => {
    const { tree, root, results } = await render(1);
    expect(texts(root)).toContain('Plan: store 2, eat 1');
    expect(texts(root)).toContain('The hard years will need 14 sacks.');
    // Storing everything is not allowed: keep a little to eat.
    for (let i = 0; i < 3; i++) await press(root, /^Storehouse/);
    expect(texts(root)).toContain('Keep a little to eat this year');
    await press(root, /^Grain sack in the storehouse/);
    await press(root, /^Basket/);
    await press(root, 'Next year');
    await goodYears(root, LEVEL_1, () => 1, 1);
    await hardYears(root, HARD_YEARS);
    expect(texts(root)).toContain('Every hard year was covered');
    await press(root, 'See what you learned');
    expect(results).toEqual([{ score: 70, maxScore: 70, stars: 3, mistakes: 0, factsMissed: [] }]);
    await act(async () => tree.unmount());
  });

  it('level 2: eating too much empties the storehouse; planning again still finishes', async () => {
    const { tree, root, results } = await render(2);
    expect(texts(root)).not.toContain('Plan:');
    await goodYears(root, LEVEL_2, () => 2);
    await hardYears(root, 5); // 10 sacks stored: years 1–4 need 2+3+2+3, year 5 finds the storehouse empty
    expect(texts(root)).toContain('The storehouse is empty');
    await press(root, 'Plan again');
    await goodYears(root, LEVEL_2, () => 1);
    await hardYears(root);
    await press(root, 'See what you learned');
    expect(results[0]).toMatchObject({ stars: 2, mistakes: 1, factsMissed: [YUSUF_FACTS.plan.id] });
    await act(async () => tree.unmount());
  });

  it('level 3: the rule card, then eating the loose grain and storing the ears covers all years', async () => {
    const { tree, root, results } = await render(3);
    expect(texts(root)).toContain('Leave it in its ears (Quran 12:47)');
    await press(root, 'Understood');
    for (let year = 0; year < GOOD_YEARS; year++) {
      await press(root, /^Loose grain – drag/); // select the loose sack …
      await press(root, /^Basket/); // … and eat it
      await press(root, /^Storehouse/);
      await press(root, /^Storehouse/);
      await press(root, 'Next year');
    }
    expect(texts(root)).toContain('In the storehouse: 14 in the ear · 0 loose');
    await hardYears(root);
    await press(root, 'See what you learned');
    expect(results[0]).toMatchObject({ stars: 3, factsMissed: [] });
    await act(async () => tree.unmount());
  });
});

describe("Yusuf's Storehouse – registry component", () => {
  it('renders the lazily loaded game from the registry', async () => {
    const Game = getGame(YUSUF_GAME_ID)!.component as React.ComponentType<GameApi<StorehouseConfig>>;
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = create(<Game {...api(1, jest.fn())} />);
    });
    expect(byLabel(tree.root, /^Grain sack – drag/)).toHaveLength(3);
    await act(async () => tree.unmount());
  });
});
