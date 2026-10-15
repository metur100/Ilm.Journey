import type { GameResultInput } from '@/core/games';
import type { SourceRef } from '@/core/models';

import { JERUSALEM, MADINAH, MAKKAH, SOURCE_REFS } from './content';

/*
 * Pure rules of Build the Masjid: the parts, where they stand on the building site, which part must come first,
 * the qibla directions from Madinah (great-circle bearings) and scoring.
 *
 * The site is the 360 × 260 viewBox of the `seerah.masjid-*` art layers. `project` mirrors the oblique projection of
 * src/core/art/pieces/sections/seerah.tsx: u runs west → east, v north → south (back → front), z is the height.
 */

export const SITE = { w: 360, h: 260 };
export const WALL_H = 34;
export const ROOF_Z = 30;

export function project(u: number, v: number, z = 0): { x: number; y: number } {
  return { x: 100 + 200 * u - 46 * v, y: 150 + 64 * v - z };
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type PartId = 'ground' | 'walls' | 'pillars' | 'roof' | 'shade-south' | 'suffa';

/** How a placed layer appears: settles on the ground, rises up, drops down from above. */
export type Appear = 'settle' | 'rise' | 'drop';

type Uvz = [u: number, v: number, z?: number];

export interface PartSpec {
  id: PartId;
  /** Parts that must stand before this one ("build from the ground up"). */
  requires: PartId[];
  /** Outline of the place on the site (u, v, z) – the glowing slot in level 1. */
  outline: Uvz[];
  /** Art layers the part adds to the scene. */
  layers: string[];
  appear: Appear;
  /** Sources of the inline caption. */
  sources: SourceRef[];
  /** Padding of the drop zone around the slot (smaller where two places are close). */
  pad?: number;
}

const hadith = (n: string): SourceRef => ({ sourceName: 'Sahih al-Bukhari', sourceReference: n });

export const PARTS: Record<PartId, PartSpec> = {
  ground: {
    id: 'ground',
    requires: [],
    outline: [[0, 0], [1, 0], [1, 1], [0, 1]],
    layers: ['seerah.masjid-plot'],
    appear: 'settle',
    sources: [SOURCE_REFS['bukhari-428'], SOURCE_REFS['bukhari-3905']],
  },
  walls: {
    id: 'walls',
    requires: ['ground'],
    outline: [[0, 0, WALL_H], [1, 0, WALL_H], [1, 1], [0, 1]],
    layers: ['seerah.masjid-walls', 'seerah.masjid-walls-front'],
    appear: 'rise',
    sources: [hadith('446'), SOURCE_REFS['bukhari-428']],
  },
  pillars: {
    id: 'pillars',
    requires: ['ground'],
    outline: [[0.06, 0.1, ROOF_Z], [0.94, 0.1, ROOF_Z], [0.94, 0.3], [0.06, 0.3]],
    layers: ['seerah.masjid-pillars'],
    appear: 'rise',
    sources: [hadith('446')],
  },
  roof: {
    id: 'roof',
    requires: ['pillars'],
    outline: [[0.02, 0.02, ROOF_Z], [0.98, 0.02, ROOF_Z], [0.98, 0.36, ROOF_Z], [0.02, 0.36, ROOF_Z]],
    layers: ['seerah.masjid-roof'],
    appear: 'drop',
    sources: [hadith('446')],
  },
  'shade-south': {
    id: 'shade-south',
    requires: ['roof'],
    outline: [[0.02, 0.74, ROOF_Z], [0.98, 0.74, ROOF_Z], [0.98, 0.95], [0.02, 0.95]],
    layers: ['seerah.masjid-shade-south'],
    appear: 'drop',
    sources: [SOURCE_REFS['q-2-144']],
    pad: 8,
  },
  suffa: {
    id: 'suffa',
    requires: ['roof'],
    outline: [[0.06, 0.045, 6], [0.52, 0.045, 6], [0.52, 0.17], [0.06, 0.17]],
    layers: ['seerah.masjid-suffa'],
    appear: 'rise',
    sources: [hadith('602')],
    pad: 10,
  },
};

/** Drawing order of the layers (back to front); the sky is below, `masjid-foreground` above. */
export const LAYER_ORDER = [
  'seerah.masjid-plot',
  'seerah.masjid-walls',
  'seerah.masjid-suffa',
  'seerah.masjid-pillars',
  'seerah.masjid-roof',
  'seerah.masjid-shade-south',
  'seerah.masjid-walls-front',
];

export const outlinePoints = (id: PartId) => PARTS[id].outline.map(([u, v, z]) => project(u, v, z ?? 0));

/** Bounding box of a part's outline (site units). */
export function slotBox(id: PartId): Rect {
  const pts = outlinePoints(id);
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/** Where a drop counts for a part: its slot, generously padded (fingers are wide). */
export function dropZone(id: PartId, pad = PARTS[id].pad ?? 18): Rect {
  const b = slotBox(id);
  return { x: b.x - pad, y: b.y - pad, w: b.w + pad * 2, h: b.h + pad * 2 };
}

export const slotCentre = (id: PartId) => {
  const b = slotBox(id);
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
};

export type PlacementResult = { ok: true } | { ok: false; reason: 'placed' | 'wrong-spot' } | { ok: false; reason: 'needs-first'; missing: PartId };

const inside = (r: Rect, x: number, y: number) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

/**
 * Assembly validation: a part may be placed when it is not placed yet, the drop point lies in its zone and the parts
 * it needs already stand (the missing one is reported – the game says "first the …"). `point` null = tapped.
 */
export function checkPlacement(partId: PartId, placed: readonly PartId[], point: { x: number; y: number } | null): PlacementResult {
  if (placed.includes(partId)) return { ok: false, reason: 'placed' };
  const missing = PARTS[partId].requires.find((r) => !placed.includes(r));
  if (missing) return { ok: false, reason: 'needs-first', missing };
  if (point && !inside(dropZone(partId), point.x, point.y)) return { ok: false, reason: 'wrong-spot' };
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
  const d = ((((a - b) % 360) + 540) % 360) - 180;
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
