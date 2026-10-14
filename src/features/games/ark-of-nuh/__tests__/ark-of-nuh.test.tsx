import type React from 'react';

import { hasArt } from '@/core/art';
import { type GameApi, type GameResultInput, getGame, validateGame } from '@/core/games';
import { translateNs } from '@/core/i18n';
import { registerYusufStorehouseGame } from '@/features/games/yusuf-storehouse/register';
import { hashString, seededRandom } from '@/core/utils/random';
import nuh from '@/features/stories/content/prophets/nuh.json';

import { type ArkConfig, ArkOfNuhGame } from '../ArkOfNuhGame';
import { sceneGeometry } from '../ArkScene';
import { ARK_FACTS } from '../facts';
import { arkI18n } from '../i18n';
import {
  ANIMAL_KINDS,
  arkFill,
  arkResult,
  bringToGate,
  emptyGate,
  flipCard,
  initialMemory,
  isFaceUp,
  leaveGate,
  LOOK_ALIKE,
  makeDeck,
  makeMeadow,
  memoryDone,
  pickKinds,
  rainDrops,
  stormLevel,
} from '../logic';
import { ARK_ART, ARK_GAME_ID, arkGame, registerArkOfNuhGame } from '../register';

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

const random = (seed: string) => seededRandom(hashString(seed));

