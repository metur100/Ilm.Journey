import { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { art, Cloud, crescentPath, domePath, Dunes, Glow, House, LeafyTree, Lin, Mountain, Palm, smoothClosed, smoothOpen, sparklePath, star8Path, type ArtDef, type Ctx } from '../kit';
import { C, mix } from '../palette';

// ---------------------------------------------------------------------------------------------------------------
// Skies (400 × 300). Time-of-day pieces: their colours follow the time, not the app theme. The sun travels from the
// left (east) to the right (west) along an arc; SKY_SUN gives its centre in viewBox units for the Prayer Sky game.

export const SKY_W = 400;
export const SKY_H = 300;
/** Horizon line of the sky pieces (top of the land strip). */
export const SKY_HORIZON = 250;

export type SkyTime = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'sunset' | 'night';

/** Sun (or, for night, moon) centre per sky piece, in viewBox units (400 × 300). Dawn: the sun is still below. */
export const SKY_SUN: Record<SkyTime, { x: number; y: number; visible: boolean }> = {
  dawn: { x: 40, y: 262, visible: false },
  morning: { x: 78, y: 182, visible: true },
  noon: { x: 210, y: 62, visible: true },
  afternoon: { x: 304, y: 132, visible: true },
  sunset: { x: 352, y: 244, visible: true },
  night: { x: 300, y: 70, visible: true },
};

const SKY_COLORS: Record<SkyTime, { stops: [number, string][]; land: [string, string]; glow?: string }> = {
  dawn: { stops: [[0, '#1B1F4B'], [0.55, '#4B4A8F'], [0.85, '#C77F8E'], [1, '#F2A07B']], land: ['#3A3566', '#2A2750'], glow: '#F7B98A' },
  morning: { stops: [[0, '#6FB3E0'], [0.7, '#BFE3F0'], [1, '#FCE3B8']], land: ['#8DBE7A', '#6FA866'], glow: '#FFE2A8' },
  noon: { stops: [[0, '#4FA6DC'], [1, '#CDEBF7']], land: ['#8FC27A', '#6FA866'] },
  afternoon: { stops: [[0, '#5FA9D9'], [0.75, '#CFE6EE'], [1, '#F6E2B4']], land: ['#9CBF73', '#7DA862'], glow: '#FFE6A8' },
  sunset: { stops: [[0, '#4B2C6B'], [0.55, '#B7577A'], [0.85, '#F28C5B'], [1, '#FBC07A']], land: ['#5C3A5E', '#43294A'], glow: '#FFC07A' },
  night: { stops: [[0, '#0B0D24'], [0.7, '#1E2358'], [1, '#2C3274']], land: ['#1A1E47', '#121535'] },
};

const STARS: [number, number, number][] = [
  [24, 30, 1.6], [62, 70, 1.1], [104, 22, 1.4], [150, 54, 1], [186, 18, 1.7], [232, 64, 1.1], [262, 26, 1.3], [338, 30, 1.5],
  [372, 92, 1.2], [44, 120, 1], [208, 110, 1.2], [128, 100, 0.9], [350, 150, 1], [16, 180, 1.1], [384, 14, 1], [90, 160, 1],
  [250, 150, 0.9], [170, 170, 1],
];

function Stars({ opacity = 0.9, count = STARS.length }: { opacity?: number; count?: number }) {
  return (
    <G>
      {STARS.slice(0, count).map(([x, y, r], i) => (
        <Circle key={i} cx={x} cy={y} r={r} fill={C.white} opacity={opacity * (i % 3 === 0 ? 1 : 0.7)} />
      ))}
      <Path d={sparklePath(300, 120, 5)} fill={C.goldPale} opacity={opacity} />
      <Path d={sparklePath(70, 44, 4)} fill={C.goldPale} opacity={opacity} />
    </G>
  );
}

function SkyBase({ c, time }: { c: Ctx; time: SkyTime }) {
  const s = SKY_COLORS[time];
  const sun = SKY_SUN[time];
  return (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={s.stops} />
      </Defs>
      <Rect x={0} y={0} width={SKY_W} height={SKY_H} fill={c.url('sky')} />
      {(time === 'dawn' || time === 'night') && <Stars opacity={time === 'dawn' ? 0.55 : 0.95} count={time === 'dawn' ? 10 : STARS.length} />}
      {s.glow && <Glow c={c} k="hglow" cx={sun.x} cy={time === 'dawn' ? 250 : sun.y} r={time === 'noon' ? 70 : 130} color={s.glow} opacity={0.75} />}
      {time === 'dawn' && <Path d={crescentPath(320, 60, 14, 7, -5, 12)} fill={C.goldPale} opacity={0.9} />}
      {time === 'night' && (
        <>
          <Glow c={c} k="moon" cx={sun.x} cy={sun.y} r={60} color={C.goldPale} opacity={0.35} />
          <Path d={crescentPath(sun.x - 4, sun.y + 2, 26, 13, -10, 22)} fill={C.goldLight} />
        </>
      )}
      {sun.visible && time !== 'night' && (
        <>
          <Glow c={c} k="sun" cx={sun.x} cy={sun.y} r={64} color={time === 'noon' ? '#FFF6D6' : C.goldPale} opacity={0.85} />
          <Circle cx={sun.x} cy={sun.y} r={26} fill={time === 'sunset' ? '#FFB45E' : time === 'noon' ? '#FFE07A' : C.goldLight} />
          <Circle cx={sun.x - 8} cy={sun.y - 8} r={8} fill={C.white} opacity={0.35} />
        </>
      )}
      {(time === 'morning' || time === 'noon' || time === 'afternoon') && (
        <>
          <Cloud x={time === 'noon' ? 90 : 220} y={70} r={20} opacity={0.9} />
          <Cloud x={time === 'afternoon' ? 120 : 330} y={110} r={14} opacity={0.8} />
        </>
      )}
      <Path d={`M0 ${SKY_HORIZON}C60 238 120 242 190 250S320 236 400 246V300H0Z`} fill={s.land[0]} />
      <Path d={`M0 270C80 258 160 264 240 272S350 260 400 266V300H0Z`} fill={s.land[1]} />
    </>
  );
}

const skyPiece = (time: SkyTime) => art(SKY_W, SKY_H, (c) => <SkyBase c={c} time={time} />);

export const sky = {
  dawn: skyPiece('dawn'),
  morning: skyPiece('morning'),
  noon: skyPiece('noon'),
  afternoon: skyPiece('afternoon'),
  sunset: skyPiece('sunset'),
  night: skyPiece('night'),
} satisfies Record<string, ArtDef>;

// ---------------------------------------------------------------------------------------------------------------
// Scenes

const dim = (c: Ctx, color: string, k = 0.35) => (c.dark ? mix(color, '#1B1F4B', k) : color);

function SceneSky({ c, w, h, light: [t, b], dark = ['#14173A', '#3A3480'], sun = { x: 0.78, y: 0.24 } }: { c: Ctx; w: number; h: number; light: [string, string]; dark?: [string, string]; sun?: { x: number; y: number } }) {
  return (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={c.dark ? [[0, dark[0]], [1, dark[1]]] : [[0, t], [1, b]]} />
      </Defs>
      <Rect x={0} y={0} width={w} height={h} fill={c.url('sky')} />
      {c.dark ? (
        <>
          <Stars opacity={0.8} count={12} />
          <Glow c={c} k="m" cx={w * sun.x} cy={h * sun.y} r={40} color={C.goldPale} opacity={0.3} />
          <Path d={crescentPath(w * sun.x, h * sun.y, 18, 9, -7, 15)} fill={C.goldLight} />
        </>
      ) : (
        <>
          <Glow c={c} k="s" cx={w * sun.x} cy={h * sun.y} r={56} color={C.goldPale} opacity={0.9} />
          <Circle cx={w * sun.x} cy={h * sun.y} r={20} fill={C.goldLight} />
        </>
      )}
    </>
  );
}

function CaravanCamel({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <Path d="M0 0C5-14 22-16 30-6 34-14 42-14 46-6L52-18 58-16 54 2 50 18H46L44 6H14L10 18H6L4 6C0 4 0 2 0 0Z" />
    </G>
  );
}

// Garden layers share one 400 × 300 frame so they stack exactly over a sky piece.
function GardenFar({ c }: { c: Ctx }) {
  return (
    <G>
      <Path d="M0 176C40 160 80 150 130 158S220 140 270 150 360 160 400 150V240H0Z" fill={dim(c, '#A9CFB0', 0.45)} />
      <G fill={dim(c, '#93BFA0', 0.45)}>
        <Rect x={250} y={136} width={30} height={24} />
        <Path d={domePath(265, 137, 11, 1.4)} />
        <Rect x={286} y={118} width={5} height={40} />
        <Path d="M285 118 288.5 108 292 118Z" />
        <Rect x={232} y={146} width={16} height={14} />
      </G>
      <Path d="M0 196C50 178 110 174 170 186S290 172 340 180 390 186 400 182V250H0Z" fill={dim(c, '#8DC08A', 0.42)} />
    </G>
  );
}

function GardenMid({ c }: { c: Ctx }) {
  return (
    <G>
      <Path d="M0 224C60 204 120 200 190 214S310 200 400 214V270H0Z" fill={c.green(dim(c, '#76B36E'))} />
      <LeafyTree c={c} x={40} y={222} s={0.5} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
      <LeafyTree c={c} x={330} y={216} s={0.42} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
      <Palm c={c} x={370} y={220} h={52} lean={4} dark={c.dark} />
      <Palm c={c} x={84} y={216} h={40} lean={-3} dark={c.dark} />
      <Ellipse cx={200} cy={222} rx={46} ry={6} fill={c.green(dim(c, '#68A863'))} />
    </G>
  );
}

function GardenLawn({ c }: { c: Ctx }) {
  const tuft = (x: number, y: number, s: number, i: number) => (
    <Path key={i} d={`M${x - 6 * s} ${y}C${x - 5 * s} ${y - 8 * s} ${x - 3 * s} ${y - 12 * s} ${x - 4 * s} ${y - 16 * s}C${x - 1 * s} ${y - 10 * s} ${x} ${y - 8 * s} ${x} ${y - 6 * s}C${x + 1 * s} ${y - 10 * s} ${x + 3 * s} ${y - 14 * s} ${x + 6 * s} ${y - 15 * s}C${x + 4 * s} ${y - 10 * s} ${x + 5 * s} ${y - 6 * s} ${x + 6 * s} ${y}Z`} fill={c.green(dim(c, C.leafDark))} opacity={0.75} />
  );
  return (
    <G>
      <Path d="M0 246C80 232 160 230 240 238S360 234 400 240V300H0Z" fill={c.green(dim(c, '#8CC77A'))} />
      <Path d="M0 266C90 256 190 258 280 264S370 262 400 262V300H0Z" fill={c.green(dim(c, '#7DBB6C'))} />
      <Path d="M168 300C176 280 190 262 204 246H222C214 262 210 280 214 300Z" fill={dim(c, '#E6D2A8')} opacity={0.9} />
      {[[30, 262, 1], [70, 290, 1.2], [120, 270, 0.9], [300, 280, 1.1], [352, 258, 1], [384, 290, 1.2], [250, 292, 0.9]].map(([x, y, s], i) => tuft(x, y, s, i))}
      {[[46, 276, C.pink], [98, 286, C.white], [330, 288, C.lemon], [366, 272, C.pink], [276, 272, C.white]].map(([x, y, col], i) => (
        <G key={`f${i}`}>
          <Circle cx={x as number} cy={y as number} r={3.6} fill={dim(c, col as string, 0.2)} />
          <Circle cx={x as number} cy={y as number} r={1.4} fill={C.gold} />
        </G>
      ))}
    </G>
  );
}

// World map – simplified continents in an equirectangular-ish projection (no borders, no labels).
const MAP_W = 400;
const MAP_H = 200;
const LAT_TOP = 78;
const LAT_BOTTOM = -56;
/** Project longitude/latitude onto `scene.map-world-simple` (viewBox 400 × 200). */
export function projectWorld(lon: number, lat: number): { x: number; y: number } {
  return { x: ((lon + 180) / 360) * MAP_W, y: ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * MAP_H };
}
const P = (pts: [number, number][]) => pts.map(([lon, lat]) => {
  const p = projectWorld(lon, lat);
  return [p.x, p.y] as [number, number];
});

const LAND: [number, number][][] = [
  // North America
  [[-165, 68], [-140, 70], [-115, 73], [-95, 72], [-80, 68], [-65, 60], [-56, 52], [-66, 45], [-70, 42], [-76, 35], [-80, 27], [-82, 26], [-84, 30], [-90, 29.5], [-97, 26], [-97, 21], [-91, 18.5], [-87, 21], [-83, 15], [-78, 8.5], [-82, 8], [-86, 11], [-92, 14.5], [-105, 20], [-110, 24], [-113, 31], [-117, 32], [-124, 40], [-124, 48], [-133, 56], [-150, 60], [-165, 60], [-163, 55]],
  // Greenland
  [[-52, 61], [-42, 60], [-22, 70], [-20, 80], [-60, 82], [-72, 77], [-56, 70]],
  // South America
  [[-78, 8.5], [-60, 10.5], [-50, 1], [-35, -6], [-39, -16], [-48, -26], [-58, -38], [-65, -42], [-68, -53], [-73, -50], [-74, -40], [-71, -30], [-70, -18], [-77, -12], [-81, -5], [-80, 1]],
  // Africa
  [[-17, 21], [-17, 14], [-12, 8], [-7, 4.5], [1, 5.5], [9, 4], [9.5, -1], [13, -12], [12, -18], [15, -28], [18.5, -34.5], [26, -34], [32, -28], [35.5, -23], [40, -15], [40, -10], [43, -2], [51, 11.5], [44, 11], [43, 12.5], [38.5, 18], [34, 27], [32.5, 30.5], [25, 32], [20, 31], [10, 34], [10, 37], [0, 36], [-6, 35.8], [-10, 30], [-14, 26]],
  // Eurasia
  [[-9, 37], [-9, 43.5], [-2, 43.5], [-4.5, 48.5], [2, 51], [8, 54], [10, 57.5], [6, 59], [5, 62], [12, 66], [20, 70], [30, 70.5], [40, 67.5], [60, 69.5], [70, 73], [80, 72.5], [100, 77], [115, 74], [130, 72], [140, 72.5], [160, 70], [180, 68], [178, 64], [170, 60], [160, 58], [156, 51], [143, 55], [140, 48], [133, 43], [128, 38.5], [126, 35], [122, 31], [120, 24], [110, 20], [108, 15], [109, 11], [105, 8.5], [100, 13.5], [99, 8], [103.5, 1.5], [100, 4], [98, 8], [95, 16], [92, 22], [88, 22], [86, 20], [80, 15], [77.5, 8], [73, 17], [70, 22], [66.5, 25], [62, 25.2], [57, 25.8], [54, 26.8], [50, 30], [48, 29.5], [50.5, 26], [51.5, 24.2], [56, 24.5], [59.5, 22.5], [56.5, 18], [52, 16], [45, 13], [43.3, 13], [39.5, 20], [35, 28], [33, 30], [34.5, 32], [35.5, 34.5], [36, 36.5], [30, 36.3], [27, 37], [26, 40.5], [23, 40.5], [23.5, 38], [21.5, 37], [20, 39.5], [19.5, 42], [13.5, 45.5], [12.5, 44], [16, 41], [18.4, 40], [15.6, 38], [12, 42], [9, 44.3], [3.5, 43.3], [0, 39], [-2, 36.8], [-6, 36.2]],
  // Britain / Ireland
  [[-5.5, 50], [1.5, 51.2], [1.7, 53], [-2, 57], [-4, 58.7], [-6, 57], [-5, 54.5], [-3, 53.5], [-4.8, 52]],
  [[-10, 52], [-6, 52.2], [-6, 55], [-9, 54.3]],
  // Madagascar, Japan, Sri Lanka
  [[44, -25], [47, -25], [50.5, -15], [49, -12], [44, -17]],
  [[130, 31], [135, 34], [141, 38], [142, 44], [140, 42], [136, 36]],
  // Indonesia (Sumatra, Java, Borneo, Sulawesi, New Guinea)
  [[95, 5.5], [98, 4], [104, -2], [106, -6], [102, -4.5]],
  [[105.5, -6], [114, -7], [114.5, -8.6], [106, -7.6]],
  [[109, 2], [114, 4.5], [118.5, 7], [119, 1], [116, -4], [110, -3]],
  [[119.5, 1], [125, 1.5], [121, -1], [122.5, -5], [120, -5]],
  [[131, -1], [141, -3], [150, -10], [141, -9], [135, -4]],
  // Australia, New Zealand
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -10.5], [146, -19], [153, -26], [150, -37], [141, -38.5], [135, -35], [129, -32], [115.5, -34.5], [113.5, -26]],
  [[172.5, -34.5], [178, -38], [175, -41.5], [171, -44], [167, -46], [170.5, -41]],
  // Arabian peninsula detail is part of Eurasia; Iceland
  [[-24, 64], [-14, 64.5], [-15, 66.3], [-22, 66.4]],
];

