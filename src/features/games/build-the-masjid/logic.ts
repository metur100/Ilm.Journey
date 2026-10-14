import type { GameResultInput } from '@/core/games';

import { FIRST_PROJECT, JERUSALEM, MADINAH, MAKKAH, MOSQUE_DATE, MOSQUE_LAND, OASIS, QIBLA_DATE, QIBLA_JERUSALEM, type SeerahBlock, type SeerahDate } from './content';

/*
 * Pure rules of Build the Masjid: the parts, where they go on the building site (viewBox 300 × 190), which part must
 * come first, the qibla directions from Madinah (great-circle bearings) and scoring.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type PartId = 'plot' | 'walls' | 'qibla-wall' | 'palms';

export interface PartSpec {
  id: PartId;
  /** Parts that must stand before this one ("build from the ground up"). */
  requires: PartId[];
  /** Where the finished part is drawn on the site (site units). */
  slot: Rect;
  /** Where a drop counts for this part (one or more areas, site units). */
  zones: Rect[];
  /** Drawing order (back to front). */
  z: number;
  /** The Seerah block the part reveals, with the event date. */
  block: SeerahBlock;
  date: SeerahDate | null;
  art: string;
}

export const SITE = { w: 300, h: 190 };

export const PARTS: Record<PartId, PartSpec> = {
  plot: {
    id: 'plot',
    requires: [],
    slot: { x: 14, y: 144, w: 272, h: 40 },
    zones: [{ x: 0, y: 112, w: 300, h: 78 }],
    z: 0,
    block: MOSQUE_LAND,
    date: MOSQUE_DATE,
    art: 'place.masjid-nabawi-early',
  },
  walls: {
    id: 'walls',
    requires: ['plot'],
    slot: { x: 34, y: 66, w: 232, h: 96 },
    zones: [
      { x: 0, y: 40, w: 125, h: 130 },
      { x: 175, y: 40, w: 125, h: 130 },
    ],
    z: 2,
    block: FIRST_PROJECT,
    date: MOSQUE_DATE,
    art: 'place.masjid-nabawi-early',
  },
  'qibla-wall': {
    id: 'qibla-wall',
    requires: ['walls'],
    slot: { x: 62, y: 76, w: 176, h: 84 },
    zones: [{ x: 70, y: 40, w: 160, h: 115 }],
    z: 1,
    block: QIBLA_JERUSALEM,
    date: QIBLA_DATE,
    art: 'object.compass',
  },
  palms: {
    id: 'palms',
    requires: ['plot'],
    slot: { x: 0, y: 14, w: 300, h: 150 },
    zones: [
      { x: 0, y: 0, w: 70, h: 170 },
      { x: 230, y: 0, w: 70, h: 170 },
    ],
    z: 3,
    block: OASIS,
    date: null,
    art: 'garden.palm',
  },
};

export type PlacementResult = { ok: true } | { ok: false; reason: 'placed' | 'wrong-spot' } | { ok: false; reason: 'needs-first'; missing: PartId };

const inside = (r: Rect, x: number, y: number) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

/**
 * Assembly validation: a part may be placed when it is not placed yet, the drop point lies in one of its zones and the
 * parts it needs already stand (the missing one is reported – the game says "first the …").
 */
export function checkPlacement(partId: PartId, placed: readonly PartId[], point: { x: number; y: number } | null): PlacementResult {
  if (placed.includes(partId)) return { ok: false, reason: 'placed' };
  const spec = PARTS[partId];
  if (point && !spec.zones.some((z) => inside(z, point.x, point.y))) return { ok: false, reason: 'wrong-spot' };
  const missing = spec.requires.find((r) => !placed.includes(r));
  if (missing) return { ok: false, reason: 'needs-first', missing };
  return { ok: true };
}

/** The next part a guided learner should place (first in `order` whose requirements stand). */
export function nextPart(order: readonly PartId[], placed: readonly PartId[]): PartId | null {
  return order.find((id) => !placed.includes(id) && PARTS[id].requires.every((r) => placed.includes(r))) ?? null;
}

/** Points per part: 10 when placed without a wrong drop, 6 otherwise. */
export function buildScore(parts: number, partsWithMistakes: number): { score: number; maxScore: number } {
  return { score: (parts - partsWithMistakes) * 10 + partsWithMistakes * 6, maxScore: parts * 10 };
}

// ---------- qibla ----------

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Initial great-circle bearing from `a` to `b`, degrees clockwise from north (0–360). */
export function bearing(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const phi1 = rad(a.lat);
  const phi2 = rad(b.lat);
  const dLon = rad(b.lon - a.lon);
  const y = Math.sin(dLon) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

/** Direction of the first qibla (Jerusalem) and of the Kaʿbah, seen from Madinah. */
export const JERUSALEM_BEARING = bearing(MADINAH, JERUSALEM);
export const KAABA_BEARING = bearing(MADINAH, MAKKAH);

/** Signed difference a − b in (−180, 180]. */
export function angleDiff(a: number, b: number): number {
  const d = (((a - b) % 360) + 540) % 360 - 180;
  return d === -180 ? 180 : d;
}

export const normalize = (a: number) => ((a % 360) + 360) % 360;

/** Angle of a point around a centre, degrees clockwise from "up" (north on the plan), screen y pointing down. */
export function angleFromCenter(dx: number, dy: number): number {
  return normalize(deg(Math.atan2(dx, -dy)));
}

export const QIBLA_TOLERANCE = 20;

export type QiblaCheck = 'kaaba' | 'jerusalem' | 'other';

/** Where does the arrow point? Towards the Kaʿbah (within the tolerance), still towards Jerusalem, or elsewhere. */
export function checkQibla(angle: number, tolerance = QIBLA_TOLERANCE): QiblaCheck {
  if (Math.abs(angleDiff(angle, KAABA_BEARING)) <= tolerance) return 'kaaba';
  if (Math.abs(angleDiff(angle, JERUSALEM_BEARING)) <= 10) return 'jerusalem';
  return 'other';
}

/** The rotation to animate to: `target` expressed close to `current` (no spinning the long way round). */
export function nearestTurn(current: number, target: number): number {
  return current + angleDiff(target, current);
}

/** Qibla points: 30 at the first try, 20 after one wrong direction, 10 after more. */
export function qiblaScore(mistakes: number): { score: number; maxScore: number } {
  return { score: mistakes === 0 ? 30 : mistakes === 1 ? 20 : 10, maxScore: 30 };
}

// ---------- result ----------

export function starsFor(score: number, maxScore: number): number {
  const ratio = maxScore === 0 ? 1 : score / maxScore;
  return ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1;
}

export const QIBLA_FACT_ID = 'qibla-change';

export interface MasjidOutcome {
  parts: number;
  partsWithMistakes: number;
  buildMistakes: number;
  /** Level 3 only. */
  qiblaMistakes?: number;
}

export function masjidResult(o: MasjidOutcome): GameResultInput {
  const b = buildScore(o.parts, o.partsWithMistakes);
  const q = o.qiblaMistakes === undefined ? { score: 0, maxScore: 0 } : qiblaScore(o.qiblaMistakes);
  const score = b.score + q.score;
  const maxScore = b.maxScore + q.maxScore;
  return {
    score,
    maxScore,
    stars: starsFor(score, maxScore),
    mistakes: o.buildMistakes + (o.qiblaMistakes ?? 0),
    factsMissed: (o.qiblaMistakes ?? 0) > 0 ? [QIBLA_FACT_ID] : [],
  };
}
