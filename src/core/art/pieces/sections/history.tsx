import React from 'react';
import { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { archPath, art, Cloud, crescentPath, domePath, Glow, leafPath, Lin, Palm, roundDomePath, smoothClosed, smoothOpen, star8Path, starPath, type ArtDef, type Ctx } from '../../kit';
import { C, mix } from '../../palette';

/*
 * Section art: History (docs/GAMES-V3.md §3.6). Architecture, objects, maps and patterns only – no people.
 * Buildings are simplified but keep their recognisable forms (Gazi Husrev-beg Mosque with its lead dome and portico,
 * the single arch of Stari Most between its two towers, the red-and-white double arches of Córdoba …).
 */

const r1 = (n: number) => Math.round(n * 10) / 10;
/** Dim a colour for dark surfaces (scenes turn to a calm evening). */
const dm = (c: Ctx, color: string, k = 0.38) => (c.dark ? mix(color, '#1B1F4B', k) : color);

// ---------------------------------------------------------------------------------------------------------------
// Shared helpers

/** Rounded scene with a sky gradient; children are clipped to it. */
function Vignette({ c, w, h, sky, children, stars = true }: { c: Ctx; w: number; h: number; sky?: [string, string]; children: React.ReactNode; stars?: boolean }) {
  const [top, bottom] = sky ?? (c.dark ? ['#151942', '#4B3F8F'] : ['#8FCDEB', '#EAF6F4']);
  return (
    <>
      <Defs>
        <ClipPath id={c.id('vclip')}>
          <Rect x={0} y={0} width={w} height={h} rx={18} />
        </ClipPath>
        <Lin id={c.id('vsky')} stops={[[0, top], [1, bottom]]} />
      </Defs>
      <G clipPath={c.url('vclip')}>
        <Rect x={0} y={0} width={w} height={h} fill={c.url('vsky')} />
        {c.dark && stars
          ? [[0.08, 0.08], [0.22, 0.16], [0.4, 0.06], [0.58, 0.14], [0.86, 0.08], [0.94, 0.2], [0.3, 0.26]].map(([x, y], i) => (
              <Circle key={i} cx={w * x} cy={h * y} r={i % 2 ? 1.1 : 1.6} fill={C.white} opacity={0.8} />
            ))
          : null}
        {c.dark && stars ? <Path d={crescentPath(w * 0.8, h * 0.13, h * 0.055, h * 0.03, -h * 0.02, h * 0.048)} fill={C.goldLight} /> : null}
        {!c.dark && stars ? (
          <>
            <Glow c={c} k="vsun" cx={w * 0.84} cy={h * 0.14} r={h * 0.16} color={C.goldPale} opacity={0.85} />
            <Circle cx={w * 0.84} cy={h * 0.14} r={h * 0.05} fill={C.goldLight} />
            <Cloud x={w * 0.2} y={h * 0.14} r={h * 0.035} opacity={0.9} />
          </>
        ) : null}
        {children}
      </G>
    </>
  );
}

/** Horseshoe arch (Córdoba): opening of radius r springing at y = spring, total width 1.7 r, down to `bottom`. */
function horseshoePath(cx: number, spring: number, r: number, bottom: number): string {
  const half = r * 0.85;
  return `M${r1(cx - half)} ${bottom}V${spring}A${r} ${r} 0 1 1 ${r1(cx + half)} ${spring}V${bottom}Z`;
}

/** Alternating red-brick / white-stone voussoirs of a horseshoe arch. */
function Voussoirs({ cx, spring, r, R, n = 11, red = '#B8432F', white = '#F3E6CF' }: { cx: number; spring: number; r: number; R: number; n?: number; red?: string; white?: string }) {
  const cy = spring - r * 0.527;
  const a0 = (148.2 * Math.PI) / 180;
  const a1 = (391.8 * Math.PI) / 180;
  const wedges: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const s = a0 + ((a1 - a0) * i) / n;
    const e = a0 + ((a1 - a0) * (i + 1)) / n;
    const p = (a: number, rad: number) => `${r1(cx + rad * Math.cos(a))} ${r1(cy + rad * Math.sin(a))}`;
    wedges.push(<Path key={i} d={`M${p(s, r)}L${p(s, R)}A${R} ${R} 0 0 1 ${p(e, R)}L${p(e, r)}A${r} ${r} 0 0 0 ${p(s, r)}Z`} fill={i % 2 ? white : red} />);
  }
  return <G>{wedges}</G>;
}

/** Ottoman pencil minaret: shaft, balcony (šerefe), lead cone and a crescent finial. */
function PencilMinaret({ x, base, h, w = 8, body = C.marble, shadeColor = C.stonePale, cone = '#7E8A97' }: { x: number; base: number; h: number; w?: number; body?: string; shadeColor?: string; cone?: string }) {
  const top = base - h;
  const coneH = w * 3;
  return (
    <G>
      <Rect x={x - w * 0.62} y={base - h * 0.16} width={w * 1.24} height={h * 0.16} fill={body} />
      <Rect x={x - w / 2} y={top + coneH} width={w} height={h - coneH} fill={body} />
      <Rect x={x + w * 0.08} y={top + coneH} width={w * 0.42} height={h - coneH} fill={shadeColor} />
      <Rect x={x - w * 0.85} y={top + coneH + h * 0.16} width={w * 1.7} height={w * 0.42} rx={w * 0.2} fill={shadeColor} />
      <Path d={`M${x - w * 0.85} ${top + coneH + h * 0.16 + w * 0.42}L${x - w * 0.5} ${top + coneH + h * 0.16 + w * 1.1}H${x + w * 0.5}L${x + w * 0.85} ${top + coneH + h * 0.16 + w * 0.42}Z`} fill={body} />
      <Path d={`M${x - w * 0.56} ${top + coneH}L${x} ${top}L${x + w * 0.56} ${top + coneH}Z`} fill={cone} />
      <Path d={`M${x} ${top}L${x + w * 0.56} ${top + coneH}H${x + w * 0.1}Z`} fill={mix(cone, '#000000', 0.18)} />
      <Rect x={x - 0.5} y={top - w * 0.9} width={1} height={w * 0.9} fill={C.goldDeep} />
      <Path d={crescentPath(x, top - w * 1.05, w * 0.32, w * 0.14, -w * 0.1, w * 0.26)} fill={C.goldDeep} />
    </G>
  );
}

/** Lead-grey Ottoman dome with a drum, standing on y = base. */
function LeadDome({ cx, base, r, drum = 0, color = '#8794A3', drumColor = C.stonePale }: { cx: number; base: number; r: number; drum?: number; color?: string; drumColor?: string }) {
  return (
    <G>
      {drum > 0 ? <Rect x={cx - r * 1.02} y={base - drum} width={r * 2.04} height={drum} fill={drumColor} /> : null}
      <Path d={roundDomePath(cx, base - drum, r, 0.92)} fill={color} />
      <Path d={`M${cx} ${base - drum - r * 0.92}A${r} ${r * 0.92} 0 0 1 ${cx + r} ${base - drum}H${cx + r * 0.35}Q${cx + r * 0.3} ${base - drum - r * 0.6} ${cx} ${base - drum - r * 0.92}Z`} fill={mix(color, '#000000', 0.15)} />
      <Path d={`M${cx - r * 0.55} ${base - drum - r * 0.55}Q${cx - r * 0.3} ${base - drum - r * 0.85} ${cx} ${base - drum - r * 0.9}`} stroke={C.white} strokeWidth={r * 0.08} opacity={0.35} fill="none" strokeLinecap="round" />
      <Rect x={cx - 0.6} y={base - drum - r * 0.92 - r * 0.4} width={1.2} height={r * 0.4} fill={C.goldDeep} />
      <Path d={crescentPath(cx, base - drum - r * 0.92 - r * 0.48, r * 0.12, r * 0.05, -r * 0.04, r * 0.1)} fill={C.goldDeep} />
    </G>
  );
}

/** Closed book (front cover) with a gold medallion. */
function bookPiece(cover: string, spine: string) {
  return art(90, 100, (c) => (
    <>
      <Ellipse cx={46} cy={94} rx={36} ry={4} fill={c.dark ? '#000000' : C.ink} opacity={c.dark ? 0.3 : 0.1} />
      <Rect x={14} y={10} width={64} height={82} rx={4} fill={C.cream} />
      <Path d="M18 88H76" stroke={C.stonePale} strokeWidth={1.2} />
      <Rect x={10} y={6} width={64} height={82} rx={5} fill={cover} />
      <Rect x={10} y={6} width={11} height={82} rx={4} fill={spine} />
      <Rect x={27} y={13} width={41} height={68} rx={3} fill="none" stroke={C.gold} strokeWidth={1.6} />
      <Path d={star8Path(47.5, 47, 13)} fill={C.gold} />
      <Path d={star8Path(47.5, 47, 7, 22.5)} fill={cover} />
      <Circle cx={47.5} cy={47} r={3} fill={C.goldLight} />
      {[18, 76].map((y) => (
        <Path key={y} d={`M33 ${y}H62`} stroke={C.goldLight} strokeWidth={1.2} strokeDasharray="2 3" />
      ))}
    </>
  ));
}

// ---------------------------------------------------------------------------------------------------------------
// Region map (Atlantic → Arabia): lon -10 … 48, lat 18 … 47.

export const HISTORY_MAP = { w: 360, h: 210, lon0: -10, lon1: 48, lat0: 47, lat1: 18 };
/** Project longitude / latitude onto `history.map-region` / `history.map-mosques` (viewBox units). */
export function projectRegion(lon: number, lat: number): { x: number; y: number } {
  const M = HISTORY_MAP;
  return { x: r1(((lon - M.lon0) / (M.lon1 - M.lon0)) * M.w), y: r1(((M.lat0 - lat) / (M.lat0 - M.lat1)) * M.h) };
}
/** Same, as fractions 0..1 (for kit points / boxes). */
export function regionPoint(lon: number, lat: number): { x: number; y: number } {
  const p = projectRegion(lon, lat);
  return { x: p.x / HISTORY_MAP.w, y: p.y / HISTORY_MAP.h };
}
const RP = (pts: [number, number][]): [number, number][] =>
  pts.map(([lon, lat]) => {
    const p = projectRegion(lon, lat);
    return [p.x, p.y];
  });

