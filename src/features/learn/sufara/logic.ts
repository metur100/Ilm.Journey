import type { Language } from '@/core/models';

import { HARAKA_NAMES, HARAKAT, LETTERS, letterInfo, lookAlikes, type Haraka } from '@/features/games/letter-lanterns/letters';
import { syllable } from '@/features/games/letter-lanterns/logic';

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