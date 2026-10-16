import type React from 'react';
import { Circle, G, Path } from 'react-native-svg';

import { Glow, Shadow, smoothOpen, star8Path, type Ctx } from '../../kit';
import { C, shade } from '../../palette';

/**
 * The prayer figure (docs/GAMES-V3.md §3.1) – a faceless, friendly person on a prayer mat, drawn from a small 2D
 * skeleton so that every prayer position uses the same proportions and the figure can move smoothly between them.
 *
 * - Side view, facing right (the qibla is to the right). The near limbs are the right arm and the right leg.
 * - `male` wears a kufi, a long shirt and trousers; `female` a hijab that covers the hair, neck and chest and a long
 *   dress. Only the face, the hands and the feet show.
 * - Positions follow the Hanafi school as taught in the Bosnian ilmihal: takbir with the thumbs at the earlobes (men) /
 *   the hands at the shoulders (women), hands folded below the navel (men) / on the chest (women), ruku' with a level
 *   back and the hands holding the knees (women bow a little less), sajda on the 7 parts, sitting on the left foot with
 *   the right foot upright (men) / on the floor with both feet out to the right (women), the raised index finger in
 *   the tashahhud, selam to the right and to the left.
 * - `figureFrame` and its helpers are pure functions marked as worklets: the animated component of the salah-prayers
 *   games rebuilds the paths on the UI thread for every frame of a transition. The same code draws the static
 *   `salah.prayer-*` art pieces.
 */

export type PrayerVariant = 'male' | 'female';

export const PRAYER_POSITIONS = [
  'qiyam',
  'takbir',
  'folded',
  'ruku',
  'itidal',
  'kneel',
  'sajda',
  'jalsa',
  'tashahhud',
  'selam-right',
  'selam-left',
  'dua',
] as const;
export type PrayerPosition = (typeof PRAYER_POSITIONS)[number];

/** viewBox of the figure on its mat. */
export const FIG_W = 240;
export const FIG_H = 200;
/** Top of the mat where the figure stands. */
export const FIG_GROUND = 178;
/** x of the ball of the near foot (the feet keep their place on the mat). */
const ANCHOR_X = 70;

// Segment lengths (viewBox units) – a friendly figure with a slightly large head.
const SPINE = 43;
const NECK = 18.5;
const HEAD_R = 15.5;
const UA = 24;
const FA = 21.5;
const HAND = 10.5;
const TH = 34;
const SH = 33;
const FT = 12.5;
const TOE = 5.5;

/** Parameters of one pose (degrees; dir(a) = (sin a, cos a): 0 = down, 90 = forward, 180 = up, -90 = back). */
const KEYS = [
  'spine',
  /** direction of the neck (shoulder → head centre) */
  'head',
  /** where the top of the head points (the face looks 90° below it) */
  'tilt',
  'turn',
  'nUA',
  'nFA',
  'nHA',
  'nUAs',
  'nFAs',
  'fUA',
  'fFA',
  'fHA',
  'fUAs',
  'fFAs',
  'nTh',
  'nSh',
  'nFt',
  'nToe',
  'fTh',
  'fSh',
  'fFt',
  'fToe',
  'shiftX',
  'finger',
  'thumb',
  'depth',
] as const;
type Key = (typeof KEYS)[number];
export type PoseParams = Record<Key, number>;
/** A pose as a flat number array in KEYS order (what the animation interpolates). */
export type PoseVec = number[];

const I = Object.fromEntries(KEYS.map((k, i) => [k, i])) as Record<Key, number>;

const poseToVec = (p: PoseParams): PoseVec => KEYS.map((k) => p[k]);

// ---------------------------------------------------------------------------------------------------------------
// Geometry helpers (worklets)

type V = [number, number];

function dirv(a: number, len: number): V {
  'worklet';
  const r = (a * Math.PI) / 180;
  return [Math.sin(r) * len, Math.cos(r) * len];
}
function add(a: V, b: V): V {
  'worklet';
  return [a[0] + b[0], a[1] + b[1]];
}
function lerpV(a: V, b: V, t: number): V {
  'worklet';
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
function r1(n: number): number {
  'worklet';
  return Math.round(n * 10) / 10;
}
function pt(p: V): string {
  'worklet';
  return `${r1(p[0])} ${r1(p[1])}`;
}

/** Capsule from a (radius ra) to b (radius rb), as a closed path. */
function taper(a: V, b: V, ra: number, rb: number): string {
  'worklet';
  let dx = b[0] - a[0];
  let dy = b[1] - a[1];
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.01) {
    dx = 0;
    dy = 1;
  } else {
    dx /= len;
    dy /= len;
  }
  const nx = -dy;
  const ny = dx;
  const a1: V = [a[0] + nx * ra, a[1] + ny * ra];
  const b1: V = [b[0] + nx * rb, b[1] + ny * rb];
  const b2: V = [b[0] - nx * rb, b[1] - ny * rb];
  const a2: V = [a[0] - nx * ra, a[1] - ny * ra];
  return `M${pt(a1)}L${pt(b1)}A${r1(rb)} ${r1(rb)} 0 0 0 ${pt(b2)}L${pt(a2)}A${r1(ra)} ${r1(ra)} 0 0 0 ${pt(a1)}Z`;
}

function circle(c: V, r: number): string {
  'worklet';
  return `M${r1(c[0] - r)} ${r1(c[1])}A${r1(r)} ${r1(r)} 0 1 0 ${r1(c[0] + r)} ${r1(c[1])}A${r1(r)} ${r1(r)} 0 1 0 ${r1(c[0] - r)} ${r1(c[1])}Z`;
}

/** Ellipse centred at c, radius rx along the direction `a` (dir convention) and ry across it. */
function ellipse(c: V, rx: number, ry: number, a: number): string {
  'worklet';
  const u = dirv(a, 1);
  const n: V = [-u[1], u[0]];
  let d = '';
  for (let i = 0; i <= 28; i++) {
    const t = (i / 28) * Math.PI * 2;
    const x = c[0] + u[0] * Math.cos(t) * rx + n[0] * Math.sin(t) * ry;
    const y = c[1] + u[1] * Math.cos(t) * rx + n[1] * Math.sin(t) * ry;
    d += `${i === 0 ? 'M' : 'L'}${r1(x)} ${r1(y)}`;
  }
  return `${d}Z`;
}

