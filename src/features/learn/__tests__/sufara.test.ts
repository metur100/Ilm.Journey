import { LANGUAGES } from '@/core/models';
import { HARAKAT, LETTERS, NON_JOINERS, SHADDA, SUKUN } from '@/features/games/sections/arabic/shared/letters';
import { splitLetters } from '@/features/games/sections/arabic/shared/script';

import { lessonDescription, lessonExplanation, lessonTitle, SUFARA_COPY } from '../sufara/copy';
import { COURSE_LETTERS, courseLetter, getSufaraLesson, LAM_ELIF, lessonExercises, lettersBefore, markExamples, READING_WORDS, SUFARA_LESSONS } from '../sufara/course';
import { sufaraPathItems } from '../sufara/register';

/** The order of the Bosnian sufara: elif, be, te, se, džim, ha, hı, dal, zel, ra, ze, sin, šin, sad, dad, tı, zı, ajn, gajn, fe, kaf, kef, lam, mim, nun, vav, he, lam-elif, je. */
const SUFARA_ORDER = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'و', 'ه', 'لا', 'ي'];

const letterLessons = SUFARA_LESSONS.filter((l) => l.kind === 'letters');

describe('Sufara course', () => {
  it('teaches the letters one or two per lesson in the order of the Bosnian sufara', () => {
    expect(COURSE_LETTERS).toEqual(SUFARA_ORDER);
    expect(letterLessons[0].letters).toEqual(['ا']);
    expect(letterLessons[1].letters).toEqual(['ب']);
    for (const lesson of letterLessons) expect(lesson.letters.length).toBeGreaterThanOrEqual(1);
    for (const lesson of letterLessons) expect(lesson.letters.length).toBeLessThanOrEqual(2);
    for (const letter of LETTERS) expect(COURSE_LETTERS).toContain(letter.letter);
  });

  it('starts with elif and the vowels e / i / u, then the other letters and the marks', () => {
    const kinds = SUFARA_LESSONS.map((l) => l.kind);
    expect(kinds.slice(0, 4)).toEqual(['letters', 'fatha', 'kasra', 'damma']);
    expect(kinds.slice(4, 4 + letterLessons.length - 1)).toEqual(Array(letterLessons.length - 1).fill('letters'));
    expect(kinds.slice(4 + letterLessons.length - 1)).toEqual(['sukun', 'tanwin', 'madd', 'shadda']);
    expect(SUFARA_LESSONS.map((l) => l.number)).toEqual(SUFARA_LESSONS.map((_, i) => i + 1));
    expect(new Set(SUFARA_LESSONS.map((l) => l.id)).size).toBe(SUFARA_LESSONS.length);
    expect(getSufaraLesson('sufara-01')?.letters).toEqual(['ا']);
    expect(getSufaraLesson('nope')).toBeUndefined();
  });

  it.each(LANGUAGES)('names every letter and lesson in %s', (language) => {
    for (const letter of COURSE_LETTERS) {
      expect(courseLetter(letter).name[language].length).toBeGreaterThan(0);
      expect(courseLetter(letter).line[language].length).toBeGreaterThan(0);
    }
    expect(courseLetter(LAM_ELIF).name.bs).toBe('Lam-elif');
    for (const lesson of SUFARA_LESSONS) {
      expect(lessonTitle(lesson)[language]).toContain(String(lesson.number));
      expect(lessonDescription(lesson)[language].length).toBeGreaterThan(0);
      if (lesson.kind !== 'letters') expect(lessonExplanation(lesson, language)?.text.length).toBeGreaterThan(0);
    }
    expect(lessonTitle(letterLessons[2]).bs).toBe('6. lekcija: Te i Se');
  });

  it.each(LANGUAGES)('builds valid, deterministic practice for every lesson in %s', (language) => {
    for (const lesson of SUFARA_LESSONS) {
      const exercises = lessonExercises(lesson, language);
      expect(exercises).toEqual(lessonExercises(lesson, language));
      expect(exercises.length).toBeGreaterThanOrEqual(lesson.number <= 2 ? 2 : 4);
      for (const ex of exercises) {
        expect(ex.choices.length).toBeGreaterThanOrEqual(2);
        expect(ex.choices.length).toBeLessThanOrEqual(3);
        expect(new Set(ex.choices.map((c) => c.text)).size).toBe(ex.choices.length);
        expect(ex.choices[ex.answer]).toBeDefined();
        expect(ex.say.length).toBeGreaterThan(0);
        expect(SUFARA_COPY[language].prompt[ex.kind](ex.params).length).toBeGreaterThan(0);
        if (ex.kind === 'findLetter') expect(ex.choices[ex.answer].text).toBe(ex.say);
        if (ex.kind === 'nameLetter') expect(ex.choices[ex.answer].text).toBe(courseLetter(ex.show!).name[language]);
        if (ex.kind === 'read') expect(ex.show).toBe(ex.say);
        if (ex.kind === 'findShadda') expect(ex.choices[ex.answer].text).toContain(SHADDA);
        if (ex.kind === 'nonJoiner') {
          expect(NON_JOINERS).toContain(ex.choices[ex.answer].text);
          expect(ex.choices.filter((c) => NON_JOINERS.includes(c.text))).toHaveLength(1);
        }
      }
    }
  });

  it('practises only letters that were taught, and the review of earlier letters grows', () => {
    let lastReview = 0;
    for (const lesson of letterLessons) {
      const exercises = lessonExercises(lesson, 'bs');
      const fresh = exercises.filter((e) => !e.review);
      const review = exercises.filter((e) => e.review);
      expect(fresh).toHaveLength(lesson.letters.length * 2);
      for (const e of fresh) expect(lesson.letters).toContain(e.say);
      // Review questions ask only about letters of earlier lessons – and always about the previous lesson.
      const earlier = lettersBefore(lesson);
      const letterReview = review.filter((e) => e.kind === 'findLetter' || e.kind === 'nameLetter');
      for (const e of letterReview) expect(earlier).toContain(e.say);
      const previous = SUFARA_LESSONS[lesson.number - 2]?.letters ?? [];
      for (const letter of previous) expect(letterReview.map((e) => e.say)).toContain(letter);
      if (earlier.length) expect(review.length).toBeGreaterThan(0);
      lastReview = Math.max(lastReview, review.length);
      // Choices of the later lessons come from the letters learned so far (the first lesson falls back to the alphabet).
      if (earlier.length >= 2) for (const e of exercises.filter((x) => x.kind === 'findLetter')) for (const c of e.choices) expect([...earlier, ...lesson.letters]).toContain(c.text);
    }
    expect(lessonExercises(letterLessons[0], 'bs').some((e) => e.review)).toBe(false);
    expect(lastReview).toBeGreaterThanOrEqual(5);
  });

  it('reads the harakat with the vowels of each language (bs fetha as "e")', () => {
    const fatha = SUFARA_LESSONS.find((l) => l.kind === 'fatha')!;
    const read = lessonExercises(fatha, 'bs').filter((e) => e.kind === 'read');
    expect(read.length).toBeGreaterThan(0);
    for (const e of read) {
      expect(e.show!.endsWith(HARAKAT.fatha.mark)).toBe(true);
      expect(e.choices[e.answer].text.endsWith('e')).toBe(true);
    }
    expect(markExamples('fatha', 'en')[0]).toEqual({ text: 'اَ', reading: 'a' });
    expect(markExamples('kasra', 'bs')[0]).toEqual({ text: 'اِ', reading: 'i' });
    expect(markExamples('sukun', 'bs')[0]).toEqual({ text: `بَل${SUKUN}`, reading: 'bel' });
    expect(markExamples('shadda', 'en')[0].reading).toBe('barra');
    // Later mark lessons repeat the earlier ones.
    const damma = SUFARA_LESSONS.find((l) => l.kind === 'damma')!;
    expect(lessonExercises(damma, 'en').some((e) => e.review && e.show?.endsWith(HARAKAT.fatha.mark))).toBe(true);
  });

  it('joins every new letter with the letters learned before it', () => {
    const te = letterLessons.find((l) => l.letters.includes('ت'))!;
    const joins = lessonExercises(te, 'bs').filter((e) => e.kind === 'join' || e.kind === 'findJoin');
    expect(joins.length).toBeGreaterThan(0);
    for (const e of joins) {
      expect(e.review).toBe(true);
      expect(e.choices[e.answer]).toBeDefined();
      expect(e.choices.length).toBeGreaterThanOrEqual(2);
    }
    // The very first letter has no earlier letter to join with.
    expect(lessonExercises(letterLessons[0], 'bs').some((e) => e.kind === 'join' || e.kind === 'findJoin')).toBe(false);
  });

  it('reads only words written with the letters of the course', () => {
    expect(READING_WORDS.length).toBeGreaterThanOrEqual(8);
    for (const word of READING_WORDS) for (const l of splitLetters(word.arabic)) expect(COURSE_LETTERS).toContain(l.base);
    expect(READING_WORDS.map((w) => w.id)).toContain('kitab');
    expect(READING_WORDS.map((w) => w.id)).not.toContain('jannah');
  });

  it('reads real words in the lesson of every new letter group', () => {
    for (const lesson of letterLessons.slice(2)) {
      const words = lessonExercises(lesson, 'bs').filter((e) => e.params.word === '1');
      expect(words.length).toBeGreaterThan(0);
      for (const e of words) {
        expect(e.kind === 'read' || e.kind === 'findReading').toBe(true);
        expect(e.review).toBe(true);
      }
    }
  });

  it('puts the lessons at the start of the Sufara topic path only', () => {
    const items = sufaraPathItems('sufara', ['sufara-01']);
    expect(items).toHaveLength(SUFARA_LESSONS.length);
    expect(items[0]).toMatchObject({ kind: 'quest', id: 'sufara-01', completed: true, href: { pathname: '/sufara', params: { lesson: 'sufara-01' } } });
    expect(items[1].completed).toBe(false);
    expect(sufaraPathItems('arabic', [])).toEqual([]);
  });
});
