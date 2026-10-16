import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { archPath, art, crescentPath, dropPath, Glow, Lin, Rad, Shadow, sparklePath, star8Path, type ArtDef, type Ctx } from '../../kit';
import { C, mix, shade } from '../../palette';

/*
 * Salah section art of the "basics" games (salah author, docs/GAMES-V3.md §3.1): wudu, gusul, tejemmum, ezan, the
 * conditions of salah, what breaks wudu / salah, the words of salah and the manners of the masjid.
 * Architecture, objects and neutral pictograms only – no faces, no people. Keys are `basics-*` (salah.basics-…).
 */

/** Dim a colour on dark surfaces. */
const dk = (c: Ctx, color: string, k = 0.35) => (c.dark ? mix(color, '#1B1F4B', k) : color);

function Drops({ pts }: { pts: [number, number, number][] }) {
  return (
    <G>
      {pts.map(([x, y, h], i) => (
        <Path key={i} d={dropPath(x, y, h)} fill={i % 2 ? C.waterLight : C.water} />
      ))}
    </G>
  );
}

/** Bosnian copper ibrik (water jug with a long spout), base at y = 0, centred on x = 0, ~ 90 high. */
function Ibrik({ c, x, y, s = 1, tilt = 0 }: { c: Ctx; x: number; y: number; s?: number; tilt?: number }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
      <Lin id={c.id('ibrikBody')} x1={0} y1={0} x2={1} y2={0} stops={[[0, '#B5652E'], [0.45, '#E39A55'], [1, '#9A4F22']]} />
      {/* spout */}
      <Path d="M14 -40C26 -46 34 -62 44 -78L49 -75C42 -58 34 -40 18 -30Z" fill="#C2733A" />
      <Path d="M44 -78L52 -82 50 -73Z" fill="#9A4F22" />
      {/* handle */}
      <Path d="M-16 -66C-36 -64 -38 -30 -18 -24" stroke="#9A4F22" strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* body */}
      <Path d="M-6 -78H6L8 -68C22 -60 26 -40 22 -22 20 -10 14 -4 10 0H-10C-14 -4 -20 -10 -22 -22 -26 -40 -22 -60 -8 -68Z" fill={c.url('ibrikBody')} />
      <Path d="M-20 -44Q0 -38 20 -44" stroke="#FFD9A6" strokeWidth={1.6} fill="none" opacity={0.7} />
      <Path d="M-14 -24Q0 -20 14 -24" stroke="#7E3E18" strokeWidth={1.4} fill="none" opacity={0.6} />
      {/* lid with a little knob */}
      <Path d="M-9 -78C-9 -86 9 -86 9 -78Z" fill="#D88A47" />
      <Circle cx={0} cy={-88} r={3} fill="#E9A863" />
      <Rect x={-12} y={-2} width={24} height={4} rx={2} fill="#8A461E" />
      <Ellipse cx={-8} cy={-52} rx={3} ry={10} fill="#FFFFFF" opacity={0.28} />
    </G>
  );
}

/** Ottoman "pencil" minaret as in Bosnian mosques: shaft, šerefe (balcony), cone roof and alem. Base at y = 0. */
function Minaret({ c, x, y, h = 200, w = 26 }: { c: Ctx; x: number; y: number; h?: number; w?: number }) {
  const stone = dk(c, C.marble, 0.45);
  const side = dk(c, C.stonePale, 0.45);
  const roof = dk(c, '#5E7A8C', 0.3);
  const b = h * 0.62; // balcony height
  return (
    <G transform={`translate(${x} ${y})`}>
      <Rect x={-w * 0.7} y={-h * 0.12} width={w * 1.4} height={h * 0.12} fill={side} />
      <Rect x={-w / 2} y={-b} width={w} height={b - h * 0.12} fill={stone} />
      <Rect x={w * 0.12} y={-b} width={w * 0.38} height={b - h * 0.12} fill={side} opacity={0.8} />
      {/* balcony */}
      <Path d={`M${-w * 0.95} ${-b}H${w * 0.95}L${w * 0.7} ${-b + 10}H${-w * 0.7}Z`} fill={side} />
      <Rect x={-w * 0.95} y={-b - 9} width={w * 1.9} height={9} rx={2} fill={stone} />
      {[-0.7, -0.35, 0, 0.35, 0.7].map((f, i) => (
        <Rect key={i} x={w * f - 1.5} y={-b - 8} width={3} height={7} fill={side} />
      ))}
      {/* upper shaft */}
      <Rect x={-w * 0.4} y={-h * 0.84} width={w * 0.8} height={h * 0.84 - b - 9} fill={stone} />
      <Path d={archPath(0, -b - 30, w * 0.36, -b - 14)} fill={dk(c, C.nightSoft, 0.1)} />
      {/* cone */}
      <Path d={`M${-w * 0.5} ${-h * 0.84}L0 ${-h * 1.02}L${w * 0.5} ${-h * 0.84}Z`} fill={roof} />
      <Path d={`M0 ${-h * 1.02}L${w * 0.5} ${-h * 0.84}H${w * 0.12}Z`} fill={shade(roof, 0.25)} />
      {/* alem */}
      <Path d={`M0 ${-h * 1.02}V${-h * 1.07}`} stroke={C.goldDeep} strokeWidth={2} />
      <Circle cx={0} cy={-h * 1.04} r={2.4} fill={C.gold} />
      <Path d={crescentPath(0, -h * 1.09, 5, 2.4, -1.4, 4.2)} fill={C.gold} />
    </G>
  );
}

