import type React from 'react';

import { hasArt } from '@/core/art';
import { type GameApi, type GameResultInput, getGame, validateGame } from '@/core/games';
import { translateNs } from '@/core/i18n';
import type { LocalizedText, SourceRef } from '@/core/models';
import { getQuestionByKey } from '@/core/registry';
import akhlaq from '@/features/learn/content/quests/akhlaq.json';
import ramadan from '@/features/learn/content/quests/ramadan.json';
import salah from '@/features/learn/content/quests/salah.json';
import { getTopicTools } from '@/features/learn/extensions';
import { registerLearnFeature } from '@/features/learn/register';

import { type ContentChoice, DAYS, DEEDS_ART, DILEMMAS, EVERYDAY, GOOD_DEEDS, RAMADAN_DAY, type Scene } from '../content';
import { type DeedsConfig, GoodDeedsDayGame } from '../GoodDeedsDayGame';
import { deedsI18n } from '../i18n';
import { advance, answerChoice, dayResult, deedsDone, gardenPlants, isSunset, mayEat, NEW_SCENE, sceneScore, starsFor, stepDone, sunAt, sunProgress, SUNSET_T, targetInFrontOfHero, toggleDeed } from '../logic';
import { DEEDS_FACTS, DEEDS_GAME_ID, deedsGame, registerGoodDeedsDayGame } from '../register';
import { RAMADAN_JOURNEY_ID, ramadanJourneyGame, registerRamadanJourneyGame } from '../../ramadan-journey/register';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

// Only what these tests need (independent of the other games in progress).
registerLearnFeature();
registerGoodDeedsDayGame();
registerRamadanJourneyGame();

interface Lesson {
  id: string;
  sections: { body: LocalizedText }[];
  sources: SourceRef[];
  differenceNote?: LocalizedText;
}
interface Question {
  id: string;
  prompt: LocalizedText;
  options?: { id: string; text: LocalizedText; feedback?: LocalizedText }[];
  correctOptionId?: string;
  explanation: LocalizedText;
  sources?: SourceRef[];
}
const worlds = [akhlaq, ramadan, salah] as unknown as { lessons: Lesson[]; questions: Question[]; facts: { text: LocalizedText; sources?: SourceRef[] }[] }[];
const lessons = worlds.flatMap((w) => w.lessons);
const questions = worlds.flatMap((w) => w.questions);
const contentTexts = [
  ...lessons.flatMap((l) => l.sections.map((s) => s.body)),
  ...worlds.flatMap((w) => [...w.facts.map((f) => f.text), ...w.questions.map((q) => q.explanation)]),
];
/** Sources the content gives for a text: its lesson's sources or the fact's sources. */
const sourcesOf = (text: LocalizedText): SourceRef[] => {
  const lesson = lessons.find((l) => l.sections.some((s) => s.body.en === text.en));
  if (lesson) return lesson.sources;
  return worlds.flatMap((w) => w.facts).find((f) => f.text.en === text.en)?.sources ?? [];
};
const key = (s: SourceRef) => `${s.sourceName} ${s.sourceReference}`;
const allScenes: Scene[] = [...EVERYDAY, ...DILEMMAS, ...RAMADAN_DAY];

