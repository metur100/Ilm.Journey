import type { Language, LocalizedText } from '@/core/models';

/*
 * The 28 letters in sufara order (the order of the Arabic letter lessons `arabic-letters-1` … `-4` in
 * src/features/learn/content/quests/arabic.json): the letter, its transliterated name and the short name that opens
 * each lesson line ("Ba – sounds like …" → "Ba"). Dots (count + place) are those the lesson lines name; the skeleton is
 * the same letter without its dots (real Unicode letters, e.g. ٮ dotless ba). The content test compares the table with
 * the lessons.
 */

export type DotPlace = 'above' | 'below' | 'inside';

export interface GameLetter {
  position: number;
  letter: string;
  translit: string;
  name: LocalizedText;
  /** Number of dots (0–3). */
  dots: 0 | 1 | 2 | 3;
  dotPlace?: DotPlace;
  /** The letter without its dots (itself when it has none). */
  skeleton: string;
}

const L = (position: number, letter: string, translit: string, name: [string, string, string], dots: 0 | 1 | 2 | 3 = 0, dotPlace?: DotPlace, skeleton = letter): GameLetter => ({
  position,
  letter,
  translit,
  name: { en: name[0], de: name[1], bs: name[2] },
  dots,
  dotPlace,
  skeleton,
});

export const LETTERS: readonly GameLetter[] = [
  L(1, 'ا', 'alif', ['Alif', 'Alif', 'Elif']),
  L(2, 'ب', 'bāʾ', ['Ba', 'Ba', 'Be'], 1, 'below', 'ٮ'),
  L(3, 'ت', 'tāʾ', ['Ta', 'Ta', 'Te'], 2, 'above', 'ٮ'),
  L(4, 'ث', 'thāʾ', ['Tha', 'Tha', 'Se'], 3, 'above', 'ٮ'),
  L(5, 'ج', 'jīm', ['Jim', 'Dschim', 'Džim'], 1, 'inside', 'ح'),
  L(6, 'ح', 'ḥāʾ', ['Ha', 'Ha', 'Ha']),
  L(7, 'خ', 'khāʾ', ['Kha', 'Cha', 'Hı'], 1, 'above', 'ح'),
  L(8, 'د', 'dāl', ['Dal', 'Dal', 'Dal']),
  L(9, 'ذ', 'dhāl', ['Dhal', 'Dhal', 'Zel'], 1, 'above', 'د'),
  L(10, 'ر', 'rāʾ', ['Ra', 'Ra', 'Ra']),
  L(11, 'ز', 'zāy', ['Zay', 'Zay', 'Ze'], 1, 'above', 'ر'),
  L(12, 'س', 'sīn', ['Sin', 'Sin', 'Sin']),
  L(13, 'ش', 'shīn', ['Shin', 'Schin', 'Šin'], 3, 'above', 'س'),
  L(14, 'ص', 'ṣād', ['Sad', 'Sad', 'Sad']),
  L(15, 'ض', 'ḍād', ['Dad', 'Dad', 'Dad'], 1, 'above', 'ص'),
  L(16, 'ط', 'ṭāʾ', ['Ta', 'Ta', 'Tı']),
  L(17, 'ظ', 'ẓāʾ', ['Dha', 'Za', 'Zı'], 1, 'above', 'ط'),
  L(18, 'ع', 'ʿayn', ['Ayn', 'Ain', 'Ajn']),
  L(19, 'غ', 'ghayn', ['Ghayn', 'Ghain', 'Gajn'], 1, 'above', 'ع'),
  L(20, 'ف', 'fāʾ', ['Fa', 'Fa', 'Fe'], 1, 'above', 'ڡ'),
  L(21, 'ق', 'qāf', ['Qaf', 'Qaf', 'Kaf'], 2, 'above', 'ٯ'),
  L(22, 'ك', 'kāf', ['Kaf', 'Kaf', 'Kef']),
  L(23, 'ل', 'lām', ['Lam', 'Lam', 'Lam']),
  L(24, 'م', 'mīm', ['Mim', 'Mim', 'Mim']),
  L(25, 'ن', 'nūn', ['Nun', 'Nun', 'Nun'], 1, 'above', 'ں'),
  L(26, 'ه', 'hāʾ', ['Ha', 'Ha', 'He']),
  L(27, 'و', 'wāw', ['Waw', 'Waw', 'Vav']),
  L(28, 'ي', 'yāʾ', ['Ya', 'Ya', 'Je'], 2, 'below', 'ى'),
];

/** The sufara order of the letters (alif … ya). */
export const SUFARA_LETTER_ORDER: readonly string[] = LETTERS.map((l) => l.letter);

export const letterInfo = (letter: string): GameLetter | undefined => LETTERS.find((l) => l.letter === letter);

export function mustLetter(letter: string): GameLetter {
  const info = letterInfo(letter);
  if (!info) throw new Error(`Unknown letter ${letter}`);
  return info;
}

