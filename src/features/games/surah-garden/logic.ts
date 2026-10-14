import type { GameResultInput } from '@/core/games';
import type { Language } from '@/core/models';
import { hashString, seededRandom, shuffle } from '@/core/utils/random';
import { getSurah, listSurahs, type Surah } from '@/features/quran';

import { ayahTiles } from '../ayah-builder/logic';

/*
 * Surah Garden rules (pure): which surahs a play uses, what their answer cards say, and when a match is right.
 * Every answer comes from the generated Quran data: the name meaning, the ayah count or the opening words of ayah 1.
 */

export type GardenMode = 'meaning' | 'ayahCount' | 'opening';

export interface SurahGardenConfig {
  mode: GardenMode;
  /** Surahs in every play of the level (the level's facts are about them). */
  anchors: readonly number[];
  /** Number of pairs (anchors + rotating surahs). */
  pairs: number;
  /** Rotating surahs are taken from the first `maxOrder` surahs of the memorisation order (default: all). */
  maxOrder?: number;
  /** Fact id → surah it is about: a wrong match with that surah sends the fact to the review centre. */
  factSurahs: Readonly<Record<string, number>>;
}

const meaningOf = (surah: Surah, lang: Language) => surah.nameMeaningLocalized?.[lang] || surah.nameMeaning;

const LANGS: readonly Language[] = ['en', 'de', 'bs'];

/** Opening words (tiles) of ayah 1 – Quran text from the data, split at spaces only. */
export function openingTiles(surah: Surah): string[] {
  return ayahTiles(surah.ayahs[0]?.arabic ?? '');
}

const isPrefix = (a: readonly string[], b: readonly string[]) => a.length <= b.length && a.every((w, i) => w === b[i]);

/** Two surahs can share a board when their answer cards can never look the same. */
export function compatible(mode: GardenMode, a: Surah, b: Surah): boolean {
  if (a.number === b.number) return false;
  if (mode === 'meaning') return LANGS.every((lang) => meaningOf(a, lang).trim().toLowerCase() !== meaningOf(b, lang).trim().toLowerCase());
  if (mode === 'ayahCount') return a.ayahCount !== b.ayahCount;
  const x = openingTiles(a);
  const y = openingTiles(b);
  return !isPrefix(x, y) && !isPrefix(y, x);
}

/**
 * The surahs of one play: the anchors first, then rotating surahs (seeded by the play) that fit next to every
 * surah already chosen – shuffled into board order.
 */
export function pickSurahs(config: SurahGardenConfig, seed: string): Surah[] {
  const chosen: Surah[] = [];
  for (const n of config.anchors) {
    const s = getSurah(n);
    if (s && chosen.every((c) => compatible(config.mode, c, s))) chosen.push(s);
  }
  const random = seededRandom(hashString(seed));
  const rest = shuffle(
    listSurahs('memorization').filter((s) => !config.anchors.includes(s.number) && s.memorizationOrder <= (config.maxOrder ?? Number.POSITIVE_INFINITY)),
    random,
  );
  for (const s of rest) {
    if (chosen.length >= config.pairs) break;
    if (chosen.every((c) => compatible(config.mode, c, s))) chosen.push(s);
  }
  return shuffle(chosen, random);
}

/** Shortest opening (≥ 2 words) that tells every chosen surah apart; shorter ayahs are shown whole. */
export function openingLength(surahs: readonly Surah[]): number {
  const all = surahs.map(openingTiles);
  const longest = Math.max(2, ...all.map((t) => t.length));
  for (let k = 2; k <= longest; k++) {
    const keys = all.map((t) => t.slice(0, k).join(' '));
    if (new Set(keys).size === keys.length) return k;
  }
  return longest;
}

export interface OpeningText {
  text: string;
  /** True when the ayah continues after the shown words. */
  more: boolean;
}

export function openingText(surah: Surah, length: number): OpeningText {
  const tiles = openingTiles(surah);
  return { text: tiles.slice(0, length).join(' '), more: tiles.length > length };
}

/** A name card matches the answer card of the same surah. */
export function isMatch(nameSurah: number, answerSurah: number): boolean {
  return nameSurah === answerSurah;
}

/** Facts to review: those about a surah that was involved in a wrong match (as the card or as the target). */
export function missedFacts(factSurahs: Readonly<Record<string, number>>, wrongSurahs: ReadonlySet<number>): string[] {
  return Object.entries(factSurahs)
    .filter(([, surah]) => wrongSurahs.has(surah))
    .map(([id]) => id);
}

/** Two points per pair, one off per wrong match; stars 3 / 2 / 1 for 0 / ≤ 2 / more wrong matches. */
export function gardenResult(pairs: number, mistakes: number, factsMissed: string[]): GameResultInput {
  return {
    score: Math.max(0, pairs * 2 - mistakes),
    maxScore: pairs * 2,
    stars: mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1,
    mistakes,
    factsMissed,
  };
}

/** Flowers that grow for the matched pairs, in order. */
export const FLOWERS = ['garden.flower-rose', 'garden.flower-tulip', 'garden.flower-jasmine', 'garden.flower-lily'] as const;

export const flowerFor = (index: number) => FLOWERS[index % FLOWERS.length];
