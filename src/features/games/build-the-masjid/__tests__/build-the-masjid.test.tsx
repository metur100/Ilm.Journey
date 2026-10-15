import type React from 'react';

import { hasArt } from '@/core/art';
import { type GameApi, type GameResultInput, getGame, validateGame } from '@/core/games';
import { translateNs } from '@/core/i18n';
import { LANGUAGES } from '@/core/models';
import { getQuestionByKey } from '@/core/registry';
import { registerSeerahFeature } from '@/features/seerah/register';
import { EPISODES, EVENTS, getPlace, getSource, PLACES, QUESTIONS } from '@/features/seerah/content';
import { sourceShortLabel } from '@/features/seerah/services/sources';

import { BuildTheMasjidGame, type MasjidConfig } from '../BuildTheMasjidGame';
import { MADINAH, MAKKAH, MOSQUE_DATE, QIBLA_DATE, type SeerahBlock, type SeerahSourceId, SOURCE_REFS } from '../content';
import {
  angleDiff,
  angleFromCenter,
  bearing,
  buildScore,
  checkPlacement,
  checkQibla,
  dropZone,
  JERUSALEM_BEARING,
  KAABA_BEARING,
  LAYER_ORDER,
  masjidResult,
  nearestTurn,
  nextPart,
  PARTS,
  type PartId,
  project,
  qiblaScore,
  SITE,
  slotBox,
  slotCentre,
  starsFor,
} from '../logic';
import { MASJID_FACTS, MASJID_GAME_ID, masjidGame, registerBuildTheMasjidGame } from '../register';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

// Only what these tests need (independent of the other games in progress).
registerSeerahFeature();
registerBuildTheMasjidGame();

const BUILD: PartId[] = ['ground', 'walls', 'pillars', 'roof'];

describe('Build the Masjid – assembly validation', () => {
  it('builds from the ground up', () => {
    expect(checkPlacement('ground', [], slotCentre('ground'))).toEqual({ ok: true });
    expect(checkPlacement('walls', [], slotCentre('walls'))).toEqual({ ok: false, reason: 'needs-first', missing: 'ground' });
    expect(checkPlacement('walls', ['ground'], slotCentre('walls'))).toEqual({ ok: true });
    expect(checkPlacement('roof', ['ground', 'walls'], slotCentre('roof'))).toEqual({ ok: false, reason: 'needs-first', missing: 'pillars' });
    expect(checkPlacement('roof', ['ground', 'pillars'], slotCentre('roof'))).toEqual({ ok: true });
    expect(checkPlacement('suffa', BUILD.slice(0, 3), slotCentre('suffa'))).toEqual({ ok: false, reason: 'needs-first', missing: 'roof' });
    expect(checkPlacement('shade-south', BUILD, slotCentre('shade-south'))).toEqual({ ok: true });
  });

  it('needs the right spot on the site', () => {
    const sky = { x: 180, y: 20 };
    expect(checkPlacement('ground', [], sky)).toEqual({ ok: false, reason: 'wrong-spot' });
    expect(checkPlacement('pillars', ['ground'], sky)).toEqual({ ok: false, reason: 'wrong-spot' });
    // The new shade belongs to the front (qibla) side, the Suffa to the back.
    expect(checkPlacement('shade-south', BUILD, slotCentre('suffa'))).toEqual({ ok: false, reason: 'wrong-spot' });
    expect(checkPlacement('suffa', BUILD, slotCentre('shade-south'))).toEqual({ ok: false, reason: 'wrong-spot' });
    expect(checkPlacement('ground', ['ground'], slotCentre('ground'))).toEqual({ ok: false, reason: 'placed' });
    // The tap alternative skips the spot, not the order.
    expect(checkPlacement('roof', ['ground'], null)).toEqual({ ok: false, reason: 'needs-first', missing: 'pillars' });
  });

  it('places every slot on the site and every layer in the drawing order', () => {
    for (const id of Object.keys(PARTS) as PartId[]) {
      const b = slotBox(id);
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.x + b.w).toBeLessThanOrEqual(SITE.w);
      expect(b.y + b.h).toBeLessThanOrEqual(SITE.h);
      const z = dropZone(id);
      const c = slotCentre(id);
      expect(c.x > z.x && c.x < z.x + z.w && c.y > z.y && c.y < z.y + z.h).toBe(true);
      for (const layer of PARTS[id].layers) {
        expect(LAYER_ORDER).toContain(layer);
        expect(hasArt(layer)).toBe(true);
      }
    }
    // The projection is the one of the art (back-left corner of the plot, front-right corner).
    expect(project(0, 0)).toEqual({ x: 100, y: 150 });
    expect(project(1, 1)).toEqual({ x: 254, y: 214 });
  });

  it('guides the next part in order', () => {
    expect(nextPart(BUILD, [])).toBe('ground');
    expect(nextPart(BUILD, ['ground'])).toBe('walls');
    expect(nextPart(BUILD, ['ground', 'walls'])).toBe('pillars');
    expect(nextPart(BUILD, BUILD)).toBeNull();
  });

  it('scores parts and maps to stars', () => {
    expect(buildScore(4, 0)).toEqual({ score: 40, maxScore: 40 });
    expect(buildScore(4, 2)).toEqual({ score: 32, maxScore: 40 });
    expect(starsFor(40, 40)).toBe(3);
    expect(starsFor(32, 40)).toBe(2);
    expect(starsFor(10, 40)).toBe(1);
    expect(masjidResult({ parts: 4, partsWithMistakes: 0, buildMistakes: 0 })).toEqual({ score: 40, maxScore: 40, stars: 3, mistakes: 0, factsMissed: [] });
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
    expect(masjidResult({ parts: 6, partsWithMistakes: 0, buildMistakes: 0, qiblaMistakes: 0 })).toMatchObject({ score: 90, maxScore: 90, stars: 3, factsMissed: [] });
    expect(masjidResult({ parts: 6, partsWithMistakes: 0, buildMistakes: 0, qiblaMistakes: 2 })).toMatchObject({ score: 70, stars: 2, mistakes: 2, factsMissed: ['qibla-change'] });
  });
});