/** Circle segment of (c, r) from angle a0 to a1 (dir convention), closed by its chord. */
function segment(c: V, r: number, a0: number, a1: number): string {
  'worklet';
  let d = '';
  const n = 16;
  for (let i = 0; i <= n; i++) {
    const p = add(c, dirv(a0 + ((a1 - a0) * i) / n, r));
    d += `${i === 0 ? 'M' : 'L'}${pt(p)}`;
  }
  return `${d}Z`;
}

/** Direction angle (dir convention) from b to a. */
function angleOfW(a: V, b: V): number {
  'worklet';
  return (Math.atan2(a[0] - b[0], a[1] - b[1]) * 180) / Math.PI;
}

function cross(o: V, a: V, b: V): number {
  'worklet';
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

/** Convex hull around circles [x, y, r], as a closed path. */
function hull(circles: number[][]): string {
  'worklet';
  const pts: V[] = [];
  for (let k = 0; k < circles.length; k++) {
    const c = circles[k];
    for (let i = 0; i < 24; i++) {
      const t = (i / 24) * Math.PI * 2;
      pts.push([c[0] + Math.cos(t) * c[2], c[1] + Math.sin(t) * c[2]]);
    }
  }
  pts.sort((p, q) => (p[0] === q[0] ? p[1] - q[1] : p[0] - q[0]));
  const lower: V[] = [];
  for (let i = 0; i < pts.length; i++) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], pts[i]) <= 0) lower.pop();
    lower.push(pts[i]);
  }
  const upper: V[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], pts[i]) <= 0) upper.pop();
    upper.push(pts[i]);
  }
  const h = lower.slice(0, -1).concat(upper.slice(0, -1));
  let d = '';
  for (let i = 0; i < h.length; i++) d += `${i === 0 ? 'M' : 'L'}${pt(h[i])}`;
  return `${d}Z`;
}

/** Path that draws nothing (animated paths always need a `d`). */
export const EMPTY_PATH = 'M0 0';

// ---------------------------------------------------------------------------------------------------------------
// Skeleton

export interface FigureJoints {
  hip: V;
  shoulder: V;
  head: V;
  /** Unit vector the face looks to (in profile). */
  face: V;
  nElbow: V;
  nWrist: V;
  nTip: V;
  fShoulder: V;
  fElbow: V;
  fWrist: V;
  fTip: V;
  nKnee: V;
  nAnkle: V;
  nBall: V;
  nToe: V;
  fHip: V;
  fKnee: V;
  fAnkle: V;
  fBall: V;
  fToe: V;
}

const JOINT_KEYS: (keyof FigureJoints)[] = ['hip', 'shoulder', 'head', 'face', 'nElbow', 'nWrist', 'nTip', 'fShoulder', 'fElbow', 'fWrist', 'fTip', 'nKnee', 'nAnkle', 'nBall', 'nToe', 'fHip', 'fKnee', 'fAnkle', 'fBall', 'fToe'];

function solveLocal(p: PoseVec): FigureJoints {
  'worklet';
  const hip: V = [0, 0];
  const depth = p[I.depth];
  const far: V = [-depth, -depth * 0.45];
  const shoulder = add(hip, dirv(p[I.spine], SPINE));
  const head = add(shoulder, dirv(p[I.head], NECK));
  const face = dirv(p[I.tilt] - 90, 1);
  const nElbow = add(shoulder, dirv(p[I.nUA], UA * p[I.nUAs]));
  const nWrist = add(nElbow, dirv(p[I.nFA], FA * p[I.nFAs]));
  const nTip = add(nWrist, dirv(p[I.nHA], HAND));
  const fShoulder = add(shoulder, far);
  const fElbow = add(fShoulder, dirv(p[I.fUA], UA * p[I.fUAs]));
  const fWrist = add(fElbow, dirv(p[I.fFA], FA * p[I.fFAs]));
  const fTip = add(fWrist, dirv(p[I.fHA], HAND));
  const nKnee = add(hip, dirv(p[I.nTh], TH));
  const nAnkle = add(nKnee, dirv(p[I.nSh], SH));
  const nBall = add(nAnkle, dirv(p[I.nFt], FT));
  const nToe = add(nBall, dirv(p[I.nToe], TOE));
  const fHip = add(hip, far);
  const fKnee = add(fHip, dirv(p[I.fTh], TH));
  const fAnkle = add(fKnee, dirv(p[I.fSh], SH));
  const fBall = add(fAnkle, dirv(p[I.fFt], FT));
  const fToe = add(fBall, dirv(p[I.fToe], TOE));
  return { hip, shoulder, head, face, nElbow, nWrist, nTip, fShoulder, fElbow, fWrist, fTip, nKnee, nAnkle, nBall, nToe, fHip, fKnee, fAnkle, fBall, fToe };
}

const SIT_R = 14;

/** Lowest point (y + radius) of the body parts that can rest on the mat; `arms` adds the hands and elbows. */
function lowest(j: FigureJoints, arms: boolean): number {
  'worklet';
  const cands: [V, number][] = [
    [j.hip, SIT_R],
    [j.head, HEAD_R],
    [j.nKnee, 8],
    [j.fKnee, 8],
    [j.nAnkle, 5.5],
    [j.fAnkle, 5.5],
    [j.nBall, 4.4],
    [j.fBall, 4.4],
    [j.nToe, 3.3],
    [j.fToe, 3.3],
  ];
  if (arms) {
    cands.push([j.nWrist, 4.6], [j.fWrist, 4.6], [j.nTip, 3.9], [j.fTip, 3.9], [j.nElbow, 5.8], [j.fElbow, 5.8]);
  }
  let m = -1e9;
  for (let i = 0; i < cands.length; i++) m = Math.max(m, cands[i][0][1] + cands[i][1]);
  return m;
}

