import type { GameResultInput } from '@/core/games';
import { hashString, seededRandom, shuffle } from '@/core/utils/random';

import { DOTS_GROUP, LETTERS, lookAlikes } from '../letter-lanterns/letters';
import { type ScriptLetter, splitLetters } from '../letter-lanterns/script';
import { type GameWord, getWord, WORDS } from './words';

/*
 * Word Builder rules (pure). L1/L2: place the letters of a word into its slots from right to left (the next slot
 * accepts a tile with the same letter). L3: the word is complete except one letter – pick it among look-alikes.
 */

export type WordMode = 'build' | 'missing';

export type WordFactRule = { factId: string; rule: 'manyMistakes' } | { factId: string; rule: 'wordMistakes'; word: string } | { factId: string; rule: 'dotsConfusion' };

export interface WordBuilderConfig {
  mode: WordMode;
  /** Words per play. */
  words: number;
  minLetters: number;
  maxLetters: number;
  /** Words in every play (the level's facts are about them). */
  anchors: readonly string[];
  /** L1: faint letter shapes in the slots from the start; otherwise they appear after two mistakes on a slot. */
  ghosts: boolean;
  /** Options shown for the missing letter (L3). */
  options?: number;
  factRules: readonly WordFactRule[];
}

export interface WordTile {
  /** Index of the letter in the word. */
  index: number;
  base: string;
}

export interface WordMistake {
  word: string;
  expected: string;
  chosen: string;
}

/** Letters of a word (base letter + marks). */
export const wordLetters = (word: GameWord): ScriptLetter[] => splitLetters(word.arabic);

/** Words of one play: anchors first, then rotating words (seeded) with the right length; played in a seeded order. */
export function pickWords(config: WordBuilderConfig, playIndex: number, seed: string): GameWord[] {
  const random = seededRandom(hashString(`${seed}:${playIndex}`));
  const fits = (w: GameWord) => {
    const n = wordLetters(w).length;
    if (n < config.minLetters || n > config.maxLetters) return false;
    return config.mode !== 'missing' || missingIndex(w) !== null;
  };
  const anchors = config.anchors.map(getWord).filter((w): w is GameWord => !!w && fits(w));
  const rest = shuffle(
    WORDS.filter((w) => fits(w) && !anchors.includes(w)),
    random,
  );
  const picked = [...anchors, ...rest].slice(0, config.words);
  return shuffle(picked, random);
}

/** Tray order of a word's letter tiles (never already in order when that is possible). */
export function wordTiles(word: GameWord, random: () => number): WordTile[] {
  const tiles = wordLetters(word).map((l, index) => ({ index, base: l.base }));
  for (let attempt = 0; attempt < 8; attempt++) {
    const order = shuffle(tiles, random);
    if (order.length < 2 || order.some((t, i) => t.base !== tiles[i].base)) return order;
  }
  return [...tiles].reverse();
}

/** The next slot (right to left = word order) accepts any tile with the same base letter (equal letters are interchangeable). */
export function fitsSlot(word: GameWord, slot: number, base: string): boolean {
  const letters = wordLetters(word);
  return slot >= 0 && slot < letters.length && letters[slot].base === base;
}

/** The letter hidden in L3: the first letter that has look-alikes (so the choice teaches the dots), else null. */
export function missingIndex(word: GameWord): number | null {
  const letters = wordLetters(word);
  const index = letters.findIndex((l) => lookAlikes(l.base).length > 0);
  return index >= 0 ? index : null;
}

/** Options for the missing letter: the letter, its look-alikes, then other letters – `count` in a seeded order. */
export function missingOptions(word: GameWord, count: number, random: () => number): string[] {
  const index = missingIndex(word);
  if (index === null) return [];
  const answer = wordLetters(word)[index].base;
  const alike = shuffle(lookAlikes(answer), random);
  const others = shuffle(
    LETTERS.map((l) => l.letter).filter((l) => l !== answer && !alike.includes(l)),
    random,
  );
  return shuffle([answer, ...[...alike, ...others].slice(0, Math.max(1, count - 1))], random);
}

/** Facts the learner really got wrong in this play. */
export function wordMissedFacts(rules: readonly WordFactRule[], mistakes: readonly WordMistake[]): string[] {
  return rules
    .filter((rule) => {
      if (rule.rule === 'manyMistakes') return mistakes.length >= 3;
      if (rule.rule === 'wordMistakes') return mistakes.filter((m) => m.word === rule.word).length >= 2;
      return mistakes.some((m) => DOTS_GROUP.includes(m.expected) && DOTS_GROUP.includes(m.chosen));
    })
    .map((r) => r.factId);
}

/** One point per placed letter (L3: per word), one off per mistake; stars 3 / 2 / 1 for 0 / ≤ 2 / more mistakes. */
export function wordResult(points: number, mistakes: readonly WordMistake[], rules: readonly WordFactRule[]): GameResultInput {
  const n = mistakes.length;
  return {
    score: Math.max(0, points - n),
    maxScore: points,
    stars: n === 0 ? 3 : n <= 2 ? 2 : 1,
    mistakes: n,
    factsMissed: wordMissedFacts(rules, mistakes),
  };
}
