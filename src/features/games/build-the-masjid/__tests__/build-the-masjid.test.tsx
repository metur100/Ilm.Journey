import type React from 'react';

import { hasArt } from '@/core/art';
import { type GameApi, type GameResultInput, getGame, validateGame } from '@/core/games';
import { translateNs } from '@/core/i18n';
import { getQuestionByKey } from '@/core/registry';
import { registerSeerahFeature } from '@/features/seerah/register';
import { EPISODES, EVENTS, getPlace, getSource, PLACES, QUESTIONS } from '@/features/seerah/content';
import { sourceShortLabel } from '@/features/seerah/services/sources';

import { BuildTheMasjidGame, type MasjidConfig } from '../BuildTheMasjidGame';
import { MADINAH, MAKKAH, type SeerahBlock, type SeerahSourceId, SOURCE_REFS } from '../content';
import {
  angleDiff,
  angleFromCenter,
  bearing,
  buildScore,
  checkPlacement,
  checkQibla,
  JERUSALEM_BEARING,
  KAABA_BEARING,
  masjidResult,
  nearestTurn,
  nextPart,
  PARTS,
  type PartId,
  qiblaScore,
  starsFor,
} from '../logic';
import { MASJID_FACTS, MASJID_GAME_ID, masjidGame, registerBuildTheMasjidGame } from '../register';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

// Only what these tests need (independent of the other games in progress).
registerSeerahFeature();
registerBuildTheMasjidGame();

const centre = (id: PartId) => {
  const s = PARTS[id].slot;
  return { x: s.x + s.w / 2, y: s.y + s.h / 2 };
};

describe('Build the Masjid – assembly validation', () => {
  it('builds from the ground up', () => {
    expect(checkPlacement('plot', [], centre('plot'))).toEqual({ ok: true });
    expect(checkPlacement('walls', [], { x: 50, y: 110 })).toEqual({ ok: false, reason: 'needs-first', missing: 'plot' });
    expect(checkPlacement('walls', ['plot'], { x: 50, y: 110 })).toEqual({ ok: true });
    expect(checkPlacement('qibla-wall', ['plot'], centre('qibla-wall'))).toEqual({ ok: false, reason: 'needs-first', missing: 'walls' });
    expect(checkPlacement('qibla-wall', ['plot', 'walls'], centre('qibla-wall'))).toEqual({ ok: true });
    expect(checkPlacement('palms', ['plot'], { x: 30, y: 80 })).toEqual({ ok: true });
  });

  it('needs the right spot on the site', () => {
    expect(checkPlacement('plot', [], { x: 150, y: 30 })).toEqual({ ok: false, reason: 'wrong-spot' });
    expect(checkPlacement('walls', ['plot'], { x: 150, y: 100 })).toEqual({ ok: false, reason: 'wrong-spot' });
    expect(checkPlacement('palms', ['plot'], { x: 150, y: 100 })).toEqual({ ok: false, reason: 'wrong-spot' });
    expect(checkPlacement('plot', ['plot'], centre('plot'))).toEqual({ ok: false, reason: 'placed' });
    // The tap alternative skips the spot, not the order.
    expect(checkPlacement('walls', [], null)).toEqual({ ok: false, reason: 'needs-first', missing: 'plot' });
  });

  it('guides the next part in order', () => {
    const order: PartId[] = ['plot', 'walls', 'qibla-wall', 'palms'];
    expect(nextPart(order, [])).toBe('plot');
    expect(nextPart(order, ['plot'])).toBe('walls');
    expect(nextPart(order, ['plot', 'walls', 'qibla-wall', 'palms'])).toBeNull();
  });

  it('scores parts and maps to stars', () => {
    expect(buildScore(4, 0)).toEqual({ score: 40, maxScore: 40 });
    expect(buildScore(4, 2)).toEqual({ score: 32, maxScore: 40 });
    expect(starsFor(40, 40)).toBe(3);
    expect(starsFor(32, 40)).toBe(2);
    expect(starsFor(10, 40)).toBe(1);
    expect(masjidResult({ parts: 3, partsWithMistakes: 0, buildMistakes: 0 })).toEqual({ score: 30, maxScore: 30, stars: 3, mistakes: 0, factsMissed: [] });
  });
});