export const MAKKAH = { lon: 39.826, lat: 21.4225 };

// Hijaz map (300 × 400): north up, Red Sea on the left.
const HIJAZ = { lon0: 37, lon1: 41.5, lat0: 25.5, lat1: 20.5, w: 300, h: 400 };
/** Project longitude/latitude onto `scene.map-hijaz` (viewBox 300 × 400). */
export function projectHijaz(lon: number, lat: number): { x: number; y: number } {
  return { x: ((lon - HIJAZ.lon0) / (HIJAZ.lon1 - HIJAZ.lon0)) * HIJAZ.w, y: ((HIJAZ.lat0 - lat) / (HIJAZ.lat0 - HIJAZ.lat1)) * HIJAZ.h };
}
/** Key places on `scene.map-hijaz` in viewBox units. */
export const HIJAZ_POINTS = {
  makkah: projectHijaz(39.826, 21.4225),
  thawr: projectHijaz(39.85, 21.377),
  madinah: projectHijaz(39.611, 24.468),
  quba: projectHijaz(39.617, 24.439),
  jeddah: projectHijaz(39.17, 21.54),
  taif: projectHijaz(40.415, 21.27),
  badr: projectHijaz(38.775, 23.73),
  yanbu: projectHijaz(38.06, 24.09),
  hira: projectHijaz(39.858, 21.457),
};
const H = (pts: [number, number][]) => pts.map(([lon, lat]) => {
  const p = projectHijaz(lon, lat);
  return [p.x, p.y] as [number, number];
});
const COAST: [number, number][] = [[36.4, 26], [37.3, 25.0], [37.9, 24.3], [38.06, 24.09], [38.5, 23.7], [38.8, 23.3], [39.0, 22.6], [39.1, 22.2], [39.17, 21.5], [39.4, 21.0], [39.8, 20.4], [40.2, 19.9]];

