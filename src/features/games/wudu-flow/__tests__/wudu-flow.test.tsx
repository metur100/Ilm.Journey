import type React from 'react';

import { hasArt } from '@/core/art';
import { findFact, getGame, validateGame, type GameResultInput } from '@/core/games';
import { getQuestionByKey } from '@/core/registry';
import { registerLearnFeature } from '@/features/learn/register';

import { STEP_TEXT, WUDU_DIFFERENCE_NOTE, WUDU_FACTS } from '../content';
import { challengeBonus, hitTest, moveItem, starsForMistakes } from '../kit';
import { fakeGameApi, namespaceProblems } from '../kit/testApi';
import {
  fullResult,
  guidedResult,
  isNextStep,
  isRightBasket,
  misplaced,
  QURAN_STEPS,
  repairResult,
  scrambled,
  stepsFor,
  WUDU_ART,
  WUDU_STEPS,
} from '../logic';
import { registerWuduFlowGame, wuduFlowGame } from '../register';
import { WuduFlowGame } from '../WuduFlowGame';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

const questsSalah = require('@/features/learn/content/quests/salah.json');
const unitWudu = require('@/features/learn/content/salah/salah-wudu.json');

// Only the Learn feature (review-key targets) and this game – independent of the other games in the tree.
registerLearnFeature();
registerWuduFlowGame();

interface Node {
  type: unknown;
  props: Record<string, any>;
  findAll: (predicate: (node: Node) => boolean) => Node[];
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act, create } = require('react-test-renderer') as {
  act: (callback: () => Promise<unknown>) => Promise<void>;
  create: (element: React.ReactElement) => { root: Node; unmount: () => void };
};
const button = (root: Node, label: string | RegExp) =>
  root.findAll((n) => typeof n.props.onPress === 'function' && (typeof label === 'string' ? n.props.accessibilityLabel === label : label.test(String(n.props.accessibilityLabel ?? ''))))[0];
const press = async (root: Node, label: string | RegExp) => {
  const node = button(root, label);
  if (!node) throw new Error(`control not found: ${label}`);
  await act(async () => node.props.onPress());
};
const texts = (root: Node) =>
  root
    .findAll((n) => typeof n.props.children === 'string')
    .map((n) => n.props.children as string)
    .join(' | ');

async function render(level: 1 | 2 | 3) {
  const { api, results } = fakeGameApi(wuduFlowGame, level);
  let tree!: { root: Node; unmount: () => void };
  await act(async () => {
    tree = create(<WuduFlowGame {...api} />);
  });
  return { root: tree.root, results, unmount: () => act(async () => tree.unmount()) };
}

