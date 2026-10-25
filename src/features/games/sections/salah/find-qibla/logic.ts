import type { GameResultInput } from '@/core/games';
import { shuffle } from '@/core/utils/random';

import { QIBLA_FACTS } from './content';

/*
 * Find the Qibla – the maths. The qibla direction from a place is the initial bearing of the great circle (the
 * shortest path on the globe) from that place to the Kaaba. This is a method note (spherical trigonometry), not a
 * religious source; the religious part (facing the Kaaba) is sourced in ./content.ts.
 */

export interface LatLon {
  lat: number;
  lon: number;
}

/** The Kaaba in Makkah. */
export const KAABA: LatLon = { lat: 21.4225, lon: 39.8262 };

export type CityId = 'duesseldorf' | 'sarajevo' | 'vienna' | 'london' | 'new-york' | 'istanbul' | 'cairo' | 'jakarta' | 'cape-town' | 'tokyo' | 'sydney' | 'moscow';

export const CITIES: Record<CityId, LatLon> = {
  duesseldorf: { lat: 51.2277, lon: 6.7735 },
  sarajevo: { lat: 43.8563, lon: 18.4131 },
  vienna: { lat: 48.2082, lon: 16.3738 },
  london: { lat: 51.5074, lon: -0.1278 },
  'new-york': { lat: 40.7128, lon: -74.006 },
  istanbul: { lat: 41.0082, lon: 28.9784 },
  cairo: { lat: 30.0444, lon: 31.2357 },
  jakarta: { lat: -6.2088, lon: 106.8456 },
  'cape-town': { lat: -33.9249, lon: 18.4241 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
  sydney: { lat: -33.8688, lon: 151.2093 },
  moscow: { lat: 55.7558, lon: 37.6173 },
};

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

/** Normalises an angle to [0, 360). */
export function normalizeDeg(deg: number): number {
  'worklet';
  const d = deg % 360;
  return d < 0 ? d + 360 : d;
}

/** Initial great-circle bearing from `from` to `to`, degrees clockwise from true north, in [0, 360). */
export function initialBearing(from: LatLon, to: LatLon): number {
  const φ1 = from.lat * RAD;
  const φ2 = to.lat * RAD;
  const Δλ = (to.lon - from.lon) * RAD;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return normalizeDeg(Math.atan2(y, x) * DEG);
}

export function qiblaBearing(city: CityId): number {
  return initialBearing(CITIES[city], KAABA);
}

/** Smallest difference between two directions (0–180°). */
export function angleDiff(a: number, b: number): number {
  const d = Math.abs(normalizeDeg(a) - normalizeDeg(b));
  return d > 180 ? 360 - d : d;
}

/** Points for one city: within 10° = 3, within 25° = 2, within 45° = 1, otherwise 0. */
export function roundPoints(errorDeg: number): number {
  if (errorDeg <= 10) return 3;
  if (errorDeg <= 25) return 2;
  if (errorDeg <= 45) return 1;
  return 0;
}

export type CompassPoint = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

const POINTS: CompassPoint[] = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

/** Nearest of the eight compass points. */
export function compassPoint(bearing: number): CompassPoint {
  return POINTS[Math.round(normalizeDeg(bearing) / 45) % 8];
}

export function compassPointBearing(point: CompassPoint): number {
  return POINTS.indexOf(point) * 45;
}

/**
 * Points along the great circle from `from` to `to` (spherical interpolation), for drawing the shortest path on a
 * flat map. `n` segments → n + 1 points.
 */
export function greatCirclePoints(from: LatLon, to: LatLon, n = 48): LatLon[] {
  const toVec = (p: LatLon) => [Math.cos(p.lat * RAD) * Math.cos(p.lon * RAD), Math.cos(p.lat * RAD) * Math.sin(p.lon * RAD), Math.sin(p.lat * RAD)];
  const a = toVec(from);
  const b = toVec(to);
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  if (omega < 1e-9) return [from, to];
  const out: LatLon[] = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const k1 = Math.sin((1 - f) * omega) / Math.sin(omega);
    const k2 = Math.sin(f * omega) / Math.sin(omega);
    const v = [k1 * a[0] + k2 * b[0], k1 * a[1] + k2 * b[1], k1 * a[2] + k2 * b[2]];
    out.push({ lat: Math.atan2(v[2], Math.hypot(v[0], v[1])) * DEG, lon: Math.atan2(v[1], v[0]) * DEG });
  }
  return out;
}

/** Great-circle distance in km (mean Earth radius). */
export function distanceKm(from: LatLon, to: LatLon): number {
  const φ1 = from.lat * RAD;
  const φ2 = to.lat * RAD;
  const dφ = φ2 - φ1;
  const dλ = (to.lon - from.lon) * RAD;
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Direction of the straight line between two points on the flat (equirectangular) map – the misleading "map line". */
export function flatMapBearing(from: LatLon, to: LatLon): number {
  return normalizeDeg(Math.atan2(to.lon - from.lon, to.lat - from.lat) * DEG);
}

export type QiblaMode = 'europe' | 'world' | 'free';

export interface QiblaConfig {
  mode: QiblaMode;
  cities: CityId[];
  /** Hint arrow on the compass (nearest compass point). */
  hint: boolean;
  /** Mix the order of the cities for every play. */
  shuffle?: boolean;
}

export function playOrder(config: QiblaConfig, random: () => number = Math.random): CityId[] {
  return config.shuffle ? shuffle(config.cities, random) : [...config.cities];
}

/**
 * Level result from the angular errors of all cities: score = sum of round points (max 3 per city); stars from the
 * average (≥ 2.5 → 3, ≥ 1.5 → 2, else 1); a "mistake" is a city more than 25° off; a city more than 45° off means the
 * learner missed the "everywhere you are, face the Kaaba" idea → that fact comes back in review.
 */
export function qiblaResult(errors: readonly number[], missedFact: string = QIBLA_FACTS.everywhere.id): GameResultInput {
  const points = errors.map(roundPoints);
  const score = points.reduce((a, b) => a + b, 0);
  const maxScore = errors.length * 3;
  const avg = errors.length ? score / errors.length : 3;
  const stars = avg >= 2.5 ? 3 : avg >= 1.5 ? 2 : 1;
  return {
    score,
    maxScore,
    stars,
    mistakes: errors.filter((e) => e > 25).length,
    factsMissed: errors.some((e) => e > 45) ? [missedFact] : [],
  };
}


export const QIBLA_ART: readonly string[] = ['scene.map-world-simple', 'object.compass', 'object.compass-face', 'object.kaaba-icon', 'object.qibla-arrow', 'place.kaaba', 'ui.sparkle'];