const SEAS: [number, number][][] = [
  // Mediterranean
  [
    [-5.6, 36.0], [-4.4, 36.7], [-2.5, 36.8], [-1.0, 37.6], [-0.3, 39.5], [0.9, 40.7], [2.2, 41.4], [3.2, 42.3], [4.5, 43.4], [5.4, 43.3], [7.3, 43.7], [8.9, 44.4],
    [9.8, 44.1], [10.3, 43.5], [12.3, 41.7], [14.3, 40.8], [15.6, 40.0], [15.7, 38.0], [16.6, 38.4], [17.1, 39.0], [17.2, 40.4], [18.5, 40.1], [18.0, 40.6], [16.9, 41.1],
    [15.6, 41.9], [13.5, 43.6], [12.3, 45.4], [13.8, 45.6], [13.6, 44.9], [15.2, 44.2], [16.4, 43.5], [18.1, 42.6], [19.0, 42.0], [19.5, 41.3], [19.4, 40.4], [20.2, 39.6],
    [21.1, 38.3], [21.6, 37.0], [22.4, 36.4], [23.2, 36.5], [22.9, 37.5], [24.0, 37.7], [23.0, 38.6], [22.9, 40.4], [24.0, 40.8], [26.0, 40.8], [26.4, 40.1], [26.2, 39.4],
    [26.9, 38.4], [27.3, 37.5], [28.0, 36.8], [29.5, 36.3], [30.7, 36.9], [32.5, 36.1], [34.0, 36.3], [35.9, 36.8], [36.2, 36.6], [35.8, 35.6], [35.5, 33.9], [35.0, 32.8],
    [34.3, 31.4], [32.3, 31.2], [29.9, 31.2], [25.2, 31.6], [24.0, 32.1], [20.0, 32.1], [19.0, 30.3], [15.5, 31.4], [13.2, 32.9], [11.1, 33.2], [10.1, 33.9], [11.1, 35.2],
    [10.2, 36.8], [11.0, 37.1], [9.9, 37.3], [8.6, 36.9], [3.0, 36.8], [-0.6, 35.7], [-2.2, 35.1], [-4.5, 35.2], [-5.3, 35.9],
  ],
  // Atlantic
  [[-10.5, 47.5], [-2.2, 47.5], [-1.2, 46], [-1.2, 44.5], [-1.8, 43.4], [-4, 43.4], [-8, 43.7], [-9.3, 43], [-8.9, 42], [-8.7, 41], [-9.5, 38.7], [-8.8, 37.0], [-7.4, 37.2], [-6.3, 36.5], [-5.7, 36.0], [-5.9, 35.8], [-6.8, 34.0], [-8.5, 33.3], [-9.8, 31.0], [-10.5, 29.5]],
  // Black Sea
  [[28.0, 41.6], [27.7, 42.6], [28.0, 43.4], [28.7, 44.3], [29.7, 45.3], [30.6, 46.4], [31.8, 46.6], [33.0, 46.0], [32.6, 45.4], [33.6, 44.5], [35.1, 44.8], [36.5, 45.2], [37.4, 44.7], [38.5, 44.3], [39.8, 43.5], [41.0, 42.6], [41.6, 41.6], [40.2, 40.9], [38.4, 40.9], [36.3, 41.3], [35.1, 42.0], [33.3, 41.95], [31.4, 41.2], [29.1, 41.2]],
  // Sea of Marmara
  [[26.6, 40.4], [27.5, 40.95], [28.9, 41.0], [29.9, 40.75], [29.0, 40.4], [27.6, 40.3], [26.7, 40.15]],
  // Red Sea with the gulfs of Suez and Aqaba
  [
    [32.55, 29.95], [32.6, 29.6], [33.4, 28.3], [33.8, 27.4], [34.3, 26.2], [35.2, 24.6], [35.7, 23.6], [36.9, 22.0], [37.2, 21.0], [37.4, 19.6], [38.0, 18.4], [38.6, 17.6], [42, 17.6],
    [41.6, 18.0], [40.9, 19.4], [39.9, 20.6], [39.17, 21.54], [38.95, 22.5], [38.5, 23.6], [38.06, 24.09], [37.3, 25.0], [36.6, 26.0], [35.6, 27.4], [35.0, 28.2], [34.95, 29.5],
    [34.7, 29.3], [34.6, 28.6], [34.3, 27.8], [33.6, 28.5], [33.0, 29.3], [32.7, 29.9],
  ],
  // Persian Gulf (edge) and Caspian Sea (edge)
  [[48.6, 30.4], [48.0, 29.9], [47.9, 29.2], [48.6, 28.2], [49.5, 27.0], [49.5, 30.6]],
  [[49.0, 47.5], [47.2, 45.6], [47.6, 43.0], [48.6, 41.8], [49.2, 40.4], [49.0, 39.0], [48.9, 38.4], [49.4, 37.5], [50, 37.4], [50, 47.5]],
];
const ISLANDS: [number, number][][] = [
  [[12.4, 38.1], [13.4, 38.2], [15.6, 38.3], [15.1, 36.7], [14.0, 37.0], [12.5, 37.6]],
  [[8.4, 41.0], [9.6, 41.1], [9.8, 40.0], [9.5, 39.2], [8.6, 38.9], [8.4, 39.8]],
  [[9.4, 43.0], [9.5, 42.0], [9.2, 41.4], [8.6, 41.9], [8.6, 42.6]],
  [[23.5, 35.3], [24.5, 35.5], [26.3, 35.3], [26.1, 35.0], [24.8, 34.9]],
  [[32.3, 35.1], [33.0, 35.4], [34.6, 35.7], [34.0, 35.0], [33.0, 34.6], [32.4, 34.8]],
  [[2.4, 39.6], [3.1, 39.9], [3.4, 39.6], [2.9, 39.3]],
];
const RIVERS: [number, number][][] = [
  // Nile
  [[30.9, 31.45], [31.25, 30.05], [31.0, 29.0], [30.8, 28.0], [31.2, 27.2], [32.6, 25.7], [32.9, 24.1], [32.6, 22.0], [31.5, 21.0], [30.6, 19.6], [31.4, 18.2]],
  // Tigris
  [[42.5, 37.2], [43.1, 36.3], [43.6, 35.0], [44.4, 33.3], [46.0, 32.0], [47.5, 31.0], [48.2, 30.2]],
  // Euphrates
  [[38.0, 37.0], [38.3, 36.0], [40.1, 35.0], [41.0, 34.4], [43.3, 32.6], [45.0, 31.3], [47.4, 31.0]],
];

function RegionMap({ c, w, h }: { c: Ctx; w: number; h: number }) {
  const sea = c.dark ? '#1A2E5A' : '#BFE3F2';
  const land = c.dark ? '#4A5168' : '#EED9AE';
  const coast = c.dark ? '#5E6A86' : '#D8B983';
  const desert = c.dark ? '#555A6E' : '#E8C98E';
  const green = c.dark ? '#46625A' : '#C9DDA0';
  return (
    <>
      <Defs>
        <ClipPath id={c.id('mclip')}>
          <Rect x={0} y={0} width={w} height={h} rx={16} />
        </ClipPath>
      </Defs>
      <G clipPath={c.url('mclip')}>
        <Rect x={0} y={0} width={w} height={h} fill={land} />
        {/* Greener north, desert south */}
        <Path d={`M0 0H${w}V${h * 0.22}C${w * 0.75} ${h * 0.28} ${w * 0.45} ${h * 0.2} ${w * 0.2} ${h * 0.3}S0 ${h * 0.3} 0 ${h * 0.32}Z`} fill={green} opacity={0.75} />
        <Path d={`M0 ${h * 0.62}C${w * 0.2} ${h * 0.56} ${w * 0.5} ${h * 0.6} ${w * 0.62} ${h * 0.66}S${w * 0.9} ${h * 0.55} ${w} ${h * 0.6}V${h}H0Z`} fill={desert} opacity={0.6} />
        {[[60, 150], [120, 175], [200, 160], [330, 140], [250, 195]].map(([x, y], i) => (
          <Path key={`d${i}`} d={`M${x - 12} ${y}q6 -5 12 0t12 0`} stroke={c.dark ? '#666B80' : '#DDB878'} strokeWidth={1.4} fill="none" opacity={0.8} />
        ))}
        {SEAS.map((pts, i) => (
          <Path key={`c${i}`} d={smoothClosed(RP(pts), 0.35)} fill="none" stroke={coast} strokeWidth={3} />
        ))}
        {SEAS.map((pts, i) => (
          <Path key={`s${i}`} d={smoothClosed(RP(pts), 0.35)} fill={sea} />
        ))}
        {ISLANDS.map((pts, i) => (
          <Path key={`i${i}`} d={smoothClosed(RP(pts), 0.4)} fill={land} stroke={coast} strokeWidth={1} />
        ))}
        {RIVERS.map((pts, i) => (
          <Path key={`r${i}`} d={smoothOpen(RP(pts), 0.4)} fill="none" stroke={c.dark ? '#3A5C8E' : '#7EC1E2'} strokeWidth={1.6} strokeLinecap="round" />
        ))}
        {[[20, 120], [90, 90], [150, 120], [215, 95], [40, 30]].map(([x, y], i) => (
          <Path key={`w${i}`} d={`M${x - 7} ${y}q3.5 -3 7 0t7 0`} stroke={C.white} strokeWidth={1.1} fill="none" opacity={c.dark ? 0.35 : 0.7} strokeLinecap="round" />
        ))}
        {/* Mountains: Atlas, Alps/Dinarides, Taurus, Zagros, Hijaz */}
        {[[-4, 32.5], [0, 33.6], [10, 46.4], [17.5, 44.3], [20, 42.5], [33, 37.6], [38, 38.2], [46, 35.5], [40.4, 22.6], [41, 25]].map(([lon, lat], i) => {
          const p = projectRegion(lon, lat);
          return (
            <G key={`m${i}`} transform={`translate(${p.x} ${p.y})`}>
              <Path d="M-7 3 0-6 7 3Z" fill={c.dark ? '#6A6F84' : '#CFA978'} />
              <Path d="M0-6 7 3H2Z" fill={c.dark ? '#5A5F74' : '#B88F60'} />
            </G>
          );
        })}
        {/* Compass rose */}
        <G transform={`translate(${w - 24} ${h - 26})`}>
          <Circle r={12} fill={c.dark ? '#2A3260' : C.cream} opacity={0.85} />
          <Path d={starPath(0, 0, 10, 2.6, 4)} fill={C.goldDeep} />
          <Path d="M0-10 2.6 0 0 0Z" fill={C.berry} />
        </G>
      </G>
    </>
  );
}