export const scene = {
  desert: art(400, 240, (c) => (
    <>
      <SceneSky c={c} w={400} h={240} light={['#8FCDEB', '#FCE6C0']} />
      <Path d="M0 150C60 136 120 140 180 148S320 132 400 142V240H0Z" fill={dim(c, '#D9B07A')} />
      <Dunes w={400} h={240} y={160} colors={[dim(c, C.sandLight), dim(c, C.sand), dim(c, C.sandDeep)]} />
      <CaravanCamel x={250} y={162} s={0.42} color={dim(c, C.woodDark, 0.2)} />
      <CaravanCamel x={280} y={160} s={0.42} color={dim(c, C.woodDark, 0.2)} />
      <CaravanCamel x={310} y={164} s={0.42} color={dim(c, C.woodDark, 0.2)} />
      <Palm c={c} x={60} y={210} h={74} lean={-6} dark={c.dark} />
      <Palm c={c} x={86} y={214} h={54} lean={5} dark={c.dark} />
    </>
  )),

  mountains: art(400, 240, (c) => (
    <>
      <SceneSky c={c} w={400} h={240} light={['#7FC0E4', '#E3F4F8']} sun={{ x: 0.2, y: 0.22 }} />
      <Mountain x={90} y={190} w={240} h={130} color={dim(c, '#9AAFC6')} shadeColor={dim(c, '#8399B2')} snow={dim(c, C.white, 0.5)} />
      <Mountain x={300} y={190} w={260} h={150} color={dim(c, '#9AAFC6')} shadeColor={dim(c, '#8399B2')} snow={dim(c, C.white, 0.5)} />
      <Mountain x={200} y={200} w={220} h={100} color={dim(c, '#7E95AE')} shadeColor={dim(c, '#6A8099')} />
      <Path d="M0 190C60 176 120 182 200 192S330 178 400 186V240H0Z" fill={c.green(dim(c, '#7FB574'))} />
      <Path d="M0 214C80 204 170 208 260 216S360 208 400 210V240H0Z" fill={c.green(dim(c, '#6AA663'))} />
      <LeafyTree c={c} x={330} y={214} s={0.42} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
      <LeafyTree c={c} x={60} y={222} s={0.36} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
    </>
  )),

  'sea-coast': art(400, 240, (c) => (
    <>
      <SceneSky c={c} w={400} h={240} light={['#7CC6E6', '#E8F6FA']} />
      {!c.dark && <Cloud x={110} y={60} r={20} />}
      <Rect x={0} y={130} width={400} height={110} fill={dim(c, C.waterDeep)} />
      <Rect x={0} y={130} width={400} height={10} fill={dim(c, C.water)} />
      {[150, 168, 186].map((y, i) => (
        <Path key={y} d={`M${-10 + i * 12} ${y}${Array.from({ length: 18 }, () => 'q6 -5 12 0t12 0').join('')}`} stroke={C.white} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.4} />
      ))}
      <Path d="M150 240C190 210 260 196 400 190V240Z" fill={dim(c, C.sandLight)} />
      <Path d="M150 240C190 214 260 200 400 194" stroke={C.white} strokeWidth={4} fill="none" opacity={0.7} />
      <Path d="M220 240C250 222 310 214 400 212V240Z" fill={dim(c, C.sand)} />
      <Palm c={c} x={330} y={214} h={92} lean={-14} dark={c.dark} />
      <Palm c={c} x={370} y={212} h={66} lean={6} dark={c.dark} />
      <G transform="translate(80 128)">
        <Path d="M-16 0H16L12 6H-12Z" fill={dim(c, C.woodLight)} />
        <Path d="M0 0V-28" stroke={dim(c, C.woodDark)} strokeWidth={1.6} />
        <Path d="M1-28C10-20 14-10 14-3H1Z" fill={dim(c, C.cream)} />
      </G>
    </>
  )),

  'garden-backdrop': art(400, 300, (c) => (
    <>
      <SceneSky c={c} w={400} h={300} light={['#8FD0EA', '#E6F5F9']} sun={{ x: 0.8, y: 0.18 }} />
      {!c.dark && (
        <>
          <Cloud x={90} y={70} r={22} />
          <Cloud x={230} y={46} r={14} opacity={0.85} />
        </>
      )}
      <GardenFar c={c} />
      <GardenMid c={c} />
      <GardenLawn c={c} />
    </>
  )),

  'garden-far': art(400, 300, (c) => <GardenFar c={c} />),
  'garden-mid': art(400, 300, (c) => <GardenMid c={c} />),
  'garden-lawn': art(400, 300, (c) => <GardenLawn c={c} />),

  'map-world-simple': art(MAP_W, MAP_H, (c) => {
    const m = projectWorld(MAKKAH.lon, MAKKAH.lat);
    const sea = c.dark ? '#1A2E5A' : '#CFE9F4';
    const land = c.dark ? '#3E5A6E' : '#E9D3A6';
    const coast = c.dark ? '#4E6E82' : '#D9BE8A';
    return (
      <>
        <Defs>
          <ClipPath id={c.id('clip')}>
            <Rect x={0} y={0} width={MAP_W} height={MAP_H} rx={18} />
          </ClipPath>
        </Defs>
        <G clipPath={c.url('clip')}>
          <Rect x={0} y={0} width={MAP_W} height={MAP_H} fill={sea} />
          <G stroke={c.dark ? '#24396A' : '#BCDDEB'} strokeWidth={1}>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Path key={`v${i}`} d={`M${i * 50} 0V${MAP_H}`} />
            ))}
            {[1, 2, 3].map((i) => (
              <Path key={`h${i}`} d={`M0 ${i * 50}H${MAP_W}`} />
            ))}
          </G>
          {LAND.map((pts, i) => (
            <Path key={`c${i}`} d={smoothClosed(P(pts), 0.4)} fill={coast} transform="translate(0.8 1.2)" />
          ))}
          {LAND.map((pts, i) => (
            <Path key={`l${i}`} d={smoothClosed(P(pts), 0.4)} fill={land} />
          ))}
          <Circle cx={m.x} cy={m.y} r={7} fill={C.gold} opacity={0.3} />
          <Path d={star8Path(m.x, m.y, 4.4)} fill={C.gold} />
        </G>
      </>
    );
  }),

  'map-hijaz': art(HIJAZ.w, HIJAZ.h, (c) => {
    const sea = c.dark ? '#1A2E5A' : '#BFE3F2';
    const land = c.dark ? '#5B4C5E' : '#EBCF9C';
    const coastPts = H(COAST);
    const seaPath = `${smoothOpen(coastPts, 0.5)}L${coastPts[coastPts.length - 1][0]} ${HIJAZ.h + 20}L-20 ${HIJAZ.h + 20}L-20 -20Z`;
    const mountains: [number, number, number][] = [
      [96, 40, 1], [120, 62, 0.8], [140, 120, 1], [160, 150, 0.9], [176, 196, 1.1], [196, 230, 0.9], [204, 270, 1], [230, 300, 1.1], [250, 350, 1],
      [70, 36, 0.7], [206, 120, 0.8], [240, 190, 0.9], [262, 250, 0.8], [220, 380, 0.9], [150, 280, 0.7],
    ];
    const harrat: [number, number, number, number][] = [[214, 60, 30, 18], [240, 110, 24, 14], [130, 40, 18, 10]];
    const mk = HIJAZ_POINTS.makkah;
    const md = HIJAZ_POINTS.madinah;
    return (
      <>
        <Defs>
          <ClipPath id={c.id('clip')}>
            <Rect x={0} y={0} width={HIJAZ.w} height={HIJAZ.h} rx={22} />
          </ClipPath>
        </Defs>
        <G clipPath={c.url('clip')}>
          <Rect x={0} y={0} width={HIJAZ.w} height={HIJAZ.h} fill={land} />
          {harrat.map(([x, y, rx, ry], i) => (
            <Ellipse key={`h${i}`} cx={x} cy={y} rx={rx} ry={ry} fill={c.dark ? '#463A4C' : '#B89A78'} opacity={0.55} />
          ))}
          <Path d="M40 210C80 200 120 214 150 236S200 250 230 236" stroke={c.dark ? '#6A5A6C' : '#DDBC86'} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Path d="M120 100C150 110 170 130 210 128" stroke={c.dark ? '#6A5A6C' : '#DDBC86'} strokeWidth={3} fill="none" strokeLinecap="round" />
          {mountains.map(([x, y, s], i) => (
            <G key={`m${i}`} transform={`translate(${x} ${y}) scale(${s})`}>
              <Path d="M-14 6 0-12 14 6Z" fill={c.dark ? '#7A6878' : '#C9A479'} />
              <Path d="M0-12 14 6H4Z" fill={c.dark ? '#6A5868' : '#B38E64'} />
            </G>
          ))}
          <Path d={seaPath} fill={sea} />
          <Path d={smoothOpen(coastPts, 0.5)} stroke={c.dark ? '#2C4478' : '#9ED2E8'} strokeWidth={6} fill="none" opacity={0.8} />
          {[[40, 180], [70, 300], [30, 360], [90, 250]].map(([x, y], i) => (
            <Path key={`w${i}`} d={`M${x - 10} ${y}q5 -4 10 0t10 0`} stroke={C.white} strokeWidth={1.6} fill="none" opacity={0.6} strokeLinecap="round" />
          ))}
          <Circle cx={md.x} cy={md.y} r={14} fill={c.green(c.dark ? '#3E6A4E' : '#9CCB86')} />
          {[[-6, -4], [5, -6], [0, 5], [8, 4], [-8, 6]].map(([dx, dy], i) => (
            <Circle key={`p${i}`} cx={md.x + dx} cy={md.y + dy} r={3} fill={c.green(c.dark ? '#5A9A66' : C.leaf)} />
          ))}
          <Circle cx={mk.x} cy={mk.y} r={12} fill={c.dark ? '#7A6A6E' : '#F6E7C8'} />
          <Rect x={mk.x - 3} y={mk.y - 3} width={6} height={6} fill={C.black} />
          <Rect x={mk.x - 3} y={mk.y - 1.6} width={6} height={1.2} fill={C.gold} />
        </G>
      </>
    );
  }),

  city: art(400, 240, (c) => {
    const win = c.dark ? C.goldLight : C.woodLight;
    const h = (x: number, w: number, ht: number, col: string, dome?: string) => (
      <House key={x} x={x} y={200} w={w} h={ht} color={dim(c, col)} shadeColor={dim(c, C.sandDeep)} window={win} dome={dome && dim(c, dome)} />
    );
    return (
      <>
        <SceneSky c={c} w={400} h={240} light={['#8FCDEB', '#FCE6C0']} />
        <Path d="M0 170C60 150 120 156 200 162S330 148 400 158V240H0Z" fill={dim(c, '#D9B07A')} />
        <G fill={dim(c, '#C9A27A', 0.5)} opacity={0.7}>
          <Rect x={150} y={128} width={40} height={40} />
          <Path d={domePath(170, 129, 16, 1.4)} />
          <Rect x={196} y={104} width={7} height={64} />
          <Path d="M195 104 199.5 92 204 104Z" />
        </G>
        {h(10, 44, 50, C.sandLight)}
        {h(56, 36, 70, C.cream, C.tealMid)}
        {h(94, 50, 40, C.sand)}
        {h(146, 40, 56, C.sandLight)}
        {h(188, 56, 44, C.cream, C.gold)}
        {h(246, 38, 64, C.sand)}
        {h(286, 50, 46, C.sandLight)}
        {h(338, 52, 58, C.cream, C.tealMid)}
        <Rect x={0} y={200} width={400} height={40} fill={dim(c, C.sandDeep)} />
        <Path d="M0 200H400" stroke={dim(c, C.sandDark)} strokeWidth={3} />
        <Palm c={c} x={30} y={226} h={60} lean={-5} dark={c.dark} />
        <Palm c={c} x={376} y={228} h={54} lean={5} dark={c.dark} />
      </>
    );
  }),
} satisfies Record<string, ArtDef>;
