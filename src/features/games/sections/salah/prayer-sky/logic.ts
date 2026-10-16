import { SKY_HORIZON, SKY_W, type KnownArtName, type SkyTime } from '@/core/art';

import type { PrayerId } from './content';

export { PRAYER_IDS, RAKAHS, type PrayerId } from './content';

/*
 * The day as one number `s` in [0, 1]: the learner drags the sun from left (east, s = 0, deep night) to right
 * (west, s = 1, night again). Sunrise at s = 0.15, the sun's highest point at s = 0.5, sunset at s = 0.85.
 * This is a teaching model of one day, not an astronomical calculation – real times are in local timetables.
 */
export const SUNRISE = 0.15;
export const ZENITH = 0.5;
export const SUNSET = 0.85;

/** What the sky shows at `s` (caption while dragging). */
export type DayPhase = 'night' | 'dawn' | 'sunrise' | 'morning' | 'zenith' | 'afterZenith' | 'between' | 'afternoon' | 'sunset' | 'dusk' | 'lateNight';

export function clamp01(v: number): number {
  'worklet';
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function phaseAt(s: number): DayPhase {
  if (s < 0.04) return 'night';
  if (s < 0.14) return 'dawn';
  if (s < 0.18) return 'sunrise';
  if (s < 0.47) return 'morning';
  if (s <= ZENITH) return 'zenith';
  if (s <= 0.6) return 'afterZenith';
  if (s < 0.64) return 'between';
  if (s < 0.83) return 'afternoon';
  if (s < 0.865) return 'sunset';
  if (s < 0.92) return 'dusk';
  return 'lateNight';
}

/**
 * The prayer whose time it is at `s` (lesson "salah-times"): Fajr between dawn and sunrise, Dhuhr after the sun passes
 * its highest point, Asr in the afternoon, Maghrib just after sunset, Isha at night after the twilight has gone.
 * Moments between (sunrise, morning, the sun at its very top, the start of Asr, sunset itself) belong to no prayer.
 */
export function prayerAt(s: number): PrayerId | null {
  switch (phaseAt(s)) {
    case 'dawn':
      return 'fajr';
    case 'afterZenith':
      return 'dhuhr';
    case 'afternoon':
      return 'asr';
    case 'dusk':
      return 'maghrib';
    case 'night':
    case 'lateNight':
      return 'isha';
    default:
      return null;
  }
}

/** A good spot for each prayer (used for snapping after a correct answer). */
export const PRAYER_SPOT: Record<PrayerId, number> = { fajr: 0.09, dhuhr: 0.55, asr: 0.73, maghrib: 0.89, isha: 0.96 };

/** The sky piece that shows each prayer's time (level 3 matching). */
export const PRAYER_SKY: Record<PrayerId, KnownArtName> = {
  fajr: 'sky.dawn',
  dhuhr: 'sky.noon',
  asr: 'sky.afternoon',
  maghrib: 'sky.sunset',
  isha: 'sky.night',
};

/** Sun centre in sky viewBox units (400 × 300); below the horizon (hidden behind the land) before sunrise / after sunset. */
export function sunPoint(s: number): { x: number; y: number; up: boolean } {
  'worklet';
  const v = s < 0 ? 0 : s > 1 ? 1 : s;
  const x = 14 + v * (SKY_W - 28);
  if (v > SUNRISE && v < SUNSET) {
    const phi = ((v - SUNRISE) / (SUNSET - SUNRISE)) * Math.PI;
    return { x, y: SKY_HORIZON - 195 * Math.sin(phi), up: true };
  }
  const away = v <= SUNRISE ? SUNRISE - v : v - SUNSET;
  return { x, y: SKY_HORIZON + 34 * Math.min(1, away / 0.06), up: false };
}

/** Keyframes of the sky colours (cross-faded while the sun moves). */
export const SKY_KEYS: readonly { time: SkyTime; at: number }[] = [
  { time: 'night', at: 0.03 },
  { time: 'dawn', at: 0.11 },
  { time: 'morning', at: 0.25 },
  { time: 'noon', at: 0.5 },
  { time: 'afternoon', at: 0.7 },
  { time: 'sunset', at: 0.85 },
  { time: 'night', at: 0.93 },
];

/** Opacity of keyframe layer `i` (layers are stacked in order, so a layer covers the ones below it). */
export function layerOpacity(s: number, i: number): number {
  'worklet';
  if (i === 0) return 1;
  const from = SKY_KEYS[i - 1].at;
  const to = SKY_KEYS[i].at;
  return clamp01((s - from) / (to - from));
}

/** Which way the learner should move the sun from s to reach the prayer (the day runs from left to right). */
export function sunDirection(s: number, prayer: PrayerId): 'earlier' | 'later' {
  return s > PRAYER_SPOT[prayer] ? 'earlier' : 'later';
}

export const SKY_ART: readonly string[] = ['sky.dawn', 'sky.noon', 'sky.afternoon', 'sky.sunset', 'sky.night', 'object.sundial', 'sky.morning', 'object.clock'];