describe('A Day of Good Deeds – content comes from the Learn content', () => {
  it('every scene text is a lesson section or fact, cited with sources of that content', () => {
    for (const scene of allScenes) {
      for (const text of scene.card.texts) {
        expect(contentTexts).toContainEqual(text);
      }
      const allowed = [...sourcesOf(scene.card.texts[0]), ...questions.flatMap((q) => q.sources ?? [])].map(key);
      expect(scene.card.sources.length).toBeGreaterThan(0);
      for (const s of scene.card.sources) expect(allowed).toContain(key(s));
    }
  });

  it('dilemmas are the content scenarios with their feedback and good option', () => {
    const choices = allScenes.flatMap((s) => s.steps.flatMap((st) => (st.kind === 'choice' ? [st.choice] : []))) as ContentChoice[];
    expect(choices.length).toBeGreaterThanOrEqual(9);
    for (const choice of choices) {
      const q = questions.find((x) => x.id === choice.id)!;
      expect(choice.prompt).toEqual(q.prompt);
      expect(choice.options.map((o) => o.text)).toEqual(q.options!.map((o) => o.text));
      expect(choice.options.map((o) => o.feedback)).toEqual(q.options!.map((o) => o.feedback));
      expect(q.options![choice.correctIndex].id).toBe(q.correctOptionId);
      expect(choice.sources).toEqual(q.sources);
    }
  });

  it('the Ramadan notes and the tracker are copied from ramadan.json', () => {
    const nights = lessons.find((l) => l.id === 'ramadan-nights')!;
    expect(RAMADAN_DAY.find((s) => s.id === 'taraweeh')!.card.note).toEqual(nights.differenceNote);
    expect(GOOD_DEEDS).toEqual((ramadan as unknown as { goodDeeds: unknown[] }).goodDeeds);
  });

  it('every game fact is copied with sources from the content and reviews an existing question', () => {
    for (const fact of Object.values(DEEDS_FACTS)) {
      expect(contentTexts).toContainEqual(fact.text);
      const allowed = [...sourcesOf(fact.text), ...questions.flatMap((q) => q.sources ?? [])].map(key);
      for (const s of fact.sources) expect(allowed).toContain(key(s));
      expect(getQuestionByKey(fact.reviewKey)).toBeDefined();
    }
  });

  it('scene facts point to game facts', () => {
    const ids = Object.values(DEEDS_FACTS).map((f) => f.id);
    for (const s of allScenes) if (s.factId) expect(ids).toContain(s.factId);
  });

  it('uses only existing art', () => {
    for (const name of DEEDS_ART) expect(hasArt(name)).toBe(true);
    for (const f of Object.values(DEEDS_FACTS)) expect(hasArt(f.art)).toBe(true);
  });

  it('is linked from the Akhlaq and Ramadan topic pages', () => {
    const akhlaq = getTopicTools('akhlaq').find((x) => x.id === 'game-good-deeds-day-akhlaq')!;
    expect(akhlaq.label('en')).toBe('A Day of Good Deeds');
    expect(akhlaq.href).toEqual({ pathname: '/game/[id]', params: { id: DEEDS_GAME_ID } });
    const ramadan = getTopicTools('ramadan').find((x) => x.id === 'game-ramadan-journey')!;
    expect(ramadan.label('en')).toBe('Ramadan Journey');
    expect(ramadan.href).toEqual({ pathname: '/game/[id]', params: { id: RAMADAN_JOURNEY_ID } });
  });

  it('registers a valid game with complete texts', () => {
    expect(() => validateGame(getGame(DEEDS_GAME_ID)!)).not.toThrow();
    expect(() => validateGame(getGame(RAMADAN_JOURNEY_ID)!)).not.toThrow();
    expect(RAMADAN_DAY).toHaveLength(10);
    expect(ramadanJourneyGame.challengeCount).toBe(RAMADAN_DAY.length);
    for (const lang of ['en', 'de', 'bs'] as const) {
      for (const s of allScenes) expect(translateNs(deedsGame.i18n, lang, `scene.${s.id}`)).not.toBe(`scene.${s.id}`);
      for (const s of allScenes)
        for (const st of s.steps) {
          if (st.kind === 'drag' || st.kind === 'tap') expect(translateNs(deedsGame.i18n, lang, st.hint)).not.toBe(st.hint);
          if (st.kind === 'drag') for (const a of st.items) expect(translateNs(deedsGame.i18n, lang, `item.${a.split('.')[1]}`)).not.toContain('item.');
        }
    }
  });
});

