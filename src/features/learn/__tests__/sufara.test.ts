import { LANGUAGES } from '@/core/models';

import { HARAKA_NAMES, LETTERS } from '@/features/games/sections/arabic/shared/letters';
import { HARAKA_VOWEL, letterChoices, SUFARA_CHALLENGE_COUNT, SUFARA_EXERCISES_PER_LETTER, vowelChoices } from '../sufara/logic';

describe('Sufara practice', () => {
  it('covers every Arabic letter with four exercises', () => {
    expect(LETTERS).toHaveLength(28);
    expect(SUFARA_EXERCISES_PER_LETTER).toBe(4);
    expect(SUFARA_CHALLENGE_COUNT).toBe(112);
  });

  it.each(LANGUAGES)('offers three distinct, unambiguous letter choices in %s', (language) => {
    for (const letter of LETTERS) {
      const choices = letterChoices(letter.position, language);
      expect(choices).toHaveLength(3);
      expect(choices.filter((choice) => choice.correct).map((choice) => choice.letter)).toEqual([letter.letter]);
      expect(new Set(choices.map((choice) => choice.letter)).size).toBe(3);
      expect(new Set(choices.map((choice) => choice.name)).size).toBe(3);
    }
  });

  it('practises fatha, kasra and damma for every letter with exactly one matching syllable', () => {
    for (const letter of LETTERS) {
      const seen = HARAKA_NAMES.map((_, index) => vowelChoices(letter.letter, index + 1));
      expect(seen.map((exercise) => exercise.target)).toEqual(HARAKA_NAMES);
      for (const exercise of seen) {
        expect(exercise.choices.filter((choice) => choice.correct)).toHaveLength(1);
        const correct = exercise.choices.find((choice) => choice.correct)!;
        expect(correct.text).toBe(`${letter.letter}${HARAKA_VOWEL[exercise.target].mark}`);
      }
    }
  });
});