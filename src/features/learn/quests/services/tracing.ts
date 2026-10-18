import { samplePath } from '@/core/games/kit/pathSample';
import { letterStrokes } from '@/features/games/sections/arabic/shared/strokes';

/**
 * Letter tracing, checked by the letter's real shape: the learner follows the guide strokes of the letter
 * (games/sections/arabic/shared/strokes.ts, a 100 × 100 box) with a finger and then taps its dots.
 *
 * A letter counts as traced when
 * 1. every guide stroke is followed: the finger passes near both of its ends and near most of its checkpoints, in order
 *    along the stroke (either direction, and lifting the finger in between is fine),
 * 2. every dot is touched,
 * 3. most of the ink stays inside a band around the guide, and
 * 4. the drawn length stays close to the guide's length – so scribbling or filling the canvas never counts.
 * The thresholds are forgiving (a wide band), so a careful trace on a small phone passes.
 */

/** Side length of the square canvas (points). */
export const CANVAS_SIZE = 260;
/** Side length of the box the strokes are drawn in. */
export const BOX = 100;
/** How close (box units) the finger must pass to a checkpoint or dot. */
export const TOLERANCE = 13;
/** Ink farther than this from the guide (box units) counts as outside the line. */
export const BAND = 14;
/** Distance between two checkpoints along a guide stroke (box units). */
export const CHECKPOINT_STEP = 6;
/** Share of a stroke's checkpoints that must be passed in order. */
export const MIN_COVERAGE = 0.8;
/** Share of the ink that must stay inside the band. */
export const MIN_PRECISION = 0.85;
/** The ink may be at most this many times the guide's length (plus a little per dot). */
export const MAX_LENGTH_RATIO = 2.2;
/** Ink allowance per dot (box units). */
const DOT_LENGTH = 12;
/** Checkpoints that may be skipped in a row (a quick finger). */
const LOOKAHEAD = 3;
/** Resampling step of the drawn ink (box units). */
const INK_STEP = 2;
/** Finger movements shorter than this (box units) are ignored (jitter). */
export const MIN_SEGMENT = 0.8;

export interface Point {
  x: number;
  y: number;
}

/** The drawn ink: one list of points (box units) per finger stroke, in drawing order. */
export type Ink = readonly (readonly Point[])[];

export interface TraceGuide {
  /** Densely sampled guide strokes (box units). */
  strokes: Point[][];
  /** Checkpoints of every stroke, in writing order. */
  checkpoints: Point[][];
  dots: Point[];
  /** Total length of the guide strokes. */
  length: number;
}

export type TraceVerdict = 'empty' | 'keepGoing' | 'offTrack' | 'traced';

export interface TraceResult {
  /** 0..1 per guide stroke: share of its checkpoints passed in order. */
  coverage: number[];
  /** Per guide stroke: both of its ends were touched. */
  endsHit: boolean[];
  /** Per dot: touched. */
  dotsHit: boolean[];
  /** 0..1 share of the ink inside the band (1 without ink). */
  precision: number;
  /** Drawn length / allowed length of the guide. */
  lengthRatio: number;
  /** 0..1 shown in the progress bar. */
  progress: number;
  verdict: TraceVerdict;
}

const toPoint = ([x, y]: readonly [number, number]): Point => ({ x, y });
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

function polylineLength(points: readonly Point[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) length += dist(points[i - 1], points[i]);
  return length;
}

/** Every `step` units along a polyline, always with its first and last point. */
function checkpointsOf(points: readonly Point[], step: number): Point[] {
  if (points.length === 0) return [];
  const out = [points[0]];
  let since = 0;
  for (let i = 1; i < points.length; i++) {
    since += dist(points[i - 1], points[i]);
    if (since >= step) {
      out.push(points[i]);
      since = 0;
    }
  }
  const last = points[points.length - 1];
  if (out[out.length - 1] !== last) {
    // A last checkpoint very close to the previous one replaces it.
    if (out.length > 1 && dist(out[out.length - 1], last) < step / 2) out.pop();
    out.push(last);
  }
  return out;
}

/** Builds the guide of a set of SVG strokes and dots (box units). */
export function buildGuide(strokes: readonly string[], dots: readonly (readonly [number, number])[] = []): TraceGuide {
  const sampled = strokes.map((d) => samplePath(d, 1).map(toPoint));
  return {
    strokes: sampled,
    checkpoints: sampled.map((s) => checkpointsOf(s, CHECKPOINT_STEP)),
    dots: dots.map(toPoint),
    length: sampled.reduce((n, s) => n + polylineLength(s), 0),
  };
}