/** Rounded neutral pictogram silhouette parts (body pictograms tone = c.tint). */
function Torso({ c }: { c: Ctx }) {
  return (
    <G>
      <Path d="M22 96V52C22 34 34 26 50 26S78 34 78 52V96Z" fill={c.tint} />
      <Path d="M22 52C22 34 34 26 50 26 40 30 32 40 32 56V96H22Z" fill={shade(c.tint, 0.14)} />
      <Path d="M14 58C14 44 20 36 26 34V80C20 80 14 74 14 66Z" fill={shade(c.tint, 0.08)} />
      <Path d="M86 58C86 44 80 36 74 34V80C80 80 86 74 86 66Z" fill={shade(c.tint, 0.08)} />
      <Rect x={42} y={12} width={16} height={18} rx={6} fill={shade(c.tint, 0.1)} />
    </G>
  );
}

function Legs({ c }: { c: Ctx }) {
  return (
    <G>
      <Path d="M24 8H48V60L46 88H30L26 60Z" fill={shade(c.tint, 0.1)} />
      <Path d="M52 8H76L74 60 70 88H54L52 60Z" fill={c.tint} />
      <Path d="M28 88H48C50 92 48 96 44 96H26C24 96 24 90 28 88ZM52 88H72C76 90 76 96 74 96H56C52 96 50 92 52 88Z" fill={shade(c.tint, 0.2)} />
    </G>
  );
}

/** Small speech bubble frame. */
function Bubble({ c, color = C.white }: { c: Ctx; color?: string }) {
  return (
    <G>
      <Path d="M14 16H86C92 16 96 20 96 26V62C96 68 92 72 86 72H44L28 88 30 72H14C8 72 4 68 4 62V26C4 20 8 16 14 16Z" fill={dk(c, color, 0.25)} stroke={dk(c, C.greyDark, 0.1)} strokeWidth={2.5} />
    </G>
  );
}

/** Prayer mat (sedžada) lying flat, seen from slightly above. */
function Mat({ c, x, y, w, h, color = '#2E7D6B', stain }: { c: Ctx; x: number; y: number; w: number; h: number; color?: string; stain?: boolean }) {
  const col = dk(c, color, 0.2);
  return (
    <G transform={`translate(${x} ${y})`}>
      <Path d={`M${w * 0.14} 0H${w * 0.86}L${w} ${h}H0Z`} fill={col} />
      <Path d={`M${w * 0.18} ${h * 0.08}H${w * 0.82}L${w * 0.92} ${h * 0.92}H${w * 0.08}Z`} fill="none" stroke={C.goldLight} strokeWidth={2} opacity={0.85} />
      <Path d={`M${w * 0.38} ${h * 0.62}V${h * 0.32}Q${w * 0.5} ${h * 0.1} ${w * 0.62} ${h * 0.32}V${h * 0.62}Z`} fill={shade(col, 0.25)} />
      <Path d={star8Path(w * 0.5, h * 0.78, h * 0.08)} fill={C.goldLight} opacity={0.8} />
      {stain ? <Path d={`M${w * 0.62} ${h * 0.5}c6 -4 14 -2 16 4s-4 10 -10 9 -12 -6 -6 -13z`} fill="#6B4A2E" opacity={0.85} /> : null}
    </G>
  );
}

/** Hanger with a long robe and a folded scarf (covering the ʿawrah). */
function Garment({ c, x, y, s = 1 }: { c: Ctx; x: number; y: number; s?: number }) {
  const robe = dk(c, '#8E7CC3', 0.3);
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M0 0V8" stroke={C.greyDark} strokeWidth={2} />
      <Path d="M0 -4C0 -10 6 -10 6 -6" stroke={C.greyDark} strokeWidth={2} fill="none" />
      <Path d="M-26 18L0 8 26 18" stroke={C.woodLight} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d="M-24 18H24L32 40 24 44 22 96H-22L-24 44-32 40Z" fill={robe} />
      <Path d="M-6 18L0 34 6 18Z" fill={shade(robe, 0.25)} />
      <Path d="M-22 70H22" stroke={shade(robe, 0.15)} strokeWidth={2} />
      <Path d="M18 26C30 26 36 40 32 56 28 62 22 58 22 50Z" fill={dk(c, C.pinkPale, 0.3)} />
    </G>
  );
}

function WallClock({ c, x, y, r }: { c: Ctx; x: number; y: number; r: number }) {
  return (
    <G>
      <Circle cx={x} cy={y} r={r + 3} fill={dk(c, C.wood, 0.2)} />
      <Circle cx={x} cy={y} r={r} fill={dk(c, C.ivory, 0.4)} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <Circle key={i} cx={x + Math.cos(a) * r * 0.8} cy={y + Math.sin(a) * r * 0.8} r={1.2} fill={C.ink} />;
      })}
      <Path d={`M${x} ${y}V${y - r * 0.6}M${x} ${y}L${x + r * 0.45} ${y + r * 0.2}`} stroke={C.ink} strokeWidth={2.2} strokeLinecap="round" />
      <Circle cx={x} cy={y} r={2} fill={C.coral} />
    </G>
  );
}

