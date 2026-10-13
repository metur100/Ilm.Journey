import type { AppData, Question, TopicId } from '@/core/models';
import { seededRandom, shuffle } from '@/core/utils/random';

import type { LearnData, MasterProgress, Unit, UnitProgress } from '../models';

type UnitMap = Record<string, UnitProgress>;
type MasterMap = Partial<Record<TopicId, MasterProgress>>;

/** Master Challenge: 10 questions, at least 70% needed to pass. */
export const MASTER_QUESTIONS = 10;
export const MASTER_PASS_PERCENT = 70;

export function masterPassed(percent: number, total: number): boolean {
  return total > 0 && percent >= MASTER_PASS_PERCENT;
}

export const isUnitCompleted = (units: UnitMap, unitId: string) => units[unitId]?.completed === true;

export function completedUnitsIn(units: readonly Unit[], progress: UnitMap): number {
  return units.filter((u) => isUnitCompleted(progress, u.id)).length;
}

export function isMasterPassed(topic: TopicId, masters: MasterMap): boolean {
  return masters[topic]?.passed === true;
}

/**
 * Picks the Master Challenge questions: weak (pending review) questions first, then the rest,
 * varied per attempt but stable within one attempt. `keyOf` maps a question to its global key.
 */
export function pickMasterQuestions(
  pool: readonly Question[],
  review: AppData['review'],
  attempt: number,
  keyOf: (q: Question) => string,
): Question[] {
  const random = seededRandom(attempt * 7919 + pool.length);
  const weak = pool.filter((q) => review[keyOf(q)] && !review[keyOf(q)].mastered);
  const rest = pool.filter((q) => !weak.includes(q));
  return [...shuffle(weak, random), ...shuffle(rest, random)].slice(0, MASTER_QUESTIONS);
}

export const EMPTY_LEARN: LearnData = { units: {}, masters: {}, perfectUnits: [], lastVisited: null };
