import type { PrayerPosition, PrayerVariant } from '@/core/art/pieces/sections/salahFigure';
import { hashString, seededRandom, shuffle } from '@/core/utils/random';

import { type Move, partSteps, type PrayerPart, type PrayerStep } from './data/prayers';

/** The gesture of a movement in "pray along". */
export type Gesture = 'up' | 'down' | 'left' | 'right' | 'tap';

export const GESTURE: Record<Move, Gesture> = {
  takbir: 'up',
  fold: 'tap',
  bow: 'down',
  rise: 'up',
  prostrate: 'down',
  'sit-up': 'up',
  'stand-up': 'up',
  sit: 'up',
  finger: 'tap',
  'kunut-takbir': 'up',
  'selam-right': 'right',
  'selam-left': 'left',
};

/** Classifies a finished pan (translation in dp) as a swipe; null when it was too short. */
export function swipeOf(dx: number, dy: number, min = 28): Gesture | null {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < min) return null;
  if (Math.abs(dy) >= Math.abs(dx)) return dy < 0 ? 'up' : 'down';
  return dx > 0 ? 'right' : 'left';
}

/** Steps of "lead it yourself": the finger is raised as part of the sitting, so the sitting shows the tashahhud. */
export function leadSteps(p: PrayerPart): PrayerStep[] {
  return partSteps(p)
    .filter((s) => s.move !== 'finger')
    .map((s) => (s.move === 'sit' ? { ...s, position: 'tashahhud' as PrayerPosition, recite: ['tashahhud' as const] } : s));
}

/** Position the figure ends in after a move (for the option tiles). */
export const MOVE_POSITION: Record<Move, PrayerPosition> = {
  takbir: 'takbir',
  fold: 'folded',
  bow: 'ruku',
  rise: 'itidal',
  prostrate: 'sajda',
  'sit-up': 'jalsa',
  'stand-up': 'folded',
  sit: 'tashahhud',
  finger: 'tashahhud',
  'kunut-takbir': 'takbir',
  'selam-right': 'selam-right',
  'selam-left': 'selam-left',
};

/** Plausible wrong next movements for each step (never two moves that end in the same picture). */
function distractors(step: PrayerStep, prev: PrayerStep | undefined): Move[] {
  switch (step.move) {
    case 'takbir':
      return ['bow', 'sit'];
    case 'fold':
      return ['bow', 'prostrate'];
    case 'kunut-takbir':
      return ['bow', 'prostrate'];
    case 'bow':
      return ['prostrate', 'sit'];
    case 'rise':
      return ['prostrate', 'sit'];
    case 'prostrate':
      return prev?.move === 'sit-up' ? ['stand-up', 'sit'] : ['sit', 'bow'];
    case 'sit-up':
      return ['stand-up', 'bow'];
    case 'stand-up':
      return ['sit', 'selam-right'];
    case 'sit':
      return ['stand-up', 'selam-right'];
    case 'selam-right':
      return ['stand-up', 'prostrate'];
    case 'selam-left':
      return ['stand-up', 'prostrate'];
    default:
      return ['bow', 'prostrate'];
  }
}

/** Three option moves (the right one + two distractors), in a stable shuffled order. */
export function leadOptions(steps: PrayerStep[], index: number, seed: string): Move[] {
  const step = steps[index];
  const options = [step.move, ...distractors(step, steps[index - 1]).filter((m) => m !== step.move)].slice(0, 3);
  return shuffle(options, seededRandom(hashString(`${seed}:${index}`)));
}

/** What a learner should choose when reciting in a standing step of "lead it yourself". */
export function expectedReading(step: PrayerStep, variant: PrayerVariant): { surah: boolean; aloud: boolean } {
  return { surah: step.recite.includes('surah'), aloud: !!step.aloud && variant === 'male' };
}

/** True when the step starts with the Fatiha (the recite choice is asked). */
export const readsFatiha = (step: PrayerStep) => step.recite.includes('fatiha');
