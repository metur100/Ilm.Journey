import { projectHijaz } from '@/core/art';
import type { GameResultInput } from '@/core/games';
import { hashString, seededRandom, shuffleNotIdentity } from '@/core/utils/random';

import { CHECKPOINTS, ROUTE_HIJRAH } from './content';

/*
 * Pure rules of Hijrah Path: route geometry on `scene.map-hijaz` (viewBox 300 × 400, `projectHijaz`), finger tracing
 * with a path tolerance, checkpoint detection in order, ordering of the event cards (level 3) and scoring.
 */

export interface Pt {
  x: number;
  y: number;
}

export interface Route {
  points: Pt[];
  /** Cumulative arc length at each point (map units). */
  cum: number[];
  length: number;
}

export function buildRoute(points: readonly Pt[]): Route {
  const cum = [0];
  for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  return { points: [...points], cum, length: cum[cum.length - 1] };
}

/** The Hijrah route of the Seerah content projected onto the Hijaz map. */
export const HIJRAH_ROUTE: Route = buildRoute(ROUTE_HIJRAH.map((p) => projectHijaz(p.lon, p.lat)));

/** Arc length of each checkpoint along the route. */
export const CHECKPOINT_ARCS: number[] = CHECKPOINTS.map((c) => HIJRAH_ROUTE.cum[c.routeIndex]);

/** Real map position of each checkpoint. */
export const CHECKPOINT_POINTS: Pt[] = CHECKPOINTS.map((c) => HIJRAH_ROUTE.points[c.routeIndex]);

/** Closest point of the route to `p`: its arc length `s` and the distance `d`. */
export function projectOnRoute(route: Route, p: Pt): { s: number; d: number; x: number; y: number } {
  let best = { s: 0, d: Infinity, x: route.points[0].x, y: route.points[0].y };
  for (let i = 1; i < route.points.length; i++) {
    const a = route.points[i - 1];
    const b = route.points[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
    const x = a.x + t * dx;
    const y = a.y + t * dy;
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < best.d) best = { s: route.cum[i - 1] + t * Math.sqrt(len2), d, x, y };
  }
  return best;
}

/** The point at arc length `s`. */
export function pointAt(route: Route, s: number): Pt {
  const clamped = Math.max(0, Math.min(route.length, s));
  for (let i = 1; i < route.points.length; i++) {
    if (clamped <= route.cum[i] || i === route.points.length - 1) {
      const seg = route.cum[i] - route.cum[i - 1];
      const t = seg === 0 ? 0 : (clamped - route.cum[i - 1]) / seg;
      const a = route.points[i - 1];
      const b = route.points[i];
      return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
    }
  }
  return route.points[0];
}

/** The travelled part of the route (from the start to arc length `s`) as points. */
export function routeUntil(route: Route, s: number): Pt[] {
  const pts: Pt[] = [route.points[0]];
  for (let i = 1; i < route.points.length && route.cum[i] < s; i++) pts.push(route.points[i]);
  pts.push(pointAt(route, s));
  return pts;
}

export const toPath = (pts: readonly Pt[]) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');

// ---------- tracing ----------

export interface TraceOptions {
  /** Max distance (map units) from the route that still counts as "on the path". */
  tolerance: number;
  /** Max arc length the finger may jump ahead of the traveller (touching far ahead does not count). */
  maxJump: number;
}

export interface TraceState {
  /** Arc length reached so far. */
  progress: number;
  /** Number of checkpoints reached (in order). */
  reached: number;
  onSamples: number;
  offSamples: number;
  /** How often the finger left the path (each excursion counts once). */
  offEpisodes: number;
  off: boolean;
  /** The last sample was near the path but too far ahead of the traveller. */
  ahead: boolean;
}

/** A checkpoint counts as reached this close (arc length, map units) – fingers are wider than pins. */
export const REACH = 4;

export const INITIAL_TRACE: TraceState = { progress: 0, reached: 0, onSamples: 0, offSamples: 0, offEpisodes: 0, off: false, ahead: false };

