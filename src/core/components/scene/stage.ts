import type { SkyKind } from '@/core/models';

/*
 * Stage – an illustrated, gently animated scene for stories and Seerah episodes (docs/STORIES-V3.md).
 *
 * A stage is plain JSON so story/episode authors can write it next to their text:
 *
 *   "stage": {
 *     "sky": "night",
 *     "layers": [
 *       { "art": "story.dunes" },
 *       { "art": "place.kaaba", "x": 200, "y": 206, "w": 110, "enter": "rise", "at": 400 }
 *     ],
 *     "effects": ["stars", { "type": "sparkle", "x": 200, "y": 150 }]
 *   }
 *
 * Coordinates use a virtual 400 × 240 canvas (the same frame as SceneView and the `scene.*` / `story.*` backdrops).
 * The canvas is scaled to cover the view; wide views crop mostly from the sky so the ground stays visible.
 * Never put people in a stage: no `body.*` / `pose.*` art – prophets, companions and angels are never depicted.
 */

/** Virtual canvas of every stage. */
export const STAGE_W = 400;
export const STAGE_H = 240;

/** Ambient effect presets. All are calm and loop slowly; under reduced motion they freeze into a still picture. */
export const STAGE_EFFECTS = [
  'waves',
  'rain',
  'wind',
  'sand',
  'stars',
  'sparkle',
  'sunrays',
  'clouds',
  'birds',
  'fireflies',
  'lanternGlow',
  'ripples',
  'dust',
  'bubbles',
  'flameGlow',
  'leaves',
  'mist',
  'lightBeam',
] as const;

export type StageEffectName = (typeof STAGE_EFFECTS)[number];

export interface StageEffect {
  type: StageEffectName;
  /** Centre (point effects: glow, ripples, sparkle, flameGlow, lightBeam) or region origin; stage units. */
  x?: number;
  y?: number;
  /** Region size for area effects (rain, bubbles, fireflies, leaves …). Defaults to the whole canvas. */
  w?: number;
  h?: number;
  /** 1 = subtle, 2 = normal (default), 3 = rich (more particles / stronger glow). */
  intensity?: 1 | 2 | 3;
  /** Optional colour override (hex). */
  color?: string;
  /** Draw order among layers (see `StageLayer.z`). Sky effects default behind every layer, the rest in front. */
  z?: number;
  /** Appears this many ms after the stage is shown (timeline). */
  at?: number;
  /** Fades out this many ms after the stage is shown. */
  until?: number;
}

/** Looping idle motion of a layer. */
export const LAYER_ANIMS = ['none', 'float', 'bob', 'sway', 'drift', 'pulse', 'glow', 'spin', 'breathe'] as const;
export type StageLayerAnimName = (typeof LAYER_ANIMS)[number];

export interface StageLayerAnim {
  type: StageLayerAnimName;
  /** Strength: pixels (float/bob/drift), degrees (sway/spin per loop is 360°), or scale/opacity fraction (pulse/glow/breathe). */
  amp?: number;
  /** Loop length in ms (rounded so every loop fits the shared 60 s clock). */
  period?: number;
}

/** How a layer appears. */
export const STAGE_ENTERS = ['none', 'fade', 'rise', 'fall', 'slideLeft', 'slideRight', 'zoom'] as const;
export type StageEnter = (typeof STAGE_ENTERS)[number];

