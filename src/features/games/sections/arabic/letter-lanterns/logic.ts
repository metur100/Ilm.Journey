import type { CatchItem } from '@/core/games/kit';
import type { Language } from '@/core/models';
import { hashString, seededRandom, shuffle } from '@/core/utils/random';

import type { CatchRound } from '../shared/CatchRounds';
import { LETTERS, lookAlikes, mustLetter, sharesName } from '../shared/letters';
import { hasAllForms, letterForm, type LetterPosition } from '../shared/script';

/*
 * Letter Lanterns rules (pure): which letter each round asks for and which lanterns float down.
 * L1 isolated letters (name + voice) · L2 the same letter in its start / middle / end shape · L3 only the voice says
 * the letter. Distractors are look-alike letters first (they teach the dots), never a letter with the same name.
 */

export type LanternMode = 'isolated' | 'forms' | 'sound';

export interface LetterLanternsConfig {
  mode: LanternMode;
  /** Pool of letters the rounds are taken from (a block that moves on with every play). */
  pool: string[];
  rounds: number;
  hints: boolean;
}

/** `count` items of `pool`, a block that moves on with every play (wraps around). */
export function block<T>(pool: readonly T[], count: number, playIndex: number): T[] {
  const n = Math.min(count, pool.length);
  const start = (Math.max(0, Math.floor(playIndex)) * n) % pool.length;
  return Array.from({ length: n }, (_, i) => pool[(start + i) % pool.length]);
}

export function distractors(letter: string, pool: readonly string[], count: number, random: () => number): string[] {
  const alike = shuffle(lookAlikes(letter), random);
  const others = shuffle(
    pool.filter((l) => l !== letter && !alike.includes(l)),
    random,
  );
  const picked: string[] = [];
  for (const l of [...alike, ...others]) {
    if (picked.length >= count) break;
    if (!picked.includes(l) && l !== letter && !sharesName(letter, l)) picked.push(l);
  }
  return picked;
}

const FORMS: LetterPosition[] = ['initial', 'medial', 'final'];

export function buildLanternRounds(config: LetterLanternsConfig, playIndex: number, seed: string, language: Language): CatchRound[] {
  const random = seededRandom(hashString(`${seed}:${playIndex}`));
  const all = LETTERS.map((l) => l.letter);
  const pool = config.mode === 'forms' ? config.pool.filter(hasAllForms) : config.pool;
  return block(pool, config.rounds, playIndex).map((letter, r) => {
    const info = mustLetter(letter);
    const others = distractors(letter, config.mode === 'forms' ? all.filter(hasAllForms) : all, 3, random);
    const show = (l: string, i: number) => (config.mode === 'forms' ? letterForm(l, FORMS[i % FORMS.length]) : l);
    const good: CatchItem[] = [0, 1, 2].map((i) => ({ id: `r${r}-ok${i}`, arabic: show(letter, i), a11y: info.name, good: true }));
    const bad: CatchItem[] = others.map((l, i) => ({ id: `r${r}-x${mustLetter(l).position}`, arabic: show(l, i + r), a11y: mustLetter(l).name, good: false }));
    return { id: `r${r}-${info.position}`, say: letter, show: info.name[language], arabic: config.mode === 'sound' ? undefined : letter, items: shuffle([...good, ...bad], random), goal: 3 };
  });
}