describe('Build the Masjid – content and sources', () => {
  const e06 = EPISODES.find((e) => e.id === 'episode-06')!;
  const allBlocks = [...e06.context, ...e06.mainEvent, ...EVENTS.flatMap((e) => e.summary), ...PLACES.flatMap((p) => p.description)] as unknown as SeerahBlock[];

  it('every result fact is a Seerah block with its label and sources', () => {
    for (const fact of Object.values(MASJID_FACTS)) {
      const match = allBlocks.find((b) => b.text.en === fact.text.en);
      expect(match).toBeDefined();
      expect(match!.text).toEqual(fact.text);
      expect(fact.sources).toEqual(match!.sourceIds.map((id) => SOURCE_REFS[id as SeerahSourceId]));
    }
  });

  it('every inline caption has sources: the Seerah sources or the cited hadith of the building (Bukhari 446, 602)', () => {
    const seerahRefs = Object.values(SOURCE_REFS);
    const hadith = ['446', '602'].map((n) => ({ sourceName: 'Sahih al-Bukhari', sourceReference: n }));
    for (const part of Object.values(PARTS)) {
      expect(part.sources.length).toBeGreaterThan(0);
      for (const s of part.sources) expect([...seerahRefs, ...hadith]).toContainEqual(s);
    }
  });

  it('dates come from the events', () => {
    expect(MOSQUE_DATE).toEqual({ label: EVENTS.find((e) => e.id === 'mosque')!.date.label, certainty: 'established', note: null });
    const qibla = EVENTS.find((e) => e.id === 'qibla')!;
    expect(QIBLA_DATE).toEqual({ label: qibla.date.label, certainty: qibla.date.certainty, note: qibla.date.note });
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
    for (const f of Object.values(MASJID_FACTS)) expect(hasArt(f.art)).toBe(true);
    const scene = ['morning', 'noon', 'evening'].map((time) => `seerah.masjid-sky-${time}`);
    for (const name of [...scene, 'seerah.masjid-foreground', 'seerah.masjid-finished', 'seerah.masjid-finished-qibla', 'object.kaaba-icon', masjidGame.coverArt]) {
      expect(hasArt(name)).toBe(true);
    }
  });

  it('registers a valid game with complete texts', () => {
    const game = getGame(MASJID_GAME_ID)!;
    expect(() => validateGame(game)).not.toThrow();
    const keys = ['title', 'description', 'howTo', ...(Object.keys(PARTS) as PartId[]).flatMap((id) => [`part.${id}`, `short.${id}`, `caption.${id}`])];
    for (const lang of LANGUAGES) for (const key of keys) expect(translateNs(masjidGame.i18n, lang, key)).not.toBe(key);
  });
});

// ---------- render: play every level to the end ----------

interface Node {
  props: Record<string, any>;
  findAll: (predicate: (node: Node) => boolean) => Node[];
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act, create } = require('react-test-renderer') as {
  act: (callback: () => Promise<unknown> | void) => Promise<void>;
  create: (element: React.ReactElement) => { root: Node; unmount: () => void };
};