describe('A Day of Good Deeds – scene logic', () => {
  it('places a prayer mat or iftar plate in front of the hero, not over the avatar', () => {
    const hero = { x: 16, y: 158, w: 120, h: 132 };
    const target = targetInFrontOfHero(400, 300, 108, hero);
    expect(target.x).toBeGreaterThanOrEqual(hero.x + hero.w);
    expect(target.x + target.w).toBeLessThanOrEqual(400);
    expect(target.y + target.h).toBeLessThanOrEqual(300);
  });

  it('a dilemma continues only with the good option', () => {
    const cup = DILEMMAS[0].steps[0];
    if (cup.kind !== 'choice') throw new Error('choice expected');
    expect(answerChoice(cup.choice, cup.choice.correctIndex)).toBe('good');
    expect(answerChoice(cup.choice, (cup.choice.correctIndex + 1) % 3)).toBe('retry');
  });

  it('steps advance in order and the scene completes after the last step', () => {
    const cat = DILEMMAS.find((s) => s.id === 'cat')!;
    const second = advance(cat, NEW_SCENE)!;
    expect(second.step).toBe(1);
    expect(stepDone(cat, second)).toBe(false);
    expect(stepDone(cat, { ...second, dragged: 1 })).toBe(true);
    expect(advance(cat, second)).toBeNull();
    const dates = EVERYDAY.find((s) => s.id === 'share-dates')!;
    expect(stepDone(dates, { ...NEW_SCENE, tapped: 2 })).toBe(false);
    expect(stepDone(dates, { ...NEW_SCENE, tapped: 3 })).toBe(true);
  });

  it('scores scenes, maps to stars and reports facts of scenes that needed a second try', () => {
    expect(sceneScore(false)).toBe(10);
    expect(sceneScore(true)).toBe(5);
    expect(dayResult(EVERYDAY, [])).toEqual({ score: 60, maxScore: 60, stars: 3, mistakes: 0, factsMissed: [] });
    expect(dayResult(DILEMMAS, ['cup', 'new-student', 'wallet'])).toEqual({ score: 85, maxScore: 100, stars: 3, mistakes: 3, factsMissed: ['sidq', 'amanah'] });
    expect(starsFor(20, 60)).toBe(1);
  });

  it('grows one plant per finished scene and pre-ticks the deeds of the day', () => {
    expect(gardenPlants(EVERYDAY, 2)).toEqual(['garden.flower-tulip', 'garden.flower-jasmine']);
    expect(deedsDone(RAMADAN_DAY, 10)).toEqual(['prayed', 'charity']);
    expect(toggleDeed(['prayed'], 'dua')).toEqual(['prayed', 'dua']);
    expect(toggleDeed(['prayed', 'dua'], 'prayed')).toEqual(['dua']);
  });
});

