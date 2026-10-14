import type React from 'react';

import { HIJAZ_POINTS, hasArt } from '@/core/art';
import { type GameApi, type GameResultInput, getGame, validateGame } from '@/core/games';
import { translateNs } from '@/core/i18n';
import { getQuestionByKey } from '@/core/registry';
import { registerSeerahFeature } from '@/features/seerah/register';
import { EVENTS, getSource, PLACES, QUESTIONS, ROUTES, EPISODES } from '@/features/seerah/content';
import { sourceShortLabel } from '@/features/seerah/services/sources';

import { CHECKPOINTS, HIJRAH_ART, ROUTE_HIJRAH, type SeerahBlock, SOURCE_REFS, type SeerahSourceId } from '../content';
import { type HijrahConfig, HijrahPathGame } from '../HijrahPathGame';
import {
  accuracy,
  CHECKPOINT_ARCS,
  firstEmptySlot,
  HIJRAH_ROUTE,
  hijrahResult,
  INITIAL_TRACE,
  isRightSlot,
  jumpToNext,
  orderScore,
  pointAt,
  projectOnRoute,
  shuffledCards,
  starsFor,
  traceScore,
  type TraceState,
  traceStep,
} from '../logic';
import { HIJRAH_FACTS, HIJRAH_GAME_ID, hijrahGame, registerHijrahPathGame } from '../register';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

// Only what these tests need (independent of the other games in progress).
registerSeerahFeature();
registerHijrahPathGame();

const OPTS = { tolerance: 16, maxJump: 30 };

/** Samples along the route every `step` map units, shifted sideways by `offset`. */
function samples(step: number, offset = 0) {
  const out: { x: number; y: number }[] = [];
  for (let s = 0; s <= HIJRAH_ROUTE.length + 0.001; s += step) {
    const p = pointAt(HIJRAH_ROUTE, s);
    out.push({ x: p.x + offset, y: p.y });
  }
  return out;
}

function traceAll(points: { x: number; y: number }[], opts = OPTS): TraceState {
  let state = INITIAL_TRACE;
  for (const p of points) {
    // Repeat each sample until no new checkpoint is reached (the game shows a card in between).
    for (let k = 0; k < 6; k++) {
      const next = traceStep(HIJRAH_ROUTE, CHECKPOINT_ARCS, state, p, opts);
      const moved = next.reached !== state.reached;
      state = next;
      if (!moved) break;
    }
  }
  return state;
}

