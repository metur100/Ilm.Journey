import type { Language } from '@/core/models';
import { type Haraka, HARAKA_NAMES, HARAKAT, MADD_LETTER, SHADDA, SUKUN, TANWIN } from '@/features/games/sections/arabic/shared/letters';
import { splitLetters } from '@/features/games/sections/arabic/shared/script';

/*
 * The reading page of a Sufara lesson, as in a printed sufara: after a new letter come a few rows to read aloud –
 * the letter with e / i / u, then joined with elif and with the letters learned before it (بَ بِ بُ · اَبَ اِبِ اُبُ ·
 * بَتَ تِبِ …), closed syllables once sukun is known (بَتْ · اَبْ · بَزُدْ) and finally real words made only from the
 * letters learned so far. Every row repeats earlier letters, so the page grows lesson by lesson. Pure (no React).
 */

/** One letter of a reading item: the letter and its mark. */
export type ReadingPart = readonly [letter: string, mark: Haraka | 'sukun'];

export interface ReadingItem {
  /** Arabic with its marks. */
  text: string;
  /** Latin reading in the learner's language (bs: بَ "be"). */
  reading: string;
}

export interface ReadingRow {
  items: ReadingItem[];
}

const ELIF = 'ا';

/** The consonant each language writes for a letter (elif carries only its vowel at the start of a syllable). */
const CONSONANT: Record<Language, Record<string, string>> = {
  en: {
    ا: '', ب: 'b', ت: 't', ث: 'th', ج: 'j', ح: 'ḥ', خ: 'kh', د: 'd', ذ: 'dh', ر: 'r', ز: 'z', س: 's', ش: 'sh', ص: 'ṣ', ض: 'ḍ', ط: 'ṭ', ظ: 'ẓ',
    ع: 'ʿ', غ: 'gh', ف: 'f', ق: 'q', ك: 'k', ل: 'l', م: 'm', ن: 'n', ه: 'h', و: 'w', ي: 'y',
  },
  de: {
    ا: '', ب: 'b', ت: 't', ث: 'th', ج: 'dsch', ح: 'ḥ', خ: 'ch', د: 'd', ذ: 'dh', ر: 'r', ز: 'z', س: 's', ش: 'sch', ص: 'ṣ', ض: 'ḍ', ط: 'ṭ', ظ: 'ẓ',
    ع: 'ʿ', غ: 'gh', ف: 'f', ق: 'q', ك: 'k', ل: 'l', م: 'm', ن: 'n', ه: 'h', و: 'w', ي: 'j',
  },
  bs: {
    ا: '', ب: 'b', ت: 't', ث: 's', ج: 'dž', ح: 'h', خ: 'h', د: 'd', ذ: 'z', ر: 'r', ز: 'z', س: 's', ش: 'š', ص: 's', ض: 'd', ط: 't', ظ: 'z',
    ع: 'ʿ', غ: 'g', ف: 'f', ق: 'k', ك: 'k', ل: 'l', م: 'm', ن: 'n', ه: 'h', و: 'v', ي: 'j',
  },
};

/** True when the reading page can write the letter (the 28 letters; lam-elif is read as a word). */
export const canRead = (letter: string): boolean => CONSONANT.en[letter] !== undefined;

/** The consonant of a letter in the learner's language (bs: ج "dž", en: "j"). */
export const consonantIn = (letter: string, language: Language): string => CONSONANT[language][letter] ?? '';

const vowel = (haraka: Haraka, language: Language) => HARAKAT[haraka].vowel[language];

/** Arabic of a reading item: بَ + تْ → بَتْ. */
export const partsText = (parts: readonly ReadingPart[]): string =>
  parts.map(([letter, mark]) => letter + (mark === 'sukun' ? SUKUN : HARAKAT[mark].mark)).join('');

/** Reading of a reading item: بَتْ → "bet" (bs) / "bat" (en). */
export const partsReading = (parts: readonly ReadingPart[], language: Language): string =>
  parts.map(([letter, mark]) => CONSONANT[language][letter] + (mark === 'sukun' ? '' : vowel(mark, language))).join('');

export const readingItem = (parts: readonly ReadingPart[], language: Language): ReadingItem => ({ text: partsText(parts), reading: partsReading(parts, language) });

const LONG: Record<Haraka, string> = { fatha: 'ā', kasra: 'ī', damma: 'ū' };
const MADD_FOR: Record<string, Haraka> = { ا: 'fatha', ي: 'kasra', و: 'damma' };
const MARK_HARAKA: Record<string, Haraka> = Object.fromEntries(HARAKA_NAMES.map((h) => [HARAKAT[h].mark, h]));
const TANWIN_HARAKA: Record<string, Haraka> = Object.fromEntries(HARAKA_NAMES.map((h) => [TANWIN[h], h]));