const en = (key: string, params?: Record<string, string | number>) => translateNs(masjidGame.i18n, 'en', key, params);
const findPress = (root: Node, label: string) => root.findAll((n) => typeof n.props.onPress === 'function' && n.props.accessibilityLabel === label)[0];
const findButton = (root: Node, label: string) => root.findAll((n) => typeof n.props.onPress === 'function' && n.props.label === label)[0];
async function press(root: Node, label: string) {
  const node = findPress(root, label) ?? findButton(root, label);
  if (!node) throw new Error(`control not found: ${label}`);
  await act(() => node.props.onPress());
}
const place = (root: Node, id: PartId) => press(root, en('a11y.part', { part: en(`part.${id}`) }));
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
    t: (key, params) => en(key, params),
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

/** Places a part and checks the build goes on without any dialog: an inline caption, no Continue step. */
async function placeInline(root: Node, id: PartId) {
  await place(root, id);
  const shown = texts(root);
  expect(shown).toContain(en(`caption.${id}`));
  expect(findButton(root, 'Continue')).toBeUndefined();
  expect(shown).not.toContain('Continue');
}

/** The finished masjid is revealed as a picture; its button leads to the shell's result. */
async function finishReveal(root: Node, art: string) {
  expect(root.findAll((n) => n.props.name === art).length).toBeGreaterThan(0);
  expect(texts(root)).toContain(en('reveal.title'));
  await press(root, en('reveal.finish'));
}

describe('Build the Masjid – play every level to completion', () => {
  it('never draws its own title (the GameShell header is the only one)', async () => {
    const tree = await mount(1, jest.fn());
    expect(texts(tree.root)).not.toContain(en('title'));
    expect(tree.root.findAll((n) => n.props.accessibilityRole === 'header')).toHaveLength(0);
    await act(() => tree.unmount());
  });

  it('level 1 (guided): the next part and its place glow; each part snaps in with a caption, then the masjid is revealed', async () => {
    const onComplete = jest.fn();
    const tree = await mount(1, onComplete);
    for (const id of BUILD) {
      expect(texts(tree.root)).toContain(en('play.next', { part: en(`part.${id}`) }));
      await placeInline(tree.root, id);
      if (id !== 'roof') expect(onComplete).not.toHaveBeenCalled();
    }
    expect(onComplete).not.toHaveBeenCalled();
    await finishReveal(tree.root, 'seerah.masjid-finished');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith({ score: 40, maxScore: 40, stars: 3, mistakes: 0, factsMissed: [] });
    await act(() => tree.unmount());
  });

  it('level 2 (from memory): a part before its base is gently refused inline', async () => {
    const onComplete = jest.fn();
    const tree = await mount(2, onComplete);
    expect(texts(tree.root)).toContain(en('play.memory'));
    await place(tree.root, 'roof');
    expect(texts(tree.root)).toContain(en('play.needsFirst', { part: en('part.pillars') }));
    expect(texts(tree.root)).not.toContain(en('caption.roof'));
    for (const id of ['ground', 'pillars', 'walls', 'roof'] as PartId[]) await placeInline(tree.root, id);
    await finishReveal(tree.root, 'seerah.masjid-finished');
    expect(onComplete).toHaveBeenCalledWith({ score: 36, maxScore: 40, stars: 3, mistakes: 1, factsMissed: [] });
    await act(() => tree.unmount());
  });

  it('level 3: build, turn the qibla from Jerusalem to the Kaʿbah, add the new shade and the Suffa', async () => {
    const onComplete = jest.fn();
    const tree = await mount(3, onComplete);
    for (const id of BUILD) await placeInline(tree.root, id);
    expect(texts(tree.root)).toContain(en('play.turn'));
    // Facing east first is a gentle mistake.
    for (let i = 0; i < 6; i++) await press(tree.root, en('play.turnRight'));
    await press(tree.root, en('play.face'));
    expect(texts(tree.root)).toContain(en('play.hint'));
    // Continue turning to the south (332° + 13 × 15° = 167°).
    for (let i = 0; i < 7; i++) await press(tree.root, en('play.turnRight'));
    await press(tree.root, en('play.face'));
    expect(texts(tree.root)).toContain('Sixteen or seventeen months after the Hijrah');
    expect(findButton(tree.root, 'Continue')).toBeUndefined();
    // The new parts come only after the turn.
    await placeInline(tree.root, 'shade-south');
    await placeInline(tree.root, 'suffa');
    await finishReveal(tree.root, 'seerah.masjid-finished-qibla');
    expect(onComplete).toHaveBeenCalledWith({ score: 80, maxScore: 90, stars: 3, mistakes: 1, factsMissed: ['qibla-change'] });
    await act(() => tree.unmount());
  });
});