/** Joints in viewBox coordinates: the lowest part rests on the mat and the near foot keeps its place. */
export function solvePose(p: PoseVec): FigureJoints {
  'worklet';
  const j = solveLocal(p);
  const ty = FIG_GROUND - lowest(j, true);
  const tx = ANCHOR_X - j.nBall[0] + p[I.shiftX];
  const out = {} as Record<keyof FigureJoints, V>;
  for (let i = 0; i < JOINT_KEYS.length; i++) {
    const k = JOINT_KEYS[i];
    const v = j[k];
    out[k] = k === 'face' ? v : [v[0] + tx, v[1] + ty];
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------
// Frame: all paths of one pose

/** Paint order of the figure (back to front). Every layer always has a path (EMPTY_PATH when unused). */
export const FIGURE_LAYERS = [
  'shadow',
  'farFoot',
  'farLeg',
  'farArm',
  'farHand',
  'nearFoot',
  'nearLeg',
  'skirt',
  'skirtShade',
  'hem',
  'neck',
  'torso',
  'torsoShade',
  'collar',
  'nearUpper',
  'head',
  'hair',
  'ear',
  'kufi',
  'kufiBand',
  'hijab',
  'hijabFold',
  'face',
  'nearArm',
  'cuff',
  'thumb',
  'nearHand',
  'finger',
] as const;
export type FigureLayer = (typeof FIGURE_LAYERS)[number];
export type FigureFrame = Record<FigureLayer, string>;

export function figureFrame(p: PoseVec, variant: PrayerVariant): FigureFrame {
  'worklet';
  const j = solvePose(p);
  const female = variant === 'female';
  // the spine direction turned towards the belly side: for an upright spine → (1, 0)
  const fwd = dirv(p[I.spine] - 90, 1);
  const up = dirv(p[I.spine], 1);
  const headUp = p[I.tilt];
  const turn = p[I.turn];
  const off = (a: V, v: V, k: number): V => [a[0] + v[0] * k, a[1] + v[1] * k];

  // Legs (trousers / dress) over the bare feet
  const leg = (h: V, k: V, a: V) => `${taper(h, k, 10.5, 8.2)}${taper(k, a, 8, 6.2)}`;
  const foot = (a: V, b: V, t: V, ft: number) => {
    const heel = add(a, dirv(ft + 180, 3));
    return `${taper(heel, b, 5.2, 4.4)}${taper(b, t, 4.2, 3.3)}`;
  };
  const farLeg = leg(j.fHip, j.fKnee, j.fAnkle);
  const nearLeg = leg(j.hip, j.nKnee, j.nAnkle);
  const farFoot = foot(j.fAnkle, j.fBall, j.fToe, p[I.fFt]);
  const nearFoot = foot(j.nAnkle, j.nBall, j.nToe, p[I.nFt]);

  // Arms (sleeves) and hands
  const arm = (s: V, e: V, w: V) => `${taper(s, e, 7.2, 6.2)}${taper(e, w, 6.2, 5.2)}`;
  const hand = (w: V, t: V) => taper(w, t, 4.7, 4.1);
  const farArm = arm(j.fShoulder, j.fElbow, j.fWrist);
  // the near upper arm sits under the head / hijab, the forearm and hand in front of it
  const nearUpper = taper(j.shoulder, j.nElbow, 7.2, 6.2);
  const nearArm = `${circle(j.nElbow, 6.2)}${taper(j.nElbow, j.nWrist, 6.2, 5.2)}`;
  const farHand = hand(j.fWrist, j.fTip);
  const nearHand = hand(j.nWrist, j.nTip);
  const cuffDir = dirv(p[I.nFA], 1);
  const cuff = taper(off(j.nWrist, cuffDir, -3.2), off(j.nWrist, cuffDir, -0.6), 5.6, 5.6);
  const thumbBase = lerpV(j.nWrist, j.nTip, 0.12);
  const thumb = taper(thumbBase, add(thumbBase, dirv(p[I.nHA] + p[I.thumb], 6.2)), 2.2, 1.9);
  const fingerLen = p[I.finger];
  const knuckle = lerpV(j.nWrist, j.nTip, 0.6);
  const finger = fingerLen > 0.05 ? taper(knuckle, add(knuckle, dirv(p[I.nHA] + 62, 9.5 * fingerLen)), 2.1, 1.8) : EMPTY_PATH;

  // Torso
  const chest = off(lerpV(j.hip, j.shoulder, 0.6), fwd, 3.2);
  const belly = off(lerpV(j.hip, j.shoulder, 0.18), fwd, 2.6);
  const back = off(lerpV(j.hip, j.shoulder, 0.5), fwd, -1.6);
  const torso = hull([
    [j.hip[0], j.hip[1], 15],
    [belly[0], belly[1], 14.5],
    [chest[0], chest[1], 14.5],
    [back[0], back[1], 14],
    [j.shoulder[0], j.shoulder[1], 11.5],
  ]);
  // a darker band along the back gives the body some volume
  const sb = (a: V, k: number): number[] => { const q = off(a, fwd, -k); return [q[0], q[1]]; };
  const hipB = sb(j.hip, 6);
  const backB = sb(back, 6.5);
  const shB = sb(j.shoulder, 4.5);
  const torsoShade = hull([
    [hipB[0], hipB[1], 9],
    [backB[0], backB[1], 7.5],
    [shB[0], shB[1], 7],
  ]);
  // Long shirt over the thighs (male) / the dress over the legs (female)
  let hem = EMPTY_PATH;
  let skirt = EMPTY_PATH;
  let skirtShade = EMPTY_PATH;
  let collar = EMPTY_PATH;
  if (female) {
    const flare = (a: V, k: V) => off(a, dirv(Math.atan2(a[0] - k[0], a[1] - k[1]) * (180 / Math.PI), 1), 1.5);
    const na = flare(j.nAnkle, j.nKnee);
    const fa = flare(j.fAnkle, j.fKnee);
    const legBack = dirv(angleOfW(j.nKnee, j.hip) - 90, 1);
    const kb = off(j.nKnee, legBack, 3.5);
    const ab = off(j.nAnkle, legBack, 2.5);
    skirtShade = hull([
      [j.hip[0] - fwd[0] * 4, j.hip[1] - fwd[1] * 4, 11],
      [kb[0], kb[1], 8],
      [ab[0], ab[1], 6.5],
    ]);
    skirt = hull([
      [j.hip[0], j.hip[1], 15.5],
      [j.nKnee[0], j.nKnee[1], 12],
      [na[0], na[1], 9.5],
      [j.fKnee[0], j.fKnee[1], 12],
      [fa[0], fa[1], 9.5],
    ]);
  } else {
    const nh = lerpV(j.hip, j.nKnee, 0.52);
    const fh = lerpV(j.fHip, j.fKnee, 0.52);
    hem = `${taper(j.hip, nh, 15, 12.6)}${taper(j.fHip, fh, 15, 12.6)}`;
    const c0 = off(off(j.shoulder, up, 1.5), fwd, 4.5);
    collar = taper(off(c0, up, -5), c0, 2, 2);
  }

  // Head
  const neck = taper(j.shoulder, j.head, 5.6, 5.6);
  const head = circle(j.head, HEAD_R);
  let hair = EMPTY_PATH;
  let ear = EMPTY_PATH;
  let kufi = EMPTY_PATH;
  let kufiBand = EMPTY_PATH;
  let hijab = EMPTY_PATH;
  let hijabFold = EMPTY_PATH;
  let face = EMPTY_PATH;
  const faceA = headUp - 90;
  const backA = headUp + 90;
  if (female) {
    const chestFront = off(lerpV(j.hip, j.shoulder, 0.74), fwd, 6.5);
    const nape = add(j.head, dirv(headUp + 150, 8));
    const sh = off(j.shoulder, up, -1);
    hijab = hull([
      [j.head[0], j.head[1], HEAD_R + 2.8],
      [nape[0], nape[1], 12],
      [sh[0], sh[1], 12.5],
      [chestFront[0], chestFront[1], 10.5],
    ]);
    // the edge of the scarf around the face
    const fo = 5.6 - turn * 3.6;
    const rx = 10 + turn * 2 - Math.max(0, -turn) * 7.5;
    const fc = add(add(j.head, dirv(faceA, fo)), dirv(headUp, 0.8));
    face = rx > 2.5 ? ellipse(fc, rx, 11.4, faceA) : EMPTY_PATH;
    hijabFold = rx > 2.5 ? ellipse(fc, rx + 2.2, 13.4, faceA) : EMPTY_PATH;
  } else {
    // hair at the back, a kufi on top, the ear in the middle – together they show where the head is facing
    const away = Math.max(0, -turn);
    const toward = Math.max(0, turn);
    hair = segment(j.head, HEAD_R + 0.2, backA - 12 - away * 75 + toward * 18, backA + 58 + away * 30);
    const earOff = 2 + turn * 7.5;
    const ec = add(add(j.head, dirv(backA, earOff)), dirv(headUp + 180, 1.6));
    ear = Math.abs(turn) < 0.97 ? ellipse(ec, 3 - Math.abs(turn) * 1.4, 4, headUp) : EMPTY_PATH;
    kufi = segment(j.head, HEAD_R + 1, headUp - 68, headUp + 84);
    const b0 = add(j.head, dirv(headUp - 68, HEAD_R + 1));
    const b1 = add(j.head, dirv(headUp + 84, HEAD_R + 1));
    const b0i = lerpV(b0, j.head, 0.2);
    const b1i = lerpV(b1, j.head, 0.2);
    kufiBand = `M${pt(b0)}L${pt(b1)}L${pt(b1i)}L${pt(b0i)}Z`;
  }

  // Ground shadow under the body
  const xs = [j.hip[0], j.head[0], j.nToe[0], j.fToe[0], j.nKnee[0], j.nAnkle[0], j.nTip[0], j.shoulder[0], j.nBall[0]];
  let minX = 1e9;
  let maxX = -1e9;
  for (let i = 0; i < xs.length; i++) {
    minX = Math.min(minX, xs[i]);
    maxX = Math.max(maxX, xs[i]);
  }
  const shadow = ellipse([(minX + maxX) / 2, FIG_GROUND + 1.5], (maxX - minX) / 2 + 12, 3.4, 90);

  return { shadow, farFoot, farLeg, farArm, farHand, nearFoot, nearLeg, skirt, skirtShade, hem, neck, torso, torsoShade, collar, head, hair, ear, kufi, kufiBand, hijab, hijabFold, face, nearUpper, nearArm, cuff, thumb, nearHand, finger };
}

// ---------------------------------------------------------------------------------------------------------------
// Colours

export interface FigureColors {
  skin: string;
  skinShade: string;
  shirt: string;
  shirtShade: string;
  shirtTrim: string;
  trousers: string;
  trousersShade: string;
  kufi: string;
  kufiBand: string;
  hair: string;
  hijab: string;
  hijabShade: string;
  dress: string;
  dressShade: string;
  shadow: string;
  shadowOpacity: number;
}

/** Clothes and skin tones (art colours, the same in every theme; `dark` lifts them a little for dark surfaces). */
export function figureColors(dark: boolean, tint: string = C.figure): FigureColors {
  return {
    skin: tint,
    skinShade: shade(tint, 0.15),
    shirt: dark ? '#43B3A3' : '#2A9D8F',
    shirtShade: dark ? '#2F8C80' : '#1E7A6F',
    shirtTrim: dark ? '#2F8C80' : '#1E7A6F',
    trousers: dark ? '#5C6FA3' : '#3D4E80',
    trousersShade: dark ? '#4A5B8C' : '#2E3C66',
    kufi: '#FBF7EE',
    kufiBand: '#E2D3B8',
    hair: '#3B2B24',
    hijab: dark ? '#D9CCF5' : '#CDBDEE',
    hijabShade: dark ? '#BCA9E6' : '#B19CDF',
    dress: dark ? '#8C6CC9' : '#6E4AA0',
    dressShade: dark ? '#7457AE' : '#573A84',
    shadow: dark ? '#000000' : C.ink,
    shadowOpacity: dark ? 0.4 : 0.12,
  };
}

export function layerFill(layer: FigureLayer, variant: PrayerVariant, k: FigureColors): string {
  const female = variant === 'female';
  switch (layer) {
    case 'shadow':
      return k.shadow;
    case 'farLeg':
      return female ? k.dressShade : k.trousersShade;
    case 'nearLeg':
      return female ? k.dress : k.trousers;
    case 'farFoot':
    case 'farHand':
    case 'ear':
      return k.skinShade;
    case 'nearFoot':
    case 'nearHand':
    case 'finger':
    case 'thumb':
    case 'head':
    case 'neck':
    case 'face':
      return k.skin;
    case 'farArm':
      return female ? k.dressShade : k.shirtShade;
    case 'nearArm':
    case 'nearUpper':
    case 'torso':
    case 'hem':
    case 'skirt':
      return female ? k.dress : k.shirt;
    case 'torsoShade':
    case 'skirtShade':
      return female ? k.dressShade : k.shirtShade;
    case 'collar':
    case 'cuff':
      return female ? k.dressShade : k.shirtTrim;
    case 'hair':
      return k.hair;
    case 'kufi':
      return k.kufi;
    case 'kufiBand':
      return k.kufiBand;
    case 'hijab':
      return k.hijab;
    case 'hijabFold':
      return k.hijabShade;
  }
}

/** Fill, outline and opacity of one layer. */
export function layerStyle(layer: FigureLayer, variant: PrayerVariant, k: FigureColors): { fill: string; stroke?: string; strokeWidth?: number; opacity?: number } {
  const fill = layerFill(layer, variant, k);
  if (layer === 'shadow') return { fill, opacity: k.shadowOpacity };
  if (layer === 'kufi') return { fill, stroke: k.kufiBand, strokeWidth: 1.2 };
  if (layer === 'torsoShade' || layer === 'skirtShade') return { fill, opacity: 0.45 };
  return { fill };
}

// ---------------------------------------------------------------------------------------------------------------
// Poses (built once; hands are placed with a two-bone IK so they really hold the knees, touch the ears, …)

const BASE: PoseParams = {
  spine: 180,
  head: 174,
  tilt: 174,
  turn: 0,
  nUA: 3,
  nFA: 2,
  nHA: 0,
  nUAs: 1,
  nFAs: 1,
  fUA: 3,
  fFA: 2,
  fHA: 0,
  fUAs: 1,
  fFAs: 1,
  nTh: 0,
  nSh: 0,
  nFt: 74,
  nToe: 90,
  fTh: 0,
  fSh: 0,
  fFt: 74,
  fToe: 90,
  shiftX: 0,
  finger: 0,
  thumb: 90,
  depth: 4.5,
};

const deg = (rad: number) => (rad * 180) / Math.PI;
const angleOf = (v: V) => deg(Math.atan2(v[0], v[1]));
const near = (a: number, hint: number) => {
  let x = a;
  while (x - hint > 180) x -= 360;
  while (hint - x > 180) x += 360;
  return x;
};

type Side = 'n' | 'f';
type Target = (j: FigureJoints, ground: number) => V;

/** Places the wrist of one arm on a target (local coordinates) by bending the elbow to the `bend` side. */
function reach(p: PoseParams, side: Side, target: Target, bend: 1 | -1, hand?: number | ((j: FigureJoints) => number)): PoseParams {
  const j = solveLocal(poseToVec(p));
  const ground = lowest(j, false);
  const S = side === 'n' ? j.shoulder : j.fShoulder;
  const T = target(j, ground);
  const a = UA * p[`${side}UAs`];
  const b = FA * p[`${side}FAs`];
  const v: V = [T[0] - S[0], T[1] - S[1]];
  const d = Math.hypot(v[0], v[1]);
  const base = angleOf(v);
  let ua = base;
  let fa = base;
  if (d < a + b - 0.01) {
    const alpha = deg(Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d)))));
    ua = base + bend * alpha;
    const e = add(S, dirv(ua, a));
    fa = angleOf([T[0] - e[0], T[1] - e[1]]);
  }
  const out = { ...p, [`${side}UA`]: near(ua, p[`${side}UA`]), [`${side}FA`]: near(fa, p[`${side}FA`]) };
  if (hand !== undefined) {
    const h = typeof hand === 'number' ? hand : hand(solveLocal(poseToVec(out)));
    out[`${side}HA`] = near(h, out[`${side}FA`]);
  }
  return out;
}