/** Letters `from`..`to` (1-based positions, inclusive) in sufara order. */
export const lettersRange = (from: number, to: number): GameLetter[] => LETTERS.filter((l) => l.position >= from && l.position <= to);

/** Letters that look alike apart from their dots (or a small stroke) – the distractors that teach the most. */
export const LOOK_ALIKE: readonly (readonly string[])[] = [
  ['ب', 'ت', 'ث', 'ن', 'ي'],
  ['ج', 'ح', 'خ'],
  ['د', 'ذ'],
  ['ر', 'ز'],
  ['س', 'ش'],
  ['ص', 'ض'],
  ['ط', 'ظ'],
  ['ع', 'غ'],
  ['ف', 'ق'],
];

export const lookAlikes = (letter: string): string[] => (LOOK_ALIKE.find((g) => g.includes(letter)) ?? []).filter((l) => l !== letter);

/** The "dots" group of the content fact (ب one dot below, ت two above, ث three above). */
export const DOTS_GROUP: readonly string[] = LOOK_ALIKE[0];

/** Letters that never join the letter after them (the next letter starts a new piece). */
export const NON_JOINERS: readonly string[] = ['ا', 'د', 'ذ', 'ر', 'ز', 'و'];

/** Two names the same in some language (e.g. ت and ط are both "Ta" in en) – never offered side by side. */
export function sharesName(a: string, b: string): boolean {
  const x = letterInfo(a);
  const y = letterInfo(b);
  return !!x && !!y && a !== b && (['en', 'de', 'bs'] as const).some((lang) => x.name[lang] === y.name[lang]);
}

// ---------- Marks ----------

/** Short vowels (harakat lesson): mark and the vowel each language writes for it (bs: fetha "e", as in "be"). */
export const HARAKAT = {
  fatha: { mark: 'َ', vowel: { en: 'a', de: 'a', bs: 'e' } },
  kasra: { mark: 'ِ', vowel: { en: 'i', de: 'i', bs: 'i' } },
  damma: { mark: 'ُ', vowel: { en: 'u', de: 'u', bs: 'u' } },
} as const satisfies Record<string, { mark: string; vowel: Record<Language, string> }>;

export type Haraka = keyof typeof HARAKAT;

export const HARAKA_NAMES: readonly Haraka[] = ['fatha', 'kasra', 'damma'];

export const SUKUN = 'ْ';
export const SHADDA = 'ّ';

/** Tanwin (doubled vowel marks, harakat lesson: بً ban · بٍ bin · بٌ bun) by the vowel they double. */
export const TANWIN: Record<Haraka, string> = { fatha: 'ً', kasra: 'ٍ', damma: 'ٌ' };

/** Madd: the letter that lengthens each short vowel (alif after fatha, ya after kasra, waw after damma). */
export const MADD_LETTER: Record<Haraka, string> = { fatha: 'ا', kasra: 'ي', damma: 'و' };

/** Letters used for syllables, with their plain consonant sound (as in the lesson: بَ ba, بِ bi, بُ bu). */
export const SYLLABLE_LETTERS: readonly { letter: string; consonant: string }[] = [
  { letter: 'ب', consonant: 'b' },
  { letter: 'ت', consonant: 't' },
  { letter: 'د', consonant: 'd' },
  { letter: 'ر', consonant: 'r' },
  { letter: 'س', consonant: 's' },
  { letter: 'ف', consonant: 'f' },
  { letter: 'ك', consonant: 'k' },
  { letter: 'ل', consonant: 'l' },
  { letter: 'م', consonant: 'm' },
  { letter: 'ن', consonant: 'n' },
];

export const consonantOf = (letter: string): string => SYLLABLE_LETTERS.find((s) => s.letter === letter)?.consonant ?? '';

/** A letter with a short vowel: بَ */
export const syllable = (letter: string, haraka: Haraka): string => letter + HARAKAT[haraka].mark;

/** Latin reading of a short syllable in the learner's language (bs writes fatha as "e", like the lesson: بَ be). */
export function syllableReading(letter: string, haraka: Haraka, language: Language): string {
  return consonantOf(letter) + HARAKAT[haraka].vowel[language];
}

/** A long syllable (madd): بَا bā, بِي bī, بُو bū. */
export const longSyllable = (letter: string, haraka: Haraka): string => syllable(letter, haraka) + MADD_LETTER[haraka];

const LONG: Record<Haraka, string> = { fatha: 'ā', kasra: 'ī', damma: 'ū' };
export const longReading = (letter: string, haraka: Haraka): string => consonantOf(letter) + LONG[haraka];

/** Tanwin syllable: بً (on alif-less letters, as in the lesson). */
export const tanwinSyllable = (letter: string, haraka: Haraka): string => letter + TANWIN[haraka];
export const tanwinReading = (letter: string, haraka: Haraka, language: Language): string => syllableReading(letter, haraka, language) + 'n';

/** A letter with sukun: بْ – read as the bare consonant. */
export const sukunSyllable = (letter: string): string => letter + SUKUN;
