import type { Language, LocalizedText } from '@/core/models';
import { seededRandom, shuffle } from '@/core/utils/random';
import {
  consonantOf,
  type Haraka,
  HARAKA_NAMES,
  HARAKAT,
  letterInfo,
  longReading,
  longSyllable,
  lookAlikes,
  NON_JOINERS,
  SHADDA,
  sharesName,
  sukunSyllable,
  SYLLABLE_LETTERS,
  syllable,
  syllableReading,
  tanwinReading,
  tanwinSyllable,
} from '@/features/games/sections/arabic/shared/letters';
import { LETTER_LESSON } from '@/features/games/sections/arabic/shared/lessonText';
import { type LetterPosition, letterForm, splitLetters } from '@/features/games/sections/arabic/shared/script';
import { type GameWord, WORDS } from '@/features/games/sections/arabic/shared/words';

/*
 * The Sufara course of the Learn tab: classical sufara, lesson by lesson. First the letters in the order of the
 * Bosnian sufara (elif, be, te, se, džim … vav, he, lam-elif, je), one or two per lesson – each shown with its name, sound
 * and forms, traced, then practised together with the letters of the earlier lessons (the review grows lesson by
 * lesson). Then the marks (fetha, kesra, damma, sukun, tenvin, medd, šedda), the forms of the letters in a word,
 * reading syllables and reading short words. Pure (no React); the screen is screens/SufaraScreen.tsx.
 *
 * Letters, marks and words come from the Arabic lessons (games/sections/arabic/shared) – never Quran text.
 */

export type SufaraLessonKind = 'letters' | 'review' | Haraka | 'sukun' | 'tanwin' | 'madd' | 'shadda' | 'forms' | 'syllables' | 'words';

export interface SufaraLesson {
  /** Unique id, also the progress key (`sufara-01` …). */
  id: string;
  /** 1-based position in the course. */
  number: number;
  kind: SufaraLessonKind;
  /** Letters introduced in this lesson (letter lessons only). */
  letters: string[];
}

/** Lam-elif: lam and elif joined into one sign, taught before je as in the Bosnian sufara. */
export const LAM_ELIF = 'لا';

/** New letters per lesson, in the order of the Bosnian sufara. */
const LETTER_GROUPS: readonly (readonly string[])[] = [
  ['ا'],
  ['ب'],
  ['ت', 'ث'],
  ['ج'],
  ['ح', 'خ'],
  ['د', 'ذ'],
  ['ر', 'ز'],
  ['س', 'ش'],
  ['ص', 'ض'],
  ['ط', 'ظ'],
  ['ع', 'غ'],
  ['ف', 'ق'],
  ['ك', 'ل'],
  ['م', 'ن'],
  ['و', 'ه'],
  [LAM_ELIF, 'ي'],
];

/**
 * After elif the course teaches the three short vowels on elif – e, i, u – exactly as the Bosnian sufara does,
 * and only then the rest of the letters. Every later letter lesson repeats the earlier letters and joins them.
 */
const LATER_KINDS: readonly SufaraLessonKind[] = ['review', 'sukun', 'tanwin', 'madd', 'shadda', 'forms', 'syllables', 'words'];

const lessonId = (number: number) => `sufara-${String(number).padStart(2, '0')}`;

interface LessonSeed {
  kind: SufaraLessonKind;
  letters: string[];
}

const LESSON_SEEDS: readonly LessonSeed[] = [
  { kind: 'letters', letters: [...LETTER_GROUPS[0]] },
  { kind: 'fatha', letters: [] },
  { kind: 'kasra', letters: [] },
  { kind: 'damma', letters: [] },
  ...LETTER_GROUPS.slice(1).map((letters): LessonSeed => ({ kind: 'letters', letters: [...letters] })),
  ...LATER_KINDS.map((kind): LessonSeed => ({ kind, letters: [] })),
];

export const SUFARA_LESSONS: readonly SufaraLesson[] = LESSON_SEEDS.map((seed, i) => ({
  id: lessonId(i + 1),
  number: i + 1,
  kind: seed.kind,
  letters: seed.letters,
}));

