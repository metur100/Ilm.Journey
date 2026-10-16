/*
 * Fair Measure – pure rules. Every round one pan holds a fixed load; the learner adds pieces to the other pan until
 * the beam is level (exactly balanced). Too much is a gentle mistake and the last piece comes back.
 *  - weigh: the customer's grain is on the left; put brass weights on the right (11:84–85 "full measure and weight").
 *  - measure: the weights asked for are on the right; scoop grain onto the left – give full measure (7:85).
 */

export type ScaleMode = 'weigh' | 'measure';

export interface ScaleRound {
  /** Weight of the fixed load. */
  load: number;
}

export interface ScaleConfig {
  mode: ScaleMode;
  rounds: ScaleRound[];
  /** Sizes of the pieces in the tray (unlimited). */
  pieces: number[];
  /** Show the load's number (L1). */
  showLoad: boolean;
  hints: boolean;
}

export const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);

/** Beam tilt in degrees: negative = the left pan is heavier (down). */
export function tilt(left: number, right: number, perUnit = 4, max = 16): number {
  return Math.max(-max, Math.min(max, (right - left) * perUnit));
}

export type AddResult = 'more' | 'balanced' | 'over';

export function addPiece(load: number, placed: readonly number[], piece: number): AddResult {
  const total = sum(placed) + piece;
  return total === load ? 'balanced' : total < load ? 'more' : 'over';
}

/** The biggest piece that still fits (the learner's best next move), or null. */
export function bestPiece(load: number, placed: readonly number[], pieces: readonly number[]): number | null {
  const rest = load - sum(placed);
  const fit = [...pieces].sort((a, b) => b - a).find((p) => p <= rest);
  return fit ?? null;
}

/** Fewest pieces needed to balance (greedy works for the coin-like sets used here). */
export function piecesNeeded(load: number, pieces: readonly number[]): number {
  let rest = load;
  let n = 0;
  for (const p of [...pieces].sort((a, b) => b - a)) {
    n += Math.floor(rest / p);
    rest %= p;
  }
  return rest === 0 ? n : Number.POSITIVE_INFINITY;
}

export const LEVEL_1: ScaleConfig = { mode: 'weigh', rounds: [{ load: 3 }, { load: 6 }, { load: 8 }], pieces: [1, 2, 5], showLoad: true, hints: true };
export const LEVEL_2: ScaleConfig = { mode: 'weigh', rounds: [{ load: 7 }, { load: 9 }, { load: 4 }, { load: 12 }], pieces: [1, 2, 5], showLoad: false, hints: false };
export const LEVEL_3: ScaleConfig = { mode: 'measure', rounds: [{ load: 5 }, { load: 7 }, { load: 9 }], pieces: [1, 3], showLoad: true, hints: false };