const guides = new Map<string, TraceGuide | null>();

/** The guide of a letter (or lam-elif); null for letters without stroke data. */
export function guideOfLetter(letter: string): TraceGuide | null {
  if (!guides.has(letter)) {
    const data = letterStrokes(letter);
    guides.set(letter, data ? buildGuide(data.strokes, data.dots) : null);
  }
  return guides.get(letter) ?? null;
}

/** Resamples a finger stroke so a quick movement does not jump over checkpoints. */
function densify(stroke: readonly Point[]): Point[] {
  if (stroke.length === 0) return [];
  const out = [stroke[0]];
  for (let i = 1; i < stroke.length; i++) {
    const a = stroke[i - 1];
    const b = stroke[i];
    const n = Math.max(1, Math.ceil(dist(a, b) / INK_STEP));
    for (let k = 1; k <= n; k++) out.push({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n });
  }
  return out;
}

/** Share of the checkpoints passed in order by the ink (skipping at most LOOKAHEAD in a row). */
function orderedCoverage(checkpoints: readonly Point[], ink: readonly Point[]): number {
  if (checkpoints.length === 0) return 1;
  let next = 0;
  let hits = 0;
  for (const p of ink) {
    if (next >= checkpoints.length) break;
    const end = Math.min(checkpoints.length, next + LOOKAHEAD + 1);
    for (let j = next; j < end; j++) {
      if (dist(p, checkpoints[j]) <= TOLERANCE) {
        hits++;
        next = j + 1;
        break;
      }
    }
  }
  return hits / checkpoints.length;
}

/** Checks the ink against the guide (pure). */
export function checkTrace(guide: TraceGuide, ink: Ink): TraceResult {
  const strokes = ink.filter((s) => s.length > 0).map(densify);
  const points = strokes.flat();
  const inkLength = strokes.reduce((n, s) => n + polylineLength(s), 0);

  if (points.length === 0) {
    return { coverage: guide.checkpoints.map(() => 0), endsHit: guide.checkpoints.map(() => false), dotsHit: guide.dots.map(() => false), precision: 1, lengthRatio: 0, progress: 0, verdict: 'empty' };
  }

  // A stroke may be followed in either direction (forward is the writing direction).
  const coverage = guide.checkpoints.map((cps) => Math.max(orderedCoverage(cps, points), orderedCoverage([...cps].reverse(), points)));
  const touched = (target: Point) => points.some((p) => dist(p, target) <= TOLERANCE);
  const endsHit = guide.checkpoints.map((cps) => cps.length > 0 && touched(cps[0]) && touched(cps[cps.length - 1]));
  const dotsHit = guide.dots.map(touched);

  const near = (p: Point) => guide.dots.some((d) => dist(p, d) <= BAND) || guide.strokes.some((s) => s.some((g) => dist(p, g) <= BAND));
  const precision = points.filter(near).length / points.length;
  const allowed = guide.length + guide.dots.length * DOT_LENGTH;
  const lengthRatio = allowed > 0 ? inkLength / allowed : 0;

  const followed = coverage.every((c) => c >= MIN_COVERAGE) && endsHit.every(Boolean) && dotsHit.every(Boolean);
  const clean = precision >= MIN_PRECISION && lengthRatio <= MAX_LENGTH_RATIO;
  const parts = [...coverage.map((c) => Math.min(1, c / MIN_COVERAGE)), ...dotsHit.map((hit) => (hit ? 1 : 0))];
  const progress = parts.length > 0 ? parts.reduce((a, b) => a + b, 0) / parts.length : 0;

  return {
    coverage,
    endsHit,
    dotsHit,
    precision,
    lengthRatio,
    progress: followed && clean ? 1 : Math.min(progress, 0.95),
    verdict: !clean ? 'offTrack' : followed ? 'traced' : 'keepGoing',
  };
}

/** True once the ink follows the letter (see {@link checkTrace}). */
export function isTraced(guide: TraceGuide, ink: Ink): boolean {
  return checkTrace(guide, ink).verdict === 'traced';
}

/** SVG path of the ink (box units) for drawing. */
export function inkPath(stroke: readonly Point[]): string {
  if (stroke.length === 0) return '';
  const [first, ...rest] = stroke;
  // A single point (a tap on a dot) is drawn as a tiny line so the round cap shows it.
  if (rest.length === 0) return `M${first.x.toFixed(1)} ${first.y.toFixed(1)} l0.1 0`;
  return `M${first.x.toFixed(1)} ${first.y.toFixed(1)}${rest.map((p) => ` L${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('')}`;
}