/** All letters of the course in sufara order (the 28 letters with lam-elif before je). */
export const COURSE_LETTERS: readonly string[] = LETTER_GROUPS.flat();

export const getSufaraLesson = (id: string): SufaraLesson | undefined => SUFARA_LESSONS.find((l) => l.id === id);

/** Letters learned before a lesson (all of them after the letter lessons). */
export function lettersBefore(lesson: SufaraLesson): string[] {
  return SUFARA_LESSONS.filter((l) => l.number < lesson.number).flatMap((l) => l.letters);
}

// ---------- Letters ----------

export interface CourseLetter {
  letter: string;
  name: LocalizedText;
  /** The lesson line: how it sounds and its dots. */
  line: LocalizedText;
}

const LAM_ELIF_INFO: CourseLetter = {
  letter: LAM_ELIF,
  name: { en: 'Lam-alif', de: 'Lam-Alif', bs: 'Lam-elif' },
  line: {
    en: 'Lam-alif – lam and alif joined into one sign. Read "la".',
    de: 'Lam-Alif – Lam und Alif zu einem Zeichen verbunden. Gelesen „la“.',
    bs: 'Lam-elif – lam i elif spojeni u jedan znak. Čita se „la“.',
  },
};

export function courseLetter(letter: string): CourseLetter {
  if (letter === LAM_ELIF) return LAM_ELIF_INFO;
  const info = letterInfo(letter);
  if (!info) throw new Error(`Unknown sufara letter ${letter}`);
  return { letter, name: info.name, line: LETTER_LESSON[letter] };
}

/** Two letters that must not be offered side by side (same name in some language, e.g. ت and ط "Ta"). */
function confusable(a: string, b: string): boolean {
  if (a === LAM_ELIF || b === LAM_ELIF) return false;
  return sharesName(a, b);
}

// ---------- Exercises ----------

export type ExerciseKind =
  /** Find the letter by its name (choices: letters). */
  | 'findLetter'
  /** Name the letter shown (choices: names). */
  | 'nameLetter'
  /** Read the syllable or word shown (choices: readings). */
  | 'read'
  /** Find the syllable or word for a reading (choices: Arabic). */
  | 'findReading'
  /** Find the syllable with šedda (choices: Arabic). */
  | 'findShadda'
  /** Find the long syllable (medd) for a reading (choices: Arabic). */
  | 'findLong'
  /** Find a letter's form at a place in the word (choices: Arabic forms). */
  | 'findForm'
  /** Find the letter that never joins the next letter (choices: letters). */
  | 'nonJoiner'
  /** Join a new letter with a letter from an earlier lesson and read the result (choices: readings). */
  | 'join'
  /** Find the joined pair for a reading (choices: Arabic). */
  | 'findJoin';

export interface SufaraChoice {
  text: string;
  /** Arabic text (shown large, right to left). */
  arabic: boolean;
}

export interface SufaraExercise {
  kind: ExerciseKind;
  /** Arabic shown large above the choices. */
  show?: string;
  /** What the listen button says (Arabic). */
  say: string;
  /** Prompt values: a letter name, a reading or a form. */
  params: Record<string, string>;
  choices: SufaraChoice[];
  /** Index of the right choice. */
  answer: number;
  /** True when the exercise repeats an earlier lesson. */
  review: boolean;
}

type Random = () => number;

/** Up to `count` items from a list, starting at a rotating offset (so every lesson repeats different earlier items). */
function rotate<T>(items: readonly T[], count: number, offset: number): T[] {
  if (items.length === 0) return [];
  const start = offset % items.length;
  return [...items.slice(start), ...items.slice(0, start)].slice(0, Math.min(count, items.length));
}

/** Builds an exercise with the right choice at a random place. */
function exercise(base: Omit<SufaraExercise, 'choices' | 'answer'>, right: SufaraChoice, wrong: SufaraChoice[], random: Random): SufaraExercise {
  const unique = wrong.filter((w, i) => w.text !== right.text && wrong.findIndex((x) => x.text === w.text) === i);
  const choices = shuffle([right, ...unique.slice(0, 2)], random);
  return { ...base, choices, answer: choices.findIndex((c) => c.text === right.text) };
}