/**
 * One finger sample. On the path (distance ≤ tolerance) the traveller follows the finger forward, but stops at the next
 * checkpoint: reaching it increments `reached` (one checkpoint per sample, so close checkpoints are revealed one by one).
 */
export function traceStep(route: Route, stops: readonly number[], state: TraceState, p: Pt, opts: TraceOptions): TraceState {
  const proj = projectOnRoute(route, p);
  if (proj.d > opts.tolerance) {
    return { ...state, offSamples: state.offSamples + 1, offEpisodes: state.off ? state.offEpisodes : state.offEpisodes + 1, off: true, ahead: false };
  }
  const next: TraceState = { ...state, onSamples: state.onSamples + 1, off: false, ahead: false };
  if (state.reached >= stops.length) return next;
  if (proj.s > state.progress + opts.maxJump) return { ...next, ahead: true };
  const cap = stops[state.reached];
  next.progress = Math.min(Math.max(state.progress, proj.s), cap);
  if (next.progress >= cap - REACH) {
    next.progress = cap;
    next.reached = state.reached + 1;
  }
  return next;
}

/** Tap alternative (accessibility): move the traveller to the next checkpoint without counting samples. */
export function jumpToNext(stops: readonly number[], state: TraceState): TraceState {
  if (state.reached >= stops.length) return state;
  return { ...state, progress: Math.max(state.progress, stops[state.reached]), reached: state.reached + 1, off: false, ahead: false };
}

/** Share of samples on the path (1 when the learner used only the tap alternative). */
export function accuracy(state: TraceState): number {
  const total = state.onSamples + state.offSamples;
  return total === 0 ? 1 : state.onSamples / total;
}

/** Tracing points: 4 per checkpoint + up to 30 for staying near the path → 50 for five checkpoints. */
export function traceScore(state: TraceState, checkpoints: number): { score: number; maxScore: number } {
  return { score: state.reached * 4 + Math.round(accuracy(state) * 30), maxScore: checkpoints * 4 + 30 };
}

// ---------- ordering (level 3) ----------

/** The checkpoint cards in a shuffled (deterministic, never already sorted) order for the ordering step. */
export function shuffledCards(seed: string): string[] {
  return shuffleNotIdentity(
    CHECKPOINTS.map((c) => c.id),
    seededRandom(hashString(seed)),
  );
}

/** Is `cardId` the event that belongs into timeline slot `slot` (0-based, chronological)? */
export function isRightSlot(correctOrder: readonly string[], slot: number, cardId: string): boolean {
  return correctOrder[slot] === cardId;
}

/** First empty slot (or -1). */
export function firstEmptySlot(slots: readonly (string | null)[]): number {
  return slots.findIndex((s) => s === null);
}

/** Ordering points: 10 per card placed right at the first try, 5 after a retry. */
export function orderScore(cards: number, cardsWithMistakes: number): { score: number; maxScore: number } {
  return { score: (cards - cardsWithMistakes) * 10 + cardsWithMistakes * 5, maxScore: cards * 10 };
}

// ---------- result ----------

export function starsFor(score: number, maxScore: number): number {
  const ratio = maxScore === 0 ? 1 : score / maxScore;
  return ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1;
}

export interface HijrahOutcome {
  trace: TraceState;
  /** Level 3 only. */
  ordering?: { mistakes: number; cardsWithMistakes: number };
}

/** The fact reported as missed when the learner put the events in a wrong order. */
export const ORDER_FACT_ID = 'hijrah-order';

export function hijrahResult(outcome: HijrahOutcome, checkpoints: number = CHECKPOINTS.length): GameResultInput {
  const t = traceScore(outcome.trace, checkpoints);
  const o = outcome.ordering ? orderScore(checkpoints, outcome.ordering.cardsWithMistakes) : { score: 0, maxScore: 0 };
  const score = t.score + o.score;
  const maxScore = t.maxScore + o.maxScore;
  return {
    score,
    maxScore,
    stars: starsFor(score, maxScore),
    mistakes: outcome.trace.offEpisodes + (outcome.ordering?.mistakes ?? 0),
    factsMissed: outcome.ordering && outcome.ordering.mistakes > 0 ? [ORDER_FACT_ID] : [],
  };
}
