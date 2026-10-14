import type { Language, LocalizedText } from '@/core/models';

/*
 * The 28 letters, copied from the Arabic letter lessons (`arabic-letters-1` … `-4` in
 * src/features/learn/content/quests/arabic.json): the letter, its transliterated name and the short name that opens
 * each lesson description ("Ba – sounds like …" → "Ba"). The test compares this table with the content.
 */

export interface GameLetter {
  position: number;
  letter: string;
  translit: string;
  name: LocalizedText;
}

export const LETTERS: readonly GameLetter[] = [
  { position: 1, letter: 'ا', translit: 'alif', name: { en: 'Alif', de: 'Alif', bs: 'Elif' } },
  { position: 2, letter: 'ب', translit: 'bāʾ', name: { en: 'Ba', de: 'Ba', bs: 'Be' } },
  { position: 3, letter: 'ت', translit: 'tāʾ', name: { en: 'Ta', de: 'Ta', bs: 'Te' } },
  { position: 4, letter: 'ث', translit: 'thāʾ', name: { en: 'Tha', de: 'Tha', bs: 'Se' } },
  { position: 5, letter: 'ج', translit: 'jīm', name: { en: 'Jim', de: 'Dschim', bs: 'Džim' } },
  { position: 6, letter: 'ح', translit: 'ḥāʾ', name: { en: 'Ha', de: 'Ha', bs: 'Ha' } },
  { position: 7, letter: 'خ', translit: 'khāʾ', name: { en: 'Kha', de: 'Cha', bs: 'Hı' } },
  { position: 8, letter: 'د', translit: 'dāl', name: { en: 'Dal', de: 'Dal', bs: 'Dal' } },
  { position: 9, letter: 'ذ', translit: 'dhāl', name: { en: 'Dhal', de: 'Dhal', bs: 'Zel' } },
  { position: 10, letter: 'ر', translit: 'rāʾ', name: { en: 'Ra', de: 'Ra', bs: 'Ra' } },
  { position: 11, letter: 'ز', translit: 'zāy', name: { en: 'Zay', de: 'Zay', bs: 'Ze' } },
  { position: 12, letter: 'س', translit: 'sīn', name: { en: 'Sin', de: 'Sin', bs: 'Sin' } },
  { position: 13, letter: 'ش', translit: 'shīn', name: { en: 'Shin', de: 'Schin', bs: 'Šin' } },
  { position: 14, letter: 'ص', translit: 'ṣād', name: { en: 'Sad', de: 'Sad', bs: 'Sad' } },
  { position: 15, letter: 'ض', translit: 'ḍād', name: { en: 'Dad', de: 'Dad', bs: 'Dad' } },
  { position: 16, letter: 'ط', translit: 'ṭāʾ', name: { en: 'Ta', de: 'Ta', bs: 'Tı' } },
  { position: 17, letter: 'ظ', translit: 'ẓāʾ', name: { en: 'Dha', de: 'Za', bs: 'Zı' } },
  { position: 18, letter: 'ع', translit: 'ʿayn', name: { en: 'Ayn', de: 'Ain', bs: 'Ajn' } },
  { position: 19, letter: 'غ', translit: 'ghayn', name: { en: 'Ghayn', de: 'Ghain', bs: 'Gajn' } },
  { position: 20, letter: 'ف', translit: 'fāʾ', name: { en: 'Fa', de: 'Fa', bs: 'Fe' } },
  { position: 21, letter: 'ق', translit: 'qāf', name: { en: 'Qaf', de: 'Qaf', bs: 'Kaf' } },
  { position: 22, letter: 'ك', translit: 'kāf', name: { en: 'Kaf', de: 'Kaf', bs: 'Kef' } },
  { position: 23, letter: 'ل', translit: 'lām', name: { en: 'Lam', de: 'Lam', bs: 'Lam' } },
  { position: 24, letter: 'م', translit: 'mīm', name: { en: 'Mim', de: 'Mim', bs: 'Mim' } },
  { position: 25, letter: 'ن', translit: 'nūn', name: { en: 'Nun', de: 'Nun', bs: 'Nun' } },
  { position: 26, letter: 'ه', translit: 'hāʾ', name: { en: 'Ha', de: 'Ha', bs: 'He' } },
  { position: 27, letter: 'و', translit: 'wāw', name: { en: 'Waw', de: 'Waw', bs: 'Vav' } },
  { position: 28, letter: 'ي', translit: 'yāʾ', name: { en: 'Ya', de: 'Ya', bs: 'Je' } },
];

export const letterInfo = (letter: string): GameLetter | undefined => LETTERS.find((l) => l.letter === letter);

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

/** Short vowels (harakat lesson): mark and the vowel each language writes for it (bs: fetha "e/a" → "e", as in "be"). */
export const HARAKAT = {
  fatha: { mark: 'َ', vowel: { en: 'a', de: 'a', bs: 'e' } },
  kasra: { mark: 'ِ', vowel: { en: 'i', de: 'i', bs: 'i' } },
  damma: { mark: 'ُ', vowel: { en: 'u', de: 'u', bs: 'u' } },
} as const satisfies Record<string, { mark: string; vowel: Record<Language, string> }>;

export type Haraka = keyof typeof HARAKAT;

export const HARAKA_NAMES: readonly Haraka[] = ['fatha', 'kasra', 'damma'];

/** Letters used for the harakat level, with their plain consonant sound (as in the lesson: بَ ba, بِ bi, بُ bu). */
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