/** Turns the neck until the forehead rests on the ground (sajda). */
function headDown(p: PoseParams): PoseParams {
  let lo = 0;
  let hi = 120;
  const gap = (h: number) => {
    const j = solveLocal(poseToVec({ ...p, head: h }));
    const ground = Math.max(j.nKnee[1] + 8, j.nToe[1] + 3.3);
    return j.head[1] + HEAD_R - ground;
  };
  // gap decreases with h (the head lifts towards the front)
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (gap(m) > 0) lo = m;
    else hi = m;
  }
  return { ...p, head: (lo + hi) / 2 };
}

const pose = (over: Partial<PoseParams>): PoseParams => ({ ...BASE, ...over, tilt: over.tilt ?? over.head ?? BASE.tilt });
const both = (p: PoseParams, target: (side: Side) => Target, bend: 1 | -1, hand?: number | ((j: FigureJoints) => number)) =>
  reach(reach(p, 'n', target('n'), bend, hand), 'f', target('f'), bend, hand);
const sideOf = (j: FigureJoints, side: Side) => (side === 'n' ? { knee: j.nKnee, hip: j.hip } : { knee: j.fKnee, hip: j.fHip });

// Shared leg settings
const KNEEL_LEGS: Partial<PoseParams> = { nTh: 34, nSh: -88, nFt: 8, nToe: 90, fTh: 34, fSh: -88, fFt: 8, fToe: 90 };
const SAJDA_LEGS_M: Partial<PoseParams> = { nTh: 20, nSh: -89, nFt: 6, nToe: 90, fTh: 20, fSh: -89, fFt: 6, fToe: 90 };
const SAJDA_LEGS_F: Partial<PoseParams> = { nTh: 46, nSh: -90, nFt: 4, nToe: 90, fTh: 46, fSh: -90, fFt: 4, fToe: 90 };
// men: left foot laid under the body, right foot upright with the toes bent towards the qibla
const SIT_M: Partial<PoseParams> = { spine: 178, head: 170, nTh: 70, nSh: -92, nFt: 4, nToe: 90, fTh: 70, fSh: -92, fFt: -98, fToe: -94 };
// women: sitting on the floor, both feet out to the right side
const SIT_F: Partial<PoseParams> = { spine: 176, head: 170, nTh: 84, nSh: -104, nFt: -104, nToe: -100, fTh: 86, fSh: -100, fFt: -106, fToe: -102, shiftX: 8 };

