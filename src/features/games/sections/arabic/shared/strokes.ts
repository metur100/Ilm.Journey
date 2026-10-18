/*
 * Writing strokes of the letters (isolated forms, Naskh-like), used to trace a letter by its real shape: the Learn tab's
 * tracing pad (src/features/learn/quests/services/tracing.ts) and the Letter Tracing game.
 *
 * Every letter is drawn in a 100 × 100 box (y grows downwards, the writing line is at about y = 66). `strokes` are SVG
 * paths (absolute M, L, Q, C) in writing order, each one starting where the pen starts – Arabic is written from right to
 * left, so most strokes start on the right. `dots` are the letter's dots (and the small mark of kef) as points.
 * Hand-drawn guides, not font outlines: the shape of each letter is simplified for little fingers.
 */

export type StrokePoint = readonly [number, number];

export interface LetterStrokes {
  /** Body strokes in writing order (SVG paths in the 100 × 100 box). */
  strokes: readonly string[];
  /** Dots, drawn after the body. */
  dots?: readonly StrokePoint[];
}

/** The body of be, te and se (a flat bowl with two raised ends). */
const BE_BODY = 'M82 44 C84 62 78 68 64 68 L36 68 C22 68 16 62 16 46';
/** The body of džim, ha and hı: the head from left to right and back, then the deep bowl. */
const DZIM_BODY = 'M30 30 Q52 22 72 28 L36 48 C14 62 22 88 50 88 Q68 88 80 78';
/** The body of dal and zel. */
const DAL_BODY = 'M42 28 Q62 46 62 60 Q62 68 50 68 L30 68';
/** The body of ra and ze. */
const RA_BODY = 'M62 40 Q68 58 58 72 Q48 86 28 88';
/** The body of sin and šin: three teeth and the open bowl. */
const SIN_BODY = 'M90 44 Q90 62 83 62 Q76 62 76 50 Q76 62 69 62 Q62 62 62 50 L62 64 C62 86 24 90 16 64';
/** The body of sad and dad: the loop, a small tooth and the open bowl. */
const SAD_BODY = 'M58 62 Q60 42 80 42 Q94 44 90 58 Q86 64 62 64 Q52 64 52 54 L52 64 C52 86 18 90 12 64';
/** The loop of tı and zı. */
const TI_LOOP = 'M34 66 Q36 46 60 46 Q82 46 82 58 Q82 68 66 68 L22 68';
/** The upright of tı and zı. */
const TI_UPRIGHT = 'M40 16 L40 66';
/** The body of ajn and gajn: the open head, then the bowl. */
const AJN_BODY = 'M68 30 Q56 20 46 28 Q38 38 50 46 Q58 50 70 48 Q44 52 38 66 Q34 88 62 88 Q74 88 82 80';

export const LETTER_STROKES: Readonly<Record<string, LetterStrokes>> = {
  ا: { strokes: ['M50 14 L50 84'] },
  ب: { strokes: [BE_BODY], dots: [[50, 82]] },
  ت: { strokes: [BE_BODY], dots: [[43, 52], [57, 52]] },
  ث: { strokes: [BE_BODY], dots: [[43, 54], [57, 54], [50, 42]] },
  ج: { strokes: [DZIM_BODY], dots: [[52, 66]] },
  ح: { strokes: [DZIM_BODY] },
  خ: { strokes: [DZIM_BODY], dots: [[50, 12]] },
  د: { strokes: [DAL_BODY] },
  ذ: { strokes: [DAL_BODY], dots: [[40, 14]] },
  ر: { strokes: [RA_BODY] },
  ز: { strokes: [RA_BODY], dots: [[62, 26]] },
  س: { strokes: [SIN_BODY] },
  ش: { strokes: [SIN_BODY], dots: [[69, 36], [83, 36], [76, 25]] },
  ص: { strokes: [SAD_BODY] },
  ض: { strokes: [SAD_BODY], dots: [[74, 28]] },
  ط: { strokes: [TI_LOOP, TI_UPRIGHT] },
  ظ: { strokes: [TI_LOOP, TI_UPRIGHT], dots: [[60, 32]] },
  ع: { strokes: [AJN_BODY] },
  غ: { strokes: [AJN_BODY], dots: [[56, 12]] },
  ف: { strokes: ['M74 52 Q62 52 62 42 Q64 32 74 34 Q82 38 80 54 Q76 66 60 66 L30 66 C20 66 14 60 14 46'], dots: [[72, 20]] },
  ق: { strokes: ['M68 50 Q56 50 56 40 Q58 30 68 32 Q78 36 76 54 C74 82 44 88 30 80 C20 74 20 62 24 54'], dots: [[60, 16], [74, 16]] },
  ك: { strokes: ['M32 14 L28 60 Q28 68 38 68 L74 68 Q86 68 86 54'], dots: [[56, 44]] },
  ل: { strokes: ['M66 12 L66 60 C66 86 28 88 22 66'] },
  م: { strokes: ['M46 56 C42 42 54 34 62 42 C70 50 62 62 50 59 Q38 60 38 72 L38 90'] },
  ن: { strokes: ['M80 42 C82 76 60 86 46 86 C28 86 18 72 20 50'], dots: [[50, 34]] },
  ه: { strokes: ['M56 30 C34 34 30 72 52 72 C72 72 72 44 56 30'] },
  و: { strokes: ['M66 52 Q54 52 54 42 Q56 32 66 34 Q76 38 74 54 Q70 76 48 86 L34 88'] },
  ي: { strokes: ['M66 28 Q48 28 50 40 Q52 50 70 50 Q86 52 82 64 Q76 80 50 80 Q28 80 20 64'], dots: [[44, 92], [58, 92]] },
  لا: { strokes: ['M72 12 L58 58 Q54 72 44 70 Q36 66 40 58', 'M26 14 L46 66'] },
};

/** Strokes of a letter (or of lam-elif), or undefined for anything else. */
export function letterStrokes(letter: string): LetterStrokes | undefined {
  return LETTER_STROKES[letter];
}
