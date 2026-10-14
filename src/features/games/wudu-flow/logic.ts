import type { KnownArtName } from '@/core/art';
import type { GameResultInput } from '@/core/games';
import { shuffle, shuffleNotIdentity } from '@/core/utils/random';

import type { WuduStepId } from './content';
import { WUDU_FACTS } from './content';
import { mistakesResult } from './kit/scoring';

export type { WuduStepId } from './content';

/** Where a step is taught: named in Quran 5:6 or taught in the Sunnah (salah-wudu unit / question salah-wudu-2). */
export type WuduSource = 'quran' | 'sunnah';

export interface WuduStep {
  id: WuduStepId;
  art: KnownArtName;
  source: WuduSource;
}

/** The common order of the content (quest question "salah-wudu-order"). */
export const WUDU_STEPS: readonly WuduStep[] = [
  { id: 'hands', art: 'body.hands', source: 'sunnah' },
  { id: 'mouth', art: 'body.mouth', source: 'sunnah' },
  { id: 'nose', art: 'body.nose', source: 'sunnah' },
  { id: 'face', art: 'body.face', source: 'quran' },
  { id: 'arms', art: 'body.arms', source: 'quran' },
  { id: 'head', art: 'body.head', source: 'quran' },
  { id: 'feet', art: 'body.feet', source: 'quran' },
];

/** The four parts named in Quran 5:6, in order. */
export const QURAN_STEPS: readonly WuduStep[] = WUDU_STEPS.filter((s) => s.source === 'quran');

/**
 * Level modes: `guided` – the four parts of 5:6, each step named; `full` – the whole common order unguided, then sort
 * the steps into "named in 5:6" / "from the Sunnah"; `repair` – put a mixed-up sequence back in order.
 */
export type WuduMode = 'guided' | 'full' | 'repair';

export interface WuduConfig {
  mode: WuduMode;
}

export function stepsFor(mode: WuduMode): readonly WuduStep[] {
  return mode === 'guided' ? QURAN_STEPS : WUDU_STEPS;
}

export function stepById(id: WuduStepId): WuduStep {
  return WUDU_STEPS.find((s) => s.id === id)!;
}

/** Is `candidate` the next step after `done` correct steps? */
export function isNextStep(sequence: readonly WuduStep[], done: number, candidate: WuduStepId): boolean {
  return sequence[done]?.id === candidate;
}

/** Is the step placed in the right basket? */
export function isRightBasket(id: WuduStepId, basket: WuduSource): boolean {
  return stepById(id).source === basket;
}

/** Board layout: the pictograms in a shuffled grid order. */
export function boardOrder(steps: readonly WuduStep[], random: () => number = Math.random): WuduStep[] {
  return shuffle(steps, random);
}

/** Level 3 start: a mixed-up sequence that is never already correct. */
export function scrambled(steps: readonly WuduStep[], random: () => number = Math.random): WuduStep[] {
  return shuffleNotIdentity(steps, random);
}

/** Indexes of the cards that are not in their correct position. */
export function misplaced(order: readonly WuduStepId[], correct: readonly WuduStepId[] = WUDU_STEPS.map((s) => s.id)): number[] {
  return order.flatMap((id, i) => (id === correct[i] ? [] : [i]));
}

export interface SequenceStats {
  /** All wrong attempts. */
  mistakes: number;
  /** Steps where the learner made at least one wrong attempt. */
  wrongSteps: number;
}

/** Level 1: the four parts of 5:6. The order fact is missed when two or more steps went wrong. */
export function guidedResult(stats: SequenceStats, bonus?: { points: number; max: number }): GameResultInput {
  const missed = stats.wrongSteps >= 2 ? [WUDU_FACTS.quranParts.id] : [];
  return mistakesResult(QURAN_STEPS.length, stats.mistakes, missed, bonus);
}

/** Level 2: the full order (7 steps) plus sorting the 7 steps into the two baskets. */
export function fullResult(sequence: SequenceStats, sortMistakes: number, bonus?: { points: number; max: number }): GameResultInput {
  const missed: string[] = [];
  if (sequence.wrongSteps >= 2) missed.push(WUDU_FACTS.commonOrder.id);
  if (sortMistakes > 0) missed.push(WUDU_FACTS.quranSunnah.id);
  return mistakesResult(WUDU_STEPS.length * 2, sequence.mistakes + sortMistakes, missed, bonus);
}

/** Level 3: each "check" with cards still out of place counts as one mistake. */
export function repairResult(failedChecks: number, bonus?: { points: number; max: number }): GameResultInput {
  return mistakesResult(WUDU_STEPS.length, failedChecks, failedChecks > 0 ? [WUDU_FACTS.commonOrder.id] : [], bonus);
}

/** Challenge-mode par time per mode (ms). */
export const PAR_MS: Record<WuduMode, number> = { guided: 25_000, full: 80_000, repair: 50_000 };

/** Every art name the game uses (checked by tests). */
export const WUDU_ART: readonly string[] = [
  ...WUDU_STEPS.map((s) => s.art),
  'body.water-on-hands',
  'ui.water-drop',
  'ui.sparkle',
  'object.basket',
  'object.book',
  'object.water-jug',
];
