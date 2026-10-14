/**
 * Letter tracing (islam-quest TracingView): the learner draws over a large guide letter; every stroke is kept as an
 * SVG path and the drawn length is summed. Once enough has been traced the next letter unlocks.
 */

/** Minimum drawn length (in points) before a letter counts as traced. */
export const REQUIRED_LENGTH = 260;
/** Side length of the square canvas. */
export const CANVAS_SIZE = 260;
/** Movements shorter than this are ignored (finger jitter). */
export const MIN_SEGMENT = 2;

export interface Point {
  x: number;
  y: number;
}

export interface TraceState {
  /** One SVG path per stroke. */
  paths: string[];
  /** Total drawn length over all strokes. */
  length: number;
  /** Last point of the current stroke (null between strokes). */
  last: Point | null;
}

export const EMPTY_TRACE: TraceState = { paths: [], length: 0, last: null };

const fmt = (n: number) => n.toFixed(1);

/** Starts a new stroke at a point. */
export function startStroke(state: TraceState, p: Point): TraceState {
  return { paths: [...state.paths, `M${fmt(p.x)} ${fmt(p.y)}`], length: state.length, last: p };
}

/** Extends the current stroke; tiny movements are ignored. */
export function extendStroke(state: TraceState, p: Point): TraceState {
  if (!state.last || state.paths.length === 0) return startStroke(state, p);
  const dist = Math.hypot(p.x - state.last.x, p.y - state.last.y);
  if (dist < MIN_SEGMENT) return state;
  const paths = [...state.paths];
  paths[paths.length - 1] = `${paths[paths.length - 1]} L${fmt(p.x)} ${fmt(p.y)}`;
  return { paths, length: state.length + dist, last: p };
}

export function endStroke(state: TraceState): TraceState {
  return { ...state, last: null };
}

export function isTraced(state: Pick<TraceState, 'length'>, required = REQUIRED_LENGTH): boolean {
  return state.length >= required;
}

/** 0..1 progress towards a traced letter (for the accessible progress text and the ring). */
export function traceProgress(state: Pick<TraceState, 'length'>, required = REQUIRED_LENGTH): number {
  return Math.max(0, Math.min(1, state.length / required));
}
