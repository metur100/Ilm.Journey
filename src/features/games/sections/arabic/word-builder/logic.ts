import type { KitItem } from '@/core/games/kit';

import { letterInfo, lookAlikes } from '../shared/letters';
import { splitLetters } from '../shared/script';
import { getWord, type GameWord } from '../shared/words';

/*
 * Word Builder rules (pure): the words of a play (anchors first, then a block of the pool that moves on with every
 * play) and the letter tiles of a word (with its harakat), plus look-alike distractors for the hard level.
 */

export interface WordBuilderConfig {
  /** Words always asked first (their facts are on the result screen). */
  anchors: string[];
  /** Further words, rotated between plays. */
  pool: string[];
  words: number;
  hints: boolean;
  /** Add look-alike letters (dots) to the tray. */
  distractors: boolean;
}

export function pickWords(config: WordBuilderConfig, playIndex: number): GameWord[] {
  const rest = config.pool.filter((id) => !config.anchors.includes(id));
  const n = Math.max(0, config.words - config.anchors.length);
  const start = rest.length ? (Math.max(0, playIndex) * n) % rest.length : 0;
  const picked = Array.from({ length: Math.min(n, rest.length) }, (_, i) => rest[(start + i) % rest.length]);
  return [...config.anchors, ...picked].map(getWord);
}

export function wordTiles(word: GameWord, withDistractors: boolean): { target: KitItem[]; distractors: KitItem[] } {
  const letters = splitLetters(word.arabic);
  const target = letters.map((l, i) => ({ id: `${word.id}-${i}`, arabic: l.text, a11y: letterInfo(l.base)?.name ?? l.text }));
  if (!withDistractors) return { target, distractors: [] };
  const bases = letters.map((l) => l.base);
  const extra: string[] = [];
  for (const l of letters) {
    for (const alike of lookAlikes(l.base)) if (!bases.includes(alike) && !extra.includes(alike) && extra.length < 2) extra.push(alike);
  }
  return { target, distractors: extra.map((l, i) => ({ id: `${word.id}-x${i}`, arabic: l, a11y: letterInfo(l)?.name ?? l })) };
}