/** Mosque bubbles of `history.map-mosques`: city (lon, lat) and the bubble centre in viewBox units. */
export const MOSQUE_BUBBLES = {
  haram: { lon: 39.83, lat: 21.42, bx: 262, by: 186 },
  nabawi: { lon: 39.61, lat: 24.47, bx: 336, by: 150 },
  aqsa: { lon: 35.23, lat: 31.78, bx: 236, by: 128 },
  umayyad: { lon: 36.31, lat: 33.51, bx: 330, by: 78 },
  cordoba: { lon: -4.78, lat: 37.88, bx: 52, by: 112 },
  suleymaniye: { lon: 28.98, lat: 41.01, bx: 286, by: 24 },
  'gazi-husrev-beg': { lon: 18.41, lat: 43.86, bx: 128, by: 50 },
} as const;
export type MosqueBubble = keyof typeof MOSQUE_BUBBLES;
export const BUBBLE_R = 21;

// ---------------------------------------------------------------------------------------------------------------
// Córdoba hall (BuildScene): every layer shares the 400 × 300 view; parts are horizontal strips.

const CW = 400;
const CH = 300;
/** Strips of the hall as fractions of the scene (slot boxes of the BuildScene parts). */
export const CORDOBA_STRIPS = {
  ceiling: { x: 0, y: 0, w: 1, h: 0.12 },
  lamps: { x: 0, y: 0.12, w: 1, h: 0.09 },
  'arches-high': { x: 0, y: 0.21, w: 1, h: 0.17 },
  'arches-low': { x: 0, y: 0.38, w: 1, h: 0.22 },
  columns: { x: 0, y: 0.6, w: 1, h: 0.26 },
  floor: { x: 0, y: 0.86, w: 1, h: 0.14 },
} as const;
const strip = (k: keyof typeof CORDOBA_STRIPS) => ({ y0: CORDOBA_STRIPS[k].y * CH, hh: CORDOBA_STRIPS[k].h * CH });
const BAYS = [0, 100, 200, 300, 400];

function CordobaColumns({ c }: { c: Ctx }) {
  const { hh } = strip('columns');
  return (
    <G>
      {BAYS.map((x, i) => (
        <G key={x}>
          <Rect x={x - 7} y={0} width={14} height={7} fill={dm(c, C.sandLight)} />
          <Path d={`M${x - 9} 7H${x + 9}L${x + 6} 12H${x - 6}Z`} fill={dm(c, C.goldPale)} />
          <Rect x={x - 5} y={12} width={10} height={hh - 22} fill={dm(c, i % 2 ? '#8E6E86' : '#6E8C8A')} />
          <Rect x={x + 1} y={12} width={4} height={hh - 22} fill={dm(c, i % 2 ? '#7A5C72' : '#5C7876')} />
          <Rect x={x - 8} y={hh - 10} width={16} height={10} rx={1.5} fill={dm(c, C.stoneLight)} />
        </G>
      ))}
    </G>
  );
}

function CordobaArchesLow({ c }: { c: Ctx }) {
  const { hh } = strip('arches-low');
  return (
    <G>
      {BAYS.slice(0, -1).map((x) => {
        const cx = x + 50;
        const spring = hh - 2;
        return (
          <G key={x}>
            <Voussoirs cx={cx} spring={spring} r={34} R={44} n={13} red={dm(c, '#B8432F')} white={dm(c, '#F3E6CF', 0.3)} />
          </G>
        );
      })}
      {BAYS.map((x) => (
        <Rect key={x} x={x - 9} y={hh - 6} width={18} height={6} fill={dm(c, C.sandLight)} />
      ))}
    </G>
  );
}

function CordobaArchesHigh({ c }: { c: Ctx }) {
  const { hh } = strip('arches-high');
  return (
    <G>
      {BAYS.map((x) => (
        <Rect key={`p${x}`} x={x - 9} y={hh * 0.55} width={18} height={hh * 0.45} fill={dm(c, C.sandLight)} />
      ))}
      {BAYS.slice(0, -1).map((x) => {
        const cx = x + 50;
        const R = 42;
        const r = 29;
        const base = hh * 0.62;
        const wedges: React.ReactNode[] = [];
        const n = 11;
        for (let i = 0; i < n; i++) {
          const s = Math.PI + (Math.PI * i) / n;
          const e = Math.PI + (Math.PI * (i + 1)) / n;
          const p = (a: number, rad: number) => `${r1(cx + rad * Math.cos(a))} ${r1(base + rad * 0.8 * Math.sin(a))}`;
          wedges.push(
            <Path key={i} d={`M${p(s, r)}L${p(s, R)}L${p(e, R)}L${p(e, r)}Z`} fill={i % 2 ? dm(c, '#F3E6CF', 0.3) : dm(c, '#B8432F')} />,
          );
        }
        return <G key={x}>{wedges}</G>;
      })}
    </G>
  );
}

function CordobaCeiling({ c }: { c: Ctx }) {
  const { hh } = strip('ceiling');
  return (
    <G>
      <Rect x={0} y={0} width={CW} height={hh} fill={dm(c, C.woodDark)} />
      {Array.from({ length: 20 }, (_, i) => (
        <Rect key={i} x={i * 20 + 3} y={2} width={14} height={hh - 10} rx={2} fill={dm(c, C.wood)} />
      ))}
      {Array.from({ length: 20 }, (_, i) => (
        <Path key={`s${i}`} d={star8Path(i * 20 + 10, hh / 2 - 3, 4)} fill={dm(c, C.goldDeep)} />
      ))}
      <Rect x={0} y={hh - 6} width={CW} height={6} fill={dm(c, C.woodLight)} />
    </G>
  );
}

function CordobaLamps({ c }: { c: Ctx }) {
  const { hh } = strip('lamps');
  return (
    <G>
      {[50, 150, 250, 350].map((x) => (
        <G key={x}>
          <Path d={`M${x} 0V${hh * 0.45}`} stroke={dm(c, C.goldDeep)} strokeWidth={1.2} />
          {c.dark ? <Circle cx={x} cy={hh * 0.68} r={12} fill={C.goldPale} opacity={0.35} /> : null}
          <Path d={`M${x - 9} ${hh * 0.45}H${x + 9}L${x + 5} ${hh * 0.9}H${x - 5}Z`} fill={C.gold} />
          <Path d={`M${x - 5} ${hh * 0.55}H${x + 5}L${x + 3} ${hh * 0.82}H${x - 3}Z`} fill={C.goldPale} />
        </G>
      ))}
    </G>
  );
}

function CordobaFloor({ c }: { c: Ctx }) {
  const { hh } = strip('floor');
  return (
    <G>
      <Rect x={0} y={0} width={CW} height={hh} fill={dm(c, '#C98E5A')} />
      {Array.from({ length: 9 }, (_, i) => (
        <Path key={i} d={`M${i * 50 - 10} ${hh}L${i * 50 + 10} 0`} stroke={dm(c, '#B57A48')} strokeWidth={2} />
      ))}
      <Path d={`M0 4H${CW}`} stroke={dm(c, '#E2B07A')} strokeWidth={2} />
      <Rect x={60} y={10} width={280} height={hh - 16} rx={3} fill={dm(c, C.berry)} />
      <Rect x={66} y={14} width={268} height={hh - 24} rx={2} fill="none" stroke={dm(c, C.goldLight)} strokeWidth={1.4} />
      {[110, 170, 230, 290].map((x) => (
        <Path key={x} d={star8Path(x, hh / 2 + 3, 5)} fill={dm(c, C.goldLight)} />
      ))}
    </G>
  );
}

function CordobaBackdrop({ c }: { c: Ctx }) {
  return (
    <>
      <Defs>
        <Lin id={c.id('cwall')} stops={c.dark ? [[0, '#2A2346'], [1, '#4A3550']] : [[0, '#E9CFA2'], [1, '#F6E5C4']]} />
      </Defs>
      <Rect x={0} y={0} width={CW} height={CH} fill={c.url('cwall')} />
      {/* Far rows of arches fading into the distance */}
      {[0, 1].map((row) =>
        Array.from({ length: 9 }, (_, i) => {
          const x = i * 50 + (row ? 25 : 0);
          const y = 150 + row * 14;
          return <Path key={`${row}-${i}`} d={horseshoePath(x, y, 18 - row * 3, y + 60)} fill={c.dark ? '#1C1838' : '#D9B583'} opacity={0.35 + row * 0.15} />;
        }),
      )}
      <Rect x={0} y={CH * 0.86} width={CW} height={CH * 0.14} fill={c.dark ? '#3A2C3E' : '#D9A877'} opacity={0.5} />
    </>
  );
}