describe('Hijrah Path – route and tracing', () => {
  it('projects the Seerah route onto the Hijaz map (Makkah, Thawr, Quba, Madinah)', () => {
    const near = (a: { x: number; y: number }, b: { x: number; y: number }) => expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeLessThan(0.5);
    near(HIJRAH_ROUTE.points[0], HIJAZ_POINTS.makkah);
    near(HIJRAH_ROUTE.points[1], HIJAZ_POINTS.thawr);
    near(HIJRAH_ROUTE.points[6], HIJAZ_POINTS.quba);
    near(HIJRAH_ROUTE.points[7], HIJAZ_POINTS.madinah);
    // The route equals routes.json "route-hijrah".
    expect(ROUTE_HIJRAH).toEqual(ROUTES.find((r) => r.id === 'route-hijrah')!.points);
  });

  it('places the checkpoints in order along the route', () => {
    expect(CHECKPOINT_ARCS).toHaveLength(5);
    for (let i = 1; i < CHECKPOINT_ARCS.length; i++) expect(CHECKPOINT_ARCS[i]).toBeGreaterThan(CHECKPOINT_ARCS[i - 1]);
    expect(CHECKPOINT_ARCS[4]).toBeCloseTo(HIJRAH_ROUTE.length);
  });

  it('measures the distance to the path', () => {
    const p = pointAt(HIJRAH_ROUTE, 100);
    expect(projectOnRoute(HIJRAH_ROUTE, p).d).toBeCloseTo(0);
    expect(projectOnRoute(HIJRAH_ROUTE, p).s).toBeCloseTo(100, 0);
    expect(projectOnRoute(HIJRAH_ROUTE, { x: p.x + 40, y: p.y }).d).toBeGreaterThan(20);
  });

  it('reaches every checkpoint in order when the finger follows the route', () => {
    const state = traceAll(samples(3));
    expect(state.reached).toBe(5);
    expect(state.offSamples).toBe(0);
    expect(accuracy(state)).toBe(1);
    expect(traceScore(state, 5)).toEqual({ score: 50, maxScore: 50 });
  });

  it('stays inside the tolerance a little beside the path, but not far away', () => {
    expect(traceAll(samples(3, 10)).reached).toBe(5);
    const far = traceAll(samples(3, 40));
    expect(far.reached).toBe(0);
    expect(far.onSamples).toBe(0);
    expect(far.offEpisodes).toBe(1);
  });

  it('reveals close checkpoints one at a time (Makkah, then Thawr)', () => {
    const start = HIJRAH_ROUTE.points[0];
    const a = traceStep(HIJRAH_ROUTE, CHECKPOINT_ARCS, INITIAL_TRACE, start, OPTS);
    expect(a.reached).toBe(1);
    const b = traceStep(HIJRAH_ROUTE, CHECKPOINT_ARCS, a, HIJRAH_ROUTE.points[1], OPTS);
    expect(b.reached).toBe(2);
  });

  it('does not jump ahead when the finger touches the route far away', () => {
    const state = traceStep(HIJRAH_ROUTE, CHECKPOINT_ARCS, { ...INITIAL_TRACE, reached: 2, progress: CHECKPOINT_ARCS[1] }, HIJRAH_ROUTE.points[6], OPTS);
    expect(state.reached).toBe(2);
    expect(state.ahead).toBe(true);
  });

  it('counts each excursion off the path once', () => {
    let state = traceAll(samples(3).slice(0, 10));
    const off = { x: 0, y: 0 };
    state = traceStep(HIJRAH_ROUTE, CHECKPOINT_ARCS, state, off, OPTS);
    state = traceStep(HIJRAH_ROUTE, CHECKPOINT_ARCS, state, off, OPTS);
    expect(state.offEpisodes).toBe(1);
    state = traceStep(HIJRAH_ROUTE, CHECKPOINT_ARCS, state, pointAt(HIJRAH_ROUTE, state.progress), OPTS);
    state = traceStep(HIJRAH_ROUTE, CHECKPOINT_ARCS, state, off, OPTS);
    expect(state.offEpisodes).toBe(2);
  });

  it('offers a tap alternative that moves to the next checkpoint', () => {
    let state = INITIAL_TRACE;
    for (let i = 0; i < 7; i++) state = jumpToNext(CHECKPOINT_ARCS, state);
    expect(state.reached).toBe(5);
    expect(accuracy(state)).toBe(1);
  });
});

describe('Hijrah Path – ordering and scoring', () => {
  const order = CHECKPOINTS.map((c) => c.id);

  it('orders the event cards in time', () => {
    expect(order).toEqual(['depart', 'cave', 'guide', 'quba', 'madinah']);
    expect(isRightSlot(order, 0, 'depart')).toBe(true);
    expect(isRightSlot(order, 1, 'quba')).toBe(false);
    expect(firstEmptySlot(['depart', null, null])).toBe(1);
    expect(firstEmptySlot(['depart'])).toBe(-1);
  });

  it('shuffles the cards deterministically and never already sorted', () => {
    const a = shuffledCards('hijrah-path:3');
    expect(a).toEqual(shuffledCards('hijrah-path:3'));
    expect(a).not.toEqual(order);
    expect([...a].sort()).toEqual([...order].sort());
  });

  it('maps scores to stars', () => {
    expect(starsFor(50, 50)).toBe(3);
    expect(starsFor(43, 50)).toBe(3);
    expect(starsFor(40, 50)).toBe(2);
    expect(starsFor(20, 50)).toBe(1);
    expect(orderScore(5, 0)).toEqual({ score: 50, maxScore: 50 });
    expect(orderScore(5, 2)).toEqual({ score: 40, maxScore: 50 });
  });

  it('builds the result: perfect tracing, ordering mistakes become a review fact', () => {
    const perfect = traceAll(samples(3));
    expect(hijrahResult({ trace: perfect })).toEqual({ score: 50, maxScore: 50, stars: 3, mistakes: 0, factsMissed: [] });
    const l3 = hijrahResult({ trace: perfect, ordering: { mistakes: 2, cardsWithMistakes: 1 } });
    expect(l3).toEqual({ score: 95, maxScore: 100, stars: 3, mistakes: 2, factsMissed: ['hijrah-order'] });
    const wobbly: TraceState = { ...perfect, onSamples: 20, offSamples: 20, offEpisodes: 4 };
    expect(hijrahResult({ trace: wobbly }).stars).toBe(2);
    const lost: TraceState = { ...perfect, onSamples: 0, offSamples: 30, offEpisodes: 4 };
    expect(hijrahResult({ trace: lost }).stars).toBe(1);
  });
});

