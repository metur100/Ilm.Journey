/**
 * Arabic script helpers (pure) shared by Letter Lanterns and Word Builder: splitting a vowelled word into letters,
 * joining rules and the positional forms (initial / medial / final) rendered as real text with tatweel (ـ).
 * Nothing here is Quran text – only letters and basic words.
 */

/** Tatweel (kashida): a joining stroke, used to show a letter's connected form on its own. */
export const TATWEEL = 'ـ';

/** Harakat and other combining marks that belong to the preceding letter. */
const MARK = /[ً-ٰٟۖ-ۭ]/;

/** Letters that never connect to the following letter (right-joining only). Hamza does not join at all. */
const NO_JOIN_AFTER = new Set(['ا', 'أ', 'إ', 'آ', 'ٱ', 'د', 'ذ', 'ر', 'ز', 'و', 'ؤ', 'ة', 'ى', 'ء']);

export type LetterPosition = 'isolated' | 'initial' | 'medial' | 'final';

export const LETTER_POSITIONS: readonly LetterPosition[] = ['isolated', 'initial', 'medial', 'final'];

/** One written letter of a word: its base letter plus the marks (harakat, shadda, sukun) written on it. */
export interface ScriptLetter {
  base: string;
  /** Base letter + its marks, exactly as in the word. */
  text: string;
}

/** True when the letter connects to the letter after it. */
export function joinsNext(base: string): boolean {
  return !NO_JOIN_AFTER.has(base);
}

/** True when the letter can connect to the letter before it (every letter except the hamza on the line). */
export function joinsPrevious(base: string): boolean {
  return base !== 'ء';
}

/** Splits a (vowelled) word into its letters; marks stay with their letter. `letters.map(text).join('') === word`. */
export function splitLetters(word: string): ScriptLetter[] {
  const letters: ScriptLetter[] = [];
  for (const char of word) {
    const last = letters[letters.length - 1];
    if (MARK.test(char) && last) last.text += char;
    else letters.push({ base: char, text: char });
  }
  return letters;
}

/** Number of written letters (marks are not counted). */
export function letterCount(word: string): number {
  return splitLetters(word).length;
}

/** Positions of the letters inside the word, following the joining rules. */
export function positionsInWord(letters: readonly ScriptLetter[]): LetterPosition[] {
  return letters.map((letter, i) => {
    const before = i > 0 && joinsNext(letters[i - 1].base) && joinsPrevious(letter.base);
    const after = i < letters.length - 1 && joinsNext(letter.base) && joinsPrevious(letters[i + 1].base);
    if (before && after) return 'medial';
    if (before) return 'final';
    if (after) return 'initial';
    return 'isolated';
  });
}

/**
 * A letter in a given position, as text that renders that shape on its own: initial `بـ`, medial `ـبـ`, final `ـب`.
 * Letters that never join forward have no own initial form (`ا`) and a medial form like their final (`ـا`).
 */
export function letterForm(letter: string, position: LetterPosition): string {
  const base = splitLetters(letter)[0]?.base ?? letter;
  const forward = joinsNext(base);
  const backward = joinsPrevious(base);
  switch (position) {
    case 'isolated':
      return letter;
    case 'initial':
      return forward ? letter + TATWEEL : letter;
    case 'medial':
      return (backward ? TATWEEL : '') + letter + (forward ? TATWEEL : '');
    case 'final':
      return (backward ? TATWEEL : '') + letter;
  }
}

/** The shape every letter takes inside the word (e.g. كِتَاب → كِـ ـتَـ ـا ب). */
export function formsInWord(word: string): string[] {
  const letters = splitLetters(word);
  const positions = positionsInWord(letters);
  return letters.map((letter, i) => letterForm(letter.text, positions[i]));
}

/**
 * The first `count` letters joined as they will look in the finished word: when the last placed letter connects to
 * the next one, a tatweel shows the open join (كِتَـ while building كِتَاب).
 */
export function partialWord(word: string, count: number): string {
  const letters = splitLetters(word);
  const n = Math.max(0, Math.min(count, letters.length));
  const text = letters
    .slice(0, n)
    .map((l) => l.text)
    .join('');
  if (n === 0 || n === letters.length) return text;
  const open = joinsNext(letters[n - 1].base) && joinsPrevious(letters[n].base);
  return open ? text + TATWEEL : text;
}

/** True when a letter of this word has a distinct initial and medial shape (good for the forms level). */
export function hasAllForms(letter: string): boolean {
  return joinsNext(letter) && joinsPrevious(letter);
}
