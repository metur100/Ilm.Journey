import type { DayKey, Question } from '../models';
import { dayNumber } from '../utils/date';
import { seededRandom, shuffle } from '../utils/random';

export type DailyKind = 'question' | 'scenario' | 'miniGame' | 'memory' | 'review';

export const DAILY_ROTATION: readonly DailyKind[] = ['question', 'scenario', 'miniGame', 'memory', 'review'];

/** A question a feature offers for the daily challenge (see `registerDailyPool`). */
export interface DailyCandidate {
  /** Global question key. */
  key: string;
  question: Question;
}

export interface DailyChallenge {
  day: DayKey;
  kind: DailyKind;
  /** Global question keys. */
  keys: string[];
}

const QUICK = new Set<Question['type']>(['multipleChoice', 'trueFalse', 'fillBlank', 'imageChoice', 'lessonChoice']);
const GAMES = new Set<Question['type']>(['ordering', 'matching', 'categorize', 'find']);

/**
 * One challenge per calendar day from the questions of every feature. "Review" days use questions
 * the learner struggled with when there are any; every kind falls back to a quick question.
 * The pool is sorted by key first, so the result does not depend on registration order.
 */
export function dailyChallengeFor(day: DayKey, candidates: readonly DailyCandidate[], reviewKeys: readonly string[]): DailyChallenge {
  const pool = [...candidates].sort((a, b) => a.key.localeCompare(b.key));
  const n = dayNumber(day);
  const random = seededRandom(n * 104729 + 13);
  const kind = DAILY_ROTATION[((n % DAILY_ROTATION.length) + DAILY_ROTATION.length) % DAILY_ROTATION.length];
  if (pool.length === 0) return { day, kind, keys: [] };

  const pick = (items: readonly DailyCandidate[]) => items[Math.floor(random() * items.length)];
  const byType = (types: Set<Question['type']>) => pool.filter((c) => types.has(c.question.type));
  const quick = byType(QUICK);
  const fallback = quick.length > 0 ? quick : pool;

  if (kind === 'review') {
    const known = new Set(pool.map((c) => c.key));
    const pending = shuffle([...reviewKeys].sort(), random).filter((key) => known.has(key));
    if (pending.length > 0) return { day, kind, keys: pending.slice(0, 3) };
  }
  if (kind === 'scenario' && byType(new Set(['scenario'])).length) return { day, kind, keys: [pick(byType(new Set(['scenario']))).key] };
  if (kind === 'miniGame' && byType(GAMES).length) return { day, kind, keys: [pick(byType(GAMES)).key] };
  if (kind === 'memory' && byType(new Set(['memory'])).length) return { day, kind, keys: [pick(byType(new Set(['memory']))).key] };
  return { day, kind: 'question', keys: [pick(fallback).key] };
}