function QiblaSign({ c, x, y }: { c: Ctx; x: number; y: number }) {
  return (
    <G transform={`translate(${x} ${y})`}>
      <Rect x={-18} y={-14} width={36} height={28} rx={6} fill={dk(c, C.tealPale, 0.3)} stroke={C.teal} strokeWidth={2} />
      <Rect x={-6} y={-8} width={12} height={12} rx={1.5} fill={C.ink} />
      <Rect x={-6} y={-5} width={12} height={2} fill={C.gold} />
      <Path d="M-14 9H10L6 5M10 9L6 13" stroke={C.teal} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </G>
  );
}

/** A small stool with a jug of water and a folded towel (wudu: clean from hadath). */
function WuduStool({ c, x, y }: { c: Ctx; x: number; y: number }) {
  return (
    <G transform={`translate(${x} ${y})`}>
      <Rect x={-26} y={-4} width={52} height={7} rx={3} fill={dk(c, C.woodLight, 0.25)} />
      <Path d="M-20 3L-24 34M20 3L24 34" stroke={dk(c, C.wood, 0.25)} strokeWidth={5} strokeLinecap="round" />
      <Path d="M-24 -4V-12C-24 -16 -4 -16 -4 -12V-4Z" fill={dk(c, C.white, 0.3)} />
      <Path d="M-24 -9H-4" stroke={C.water} strokeWidth={2} />
      <Ibrik c={c} x={12} y={-4} s={0.42} />
    </G>
  );
}