const onThighs = (side: Side): Target => (j) => {
  const { knee, hip } = sideOf(j, side);
  return add(lerpV(hip, knee, 0.42), [0, -10]);
};
const thighAngle = (j: FigureJoints) => angleOf([j.nKnee[0] - j.hip[0], j.nKnee[1] - j.hip[1]]) + 2;

function sitting(legs: Partial<PoseParams>, extra: Partial<PoseParams> = {}): PoseParams {
  return both(pose({ ...legs, ...extra }), onThighs, -1, thighAngle);
}

function buildMale(): Record<PrayerPosition, PoseParams> {
  const qiyam = pose({ head: 166 });
  // forearms upright beside the head, the thumbs at the earlobes, the palms towards the qibla
  const takbir = pose({ head: 174, nUA: 22, nUAs: 0.5, nFA: 178, nHA: 180, fUA: 22, fUAs: 0.5, fFA: 178, fHA: 180 });
  const folded = both(
    pose({ head: 166, nFAs: 0.72, fFAs: 0.66 }),
    (side) => (j) => add(j.hip, side === 'n' ? [15.5, -13] : [13, -14]),
    1,
    96,
  );
  const ruku = both(pose({ spine: 90, head: 93, nTh: -5, nSh: 2, fTh: -5, fSh: 2, nFt: 76, fFt: 76 }), (side) => (j) => add(sideOf(j, side).knee, [2, 1]), 1, 6);
  const itidal = pose({ head: 172 });
  const kneel = both(pose({ spine: 166, head: 160, ...KNEEL_LEGS }), onThighs, -1, thighAngle);
  const sajdaBody = headDown(pose({ spine: 64, tilt: 98, nUAs: 0.35, fUAs: 0.35, nFAs: 0.95, fFAs: 0.95, thumb: 0, ...SAJDA_LEGS_M }));
  // palms flat beside the head at the level of the ears, elbows raised and away from the body
  const sajda = both(sajdaBody, (side) => (j, ground) => [j.head[0] + (side === 'n' ? -3 : -6), ground - 4.7], 1, 92);
  const jalsa = sitting(SIT_M);
  const tashahhud = sitting(SIT_M, { finger: 1 });
  const selamRight = sitting(SIT_M, { turn: 1, head: 172 });
  const selamLeft = sitting(SIT_M, { turn: -1, head: 172 });
  const dua = both(pose({ ...SIT_M, nFAs: 0.85, fFAs: 0.85 }), (side) => (j) => add(j.shoulder, side === 'n' ? [17, 10] : [15, 9]), 1, 140);
  return { qiyam, takbir, folded, ruku, itidal, kneel, sajda, jalsa, tashahhud, 'selam-right': selamRight, 'selam-left': selamLeft, dua };
}


