import type React from 'react';
import { Circle, G, Path } from 'react-native-svg';

import { Glow, Shadow, smoothOpen, star8Path, type Ctx } from '../../kit';
import { C, mix, shade } from '../../palette';

/**
 * The prayer figure (docs/GAMES-V3.md §3.1) – a faceless, friendly person on a prayer mat, drawn from a small 3D
 * skeleton so that every prayer position uses the same proportions and the figure can move smoothly between them.
 *
 * - The qibla is to the right. Every pose has its own view (`yaw`): the standing positions are seen almost from the
 *   front, so both hands are clearly visible (hands raised beside the ears for the takbir, the right hand over the left
 *   for the folded hands); ruku', sajda and the kneeling pose are seen from the side (a level back, the 7 parts on the
 *   ground); the sittings three-quarters, so both hands on the thighs, the raised finger and the selam turn of the head
 *   read at a glance. Between two positions the figure turns smoothly.
 * - `male` wears a kufi, a long shirt and trousers; `female` a hijab that covers the hair, neck and chest and a long
 *   dress. Only the face, the hands and the feet show.
 * - Positions follow the Hanafi school as taught in the Bosnian ilmihal: takbir with the thumbs at the earlobes and the
 *   palms towards the qibla (men) / the hands at the shoulders (women), the right hand over the left below the navel
 *   (men) / on the chest (women), ruku' with a level back and the hands holding the knees (women bow a little less),
 *   sajda on the 7 parts, sitting on the left foot with the right foot upright (men) / on the floor with both feet out
 *   to the right (women), the raised index finger in the tashahhud, selam to the right and to the left.
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
export const FIG_H = 206;
/** Top of the mat where the figure stands. */
export const FIG_GROUND = 188;
/** x of the feet on the mat (the feet keep their place in every position). */
const ANCHOR_X = 66;
/** The figure is drawn this much larger than its skeleton units, around the anchor on the mat. */
export const FIG_SCALE = 1.17;
export const FIG_TRANSFORM = `translate(${ANCHOR_X * (1 - FIG_SCALE)} ${FIG_GROUND * (1 - FIG_SCALE)}) scale(${FIG_SCALE})`;
/** Skeleton point → viewBox point (the figure transform). */
export const toView = (x: number, y: number): [number, number] => [ANCHOR_X + (x - ANCHOR_X) * FIG_SCALE, FIG_GROUND + (y - FIG_GROUND) * FIG_SCALE];

// Segment lengths (skeleton units) – a friendly figure with a slightly large head.
const SPINE = 43;
const NECK = 17;
const HEAD_R = 14;
const UA = 23;
const FA = 21;
const HAND = 10.5;
const TH = 34;
const SH = 33;
const FT = 12.5;
const TOE = 5.5;
/** Half the distance between the shoulders / the hip joints. */
const SW = 12;
const HW = 7;

/*
 * Body space: x = forward (towards the qibla), y = down, z = the figure's right side. The view turns the body by `yaw`
 * degrees: 0 = seen from the side (the right side towards the viewer), 90 = seen from the front.
 * Screen x = x·cos(yaw) − z·sin(yaw); depth (towards the viewer) = x·sin(yaw) + z·cos(yaw).
 */

/** Scalars of a pose. */
const SCALARS = ['yaw', 'shiftX', 'finger', 'hem'] as const;
/** Directions of a pose (unit vectors in body space; `n` = right / near side, `f` = left / far side). */
const DIRS = [
  'spine',
  'neck',
  /** where the top of the head points */
  'up',
  /** where the face looks */
  'face',
  'nUA',
  'nFA',
  'nHA',
  /** the side the palm faces */
  'nPalm',
  'nThumb',
  'fUA',
  'fFA',
  'fHA',
  'fPalm',
  'fThumb',
  'nTh',
  'nSh',
  'nFt',
  'nToe',
  'fTh',
  'fSh',
  'fFt',
  'fToe',
] as const;
type Scalar = (typeof SCALARS)[number];
type Dir = (typeof DIRS)[number];
type V3 = [number, number, number];
export type PoseParams = Record<Scalar, number> & Record<Dir, V3>;
/** A pose as a flat number array (what the animation interpolates): the scalars, then x/y/z of every direction. */
export type PoseVec = number[];

const S = Object.fromEntries(SCALARS.map((k, i) => [k, i])) as Record<Scalar, number>;
const D = Object.fromEntries(DIRS.map((k, i) => [k, SCALARS.length + i * 3])) as Record<Dir, number>;

function poseToVec(p: PoseParams): PoseVec {
  const out: number[] = SCALARS.map((k) => p[k]);
  for (const k of DIRS) out.push(p[k][0], p[k][1], p[k][2]);
  return out;
}

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