describe('Hijrah Path – content comes from the Seerah', () => {
  const e05 = EPISODES.find((e) => e.id === 'episode-05')!;
  const allBlocks = [
    ...e05.context,
    ...e05.mainEvent,
    ...EVENTS.flatMap((e) => e.summary),
    ...PLACES.flatMap((p) => p.description),
    ...QUESTIONS.filter((q) => q.episodeId === 'episode-05').map((q) => ({ kind: 'fact', text: q.explanation, sourceIds: q.sourceIds ?? [] })),
  ] as unknown as SeerahBlock[];

  it('every block is a Seerah block with the same label and sources', () => {
    for (const cp of CHECKPOINTS) {
      for (const block of cp.blocks) {
        const match = allBlocks.find((b) => b.text.en === block.text.en);
        expect(match).toBeDefined();
        expect(match!.text).toEqual(block.text);
        expect(match!.kind).toBe(block.kind);
        expect(match!.sourceIds).toEqual(block.sourceIds);
      }
    }
  });

  it('source refs render the Seerah short labels', () => {
    for (const [id, ref] of Object.entries(SOURCE_REFS)) {
      const label = ref.sourceReference ? `${ref.sourceName} ${ref.sourceReference}` : ref.sourceName;
      expect(label).toBe(sourceShortLabel(getSource(id as SeerahSourceId)!));
    }
  });

  it('titles and dates come from the Seerah question e05-q3 and the events', () => {
    const q3 = QUESTIONS.find((q) => q.id === 'e05-q3') as unknown as { items: { text: unknown }[] };
    const titles = q3.items.map((i) => i.text);
    for (const cp of CHECKPOINTS.filter((c) => c.id !== 'guide')) expect(titles).toContainEqual(cp.title);
    const hijrah = EVENTS.find((e) => e.id === 'hijrah')!;
    const quba = EVENTS.find((e) => e.id === 'quba')!;
    for (const cp of CHECKPOINTS) {
      const event = cp.id === 'quba' ? quba : hijrah;
      expect(cp.date.label).toEqual(event.date.label);
      expect(cp.date.certainty).toBe(event.date.certainty);
      expect(cp.date.note).toEqual(event.date.note);
    }
  });

  it('every game fact is copied from a Seerah block with its sources', () => {
    for (const fact of Object.values(HIJRAH_FACTS)) {
      const match = allBlocks.find((b) => b.text.en === fact.text.en);
      expect(match).toBeDefined();
      expect(match!.text).toEqual(fact.text);
      expect(fact.sources).toEqual(match!.sourceIds.map((id) => SOURCE_REFS[id as SeerahSourceId]));
    }
  });

  it('uses only existing art', () => {
    for (const name of HIJRAH_ART) expect(hasArt(name)).toBe(true);
    for (const fact of Object.values(HIJRAH_FACTS)) expect(hasArt(fact.art)).toBe(true);
  });
});

describe('Hijrah Path – registration', () => {
  it('registers a valid game with 3 levels', () => {
    const game = getGame(HIJRAH_GAME_ID)!;
    expect(game).toBeDefined();
    expect(() => validateGame(game)).not.toThrow();
    expect(game.levels).toHaveLength(3);
    expect(hasArt(game.coverArt)).toBe(true);
  });

  it('review keys and checks point to existing Seerah questions', () => {
    for (const fact of Object.values(HIJRAH_FACTS)) {
      if ('reviewKey' in fact && fact.reviewKey) expect(getQuestionByKey(fact.reviewKey)).toBeDefined();
    }
    const q1 = QUESTIONS.find((q) => q.id === 'e05-q1') as unknown as { prompt: unknown; options: { text: unknown }[] };
    expect(HIJRAH_FACTS.cave.check.prompt).toEqual(q1.prompt);
    expect(HIJRAH_FACTS.cave.check.options).toEqual(q1.options.map((o) => o.text));
    const q2 = QUESTIONS.find((q) => q.id === 'e05-q2') as unknown as { prompt: unknown };
    expect(HIJRAH_FACTS.departure.check.statement).toEqual(q2.prompt);
  });

  it('has complete texts in every language', () => {
    for (const lang of ['en', 'de', 'bs'] as const) {
      for (const key of ['title', 'description', 'howTo', 'play.approxRoute', 'label.fact', 'label.interpretation']) {
        expect(translateNs(hijrahGame.i18n, lang, key)).not.toBe(key);
      }
    }
  });
});