/** Two other letters for a letter exercise: look-alikes the learner already knows first, then other known letters. */
function letterDistractors(target: string, known: readonly string[], random: Random): string[] {
  const learned = [...new Set([...lookAlikes(target).filter((l) => known.includes(l)), ...shuffle(known, random)])];
  // The first lesson has only elif: there the alphabet supplies the two wrong letters.
  const enough = learned.filter((l) => l !== target).length >= 2;
  const pool = enough ? learned : [...new Set([...learned, ...COURSE_LETTERS])];
  const picked: string[] = [];
  for (const letter of pool) {
    if (letter === target || confusable(letter, target) || picked.some((p) => confusable(p, letter))) continue;
    picked.push(letter);
    if (picked.length === 2) break;
  }
  return picked;
}

function letterExercise(kind: 'findLetter' | 'nameLetter', target: string, known: readonly string[], language: Language, review: boolean, random: Random): SufaraExercise {
  const others = letterDistractors(target, known, random);
  const name = (l: string) => courseLetter(l).name[language];
  if (kind === 'findLetter') {
    return exercise({ kind, say: target, params: { name: name(target) }, review }, { text: target, arabic: true }, others.map((l) => ({ text: l, arabic: true })), random);
  }
  return exercise({ kind, show: target, say: target, params: {}, review }, { text: name(target), arabic: false }, others.map((l) => ({ text: name(l), arabic: false })), random);
}

/** Plain consonant of every letter, for the joining exercises (the transliteration of the letter lesson, shortened). */
const JOIN_CONSONANT: Record<string, string> = {
  ا: '',
  ب: 'b',
  ت: 't',
  ث: 'th',
  ج: 'j',
  ح: 'ḥ',
  خ: 'kh',
  د: 'd',
  ذ: 'dh',
  ر: 'r',
  ز: 'z',
  س: 's',
  ش: 'sh',
  ص: 'ṣ',
  ض: 'ḍ',
  ط: 'ṭ',
  ظ: 'ẓ',
  ع: 'ʿ',
  غ: 'gh',
  ف: 'f',
  ق: 'q',
  ك: 'k',
  ل: 'l',
  م: 'm',
  ن: 'n',
  ه: 'h',
  و: 'w',
  ي: 'y',
};

const joinable = (letter: string) => letter !== LAM_ELIF && !NON_JOINERS.includes(letter) && JOIN_CONSONANT[letter] !== undefined;
const canJoin = (first: string, second: string) => joinable(first) && second !== LAM_ELIF && JOIN_CONSONANT[second] !== undefined;

/** Reading of a joined pair with the same short vowel on both letters: بَتَ → "bete" (bs) / "bata" (en). */
const joinedReading = (first: string, second: string, haraka: Haraka, language: Language) =>
  `${JOIN_CONSONANT[first]}${HARAKAT[haraka].vowel[language]}${JOIN_CONSONANT[second]}${HARAKAT[haraka].vowel[language]}`;

/**
 * Joining practice of a letter lesson: the new letter joined with a letter from an earlier lesson, both in the
 * reading and in the Arabic form. Starts with the second letter lesson (before that there is only elif).
 */
function joinLessonExercises(lesson: SufaraLesson, earlier: readonly string[], language: Language, random: Random): SufaraExercise[] {
  const partners = earlier.filter(joinable);
  if (!partners.length) return [];
  const out: SufaraExercise[] = [];
  lesson.letters.forEach((letter, i) => {
    if (!JOIN_CONSONANT[letter] || letter === LAM_ELIF) return;
    const partner = partners[(lesson.number + i) % partners.length];
    const first = canJoin(letter, partner) ? letter : partner;
    const second = first === letter ? partner : letter;
    if (!canJoin(first, second)) return;
    const haraka = HARAKA_NAMES[(lesson.number + i) % 3];
    const otherHaraka = HARAKA_NAMES[(HARAKA_NAMES.indexOf(haraka) + 1) % 3];
    const text = syllable(first, haraka) + syllable(second, haraka);
    const reading = joinedReading(first, second, haraka, language);
    const wrong = [
      joinedReading(first, second, otherHaraka, language),
      `${JOIN_CONSONANT[first]}${HARAKAT[haraka].vowel[language]}${JOIN_CONSONANT[second]}${HARAKAT[otherHaraka].vowel[language]}`,
    ];
    out.push(exercise({ kind: 'join', show: text, say: text, params: { reading }, review: true }, { text: reading, arabic: false }, wrong.map((w) => ({ text: w, arabic: false })), random));
    const wrongArabic = [syllable(first, otherHaraka) + syllable(second, haraka), syllable(first, haraka) + syllable(second, otherHaraka)];
    out.push(exercise({ kind: 'findJoin', say: text, params: { reading }, review: true }, { text, arabic: true }, wrongArabic.map((w) => ({ text: w, arabic: true })), random));
  });
  return out;
}