describe('Ark of Nuh – rules', () => {
  it('picks distinct kinds; the sorting twist uses look-alike couples', () => {
    const { memory, sort } = pickKinds(4, 4, random('a'));
    expect(new Set([...memory, ...sort]).size).toBe(8);
    expect(memory.some((k) => sort.includes(k))).toBe(false);
    const couples = LOOK_ALIKE.map((c) => [...c].sort().join('+'));
    expect(couples).toContain([sort[0], sort[1]].sort().join('+'));
    expect(couples).toContain([sort[2], sort[3]].sort().join('+'));
    // Every kind is a real, different animal of the art library.
    for (const kind of ANIMAL_KINDS) expect(hasArt(`animal.${kind}`)).toBe(true);
  });

  it('deals exactly two cards of every kind', () => {
    const deck = makeDeck(['camel', 'sheep', 'lion', 'bee'], random('deck'));
    expect(deck).toHaveLength(8);
    expect(deck.map((c) => c.index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    for (const kind of ['camel', 'sheep', 'lion', 'bee']) expect(deck.filter((c) => c.kind === kind)).toHaveLength(2);
  });

  it('matches pairs, counts mismatches and turns a wrong pair back', () => {
    const cards = [
      { index: 0, kind: 'camel' as const },
      { index: 1, kind: 'lion' as const },
      { index: 2, kind: 'camel' as const },
      { index: 3, kind: 'lion' as const },
    ];
    let s = initialMemory(cards);
    let r = flipCard(s, 0);
    expect(r.event).toBe('flip');
    r = flipCard(r.state, 1);
    expect(r.event).toBe('mismatch');
    expect(r.state.mismatches).toBe(1);
    expect(isFaceUp(r.state, 1)).toBe(true);
    // A third card turns the wrong pair back first.
    r = flipCard(r.state, 2);
    expect(r.event).toBe('flip');
    expect(r.state.open).toEqual([2]);
    r = flipCard(r.state, 0);
    expect(r.event).toBe('match');
    expect(r.state.found).toEqual(['camel']);
    // Matched and open cards are ignored.
    expect(flipCard(r.state, 0).event).toBe('ignored');
    s = flipCard(r.state, 1).state;
    expect(flipCard(s, 1).event).toBe('ignored');
    s = flipCard(s, 3).state;
    expect(memoryDone(s)).toBe(true);
    expect(s.mismatches).toBe(1);
  });

  it('lets only two of the same kind through the ark gate', () => {
    const meadow = makeMeadow(['horse', 'donkey'], random('m'));
    expect(meadow).toHaveLength(4);
    const horse = meadow.filter((a) => a.kind === 'horse');
    const donkey = meadow.find((a) => a.kind === 'donkey')!;
    let r = bringToGate(emptyGate, horse[0]);
    expect(r.event).toBe('waiting');
    r = bringToGate(r.gate, donkey);
    expect(r.event).toBe('wrong');
    expect(r.gate.wrongDrops).toBe(1);
    expect(r.gate.waiting).toEqual(horse[0]);
    r = bringToGate(r.gate, horse[1]);
    expect(r.event).toBe('pair');
    expect(r.gate).toEqual({ waiting: null, boarded: ['horse'], wrongDrops: 1 });
    expect(leaveGate(bringToGate(r.gate, donkey).gate).waiting).toBeNull();
  });

  it('fills the ark and calms the sky when it is full', () => {
    expect(arkFill(0, 4)).toBe(0);
    expect(arkFill(2, 4)).toBe(0.5);
    expect(arkFill(9, 4)).toBe(1);
    expect(stormLevel(0, 4)).toBeLessThan(stormLevel(2, 4));
    expect(stormLevel(3, 4)).toBeGreaterThan(stormLevel(2, 4));
    expect(stormLevel(4, 4)).toBe(0);
    expect(rainDrops(stormLevel(4, 4))).toBe(0);
    expect(rainDrops(1)).toBe(24);
    const g = sceneGeometry(360);
    expect(g.door.x).toBeGreaterThan(g.rampFoot.x);
    expect(g.door.y).toBeLessThan(g.rampFoot.y);
  });

  it('scores memory and the gate into stars', () => {
    const base = { pairs: 4, sortPairs: 0, wrongDrops: 0, kindFactId: 'each-kind-two' };
    expect(arkResult({ ...base, mismatches: 4 })).toEqual({ score: 40, maxScore: 40, stars: 3, mistakes: 0, factsMissed: [] });
    expect(arkResult({ ...base, mismatches: 6 })).toMatchObject({ score: 36, stars: 2, mistakes: 2 });
    expect(arkResult({ ...base, mismatches: 20 })).toMatchObject({ score: 16, stars: 1, mistakes: 16 });
    expect(arkResult({ ...base, sortPairs: 4, mismatches: 2, wrongDrops: 1 })).toMatchObject({ stars: 2, factsMissed: [] });
    expect(arkResult({ ...base, sortPairs: 4, mismatches: 2, wrongDrops: 2 }).factsMissed).toEqual(['each-kind-two']);
  });
});

describe('Ark of Nuh – registration and facts', () => {
  const game = getGame(ARK_GAME_ID)!;

  it('registers a valid game with 3 levels (4, 6, 4+4 pairs)', () => {
    expect(game).toBeDefined();
    expect(() => validateGame(game)).not.toThrow();
    expect(arkGame.levels.map((l) => l.config)).toEqual([
      { pairs: 4, sortPairs: 0 },
      { pairs: 6, sortPairs: 0 },
      { pairs: 4, sortPairs: 4 },
    ]);
  });

  it('cites exact Quran references and copies the texts of the Nuh story', () => {
    const story = JSON.stringify(nuh);
    const refs = Object.values(ARK_FACTS).flatMap((f) => f.sources.map((s) => `${s.sourceName} ${s.sourceReference}`));
    expect(refs).toEqual(['Quran 11:40', 'Quran 11:37', 'Quran 29:14', 'Quran 11:37–38', 'Quran 11:44', 'Quran 29:14']);
    for (const fact of Object.values(ARK_FACTS)) {
      for (const s of fact.sources) expect(s.sourceReference).toMatch(/^\d+:\d+(–\d+)?$/);
      for (const lang of ['en', 'de', 'bs'] as const) {
        // Every sentence of the fact appears in the story content.
        for (const sentence of fact.text[lang].split(/(?<=\.) /)) expect({ id: fact.id, lang, found: story.includes(sentence) }).toEqual({ id: fact.id, lang, found: true });
      }
      if ('reviewKey' in fact) expect(fact.reviewKey).toMatch(/^stories:nuh-/);
    }
  });

  it('uses only art that exists and names every animal in every language', () => {
    for (const name of [...ARK_ART, arkGame.coverArt, arkGame.hintArt!]) expect({ name, ok: hasArt(name) }).toEqual({ name, ok: true });
    for (const lang of ['en', 'de', 'bs'] as const) {
      for (const kind of ANIMAL_KINDS) expect(translateNs(arkI18n, lang, `animal.${kind}`)).not.toBe(`animal.${kind}`);
    }
  });

  it('never depicts people – no pose/body art', () => {
    expect(ARK_ART.some((n) => n.startsWith('pose.') || n.startsWith('body.'))).toBe(false);
  });
});

// ---------- render smoke tests ----------

function api(level: 1 | 2 | 3, onComplete: (r: GameResultInput) => void): GameApi<ArkConfig> {
  const def = arkGame.levels[level - 1];
  return {
    gameId: ARK_GAME_ID,
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
    t: (key, params) => translateNs(arkI18n, 'en', key as 'title', params),
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

async function layout(root: ReactTestInstance) {
  const node = root.findAll((n) => typeof n.props.onLayout === 'function')[0];
  await act(async () => node.props.onLayout({ nativeEvent: { layout: { width: 360, height: 200 } } }));
}

async function playLevel(level: 1 | 2 | 3, wrongFirst = false) {
  const NOW = 1_700_000_000_000;
  const spy = jest.spyOn(Date, 'now').mockReturnValue(NOW);
  const config = arkGame.levels[level - 1].config;
  const r = random(`${ARK_GAME_ID}:${level}:${NOW}`);
  const kinds = pickKinds(config.pairs, config.sortPairs, r);
  const deck = makeDeck(kinds.memory, r);
  const results: GameResultInput[] = [];
  let tree!: ReactTestRenderer;
  await act(async () => {
    tree = create(<ArkOfNuhGame {...api(level, (res) => results.push(res))} />);
  });
  spy.mockRestore();
  const root = tree.root;
  await layout(root);
  expect(byLabel(root, /^Card \d+, face down$/)).toHaveLength(config.pairs * 2);

  for (const kind of kinds.memory) {
    const [a, b] = deck.filter((c) => c.kind === kind);
    await press(root, `Card ${a.index + 1}, face down`);
    await press(root, `Card ${b.index + 1}, face down`);
  }

  if (config.sortPairs > 0) {
    const name = (k: string) => translateNs(arkI18n, 'en', `animal.${k}` as 'title');
    const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
    if (wrongFirst) {
      await press(root, `${cap(name(kinds.sort[0]))} – bring to the gate`);
      // A look-alike of another kind is sent back gently; the waiting animal stays.
      await press(root, `${cap(name(kinds.sort[1]))} – bring to the gate`);
      expect(byLabel(root, `${cap(name(kinds.sort[1]))} – bring to the gate`)).toHaveLength(2);
      await press(root, `${cap(name(kinds.sort[0]))} at the gate – tap to send it back`);
    }
    for (const kind of kinds.sort) {
      await press(root, `${cap(name(kind))} – bring to the gate`);
      await press(root, `${cap(name(kind))} – bring to the gate`);
    }
  }

  await press(root, 'See what you learned');
  await act(async () => tree.unmount());
  return results;
}

describe('Ark of Nuh – play', () => {
  it.each([1, 2, 3] as const)('level %i can be played to the calm sky and reports a perfect result', async (level) => {
    const results = await playLevel(level);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ stars: 3, mistakes: 0, factsMissed: [] });
  });

  it('with motion: pairs walk up the ramp, a wrong pair turns back after a moment', async () => {
    jest.useFakeTimers();
    const NOW = 1_700_000_000_000;
    const spy = jest.spyOn(Date, 'now').mockReturnValue(NOW);
    const r = random(`${ARK_GAME_ID}:1:${NOW}`);
    const deck = makeDeck(pickKinds(4, 0, r).memory, r);
    const results: GameResultInput[] = [];
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = create(<ArkOfNuhGame {...api(1, (res) => results.push(res))} reducedMotion={false} />);
    });
    spy.mockRestore();
    const root = tree.root;
    await layout(root);
    const first = deck[0];
    const other = deck.find((c) => c.kind !== first.kind)!;
    await press(root, `Card ${first.index + 1}, face down`);
    await press(root, `Card ${other.index + 1}, face down`);
    expect(byLabel(root, /^Card \d+: /)).toHaveLength(2);
    await act(async () => {
      jest.advanceTimersByTime(1100);
    });
    expect(byLabel(root, /^Card \d+: /)).toHaveLength(0);

    for (const kind of new Set(deck.map((c) => c.kind))) {
      const [a, b] = deck.filter((c) => c.kind === kind);
      await press(root, `Card ${a.index + 1}, face down`);
      await press(root, `Card ${b.index + 1}, face down`);
    }
    // The last pair is still walking: no calm sky yet.
    expect(byLabel(root, 'See what you learned')).toHaveLength(0);
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    await press(root, 'See what you learned');
    expect(results[0]).toMatchObject({ stars: 3, score: 40, maxScore: 40 });
    await act(async () => tree.unmount());
    jest.useRealTimers();
  });

  it('level 3: a wrong animal at the gate is a gentle mistake', async () => {
    const results = await playLevel(3, true);
    expect(results[0]).toMatchObject({ stars: 2, mistakes: 1, factsMissed: [] });
  });
});

describe('Ark of Nuh – registry component', () => {
  it('renders the lazily loaded game from the registry', async () => {
    const Game = getGame(ARK_GAME_ID)!.component as React.ComponentType<GameApi<ArkConfig>>;
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = create(<Game {...api(2, jest.fn())} />);
    });
    await layout(tree.root);
    expect(byLabel(tree.root, /^Card \d+, face down$/)).toHaveLength(12);
    await act(async () => tree.unmount());
  });
});