export interface WordReading {
  reading: string;
  /** The word has a long vowel (medd). */
  madd: boolean;
  /** The word has a letter without a vowel (sukun, or the last letter read at a pause). */
  sukun: boolean;
  shadda: boolean;
  tanwin: boolean;
}

/**
 * Reads a vowelled word letter by letter: يَوْم → "yawm" (en) / "jevm" (bs). Elif, je and vav without a vowel after
 * the matching vowel lengthen it (بَاب → "bāb"); a letter without a mark is read without a vowel.
 */
export function readWord(word: string, language: Language): WordReading {
  const result: WordReading = { reading: '', madd: false, sukun: false, shadda: false, tanwin: false };
  let lastVowel: Haraka | null = null;
  splitLetters(word).forEach((letter, i) => {
    const marks = [...letter.text.slice(letter.base.length)];
    const haraka = marks.map((m) => MARK_HARAKA[m]).find(Boolean);
    const tanwin = marks.map((m) => TANWIN_HARAKA[m]).find(Boolean);
    if (i > 0 && !haraka && !tanwin && !marks.includes(SUKUN) && lastVowel && MADD_FOR[letter.base] === lastVowel) {
      result.reading = result.reading.slice(0, -vowel(lastVowel, language).length) + LONG[lastVowel];
      result.madd = true;
      lastVowel = null;
      return;
    }
    const consonant = letter.base === ELIF && i === 0 ? '' : (CONSONANT[language][letter.base] ?? '');
    const doubled = marks.includes(SHADDA);
    result.shadda ||= doubled;
    result.reading += (doubled ? consonant : '') + consonant;
    if (tanwin) {
      result.reading += `${vowel(tanwin, language)}n`;
      result.tanwin = true;
      lastVowel = null;
    } else if (haraka) {
      result.reading += vowel(haraka, language);
      lastVowel = haraka;
    } else {
      result.sukun = true;
      lastVowel = null;
    }
  });
  return result;
}

/** What the learner knows at a lesson: the letters and which marks were already taught. */
export interface ReadingKnowledge {
  /** Letters taught before and in the lesson (sufara order). */
  letters: readonly string[];
  /** Letters new in this lesson. */
  fresh: readonly string[];
  /** Short vowels taught so far. */
  harakat: readonly Haraka[];
  sukun: boolean;
  madd: boolean;
  shadda: boolean;
  tanwin: boolean;
}

const unique = (items: ReadingItem[]): ReadingItem[] => items.filter((item, i) => items.findIndex((x) => x.text === item.text) === i);

/** Rows with only elif (the vowel lessons): اَ · اَ اِ · اَ اِ اُ, then the vowels mixed. */
function vowelRows(harakat: readonly Haraka[], language: Language): ReadingRow[] {
  const single = harakat.map((h) => readingItem([[ELIF, h]], language));
  if (harakat.length === 1) return [{ items: single }];
  const mixed = harakat.map((_, shift) => harakat.map((__, k) => harakat[(k + shift) % harakat.length]));
  return [{ items: single }, ...mixed.slice(1).map((order) => ({ items: order.map((h) => readingItem([[ELIF, h]], language)) }))];
}

/**
 * The reading rows of a lesson. Each new letter gets its own rows; earlier letters come back as its partners
 * (the most recent first, so the previous lesson is always repeated), and the last row reads real words.
 */