describe('Build the Masjid – qibla rotation', () => {
  it('computes the directions from Madinah: Jerusalem north-west-ish, the Kaʿbah south', () => {
    expect(KAABA_BEARING).toBeGreaterThan(170);
    expect(KAABA_BEARING).toBeLessThan(185);
    expect(JERUSALEM_BEARING).toBeGreaterThan(320);
    expect(JERUSALEM_BEARING).toBeLessThan(340);
    expect(bearing(MADINAH, MAKKAH)).toBeCloseTo(KAABA_BEARING);
    // Coordinates are the Seerah places.
    expect(getPlace('madinah')!.coords).toEqual(MADINAH);
    expect(getPlace('makkah')!.coords).toEqual(MAKKAH);
  });

  it('validates the arrow within the tolerance', () => {
    expect(checkQibla(KAABA_BEARING)).toBe('kaaba');
    expect(checkQibla(KAABA_BEARING + 18)).toBe('kaaba');
    expect(checkQibla(KAABA_BEARING - 25)).toBe('other');
    expect(checkQibla(JERUSALEM_BEARING)).toBe('jerusalem');
    expect(checkQibla(90)).toBe('other');
  });

  it('handles angles around north', () => {
    expect(angleDiff(350, 10)).toBe(-20);
    expect(angleDiff(10, 350)).toBe(20);
    expect(angleFromCenter(0, -10)).toBeCloseTo(0);
    expect(angleFromCenter(10, 0)).toBeCloseTo(90);
    expect(angleFromCenter(0, 10)).toBeCloseTo(180);
    expect(angleFromCenter(-10, 0)).toBeCloseTo(270);
    expect(nearestTurn(350, 10)).toBe(370);
    expect(nearestTurn(332, 176)).toBeCloseTo(176);
  });

  it('scores the qibla turn and reports the fact when the learner needed tries', () => {
    expect(qiblaScore(0).score).toBe(30);
    expect(qiblaScore(1).score).toBe(20);
    expect(qiblaScore(3).score).toBe(10);
    expect(masjidResult({ parts: 3, partsWithMistakes: 0, buildMistakes: 0, qiblaMistakes: 0 })).toMatchObject({ score: 60, maxScore: 60, stars: 3, factsMissed: [] });
    expect(masjidResult({ parts: 3, partsWithMistakes: 0, buildMistakes: 0, qiblaMistakes: 2 })).toMatchObject({ score: 40, stars: 2, mistakes: 2, factsMissed: ['qibla-change'] });
  });
});

