import { type Ayah, getSurah, type Surah } from '@/features/quran';

import type { GameResultInput } from '@/core/games';

/*
 * Ayah Builder rules (pure). Quran text comes only from the generated data (`@/features/quran`) and is never
 * changed: an ayah is split at its spaces, and the tiles joined with single spaces give back the exact text.
 */

export interface AyahBuilderConfig {
  /** Surah numbers of this level (ordered by the learner's memorisation, then the suggested memorisation order). */
  pool: readonly number[];
  /** Ayahs built per play (consecutive window of the surah's eligible ayahs). */
  maxAyahs: number;
  /** Only ayahs with this many tiles (L3: longer ayahs that still fit on the board). */
  minTiles?: number;
  maxTiles?: number;
}

/** An Arabic letter (same test as `ayahWords` in the Quran data). */
const ARABIC_LETTER = /[ء-يٱ-ۓ]/;

/**
 * Splits an ayah into word tiles at single spaces – nothing else. Tokens without an Arabic letter (waqf marks like
 * ۚ ۖ, the sajda sign ۩, the hizb sign ۞ that stand alone in the data) stay attached to their word, together with the
 * space between them: to the word before, or to the next word when the mark opens the ayah.
 * Invariant: `ayahTiles(text).join(' ') === text`.
 */
export function ayahTiles(text: string): string[] {
  const tiles: string[] = [];
  let leading: string | null = null;
  for (const token of text.split(' ')) {
    if (ARABIC_LETTER.test(token)) {
      tiles.push(leading === null ? token : `${leading} ${token}`);
      leading = null;
    } else if (tiles.length > 0) {
      tiles[tiles.length - 1] += ` ${token}`;
    } else {
      leading = leading === null ? token : `${leading} ${token}`;
    }
  }
  if (leading !== null) tiles.push(leading);
  return tiles;
}

/** Surahs of the pool: the ones the learner has started memorising first, then the suggested memorisation order. */
export function orderSurahs(pool: readonly number[], memorized: Readonly<Record<number, readonly number[]>>): Surah[] {
  const started = (s: Surah) => (memorized[s.number]?.some((n) => n >= 1 && n <= s.ayahCount) ? 0 : 1);
  return pool
    .map((n) => getSurah(n))
    .filter((s): s is Surah => !!s)
    .sort((a, b) => started(a) - started(b) || a.memorizationOrder - b.memorizationOrder);
}

export interface AyahRound {
  surah: number;
  ayah: Ayah;
  tiles: string[];
}

export interface AyahPlan {
  surah: Surah;
  rounds: AyahRound[];
}

function eligibleAyahs(surah: Surah, config: AyahBuilderConfig): Ayah[] {
  const min = config.minTiles ?? 1;
  const max = config.maxTiles ?? Number.POSITIVE_INFINITY;
  return surah.ayahs.filter((a) => {
    const n = ayahTiles(a.arabic).length;
    return n >= min && n <= max;
  });
}

/**
 * The surah and ayahs of one play. `playIndex` (plays of this level so far) rotates through the ordered surahs and,
 * once every surah had its turn, moves the window of ayahs on – so replays stay fresh but are deterministic.
 */
export function planAyahs(config: AyahBuilderConfig, memorized: Readonly<Record<number, readonly number[]>>, playIndex: number): AyahPlan | null {
  const surahs = orderSurahs(config.pool, memorized).filter((s) => eligibleAyahs(s, config).length > 0);
  if (surahs.length === 0) return null;
  const index = Math.max(0, Math.floor(playIndex));
  const surah = surahs[index % surahs.length];
  const eligible = eligibleAyahs(surah, config);
  const size = Math.max(1, Math.min(config.maxAyahs, eligible.length));
  const turn = Math.floor(index / surahs.length);
  const start = eligible.length <= size ? 0 : Math.min((turn * size) % eligible.length, eligible.length - size);
  return {
    surah,
    rounds: eligible.slice(start, start + size).map((ayah) => ({ surah: surah.number, ayah, tiles: ayahTiles(ayah.arabic) })),
  };
}

/** Tray order of a round's tiles (deterministic shuffle that never starts solved when that is possible). */
export function scatter(tiles: readonly string[], random: () => number): number[] {
  const order = tiles.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (order.length > 1 && order.every((v, i) => v === i)) [order[0], order[1]] = [order[1], order[0]];
  return order;
}

/** A dropped tile fits when it carries the next word of the ayah (equal words are interchangeable). */
export function fitsNext(tiles: readonly string[], placed: number, tile: string): boolean {
  return placed < tiles.length && tiles[placed] === tile;
}

/**
 * Scoring: one point per word tile; a gentle nudge (wrong tile) costs a point. Stars 3 / 2 / 1 for no nudges /
 * up to a fifth of the tiles (at least 2) / more. Facts are never "missed" here – the learner builds, not answers.
 */
export function ayahResult(totalTiles: number, mistakes: number): GameResultInput {
  const allowed = Math.max(2, Math.ceil(totalTiles / 5));
  return {
    score: Math.max(0, totalTiles - mistakes),
    maxScore: totalTiles,
    stars: mistakes === 0 ? 3 : mistakes <= allowed ? 2 : 1,
    mistakes,
    factsMissed: [],
  };
}

/** After this many nudges on the same word, the right tile glows as a hint. */
export const HINT_AFTER = 2;