function buildFemale(male: Record<PrayerPosition, PoseParams>): Record<PrayerPosition, PoseParams> {
  // the hands raised to the shoulders
  const takbir = pose({ head: 174, nUA: 16, nUAs: 0.75, nFA: 178, nFAs: 0.95, nHA: 180, fUA: 16, fUAs: 0.75, fFA: 178, fFAs: 0.95, fHA: 180 });
  const folded = both(
    pose({ head: 166, nFAs: 0.7, fFAs: 0.64 }),
    (side) => (j) => add(lerpV(j.hip, j.shoulder, 0.66), side === 'n' ? [15, 0] : [13, -1]),
    1,
    118,
  );
  const ruku = both(pose({ spine: 112, head: 114, nTh: -12, nSh: 10, fTh: -12, fSh: 10, nFt: 80, fFt: 80 }), (side) => (j) => add(sideOf(j, side).knee, [3, -6]), 1, 22);
  const sajdaBody = headDown(pose({ spine: 80, tilt: 98, thumb: 0, ...SAJDA_LEGS_F }));
  // compact: forearms on the ground, arms close to the body
  const sajda = both(sajdaBody, (side) => (j, ground) => [j.head[0] + (side === 'n' ? -5 : -8), ground - 4.7], -1, 92);
  const jalsa = sitting(SIT_F);
  const tashahhud = sitting(SIT_F, { finger: 1 });
  const selamRight = sitting(SIT_F, { turn: 1, head: 172 });
  const selamLeft = sitting(SIT_F, { turn: -1, head: 172 });
  const dua = both(pose({ ...SIT_F, nFAs: 0.85, fFAs: 0.85 }), (side) => (j) => add(j.shoulder, side === 'n' ? [17, 10] : [15, 9]), 1, 140);
  const kneel = both(pose({ spine: 166, head: 160, ...KNEEL_LEGS }), onThighs, -1, thighAngle);
  return { ...male, takbir, folded, ruku, kneel, sajda, jalsa, tashahhud, 'selam-right': selamRight, 'selam-left': selamLeft, dua };
}

const MALE = buildMale();
const FEMALE = buildFemale(MALE);

export function prayerPose(position: PrayerPosition, variant: PrayerVariant): PoseVec {
  return poseToVec((variant === 'female' ? FEMALE : MALE)[position]);
}

/** Linear interpolation between two poses (worklet). */
export function mixPose(a: PoseVec, b: PoseVec, t: number): PoseVec {
  'worklet';
  const out: number[] = [];
  for (let i = 0; i < a.length; i++) out.push(a[i] + (b[i] - a[i]) * t);
  return out;
}

const STANDING: PrayerPosition[] = ['qiyam', 'takbir', 'folded', 'itidal'];
const ON_GROUND: PrayerPosition[] = ['sajda', 'jalsa', 'tashahhud', 'selam-right', 'selam-left', 'dua'];

/**
 * Key poses of a smooth movement from one position to another. Going down to sajda the knees come first, then the
 * hands and the face; getting up from the ground passes the kneeling pose the other way round.
 */