/** Exercises of a letter lesson: every new letter twice (find it, name it), joining with earlier letters, then a growing review. */
function letterLessonExercises(lesson: SufaraLesson, language: Language, random: Random): SufaraExercise[] {
  const earlier = lettersBefore(lesson);
  const known = [...earlier, ...lesson.letters];
  const fresh = lesson.letters.flatMap((l) => [letterExercise('findLetter', l, known, language, false, random), letterExercise('nameLetter', l, known, language, false, random)]);
  // The previous lesson's letters always come back; the rest of the review rotates through all earlier letters.
  const previous = SUFARA_LESSONS.find((l) => l.number === lesson.number - 1)?.letters ?? [];
  const reviewCount = Math.min(earlier.length, 1 + Math.floor(lesson.number / 3));
  const older = earlier.filter((l) => !previous.includes(l));
  const reviewed = [...previous, ...rotate(older, reviewCount, lesson.number * 5)].slice(0, reviewCount);
  const review = reviewed.map((l, i) => letterExercise(i % 2 === 0 ? 'findLetter' : 'nameLetter', l, known, language, true, random));
  const joining = joinLessonExercises(lesson, earlier, language, random);
  // Before the second letter there is nothing to join yet: keep the vowels on elif alive instead.
  const earlyVowels = earlier.length === 1 ? HARAKA_NAMES.slice(1).map((h) => readSyllable(earlier[0], h, HARAKA_NAMES, language, true, random, earlier)) : [];
  return [...fresh, ...earlyVowels, ...joining, ...review];
}

/** The review lesson: twelve letters from the whole alphabet, half found by name, half named. */
function reviewLessonExercises(language: Language, random: Random): SufaraExercise[] {
  const letters = shuffle(COURSE_LETTERS, random).slice(0, 12);
  return letters.map((l, i) => letterExercise(i % 2 === 0 ? 'findLetter' : 'nameLetter', l, COURSE_LETTERS, language, true, random));
}

/** Letters with a known plain consonant (readings are written with it). */
const READING_LETTERS = SYLLABLE_LETTERS.map((s) => s.letter);

/** The harakat learned up to (and including) a haraka lesson. */
function harakatUpTo(haraka: Haraka): Haraka[] {
  return HARAKA_NAMES.slice(0, HARAKA_NAMES.indexOf(haraka) + 1);
}

/** Read a short syllable: the same letter with the other learned harakat, or another letter with the same haraka. */
function readSyllable(
  letter: string,
  haraka: Haraka,
  known: readonly Haraka[],
  language: Language,
  review: boolean,
  random: Random,
  pool: readonly string[] = READING_LETTERS,
): SufaraExercise {
  const text = syllable(letter, haraka);
  const other = pool.find((l) => l !== letter && consonantOf(l) !== consonantOf(letter));
  const wrong = [
    ...HARAKA_NAMES.filter((h) => h !== haraka).map((h) => syllableReading(letter, h, language)),
    ...(other ? [syllableReading(other, haraka, language)] : []),
    ...(known.length > 1 ? [] : [syllableReading(letter, HARAKA_NAMES[(HARAKA_NAMES.indexOf(haraka) + 1) % HARAKA_NAMES.length], language)]),
  ];
  return exercise({ kind: 'read', show: text, say: text, params: {}, review }, { text: syllableReading(letter, haraka, language), arabic: false }, wrong.map((w) => ({ text: w, arabic: false })), random);
}

