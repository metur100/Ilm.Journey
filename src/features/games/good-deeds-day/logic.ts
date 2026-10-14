import { SKY_H, SKY_SUN, SKY_W } from '@/core/art';
import type { GameResultInput } from '@/core/games';

import type { ContentChoice, GoodDeedId, Scene } from './content';

/*
 * Pure rules of A Day of Good Deeds: choices, scene scoring, the garden strip, the sunset (iftar) timing and the
 * Ramadan good-deed tracker.
 */

// ---------- choices ----------

export type ChoiceAnswer = 'good' | 'retry';

/** The content's good option continues; any other option shows its gentle feedback and the learner tries again. */
export function answerChoice(choice: ContentChoice, index: number): ChoiceAnswer {
  return index === choice.correctIndex ? 'good' : 'retry';
}

// ---------- scene progress ----------

export interface SceneState {
  step: number;
  /** Items of the current drag step already brought to the target. */
  dragged: number;
  /** Taps of the current tap step. */
  tapped: number;
  /** The first choice in this scene was not the good one. */
  retried: boolean;
}

export const NEW_SCENE: SceneState = { step: 0, dragged: 0, tapped: 0, retried: false };

/** Is the current step finished with these counts? */
export function stepDone(scene: Scene, state: SceneState): boolean {
  const step = scene.steps[state.step];
  if (!step) return true;
  if (step.kind === 'drag') return state.dragged >= step.items.length;
  if (step.kind === 'tap') return state.tapped >= step.count;
  return false;
}

/** Next step (or `null` when the scene is complete – the good deed is planted). */
export function advance(scene: Scene, state: SceneState): SceneState | null {
  const next = state.step + 1;
  if (next >= scene.steps.length) return null;
  return { ...state, step: next, dragged: 0, tapped: 0 };
}

/** 10 points per scene, 5 when the first choice needed a second try. */
export const sceneScore = (retried: boolean) => (retried ? 5 : 10);

export function starsFor(score: number, maxScore: number): number {
  const ratio = maxScore === 0 ? 1 : score / maxScore;
  return ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1;
}

/** Result of the day: scenes that needed a second try give fewer points and their fact comes back in review. */
export function dayResult(scenes: readonly Scene[], retriedSceneIds: readonly string[]): GameResultInput {
  const retried = scenes.filter((s) => retriedSceneIds.includes(s.id));
  const score = scenes.reduce((sum, s) => sum + sceneScore(retriedSceneIds.includes(s.id)), 0);
  const maxScore = scenes.length * 10;
  return {
    score,
    maxScore,
    stars: starsFor(score, maxScore),
    mistakes: retried.length,
    factsMissed: [...new Set(retried.flatMap((s) => (s.factId ? [s.factId] : [])))],
  };
}

/** The garden strip: one plant per finished scene, in order. */
export const gardenPlants = (scenes: readonly Scene[], finished: number) => scenes.slice(0, finished).map((s) => s.plant);

// ---------- Ramadan: the sun and iftar ----------

/** The sun slides from its afternoon position down to the horizon at sunset (sky pieces, viewBox 400 × 300). */
export const SUN_FROM = SKY_SUN.afternoon;
export const SUN_TO = SKY_SUN.sunset;
/** From here on the sun has set (Maghrib) and the fast may be broken. */
export const SUNSET_T = 0.95;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Sun position (fractions of the sky) for progress `t` (0 = afternoon, 1 = sunset). */
export function sunAt(t: number): { x: number; y: number } {
  const k = clamp01(t);
  return { x: (SUN_FROM.x + (SUN_TO.x - SUN_FROM.x) * k) / SKY_W, y: (SUN_FROM.y + (SUN_TO.y - SUN_FROM.y) * k) / SKY_H };
}

/** Progress of the sun for a finger at (x, y) in fractions of the sky: projection onto its path. */
export function sunProgress(x: number, y: number): number {
  const ax = SUN_FROM.x / SKY_W;
  const ay = SUN_FROM.y / SKY_H;
  const dx = SUN_TO.x / SKY_W - ax;
  const dy = SUN_TO.y / SKY_H - ay;
  return clamp01(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy));
}

export const isSunset = (t: number) => t >= SUNSET_T;

/** Eating and drinking: before dawn (suhoor) and after sunset (iftar) – never in between (Quran 2:187 in the content). */
export function mayEat(phase: 'before-dawn' | 'day', sunT = 0): boolean {
  return phase === 'before-dawn' || isSunset(sunT);
}

// ---------- the good-deed tracker ----------

/** Deeds the learner already did in the game's scenes (pre-ticked in the tracker). */
export function deedsDone(scenes: readonly Scene[], finished: number): GoodDeedId[] {
  return [...new Set(scenes.slice(0, finished).flatMap((s) => (s.deed ? [s.deed] : [])))];
}

export function toggleDeed(ticked: readonly GoodDeedId[], id: GoodDeedId): GoodDeedId[] {
  return ticked.includes(id) ? ticked.filter((d) => d !== id) : [...ticked, id];
}