describe('Wudu Flow – registration', () => {
  it('registers a valid game with 3 levels and sourced facts', () => {
    const game = getGame('wudu-flow');
    expect(game).toBeDefined();
    expect(() => validateGame(game!)).not.toThrow();
    expect(game!.levels).toHaveLength(3);
    for (const level of game!.levels) for (const fact of level.facts) expect(fact.sources.length).toBeGreaterThan(0);
  });

  it('has a complete i18n namespace in en/de/bs', () => {
    expect(namespaceProblems(wuduFlowGame as never)).toEqual([]);
  });

  it('uses only existing art', () => {
    for (const name of [...WUDU_ART, wuduFlowGame.coverArt, wuduFlowGame.hintArt!]) expect(hasArt(name)).toBe(true);
    for (const level of wuduFlowGame.levels) for (const fact of level.facts) if (fact.art) expect(hasArt(fact.art)).toBe(true);
  });

  it('copies facts and sources from the Salah content', () => {
    const lesson = questsSalah.lessons.find((l: { id: string }) => l.id === 'salah-wudu');
    expect(WUDU_FACTS.quranParts.text).toEqual(lesson.sections[0].body);
    expect(WUDU_FACTS.beforeSalah.text).toEqual(lesson.summary);
    expect(WUDU_DIFFERENCE_NOTE).toEqual(lesson.differenceNote);
    expect(lesson.sources).toEqual([{ sourceName: 'Quran', sourceReference: '5:6' }]);
    const order = questsSalah.questions.find((q: { id: string }) => q.id === 'salah-wudu-order');
    expect(WUDU_FACTS.commonOrder.text).toEqual(order.explanation);
    expect(order.items.map((i: { id: string }) => i.id)).toEqual(WUDU_STEPS.map((s) => s.id));
    for (const item of order.items) expect(STEP_TEXT[item.id as keyof typeof STEP_TEXT]).toEqual(item.text);
    expect(WUDU_FACTS.quranSunnah.text).toEqual(unitWudu.lesson[0].body);
    const surah = questsSalah.questions.find((q: { id: string }) => q.id === 'salah-wudu-surah');
    expect(WUDU_FACTS.quranParts.check.prompt).toEqual(surah.prompt);
    expect(WUDU_FACTS.quranParts.check.options).toEqual(surah.options.map((o: { text: unknown }) => o.text));
  });

  it('review keys point to existing questions', () => {
    for (const level of wuduFlowGame.levels) for (const fact of level.facts) if (fact.reviewKey) expect(getQuestionByKey(fact.reviewKey)).toBeDefined();
  });

  it('only reports facts of this game as missed', () => {
    const results = [guidedResult({ mistakes: 3, wrongSteps: 2 }), fullResult({ mistakes: 2, wrongSteps: 2 }, 1), repairResult(2)];
    for (const r of results) for (const id of r.factsMissed) expect(findFact(getGame('wudu-flow')!, id)).toBeDefined();
  });
});

describe('Wudu Flow – rules', () => {
  it('follows the order of the content and the four parts of 5:6', () => {
    expect(WUDU_STEPS.map((s) => s.id)).toEqual(['hands', 'mouth', 'nose', 'face', 'arms', 'head', 'feet']);
    expect(QURAN_STEPS.map((s) => s.id)).toEqual(['face', 'arms', 'head', 'feet']);
    expect(stepsFor('guided')).toBe(QURAN_STEPS);
    expect(stepsFor('full')).toBe(WUDU_STEPS);
  });

  it('validates the next step', () => {
    expect(isNextStep(QURAN_STEPS, 0, 'face')).toBe(true);
    expect(isNextStep(QURAN_STEPS, 0, 'arms')).toBe(false);
    expect(isNextStep(WUDU_STEPS, 3, 'face')).toBe(true);
    expect(isNextStep(WUDU_STEPS, 7, 'feet')).toBe(false);
  });

  it('sorts steps into "named in 5:6" and "from the Sunnah"', () => {
    for (const id of ['face', 'arms', 'head', 'feet'] as const) expect(isRightBasket(id, 'quran')).toBe(true);
    for (const id of ['hands', 'mouth', 'nose'] as const) expect(isRightBasket(id, 'sunnah')).toBe(true);
    expect(isRightBasket('mouth', 'quran')).toBe(false);
    // The unit question salah-wudu-2 agrees.
    const question = unitWudu.questions.find((q: { id: string }) => q.id === 'salah-wudu-2');
    for (const item of question.items) expect(isRightBasket(item.id, item.categoryId)).toBe(true);
  });

  it('finds misplaced cards and never starts level 3 solved', () => {
    expect(misplaced(WUDU_STEPS.map((s) => s.id))).toEqual([]);
    expect(misplaced(['mouth', 'hands', 'nose', 'face', 'arms', 'head', 'feet'])).toEqual([0, 1]);
    for (let i = 0; i < 30; i++) expect(misplaced(scrambled(WUDU_STEPS).map((s) => s.id)).length).toBeGreaterThan(0);
  });

  it('scores levels and maps mistakes to stars', () => {
    expect(guidedResult({ mistakes: 0, wrongSteps: 0 })).toEqual({ score: 40, maxScore: 40, stars: 3, mistakes: 0, factsMissed: [] });
    expect(guidedResult({ mistakes: 2, wrongSteps: 1 })).toMatchObject({ score: 30, stars: 2, factsMissed: [] });
    expect(guidedResult({ mistakes: 3, wrongSteps: 2 })).toMatchObject({ stars: 1, factsMissed: ['wudu-quran-parts'] });
    expect(fullResult({ mistakes: 0, wrongSteps: 0 }, 1)).toMatchObject({ maxScore: 140, score: 135, stars: 2, factsMissed: ['wudu-quran-sunnah'] });
    expect(repairResult(0)).toMatchObject({ stars: 3, factsMissed: [] });
    expect(repairResult(1)).toMatchObject({ stars: 2, factsMissed: ['wudu-common-order'] });
    expect(starsForMistakes(5)).toBe(1);
    expect(guidedResult({ mistakes: 0, wrongSteps: 0 }, { points: 10, max: 10 })).toMatchObject({ score: 50, maxScore: 50 });
  });

  it('kit helpers: challenge bonus, hit test, move', () => {
    expect(challengeBonus(10_000, 20_000)).toBe(10);
    expect(challengeBonus(30_000, 20_000)).toBe(5);
    expect(challengeBonus(50_000, 20_000)).toBe(0);
    expect(hitTest([{ x: 0, y: 0, w: 10, h: 10 }, null, { x: 20, y: 0, w: 10, h: 10 }], 25, 5)).toBe(2);
    expect(hitTest([{ x: 0, y: 0, w: 10, h: 10 }], 50, 50)).toBe(-1);
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
  });
});

