import type { GameResultInput } from '@/core/games';

import { RAKAHS, type PrayerId } from '../prayer-sky/content';

export const RAKAH_MOVEMENTS = ['standing', 'bowing', 'rising', 'prostrating', 'sitting-between', 'prostrating-again'] as const;
export type SalahPose = (typeof RAKAH_MOVEMENTS)[number] | 'final-sitting' | 'takbir' | 'taslim';

export interface SalahGuideConfig {
  prayers: PrayerId[];
  movementFactId: string;
}

export interface PoseChoice {
  pose: SalahPose;
  correct: boolean;
}

const DISTRACTORS: Record<SalahPose, SalahPose[]> = {
  standing: ['bowing', 'prostrating'],
  bowing: ['standing', 'sitting-between'],
  rising: ['prostrating', 'standing'],
  prostrating: ['bowing', 'sitting-between'],
  'sitting-between': ['standing', 'prostrating-again'],
  'prostrating-again': ['rising', 'sitting-between'],
  'final-sitting': ['standing', 'bowing'],
  takbir: ['standing', 'bowing'],
  taslim: ['standing', 'bowing'],
};

/** Three distinct, repeatable choices for the next posture. */
export function poseChoices(expected: SalahPose, stepIndex: number): PoseChoice[] {
  const choices = [expected, ...DISTRACTORS[expected]];
  const offset = stepIndex % choices.length;
  return choices.map((_, index) => choices[(index + offset) % choices.length]).map((pose) => ({ pose, correct: pose === expected }));
}

export function rakahsInGuide(prayers: readonly PrayerId[]): number {
  return prayers.reduce((total, prayer) => total + RAKAHS[prayer], 0);
}

export function salahGuideResult(config: SalahGuideConfig, mistakes: number): GameResultInput {
  const totalRakahs = rakahsInGuide(config.prayers);
  const maxScore = totalRakahs * RAKAH_MOVEMENTS.length + config.prayers.length;
  const score = Math.max(0, maxScore - mistakes);
  const ratio = maxScore === 0 ? 1 : score / maxScore;
  return {
    score,
    maxScore,
    stars: ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1,
    mistakes,
    factsMissed: mistakes > 0 ? [config.movementFactId] : [],
  };
}