export function movementPath(from: PrayerPosition, to: PrayerPosition): PrayerPosition[] {
  if (from === to) return [to];
  const fromUp = STANDING.includes(from) || from === 'ruku';
  const toUp = STANDING.includes(to) || to === 'ruku';
  if ((fromUp && ON_GROUND.includes(to)) || (ON_GROUND.includes(from) && toUp)) return [from, 'kneel', to];
  return [from, to];
}

// ---------------------------------------------------------------------------------------------------------------
// Static drawing (art pieces, reduced motion) and the cue overlays

export interface FigureCues {
  /** Dotted line from the eyes to the place of sajda. */
  gaze?: boolean;
  /** The 7 parts of the body on the ground (sajda). */
  points?: boolean;
  /** Small arrows showing the movement into this position. */
  arrows?: boolean;
  /** Soft glow behind the part(s) of the body that moved. */
  highlight?: boolean;
}

/** Place of sajda on the mat (where the forehead goes). */
export function sajdaSpot(variant: PrayerVariant): V {
  const j = solvePose(prayerPose('sajda', variant));
  return [j.head[0] + 9, FIG_GROUND];
}

export function Mat({ c, variant }: { c: Ctx; variant: PrayerVariant }) {
  const spot = sajdaSpot(variant);
  const x0 = 26;
  const x1 = 228;
  const top = FIG_GROUND - 4;
  const bot = FIG_GROUND + 8;
  const base = c.dark ? '#A8455E' : C.plum;
  const mid = (top + bot) / 2;
  return (
    <G>
      <Shadow c={c} cx={(x0 + x1) / 2} cy={bot + 4} rx={(x1 - x0) / 2 + 4} ry={3.6} />
      <Path d={`M${x0 + 7} ${top}H${x1 - 7}L${x1} ${bot}H${x0}Z`} fill={base} />
      <Path d={`M${x0} ${bot}H${x1}V${bot + 3.4}H${x0}Z`} fill={shade(base, 0.32)} />
      <Path d={`M${x0 + 10} ${top + 2.4}H${x1 - 10}M${x0 + 5} ${bot - 2.4}H${x1 - 5}`} stroke={C.gold} strokeWidth={1.2} opacity={0.9} />
      <Path d={`M${spot[0] - 18} ${bot - 2.4}Q${spot[0] - 14} ${top + 2.6} ${spot[0]} ${top + 2.4}Q${spot[0] + 14} ${top + 2.6} ${spot[0] + 18} ${bot - 2.4}`} stroke={C.gold} strokeWidth={1.2} fill="none" />
      <Path d={star8Path(spot[0], mid + 0.6, 3)} fill={C.goldLight} />
      {[44, 64, 84, 104, 124].map((x) => (
        <Path key={x} d={`M${x} ${mid + 0.6}l3-2.4 3 2.4-3 2.4Z`} fill={C.goldLight} opacity={0.75} />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <G key={i}>
          <Path d={`M${x0 + 6 - i * 1.6} ${top + 1 + i * 2.4}h-5`} stroke={C.goldLight} strokeWidth={1.3} strokeLinecap="round" />
          <Path d={`M${x1 - 6 + i * 1.6} ${top + 1 + i * 2.4}h5`} stroke={C.goldLight} strokeWidth={1.3} strokeLinecap="round" />
        </G>
      ))}
    </G>
  );
}

export type SajdaPointId = 'forehead' | 'hand-right' | 'hand-left' | 'knee-right' | 'knee-left' | 'toes-right' | 'toes-left';

/** The seven parts on the ground in sajda (forehead with the nose, both hands, both knees, the toes of both feet). */
export function sajdaPoints(variant: PrayerVariant): { id: SajdaPointId; x: number; y: number }[] {
  const j = solvePose(prayerPose('sajda', variant));
  const forehead = add(j.head, [j.face[0] * HEAD_R * 0.86, j.face[1] * HEAD_R * 0.86]);
  const palm = (w: V, t: V) => lerpV(w, t, 0.4);
  const nh = palm(j.nWrist, j.nTip);
  const fh = palm(j.fWrist, j.fTip);
  return [
    { id: 'forehead', x: forehead[0], y: forehead[1] },
    { id: 'hand-right', x: nh[0], y: nh[1] + 1 },
    { id: 'hand-left', x: fh[0] - 2, y: fh[1] - 5 },
    { id: 'knee-right', x: j.nKnee[0] + 1, y: j.nKnee[1] + 4 },
    { id: 'knee-left', x: j.fKnee[0] - 4, y: j.fKnee[1] - 2 },
    { id: 'toes-right', x: j.nToe[0] - 1, y: j.nToe[1] + 0.5 },
    { id: 'toes-left', x: j.fToe[0] - 5, y: j.fToe[1] - 3 },
  ];
}

export function FigureShapes({ c, frame, variant }: { c: Ctx; frame: FigureFrame; variant: PrayerVariant }) {
  const k = figureColors(c.dark, c.tint === C.figure ? undefined : c.tint);
  return (
    <G>
      {FIGURE_LAYERS.map((layer) =>
        frame[layer] === EMPTY_PATH ? null : <Path key={layer} d={frame[layer]} {...layerStyle(layer, variant, k)} />,
      )}
    </G>
  );
}

function Arrow({ pts, color, w = 2.4 }: { pts: V[]; color: string; w?: number }) {
  const n = pts.length;
  const end = pts[n - 1];
  const prev = pts[n - 2];
  const a = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
  const s = 5.5;
  const p1: V = [end[0] - Math.cos(a - 0.5) * s, end[1] - Math.sin(a - 0.5) * s];
  const p2: V = [end[0] - Math.cos(a + 0.5) * s, end[1] - Math.sin(a + 0.5) * s];
  return (
    <G>
      <Path d={smoothOpen(pts)} stroke={color} strokeWidth={w} strokeLinecap="round" fill="none" />
      <Path d={`M${pt(p1)}L${pt(end)}L${pt(p2)}`} stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </G>
  );
}

const arc = (c: V, r: number, a0: number, a1: number, n = 6): V[] => Array.from({ length: n + 1 }, (_, i) => add(c, dirv(a0 + ((a1 - a0) * i) / n, r)));