/** Find the syllable for a reading among the same letter with other harakat (or other letters). */
function findSyllable(
  letter: string,
  haraka: Haraka,
  language: Language,
  review: boolean,
  random: Random,
  pool: readonly string[] = READING_LETTERS,
): SufaraExercise {
  const text = syllable(letter, haraka);
  const wrong = [
    ...HARAKA_NAMES.filter((h) => h !== haraka).map((h) => syllable(letter, h)),
    ...rotate(pool.filter((l) => l !== letter), 2, pool.indexOf(letter)).map((l) => syllable(l, haraka)),
  ];
  return exercise({ kind: 'findReading', say: text, params: { reading: syllableReading(letter, haraka, language) }, review }, { text, arabic: true }, wrong.map((w) => ({ text: w, arabic: true })), random);
}

/** Letters available in a haraka lesson: only elif before the first other letter, then all learned letters. */
function harakaPool(lesson: SufaraLesson): string[] {
  const learned = lettersBefore(lesson).filter((l) => l !== LAM_ELIF);
  return learned.length ? learned : ['ا'];
}

function harakaLessonExercises(lesson: SufaraLesson & { kind: Haraka }, language: Language, random: Random): SufaraExercise[] {
  const known = harakatUpTo(lesson.kind);
  const pool = harakaPool(lesson);
  const fresh = pool.flatMap((letter) => [
    readSyllable(letter, lesson.kind, known, language, false, random, pool),
    findSyllable(letter, lesson.kind, language, false, random, pool),
  ]);
  const earlier = known.filter((h) => h !== lesson.kind);
  const review = earlier.flatMap((h) => pool.flatMap((letter) => [readSyllable(letter, h, known, language, true, random, pool), findSyllable(letter, h, language, true, random, pool)]));
  return [...fresh, ...review];
}

/** Closed syllables (consonant + vowel + consonant with sukun) of the sukun lesson. */
const SUKUN_SYLLABLES: readonly [string, Haraka, string][] = [
  ['ب', 'fatha', 'ل'],
  ['م', 'kasra', 'ن'],
  ['ك', 'damma', 'ن'],
  ['ق', 'damma', 'ل'],
  ['س', 'fatha', 'ل'],
  ['ف', 'kasra', 'ل'],
];

/** The vowel a language writes for a haraka (bs writes fatha as "e"). */
const vowelOf = (haraka: Haraka, language: Language) => HARAKAT[haraka].vowel[language];

/** A closed syllable as text and reading (ق is read with "q" in en/de and "k" in bs, as in the letter lesson). */
function closedSyllable([first, haraka, last]: readonly [string, Haraka, string], language: Language): { text: string; reading: string } {
  const consonant = (l: string) => consonantOf(l) || (l === 'ق' ? (language === 'bs' ? 'k' : 'q') : '');
  return { text: syllable(first, haraka) + sukunSyllable(last), reading: `${consonant(first)}${vowelOf(haraka, language)}${consonant(last)}` };
}

function sukunLessonExercises(language: Language, random: Random): SufaraExercise[] {
  const fresh = SUKUN_SYLLABLES.map((item) => {
    const { text, reading } = closedSyllable(item, language);
    const [first, haraka, last] = item;
    // Wrong: a vowel on the last letter, another vowel on the first, or the last letter left out.
    const voweled = reading + vowelOf('fatha', language);
    const swapped = closedSyllable([first, HARAKA_NAMES.find((h) => h !== haraka)!, last], language).reading;
    const open = reading.slice(0, -1);
    return exercise({ kind: 'read', show: text, say: text, params: {}, review: false }, { text: reading, arabic: false }, [voweled, swapped, open].map((w) => ({ text: w, arabic: false })), random);
  });
  const review = rotate(READING_LETTERS, 2, 7).map((l, i) => readSyllable(l, HARAKA_NAMES[i % 3], HARAKA_NAMES, language, true, random));
  return [...fresh, ...review];
}