export function readingRows(knowledge: ReadingKnowledge, words: readonly string[], language: Language): ReadingRow[] {
  const { harakat } = knowledge;
  if (!harakat.length) return [];
  const consonants = knowledge.letters.filter((l) => l !== ELIF && canRead(l));
  const fresh = knowledge.fresh.filter((l) => l !== ELIF && canRead(l));
  if (!consonants.length) return vowelRows(harakat, language);

  const h = (i: number) => harakat[i % harakat.length];
  const rows: ReadingRow[] = [];
  // Every syllable is read once on the page.
  const seen = new Set<string>();
  const add = (parts: ReadingPart[][]) => {
    const items = unique(parts.map((p) => readingItem(p, language))).filter((item) => !seen.has(item.text));
    items.forEach((item) => seen.add(item.text));
    if (items.length) rows.push({ items });
  };
  // Partners: the letters learned before this one, newest first (the previous lesson always comes back).
  const earlier = consonants.filter((l) => !fresh.includes(l)).reverse();

  if (!fresh.length) {
    // A mark lesson without new letters (sukun): every letter learned so far closes a syllable.
    for (const [n, letter] of consonants.entries()) {
      const p = (i: number) => consonants[(i + n + 1) % consonants.length];
      add(harakat.map((x) => [[ELIF, x], [letter, 'sukun']]));
      add(harakat.map((x, i) => [[letter, x], [p(i), 'sukun']]));
    }
    add([0, 1, 2].map((i) => [[consonants[i % consonants.length], h(i)], [consonants[(i + 1) % consonants.length], h(i + 1)], [consonants[(i + 2) % consonants.length], 'sukun']]));
    return [...rows, ...wordRow(knowledge, words, language)];
  }

  for (const [n, letter] of fresh.entries()) {
    const partners = [...earlier.slice(0, 3), ...fresh.filter((f) => f !== letter), letter].slice(0, 4);
    const p = (i: number) => partners[(i + n) % partners.length];
    // بَ بِ بُ
    add(harakat.map((x) => [[letter, x]]));
    // اَبَ اِبِ اُبُ
    add(harakat.map((x) => [[ELIF, x], [letter, x]]));
    // بَبِ بِبُ بُبَ – the letter twice with mixed vowels, while there is no earlier letter to join with yet
    if (!earlier.length) add(harakat.map((x, i) => [[letter, x], [letter, h(i + 1)]]));
    // بَتَ تِبِ بُثُ ثَبِ – joined with the earlier letters
    add([0, 1, 2, 3, 4, 5].map((i) => (i % 2 === 0 ? [[letter, h(i)], [p(i), h(i + 1)]] : [[p(i), h(i)], [letter, h(i + 2)]])));
    if (knowledge.sukun) {
      // اَبْ اِبْ اُبْ · بَتْ تِبْ – closed syllables
      add(harakat.map((x) => [[ELIF, x], [letter, 'sukun']]));
      add([0, 1, 2, 3].map((i) => (i % 2 === 0 ? [[letter, h(i)], [p(i), 'sukun']] : [[p(i), h(i)], [letter, 'sukun']])));
      // بَزُدْ – two syllables, the second closed
      add([0, 1, 2].map((i) => [[letter, h(i)], [p(i + 1), h(i + 1)], [p(i + 2), 'sukun']]));
    } else if (earlier.length) {
      // بَتَثَ – three open syllables
      add([0, 1, 2].map((i) => [[letter, h(i)], [p(i), h(i + 1)], [p(i + 1), h(i + 2)]]));
    }
  }

  return [...rows, ...wordRow(knowledge, words, language)];
}

/** The last row: real words the learner can already read (only taught letters and marks). */
function wordRow(knowledge: ReadingKnowledge, words: readonly string[], language: Language): ReadingRow[] {
  const items = words
    .map((word) => ({ word, read: readWord(word, language) }))
    .filter(({ read }) => (knowledge.sukun || !read.sukun) && (knowledge.madd || !read.madd) && (knowledge.shadda || !read.shadda) && (knowledge.tanwin || !read.tanwin))
    .map(({ word, read }) => ({ text: word, reading: read.reading }));
  const row = unique(items).slice(0, 6);
  return row.length ? [{ items: row }] : [];
}

/**
 * Reading rows of the tanwin, medd and šedda lessons (after all letters): the new mark on a few letters with all
 * three vowels (بً بٍ بٌ · بَا بِي بُو · تَبَّ تَبِّ تَبُّ), then words.
 */
export function markRows(mark: 'tanwin' | 'madd' | 'shadda', letters: readonly string[], knowledge: ReadingKnowledge, words: readonly string[], language: Language): ReadingRow[] {
  const v = (h: Haraka) => vowel(h, language);
  const c = (l: string) => consonantIn(l, language);
  const rows: ReadingRow[] = letters.map((l, i) => {
    // Fethatejn is written with an elif after it (بًا), as in the Mushaf.
    if (mark === 'tanwin') return { items: HARAKA_NAMES.map((h) => ({ text: l + TANWIN[h] + (h === 'fatha' ? ELIF : ''), reading: `${c(l)}${v(h)}n` })) };
    if (mark === 'madd') return { items: HARAKA_NAMES.map((h) => ({ text: l + HARAKAT[h].mark + MADD_LETTER[h], reading: c(l) + LONG[h] })) };
    const first = letters[(i + 1) % letters.length];
    return { items: HARAKA_NAMES.map((h) => ({ text: partsText([[first, 'fatha']]) + l + SHADDA + HARAKAT[h].mark, reading: `${c(first)}${v('fatha')}${c(l)}${c(l)}${v(h)}` })) };
  });
  return [...rows, ...wordRow(knowledge, words, language)];
}