function add3(a: V3, b: V3, k = 1): V3 {
  'worklet';
  return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
}
function norm3(v: V3): V3 {
  'worklet';
  const l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return l < 1e-6 ? [0, 1, 0] : [v[0] / l, v[1] / l, v[2] / l];
}
function lerp3(a: V3, b: V3, t: number): V3 {
  'worklet';
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
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

/** Direction angle (dir convention) of a screen vector. */
function angleOfV(v: V): number {
  'worklet';
  return (Math.atan2(v[0], v[1]) * 180) / Math.PI;
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

/** 3D joints in body space (hip centre at the origin). */
interface Body {
  hip: V3;
  nHip: V3;
  fHip: V3;
  belly: V3;
  chest: V3;
  back: V3;
  shoulder: V3;
  nShoulder: V3;
  fShoulder: V3;
  head: V3;
  nElbow: V3;
  nWrist: V3;
  nTip: V3;
  fElbow: V3;
  fWrist: V3;
  fTip: V3;
  nKnee: V3;
  nAnkle: V3;
  nBall: V3;
  nToe: V3;
  fKnee: V3;
  fAnkle: V3;
  fBall: V3;
  fToe: V3;
}

function dirOf(p: PoseVec, k: number): V3 {
  'worklet';
  return norm3([p[k], p[k + 1], p[k + 2]]);
}

function solveBody(p: PoseVec): Body {
  'worklet';
  const hip: V3 = [0, 0, 0];
  const spine = dirOf(p, D.spine);
  // the belly side of the spine (perpendicular to it, in the body's middle plane)
  const fwd: V3 = norm3([-spine[1], spine[0], 0]);
  const side: V3 = [0, 0, 1];
  const nHip = add3(hip, side, HW);
  const fHip = add3(hip, side, -HW);
  const shoulder = add3(hip, spine, SPINE);
  const nShoulder = add3(add3(shoulder, side, SW), spine, -2);
  const fShoulder = add3(add3(shoulder, side, -SW), spine, -2);
  const belly = add3(add3(hip, spine, 10), fwd, 3);
  const chest = add3(add3(hip, spine, 27), fwd, 2.5);
  const back = add3(add3(hip, spine, 21), fwd, -2.5);
  const head = add3(shoulder, dirOf(p, D.neck), NECK);
  const nElbow = add3(nShoulder, dirOf(p, D.nUA), UA);
  const nWrist = add3(nElbow, dirOf(p, D.nFA), FA);
  const nTip = add3(nWrist, dirOf(p, D.nHA), HAND);
  const fElbow = add3(fShoulder, dirOf(p, D.fUA), UA);
  const fWrist = add3(fElbow, dirOf(p, D.fFA), FA);
  const fTip = add3(fWrist, dirOf(p, D.fHA), HAND);
  const nKnee = add3(nHip, dirOf(p, D.nTh), TH);
  const nAnkle = add3(nKnee, dirOf(p, D.nSh), SH);
  const nBall = add3(nAnkle, dirOf(p, D.nFt), FT);
  const nToe = add3(nBall, dirOf(p, D.nToe), TOE);
  const fKnee = add3(fHip, dirOf(p, D.fTh), TH);
  const fAnkle = add3(fKnee, dirOf(p, D.fSh), SH);
  const fBall = add3(fAnkle, dirOf(p, D.fFt), FT);
  const fToe = add3(fBall, dirOf(p, D.fToe), TOE);
  return { hip, nHip, fHip, belly, chest, back, shoulder, nShoulder, fShoulder, head, nElbow, nWrist, nTip, fElbow, fWrist, fTip, nKnee, nAnkle, nBall, nToe, fKnee, fAnkle, fBall, fToe };
}

const SIT_R = 11;

/** Lowest point (y + radius) of the body parts that can rest on the mat; `arms` adds the hands and elbows. */
function lowest(b: Body, arms: boolean): number {
  'worklet';
  const cands: [V3, number][] = [
    [b.nHip, SIT_R],
    [b.fHip, SIT_R],
    [b.head, HEAD_R],
    [b.nKnee, 7.5],
    [b.fKnee, 7.5],
    [b.nAnkle, 5.5],
    [b.fAnkle, 5.5],
    [b.nBall, 4.2],
    [b.fBall, 4.2],
    [b.nToe, 3.2],
    [b.fToe, 3.2],
  ];
  if (arms) {
    cands.push([b.nWrist, 4.4], [b.fWrist, 4.4], [b.nTip, 3.8], [b.fTip, 3.8], [b.nElbow, 5.6], [b.fElbow, 5.6]);
  }
  let m = -1e9;
  for (let i = 0; i < cands.length; i++) m = Math.max(m, cands[i][0][1] + cands[i][1]);
  return m;
}

/** Joints of one pose on screen (viewBox coordinates before the figure transform). */
export interface FigureJoints {
  hip: V;
  shoulder: V;
  head: V;
  /** Unit vector the face looks to, on screen. */
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

interface Projector {
  /** Body point → screen point. */
  at: (v: V3) => V;
  /** Body direction → screen vector (not normalised). */
  dir: (v: V3) => V;
  /** How far a body point / direction comes towards the viewer. */
  depth: (v: V3) => number;
}

function projector(p: PoseVec, b: Body): Projector {
  'worklet';
  const yaw = (p[S.yaw] * Math.PI) / 180;
  const cs = Math.cos(yaw);
  const sn = Math.sin(yaw);
  const ty = FIG_GROUND - lowest(b, true);
  const bx = (b.nBall[0] + b.fBall[0]) / 2;
  const bz = (b.nBall[2] + b.fBall[2]) / 2;
  const tx = ANCHOR_X - (bx * cs - bz * sn) + p[S.shiftX];
  return {
    at: (v) => [v[0] * cs - v[2] * sn + tx, v[1] + ty],
    dir: (v) => [v[0] * cs - v[2] * sn, v[1]],
    depth: (v) => v[0] * sn + v[2] * cs,
  };
}

/** Joints in viewBox coordinates: the lowest part rests on the mat and the feet keep their place. */
export function solvePose(p: PoseVec): FigureJoints {
  'worklet';
  const b = solveBody(p);
  const P = projector(p, b);
  const f = P.dir(dirOf(p, D.face));
  const fl = Math.sqrt(f[0] * f[0] + f[1] * f[1]) || 1;
  return {
    hip: P.at(b.hip),
    shoulder: P.at(b.nShoulder),
    head: P.at(b.head),
    face: [f[0] / fl, f[1] / fl],
    nElbow: P.at(b.nElbow),
    nWrist: P.at(b.nWrist),
    nTip: P.at(b.nTip),
    fShoulder: P.at(b.fShoulder),
    fElbow: P.at(b.fElbow),
    fWrist: P.at(b.fWrist),
    fTip: P.at(b.fTip),
    nKnee: P.at(b.nKnee),
    nAnkle: P.at(b.nAnkle),
    nBall: P.at(b.nBall),
    nToe: P.at(b.nToe),
    fHip: P.at(b.fHip),
    fKnee: P.at(b.fKnee),
    fAnkle: P.at(b.fAnkle),
    fBall: P.at(b.fBall),
    fToe: P.at(b.fToe),
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Frame: all paths of one pose

/**
 * Paint order of the figure (back to front). Every layer always has a path (EMPTY_PATH when unused). Arms and legs go
 * into the "behind" or "front" slots by how far they come towards the viewer in the current view.
 */
export const FIGURE_LAYERS = [
  'shadow',
  'footB',
  'legB',
  'footF',
  'legF',
  'armB1',
  'thumbB1',
  'handB1',
  'armB2',
  'thumbB2',
  'handB2',
  'skirt',
  'skirtShade',
  'hem',
  'neck',
  'torso',
  'torsoShade',
  'collar',
  'hijab',
  'head',
  'hijabFold',
  'face',
  'faceArea',
  'hair',
  'earA',
  'earB',
  'kufi',
  'kufiBand',
  'arm1',
  'cuff1',
  'thumb1',
  'hand1',
  'arm2',
  'cuff2',
  'thumb2',
  'hand2',
  'finger',
] as const;
export type FigureLayer = (typeof FIGURE_LAYERS)[number];
export type FigureFrame = Record<FigureLayer, string>;

interface ArmPaths {
  arm: string;
  cuff: string;
  hand: string;
  thumb: string;
  /** depth of the forearm (sorting) */
  d: number;
  /** depth of the wrist relative to the torso */
  rel: number;
}

export function figureFrame(p: PoseVec, variant: PrayerVariant): FigureFrame {
  'worklet';
  const b = solveBody(p);
  const P = projector(p, b);
  const female = variant === 'female';
  const at = P.at;
  const spine = dirOf(p, D.spine);
  const fwd3: V3 = norm3([-spine[1], spine[0], 0]);

  // ---- legs (trousers / dress) over the bare feet, the nearer leg in front
  const leg = (h: V, k: V, a: V) => `${taper(h, k, 9.6, 7.8)}${taper(k, a, 7.6, 5.9)}`;
  const foot = (a3: V3, b3: V3, t3: V3) => {
    const a = at(a3);
    const ball = at(b3);
    const heel = lerpV(a, ball, -0.22);
    return `${taper(heel, ball, 4.8, 4.1)}${taper(ball, at(t3), 3.9, 3.1)}`;
  };
  const nLeg = leg(at(b.nHip), at(b.nKnee), at(b.nAnkle));
  const fLeg = leg(at(b.fHip), at(b.fKnee), at(b.fAnkle));
  const nFoot = foot(b.nAnkle, b.nBall, b.nToe);
  const fFoot = foot(b.fAnkle, b.fBall, b.fToe);
  const nLegD = P.depth(b.nKnee) + P.depth(b.nAnkle);
  const fLegD = P.depth(b.fKnee) + P.depth(b.fAnkle);
  const nearFront = nLegD >= fLegD;

  // ---- arms (sleeves) and hands
  const torsoD = P.depth(b.chest);
  const arm = (sh: V3, el: V3, wr: V3, tip: V3, palmK: number, thumbK: number): ArmPaths => {
    const s = at(sh);
    const e = at(el);
    const w = at(wr);
    const t = at(tip);
    const palm = dirOf(p, palmK);
    // a palm turned towards the viewer looks wider than a hand seen from its edge
    const open = Math.abs(P.depth(palm));
    const hw = 3.9 + 1.5 * open;
    const hand = taper(w, t, hw, hw * 0.86);
    const tb = lerpV(w, t, 0.18);
    const th = P.dir(dirOf(p, thumbK));
    const tl = Math.sqrt(th[0] * th[0] + th[1] * th[1]);
    const thumb = tl > 0.15 ? taper(tb, add(tb, [(th[0] / tl) * 6.4 * Math.min(1, tl * 1.4), (th[1] / tl) * 6.4 * Math.min(1, tl * 1.4)]), 2.3, 2) : EMPTY_PATH;
    const fd = [w[0] - e[0], w[1] - e[1]];
    const fl = Math.sqrt(fd[0] * fd[0] + fd[1] * fd[1]) || 1;
    const c0: V = [w[0] - (fd[0] / fl) * 3.4, w[1] - (fd[1] / fl) * 3.4];
    const c1: V = [w[0] - (fd[0] / fl) * 0.6, w[1] - (fd[1] / fl) * 0.6];
    return {
      arm: `${taper(s, e, 6.6, 5.9)}${circle(e, 5.9)}${taper(e, w, 5.9, 4.9)}`,
      cuff: taper(c0, c1, 5.4, 5.4),
      hand,
      thumb,
      d: P.depth(el) + P.depth(wr) * 2,
      rel: (P.depth(el) + P.depth(wr)) / 2 - torsoD,
    };
  };
  const nArm = arm(b.nShoulder, b.nElbow, b.nWrist, b.nTip, D.nPalm, D.nThumb);
  const fArm = arm(b.fShoulder, b.fElbow, b.fWrist, b.fTip, D.fPalm, D.fThumb);
  const behind: ArmPaths[] = [];
  const front: ArmPaths[] = [];
  // seen from the front an arm at the side of the body stays visible; seen from the side the far arm is behind it
  const behindAt = -4 - 9 * Math.abs(Math.sin((p[S.yaw] * Math.PI) / 180));
  for (const a of fArm.d <= nArm.d ? [fArm, nArm] : [nArm, fArm]) (a.rel < behindAt ? behind : front).push(a);
  const E: ArmPaths = { arm: EMPTY_PATH, cuff: EMPTY_PATH, hand: EMPTY_PATH, thumb: EMPTY_PATH, d: 0, rel: 0 };
  const b1 = behind[0] ?? E;
  const b2 = behind[1] ?? E;
  const a1 = front[0] ?? E;
  const a2 = front[1] ?? E;
  // the raised index finger of the right hand (tashahhud)
  const fingerLen = p[S.finger];
  let finger = EMPTY_PATH;
  if (fingerLen > 0.05) {
    const w = at(b.nWrist);
    const t = at(b.nTip);
    const knuckle = lerpV(w, t, 0.62);
    const hd = dirOf(p, D.nHA);
    const fd = P.dir(norm3([hd[0], hd[1] - 2.4, hd[2]]));
    const fl = Math.sqrt(fd[0] * fd[0] + fd[1] * fd[1]) || 1;
    finger = taper(knuckle, add(knuckle, [(fd[0] / fl) * 10.5 * fingerLen, (fd[1] / fl) * 10.5 * fingerLen]), 2.4, 2);
  }

  // ---- torso
  const tc = (v: V3, r: number): number[] => {
    const q = at(v);
    return [q[0], q[1], r];
  };
  const torso = hull([tc(b.nHip, 11), tc(b.fHip, 11), tc(b.belly, 12.5), tc(b.chest, 12.5), tc(b.back, 12), tc(b.nShoulder, 8.6), tc(b.fShoulder, 8.6)]);
  // a darker band along the back gives the body some volume (only where the back can be seen)
  const backSeen = 1 - Math.min(1, Math.max(0, P.depth(fwd3)) * 1.25);
  const torsoShade =
    backSeen > 0.2
      ? hull([tc(add3(b.hip, fwd3, -6), 8.5 * backSeen), tc(add3(b.back, fwd3, -5.5), 7.5 * backSeen), tc(add3(b.shoulder, fwd3, -4.5), 6.5 * backSeen)])
      : EMPTY_PATH;
  // long shirt over the thighs (male) / the dress over the legs (female)
  let hem = EMPTY_PATH;
  let skirt = EMPTY_PATH;
  let skirtShade = EMPTY_PATH;
  let collar = EMPTY_PATH;
  if (female) {
    const flare = (ankle: V3, knee: V3) => add3(ankle, norm3([ankle[0] - knee[0], ankle[1] - knee[1], ankle[2] - knee[2]]), 1.5);
    skirt = hull([tc(b.nHip, 12.5), tc(b.fHip, 12.5), tc(b.nKnee, 11), tc(b.fKnee, 11), tc(flare(b.nAnkle, b.nKnee), 8.8), tc(flare(b.fAnkle, b.fKnee), 8.8)]);
    skirtShade = backSeen > 0.2 ? hull([tc(add3(b.hip, fwd3, -5), 9 * backSeen), tc(add3(lerp3(b.nKnee, b.fKnee, 0.5), fwd3, -4), 7 * backSeen)]) : EMPTY_PATH;
  } else {
    const k = p[S.hem];
    hem = `${taper(at(b.nHip), at(lerp3(b.nHip, b.nKnee, k)), 12, 10.4)}${taper(at(b.fHip), at(lerp3(b.fHip, b.fKnee, k)), 12, 10.4)}`;
    // the placket of the shirt on the chest
    const c0 = add3(add3(b.shoulder, spine, -1), fwd3, 9.5);
    const c1 = add3(add3(b.shoulder, spine, -12), fwd3, 10.5);
    if (P.depth(fwd3) > -0.2) collar = taper(at(c0), at(c1), 1.6, 1.6);
  }

  // ---- head
  const headC = at(b.head);
  const up3 = dirOf(p, D.up);
  const face3 = dirOf(p, D.face);
  const upS = P.dir(up3);
  const aUp = angleOfV(upS);
  const faceS = P.dir(face3);
  // how much the face is turned towards the viewer (1 = from the front, 0 = in profile, < 0 = away)
  const fd = P.depth(face3);
  const fdPos = Math.max(0, fd);
  const fOff: V = [faceS[0] * HEAD_R * 0.42, faceS[1] * HEAD_R * 0.42];
  const neck = taper(at(lerp3(b.shoulder, b.head, 0.05)), headC, 5.2, 5.2);
  let head = EMPTY_PATH;
  let hair = EMPTY_PATH;
  let earA = EMPTY_PATH;
  let earB = EMPTY_PATH;
  let kufi = EMPTY_PATH;
  let kufiBand = EMPTY_PATH;
  let hijab = EMPTY_PATH;
  let hijabFold = EMPTY_PATH;
  let face = EMPTY_PATH;
  let faceArea = EMPTY_PATH;
  const faceC = add(headC, fOff);
  const across = HEAD_R * (0.3 + 0.33 * fdPos);
  if (female) {
    const chin = add3(add3(b.head, face3, HEAD_R * 0.3), up3, -HEAD_R * 0.8);
    const chestFront = add3(add3(b.shoulder, fwd3, 6), spine, -9);
    hijab = hull([tc(b.head, HEAD_R + 2.8), tc(chin, HEAD_R * 0.66), tc(b.nShoulder, 9.5), tc(b.fShoulder, 9.5), tc(chestFront, 11)]);
    if (fd > -0.35) {
      const sc = Math.min(1, (fd + 0.35) * 2.5);
      face = ellipse(add(faceC, [upS[0] * 0.8, upS[1] * 0.8]), HEAD_R * 0.74 * sc, across * sc, aUp);
      hijabFold = ellipse(add(faceC, [upS[0] * 0.8, upS[1] * 0.8]), HEAD_R * 0.74 * sc + 2.2, across * sc + 2.2, aUp);
    }
  } else {
    head = circle(headC, HEAD_R);
    // the face: a lighter area on the side the head looks to, a soft nose bump in profile (no features)
    if (fd > -0.35) {
      const sc = Math.min(1, (fd + 0.35) * 2.5);
      faceArea = ellipse(add(faceC, [-upS[0] * 1.2, -upS[1] * 1.2]), HEAD_R * 0.68 * sc, across * 0.95 * sc, aUp);
      const side = Math.sqrt(faceS[0] * faceS[0] + faceS[1] * faceS[1]);
      const nr = 2.6 * Math.min(1, Math.max(0, side - 0.45) * 2);
      if (nr > 0.4) {
        const nc = add(add(headC, [faceS[0] / side * (HEAD_R - 0.6), faceS[1] / side * (HEAD_R - 0.6)]), [-upS[0] * 2.4, -upS[1] * 2.4]);
        head = `${head}${circle(nc, nr)}`;
      }
    }
    // the ears on both sides of the head; only the ones turned towards the viewer show
    const ear3 = norm3([up3[1] * face3[2] - up3[2] * face3[1], up3[2] * face3[0] - up3[0] * face3[2], up3[0] * face3[1] - up3[1] * face3[0]]);
    const ears: string[] = [];
    for (const s of [1, -1]) {
      const e3: V3 = [ear3[0] * s, ear3[1] * s, ear3[2] * s];
      const dd = P.depth(e3);
      if (dd > -0.3) {
        const eS = P.dir(e3);
        const ec = add(add(headC, [eS[0] * HEAD_R * 0.98, eS[1] * HEAD_R * 0.98]), [-upS[0] * 1.2, -upS[1] * 1.2]);
        ears.push(ellipse(ec, 3.8, 2 + Math.min(1.2, (dd + 0.3) * 1.6), aUp));
      }
    }
    earA = ears[0] ?? EMPTY_PATH;
    earB = ears[1] ?? EMPTY_PATH;
    // short hair under the kufi: at the back of the head, at the temples when seen from the front
    const faceSide = faceS[0] * upS[1] - faceS[1] * upS[0] > 0 ? -1 : 1;
    const backLen = 52 * (1 - fdPos);
    let h = backLen > 6 ? segment(headC, HEAD_R + 0.2, aUp + faceSide * 76, aUp + faceSide * (76 + backLen)) : '';
    if (fdPos > 0.35) {
      const k = 22 * fdPos;
      h += `${segment(headC, HEAD_R + 0.2, aUp + 76, aUp + 76 + k)}${segment(headC, HEAD_R + 0.2, aUp - 76, aUp - 76 - k)}`;
    }
    hair = h || EMPTY_PATH;
    kufi = segment(headC, HEAD_R + 1, aUp - 80, aUp + 80);
    const k0 = add(headC, dirv(aUp - 80, HEAD_R + 1));
    const k1 = add(headC, dirv(aUp + 80, HEAD_R + 1));
    kufiBand = `M${pt(k0)}L${pt(k1)}L${pt(lerpV(k1, headC, 0.2))}L${pt(lerpV(k0, headC, 0.2))}Z`;
  }

  // ---- ground shadow under the body
  const xs = [at(b.hip)[0], headC[0], at(b.nToe)[0], at(b.fToe)[0], at(b.nKnee)[0], at(b.fKnee)[0], at(b.nTip)[0], at(b.fTip)[0], at(b.nBall)[0], at(b.fBall)[0]];
  let minX = 1e9;
  let maxX = -1e9;
  for (let i = 0; i < xs.length; i++) {
    minX = Math.min(minX, xs[i]);
    maxX = Math.max(maxX, xs[i]);
  }
  const shadow = ellipse([(minX + maxX) / 2, FIG_GROUND + 1.5], (maxX - minX) / 2 + 12, 3.4, 90);

  return {
    shadow,
    footB: nearFront ? fFoot : nFoot,
    legB: nearFront ? fLeg : nLeg,
    footF: nearFront ? nFoot : fFoot,
    legF: nearFront ? nLeg : fLeg,
    armB1: b1.arm,
    thumbB1: b1.thumb,
    handB1: b1.hand,
    armB2: b2.arm,
    thumbB2: b2.thumb,
    handB2: b2.hand,
    skirt,
    skirtShade,
    hem,
    neck,
    torso,
    torsoShade,
    collar,
    hijab,
    head,
    hijabFold,
    face,
    faceArea,
    hair,
    earA,
    earB,
    kufi,
    kufiBand,
    arm1: a1.arm,
    cuff1: a1.cuff,
    thumb1: a1.thumb,
    hand1: a1.hand,
    arm2: a2.arm,
    cuff2: a2.cuff,
    thumb2: a2.thumb,
    hand2: a2.hand,
    finger,
  };
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
  /** Sleeves: a little darker than the shirt / dress so the arms read against the body. */
  sleeve: string;
  sleeveF: string;
  faceLight: string;
  dark: boolean;
}

/** Clothes and skin tones (art colours, the same in every theme; `dark` lifts them a little for dark surfaces). */
export function figureColors(dark: boolean, tint: string = C.figure): FigureColors {
  return {
    skin: tint,
    skinShade: shade(tint, 0.12),
    shirt: dark ? '#43B3A3' : '#2A9D8F',
    shirtShade: dark ? '#2F8C80' : '#1E7A6F',
    shirtTrim: dark ? '#2F8C80' : '#1E7A6F',
    trousers: dark ? '#5C6FA3' : '#3D4E80',
    trousersShade: dark ? '#4A5B8C' : '#2E3C66',
    kufi: '#FBF7EE',
    kufiBand: '#E2D3B8',
    hair: '#6B4A36',
    hijab: dark ? '#D9CCF5' : '#CDBDEE',
    hijabShade: dark ? '#BCA9E6' : '#B19CDF',
    dress: dark ? '#8C6CC9' : '#6E4AA0',
    dressShade: dark ? '#7457AE' : '#573A84',
    shadow: dark ? '#000000' : C.ink,
    shadowOpacity: dark ? 0.4 : 0.12,
    sleeve: dark ? '#36A090' : '#23887B',
    sleeveF: dark ? '#7A5DBC' : '#5E3F93',
    faceLight: mix(tint, '#FFFFFF', 0.22),
    dark,
  };
}

export function layerFill(layer: FigureLayer, variant: PrayerVariant, k: FigureColors): string {
  const female = variant === 'female';
  switch (layer) {
    case 'shadow':
      return k.shadow;
    case 'legB':
      return female ? k.dressShade : k.trousersShade;
    case 'legF':
      return female ? k.dress : k.trousers;
    case 'footB':
    case 'handB1':
    case 'handB2':
    case 'thumbB1':
    case 'thumbB2':
    case 'earA':
    case 'earB':
      return k.skinShade;
    case 'footF':
    case 'hand1':
    case 'hand2':
    case 'thumb1':
    case 'thumb2':
    case 'finger':
    case 'head':
    case 'neck':
    case 'face':
      return k.skin;
    case 'faceArea':
      return k.faceLight;
    case 'armB1':
    case 'armB2':
      return female ? k.dressShade : k.shirtShade;
    case 'arm1':
    case 'arm2':
      return female ? k.sleeveF : k.sleeve;
    case 'torso':
    case 'hem':
    case 'skirt':
      return female ? k.dress : k.shirt;
    case 'torsoShade':
    case 'skirtShade':
      return female ? k.dressShade : k.shirtShade;
    case 'collar':
    case 'cuff1':
    case 'cuff2':
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

const NO_OUTLINE = new Set<FigureLayer>(['kufiBand', 'hijabFold', 'faceArea', 'hair', 'collar', 'cuff1', 'cuff2']);

/**
 * Fill, outline and opacity of one layer. A layer with a stroke is drawn twice: first the path filled and stroked in
 * the outline colour (`outlinePass`), then filled on top – so only the silhouette of the layer is outlined, never the
 * seams of the capsules it is made of.
 */
export function outlinePass(style: ReturnType<typeof layerStyle>): { fill: string; stroke: string; strokeWidth: number; strokeLinejoin: 'round' } | null {
  return style.stroke ? { fill: style.stroke, stroke: style.stroke, strokeWidth: style.strokeWidth ?? 2, strokeLinejoin: 'round' } : null;
}

export const fillPass = (style: ReturnType<typeof layerStyle>) => ({ fill: style.fill, opacity: style.opacity });

export function layerStyle(layer: FigureLayer, variant: PrayerVariant, k: FigureColors): { fill: string; stroke?: string; strokeWidth?: number; opacity?: number; strokeLinejoin?: 'round' } {
  const fill = layerFill(layer, variant, k);
  if (layer === 'shadow') return { fill, opacity: k.shadowOpacity };
  if (layer === 'torsoShade' || layer === 'skirtShade') return { fill, opacity: 0.4 };
  if (NO_OUTLINE.has(layer)) return { fill };
  // a clean silhouette: a darker outline in light mode, a soft light rim on dark surfaces
  const stroke = k.dark ? mix(fill, '#FFFFFF', 0.45) : shade(fill, layer === 'kufi' ? 0.25 : 0.42);
  const thin = layer === 'thumb1' || layer === 'thumb2' || layer === 'thumbB1' || layer === 'thumbB2' || layer === 'finger' || layer === 'earA' || layer === 'earB';
  return { fill, stroke, strokeWidth: (k.dark ? 1.8 : 2.2) * (thin ? 0.8 : 1), strokeLinejoin: 'round' };
}

// ---------------------------------------------------------------------------------------------------------------
// Poses (built once; hands are placed with a two-bone IK so they really hold the knees, touch the earlobes, …)

const rad = (a: number) => (a * Math.PI) / 180;
/** Direction in the body's middle plane (0 = down, 90 = forward, 180 = up, -90 = back), optionally to the side. */
const sag = (a: number, side = 0): V3 => norm3([Math.sin(rad(a)), Math.cos(rad(a)), side]);
const v3 = (x: number, y: number, z: number): V3 => norm3([x, y, z]);
const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len3 = (a: V3) => Math.sqrt(dot3(a, a));

/** Head looking `look` degrees below the horizon (0 = straight ahead), turned `turn` towards the right side (selam). */
function headDirs(neckA: number, look: number, turn = 0): Pick<PoseParams, 'neck' | 'up' | 'face'> {
  const fwd = sag(90 - look);
  const up = sag(180 - look);
  const t = rad(turn);
  const face = norm3([fwd[0] * Math.cos(t), fwd[1] * Math.cos(t), Math.sin(t)]);
  return { neck: sag(neckA), up, face };
}

const HANG = { nUA: v3(0.04, 1, 0.12), nFA: v3(0.08, 1, 0.04), nHA: v3(0.06, 1, 0), nPalm: v3(0, 0, -1), nThumb: v3(1, 0.2, 0), fUA: v3(0.04, 1, -0.12), fFA: v3(0.08, 1, -0.04), fHA: v3(0.06, 1, 0), fPalm: v3(0, 0, 1), fThumb: v3(1, 0.2, 0) };
const STAND_LEGS = { nTh: sag(0), nSh: sag(0), nFt: sag(78, 0.25), nToe: sag(90, 0.25), fTh: sag(0), fSh: sag(0), fFt: sag(78, -0.25), fToe: sag(90, -0.25) };

const BASE: PoseParams = {
  yaw: 70,
  shiftX: 0,
  finger: 0,
  hem: 0.5,
  spine: sag(180),
  ...headDirs(178, 18),
  ...HANG,
  ...STAND_LEGS,
};

const pose = (over: Partial<PoseParams>): PoseParams => ({ ...BASE, ...over });

type Side = 'n' | 'f';
type Target = (b: Body) => V3;

/** Places the wrist of one arm on a target (body space) with the elbow bent towards `pole`; sets the hand. */
function reach(p: PoseParams, side: Side, target: Target, pole: V3, hand: { dir: V3; palm: V3; thumb: V3 }): PoseParams {
  const b = solveBody(poseToVec(p));
  const Sh = side === 'n' ? b.nShoulder : b.fShoulder;
  const T = target(b);
  const d = sub3(T, Sh);
  const L = len3(d);
  const u: V3 = [d[0] / L, d[1] / L, d[2] / L];
  let ua = u;
  let fa = u;
  if (L < UA + FA - 0.01) {
    const cosA = (UA * UA + L * L - FA * FA) / (2 * UA * L);
    const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
    const pr = dot3(pole, u);
    const v = norm3([pole[0] - u[0] * pr, pole[1] - u[1] * pr, pole[2] - u[2] * pr]);
    const e: V3 = [Sh[0] + u[0] * UA * cosA + v[0] * UA * sinA, Sh[1] + u[1] * UA * cosA + v[1] * UA * sinA, Sh[2] + u[2] * UA * cosA + v[2] * UA * sinA];
    ua = norm3(sub3(e, Sh));
    fa = norm3(sub3(T, e));
  }
  return { ...p, [`${side}UA`]: ua, [`${side}FA`]: fa, [`${side}HA`]: norm3(hand.dir), [`${side}Palm`]: norm3(hand.palm), [`${side}Thumb`]: norm3(hand.thumb) };
}

const mirror = (v: V3): V3 => [v[0], v[1], -v[2]];
/** Both arms, the left one mirrored from the right one. */
function bothArms(p: PoseParams, target: (b: Body, s: 1 | -1) => V3, pole: V3, hand: { dir: V3; palm: V3; thumb: V3 }): PoseParams {
  const right = reach(p, 'n', (b) => target(b, 1), pole, hand);
  return reach(right, 'f', (b) => target(b, -1), mirror(pole), { dir: mirror(hand.dir), palm: mirror(hand.palm), thumb: mirror(hand.thumb) });
}

/** Turns the neck until the forehead rests on the ground (sajda). */
function headDown(p: PoseParams, look: number): PoseParams {
  let lo = 0;
  let hi = 130;
  const gap = (a: number) => {
    const b = solveBody(poseToVec({ ...p, neck: sag(a) }));
    const ground = Math.max(b.nKnee[1] + 7.5, b.nToe[1] + 3.2);
    return b.head[1] + HEAD_R - ground;
  };
  // the gap shrinks as the angle grows (the head lifts towards the front)
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (gap(m) > 0) lo = m;
    else hi = m;
  }
  const a = (lo + hi) / 2;
  return { ...p, neck: sag(a), up: sag(a + look), face: sag(a + look - 90) };
}

// Leg settings
const KNEEL_LEGS: Partial<PoseParams> = { nTh: sag(30), nSh: sag(-90), nFt: sag(10), nToe: sag(90), fTh: sag(30), fSh: sag(-90), fFt: sag(10), fToe: sag(90) };
const SAJDA_LEGS_M: Partial<PoseParams> = { nTh: sag(18), nSh: sag(-89), nFt: sag(8), nToe: sag(90), fTh: sag(18), fSh: sag(-89), fFt: sag(8), fToe: sag(90) };
const SAJDA_LEGS_F: Partial<PoseParams> = { nTh: sag(36), nSh: sag(-90), nFt: sag(4), nToe: sag(90), fTh: sag(36), fSh: sag(-90), fFt: sag(4), fToe: sag(90) };
// men: sitting on the left foot laid under the body, the right foot upright with the toes bent towards the qibla
const SIT_M: Partial<PoseParams> = { nTh: sag(76, 0.06), nSh: sag(-92, 0.02), nFt: sag(4), nToe: sag(90), fTh: sag(76, -0.06), fSh: sag(-94, 0.1), fFt: v3(-0.1, 0.35, 1), fToe: v3(0, 0.3, 1) };
// women: sitting on the floor, both feet out to the right side
const SIT_F: Partial<PoseParams> = { nTh: sag(84, 0.1), nSh: v3(-0.55, 0.06, 0.85), nFt: v3(-0.1, 0.25, 1), nToe: v3(0, 0.2, 1), fTh: sag(84, -0.05), fSh: v3(-0.45, 0.08, 0.9), fFt: v3(-0.1, 0.25, 1), fToe: v3(0, 0.2, 1) };

/** Hands resting on the thighs near the knees, the fingers towards the knees. */
const onThighs = (p: PoseParams) =>
  bothArms(p, (b, s) => {
    const knee = s === 1 ? b.nKnee : b.fKnee;
    const hip = s === 1 ? b.nHip : b.fHip;
    const q = lerp3(hip, knee, 0.5);
    return [q[0], q[1] - 9.5, q[2]];
  }, v3(-0.6, 0.2, 1), { dir: v3(1, 0.32, 0), palm: v3(0, 1, 0), thumb: v3(0.4, 0, -1) });

function buildMale(): Record<PrayerPosition, PoseParams> {
  const qiyam = pose({ ...headDirs(178, 26) });
  // hands raised beside the head: the thumbs at the earlobes, the open palms towards the qibla, the fingers up
  const takbir = bothArms(pose({ yaw: 76, ...headDirs(178, 10) }), (b, s) => [b.head[0] + 4, b.head[1] + HEAD_R * 0.72, s * (HEAD_R + 7.5)], v3(0.45, 1, 0.45), {
    dir: v3(0.08, -1, 0.1),
    palm: v3(1, 0, 0),
    thumb: v3(0, -0.15, -1),
  });
  // the right hand over the left below the navel; the right thumb and little finger hold the left wrist
  const foldedBase = pose({ yaw: 78, ...headDirs(178, 26) });
  const folded = reach(
    reach(foldedBase, 'f', (b) => [b.belly[0] + 15, b.hip[1] - 10, -7], v3(-0.6, 0.7, -1), { dir: v3(0.12, 0.3, 1), palm: v3(-1, 0, 0), thumb: v3(0, -1, 0.3) }),
    'n',
    (b) => [b.belly[0] + 17.5, b.hip[1] - 8, 6],
    v3(-0.5, 0.8, 1),
    { dir: v3(0.12, -0.2, -1), palm: v3(-1, 0, 0), thumb: v3(0.1, 1, -0.2) },
  );
  // a level back, straight legs, the hands holding the knees
  const rukuBase = pose({ yaw: 10, spine: sag(92), ...headDirs(92, 82), nTh: sag(8), nSh: sag(-5), fTh: sag(8), fSh: sag(-5), nFt: sag(82), fFt: sag(82), nToe: sag(90), fToe: sag(90), hem: 0.32 });
  const ruku = bothArms(rukuBase, (b, s) => {
    const k = s === 1 ? b.nKnee : b.fKnee;
    return [k[0] + 3, k[1] - 8, k[2] + s * 1.5];
  }, v3(-1, 0, 0.4), { dir: v3(0.25, 1, 0), palm: v3(-1, 0, 0), thumb: v3(0, 0.3, -1) });
  const itidal = pose({ ...headDirs(178, 14) });
  const kneel = onThighs(pose({ yaw: 32, spine: sag(170), ...headDirs(172, 30), hem: 0.4, ...KNEEL_LEGS }));
  const sajdaBody = headDown(pose({ yaw: 14, spine: sag(62), hem: 0.3, ...SAJDA_LEGS_M }), 6);
  // palms flat beside the head at the level of the ears, the fingers towards the qibla, the elbows raised
  const sajda = bothArms(sajdaBody, (b, s) => [b.head[0] - 4, lowest(b, false) - 4.4, s * (HEAD_R + 4)], v3(-0.4, -1, 0.6), {
    dir: v3(1, 0.02, 0),
    palm: v3(0, 1, 0),
    thumb: v3(0, 0, -1),
  });
  const sit = (extra: Partial<PoseParams> = {}) => onThighs(pose({ yaw: 46, spine: sag(178), ...headDirs(176, 20), hem: 0.55, ...SIT_M, ...extra }));
  const jalsa = sit();
  const tashahhud = sit({ finger: 1 });
  const selamRight = sit({ ...headDirs(176, 4, 82) });
  const selamLeft = sit({ ...headDirs(176, 4, -82) });
  // the hands raised in front of the chest, the palms up
  const dua = bothArms(sit({ ...headDirs(176, 24) }), (b, s) => [b.chest[0] + 17, b.chest[1] + 4, s * 9], v3(-0.3, 1, 1), { dir: v3(1, -0.3, 0.3), palm: v3(0, -1, 0), thumb: v3(0, -0.2, -1) });
  return { qiyam, takbir, folded, ruku, itidal, kneel, sajda, jalsa, tashahhud, 'selam-right': selamRight, 'selam-left': selamLeft, dua };
}

function buildFemale(male: Record<PrayerPosition, PoseParams>): Record<PrayerPosition, PoseParams> {
  // the hands raised to the shoulders, the palms towards the qibla
  const takbir = bothArms(pose({ yaw: 76, ...headDirs(178, 10) }), (b, s) => [b.nShoulder[0] + 7, b.nShoulder[1] + 9, s * (SW + 2)], v3(0.2, 1, 0.8), {
    dir: v3(0.1, -1, 0.05),
    palm: v3(1, 0, 0),
    thumb: v3(0, -0.15, -1),
  });
  // the right hand over the left, on the chest
  const foldedBase = pose({ yaw: 78, ...headDirs(178, 26) });
  const folded = reach(
    reach(foldedBase, 'f', (b) => [b.chest[0] + 15.5, b.chest[1] + 2, -7], v3(-0.6, 0.9, -1), { dir: v3(0.12, 0.3, 1), palm: v3(-1, 0, 0), thumb: v3(0, -1, 0.3) }),
    'n',
    (b) => [b.chest[0] + 18, b.chest[1] + 4, 6],
    v3(-0.5, 1, 1),
    { dir: v3(0.12, 0.05, -1), palm: v3(-1, 0, 0), thumb: v3(0, -1, 0) },
  );
  const rukuBase = pose({ yaw: 10, spine: sag(112), ...headDirs(112, 72), nTh: sag(-6), nSh: sag(8), fTh: sag(-6), fSh: sag(8), nFt: sag(80), fFt: sag(80), nToe: sag(90), fToe: sag(90) });
  const ruku = bothArms(rukuBase, (b, s) => {
    const k = s === 1 ? b.nKnee : b.fKnee;
    return [k[0] + 4, k[1] - 7, k[2] + s * 1.5];
  }, v3(-1, 0, 0.4), { dir: v3(0.3, 1, 0), palm: v3(-1, 0, 0), thumb: v3(0, 0.3, -1) });
  const sajdaBody = headDown(pose({ yaw: 14, spine: sag(70), ...SAJDA_LEGS_F }), 6);
  // compact: the forearms on the ground, the arms close to the body
  const sajda = bothArms(sajdaBody, (b, s) => [b.head[0] - 8, lowest(b, false) - 4.4, s * (HEAD_R + 1)], v3(-0.6, 0.6, 0.2), { dir: v3(1, 0.02, 0), palm: v3(0, 1, 0), thumb: v3(0, 0, -1) });
  const sit = (extra: Partial<PoseParams> = {}) => onThighs(pose({ yaw: 46, spine: sag(176), ...headDirs(176, 20), shiftX: 4, ...SIT_F, ...extra }));
  const jalsa = sit();
  const tashahhud = sit({ finger: 1 });
  const selamRight = sit({ ...headDirs(176, 4, 82) });
  const selamLeft = sit({ ...headDirs(176, 4, -82) });
  const dua = bothArms(sit({ ...headDirs(176, 24) }), (b, s) => [b.chest[0] + 17, b.chest[1] + 4, s * 9], v3(-0.3, 1, 1), { dir: v3(1, -0.3, 0.3), palm: v3(0, -1, 0), thumb: v3(0, -0.2, -1) });
  const kneel = onThighs(pose({ yaw: 32, spine: sag(170), ...headDirs(172, 30), ...KNEEL_LEGS }));
  return { ...male, takbir, folded, ruku, kneel, sajda, jalsa, tashahhud, 'selam-right': selamRight, 'selam-left': selamLeft, dua };
}

const MALE = buildMale();
const FEMALE = buildFemale(MALE);

export function prayerPose(position: PrayerPosition, variant: PrayerVariant): PoseVec {
  return poseToVec((variant === 'female' ? FEMALE : MALE)[position]);
}

/** Linear interpolation between two poses (worklet; the directions are normalised when the pose is drawn). */
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
function sajdaSpotLocal(variant: PrayerVariant): V {
  const j = solvePose(prayerPose('sajda', variant));
  return [j.head[0] + 9, FIG_GROUND];
}

export function sajdaSpot(variant: PrayerVariant): V {
  const l = sajdaSpotLocal(variant);
  return [toView(l[0], l[1])[0], FIG_GROUND];
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
  return sajdaPointsLocal(variant).map((p) => {
    const [x, y] = toView(p.x, p.y);
    return { id: p.id, x, y };
  });
}

function sajdaPointsLocal(variant: PrayerVariant): { id: SajdaPointId; x: number; y: number }[] {
  const j = solvePose(prayerPose('sajda', variant));
  const forehead = add(j.head, [j.face[0] * HEAD_R * 0.86, j.face[1] * HEAD_R * 0.86]);
  const palm = (w: V, t: V) => lerpV(w, t, 0.45);
  const nh = palm(j.nWrist, j.nTip);
  const fh = palm(j.fWrist, j.fTip);
  // the far side is drawn a little up and back so the two points of a pair never sit on top of each other
  return [
    { id: 'forehead', x: forehead[0], y: forehead[1] },
    { id: 'hand-right', x: nh[0], y: nh[1] + 1 },
    { id: 'hand-left', x: fh[0] + 2, y: fh[1] - 7 },
    { id: 'knee-right', x: j.nKnee[0] + 2, y: j.nKnee[1] + 4 },
    { id: 'knee-left', x: j.fKnee[0] - 5, y: j.fKnee[1] - 7 },
    { id: 'toes-right', x: j.nToe[0], y: j.nToe[1] + 0.5 },
    { id: 'toes-left', x: j.fToe[0] - 6, y: j.fToe[1] - 7 },
  ];
}

export function FigureShapes({ c, frame, variant }: { c: Ctx; frame: FigureFrame; variant: PrayerVariant }) {
  const k = figureColors(c.dark, c.tint === C.figure ? undefined : c.tint);
  return (
    <G transform={FIG_TRANSFORM}>
      {FIGURE_LAYERS.map((layer) => {
        if (frame[layer] === EMPTY_PATH) return null;
        const st = layerStyle(layer, variant, k);
        const o = outlinePass(st);
        return (
          <G key={layer}>
            {o ? <Path d={frame[layer]} {...o} /> : null}
            <Path d={frame[layer]} {...fillPass(st)} />
          </G>
        );
      })}
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
  const hand = (w: V, t: V) => lerpV(w, t, 0.4);
  switch (position) {
    case 'takbir':
      spots.push([hand(j.nWrist, j.nTip), 14], [hand(j.fWrist, j.fTip), 14]);
      break;
    case 'folded':
    case 'dua':
      spots.push([lerpV(hand(j.nWrist, j.nTip), hand(j.fWrist, j.fTip), 0.5), 17]);
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
    <G transform={FIG_TRANSFORM}>
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
    const eye = add(j.head, [j.face[0] * HEAD_R * 0.6, j.face[1] * HEAD_R * 0.6 + 2]);
    const spot = sajdaSpotLocal(variant);
    out.push(<Path key="gaze" d={`M${pt(eye)}L${spot[0]} ${spot[1] - 1}`} stroke={gold} strokeWidth={1.5} strokeDasharray="1.5 4.5" strokeLinecap="round" opacity={0.85} />);
    out.push(<Circle key="gazeSpot" cx={spot[0]} cy={spot[1] - 1} r={3.2} fill={gold} opacity={0.7} />);
  }
  if (cues.arrows) {
    const k = `a-${position}`;
    switch (position) {
      case 'takbir': {
        // both hands go up beside the head
        for (const [w, s] of [[j.nWrist, -1], [j.fWrist, 1]] as [V, number][]) {
          out.push(<Arrow key={`${k}${s}`} pts={[[w[0] + s * 11, w[1] + 22], [w[0] + s * 11, w[1] + 2]]} color={gold} />);
        }
        break;
      }
      case 'folded': {
        const m = lerpV(j.nWrist, j.fWrist, 0.5);
        out.push(<Arrow key={k} pts={[[m[0] - 26, m[1] - 4], [m[0] - 20, m[1] + 4], [m[0] - 12, m[1] + 4]]} color={gold} />);
        break;
      }
      case 'ruku':
        out.push(<Arrow key={k} pts={arc(j.hip, SPINE + 18, 160, 112)} color={gold} />);
        break;
      case 'itidal':
        out.push(<Arrow key={k} pts={[[j.head[0] + 24, j.head[1] + 40], [j.head[0] + 24, j.head[1] + 4]]} color={gold} />);
        break;
      case 'kneel':
        out.push(<Arrow key={k} pts={[[j.nKnee[0] + 16, j.nKnee[1] - 24], [j.nKnee[0] + 16, j.nKnee[1] - 4]]} color={gold} />);
        break;
      case 'sajda':
        out.push(<Arrow key={k} pts={[[j.head[0] + 14, j.head[1] - 34], [j.head[0] + 14, j.head[1] - 14]]} color={gold} />);
        break;
      case 'jalsa':
        out.push(<Arrow key={k} pts={[[j.head[0] + 26, j.head[1] + 30], [j.head[0] + 26, j.head[1] + 2]]} color={gold} />);
        break;
      case 'tashahhud': {
        const t = add(lerpV(j.nWrist, j.nTip, 0.6), [0, -13]);
        out.push(<Path key={k} d={`M${pt(add(t, [2, -4]))}l2.5-4M${pt(add(t, [5, 0]))}l4.5-1M${pt(add(t, [-2, -5]))}l0-4.5`} stroke={gold} strokeWidth={2} strokeLinecap="round" />);
        break;
      }
      case 'selam-right':
        // the head turns to the right shoulder (towards the viewer's left)
        out.push(<Arrow key={k} pts={arc(j.head, HEAD_R + 9, 150, 225, 5)} color={gold} />);
        break;
      case 'selam-left':
        out.push(<Arrow key={k} pts={arc(j.head, HEAD_R + 9, 210, 135, 5)} color={gold} />);
        break;
      default:
        break;
    }
  }
  if (cues.points && position === 'sajda') {
    for (const p of sajdaPointsLocal(variant)) {
      out.push(<Circle key={`pg${p.id}`} cx={p.x} cy={p.y} r={6.4} fill={C.goldPale} opacity={0.65} />);
      out.push(<Circle key={`p${p.id}`} cx={p.x} cy={p.y} r={3.6} fill={C.gold} stroke={C.white} strokeWidth={1.2} />);
    }
  }
  return <G transform={FIG_TRANSFORM}>{out}</G>;
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
