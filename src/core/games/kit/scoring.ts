import { hashString, seededRandom, shuffle } from '../../utils/random';
import type { GameResultInput } from '../types';

/**
 * Standard star rule of the kit: 3 stars without mistakes, 2 stars with a few (≤ max(1, 25 % of the moves)),
 * otherwise 1 star. There is no failed level.
 */
export function kitStars(mistakes: number, moves: number): 1 | 2 | 3 {
  if (mistakes <= 0) return 3;
  return mistakes <= Math.max(1, Math.round(moves * 0.25)) ? 2 : 1;
}

export interface KitResultInput {
  /** Number of moves / items of the level (the score is 10 per move). */
  moves: number;
  mistakes: number;
  /** Fact ids the learner got wrong (→ review items). */
  factsMissed?: string[];
}

/** Builds the GameResultInput of a level from moves and mistakes (10 points per move, −3 per mistake). */
export function kitResult({ moves, mistakes, factsMissed = [] }: KitResultInput): GameResultInput {
  const maxScore = Math.max(1, moves) * 10;
  return {
    score: Math.max(0, maxScore - mistakes * 3),
    maxScore,
    stars: kitStars(mistakes, moves),
    mistakes,
    factsMissed: [...new Set(factsMissed)],
  };
}

/** Deterministic shuffle (the same seed gives the same order) that never returns the solved order (n ≥ 2). */
export function kitShuffle<T>(items: readonly T[], seed: string): T[] {
  if (items.length < 2) return [...items];
  const random = seededRandom(hashString(seed));
  for (let attempt = 0; attempt < 8; attempt++) {
    const out = shuffle(items, random);
    if (out.some((item, i) => item !== items[i])) return out;
  }
  return [...items.slice(1), items[0]];
}

/** mm:ss of a duration in milliseconds. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