function tanwinLessonExercises(lesson: SufaraLesson, language: Language, random: Random): SufaraExercise[] {
  const letters = rotate(READING_LETTERS, 6, lesson.number);
  const fresh = letters.map((letter, i) => {
    const haraka = HARAKA_NAMES[i % 3];
    const text = tanwinSyllable(letter, haraka);
    const wrong = [...HARAKA_NAMES.filter((h) => h !== haraka).map((h) => tanwinReading(letter, h, language)), syllableReading(letter, haraka, language)];
    return exercise({ kind: 'read', show: text, say: text, params: {}, review: false }, { text: tanwinReading(letter, haraka, language), arabic: false }, wrong.map((w) => ({ text: w, arabic: false })), random);
  });
  const review = rotate(SUKUN_SYLLABLES, 2, lesson.number).map((item) => {
    const { text, reading } = closedSyllable(item, language);
    const swapped = closedSyllable([item[0], HARAKA_NAMES.find((h) => h !== item[1])!, item[2]], language).reading;
    return exercise({ kind: 'read', show: text, say: text, params: {}, review: true }, { text: reading, arabic: false }, [swapped, reading + 'n'].map((w) => ({ text: w, arabic: false })), random);
  });
  return [...fresh, ...review];
}

function maddLessonExercises(lesson: SufaraLesson, language: Language, random: Random): SufaraExercise[] {
  const letters = rotate(READING_LETTERS, 6, lesson.number);
  const read = letters.slice(0, 4).map((letter, i) => {
    const haraka = HARAKA_NAMES[i % 3];
    const text = longSyllable(letter, haraka);
    const wrong = [syllableReading(letter, haraka, language), longReading(letter, HARAKA_NAMES[(i + 1) % 3])];
    return exercise({ kind: 'read', show: text, say: text, params: {}, review: false }, { text: longReading(letter, haraka), arabic: false }, wrong.map((w) => ({ text: w, arabic: false })), random);
  });
  const find = letters.slice(4, 6).map((letter, i) => {
    const haraka = HARAKA_NAMES[(i + 1) % 3];
    const text = longSyllable(letter, haraka);
    const wrong = [syllable(letter, haraka), longSyllable(letter, HARAKA_NAMES[(i + 2) % 3])];
    return exercise({ kind: 'findLong', say: text, params: { reading: longReading(letter, haraka) }, review: false }, { text, arabic: true }, wrong.map((w) => ({ text: w, arabic: true })), random);
  });
  const review = rotate(READING_LETTERS, 2, lesson.number * 2).map((letter, i) => {
    const haraka = HARAKA_NAMES[(i + 2) % 3];
    const text = tanwinSyllable(letter, haraka);
    const wrong = [...HARAKA_NAMES.filter((h) => h !== haraka).map((h) => tanwinReading(letter, h, language))];
    return exercise({ kind: 'read', show: text, say: text, params: {}, review: true }, { text: tanwinReading(letter, haraka, language), arabic: false }, wrong.map((w) => ({ text: w, arabic: false })), random);
  });
  return [...read, ...find, ...review];
}

/** Two syllables, the second with šedda: بَتَّ (the second letter is doubled). */
export function shaddaPair(first: string, second: string, haraka: Haraka): string {
  return syllable(first, 'fatha') + second + SHADDA + HARAKAT[haraka].mark;
}

function shaddaLessonExercises(lesson: SufaraLesson, language: Language, random: Random): SufaraExercise[] {
  const letters = rotate(READING_LETTERS, 6, lesson.number);
  const find = letters.slice(0, 3).map((letter, i) => {
    const haraka = HARAKA_NAMES[i % 3];
    const text = letter + SHADDA + HARAKAT[haraka].mark;
    const wrong = [syllable(letter, haraka), sukunSyllable(letter)];
    return exercise({ kind: 'findShadda', say: text, params: {}, review: false }, { text, arabic: true }, wrong.map((w) => ({ text: w, arabic: true })), random);
  });
  const read = letters.slice(3, 6).map((second, i) => {
    const first = letters[i];
    const haraka = HARAKA_NAMES[i % 3];
    const text = shaddaPair(first, second, haraka);
    const firstPart = syllableReading(first, 'fatha', language);
    const secondPart = syllableReading(second, haraka, language);
    const right = firstPart + consonantOf(second) + secondPart;
    const wrong = [firstPart + secondPart, firstPart + consonantOf(second)];
    return exercise({ kind: 'read', show: text, say: text, params: {}, review: false }, { text: right, arabic: false }, wrong.map((w) => ({ text: w, arabic: false })), random);
  });
  const review = rotate(READING_LETTERS, 2, lesson.number).map((letter, i) => {
    const haraka = HARAKA_NAMES[i % 3];
    const text = longSyllable(letter, haraka);
    return exercise({ kind: 'read', show: text, say: text, params: {}, review: true }, { text: longReading(letter, haraka), arabic: false }, [syllableReading(letter, haraka, language), longReading(letter, HARAKA_NAMES[(i + 1) % 3])].map((w) => ({ text: w, arabic: false })), random);
  });
  return [...find, ...read, ...review];
}