// ---------- render ----------

interface Node {
  props: Record<string, any>;
  findAll: (predicate: (node: Node) => boolean) => Node[];
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act, create } = require('react-test-renderer') as {
  act: (callback: () => Promise<unknown> | void) => Promise<void>;
  create: (element: React.ReactElement) => { root: Node; unmount: () => void };
};

const pressable = (root: Node, label: string | RegExp) =>
  root.findAll((n) => typeof n.props.onPress === 'function' && (typeof label === 'string' ? n.props.accessibilityLabel === label : label.test(String(n.props.accessibilityLabel ?? ''))))[0];

async function press(root: Node, label: string | RegExp) {
  const node = pressable(root, label);
  if (!node) throw new Error(`control not found: ${label}`);
  await act(() => node.props.onPress());
}

async function layout(root: Node) {
  for (const node of root.findAll((n) => typeof n.props.onLayout === 'function')) {
    await act(() => node.props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 360, height: 620 } } }));
  }
}

const texts = (root: Node) =>
  root
    .findAll((n) => typeof n.props.children === 'string')
    .map((n) => n.props.children as string)
    .join(' | ');

function api(level: 1 | 2 | 3, onComplete: (r: GameResultInput) => void): GameApi<HijrahConfig> {
  const def = hijrahGame.levels[level - 1];
  return {
    gameId: HIJRAH_GAME_ID,
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
    t: (key, params) => translateNs(hijrahGame.i18n, 'en', key, params),
    l: (text) => text?.en ?? '',
  };
}

describe('Hijrah Path – render', () => {
  it.each([1, 2])('level %i: the tap alternative walks through all five stops and reports a result', async (level) => {
    const onComplete = jest.fn();
    let tree!: { root: Node; unmount: () => void };
    await act(async () => {
      tree = create(<HijrahPathGame {...api(level as 1 | 2, onComplete)} />);
    });
    await layout(tree.root);
    expect(texts(tree.root)).toContain('Approximate route');
    for (let i = 0; i < 5; i++) {
      await press(tree.root, 'Go to the next stop');
      expect(texts(tree.root)).toContain(CHECKPOINTS[i].title.en);
      if (level === 1 && i === 2) expect(texts(tree.root)).toContain('Historical interpretation');
      await press(tree.root, 'Continue');
    }
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][0]).toMatchObject({ score: 50, maxScore: 50, stars: 3, factsMissed: [] });
    await act(() => tree.unmount());
  });

  it('level 3: tracing, then ordering the cards on the timeline (with one mistake)', async () => {
    const onComplete = jest.fn();
    let tree!: { root: Node; unmount: () => void };
    await act(async () => {
      tree = create(<HijrahPathGame {...api(3, onComplete)} />);
    });
    await layout(tree.root);
    for (let i = 0; i < 5; i++) {
      await press(tree.root, 'Go to the next stop');
      await press(tree.root, 'Continue');
    }
    expect(texts(tree.root)).toContain('Put the stops in order');
    await layout(tree.root);
    // A wrong card first (Madinah into place 1), then the right order.
    await press(tree.root, `Card: ${CHECKPOINTS[4].title.en}`);
    expect(texts(tree.root)).toContain('Not quite');
    for (const cp of CHECKPOINTS) await press(tree.root, `Card: ${cp.title.en}`);
    expect(texts(tree.root)).toContain('The Hijrah, stop by stop!');
    await press(tree.root, 'Continue');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][0]).toMatchObject({ score: 95, maxScore: 100, mistakes: 1, factsMissed: ['hijrah-order'] });
    await act(() => tree.unmount());
  });
});
