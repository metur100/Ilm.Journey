import type { GameResultInput } from '@/core/games';

/**
 * Shared scoring rules of the Salah games (Wudu Flow, Prayer Sky, Find the Qibla). Pure – unit-tested.
 * There is no failed level: stars are always 1–3.
 */

/** 3 stars without mistakes, 2 stars for one or two, 1 star otherwise. */
export function starsForMistakes(mistakes: number): number {
  if (mistakes <= 0) return 3;
  if (mistakes <= 2) return 2;
  return 1;
}

/** 10 points per item, −5 per mistake (never below 0). */
export function scoreForMistakes(items: number, mistakes: number, perItem = 10, penalty = 5): { score: number; maxScore: number } {
  const maxScore = items * perItem;
  return { score: Math.max(0, maxScore - mistakes * penalty), maxScore };
}

/** Standard result: items done with some mistakes; optional challenge bonus (already included in maxScore). */
export function mistakesResult(items: number, mistakes: number, factsMissed: string[], bonus?: { points: number; max: number }): GameResultInput {
  const base = scoreForMistakes(items, mistakes);
  return {
    score: base.score + (bonus?.points ?? 0),
    maxScore: base.maxScore + (bonus?.max ?? 0),
    stars: starsForMistakes(mistakes),
    mistakes,
    factsMissed: [...new Set(factsMissed)],
  };
}

/** Challenge mode (opt-in): up to `max` bonus points when finished within the par time, fading out until 2 × par. */
export function challengeBonus(elapsedMs: number, parMs: number, max = 10): number {
  if (elapsedMs <= parMs) return max;
  if (elapsedMs >= parMs * 2) return 0;
  return Math.round(max * (1 - (elapsedMs - parMs) / parMs));
}

/** Formats milliseconds as m:ss. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
