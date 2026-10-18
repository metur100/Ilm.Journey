import { LETTERS } from '@/features/games/sections/arabic/shared/letters';
import { LETTER_STROKES } from '@/features/games/sections/arabic/shared/strokes';
import { BOX, checkTrace, guideOfLetter, inkPath, isTraced, type Point, type TraceGuide } from '@/features/learn/quests/services/tracing';

const ALL = [...LETTERS.map((l) => l.letter), 'لا'];

/** Deterministic pseudo-random numbers in [0, 1). */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

/** A careful trace: every stroke followed in writing order with a wobbly finger (±`wobble` units), dots tapped a bit off. */
function carefulTrace(guide: TraceGuide, wobble = 4, seed = 1): Point[][] {
  const random = rng(seed);
  const strokes = guide.strokes.map((stroke) =>
    stroke.filter((_, i) => i % 3 === 0 || i === stroke.length - 1).map((p, i) => ({ x: p.x + Math.sin(i / 2) * wobble, y: p.y + Math.cos(i / 3) * wobble * (random() - 0.5) * 2 })),
  );
  const taps = guide.dots.map((d) => [{ x: d.x + 4, y: d.y - 3 }]);
  return [...strokes, ...taps];
}

/** Fast zigzag scribbles over the whole canvas. */
function scribble(seed: number, count = 60): Point[][] {
  const random = rng(seed);
  return [Array.from({ length: count }, () => ({ x: random() * BOX, y: random() * BOX }))];
}

/** Fills the letter's bounding box row by row (what "enough ink" used to accept). */
function fillBox(guide: TraceGuide, rowGap = 6): Point[][] {
  const all = guide.strokes.flat();
  // At least 30 units wide (alif is a single line).
  const minX = Math.min(Math.min(...all.map((p) => p.x)), 35);
  const maxX = Math.max(Math.max(...all.map((p) => p.x)), 65);
  const minY = Math.min(...all.map((p) => p.y));
  const maxY = Math.max(...all.map((p) => p.y));
  const rows: Point[] = [];
  for (let y = minY, right = true; y <= maxY; y += rowGap, right = !right) rows.push({ x: right ? maxX : minX, y }, { x: right ? minX : maxX, y });
  return [rows];
}

describe('letter strokes', () => {
  it('has strokes for all 28 letters and lam-elif, inside the box', () => {
    for (const letter of ALL) {
      const guide = guideOfLetter(letter);
      expect(guide).not.toBeNull();
      expect(guide!.strokes.length).toBe(LETTER_STROKES[letter].strokes.length);
      for (const p of [...guide!.strokes.flat(), ...guide!.dots]) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(BOX);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(BOX);
      }
    }
    expect(guideOfLetter('x')).toBeNull();
  });

  it('gives each letter its number of dots', () => {
    for (const letter of LETTERS) expect(guideOfLetter(letter.letter)!.dots.length).toBe(letter.letter === 'ك' ? 1 : letter.dots);
  });
});

describe('tracing check', () => {
  it.each(ALL)('accepts a careful trace of %s', (letter) => {
    const guide = guideOfLetter(letter)!;
    for (const seed of [1, 2, 3]) expect(checkTrace(guide, carefulTrace(guide, 4, seed)).verdict).toBe('traced');
  });

  it.each(ALL)('accepts a trace of %s against the writing direction, with the finger lifted halfway', (letter) => {
    const guide = guideOfLetter(letter)!;
    const ink = carefulTrace(guide, 3).flatMap((stroke) => {
      const reversed = [...stroke].reverse();
      const half = Math.ceil(reversed.length / 2);
      return reversed.length > 2 ? [reversed.slice(0, half), reversed.slice(half)] : [reversed];
    });
    expect(isTraced(guide, ink)).toBe(true);
  });

  it.each(ALL)('rejects scribbles over the canvas for %s', (letter) => {
    const guide = guideOfLetter(letter)!;
    for (const seed of [7, 8, 9]) {
      expect(checkTrace(guide, scribble(seed)).verdict).not.toBe('traced');
      expect(checkTrace(guide, scribble(seed, 400)).verdict).not.toBe('traced');
    }
  });

  it.each(ALL)('rejects filling the area of %s', (letter) => {
    const guide = guideOfLetter(letter)!;
    expect(isTraced(guide, fillBox(guide))).toBe(false);
    // Filling and then tracing on top still is mostly scribble.
    expect(isTraced(guide, [...fillBox(guide, 4), ...carefulTrace(guide)])).toBe(false);
  });

  it.each(ALL)('rejects a partial trace of %s', (letter) => {
    const guide = guideOfLetter(letter)!;
    const full = carefulTrace(guide, 3);
    const strokes = full.slice(0, guide.strokes.length);
    // Only the first half of every stroke, dots tapped.
    const half = strokes.map((s) => s.slice(0, Math.floor(s.length / 2)));
    const result = checkTrace(guide, [...half, ...full.slice(guide.strokes.length)]);
    expect(result.verdict).toBe('keepGoing');
    expect(result.progress).toBeLessThan(1);
  });

  it('needs the dots and every stroke', () => {
    const be = guideOfLetter('ب')!;
    const body = carefulTrace(be).slice(0, 1);
    expect(checkTrace(be, body).verdict).toBe('keepGoing');
    expect(checkTrace(be, body).dotsHit).toEqual([false]);
    const ti = guideOfLetter('ط')!;
    expect(isTraced(ti, carefulTrace(ti).slice(0, 1))).toBe(false);
  });

  it.each([
    ['ا', 'ب'],
    ['د', 'ل'],
    ['ب', 'ج'],
    ['س', 'ع'],
    ['م', 'ك'],
    ['ه', 'ي'],
    ['ر', 'د'],
  ])('rejects %s traced on the guide of %s', (drawn, shown) => {
    const guide = guideOfLetter(shown)!;
    const body = carefulTrace(guideOfLetter(drawn)!).slice(0, guideOfLetter(drawn)!.strokes.length);
    // Even with the dots of the shown letter tapped.
    expect(isTraced(guide, [...body, ...guide.dots.map((d) => [d])])).toBe(false);
  });

  it('reports an empty canvas and draws ink as SVG paths', () => {
    const guide = guideOfLetter('ا')!;
    expect(checkTrace(guide, [])).toMatchObject({ verdict: 'empty', progress: 0 });
    expect(inkPath([{ x: 1, y: 2 }])).toBe('M1.0 2.0 l0.1 0');
    expect(inkPath([{ x: 1, y: 2 }, { x: 3, y: 4 }])).toBe('M1.0 2.0 L3.0 4.0');
  });
});