export interface StageLayer {
  /** Optional id (documentation / tests). */
  id?: string;
  /** Art library name, e.g. `story.dunes`, `place.kaaba`, `prophet.nuh-ark`. Never `body.*` / `pose.*`. */
  art: string;
  /** Full-frame layer: covers the whole 400 × 240 canvas (backdrops). x / y / w are ignored. */
  fill?: boolean;
  /** Horizontal centre (default 200). */
  x?: number;
  /** Bottom edge for `anchor: "bottom"` (default), centre for `anchor: "center"` (default 240 / 120). */
  y?: number;
  /** Width in stage units (default: 120). Height follows the art's aspect ratio. */
  w?: number;
  anchor?: 'bottom' | 'center';
  /** Draw order; default = position in the array × 10 + 10. Effects use the same scale. */
  z?: number;
  /** Mirror horizontally. */
  flip?: boolean;
  /** Static rotation in degrees. */
  rotate?: number;
  opacity?: number;
  /** Idle animation (name or object). */
  anim?: StageLayerAnimName | StageLayerAnim;
  /** Entry animation (default `fade` when `at` is set, otherwise `none`). */
  enter?: StageEnter;
  /** Timeline: the layer appears this many ms after the stage is shown (default 0). */
  at?: number;
  /** Entry duration in ms (default 900). */
  duration?: number;
  /** Timeline: the layer fades out this many ms after the stage is shown. */
  exitAt?: number;
  /** Draw the art for a dark surface (default: follows the sky). */
  dark?: boolean;
}

export type StageCamera = 'still' | 'slowZoom' | 'panLeft' | 'panRight' | 'drift';
export type StageMood = 'none' | 'warm' | 'cool' | 'night' | 'golden' | 'dawn';

export interface StageSpec {
  /** Sky gradient behind everything (default: the scene's sky, else `day`). */
  sky?: SkyKind;
  layers?: StageLayer[];
  effects?: (StageEffectName | StageEffect)[];
  /** Slow "Ken Burns" camera motion (default `slowZoom` on large stages, `still` on small ones). */
  camera?: StageCamera;
  /** Soft colour grade over the whole picture. */
  mood?: StageMood;
  /** Darkened edges for a cinematic look (default true). */
  vignette?: boolean;
}

/** Art categories that show human bodies – never allowed in stages. */
export const FORBIDDEN_STAGE_ART = ['body.', 'pose.'] as const;

export const isForbiddenStageArt = (name: string) => FORBIDDEN_STAGE_ART.some((p) => name.startsWith(p));

/** Every art name a stage references (for tests: `hasArt`, no people). */
export function stageArtNames(stage: StageSpec | undefined): string[] {
  return (stage?.layers ?? []).map((l) => l.art);
}

export function normalizeEffect(e: StageEffectName | StageEffect): StageEffect {
  return typeof e === 'string' ? { type: e } : e;
}

export function normalizeAnim(a: StageLayer['anim']): StageLayerAnim | null {
  if (!a) return null;
  const anim = typeof a === 'string' ? { type: a } : a;
  return anim.type === 'none' ? null : anim;
}

/** Problems in a stage (unknown effect / anim / enter names, bad numbers). Art names are checked with `hasArt`. */
export function validateStage(stage: StageSpec): string[] {
  const problems: string[] = [];
  const num = (v: unknown) => v === undefined || (typeof v === 'number' && Number.isFinite(v));
  (stage.layers ?? []).forEach((l, i) => {
    if (typeof l.art !== 'string' || !l.art.includes('.')) problems.push(`layer ${i}: art name "${String(l.art)}"`);
    if (isForbiddenStageArt(l.art)) problems.push(`layer ${i}: people are never drawn (${l.art})`);
    const anim = normalizeAnim(l.anim);
    if (anim && !LAYER_ANIMS.includes(anim.type)) problems.push(`layer ${i}: anim "${anim.type}"`);
    if (l.enter && !STAGE_ENTERS.includes(l.enter)) problems.push(`layer ${i}: enter "${l.enter}"`);
    for (const k of ['x', 'y', 'w', 'z', 'at', 'duration', 'exitAt', 'opacity', 'rotate'] as const) {
      if (!num(l[k])) problems.push(`layer ${i}: ${k} must be a number`);
    }
  });
  (stage.effects ?? []).forEach((raw, i) => {
    const e = normalizeEffect(raw);
    if (!STAGE_EFFECTS.includes(e.type)) problems.push(`effect ${i}: "${e.type}"`);
    for (const k of ['x', 'y', 'w', 'h', 'z', 'at', 'until'] as const) {
      if (!num(e[k])) problems.push(`effect ${i}: ${k} must be a number`);
    }
  });
  return problems;
}