describe('Wudu Flow – play', () => {
  it('level 1: water to the four parts in order (one slip)', async () => {
    const { root, results, unmount } = await render(1);
    expect(texts(root)).toContain('Step 1 of 4: Wash the face');
    await press(root, 'Wash the arms to the elbows'); // wrong first
    expect(texts(root)).toContain('Not yet');
    for (const id of ['face', 'arms', 'head', 'feet'] as const) await press(root, STEP_TEXT[id].en);
    expect(texts(root)).toContain('All steps done');
    await press(root, 'Finish');
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject<Partial<GameResultInput>>({ stars: 2, mistakes: 1, maxScore: 40, factsMissed: [] });
    await unmount();
  });

  it('level 2: full order, then sort into the two baskets', async () => {
    const { root, results, unmount } = await render(2);
    for (const s of WUDU_STEPS) await press(root, STEP_TEXT[s.id].en);
    expect(texts(root)).toContain('Now sort the steps');
    for (const s of WUDU_STEPS) {
      await press(root, STEP_TEXT[s.id].en); // select card
      await press(root, s.source === 'quran' ? /^Named in 5:6/ : /^From the Sunnah/);
    }
    expect(texts(root)).toContain('Scholars differ'.toUpperCase());
    await press(root, 'Finish');
    expect(results[0]).toMatchObject({ stars: 3, mistakes: 0, score: 140, maxScore: 140 });
    await unmount();
  });

  it('level 3: repair the mixed-up order with the arrow buttons', async () => {
    const { root, results, unmount } = await render(3);
    await press(root, 'Check the order'); // one failed check (never starts solved)
    const position = () =>
      root
        .findAll((n) => typeof n.type === 'string' && typeof n.props.accessibilityLabel === 'string' && / position \d of 7$/.test(n.props.accessibilityLabel))
        .map((n) => String(n.props.accessibilityLabel).replace(/, position \d of 7$/, ''));
    for (let target = 0; target < WUDU_STEPS.length; target++) {
      const label = STEP_TEXT[WUDU_STEPS[target].id].en;
      let at = position().indexOf(label);
      while (at > target) {
        await press(root, `Move “${label}” up`);
        at = position().indexOf(label);
      }
    }
    expect(position()).toEqual(WUDU_STEPS.map((s) => STEP_TEXT[s.id].en));
    await press(root, 'Check the order');
    expect(texts(root)).toContain('Everything is in order!');
    await press(root, 'Finish');
    expect(results[0]).toMatchObject({ stars: 2, mistakes: 1, factsMissed: ['wudu-common-order'] });
    await unmount();
  });
});