const cordobaLayer = (k: keyof typeof CORDOBA_STRIPS, Comp: (p: { c: Ctx }) => React.ReactElement) => art(CW * CORDOBA_STRIPS[k].w, CH * CORDOBA_STRIPS[k].h, (c) => <Comp c={c} />);

function CordobaFull({ c }: { c: Ctx }) {
  const layer = (k: keyof typeof CORDOBA_STRIPS, node: React.ReactNode) => (
    <G key={k} transform={`translate(0 ${CORDOBA_STRIPS[k].y * CH})`}>
      {node}
    </G>
  );
  return (
    <>
      <CordobaBackdrop c={c} />
      {layer('floor', <CordobaFloor c={c} />)}
      {layer('columns', <CordobaColumns c={c} />)}
      {layer('arches-low', <CordobaArchesLow c={c} />)}
      {layer('arches-high', <CordobaArchesHigh c={c} />)}
      {layer('ceiling', <CordobaCeiling c={c} />)}
      {layer('lamps', <CordobaLamps c={c} />)}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Geometric pattern tile (rotation puzzle): a quarter of a large 8-pointed star in the top-left corner and a quarter
// rosette in the bottom-right corner, joined by a strap. Four tiles turned around a corner make the full star.

export function GirihTile({ c, size = 100 }: { c: Ctx; size?: number }) {
  const s = size / 100;
  const bg = c.dark ? '#1F2A5A' : C.teal;
  const strap = c.dark ? C.goldLight : C.gold;
  const fillA = c.dark ? '#2E3D7A' : C.tealMid;
  return (
    <G transform={`scale(${s})`}>
      <Defs>
        <ClipPath id={c.id('gt')}>
          <Rect x={0} y={0} width={100} height={100} />
        </ClipPath>
      </Defs>
      <G clipPath={c.url('gt')}>
        <Rect x={0} y={0} width={100} height={100} fill={bg} />
        <Path d={star8Path(0, 0, 62)} fill={strap} />
        <Path d={star8Path(0, 0, 52)} fill={fillA} />
        <Path d={star8Path(0, 0, 30, 22.5)} fill={strap} />
        <Path d={star8Path(0, 0, 22, 22.5)} fill={C.cream} />
        <Circle cx={0} cy={0} r={8} fill={C.berry} />
        <Path d={star8Path(100, 100, 30)} fill={strap} />
        <Path d={star8Path(100, 100, 22)} fill={c.dark ? '#B85A3A' : C.terracotta} />
        <Circle cx={100} cy={100} r={7} fill={C.cream} />
        <Path d="M57 57L72 72" stroke={strap} strokeWidth={5} strokeLinecap="round" />
        <Path d="M100 40L80 60M40 100L60 80" stroke={strap} strokeWidth={4} strokeLinecap="round" opacity={0.85} />
        <Path d={`M62 64L66 60L70 64L66 68Z`} fill={C.cream} opacity={0.9} />
      </G>
    </G>
  );
}

/** Rotation (quarter turns) of tile (row, col) in the solved lattice: stars meet at the centres of 2 × 2 blocks. */
export function girihRotation(row: number, col: number): 0 | 1 | 2 | 3 {
  const top = row % 2 === 1; // the star corner is at the tile's top edge
  const left = col % 2 === 1; // … at its left edge
  if (top && left) return 0;
  if (top && !left) return 1;
  if (!top && !left) return 2;
  return 3;
}

function PatternGrid({ c, n }: { c: Ctx; n: number }) {
  const s = 100 / n;
  const tiles: React.ReactNode[] = [];
  for (let r = 0; r < n; r++) {
    for (let col = 0; col < n; col++) {
      const rot = girihRotation(r, col) * 90;
      tiles.push(
        <G key={`${r}-${col}`} transform={`translate(${col * s} ${r * s}) rotate(${rot} ${s / 2} ${s / 2})`}>
          <GirihTile c={{ ...c, id: (k) => c.id(`${k}${r}${col}`), url: (k) => c.url(`${k}${r}${col}`) }} size={s} />
        </G>,
      );
    }
  }
  return <G>{tiles}</G>;
}

// ---------------------------------------------------------------------------------------------------------------
// Bosnian landmarks (vignettes 400 × 300)

const BW = 400;
const BH = 300;

function SarajevoHills({ c }: { c: Ctx }) {
  return (
    <>
      <Path d="M0 150C60 110 120 128 180 104S300 92 400 120V300H0Z" fill={dm(c, '#8FB880')} />
      <Path d="M0 176C80 150 160 166 240 146S350 150 400 160V300H0Z" fill={dm(c, '#6FA36A')} />
      {[30, 70, 110, 300, 340, 372].map((x, i) => (
        <G key={x}>
          <Rect x={x - 6} y={150 + (i % 3) * 6} width={12} height={9} fill={dm(c, C.cream)} />
          <Path d={`M${x - 8} ${150 + (i % 3) * 6}L${x} ${143 + (i % 3) * 6}L${x + 8} ${150 + (i % 3) * 6}Z`} fill={dm(c, C.terracotta)} />
        </G>
      ))}
    </>
  );
}

function GaziHusrevBegScene({ c }: { c: Ctx }) {
  const wall = dm(c, '#EFE6D6');
  const wallShade = dm(c, '#D8CCB8');
  const lead = dm(c, '#8794A3', 0.25);
  return (
    <Vignette c={c} w={BW} h={BH}>
      <SarajevoHills c={c} />
      {/* Clock tower (Sahat-kula) */}
      <G>
        <Rect x={318} y={92} width={26} height={140} fill={dm(c, '#D9CDB6')} />
        <Rect x={334} y={92} width={10} height={140} fill={dm(c, '#C4B79C')} />
        <Circle cx={331} cy={112} r={8} fill={C.cream} stroke={dm(c, C.stoneDark)} strokeWidth={1.4} />
        <Path d="M331 112V107M331 112H335" stroke={C.ink} strokeWidth={1.2} strokeLinecap="round" />
        <Path d="M314 92L331 68L348 92Z" fill={lead} />
        <Rect x={325} y={130} width={12} height={16} rx={6} fill={dm(c, C.stoneDark)} opacity={0.5} />
      </G>
      {/* Minaret */}
      <PencilMinaret x={262} base={232} h={196} w={13} body={wall} shadeColor={wallShade} cone={lead} />
      {/* Main hall and dome */}
      <Rect x={90} y={128} width={150} height={104} fill={wall} />
      <Rect x={186} y={128} width={54} height={104} fill={wallShade} />
      <Rect x={84} y={122} width={162} height={8} fill={dm(c, C.stoneLight)} />
      <Path d={`M110 122L120 108H210L220 122Z`} fill={lead} />
      <LeadDome cx={165} base={110} r={52} drum={8} color={lead} drumColor={wall} />
      {[108, 222].map((x) => (
        <Path key={x} d={roundDomePath(x, 122, 9)} fill={lead} />
      ))}
      {[112, 146, 184, 218].map((x) => (
        <Path key={x} d={archPath(x, 140, 12, 168)} fill={dm(c, '#5E7C9A')} />
      ))}
      {/* Portico with five small domes on columns */}
      <Rect x={74} y={176} width={182} height={8} fill={dm(c, C.stoneLight)} />
      {[92, 128, 164, 200, 236].map((x) => (
        <Path key={x} d={roundDomePath(x, 176, 16, 0.75)} fill={lead} />
      ))}
      <Rect x={74} y={184} width={182} height={48} fill={dm(c, '#E2D7C2')} />
      {[74, 110, 146, 182, 218, 252].map((x) => (
        <Rect key={x} x={x} y={184} width={4} height={48} fill={dm(c, C.marble)} />
      ))}
      {[92, 128, 164, 200, 236].map((x) => (
        <Path key={x} d={archPath(x, 188, 30, 232)} fill={dm(c, '#B9A88D')} opacity={0.65} />
      ))}
      <Path d={archPath(164, 196, 16, 232)} fill={dm(c, C.wood)} />
      {/* Šadrvan (fountain) */}
      <G>
        <Rect x={46} y={226} width={40} height={14} rx={2} fill={dm(c, C.stonePale)} />
        {[50, 64, 78].map((x) => (
          <Rect key={x} x={x} y={208} width={3} height={18} fill={dm(c, C.wood)} />
        ))}
        <Path d="M40 210L66 194L92 210Z" fill={lead} />
      </G>
      {/* Courtyard and trees */}
      <Rect x={0} y={232} width={BW} height={68} fill={dm(c, '#CFC3AE')} />
      {Array.from({ length: 14 }, (_, i) => (
        <Path key={i} d={`M${i * 30} 300L${i * 30 + 20} 232`} stroke={dm(c, '#BBAE96')} strokeWidth={1.2} />
      ))}
      <Path d="M0 236H400" stroke={dm(c, '#B7A98F')} strokeWidth={2} />
      {[22, 380].map((x) => (
        <G key={x}>
          <Rect x={x - 2} y={204} width={4} height={30} fill={dm(c, C.woodDark)} />
          <Circle cx={x} cy={196} r={16} fill={dm(c, c.green(C.leafDark))} />
          <Circle cx={x - 6} cy={190} r={8} fill={dm(c, c.green(C.leaf))} />
        </G>
      ))}
    </Vignette>
  );
}

function StariMostScene({ c }: { c: Ctx }) {
  const stone = dm(c, '#E3D6BD');
  const stoneShade = dm(c, '#C9B897');
  const roof = dm(c, '#8C8F96', 0.25);
  return (
    <Vignette c={c} w={BW} h={BH}>
      {/* Mountains */}
      <Path d="M0 120L50 70L100 108L160 52L230 112L300 60L360 100L400 80V300H0Z" fill={dm(c, '#A3A9B8')} />
      <Path d="M0 150L70 110L140 140L210 100L290 140L360 112L400 130V300H0Z" fill={dm(c, '#8EAD86')} />
      {/* River Neretva */}
      <Defs>
        <Lin id={c.id('river')} stops={c.dark ? [[0, '#1E5C6E'], [1, '#13404F']] : [[0, '#4FB3A6'], [1, '#2A8C86']]} />
      </Defs>
      <Path d="M0 244C80 236 150 250 200 246S330 236 400 244V300H0Z" fill={c.url('river')} />
      {[[60, 262], [170, 274], [290, 260], [350, 284]].map(([x, y], i) => (
        <Path key={i} d={`M${x - 14} ${y}q7 -4 14 0t14 0`} stroke={C.white} strokeWidth={1.6} fill="none" opacity={0.55} strokeLinecap="round" />
      ))}
      {/* Rocky banks and houses */}
      <Path d="M0 160H112L124 250H0Z" fill={dm(c, '#B9AC94')} />
      <Path d="M288 160H400V250H276Z" fill={dm(c, '#B9AC94')} />
      {[[20, 136], [56, 128], [330, 130], [368, 138]].map(([x, y], i) => (
        <G key={i}>
          <Rect x={x - 14} y={y} width={28} height={26} fill={dm(c, C.cream)} />
          <Path d={`M${x - 18} ${y}L${x} ${y - 14}L${x + 18} ${y}Z`} fill={roof} />
          <Rect x={x - 4} y={y + 8} width={8} height={10} fill={dm(c, C.wood)} />
        </G>
      ))}
      <PencilMinaret x={40} base={162} h={84} w={7} body={dm(c, C.marble)} shadeColor={dm(c, C.stonePale)} cone={roof} />
      {/* Towers Halebija (left) and Tara (right) */}
      <Rect x={84} y={128} width={34} height={58} fill={stone} />
      <Rect x={104} y={128} width={14} height={58} fill={stoneShade} />
      <Path d="M80 128L101 110L122 128Z" fill={roof} />
      <Path d={archPath(97, 150, 10, 166)} fill={dm(c, C.stoneDark)} opacity={0.6} />
      <Path d="M282 112h40v74h-40z" fill={stone} />
      <Path d="M308 112h14v74h-14z" fill={stoneShade} />
      <Path d="M278 112L302 92L326 112Z" fill={roof} />
      <Path d={archPath(296, 136, 10, 152)} fill={dm(c, C.stoneDark)} opacity={0.6} />
      {/* The single stone arch */}
      <Path d="M108 186C140 112 260 112 292 186V198C262 132 138 132 108 198Z" fill={stone} />
      <Path d="M112 178C150 108 250 108 288 178" stroke={stoneShade} strokeWidth={4} fill="none" />
      <Path d="M100 186C140 128 260 128 300 186L300 176C262 122 138 122 100 176Z" fill={stoneShade} opacity={0.6} />
      <Path d="M94 180C142 110 258 110 306 180" stroke={dm(c, C.stoneLight)} strokeWidth={3} fill="none" />
      <Path d="M108 198L104 250H124ZM292 198L296 250H276Z" fill={stoneShade} />
      {Array.from({ length: 12 }, (_, i) => {
        const t = (i + 0.5) / 12;
        const x = 108 + t * 184;
        const y = 186 - Math.sin(Math.PI * t) * 64;
        return <Path key={i} d={`M${r1(x)} ${r1(y + 4)}l0 8`} stroke={stoneShade} strokeWidth={1.2} />;
      })}
    </Vignette>
  );
}

function FerhadijaScene({ c }: { c: Ctx }) {
  const wall = dm(c, '#F1EADC');
  const shade = dm(c, '#D6CBB5');
  const lead = dm(c, '#8794A3', 0.25);
  return (
    <Vignette c={c} w={BW} h={BH}>
      <Path d="M0 160C80 130 160 150 240 126S350 130 400 140V300H0Z" fill={dm(c, '#9CC38A')} />
      <PencilMinaret x={292} base={236} h={204} w={12} body={wall} shadeColor={shade} cone={lead} />
      <Rect x={118} y={136} width={140} height={100} fill={wall} />
      <Rect x={210} y={136} width={48} height={100} fill={shade} />
      <LeadDome cx={188} base={136} r={58} drum={10} color={lead} drumColor={wall} />
      {[[138, 152], [178, 152], [218, 152]].map(([x, y]) => (
        <Path key={x} d={archPath(x, y, 14, y + 30)} fill={dm(c, '#5E7C9A')} />
      ))}
      <Rect x={104} y={184} width={168} height={8} fill={dm(c, C.stoneLight)} />
      {[132, 188, 244].map((x) => (
        <Path key={x} d={roundDomePath(x, 184, 22, 0.72)} fill={lead} />
      ))}
      <Rect x={104} y={192} width={168} height={44} fill={dm(c, '#E6DCC7')} />
      {[104, 160, 216, 268].map((x) => (
        <Rect key={x} x={x} y={192} width={4} height={44} fill={dm(c, C.marble)} />
      ))}
      <Path d={archPath(188, 200, 18, 236)} fill={dm(c, C.wood)} />
      <Rect x={0} y={236} width={BW} height={64} fill={dm(c, '#B9CF9A')} />
      <Path d="M150 300L176 236H200L226 300Z" fill={dm(c, '#DCCFB5')} />
      {[[40, 210, 26], [76, 220, 18], [344, 214, 22], [372, 226, 16]].map(([x, y, r], i) => (
        <G key={i}>
          <Rect x={x - 2} y={y} width={4} height={30} fill={dm(c, C.woodDark)} />
          <Circle cx={x} cy={y - r * 0.4} r={r} fill={dm(c, c.green(i % 2 ? C.leaf : C.leafDark))} />
        </G>
      ))}
    </Vignette>
  );
}

// ---------------------------------------------------------------------------------------------------------------

export const history = {
  // ---- Caliphs
  medallion: art(100, 100, (c) => (
    <>
      <Circle cx={50} cy={50} r={46} fill={C.goldDeep} />
      <Circle cx={50} cy={50} r={42} fill={c.dark ? C.nightSoft : C.teal} />
      <Path d={star8Path(50, 50, 34)} fill={C.gold} />
      <Path d={star8Path(50, 50, 26, 22.5)} fill={c.dark ? C.nightSoft : C.teal} />
      <Circle cx={50} cy={50} r={14} fill={C.cream} />
      <Path d={star8Path(50, 50, 8)} fill={C.goldDeep} />
    </>
  )),
  'four-medallions': art(220, 120, (c) => (
    <>
      <Path d="M10 70C50 40 80 100 110 70S170 40 210 70" stroke={C.goldDeep} strokeWidth={3} fill="none" strokeDasharray="1 6" strokeLinecap="round" />
      {[[34, 60, C.teal], [86, 74, C.indigo], [138, 64, C.tealMid], [190, 72, C.dusk]].map(([x, y, col], i) => (
        <G key={i}>
          <Ellipse cx={x as number} cy={(y as number) + 30} rx={18} ry={4} fill={C.ink} opacity={c.dark ? 0.3 : 0.12} />
          <Circle cx={x as number} cy={y as number} r={24} fill={C.goldDeep} />
          <Circle cx={x as number} cy={y as number} r={21} fill={col as string} />
          <Path d={star8Path(x as number, y as number, 16)} fill={C.gold} />
          <Circle cx={x as number} cy={y as number} r={7} fill={C.cream} />
        </G>
      ))}
    </>
  )),

  // ---- Mushaf
  'palm-stalks': art(100, 100, (c) => (
    <>
      <Ellipse cx={50} cy={92} rx={40} ry={5} fill={C.ink} opacity={c.dark ? 0.3 : 0.1} />
      {[[-14, 0], [0, -4], [14, 2]].map(([dx, dy], i) => (
        <G key={i} transform={`translate(${50 + dx} ${50 + dy}) rotate(${(i - 1) * 12})`}>
          <Path d="M-7 40L-5 -40Q0 -46 5 -40L7 40Z" fill={i === 1 ? '#C9A25E' : '#B88E4E'} />
          <Path d="M0 -40V40" stroke={C.woodLight} strokeWidth={1.2} />
          {[-28, -18, -8, 2, 12, 22].map((y) => (
            <Path key={y} d={`M-3.5 ${y}h7`} stroke={C.ink} strokeWidth={1.1} opacity={0.65} strokeLinecap="round" />
          ))}
        </G>
      ))}
    </>
  )),
  'white-stones': art(100, 90, (c) => (
    <>
      <Ellipse cx={50} cy={82} rx={42} ry={5} fill={C.ink} opacity={c.dark ? 0.3 : 0.1} />
      {[[30, 60, 24, 14, -8], [68, 64, 22, 13, 10], [50, 38, 26, 15, 4]].map(([x, y, rx, ry, rot], i) => (
        <G key={i} transform={`rotate(${rot} ${x} ${y})`}>
          <Ellipse cx={x} cy={y + 3} rx={rx} ry={ry} fill={C.stoneLight} />
          <Ellipse cx={x} cy={y} rx={rx} ry={ry} fill={C.marble} />
          {[-5, 0, 5].map((d) => (
            <Path key={d} d={`M${x - rx * 0.55} ${y + d}h${rx * 1.1}`} stroke={C.ink} strokeWidth={1} opacity={0.55} strokeLinecap="round" strokeDasharray="5 2" />
          ))}
        </G>
      ))}
    </>
  )),
  suhuf: art(110, 90, (c) => (
    <>
      <Ellipse cx={55} cy={82} rx={46} ry={5} fill={C.ink} opacity={c.dark ? 0.3 : 0.1} />
      {[8, 4, 0].map((o, i) => (
        <Rect key={i} x={14 + o} y={14 + o} width={78} height={58} rx={3} fill={i === 2 ? C.cream : C.sandLight} stroke={C.sandDeep} strokeWidth={1} />
      ))}
      {[24, 32, 40, 48, 56].map((y) => (
        <Path key={y} d={`M24 ${y}H82`} stroke={C.ink} strokeWidth={1.2} opacity={0.5} strokeDasharray="7 2 3 2" />
      ))}
      <Path d={star8Path(53, 64, 4)} fill={C.goldDeep} />
      <Path d="M10 40H100" stroke={C.berry} strokeWidth={3} />
      <Path d="M54 36l-6 10M56 36l6 10" stroke={C.berry} strokeWidth={2.4} strokeLinecap="round" />
    </>
  )),
  chest: art(110, 90, (c) => (
    <>
      <Ellipse cx={55} cy={84} rx={46} ry={5} fill={C.ink} opacity={c.dark ? 0.3 : 0.12} />
      <Rect x={12} y={38} width={86} height={44} rx={4} fill={C.wood} />
      <Path d="M12 38Q12 14 55 14T98 38Z" fill={C.woodLight} />
      <Path d="M12 38H98" stroke={C.woodDark} strokeWidth={3} />
      {[30, 80].map((x) => (
        <Path key={x} d={`M${x} 16V82`} stroke={C.goldDeep} strokeWidth={4} />
      ))}
      <Rect x={47} y={34} width={16} height={18} rx={3} fill={C.gold} />
      <Circle cx={55} cy={42} r={2.4} fill={C.woodDark} />
      <Path d="M55 43v5" stroke={C.woodDark} strokeWidth={2} />
    </>
  )),
  mushaf: art(110, 100, (c) => (
    <>
      <Ellipse cx={55} cy={92} rx={44} ry={5} fill={C.ink} opacity={c.dark ? 0.3 : 0.12} />
      <Path d="M10 30L55 22V88L10 92Z" fill={C.cream} />
      <Path d="M100 30L55 22V88L100 92Z" fill={C.ivory} />
      <Path d="M8 28L55 18L102 28V92L55 86L8 92Z" fill="none" stroke={C.domeGreen} strokeWidth={4} strokeLinejoin="round" />
      {[38, 48, 58, 68, 78].map((y) => (
        <G key={y}>
          <Path d={`M18 ${y - 2}L48 ${y - 7}`} stroke={C.ink} strokeWidth={1.3} opacity={0.5} strokeDasharray="6 2 2 2" />
          <Path d={`M62 ${y - 7}L92 ${y - 2}`} stroke={C.ink} strokeWidth={1.3} opacity={0.5} strokeDasharray="6 2 2 2" />
        </G>
      ))}
      <Path d={star8Path(33, 30, 5)} fill={C.gold} />
      <Path d={star8Path(77, 30, 5)} fill={C.gold} />
    </>
  )),
  'scribe-room': art(400, 300, (c) => (
    <>
      <Defs>
        <Lin id={c.id('room')} stops={c.dark ? [[0, '#2B2450'], [1, '#433563']] : [[0, '#F2DDB4'], [1, '#E7C892']]} />
      </Defs>
      <Rect x={0} y={0} width={400} height={300} fill={c.url('room')} />
      <Path d={archPath(200, 26, 120, 150)} fill={c.dark ? '#151942' : '#9ED3EC'} />
      <Path d={archPath(200, 26, 120, 150)} fill="none" stroke={c.dark ? '#5A4A70' : C.sandDark} strokeWidth={8} />
      {c.dark ? (
        <Path d={crescentPath(222, 70, 12, 6, -4, 10)} fill={C.goldLight} />
      ) : (
        <>
          <Palm c={c} x={168} y={150} h={70} lean={-4} />
          <Palm c={c} x={236} y={150} h={58} lean={5} />
        </>
      )}
      <Path d={archPath(200, 26, 120, 150)} fill="none" stroke={c.dark ? '#5A4A70' : C.sandDark} strokeWidth={8} />
      <Path d="M140 92H260M200 26V150" stroke={c.dark ? '#5A4A70' : C.sandDark} strokeWidth={4} />
      <Rect x={0} y={200} width={400} height={100} fill={c.dark ? '#3A2C44' : '#D9A877'} />
      <Rect x={60} y={232} width={280} height={60} rx={6} fill={c.dark ? '#5C2A3C' : C.berry} />
      <Rect x={68} y={238} width={264} height={48} rx={4} fill="none" stroke={C.goldLight} strokeWidth={2} />
      {/* Low desk */}
      <Rect x={110} y={196} width={180} height={12} rx={3} fill={C.woodLight} />
      <Rect x={118} y={208} width={10} height={26} fill={C.wood} />
      <Rect x={272} y={208} width={10} height={26} fill={C.wood} />
      <Path d={star8Path(30, 40, 10)} fill={C.goldDeep} opacity={0.4} />
      <Path d={star8Path(370, 40, 10)} fill={C.goldDeep} opacity={0.4} />
    </>
  )),
  'sheets-path': art(400, 300, (c) => {
    const sand = c.dark ? '#4B4468' : '#EBD3A2';
    const housePts: [number, number][] = [[48, 236], [128, 150], [222, 210], [290, 112], [352, 54]];
    return (
      <>
        <Rect x={0} y={0} width={400} height={300} rx={18} fill={sand} />
        <Path d="M0 0H400V40C300 60 200 30 100 50S0 40 0 40Z" fill={c.dark ? '#3A3460' : '#F3E2BC'} />
        <Path d={smoothOpen(housePts, 0.5)} stroke={c.dark ? '#6A5E86' : '#D9B67E'} strokeWidth={22} fill="none" strokeLinecap="round" />
        {housePts.slice(0, 4).map(([x, y], i) => (
          <G key={i}>
            <Rect x={x + 18} y={y - 30} width={34} height={26} fill={c.dark ? '#7A6A8A' : C.mud} />
            <Rect x={x + 18} y={y - 33} width={34} height={5} fill={c.dark ? '#8A7A9A' : C.clay} />
            <Rect x={x + 30} y={y - 18} width={9} height={14} rx={4} fill={C.woodDark} />
          </G>
        ))}
        {/* Provinces: arrows leaving the map */}
        {[[372, 26, 30], [384, 74, -10]].map(([x, y, rot], i) => (
          <Path key={i} d="M-12 0H8M2 -6 8 0 2 6" stroke={C.goldDeep} strokeWidth={3} fill="none" strokeLinecap="round" transform={`translate(${x} ${y}) rotate(${rot})`} />
        ))}
        {[[24, 120], [190, 280], [330, 230], [92, 40], [250, 40]].map(([x, y], i) => (
          <Palm key={i} c={c} x={x} y={y} h={46} lean={(i % 2 ? 1 : -1) * 5} />
        ))}
      </>
    );
  }),

  // ---- Hijri calendar
  'moon-month': art(100, 100, (c) => (
    <>
      <Circle cx={50} cy={50} r={44} fill={c.dark ? '#2A3070' : C.night} />
      <Path d={crescentPath(52, 50, 26, 12, -8, 22)} fill={C.goldLight} />
      {[[24, 30], [74, 72], [70, 26]].map(([x, y], i) => (
        <Path key={i} d={starPath(x, y, 4, 1.6, 4)} fill={C.white} opacity={0.85} />
      ))}
    </>
  )),
  'hijri-moons': art(220, 130, (c) => (
    <>
      <Defs>
        <Lin id={c.id('hsky')} stops={[[0, '#14173A'], [1, '#4B3F8F']]} />
      </Defs>
      <Rect x={0} y={0} width={220} height={130} rx={18} fill={c.url('hsky')} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = Math.PI * (0.06 + (0.88 * i) / 11);
        const x = 110 - Math.cos(a) * 92;
        const y = 104 - Math.sin(a) * 80;
        const phase = i / 11;
        return (
          <G key={i}>
            <Circle cx={x} cy={y} r={8} fill="#2E3470" />
            {phase > 0.5 && phase < 0.6 ? <Circle cx={x} cy={y} r={8} fill={C.goldLight} /> : <Path d={crescentPath(x, y, 8, 8 - Math.abs(phase - 0.55) * 14 - 1, 0, 8)} fill={C.goldLight} />}
          </G>
        );
      })}
      <Path d="M70 130V104H150V130Z" fill="#232861" />
      <Path d={domePath(110, 104, 22, 1.4)} fill="#232861" />
      <Rect x={160} y={70} width={8} height={60} fill="#232861" />
      <Path d="M158 70L164 58L170 70Z" fill="#232861" />
    </>
  )),

  // ---- House of Wisdom
  'house-of-wisdom': art(220, 140, (c) => (
    <>
      <Ellipse cx={110} cy={130} rx={104} ry={8} fill={C.ink} opacity={c.dark ? 0.3 : 0.1} />
      <Rect x={20} y={56} width={180} height={72} fill={C.sandLight} />
      <Rect x={150} y={56} width={50} height={72} fill={C.sand} />
      <Rect x={14} y={50} width={192} height={8} rx={2} fill={C.sandDeep} />
      <Path d={domePath(110, 52, 30, 1.25)} fill={C.teal} />
      <Path d="M92 44C92 30 98 24 104 20 101 28 100 36 100 44Z" fill={C.tealLight} opacity={0.6} />
      {[40, 75, 145, 180].map((x) => (
        <G key={x}>
          <Path d={archPath(x, 68, 26, 118)} fill={C.woodDark} />
          {[80, 92, 104].map((y, j) => (
            <G key={y}>
              <Rect x={x - 11} y={y} width={22} height={2} fill={C.woodLight} />
              {[0, 1, 2, 3].map((b) => (
                <Rect key={b} x={x - 10 + b * 5} y={y - 9} width={4} height={9} fill={[C.berry, C.gold, C.teal, C.coral][(b + j) % 4]} />
              ))}
            </G>
          ))}
        </G>
      ))}
      <Path d={archPath(110, 72, 26, 128)} fill={C.wood} />
      <Path d={star8Path(110, 88, 6)} fill={C.gold} />
    </>
  )),
  shelf: art(120, 110, (c) => (
    <>
      <Rect x={10} y={6} width={100} height={100} rx={6} fill={c.dark ? '#5A3A26' : C.wood} />
      <Rect x={16} y={12} width={88} height={88} rx={3} fill={c.dark ? '#3A2618' : C.woodDark} />
      {[38, 66, 94].map((y, j) => (
        <G key={y}>
          {Array.from({ length: 9 }, (_, b) => (
            <Rect key={b} x={19 + b * 9.4} y={y - 22 + ((b + j) % 3) * 2} width={8} height={22 - ((b + j) % 3) * 2} rx={1} fill={[C.berry, C.gold, C.teal, C.coral, C.indigo, C.leaf][(b * 2 + j) % 6]} />
          ))}
          <Rect x={16} y={y} width={88} height={5} fill={c.dark ? '#7A5232' : C.woodLight} />
        </G>
      ))}
    </>
  )),
  numerals: art(100, 100, (c) => (
    <>
      <Ellipse cx={50} cy={92} rx={38} ry={5} fill={C.ink} opacity={c.dark ? 0.3 : 0.1} />
      <Rect x={12} y={14} width={76} height={74} rx={8} fill={C.clay} />
      <Rect x={16} y={18} width={68} height={66} rx={6} fill="#D8A57A" />
      <G stroke={C.woodDark} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Path d="M28 30V54" />
        <Path d="M42 30Q44 38 52 34M42 30V54" />
        <Path d="M62 30Q63 37 67 33Q69 38 74 32M62 30V54" />
        <Path d="M28 70H40M34 64V76" />
        <Path d="M52 66 62 76M62 66 52 76" />
        <Path d="M68 70H78" />
      </G>
    </>
  )),
  dividers: art(100, 100, (c) => (
    <>
      <Path d="M18 86A60 60 0 0 1 86 70" stroke={c.dark ? C.goldLight : C.goldDeep} strokeWidth={2} fill="none" strokeDasharray="4 3" />
      <Circle cx={50} cy={16} r={7} fill={C.gold} />
      <Path d="M50 16L22 84" stroke={C.stoneDark} strokeWidth={6} strokeLinecap="round" />
      <Path d="M50 16L78 84" stroke={C.greyDark} strokeWidth={6} strokeLinecap="round" />
      <Path d="M30 56Q50 50 70 56" stroke={C.gold} strokeWidth={2.4} fill="none" />
      <Circle cx={50} cy={16} r={3} fill={C.goldPale} />
    </>
  )),
  herbs: art(100, 100, (c) => (
    <>
      <Ellipse cx={50} cy={92} rx={30} ry={4} fill={C.ink} opacity={c.dark ? 0.3 : 0.1} />
      {[-30, -15, 0, 15, 30].map((a, i) => (
        <G key={a} transform={`rotate(${a} 50 82)`}>
          <Path d="M50 82V18" stroke={c.green(C.oliveDark)} strokeWidth={2} />
          {[28, 40, 52, 64].map((y, j) => (
            <G key={y}>
              <Path d={leafPath(50, y, 12, 4, -150 + (i % 2) * 8)} fill={c.green(j % 2 ? C.leaf : C.olive)} />
              <Path d={leafPath(50, y + 5, 12, 4, -30)} fill={c.green(j % 2 ? C.olive : C.leafLight)} />
            </G>
          ))}
          {i % 2 === 0 ? <Circle cx={50} cy={16} r={3.4} fill={C.lilac} /> : null}
        </G>
      ))}
      <Rect x={42} y={66} width={16} height={8} rx={2} fill={C.berry} />
    </>
  )),
  mortar: art(100, 100, (c) => (
    <>
      <Ellipse cx={50} cy={90} rx={34} ry={5} fill={C.ink} opacity={c.dark ? 0.3 : 0.1} />
      <Path d="M62 14L74 10L56 58L48 56Z" fill={C.woodLight} />
      <Path d="M18 50H82Q80 80 60 86H40Q20 80 18 50Z" fill={C.stoneLight} />
      <Path d="M60 50H82Q80 80 60 86Z" fill={C.stone} opacity={0.6} />
      <Ellipse cx={50} cy={50} rx={32} ry={7} fill={C.stonePale} />
      <Ellipse cx={50} cy={50} rx={26} ry={4.5} fill={c.green(C.olive)} />
      <Rect x={36} y={86} width={28} height={5} rx={2} fill={C.stone} />
    </>
  )),
  'medicine-jar': art(90, 100, (c) => (
    <>
      <Ellipse cx={45} cy={94} rx={28} ry={4} fill={C.ink} opacity={c.dark ? 0.3 : 0.1} />
      <Rect x={28} y={10} width={34} height={10} rx={3} fill={C.wood} />
      <Path d="M30 20H60Q70 28 66 38Q74 58 66 78Q64 90 45 90Q26 90 24 78Q16 58 24 38Q20 28 30 20Z" fill={C.cream} />
      <Path d="M24 44Q45 50 66 44V72Q45 78 24 72Z" fill="#2F6FB0" />
      <Path d={star8Path(45, 58, 9)} fill={C.cream} />
      <Path d="M58 26Q66 34 62 42" stroke={C.white} strokeWidth={3} fill="none" opacity={0.6} strokeLinecap="round" />
    </>
  )),
  astrolabe: art(100, 100, (c) => (
    <>
      <Circle cx={50} cy={12} r={7} fill="none" stroke={C.goldDeep} strokeWidth={3} />
      <Path d="M44 20H56L54 26H46Z" fill={C.goldDeep} />
      <Circle cx={50} cy={58} r={36} fill={C.goldDeep} />
      <Circle cx={50} cy={58} r={31} fill={c.dark ? '#2E3470' : '#22406E'} />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return <Path key={i} d={`M${r1(50 + Math.cos(a) * 31)} ${r1(58 + Math.sin(a) * 31)}L${r1(50 + Math.cos(a) * 35)} ${r1(58 + Math.sin(a) * 35)}`} stroke={C.goldPale} strokeWidth={1.2} />;
      })}
      <Circle cx={50} cy={58} r={20} fill="none" stroke={C.goldLight} strokeWidth={1.4} />
      <Circle cx={56} cy={52} r={13} fill="none" stroke={C.goldLight} strokeWidth={1.4} />
      <Path d="M24 58H76M50 32V84" stroke={C.goldPale} strokeWidth={1} opacity={0.6} />
      {[[38, 42], [66, 46], [44, 74], [70, 70], [32, 64]].map(([x, y], i) => (
        <Path key={i} d={`M50 58L${x} ${y}`} stroke={C.gold} strokeWidth={2} strokeLinecap="round" />
      ))}
      <Path d="M22 62L78 52" stroke={C.goldLight} strokeWidth={3} strokeLinecap="round" />
      <Circle cx={50} cy={58} r={3.5} fill={C.goldLight} />
    </>
  )),
  'star-chart': art(100, 100, (c) => (
    <>
      <Circle cx={50} cy={50} r={44} fill={C.cream} />
      <Circle cx={50} cy={50} r={40} fill={c.dark ? '#232861' : '#2E3380'} />
      <Circle cx={50} cy={50} r={28} fill="none" stroke={C.goldLight} strokeWidth={0.8} opacity={0.6} />
      <Path d="M10 50H90M50 10V90" stroke={C.goldLight} strokeWidth={0.8} opacity={0.4} />
      <Path d="M24 36L36 30L46 38L58 28L70 34M30 66L42 60L52 70L66 64" stroke={C.goldPale} strokeWidth={1.4} fill="none" />
      {[[24, 36], [36, 30], [46, 38], [58, 28], [70, 34], [30, 66], [42, 60], [52, 70], [66, 64], [74, 54], [20, 52]].map(([x, y], i) => (
        <Path key={i} d={starPath(x, y, i % 3 === 0 ? 4 : 3, 1.3, 4)} fill={C.goldLight} />
      ))}
    </>
  )),
  lens: art(100, 100, (c) => (
    <>
      {[30, 50, 70].map((y) => (
        <Path key={y} d={`M4 ${y}H42L80 50`} stroke={C.gold} strokeWidth={2.4} fill="none" opacity={0.9} />
      ))}
      <Path d="M80 50L96 40M80 50L96 60" stroke={C.gold} strokeWidth={2} opacity={0.6} />
      <Ellipse cx={44} cy={50} rx={10} ry={32} fill={c.dark ? '#7FC8E8' : '#BFE6F5'} opacity={0.9} />
      <Ellipse cx={44} cy={50} rx={10} ry={32} fill="none" stroke={C.woodLight} strokeWidth={3} />
      <Path d="M40 30Q38 40 40 52" stroke={C.white} strokeWidth={2.4} fill="none" opacity={0.8} strokeLinecap="round" />
      <Circle cx={80} cy={50} r={4} fill={C.goldPale} />
    </>
  )),
  'book-red': bookPiece('#B8432F', '#8E2E20'),
  'book-green': bookPiece('#2E8B57', '#1F6A40'),
  'book-blue': bookPiece('#2F5FA0', '#20457A'),
  'book-gold': bookPiece('#C98A1E', '#A06A10'),
  'book-teal': bookPiece('#0F7A6E', '#0A5A51'),
  'book-plum': bookPiece('#7A3D6A', '#5A2A4E'),

  // ---- Golden Age
  qarawiyyin: art(140, 110, (c) => (
    <>
      <Ellipse cx={70} cy={102} rx={64} ry={5} fill={C.ink} opacity={c.dark ? 0.3 : 0.1} />
      <Rect x={96} y={20} width={22} height={82} fill={C.marble} />
      <Rect x={108} y={20} width={10} height={82} fill={C.stonePale} />
      <Rect x={94} y={14} width={26} height={8} fill={C.domeGreen} />
      <Rect x={101} y={4} width={12} height={10} fill={C.marble} />
      <Path d="M99 4L107 -2L115 4Z" fill={C.domeGreen} />
      {[34, 46, 58, 70].map((y) => (
        <Path key={y} d={archPath(107, y, 6, y + 8)} fill={C.domeGreen} opacity={0.8} />
      ))}
      <Rect x={10} y={56} width={90} height={46} fill={C.cream} />
      {[[10, 40], [40, 40], [70, 30]].map(([x, w], i) => (
        <G key={i}>
          <Path d={`M${x} 56L${x + w / 2} 38L${x + w} 56Z`} fill={C.domeGreen} />
          {Array.from({ length: 5 }, (_, k) => (
            <Path key={k} d={`M${x + 4 + k * (w / 5)} 56L${x + w / 2} 40`} stroke="#1E7A48" strokeWidth={1} />
          ))}
        </G>
      ))}
      {[26, 52, 78].map((x) => (
        <Path key={x} d={archPath(x, 66, 14, 102)} fill={C.wood} />
      ))}
    </>
  )),
  'surgical-tools': art(100, 100, (c) => (
    <>
      <Rect x={10} y={30} width={80} height={52} rx={6} fill={c.dark ? '#E6E0D4' : C.marble} />
      <Path d="M10 40H90" stroke={C.tealPale} strokeWidth={3} />
      <Path d="M20 70L60 50L66 52L24 74Z" fill={C.greyDark} />
      <Path d="M60 50L76 44L66 52Z" fill={C.greyLight} />
      <Path d="M22 56H72Q80 56 80 62" stroke={C.grey} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d="M30 78L70 64M30 78L72 70" stroke={C.greyDark} strokeWidth={2.4} strokeLinecap="round" />
      <Circle cx={28} cy={78} r={3} fill={C.gold} />
    </>
  )),

  // ---- Maps
  'map-region': art(HISTORY_MAP.w, HISTORY_MAP.h, (c) => <RegionMap c={c} w={HISTORY_MAP.w} h={HISTORY_MAP.h} />),
  'map-mosques': art(HISTORY_MAP.w, HISTORY_MAP.h, (c) => (
    <>
      <RegionMap c={c} w={HISTORY_MAP.w} h={HISTORY_MAP.h} />
      {Object.values(MOSQUE_BUBBLES).map((b, i) => {
        const p = projectRegion(b.lon, b.lat);
        return (
          <G key={i}>
            <Path d={`M${p.x} ${p.y}L${b.bx} ${b.by}`} stroke={c.dark ? C.goldLight : C.goldDeep} strokeWidth={1.4} strokeDasharray="3 2" />
            <Circle cx={b.bx} cy={b.by} r={BUBBLE_R} fill={c.dark ? '#232861' : C.cream} stroke={c.dark ? C.goldLight : C.goldDeep} strokeWidth={1.6} />
            <Circle cx={p.x} cy={p.y} r={3.4} fill={C.berry} stroke={C.white} strokeWidth={1.2} />
          </G>
        );
      })}
    </>
  )),
  'journey-cover': art(200, 130, (c) => (
    <>
      <Path d="M14 18Q100 4 186 18V116Q100 102 14 116Z" fill={c.dark ? '#E9D9B4' : C.sandLight} />
      <Path d="M14 18Q100 4 186 18V116Q100 102 14 116Z" fill="none" stroke={C.sandDark} strokeWidth={2} />
      <Path d="M40 50Q60 30 90 46T140 40" stroke={C.waterLight} strokeWidth={10} fill="none" opacity={0.8} />
      <Path d="M30 80Q70 60 100 76T170 70" stroke={C.goldDeep} strokeWidth={3} fill="none" strokeDasharray="2 6" strokeLinecap="round" />
      {[[30, 80], [100, 76], [170, 70]].map(([x, y], i) => (
        <G key={i}>
          <Circle cx={x} cy={y} r={6} fill={i === 2 ? C.berry : C.gold} stroke={C.white} strokeWidth={1.6} />
        </G>
      ))}
      <G transform="translate(160 96)">
        <Circle r={12} fill={C.cream} stroke={C.goldDeep} strokeWidth={1.4} />
        <Path d={starPath(0, 0, 10, 2.6, 4)} fill={C.goldDeep} />
      </G>
    </>
  )),

  // ---- Great mosques (icons)
  umayyad: art(200, 130, (c) => (
    <>
      <Ellipse cx={100} cy={122} rx={96} ry={6} fill={C.ink} opacity={c.dark ? 0.3 : 0.1} />
      <PencilMinaret x={26} base={116} h={86} w={9} body={C.marble} shadeColor={C.stonePale} cone={C.domeGreen} />
      <Rect x={160} y={40} width={22} height={76} fill={C.stonePale} />
      <Rect x={172} y={40} width={10} height={76} fill={C.stoneLight} />
      <Rect x={156} y={34} width={30} height={8} fill={C.stoneLight} />
      <Rect x={164} y={18} width={14} height={16} fill={C.stonePale} />
      <Path d="M162 18L171 8L180 18Z" fill={C.domeGreen} />
      <Rect x={36} y={66} width={128} height={50} fill={C.sandLight} />
      <Path d="M36 66L46 54H154L164 66Z" fill="#7E8A97" />
      <Rect x={84} y={50} width={32} height={66} fill={C.sand} />
      <Path d="M80 52L100 38L120 52Z" fill={C.sandDeep} />
      <Path d={roundDomePath(100, 40, 14, 1.1)} fill="#7E8A97" />
      <Rect x={99} y={20} width={2} height={7} fill={C.goldDeep} />
      {[48, 64, 132, 148].map((x) => (
        <Path key={x} d={archPath(x, 78, 10, 116)} fill={C.wood} opacity={0.8} />
      ))}
      <Path d={archPath(100, 64, 18, 116)} fill={C.domeGreen} />
      <Path d={archPath(100, 72, 10, 116)} fill={C.goldLight} opacity={0.7} />
    </>
  )),
  suleymaniye: art(200, 130, (c) => {
    const lead = '#8794A3';
    return (
      <>
        <Ellipse cx={100} cy={122} rx={96} ry={6} fill={C.ink} opacity={c.dark ? 0.3 : 0.1} />
        {[[14, 108], [40, 90], [160, 90], [186, 108]].map(([x, h]) => (
          <PencilMinaret key={x} x={x} base={116} h={h} w={6} body={C.marble} shadeColor={C.stonePale} cone={lead} />
        ))}
        <Rect x={48} y={80} width={104} height={36} fill={C.marble} />
        <Rect x={120} y={80} width={32} height={36} fill={C.stonePale} />
        {[64, 82, 118, 136].map((x) => (
          <Path key={x} d={roundDomePath(x, 80, 10, 0.9)} fill={lead} />
        ))}
        <Path d={roundDomePath(100, 72, 26, 0.75)} fill={lead} />
        <Rect x={70} y={70} width={60} height={10} fill={C.marble} />
        <LeadDome cx={100} base={66} r={30} drum={6} color={lead} drumColor={C.marble} />
        {[58, 74, 126, 142].map((x) => (
          <Path key={x} d={archPath(x, 92, 8, 112)} fill="#5E7C9A" opacity={0.8} />
        ))}
        <Path d={archPath(100, 88, 14, 116)} fill={C.wood} />
      </>
    );
  }),
  'cordoba-mosque': art(160, 130, (c) => (
    <>
      <Defs>
        <Lin id={c.id('cbg')} stops={c.dark ? [[0, '#2A2346'], [1, '#4A3550']] : [[0, '#F2DDB4'], [1, '#F8EBD2']]} />
      </Defs>
      <Rect x={4} y={6} width={152} height={118} rx={14} fill={c.url('cbg')} />
      {[40, 120].map((x) => (
        <G key={x}>
          <Voussoirs cx={x} spring={58} r={24} R={34} n={11} />
          <Rect x={x - 30} y={58} width={60} height={6} fill={C.sandLight} />
          <Path d={roundDomePath(x, 34, 22, 0.95)} fill="none" />
        </G>
      ))}
      <Voussoirs cx={80} spring={36} r={18} R={26} n={9} />
      {[10, 80, 150].map((x) => (
        <G key={x}>
          <Rect x={x - 5} y={58} width={10} height={58} fill={x === 80 ? '#6E8C8A' : '#8E6E86'} />
          <Rect x={x - 7} y={110} width={14} height={8} fill={C.stoneLight} />
        </G>
      ))}
      <Rect x={4} y={116} width={152} height={8} rx={4} fill="#C98E5A" />
    </>
  )),

  // ---- Bosnia
  'gazi-husrev-beg': art(BW, BH, (c) => <GaziHusrevBegScene c={c} />),
  'stari-most': art(BW, BH, (c) => <StariMostScene c={c} />),
  ferhadija: art(BW, BH, (c) => <FerhadijaScene c={c} />),

  // ---- Córdoba hall (BuildScene)
  'cordoba-hall': art(CW, CH, (c) => <CordobaBackdrop c={c} />),
  'cordoba-floor': cordobaLayer('floor', CordobaFloor),
  'cordoba-columns': cordobaLayer('columns', CordobaColumns),
  'cordoba-arches-low': cordobaLayer('arches-low', CordobaArchesLow),
  'cordoba-arches-high': cordobaLayer('arches-high', CordobaArchesHigh),
  'cordoba-ceiling': cordobaLayer('ceiling', CordobaCeiling),
  'cordoba-lamps': cordobaLayer('lamps', CordobaLamps),
  'cordoba-arches': art(CW, CH, (c) => <CordobaFull c={c} />),

  // ---- Patterns
  'girih-tile': art(100, 100, (c) => <GirihTile c={c} />),
  'pattern-cover': art(100, 100, (c) => (
    <>
      <Defs>
        <ClipPath id={c.id('pc')}>
          <Rect x={0} y={0} width={100} height={100} rx={14} />
        </ClipPath>
      </Defs>
      <G clipPath={c.url('pc')}>
        <PatternGrid c={c} n={4} />
      </G>
    </>
  )),
} satisfies Record<string, ArtDef>;