function Window({ c, x, y, w, h, night }: { c: Ctx; x: number; y: number; w: number; h: number; night?: boolean }) {
  return (
    <G>
      <Path d={archPath(x + w / 2, y, w, y + h)} fill={dk(c, C.woodLight, 0.2)} />
      <Path d={archPath(x + w / 2, y + 5, w - 10, y + h - 5)} fill={night || c.dark ? '#26306E' : '#BFE6F5'} />
      <Path d={`M${x + w / 2} ${y + 6}V${y + h - 5}M${x + 5} ${y + h * 0.58}H${x + w - 5}`} stroke={dk(c, C.woodLight, 0.2)} strokeWidth={3} />
      {!night && !c.dark ? <Circle cx={x + w * 0.72} cy={y + h * 0.36} r={6} fill={C.goldLight} /> : <Path d={crescentPath(x + w * 0.7, y + h * 0.34, 6, 3, -2, 5)} fill={C.goldPale} />}
    </G>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Pieces

export const basics = {
  /** The Bosnian ibrik – the wudu water jug. */
  'basics-ibrik': art(100, 110, (c) => (
    <>
      <Glow c={c} k="g" cx={50} cy={58} r={48} color={C.waterPale} opacity={c.dark ? 0.2 : 0.45} />
      <Shadow c={c} cx={44} cy={104} rx={26} />
      <Ibrik c={c} x={44} y={102} s={1.05} />
      <Drops pts={[[94, 16, 9], [88, 30, 7]]} />
    </>
  )),

  /** Wudu area (abdesthana): tiled wall, a row of taps over a stone basin, low stools – a backdrop / cover. */
  'basics-wudu-area': art(400, 300, (c) => {
    const wall = dk(c, '#EAF2F1', 0.6);
    const tile = dk(c, '#CFE6E3', 0.55);
    return (
      <>
        <Rect x={0} y={0} width={400} height={300} fill={wall} />
        {Array.from({ length: 10 }, (_, i) => (
          <Path key={`v${i}`} d={`M${i * 40 + 20} 0V190`} stroke={tile} strokeWidth={2} />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <Path key={`h${i}`} d={`M0 ${i * 40 + 20}H400`} stroke={tile} strokeWidth={2} />
        ))}
        {/* arched niches */}
        {[70, 200, 330].map((x) => (
          <G key={x}>
            <Path d={archPath(x, 30, 90, 150)} fill={dk(c, '#D6EBF2', 0.5)} stroke={dk(c, C.teal, 0.2)} strokeWidth={3} />
            <Path d={star8Path(x, 66, 12)} fill={dk(c, C.tealLight, 0.25)} opacity={0.8} />
            {/* tap */}
            <Path d={`M${x - 4} 112H${x + 10}V120H${x + 4}V126`} stroke={dk(c, '#B9BDC9', 0.2)} strokeWidth={6} strokeLinecap="round" fill="none" />
            <Circle cx={x - 4} cy={112} r={5} fill={dk(c, '#D6D9E2', 0.2)} />
            <Path d={`M${x + 4} 130V170`} stroke={C.waterLight} strokeWidth={4} strokeLinecap="round" opacity={0.85} />
          </G>
        ))}
        {/* stone basin */}
        <Rect x={0} y={170} width={400} height={26} fill={dk(c, C.stoneLight, 0.4)} />
        <Rect x={0} y={170} width={400} height={6} fill={dk(c, C.stonePale, 0.4)} />
        <Path d="M0 196H400V210H0Z" fill={dk(c, C.stone, 0.4)} />
        {/* floor */}
        <Rect x={0} y={210} width={400} height={90} fill={dk(c, '#D9C9AE', 0.5)} />
        {Array.from({ length: 6 }, (_, i) => (
          <Path key={`f${i}`} d={`M${i * 80 - 20} 300L${i * 80 + 20} 210`} stroke={dk(c, '#C7B596', 0.5)} strokeWidth={2} />
        ))}
        {/* stools */}
        {[70, 200, 330].map((x) => (
          <G key={`s${x}`}>
            <Ellipse cx={x} cy={262} rx={30} ry={6} fill={c.dark ? '#000' : C.ink} opacity={0.12} />
            <Rect x={x - 28} y={232} width={56} height={9} rx={4} fill={dk(c, C.woodLight, 0.3)} />
            <Path d={`M${x - 20} 241L${x - 24} 262M${x + 20} 241L${x + 24} 262`} stroke={dk(c, C.wood, 0.3)} strokeWidth={6} strokeLinecap="round" />
          </G>
        ))}
        <Ibrik c={c} x={350} y={292} s={0.62} />
        {/* towel on a hook */}
        <Path d="M130 120V150C130 156 150 156 150 150V120Z" fill={dk(c, C.coral, 0.3)} />
        <Path d="M130 128H150" stroke={C.white} strokeWidth={2} opacity={0.8} />
      </>
    );
  }),

  /** Whole-body wash (gusul): a pouring jug, a water stream and drops – an icon. */
  'basics-shower': art(100, 110, (c) => (
    <>
      <Glow c={c} k="g" cx={50} cy={64} r={46} color={C.waterPale} opacity={c.dark ? 0.2 : 0.5} />
      <Ibrik c={c} x={30} y={50} s={0.48} tilt={50} />
      <Path d="M74 46C78 62 72 80 74 100" stroke={C.waterLight} strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.9} />
      <Path d="M73 50C76 64 71 80 72 98" stroke={C.white} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.7} />
      <Ellipse cx={72} cy={102} rx={22} ry={5} fill={C.water} opacity={0.5} />
      <Drops pts={[[50, 86, 9], [92, 80, 9], [56, 62, 7], [90, 54, 7]]} />
    </>
  )),

  'basics-torso': art(100, 100, (c) => (
    <>
      <Glow c={c} k="g" cx={50} cy={58} r={46} color={C.waterPale} opacity={c.dark ? 0.15 : 0.4} />
      <Torso c={c} />
    </>
  )),

  'basics-legs': art(100, 100, (c) => (
    <>
      <Glow c={c} k="g" cx={50} cy={52} r={46} color={C.waterPale} opacity={c.dark ? 0.15 : 0.4} />
      <Legs c={c} />
    </>
  )),

  /** Two palms pressed on a tray of clean sand (tejemmum). */
  'basics-palms-sand': art(110, 100, (c) => (
    <>
      <Path d="M6 64C20 52 90 52 104 64L96 92H14Z" fill={dk(c, C.sandDeep, 0.3)} />
      <Path d="M10 66C26 58 84 58 100 66 84 74 26 74 10 66Z" fill={dk(c, C.sand, 0.3)} />
      {[[24, 70], [40, 62], [62, 68], [80, 63], [90, 70], [50, 72]].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={1.4} fill={dk(c, C.sandDark, 0.3)} />
      ))}
      {[30, 76].map((x, i) => (
        <G key={x} transform={`translate(${x} 58) scale(${i ? 1 : -1} 1)`}>
          <Path d="M-12 -2C-14 -16 -12 -34 -8 -46 -6 -50 -2 -50 -2 -44L-1 -28 1 -48C2 -54 7 -54 7 -48L7 -28 10 -44C11 -50 16 -50 15 -42L13 -24 17 -34C19 -38 23 -36 22 -30L16 -2Z" fill={c.tint} />
          <Path d="M-12 -2H16" stroke={shade(c.tint, 0.2)} strokeWidth={2} />
        </G>
      ))}
      <Path d={sparklePath(55, 26, 8)} fill={C.gold} />
      <Path d="M18 48L10 42M92 48L100 42M55 50V42" stroke={dk(c, C.sandDark, 0.2)} strokeWidth={2} strokeLinecap="round" />
    </>
  )),

  /** A yard with things of the earth (sand, stones, a brick wall, soil) and things that are not (wood, glass, metal). */
  'basics-earth-yard': art(400, 300, (c) => {
    const sky: [number, string][] = c.dark ? [[0, '#14173A'], [1, '#343B7A']] : [[0, '#8FD0EC'], [1, '#E3F3F7']];
    return (
      <>
        <Lin id={c.id('sky')} stops={sky} />
        <Rect x={0} y={0} width={400} height={300} fill={c.url('sky')} />
        {/* brick wall (left) */}
        <Rect x={0} y={60} width={150} height={150} fill={dk(c, '#C8643B', 0.35)} />
        {Array.from({ length: 10 }, (_, row) =>
          Array.from({ length: 5 }, (_, col) => (
            <Rect key={`${row}-${col}`} x={col * 32 + (row % 2 ? -16 : 0) + 2} y={62 + row * 15} width={28} height={12} rx={1.5} fill={dk(c, '#D9784E', 0.35)} />
          )),
        )}
        <Rect x={0} y={54} width={154} height={8} fill={dk(c, C.stoneLight, 0.35)} />
        {/* window with glass (right) on a little house wall */}
        <Rect x={250} y={40} width={150} height={170} fill={dk(c, C.sandLight, 0.4)} />
        <Rect x={290} y={70} width={70} height={60} rx={4} fill={dk(c, C.woodLight, 0.2)} />
        <Rect x={295} y={75} width={60} height={50} rx={2} fill={c.dark ? '#3B4C8A' : '#BFE6F5'} />
        <Path d="M305 82L322 99M330 82L347 99" stroke={C.white} strokeWidth={3} opacity={0.75} strokeLinecap="round" />
        {/* ground */}
        <Path d="M0 206C80 198 160 204 240 200S360 204 400 202V300H0Z" fill={dk(c, '#9A7B55', 0.4)} />
        <Path d="M0 226C90 220 200 228 400 222V300H0Z" fill={dk(c, '#86663F', 0.4)} />
        {/* sand pile */}
        <Path d="M120 250C140 214 196 210 220 250Z" fill={dk(c, C.sand, 0.3)} />
        <Path d="M150 226C164 218 182 220 192 228" stroke={dk(c, C.sandLight, 0.3)} strokeWidth={3} fill="none" strokeLinecap="round" />
        {/* stones */}
        <Ellipse cx={46} cy={256} rx={26} ry={16} fill={dk(c, C.stone, 0.35)} />
        <Ellipse cx={40} cy={250} rx={12} ry={6} fill={dk(c, C.stoneLight, 0.35)} />
        <Ellipse cx={82} cy={266} rx={14} ry={9} fill={dk(c, C.stoneDark, 0.35)} />
        {/* wooden bench */}
        <Rect x={244} y={232} width={70} height={10} rx={3} fill={dk(c, C.woodLight, 0.25)} />
        <Path d="M252 242V266M306 242V266" stroke={dk(c, C.wood, 0.25)} strokeWidth={6} strokeLinecap="round" />
        <Path d="M250 236H308" stroke={dk(c, C.wood, 0.25)} strokeWidth={1.4} opacity={0.6} />
        {/* metal bucket */}
        <Path d="M336 236H376L372 276H340Z" fill={dk(c, '#AEB4C2', 0.25)} />
        <Path d="M336 236H376" stroke={dk(c, '#7C8394', 0.2)} strokeWidth={3} />
        <Path d="M338 238C340 220 372 220 374 238" stroke={dk(c, '#7C8394', 0.2)} strokeWidth={2} fill="none" />
        <Path d="M346 244V270" stroke={C.white} strokeWidth={3} opacity={0.5} />
        {/* glass jar */}
        <Path d="M214 166H234V172C240 176 240 180 240 196H208C208 180 208 176 214 172Z" fill={c.dark ? '#4E6AA8' : '#D7F0F8'} stroke={dk(c, '#7FB6CC', 0.2)} strokeWidth={2} />
        <Rect x={212} y={196} width={28} height={4} rx={2} fill={dk(c, '#7FB6CC', 0.2)} />
        {/* a little tree (wood) */}
        <Path d="M188 200V150" stroke={dk(c, C.wood, 0.2)} strokeWidth={8} strokeLinecap="round" />
        <Circle cx={188} cy={130} r={26} fill={dk(c, C.leaf, 0.3)} />
        <Circle cx={172} cy={142} r={16} fill={dk(c, C.leafDark, 0.3)} />
        <Circle cx={204} cy={140} r={16} fill={dk(c, C.leafLight, 0.3)} />
      </>
    );
  }),

  /** A calm room set up for prayer: window, wall clock, qibla sign, mat, garment, wudu stool – plus a few toys. */
  'basics-prayer-room': art(400, 300, (c) => {
    const wall = dk(c, '#F4E9D8', 0.6);
    const floor = dk(c, '#C9A27A', 0.5);
    return (
      <>
        <Rect x={0} y={0} width={400} height={300} fill={wall} />
        <Rect x={0} y={0} width={400} height={14} fill={dk(c, '#E9D9BF', 0.6)} />
        <Path d="M0 196H400V300H0Z" fill={floor} />
        {Array.from({ length: 6 }, (_, i) => (
          <Path key={i} d={`M0 ${206 + i * 18}H400`} stroke={dk(c, '#B98F66', 0.5)} strokeWidth={1.5} opacity={0.6} />
        ))}
        <Rect x={0} y={190} width={400} height={8} fill={dk(c, '#DCC7A5', 0.55)} />
        <Window c={c} x={150} y={34} w={70} h={96} />
        <WallClock c={c} x={300} y={56} r={20} />
        <QiblaSign c={c} x={60} y={60} />
        <Garment c={c} x={344} y={96} s={0.85} />
        <Mat c={c} x={110} y={208} w={150} h={70} />
        <WuduStool c={c} x={52} y={190} />
        {/* toys / everyday things (not conditions) */}
        <Circle cx={300} cy={268} r={14} fill={dk(c, C.coral, 0.25)} />
        <Path d="M287 264Q300 258 313 264M290 276Q300 282 312 276" stroke={C.white} strokeWidth={2} fill="none" opacity={0.8} />
        <Path d="M234 120H262L258 150H238Z" fill={dk(c, C.terracotta, 0.3)} />
        <Circle cx={248} cy={108} r={12} fill={dk(c, C.leaf, 0.3)} />
        <Circle cx={240} cy={114} r={8} fill={dk(c, C.leafDark, 0.3)} />
        <Rect x={226} y={150} width={44} height={6} rx={2} fill={dk(c, C.woodLight, 0.25)} />
        <Path d={sparklePath(186, 196, 9)} fill={C.gold} opacity={0.9} />
      </>
    );
  }),

  /** The minaret on its own (ezan). */
  'basics-minaret': art(120, 260, (c) => (
    <>
      <Glow c={c} k="g" cx={60} cy={60} r={56} color={C.goldPale} opacity={c.dark ? 0.25 : 0.45} />
      <Shadow c={c} cx={60} cy={254} rx={34} />
      <Minaret c={c} x={60} y={252} h={230} w={34} />
      <Path d="M86 92Q100 102 86 112M94 84Q114 102 94 120" stroke={C.gold} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d="M34 92Q20 102 34 112M26 84Q6 102 26 120" stroke={C.gold} strokeWidth={3} fill="none" strokeLinecap="round" />
    </>
  )),

  /** A mosque with a dome and a minaret at dawn, the call spreading from the šerefe (cover of ezan & ikamet). */
  'basics-ezan-scene': art(400, 300, (c) => {
    const sky: [number, string][] = c.dark ? [[0, '#101333'], [1, '#4B3F8F']] : [[0, '#2E3380'], [0.6, '#8B6FA8'], [1, '#F6B98A']];
    const wall = dk(c, C.marble, 0.4);
    return (
      <>
        <Lin id={c.id('sky')} stops={sky} />
        <Rect x={0} y={0} width={400} height={300} fill={c.url('sky')} />
        {[[30, 30], [90, 60], [150, 22], [330, 40], [370, 80], [260, 30]].map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={1.3} fill={C.white} opacity={0.8} />
        ))}
        <Path d={crescentPath(320, 60, 14, 7, -4, 11)} fill={C.goldPale} />
        {[0, 1, 2].map((i) => (
          <Circle key={i} cx={268} cy={96} r={26 + i * 22} fill="none" stroke={C.goldLight} strokeWidth={2.5} opacity={0.7 - i * 0.2} />
        ))}
        <Path d="M0 236C100 226 300 230 400 236V300H0Z" fill={dk(c, '#3A3566', 0.1)} />
        {/* mosque */}
        <Rect x={90} y={170} width={150} height={74} fill={wall} />
        <Path d="M110 172A55 55 0 0 1 220 172Z" fill={dk(c, '#5E7A8C', 0.2)} />
        <Path d="M165 116V106" stroke={C.goldDeep} strokeWidth={2} />
        <Path d={crescentPath(165, 102, 4, 2, -1, 3.4)} fill={C.gold} />
        {[120, 150, 180, 210].map((x) => (
          <Path key={x} d={archPath(x, 192, 16, 228)} fill={dk(c, '#F6D58E', 0.1)} />
        ))}
        <Path d={archPath(165, 206, 22, 244)} fill={dk(c, C.wood, 0.1)} />
        <Minaret c={c} x={268} y={244} h={200} w={24} />
        <Path d="M0 244H400V300H0Z" fill={dk(c, '#2A2750', 0.05)} />
      </>
    );
  }),

  /** Masjid entrance: arched door and a neat shoe rack. */
  'basics-masjid-door': art(120, 120, (c) => (
    <>
      <Rect x={10} y={20} width={100} height={92} rx={6} fill={dk(c, C.marble, 0.4)} />
      <Path d={archPath(60, 30, 50, 112)} fill={dk(c, C.teal, 0.2)} />
      <Path d={archPath(60, 36, 40, 112)} fill={dk(c, '#0B5E55', 0.2)} />
      <Path d="M60 44V112" stroke={dk(c, C.tealLight, 0.2)} strokeWidth={2} />
      <Circle cx={55} cy={80} r={2.4} fill={C.gold} />
      <Circle cx={65} cy={80} r={2.4} fill={C.gold} />
      <Path d={star8Path(60, 22, 10)} fill={C.gold} />
      <Rect x={14} y={92} width={24} height={20} rx={2} fill={dk(c, C.woodLight, 0.25)} />
      <Rect x={82} y={92} width={24} height={20} rx={2} fill={dk(c, C.woodLight, 0.25)} />
      <Path d="M16 100H36M84 100H104" stroke={dk(c, C.wood, 0.25)} strokeWidth={2} />
      <Ellipse cx={22} cy={97} rx={5} ry={2.5} fill={C.ink} opacity={0.7} />
      <Ellipse cx={31} cy={97} rx={5} ry={2.5} fill={C.ink} opacity={0.7} />
      <Ellipse cx={90} cy={106} rx={5} ry={2.5} fill={dk(c, C.coral, 0.2)} />
      <Ellipse cx={99} cy={106} rx={5} ry={2.5} fill={dk(c, C.coral, 0.2)} />
    </>
  )),

  /** Shoes placed neatly on a rack. */
  'basics-shoe-rack': art(110, 90, (c) => (
    <>
      <Shadow c={c} cx={55} cy={86} rx={44} />
      <Rect x={10} y={14} width={90} height={70} rx={4} fill={dk(c, C.woodLight, 0.25)} />
      <Rect x={16} y={20} width={78} height={26} fill={dk(c, C.wood, 0.3)} />
      <Rect x={16} y={52} width={78} height={26} fill={dk(c, C.wood, 0.3)} />
      {[28, 44].map((x) => (
        <Path key={x} d={`M${x - 8} 44C${x - 8} 36 ${x + 6} 36 ${x + 8} 44Z`} fill={C.ink} opacity={0.8} />
      ))}
      {[66, 82].map((x) => (
        <Path key={x} d={`M${x - 8} 44C${x - 8} 34 ${x + 6} 34 ${x + 8} 44Z`} fill={dk(c, C.coral, 0.2)} />
      ))}
      {[30, 46, 66, 82].map((x, i) => (
        <Path key={x} d={`M${x - 8} 76C${x - 8} 68 ${x + 6} 68 ${x + 8} 76Z`} fill={i < 2 ? dk(c, C.indigo, 0.1) : dk(c, C.leafDark, 0.1)} />
      ))}
    </>
  )),

  /** A phone switched to silent. */
  'basics-phone-silent': art(80, 100, (c) => (
    <>
      <Rect x={18} y={8} width={44} height={84} rx={9} fill={dk(c, C.ink, 0)} />
      <Rect x={22} y={16} width={36} height={66} rx={4} fill={dk(c, '#3B4C8A', 0.1)} />
      <Path d="M32 42V56H38L46 62V36L38 42Z" fill={C.white} />
      <Path d="M28 34L54 66" stroke={C.coral} strokeWidth={4} strokeLinecap="round" />
    </>
  )),

  /** Onion and garlic (keep their smell away from the masjid). */
  'basics-onion': art(100, 90, (c) => (
    <>
      <Shadow c={c} cx={50} cy={84} rx={40} />
      <Path d="M36 30C14 40 14 76 36 82S60 74 58 56 48 34 36 30Z" fill={dk(c, '#B76E9A', 0.2)} />
      <Path d="M36 30C30 44 30 66 36 82" stroke={dk(c, '#8E4C76', 0.2)} strokeWidth={2} fill="none" />
      <Path d="M36 30C38 20 40 14 46 8" stroke={C.leaf} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d="M70 44C56 50 56 76 70 80S90 76 88 62 80 46 70 44Z" fill={dk(c, C.ivory, 0.3)} stroke={dk(c, C.stonePale, 0.2)} strokeWidth={1.5} />
      <Path d="M70 44C66 56 66 70 70 80M70 44C76 56 78 68 76 80" stroke={dk(c, C.stoneLight, 0.2)} strokeWidth={1.5} fill="none" />
      <Path d="M70 44V34" stroke={C.leafLight} strokeWidth={3} strokeLinecap="round" />
    </>
  )),

  /** Restroom door (going to the toilet breaks wudu). */
  'basics-wc': art(90, 100, (c) => (
    <>
      <Rect x={18} y={8} width={54} height={88} rx={4} fill={dk(c, C.woodLight, 0.25)} />
      <Rect x={24} y={14} width={42} height={36} rx={3} fill={dk(c, C.wood, 0.25)} />
      <Rect x={24} y={56} width={42} height={34} rx={3} fill={dk(c, C.wood, 0.25)} />
      <Circle cx={62} cy={54} r={3} fill={C.gold} />
      <Rect x={31} y={22} width={28} height={20} rx={4} fill={dk(c, C.tealPale, 0.2)} />
      <Path d={dropPath(45, 24, 16)} fill={C.water} />
    </>
  )),

  /** A gust of wind. */
  'basics-wind': art(100, 80, (c) => (
    <>
      <Path d="M10 30H62C72 30 76 20 70 14S56 12 56 20" stroke={dk(c, '#7FB6CC', 0.1)} strokeWidth={6} fill="none" strokeLinecap="round" />
      <Path d="M10 48H80C90 48 94 58 88 64S74 66 74 58" stroke={dk(c, '#9FD0E2', 0.1)} strokeWidth={6} fill="none" strokeLinecap="round" />
      <Path d="M20 64H50" stroke={dk(c, '#BFE2EE', 0.1)} strokeWidth={5} strokeLinecap="round" />
    </>
  )),

  /** Deep sleep lying down: pillow, blanket, moon. */
  'basics-sleep': art(100, 90, (c) => (
    <>
      <Path d="M8 56H92V74H8Z" fill={dk(c, C.woodLight, 0.25)} />
      <Path d="M12 46C12 38 36 36 38 46 38 54 12 56 12 46Z" fill={dk(c, C.white, 0.3)} />
      <Path d="M34 44H90V60H34Z" fill={dk(c, '#8E7CC3', 0.2)} />
      <Path d="M34 44C50 38 70 38 90 44" stroke={dk(c, '#B9A3E3', 0.2)} strokeWidth={3} fill="none" />
      <Path d={crescentPath(74, 16, 10, 5, -3, 8)} fill={C.gold} />
      <Path d="M42 18H52L42 30H52M56 10H62L56 18H62" stroke={dk(c, C.indigo, 0)} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  )),

  /** A plaster with a drop of blood (flowing blood breaks wudu in the Hanafi school). */
  'basics-plaster': art(100, 90, (c) => (
    <>
      <G transform="rotate(-24 50 50)">
        <Rect x={10} y={36} width={80} height={26} rx={13} fill={dk(c, '#F2C9A0', 0.25)} />
        <Rect x={36} y={38} width={28} height={22} rx={3} fill={dk(c, '#E8B48A', 0.25)} />
        {[16, 24, 72, 80].map((x) => (
          <Circle key={x} cx={x} cy={49} r={1.4} fill={dk(c, '#C98E62', 0.2)} />
        ))}
      </G>
      <Path d={dropPath(70, 54, 22)} fill={C.berry} />
    </>
  )),

  /** Laughing out loud (speech bubble with waves). */
  'basics-laugh': art(100, 100, (c) => (
    <>
      <Bubble c={c} />
      <Path d="M20 44Q28 32 36 44T52 44T68 44T84 44" stroke={C.coral} strokeWidth={5} fill="none" strokeLinecap="round" />
      <Path d={sparklePath(86, 14, 8)} fill={C.gold} />
    </>
  )),

  /** Talking (speech bubble with dots). */
  'basics-talk': art(100, 100, (c) => (
    <>
      <Bubble c={c} />
      {[32, 50, 68].map((x) => (
        <Circle key={x} cx={x} cy={44} r={6} fill={dk(c, C.indigo, 0)} />
      ))}
    </>
  )),

  /** Turning away from the qibla (an arrow bending away from the Kaaba). */
  'basics-turn-away': art(100, 100, (c) => (
    <>
      <Rect x={58} y={14} width={30} height={30} rx={3} fill={C.ink} />
      <Rect x={58} y={22} width={30} height={5} fill={C.gold} />
      <Path d="M24 88V60C24 40 34 30 50 30" stroke={dk(c, C.teal, 0)} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.35} />
      <Path d="M24 88V64C24 52 18 44 8 40" stroke={C.coral} strokeWidth={7} fill="none" strokeLinecap="round" />
      <Path d="M4 30L6 46 18 38Z" fill={C.coral} />
    </>
  )),

  /** Many movements (motion lines around a hand). */
  'basics-moves': art(100, 100, (c) => (
    <>
      <G transform="translate(52 62)">
        <Path d="M-12 -2C-14 -16 -12 -34 -8 -46 -6 -50 -2 -50 -2 -44L-1 -28 1 -48C2 -54 7 -54 7 -48L7 -28 10 -44C11 -50 16 -50 15 -42L13 -24 17 -34C19 -38 23 -36 22 -30L16 -2C16 20 -12 20 -12 -2Z" fill={c.tint} />
      </G>
      {[0, 1, 2].map((i) => (
        <Path key={i} d={`M${16 - i * 4} ${30 + i * 16}Q${10 - i * 4} ${38 + i * 16} ${16 - i * 4} ${46 + i * 16}M${84 + i * 4} ${30 + i * 16}Q${90 + i * 4} ${38 + i * 16} ${84 + i * 4} ${46 + i * 16}`} stroke={C.coral} strokeWidth={3} fill="none" strokeLinecap="round" />
      ))}
    </>
  )),

  /** Scissors cutting nails (does not break wudu). */
  'basics-nails': art(100, 90, (c) => (
    <>
      <Circle cx={26} cy={66} r={12} fill="none" stroke={dk(c, C.coral, 0.1)} strokeWidth={6} />
      <Circle cx={50} cy={74} r={12} fill="none" stroke={dk(c, C.coral, 0.1)} strokeWidth={6} />
      <Path d="M34 58L84 14M44 64L90 30" stroke={dk(c, '#AEB4C2', 0.1)} strokeWidth={6} strokeLinecap="round" />
      <Circle cx={40} cy={60} r={3} fill={C.greyDark} />
    </>
  )),

  /** A comb (combing the hair does not break wudu). */
  'basics-comb': art(100, 70, (c) => (
    <>
      <Rect x={10} y={14} width={80} height={16} rx={6} fill={dk(c, C.woodLight, 0.2)} />
      {Array.from({ length: 13 }, (_, i) => (
        <Rect key={i} x={14 + i * 6} y={28} width={3} height={28} rx={1.5} fill={dk(c, C.wood, 0.2)} />
      ))}
    </>
  )),

  /** Long robe and scarf on a hanger (covering the ʿawrah). */
  'basics-garment': art(90, 120, (c) => <Garment c={c} x={45} y={14} s={1} />),

  /** Prayer mat seen from above, clean. */
  'basics-mat': art(120, 80, (c) => <Mat c={c} x={10} y={6} w={100} h={68} />),

  /** Prayer mat with a stain (the place must be clean). */
  'basics-mat-stain': art(120, 80, (c) => <Mat c={c} x={10} y={6} w={100} h={68} stain />),

  /** Wall clock (the time of the prayer). */
  'basics-clock': art(80, 80, (c) => <WallClock c={c} x={40} y={40} r={32} />),

  /** Qibla sign. */
  'basics-qibla-sign': art(80, 70, (c) => (
    <G transform="scale(1.9)">
      <QiblaSign c={c} x={21} y={18} />
    </G>
  )),

  /** Niyyah – the intention in the heart: a heart with a soft glow. */
  'basics-niyyah': art(100, 100, (c) => (
    <>
      <Rad id={c.id('n')} stops={[[0, C.goldPale, 0.9], [1, C.goldPale, 0]]} />
      <Circle cx={50} cy={50} r={48} fill={c.url('n')} />
      <Path d="M50 82C24 62 14 48 14 34 14 22 24 14 34 14 42 14 48 18 50 26 52 18 58 14 66 14 76 14 86 22 86 34 86 48 76 62 50 82Z" fill={C.rose} />
      <Path d="M30 30C30 24 34 22 38 22" stroke={C.white} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.7} />
    </>
  )),
} satisfies Record<string, ArtDef>;