/** Letters whose forms the forms lesson shows (they join on both sides and change shape clearly). */
export const FORM_LETTERS: readonly string[] = ['ب', 'ج', 'ع', 'ه', 'م', 'ك'];
const FORM_POSITIONS: readonly LetterPosition[] = ['initial', 'medial', 'final'];

function formsLessonExercises(lesson: SufaraLesson, language: Language, random: Random): SufaraExercise[] {
  const forms = FORM_LETTERS.map((letter, i) => {
    const position = FORM_POSITIONS[i % 3];
    const text = letterForm(letter, position);
    const wrong = FORM_POSITIONS.filter((p) => p !== position).map((p) => letterForm(letter, p));
    return exercise({ kind: 'findForm', show: letter, say: letter, params: { name: courseLetter(letter).name[language], position }, review: false }, { text, arabic: true }, wrong.map((w) => ({ text: w, arabic: true })), random);
  });
  const joiners = COURSE_LETTERS.filter((l) => l !== LAM_ELIF && !NON_JOINERS.includes(l));
  const nonJoiners = rotate(NON_JOINERS, 3, lesson.number).map((letter, i) => {
    const wrong = rotate(joiners, 2, lesson.number + i * 7);
    return exercise({ kind: 'nonJoiner', say: letter, params: {}, review: false }, { text: letter, arabic: true }, wrong.map((w) => ({ text: w, arabic: true })), random);
  });
  const review = rotate(COURSE_LETTERS, 2, lesson.number * 3).map((l) => letterExercise('nameLetter', l, COURSE_LETTERS, language, true, random));
  return [...forms, ...nonJoiners, ...review];
}

/** Syllable chains of the reading lesson: letters and harakat (no meaning – reading practice as in the sufara). */
export const SYLLABLE_CHAINS: readonly (readonly [string, Haraka])[][] = [
  [['ب', 'fatha'], ['ت', 'fatha']],
  [['م', 'kasra'], ['ن', 'fatha']],
  [['ر', 'damma'], ['س', 'damma']],
  [['ك', 'fatha'], ['ت', 'fatha'], ['ب', 'fatha']],
  [['ف', 'kasra'], ['ل', 'kasra'], ['د', 'fatha']],
  [['ن', 'damma'], ['ب', 'kasra'], ['ر', 'fatha']],
];

export function chainText(chain: readonly (readonly [string, Haraka])[]): string {
  return chain.map(([l, h]) => syllable(l, h)).join('');
}

export function chainReading(chain: readonly (readonly [string, Haraka])[], language: Language): string {
  return chain.map(([l, h]) => syllableReading(l, h, language)).join('');
}

function syllablesLessonExercises(language: Language, random: Random): SufaraExercise[] {
  return SYLLABLE_CHAINS.map((chain, i) => {
    const text = chainText(chain);
    // Wrong readings change one vowel (the last or the first syllable).
    const changed = (index: number) => chain.map(([l, h], k): [string, Haraka] => [l, k === index ? HARAKA_NAMES[(HARAKA_NAMES.indexOf(h) + 1) % 3] : h]);
    const wrong = [chainReading(changed(chain.length - 1), language), chainReading(changed(0), language)];
    if (i % 3 === 2) {
      return exercise({ kind: 'findReading', say: text, params: { reading: chainReading(chain, language) }, review: false }, { text, arabic: true }, [changed(chain.length - 1), changed(0)].map((c) => ({ text: chainText(c), arabic: true })), random);
    }
    return exercise({ kind: 'read', show: text, say: text, params: {}, review: false }, { text: chainReading(chain, language), arabic: false }, wrong.map((w) => ({ text: w, arabic: false })), random);
  });
}

