import type { Language } from '@/core/models';

import { HARAKA_NAMES, HARAKAT, LETTERS, letterInfo, lookAlikes, syllable, type Haraka } from '@/features/games/sections/arabic/shared/letters';

export const SUFARA_EXERCISES_PER_LETTER = 4;
export const SUFARA_CHALLENGE_COUNT = LETTERS.length * SUFARA_EXERCISES_PER_LETTER;

export interface SufaraLetterChoice {
  letter: string;
  name: string;
  correct: boolean;
}

export interface SufaraVowelChoice {
  haraka: Haraka;
  text: string;
  correct: boolean;
}

/** Three unambiguous letters, preferring familiar dot-confusions as distractors. */
export function letterChoices(position: number, language: Language): SufaraLetterChoice[] {
  const target = LETTERS[position - 1];
  if (!target) return [];

  const candidates = [...lookAlikes(target.letter), ...LETTERS.map((item) => item.letter)];
  const distractors: typeof LETTERS[number][] = [];
  const seenNames = new Set([target.name[language]]);
  for (const candidate of candidates) {
    const item = letterInfo(candidate);
    if (!item || item.letter === target.letter || seenNames.has(item.name[language])) continue;
    distractors.push(item);
    seenNames.add(item.name[language]);
    if (distractors.length === 2) break;
  }

  const correctIndex = (position - 1) % 3;
  const choices = [...distractors];
  choices.splice(correctIndex, 0, target);
  return choices.map((item) => ({ letter: item.letter, name: item.name[language], correct: item.letter === target.letter }));
}

/** Rotates the requested vowel so all three harakat are practised for every letter. */
export function vowelChoices(letter: string, position: number): { target: Haraka; choices: SufaraVowelChoice[] } {
  const target = HARAKA_NAMES[(position - 1) % HARAKA_NAMES.length];
  return {
    target,
    choices: HARAKA_NAMES.map((haraka) => ({
      haraka,
      text: syllable(letter, haraka),
      correct: haraka === target,
    })),
  };
}

export const HARAKA_VOWEL = HARAKAT;
/** The sufara path of the Play section "Arabic / Sufara": stages and their games in learning order. */
export const SUFARA_PATH = [
  { stage: 'letters', games: ['letter-trace', 'letter-lanterns', 'alphabet-path'] },
  { stage: 'shapes', games: ['letter-dots', 'twin-letters', 'letter-forms'] },
  { stage: 'joining', games: ['non-joiners', 'join-letters'] },
  { stage: 'harakat', games: ['harakat-sounds', 'marks-workshop', 'madd-stretch'] },
  { stage: 'reading', games: ['syllable-reading', 'word-builder', 'word-memory'] },
] as const;

export type SufaraStage = (typeof SUFARA_PATH)[number]['stage'];

/** Best stars of a game over its three levels (0–9) from the persisted level progress. */
export function gameStars(levels: Partial<Record<'1' | '2' | '3', { stars: number }>> | undefined): number {
  return (['1', '2', '3'] as const).reduce((n, l) => n + (levels?.[l]?.stars ?? 0), 0);
}