describe('A Day of Good Deeds – Ramadan timing', () => {
  it('the sun moves from afternoon down to sunset', () => {
    expect(sunAt(0).y).toBeLessThan(sunAt(1).y);
    expect(sunProgress(sunAt(0.5).x, sunAt(0.5).y)).toBeCloseTo(0.5);
    expect(sunProgress(0, 0)).toBe(0);
    expect(sunProgress(1, 1)).toBe(1);
  });

  it('iftar only at sunset; suhoor before dawn', () => {
    expect(isSunset(0.5)).toBe(false);
    expect(isSunset(SUNSET_T)).toBe(true);
    expect(mayEat('day', 0.6)).toBe(false);
    expect(mayEat('day', 1)).toBe(true);
    expect(mayEat('before-dawn')).toBe(true);
  });

  it('the Ramadan day runs suhoor → Fajr → day → sunset → night', () => {
    expect(RAMADAN_DAY.map((s) => s.time)).toEqual(['night', 'dawn', 'noon', 'noon', 'afternoon', 'sunset', 'night', 'night', 'night', 'dawn']);
    expect(RAMADAN_DAY[0].steps[0].kind).toBe('mode');
    expect(RAMADAN_DAY.find((s) => s.id === 'iftar')!.steps.map((s) => s.kind)).toEqual(['sun', 'drag']);
    expect(Object.keys(DAYS)).toEqual(['everyday', 'dilemmas', 'ramadan']);
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
const find = (root: Node, label: string) => root.findAll((n) => typeof n.props.onPress === 'function' && n.props.accessibilityLabel === label)[0];
async function press(root: Node, label: string) {
  const node = find(root, label);
  if (!node) throw new Error(`control not found: ${label}`);
  await act(() => node.props.onPress());
}
const texts = (root: Node) =>
  root
    .findAll((n) => typeof n.props.children === 'string')
    .map((n) => n.props.children as string)
    .join(' | ');
const en = (k: string, p?: Record<string, string | number>) => translateNs(deedsGame.i18n, 'en', k, p);

function api(level: 1 | 2 | 3, onComplete: (r: GameResultInput) => void): GameApi<DeedsConfig> {
  const game = level === 3 ? ramadanJourneyGame : deedsGame;
  const def = game.levels[level === 3 ? 0 : level - 1];
  return {
    gameId: game.id,
    level: level === 3 ? 1 : level,
    config: def.config,
    facts: def.facts,
    onComplete,
    onExit: jest.fn(),
    playSound: jest.fn(),
    haptic: jest.fn(),
    reducedMotion: true,
    challengeMode: false,
    language: 'en',
    t: (k, p) => translateNs(deedsI18n, 'en', k as never, p),
    l: (text) => text?.en ?? '',
  };
}

/** Plays one scene with the accessible controls; `wrongFirst` picks another option once. */
async function playScene(root: Node, scene: Scene, wrongFirst = false) {
  for (const step of scene.steps) {
    if (step.kind === 'choice') {
      if (wrongFirst) await press(root, step.choice.options[(step.choice.correctIndex + 1) % step.choice.options.length].text.en);
      await press(root, step.choice.options[step.choice.correctIndex].text.en);
    } else if (step.kind === 'mode') await press(root, en('mode.part'));
    else if (step.kind === 'drag') for (const art of step.items) await press(root, en('a11y.drag', { item: en(`item.${art.split('.')[1]}`) }));
    else if (step.kind === 'tap') for (let i = 0; i < step.count; i++) await press(root, en('a11y.tap', { item: en(`item.${step.item.split('.')[1]}`) }));
    else if (step.kind === 'sun') for (let i = 0; i < 4; i++) await press(root, en('play.lowerSun'));
    else await press(root, en('tracker.finish'));
  }
  expect(texts(root)).toContain(scene.card.texts[0].en);
  await press(root, en('play.continue'));
}

describe('A Day of Good Deeds – render', () => {
  it.each([
    [1, EVERYDAY],
    [2, DILEMMAS],
    [3, RAMADAN_DAY],
  ] as const)('level %i: plays the whole day and reports a result', async (level, scenes) => {
    const onComplete = jest.fn();
    let tree!: { root: Node; unmount: () => void };
    await act(async () => {
      tree = create(<GoodDeedsDayGame {...api(level, onComplete)} />);
    });
    await act(() => tree.root.findAll((n) => typeof n.props.onLayout === 'function')[0].props.onLayout({ nativeEvent: { layout: { width: 360, height: 640 } } }));
    for (const [i, scene] of scenes.entries()) {
      if (scene.id === 'taraweeh') {
        // The tracker is pre-ticked with the deeds of the day.
        await press(tree.root, en('a11y.tap', { item: en('item.lantern-ramadan') }));
        expect(texts(tree.root)).toContain('Today’s good deeds');
        expect(find(tree.root, en('a11y.deed', { deed: 'Prayed on time' }))).toBeDefined();
        await press(tree.root, en('tracker.finish'));
        expect(texts(tree.root)).toContain('for example 8 or 20');
        await press(tree.root, en('play.continue'));
        continue;
      }
      await playScene(tree.root, scene, level === 2 && i === 0);
    }
    expect(onComplete).toHaveBeenCalledTimes(1);
    const expected = level === 2
      ? { score: 95, maxScore: 100, stars: 3, mistakes: 1, factsMissed: ['sidq'] }
      : level === 3
        ? { score: 100, maxScore: 100, stars: 3, mistakes: 0, factsMissed: [] }
        : { score: 60, maxScore: 60, stars: 3, mistakes: 0, factsMissed: [] };
    expect(onComplete.mock.calls[0][0]).toEqual(expected);
    await act(() => tree.unmount());
  });
});