/** Words the course can read: only letters of the course (no hamza or ta marbuta yet). */
export const READING_WORDS: readonly GameWord[] = WORDS.filter((w) => splitLetters(w.arabic).every((l) => COURSE_LETTERS.includes(l.base)));

function wordsLessonExercises(lesson: SufaraLesson, random: Random): SufaraExercise[] {
  const words = rotate(READING_WORDS, 8, lesson.number);
  return words.map((word, i) => {
    const others = READING_WORDS.filter((w) => w.id !== word.id);
    const wrong = rotate(others, 2, i * 3 + lesson.number);
    if (i % 2 === 1) {
      return exercise({ kind: 'findReading', say: word.arabic, params: { reading: word.translit }, review: false }, { text: word.arabic, arabic: true }, wrong.map((w) => ({ text: w.arabic, arabic: true })), random);
    }
    return exercise({ kind: 'read', show: word.arabic, say: word.arabic, params: {}, review: false }, { text: word.translit, arabic: false }, wrong.map((w) => ({ text: w.translit, arabic: false })), random);
  });
}

/** The practice of a lesson (deterministic for a lesson and language). */
export function lessonExercises(lesson: SufaraLesson, language: Language): SufaraExercise[] {
  const random = seededRandom(lesson.number * 7919 + 17);
  switch (lesson.kind) {
    case 'letters':
      return letterLessonExercises(lesson, language, random);
    case 'review':
      return reviewLessonExercises(language, random);
    case 'fatha':
    case 'kasra':
    case 'damma':
      return harakaLessonExercises({ ...lesson, kind: lesson.kind }, language, random);
    case 'sukun':
      return sukunLessonExercises(language, random);
    case 'tanwin':
      return tanwinLessonExercises(lesson, language, random);
    case 'madd':
      return maddLessonExercises(lesson, language, random);
    case 'shadda':
      return shaddaLessonExercises(lesson, language, random);
    case 'forms':
      return formsLessonExercises(lesson, language, random);
    case 'syllables':
      return syllablesLessonExercises(language, random);
    case 'words':
      return wordsLessonExercises(lesson, random);
  }
}

/** Example syllables shown in a mark lesson (with their readings). */
export function markExamples(kind: SufaraLessonKind, language: Language): { text: string; reading: string }[] {
  const letters = READING_LETTERS.slice(0, 6);
  switch (kind) {
    case 'fatha':
    case 'kasra':
    case 'damma':
      // These three lessons come directly after elif, before any other letter is taught.
      return [{ text: syllable('ا', kind), reading: syllableReading('ا', kind, language) }];
    case 'sukun':
      return SUKUN_SYLLABLES.slice(0, 4).map((item) => closedSyllable(item, language));
    case 'tanwin':
      return HARAKA_NAMES.flatMap((h) => letters.slice(0, 2).map((l) => ({ text: tanwinSyllable(l, h), reading: tanwinReading(l, h, language) })));
    case 'madd':
      return HARAKA_NAMES.flatMap((h) => letters.slice(0, 2).map((l) => ({ text: longSyllable(l, h), reading: longReading(l, h) })));
    case 'shadda':
      return letters.slice(0, 3).map((l, i) => {
        const second = letters[i + 3];
        return { text: shaddaPair(l, second, 'fatha'), reading: syllableReading(l, 'fatha', language) + consonantOf(second) + syllableReading(second, 'fatha', language) };
      });
    case 'syllables':
      return SYLLABLE_CHAINS.slice(0, 3).map((chain) => ({ text: chainText(chain), reading: chainReading(chain, language) }));
    case 'words':
      return READING_WORDS.slice(0, 4).map((w) => ({ text: w.arabic, reading: w.translit }));
    default:
      return [];
  }
}
