import React from 'react';
import { Circle, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { C, mix } from './palette';

/**
 * Drawing context handed to every piece. Pieces are pure functions of the context (no hooks), so the same drawing
 * code renders inside react-native-svg and – via `svgString()` – as plain SVG markup for contact sheets.
 */
export interface Ctx {
  /** The piece sits on a dark surface: shadows get deeper, very dark shapes get a soft rim/glow. */
  dark: boolean;
  /** Tone for neutral figures (body pictograms, prayer silhouettes). */
  tint: string;
  /** Garden plants: the "needs water" look (faded, never dead). */
  thirsty: boolean;
  /** Unique id for gradients/clips inside this rendered piece. */
  id: (key: string) => string;
  /** `url(#id)` reference for `id(key)`. */
  url: (key: string) => string;
  /** Plant greens (faded when thirsty). */
  green: (color: string) => string;
  /** Flower / fruit colours (slightly faded when thirsty). */
  bloom: (color: string) => string;
}

export type Draw = (c: Ctx) => React.ReactNode;

export interface ArtDef {
  /** viewBox width / height – the intrinsic aspect is w / h. */
  w: number;
  h: number;
  draw: Draw;
}

export const art = (w: number, h: number, draw: Draw): ArtDef => ({ w, h, draw });

export interface CtxOptions {
  dark?: boolean;
  tint?: string;
  thirsty?: boolean;
}

export function makeCtx(prefix: string, { dark = false, tint, thirsty = false }: CtxOptions): Ctx {
  const id = (key: string) => `${prefix}_${key}`;
  return {
    dark,
    tint: tint ?? C.figure,
    thirsty,
    id,
    url: (key) => `url(#${id(key)})`,
    green: (color) => (thirsty ? mix(color, '#C2A95C', 0.55) : color),
    bloom: (color) => (thirsty ? mix(color, '#C9B08A', 0.4) : color),
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Gradients

type StopDef = [offset: number, color: string, opacity?: number];

export function Lin({ id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1 }: { id: string; stops: StopDef[]; x1?: number; y1?: number; x2?: number; y2?: number }) {
  return (
    <LinearGradient id={id} x1={String(x1)} y1={String(y1)} x2={String(x2)} y2={String(y2)}>
      {stops.map(([o, color, op], i) => (
        <Stop key={i} offset={String(o)} stopColor={color} stopOpacity={op ?? 1} />
      ))}
    </LinearGradient>
  );
}

export function Rad({ id, stops, cx = 0.5, cy = 0.5, r = 0.5 }: { id: string; stops: StopDef[]; cx?: number; cy?: number; r?: number }) {
  return (
    <RadialGradient id={id} cx={String(cx)} cy={String(cy)} r={String(r)} fx={String(cx)} fy={String(cy)}>
      {stops.map(([o, color, op], i) => (
        <Stop key={i} offset={String(o)} stopColor={color} stopOpacity={op ?? 1} />
      ))}
    </RadialGradient>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Shared bits

/** Soft ground shadow under standing objects. */
export function Shadow({ c, cx, cy, rx, ry }: { c: Ctx; cx: number; cy: number; rx: number; ry?: number }) {
  return <Ellipse cx={cx} cy={cy} rx={rx} ry={ry ?? rx * 0.18} fill={c.dark ? '#000000' : C.ink} opacity={c.dark ? 0.35 : 0.1} />;
}

/** Faint warm glow behind dark shapes when they sit on a dark surface (keeps their silhouette readable). */
export function DarkHalo({ c, cx, cy, r, color = '#FFFFFF', opacity = 0.1 }: { c: Ctx; cx: number; cy: number; r: number; color?: string; opacity?: number }) {
  if (!c.dark) return null;
  return <Circle cx={cx} cy={cy} r={r} fill={color} opacity={opacity} />;
}

/** Glow disc: a radial gradient from `color` to transparent. Needs a unique key per piece. */
export function Glow({ c, k, cx, cy, r, color = C.goldPale, opacity = 0.8 }: { c: Ctx; k: string; cx: number; cy: number; r: number; color?: string; opacity?: number }) {
  return (
    <>
      <Rad id={c.id(k)} stops={[[0, color, opacity], [0.55, color, opacity * 0.35], [1, color, 0]]} />
      <Circle cx={cx} cy={cy} r={r} fill={c.url(k)} />
    </>
  );
}

const f = (n: number) => Math.round(n * 100) / 100;

/** Regular star polygon (n points). */
export function starPath(cx: number, cy: number, R: number, r: number, n = 5, rot = -90): string {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = ((rot + (i * 180) / n) * Math.PI) / 180;
    const rad = i % 2 === 0 ? R : r;
    pts.push(`${f(cx + rad * Math.cos(a))} ${f(cy + rad * Math.sin(a))}`);
  }
  return `M${pts.join(' L')}Z`;
}

/** Eight-pointed star (two overlapping squares, rub el hizb – as in the app icon). */
export const star8Path = (cx: number, cy: number, R: number, rot = 0) => starPath(cx, cy, R, R * 0.7654, 8, rot - 90);

/** Four-pointed sparkle with curved sides. */
export function sparklePath(cx: number, cy: number, R: number, waist = 0.18): string {
  const w = R * waist;
  return `M${cx} ${cy - R}Q${cx + w} ${cy - w} ${cx + R} ${cy}Q${cx + w} ${cy + w} ${cx} ${cy + R}Q${cx - w} ${cy + w} ${cx - R} ${cy}Q${cx - w} ${cy - w} ${cx} ${cy - R}Z`;
}

/** Crescent: circle (cx, cy, R) minus circle offset by (ox, oy) with radius r. */
export function crescentPath(cx: number, cy: number, R: number, ox: number, oy: number, r: number): string {
  const d = Math.hypot(ox, oy);
  const a = (R * R - r * r + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, R * R - a * a));
  const ux = ox / d;
  const uy = oy / d;
  const px = cx + a * ux;
  const py = cy + a * uy;
  const p1 = `${f(px - h * uy)} ${f(py + h * ux)}`;
  const p2 = `${f(px + h * uy)} ${f(py - h * ux)}`;
  return `M${p1}A${R} ${R} 0 1 1 ${p2}A${r} ${r} 0 0 0 ${p1}Z`;
}

/** Onion dome standing on y = base. */
export function domePath(cx: number, base: number, r: number, height = 1.45): string {
  const t = base - r * height;
  return `M${cx - r} ${base}C${cx - r} ${base - r * 0.95} ${cx - r * 0.22} ${base - r * 1.05} ${cx} ${t}C${cx + r * 0.22} ${base - r * 1.05} ${cx + r} ${base - r * 0.95} ${cx + r} ${base}Z`;
}

/** Half-round dome standing on y = base. */
export const roundDomePath = (cx: number, base: number, r: number, k = 1) => `M${cx - r} ${base}A${r} ${r * k} 0 0 1 ${cx + r} ${base}Z`;

/** Slightly pointed arch (window/door) with its top at y = top and bottom at y = bottom. */
export function archPath(cx: number, top: number, w: number, bottom: number): string {
  const l = cx - w / 2;
  const r = cx + w / 2;
  const spring = top + w * 0.55;
  return `M${l} ${bottom}V${spring}Q${l} ${top + w * 0.08} ${cx} ${top}Q${r} ${top + w * 0.08} ${r} ${spring}V${bottom}Z`;
}

/** Smooth closed path through points (Catmull–Rom → cubic Bézier). */
export function smoothClosed(pts: [number, number][], tension = 0.5): string {
  const n = pts.length;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const k = tension / 3;
    d += `C${f(p1[0] + (p2[0] - p0[0]) * k)} ${f(p1[1] + (p2[1] - p0[1]) * k)} ${f(p2[0] - (p3[0] - p1[0]) * k)} ${f(p2[1] - (p3[1] - p1[1]) * k)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d}Z`;
}

/** Smooth open path through points. */
export function smoothOpen(pts: [number, number][], tension = 0.5): string {
  const n = pts.length;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    const k = tension / 3;
    d += `C${f(p1[0] + (p2[0] - p0[0]) * k)} ${f(p1[1] + (p2[1] - p0[1]) * k)} ${f(p2[0] - (p3[0] - p1[0]) * k)} ${f(p2[1] - (p3[1] - p1[1]) * k)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

/** Water drop with its tip at (cx, top) and total height h. */
export function dropPath(cx: number, top: number, h: number): string {
  const r = h * 0.36;
  const cy = top + h - r;
  return `M${cx} ${top}C${cx + r * 0.35} ${top + h * 0.28} ${cx + r} ${cy - r * 0.55} ${cx + r} ${cy}A${r} ${r} 0 0 1 ${cx - r} ${cy}C${cx - r} ${cy - r * 0.55} ${cx - r * 0.35} ${top + h * 0.28} ${cx} ${top}Z`;
}

/** Leaf shape from (x, y) pointing at `angle` degrees, length L, width w. */
export function leafPath(x: number, y: number, L: number, w: number, angle: number): string {
  const a = (angle * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const px = -uy;
  const py = ux;
  const tip = [x + ux * L, y + uy * L];
  const c1 = [x + ux * L * 0.35 + px * w, y + uy * L * 0.35 + py * w];
  const c2 = [x + ux * L * 0.35 - px * w, y + uy * L * 0.35 - py * w];
  const c1b = [x + ux * L * 0.8 + px * w * 0.6, y + uy * L * 0.8 + py * w * 0.6];
  const c2b = [x + ux * L * 0.8 - px * w * 0.6, y + uy * L * 0.8 - py * w * 0.6];
  return `M${f(x)} ${f(y)}C${f(c1[0])} ${f(c1[1])} ${f(c1b[0])} ${f(c1b[1])} ${f(tip[0])} ${f(tip[1])}C${f(c2b[0])} ${f(c2b[1])} ${f(c2[0])} ${f(c2[1])} ${f(x)} ${f(y)}Z`;
}

// ---------------------------------------------------------------------------------------------------------------
// Reusable scenery

/** Date palm with its foot at (x, y); `h` = trunk height, `lean` bends the trunk. */
export function Palm({ c, x, y, h = 100, lean = 8, fronds = 1, dates = false, dark: darkTone = false }: { c: Ctx; x: number; y: number; h?: number; lean?: number; fronds?: number; dates?: boolean; dark?: boolean }) {
  const tx = x + lean;
  const ty = y - h;
  const tw = h * 0.055;
  const trunk = darkTone ? C.woodDark : C.wood;
  const L = h * 0.62 * fronds;
  const back = c.green(darkTone ? C.leafDeep : C.leafDark);
  const front = c.green(darkTone ? C.leafDark : C.leaf);
  const hi = c.green(darkTone ? C.leaf : C.leafLight);
  const frond = (angle: number, len: number, droop: number) => {
    const a = (angle * Math.PI) / 180;
    const ex = tx + Math.cos(a) * len;
    const ey = ty + Math.sin(a) * len + droop;
    const mx = tx + Math.cos(a) * len * 0.5;
    const my = ty + Math.sin(a) * len * 0.5 - len * 0.18;
    const w = len * 0.24;
    return `M${f(tx)} ${f(ty)}Q${f(mx)} ${f(my - w)} ${f(ex)} ${f(ey)}Q${f(mx)} ${f(my + w * 0.7)} ${f(tx)} ${f(ty + 2)}Z`;
  };
  const rings = Array.from({ length: Math.max(3, Math.round(h / 14)) }, (_, i) => {
    const t = (i + 0.6) / Math.max(3, Math.round(h / 14));
    const cx = x + lean * t * t;
    const cy = y - h * t;
    const w = tw * (1.15 - t * 0.35);
    return <Path key={i} d={`M${f(cx - w)} ${f(cy + 1.5)}Q${f(cx)} ${f(cy - 1.5)} ${f(cx + w)} ${f(cy + 1.5)}`} stroke={C.woodDark} strokeWidth={h * 0.018} strokeLinecap="round" fill="none" opacity={0.45} />;
  });
  return (
    <G>
      <Path d={`M${f(x - tw * 1.2)} ${y}Q${f(x + lean * 0.1)} ${f(y - h * 0.5)} ${f(tx - tw * 0.7)} ${f(ty)}L${f(tx + tw * 0.7)} ${f(ty)}Q${f(x + lean * 0.4 + tw)} ${f(y - h * 0.5)} ${f(x + tw * 1.2)} ${y}Z`} fill={trunk} />
      {rings}
      <Path d={frond(200, L * 0.95, L * 0.25)} fill={back} />
      <Path d={frond(-20, L * 0.95, L * 0.25)} fill={back} />
      <Path d={frond(235, L * 0.8, L * 0.05)} fill={back} />
      <Path d={frond(-55, L * 0.8, L * 0.05)} fill={back} />
      {dates && (
        <G>
          <Ellipse cx={tx - tw * 1.6} cy={ty + h * 0.08} rx={h * 0.05} ry={h * 0.075} fill={c.bloom(C.terracotta)} />
          <Ellipse cx={tx + tw * 1.8} cy={ty + h * 0.09} rx={h * 0.05} ry={h * 0.075} fill={c.bloom(C.orange)} />
        </G>
      )}
      <Path d={frond(165, L, L * 0.38)} fill={front} />
      <Path d={frond(15, L, L * 0.38)} fill={front} />
      <Path d={frond(255, L * 0.6, -L * 0.05)} fill={hi} />
      <Path d={frond(-80, L * 0.55, -L * 0.05)} fill={front} />
      <Path d={frond(135, L * 0.75, L * 0.2)} fill={hi} />
      <Path d={frond(48, L * 0.75, L * 0.2)} fill={hi} />
      <Circle cx={tx} cy={ty + 1} r={tw * 0.9} fill={C.woodDark} />
    </G>
  );
}

/** Rounded leafy tree with optional fruit dots. */
export function LeafyTree({
  c,
  x,
  y,
  s = 1,
  leaf = C.leaf,
  leafDark = C.leafDark,
  leafLight = C.leafLight,
  trunk = C.wood,
  fruit,
  fruitR = 3.4,
  blobs,
  fruits,
}: {
  c: Ctx;
  x: number;
  y: number;
  s?: number;
  leaf?: string;
  leafDark?: string;
  leafLight?: string;
  trunk?: string;
  fruit?: string;
  fruitR?: number;
  blobs?: [number, number, number][];
  fruits?: [number, number][];
}) {
  const B = blobs ?? [
    [0, -58, 26],
    [-22, -46, 20],
    [22, -44, 21],
    [-10, -74, 18],
    [12, -70, 18],
  ];
  const F = fruits ?? [
    [-18, -44],
    [8, -52],
    [24, -40],
    [-6, -66],
    [16, -68],
    [-26, -56],
  ];
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M-5 0C-4-12-3-24-2-34L-12-48-9-50 0-40 1-52 5-52 4-38 13-50 16-48 6-30C5-18 5-10 6 0Z" fill={trunk} />
      {B.map(([bx, by, r], i) => (
        <Circle key={`d${i}`} cx={bx + 2} cy={by + 3} r={r} fill={c.green(leafDark)} />
      ))}
      {B.map(([bx, by, r], i) => (
        <Circle key={`m${i}`} cx={bx} cy={by} r={r * 0.92} fill={c.green(leaf)} />
      ))}
      {B.slice(0, 2).map(([bx, by, r], i) => (
        <Circle key={`l${i}`} cx={bx - r * 0.3} cy={by - r * 0.35} r={r * 0.5} fill={c.green(leafLight)} opacity={0.35} />
      ))}
      {fruit &&
        F.map(([fx, fy], i) => <Circle key={`f${i}`} cx={fx} cy={fy} r={fruitR} fill={c.bloom(fruit)} />)}
    </G>
  );
}

/** Stylised mountain (triangle with rounded top + shaded right flank). */
export function Mountain({ x, y, w, h, color, shadeColor, snow }: { x: number; y: number; w: number; h: number; color: string; shadeColor: string; snow?: string }) {
  const top = y - h;
  return (
    <G>
      <Path d={`M${x - w / 2} ${y}L${x - w * 0.06} ${top + h * 0.05}Q${x} ${top - h * 0.02} ${x + w * 0.06} ${top + h * 0.05}L${x + w / 2} ${y}Z`} fill={color} />
      <Path d={`M${x} ${top + h * 0.01}Q${x + w * 0.03} ${top} ${x + w * 0.06} ${top + h * 0.05}L${x + w / 2} ${y}H${x + w * 0.08}L${x - w * 0.03} ${top + h * 0.45}Z`} fill={shadeColor} />
      {snow && <Path d={`M${x - w * 0.06} ${top + h * 0.05}Q${x} ${top - h * 0.02} ${x + w * 0.06} ${top + h * 0.05}L${x + w * 0.12} ${top + h * 0.2}L${x + w * 0.04} ${top + h * 0.16}L${x - w * 0.02} ${top + h * 0.24}L${x - w * 0.07} ${top + h * 0.17}L${x - w * 0.13} ${top + h * 0.2}Z`} fill={snow} />}
    </G>
  );
}

/** Puffy cloud centred at (x, y), width ≈ 2.2 r. */
export function Cloud({ x, y, r, color = C.white, shadeColor = '#DCE8F2', opacity = 1 }: { x: number; y: number; r: number; color?: string; shadeColor?: string; opacity?: number }) {
  const b = y + r * 0.45;
  return (
    <G opacity={opacity}>
      <Rect x={x - r * 1.15} y={b - r * 0.5} width={r * 2.3} height={r * 0.5} rx={r * 0.25} fill={shadeColor} />
      <Circle cx={x - r * 0.62} cy={b - r * 0.38} r={r * 0.46} fill={shadeColor} />
      <Circle cx={x + r * 0.7} cy={b - r * 0.36} r={r * 0.44} fill={shadeColor} />
      <Circle cx={x + r * 0.08} cy={b - r * 0.6} r={r * 0.66} fill={shadeColor} />
      <Rect x={x - r * 1.15} y={b - r * 0.58} width={r * 2.3} height={r * 0.44} rx={r * 0.22} fill={color} />
      <Circle cx={x - r * 0.62} cy={b - r * 0.45} r={r * 0.44} fill={color} />
      <Circle cx={x + r * 0.7} cy={b - r * 0.43} r={r * 0.42} fill={color} />
      <Circle cx={x + r * 0.08} cy={b - r * 0.67} r={r * 0.64} fill={color} />
    </G>
  );
}

/** Flat-roofed house block (sand/whitewash) with door + window. */
export function House({ x, y, w, h, color = C.sandLight, shadeColor = C.sandDeep, window: win = C.wood, door = true, dome }: { x: number; y: number; w: number; h: number; color?: string; shadeColor?: string; window?: string; door?: boolean; dome?: string }) {
  return (
    <G>
      <Rect x={x} y={y - h} width={w} height={h} rx={Math.min(3, w * 0.06)} fill={color} />
      <Rect x={x + w * 0.72} y={y - h} width={w * 0.28} height={h} rx={Math.min(3, w * 0.06)} fill={shadeColor} opacity={0.55} />
      <Rect x={x - 1} y={y - h - 2.5} width={w + 2} height={4} rx={2} fill={shadeColor} />
      {door && <Path d={archPath(x + w * 0.32, y - h * 0.48, w * 0.22, y)} fill={win} />}
      <Rect x={x + w * 0.58} y={y - h * 0.72} width={w * 0.16} height={w * 0.16} rx={1.5} fill={win} opacity={0.85} />
      {dome && <Path d={roundDomePath(x + w / 2, y - h - 2, w * 0.28)} fill={dome} />}
    </G>
  );
}

/** Small rounded flower head (5 petals) at (x, y). */
export function Blossom({ c, x, y, r, petal, center = C.gold }: { c: Ctx; x: number; y: number; r: number; petal: string; center?: string }) {
  return (
    <G>
      {[0, 72, 144, 216, 288].map((a) => {
        const rad = ((a - 90) * Math.PI) / 180;
        return <Circle key={a} cx={f(x + Math.cos(rad) * r * 0.62)} cy={f(y + Math.sin(rad) * r * 0.62)} r={r * 0.52} fill={c.bloom(petal)} />;
      })}
      <Circle cx={x} cy={y} r={r * 0.4} fill={center} />
    </G>
  );
}

/** Simple dark-dot eye with a highlight (animals only). */
export function Eye({ x, y, r = 2.4, color = C.ink }: { x: number; y: number; r?: number; color?: string }) {
  return (
    <G>
      <Circle cx={x} cy={y} r={r} fill={color} />
      <Circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.38} fill={C.white} />
    </G>
  );
}

/** Wide sand dunes band from y to the bottom of a w × h canvas. */
export function Dunes({ w, h, y, colors }: { w: number; h: number; y: number; colors: [string, string, string] }) {
  return (
    <G>
      <Path d={`M0 ${y + 10}C${w * 0.2} ${y - 14} ${w * 0.38} ${y - 6} ${w * 0.55} ${y + 8}S${w * 0.85} ${y - 12} ${w} ${y + 4}V${h}H0Z`} fill={colors[0]} />
      <Path d={`M0 ${y + 34}C${w * 0.25} ${y + 12} ${w * 0.45} ${y + 22} ${w * 0.62} ${y + 34}S${w * 0.88} ${y + 18} ${w} ${y + 28}V${h}H0Z`} fill={colors[1]} />
      <Path d={`M0 ${y + 58}C${w * 0.3} ${y + 44} ${w * 0.55} ${y + 52} ${w * 0.75} ${y + 60}S${w * 0.95} ${y + 52} ${w} ${y + 56}V${h}H0Z`} fill={colors[2]} />
    </G>
  );
}