describe('Build the Masjid – content comes from the Seerah', () => {
  const e06 = EPISODES.find((e) => e.id === 'episode-06')!;
  const allBlocks = [...e06.context, ...e06.mainEvent, ...EVENTS.flatMap((e) => e.summary), ...PLACES.flatMap((p) => p.description)] as unknown as SeerahBlock[];

  it('every part block and fact is a Seerah block with its label and sources', () => {
    const blocks = [...Object.values(PARTS).map((p) => p.block)];
    for (const block of blocks) {
      const match = allBlocks.find((b) => b.text.en === block.text.en);
      expect(match).toBeDefined();
      expect(match).toMatchObject({ kind: block.kind, text: block.text, sourceIds: block.sourceIds });
    }
    for (const fact of Object.values(MASJID_FACTS)) {
      const match = allBlocks.find((b) => b.text.en === fact.text.en);
      expect(match).toBeDefined();
      expect(match!.text).toEqual(fact.text);
      expect(fact.sources).toEqual(match!.sourceIds.map((id) => SOURCE_REFS[id as SeerahSourceId]));
    }
  });

  it('dates come from the events', () => {
    expect(PARTS.plot.date).toEqual({ label: EVENTS.find((e) => e.id === 'mosque')!.date.label, certainty: 'established', note: null });
    const qibla = EVENTS.find((e) => e.id === 'qibla')!;
    expect(PARTS['qibla-wall'].date).toEqual({ label: qibla.date.label, certainty: qibla.date.certainty, note: qibla.date.note });
  });

  it('source refs render the Seerah short labels', () => {
    for (const [id, ref] of Object.entries(SOURCE_REFS)) {
      const label = ref.sourceReference ? `${ref.sourceName} ${ref.sourceReference}` : ref.sourceName;
      expect(label).toBe(sourceShortLabel(getSource(id)!));
    }
  });

  it('checks reuse the Seerah questions; review keys exist', () => {
    const q1 = QUESTIONS.find((q) => q.id === 'e06-q1') as unknown as { prompt: unknown; options: { text: unknown }[] };
    expect(MASJID_FACTS.land.check.prompt).toEqual(q1.prompt);
    expect(MASJID_FACTS.land.check.options).toEqual(q1.options.map((o) => o.text));
    const q2 = QUESTIONS.find((q) => q.id === 'e06-q2') as unknown as { prompt: unknown };
    expect(MASJID_FACTS.change.check.statement).toEqual(q2.prompt);
    expect(getQuestionByKey(MASJID_FACTS.firstProject.reviewKey)).toBeDefined();
  });

  it('uses only existing art', () => {
    for (const p of Object.values(PARTS)) expect(hasArt(p.art)).toBe(true);
    for (const f of Object.values(MASJID_FACTS)) expect(hasArt(f.art)).toBe(true);
    for (const name of ['place.masjid-nabawi-early', 'sky.morning', 'garden.palm', 'object.kaaba-icon', 'object.prayer-mat']) expect(hasArt(name)).toBe(true);
  });

  it('registers a valid game with complete texts', () => {
    const game = getGame(MASJID_GAME_ID)!;
    expect(() => validateGame(game)).not.toThrow();
    for (const lang of ['en', 'de', 'bs'] as const) for (const key of ['title', 'description', 'howTo', 'part.qibla-wall']) expect(translateNs(masjidGame.i18n, lang, key)).not.toBe(key);
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

const findPress = (root: Node, label: string) => root.findAll((n) => typeof n.props.onPress === 'function' && n.props.accessibilityLabel === label)[0];
async function press(root: Node, label: string) {
  const node = findPress(root, label);
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

function api(level: 1 | 2 | 3, onComplete: (r: GameResultInput) => void): GameApi<MasjidConfig> {
  const def = masjidGame.levels[level - 1];
  return {
    gameId: MASJID_GAME_ID,
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
    t: (key, params) => translateNs(masjidGame.i18n, 'en', key, params),
    l: (text) => text?.en ?? '',
  };
}

async function mount(level: 1 | 2 | 3, onComplete: jest.Mock) {
  let tree!: { root: Node; unmount: () => void };
  await act(async () => {
    tree = create(<BuildTheMasjidGame {...api(level, onComplete)} />);
  });
  await layout(tree.root);
  return tree;
}

describe('Build the Masjid – render', () => {
  it('level 1: places the parts in order and reveals their facts', async () => {
    const onComplete = jest.fn();
    const tree = await mount(1, onComplete);
    expect(texts(tree.root)).toContain('Next: The plot of land');
    for (const part of ['The plot of land', 'Brick walls', 'Palm grove']) {
      await press(tree.root, `Part: ${part}`);
      expect(texts(tree.root)).toContain('Established fact');
      await press(tree.root, 'Continue');
    }
    expect(onComplete).toHaveBeenCalledWith({ score: 30, maxScore: 30, stars: 3, mistakes: 0, factsMissed: [] });
    await act(() => tree.unmount());
  });

  it('level 2: a part before its base is gently refused', async () => {
    const onComplete = jest.fn();
    const tree = await mount(2, onComplete);
    await press(tree.root, 'Part: The qibla wall');
    expect(texts(tree.root)).toContain('First comes: Brick walls.');
    for (const part of ['The plot of land', 'Brick walls', 'The qibla wall', 'Palm grove']) {
      await press(tree.root, `Part: ${part}`);
      await press(tree.root, 'Continue');
    }
    expect(onComplete).toHaveBeenCalledWith({ score: 36, maxScore: 40, stars: 3, mistakes: 1, factsMissed: [] });
    await act(() => tree.unmount());
  });

  it('level 3: rows face Jerusalem, then the arrow turns to the Kaʿbah', async () => {
    const onComplete = jest.fn();
    const tree = await mount(3, onComplete);
    for (const n of [1, 2, 3]) await press(tree.root, `Prayer row ${n}`);
    expect(texts(tree.root)).toContain('The Muslims had prayed towards Jerusalem');
    await press(tree.root, 'Continue');
    // Facing east first is a gentle mistake.
    for (let i = 0; i < 6; i++) await press(tree.root, 'Turn right');
    await press(tree.root, 'Face this way');
    expect(texts(tree.root)).toContain('Madinah lies north of Makkah.');
    // Continue turning to the south (332° + 13 × 15° = 167°).
    for (let i = 0; i < 7; i++) await press(tree.root, 'Turn right');
    await press(tree.root, 'Face this way');
    expect(texts(tree.root)).toContain('Sixteen or seventeen months after the Hijrah');
    await press(tree.root, 'Continue');
    expect(onComplete).toHaveBeenCalledWith({ score: 50, maxScore: 60, stars: 2, mistakes: 1, factsMissed: ['qibla-change'] });
    await act(() => tree.unmount());
  });
});
