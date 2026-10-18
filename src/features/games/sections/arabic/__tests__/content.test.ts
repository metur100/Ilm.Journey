import quests from '@/features/learn/content/quests/arabic.json';
import { getGame } from '@/core/games';

import { gapsOf } from '../non-joiners/NonJoinersGame';
import { maddRounds } from '../madd-stretch/MaddStretchGame';
import { markRounds } from '../marks-workshop/MarksWorkshopGame';
import { ARABIC_GAME_IDS, registerArabicGames } from '../index';
import { SUFARA_GAME_IDS } from '../shared/define';
import { FACTS, MARK_FACTS } from '../shared/facts';
import { HARAKAT_LESSON, LETTER_LESSON } from '../shared/lessonText';
import { LETTERS, NON_JOINERS, SUFARA_LETTER_ORDER } from '../shared/letters';
import { letterForm } from '../shared/script';
import { bareLetters, WORDS } from '../shared/words';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

registerArabicGames();

interface Section {
  arabic?: string;
  transliteration?: string;
  heading?: Record<string, string>;
  body: Record<string, string>;
}
const lessons = (quests as unknown as { lessons: { id: string; sections: Section[] }[] }).lessons;
const sections = (prefix: string) => lessons.filter((l) => l.id.startsWith(prefix)).flatMap((l) => l.sections);

describe('Arabic / Sufara content', () => {
  it('has the 28 letters in the order of the letter lessons, with their lesson lines', () => {
    const lessonLetters = sections('arabic-letters-').map((s) => s.arabic);
    expect(SUFARA_LETTER_ORDER).toEqual(lessonLetters);
    expect(LETTERS).toHaveLength(28);
    for (const s of sections('arabic-letters-')) {
      expect(LETTER_LESSON[s.arabic!]).toEqual(s.body);
      const info = LETTERS.find((l) => l.letter === s.arabic)!;
      expect(info.translit).toBe(s.transliteration);
      // The lesson line starts with the letter's name (en / bs; de spells some names differently, e.g. "Dschim").
      expect(s.body.en.startsWith(info.name.en)).toBe(true);
      expect(s.body.bs.startsWith(info.name.bs)).toBe(true);
      expect(s.body.de.startsWith(info.name.de)).toBe(true);
    }
  });

  it('dots match the lesson lines (count and place)', () => {
    const words = ['', 'One', 'Two', 'Three'];
    // Where a lesson line names the dots, the table agrees; ض ظ غ – whose lines do not mention them – carry one dot above.
    for (const letter of LETTERS) {
      const line = LETTER_LESSON[letter.letter].en;
      if (/No dots/.test(line)) expect(letter.dots).toBe(0);
      const named = /(One|Two|Three) dots? (above|below|inside)/.exec(line);
      if (named) {
        expect(words[letter.dots]).toBe(named[1]);
        expect(letter.dotPlace).toBe(named[2]);
      }
      if (letter.dots) expect(letter.skeleton).not.toBe(letter.letter);
    }
    expect(LETTERS.filter((l) => l.dots).map((l) => l.letter).join('')).toBe('بتثجخذزشضظغفقني');
  });

  it('harakat lesson sections are copied unchanged', () => {
    for (const s of sections('arabic-harakat')) {
      expect(HARAKAT_LESSON[s.arabic!].body).toEqual(s.body);
      expect(HARAKAT_LESSON[s.arabic!].heading).toEqual(s.heading);
    }
    expect(Object.values(MARK_FACTS)).toHaveLength(6);
  });

  it('lesson words are identical to the word lesson', () => {
    const lesson = sections('arabic-words');
    for (const word of WORDS.filter((w) => w.origin === 'lesson')) {
      const s = lesson.find((x) => x.arabic === word.arabic);
      expect(s).toBeDefined();
      expect(s!.transliteration).toBe(word.translit);
      expect(s!.body).toEqual(word.meaning);
    }
    for (const word of WORDS) for (const lang of ['en', 'de', 'bs'] as const) expect(word.meaning[lang].trim()).not.toBe('');
  });

  it('quest facts are copied from the content', () => {
    const facts = (quests as unknown as { facts: { id: string; text: Record<string, string> }[] }).facts;
    expect(FACTS.joining.text).toEqual(facts.find((f) => f.id === 'arabic-fact-rtl')!.text);
    expect(FACTS.dad.text).toEqual(facts.find((f) => f.id === 'arabic-fact-dad')!.text);
    expect(FACTS.masjid.text).toEqual(facts.find((f) => f.id === 'arabic-fact-masjid')!.text);
  });

  it('knows where words join and break', () => {
    expect(NON_JOINERS).toEqual(['ا', 'د', 'ذ', 'ر', 'ز', 'و']);
    expect(gapsOf('بَاب').map((g) => g.joins)).toEqual([true, false]);
    expect(gapsOf('زَيْتُون').map((g) => g.joins)).toEqual([false, true, true, false]);
    expect(bareLetters('كِتَاب')).toEqual(['ك', 'ت', 'ا', 'ب']);
    expect(letterForm('ب', 'medial')).toBe('ـبـ');
    expect(letterForm('د', 'initial')).toBe('د');
  });

  it('finds the long vowel and the missing mark of every word round', () => {
    const madd = maddRounds({ words: ['nur', 'kitab', 'fil', 'salam', 'mizan', 'zaytun'], rounds: 6, hints: false }, 'en');
    expect(madd.map((r) => r.answer.tile)).toEqual(['waw', 'alif', 'ya', 'alif', 'ya', 'waw']);
    const marks = markRounds({ mode: 'words', rounds: 6, hints: false, words: ['jannah', 'masjid', 'ilm'] }, 'en', (c) => c);
    expect(marks.map((r) => r.answer.tile)).toEqual(['shadda', 'sukun', 'sukun']);
    expect(marks[0].letters.join('')).toBe('جَنَة');
  });

  it('puts the letter games in the Sufara section and keeps the sufara order', () => {
    expect(ARABIC_GAME_IDS.slice(0, SUFARA_GAME_IDS.length)).toEqual([...SUFARA_GAME_IDS]);
    for (const id of ARABIC_GAME_IDS) expect(getGame(id)).toBeDefined();
    expect(ARABIC_GAME_IDS.length).toBeGreaterThanOrEqual(12);
  });
});