/** Glow behind the part that moved into this position (drawn under the figure). */
export function FigureHighlight({ c, position, variant }: { c: Ctx; position: PrayerPosition; variant: PrayerVariant }) {
  const j = solvePose(prayerPose(position, variant));
  const spots: [V, number][] = [];
  switch (position) {
    case 'takbir':
    case 'folded':
    case 'dua':
      spots.push([lerpV(j.nWrist, j.nTip, 0.4), 15]);
      break;
    case 'ruku':
      spots.push([lerpV(j.hip, j.shoulder, 0.55), 30], [j.nWrist, 14]);
      break;
    case 'itidal':
    case 'qiyam':
      spots.push([lerpV(j.hip, j.head, 0.6), 34]);
      break;
    case 'kneel':
      spots.push([j.nKnee, 18]);
      break;
    case 'sajda':
      spots.push([j.head, 24]);
      break;
    case 'jalsa':
      spots.push([lerpV(j.hip, j.head, 0.6), 30]);
      break;
    case 'tashahhud':
      spots.push([lerpV(j.nWrist, j.nTip, 0.8), 14]);
      break;
    case 'selam-right':
    case 'selam-left':
      spots.push([j.head, 24]);
      break;
  }
  return (
    <G>
      {spots.map(([p, r], i) => (
        <Glow key={i} c={c} k={`hl${i}`} cx={p[0]} cy={p[1]} r={r} color={C.goldPale} opacity={c.dark ? 0.55 : 0.9} />
      ))}
    </G>
  );
}

/** Movement cues of a position, drawn over the figure: gaze line, arrows and the 7 points of sajda. */
export function FigureCueLayer({ c, position, variant, cues }: { c: Ctx; position: PrayerPosition; variant: PrayerVariant; cues: FigureCues }) {
  const j = solvePose(prayerPose(position, variant));
  const gold = c.dark ? C.goldLight : C.goldDeep;
  const out: React.ReactNode[] = [];
  if (cues.gaze && (position === 'qiyam' || position === 'folded' || position === 'itidal' || position === 'takbir')) {
    const eye = add(j.head, [j.face[0] * HEAD_R * 0.75, j.face[1] * HEAD_R * 0.75 + 1.5]);
    const spot = sajdaSpot(variant);
    out.push(<Path key="gaze" d={`M${pt(eye)}L${spot[0]} ${spot[1] - 1}`} stroke={gold} strokeWidth={1.5} strokeDasharray="1.5 4.5" strokeLinecap="round" opacity={0.85} />);
    out.push(<Circle key="gazeSpot" cx={spot[0]} cy={spot[1] - 1} r={3.2} fill={gold} opacity={0.7} />);
  }
  if (cues.arrows) {
    const k = `a-${position}`;
    switch (position) {
      case 'takbir': {
        const w = j.nTip;
        out.push(<Arrow key={k} pts={[[w[0] + 14, w[1] + 26], [w[0] + 14, w[1] + 4]]} color={gold} />);
        break;
      }
      case 'folded': {
        const w = j.nWrist;
        out.push(<Arrow key={k} pts={[[w[0] + 18, w[1] + 12], [w[0] + 15, w[1] + 2], [w[0] + 9, w[1] - 3]]} color={gold} />);
        break;
      }
      case 'ruku':
        out.push(<Arrow key={k} pts={arc(j.hip, SPINE + 18, 160, 112)} color={gold} />);
        break;
      case 'itidal':
        out.push(<Arrow key={k} pts={arc(j.hip, SPINE + 30, 112, 162)} color={gold} />);
        break;
      case 'kneel':
        out.push(<Arrow key={k} pts={[[j.nKnee[0] + 16, j.nKnee[1] - 24], [j.nKnee[0] + 16, j.nKnee[1] - 4]]} color={gold} />);
        break;
      case 'sajda':
        out.push(<Arrow key={k} pts={[[j.head[0] + 14, j.head[1] - 34], [j.head[0] + 14, j.head[1] - 14]]} color={gold} />);
        break;
      case 'jalsa':
        out.push(<Arrow key={k} pts={arc(j.hip, SPINE + 34, 120, 166)} color={gold} />);
        break;
      case 'tashahhud': {
        const t = add(lerpV(j.nWrist, j.nTip, 0.6), dirv(j.nTip[0] > 0 ? 145 : 145, 13));
        out.push(<Path key={k} d={`M${pt(add(t, [2, -4]))}l2.5-4M${pt(add(t, [5, 0]))}l4.5-1M${pt(add(t, [-2, -5]))}l0-4.5`} stroke={gold} strokeWidth={2} strokeLinecap="round" />);
        break;
      }
      case 'selam-right':
        out.push(<Arrow key={k} pts={arc(j.head, HEAD_R + 9, 105, 30, 5)} color={gold} />);
        break;
      case 'selam-left':
        out.push(<Arrow key={k} pts={arc(j.head, HEAD_R + 9, 105, 200, 5)} color={gold} />);
        break;
      default:
        break;
    }
  }
  if (cues.points && position === 'sajda') {
    for (const p of sajdaPoints(variant)) {
      out.push(<Circle key={`pg${p.id}`} cx={p.x} cy={p.y} r={6.8} fill={C.goldPale} opacity={0.6} />);
      out.push(<Circle key={`p${p.id}`} cx={p.x} cy={p.y} r={3.3} fill={C.gold} stroke={C.white} strokeWidth={1.1} />);
    }
  }
  return <G>{out}</G>;
}

/** The whole static picture: mat, figure and the chosen cues. */
export function PrayerFigureArt({ c, position, variant, cues = {} }: { c: Ctx; position: PrayerPosition; variant: PrayerVariant; cues?: FigureCues }) {
  const frame = figureFrame(prayerPose(position, variant), variant);
  return (
    <>
      <Mat c={c} variant={variant} />
      {cues.highlight ? <FigureHighlight c={c} position={position} variant={variant} /> : null}
      <FigureShapes c={c} frame={frame} variant={variant} />
      <FigureCueLayer c={c} position={position} variant={variant} cues={cues} />
    </>
  );
}
