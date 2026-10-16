import type { ReactNode } from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { art, Glow, Shadow, star8Path, type ArtDef, type Ctx } from '../../kit';
import { C, mix } from '../../palette';

/**
 * Section art (see docs/GAMES-V3.md). Owned by the akhlaq section – add pieces here only.
 * Homes, rooms, a market stall, animals, plates of food, trees and a street – objects and scenes, never people.
 */

/** Dim a colour a little on dark surfaces (scenes turn to a calm evening). */
const dk = (c: Ctx, color: string, k = 0.3) => (c.dark ? mix(color, '#1B1F4B', k) : color);

// ---------------------------------------------------------------------------------------------------------------
// Tidy up (room and masjid): containers and the things that belong in them

const tidy = {
  'toy-box': art(110, 100, (c) => (
    <>
      <Shadow c={c} cx={55} cy={94} rx={48} />
      <Path d="M10 22L14 10H96L100 22Z" fill={C.berry} />
      <Rect x={12} y={32} width={86} height={60} rx={6} fill={C.coral} />
      <Rect x={72} y={32} width={26} height={60} fill={C.berry} opacity={0.35} />
      <Rect x={8} y={20} width={94} height={16} rx={5} fill={C.berry} />
      <Circle cx={30} cy={36} r={9} fill={C.sky} />
      <Rect x={44} y={27} width={14} height={12} rx={2} fill={C.lemon} transform="rotate(-12 51 33)" />
      <Path d={star8Path(55, 64, 13)} fill={C.goldLight} opacity={0.9} />
      <Path d={star8Path(55, 64, 6)} fill={C.gold} />
      <Rect x={18} y={84} width={74} height={4} rx={2} fill={C.plum} opacity={0.4} />
    </>
  )),
  bookshelf: art(100, 110, (c) => (
    <>
      <Shadow c={c} cx={50} cy={105} rx={44} />
      <Rect x={8} y={6} width={84} height={98} rx={4} fill={C.wood} />
      <Rect x={14} y={12} width={72} height={88} rx={2} fill={C.woodDark} opacity={0.6} />
      {[38, 66, 94].map((y) => (
        <Rect key={y} x={12} y={y} width={76} height={5} fill={C.woodLight} />
      ))}
      {[
        [18, C.teal, 22], [27, C.coral, 20], [35, C.gold, 23], [44, C.purple, 21], [62, C.tealMid, 22], [71, C.berry, 19],
      ].map(([x, col, h], i) => (
        <Rect key={i} x={x as number} y={38 - (h as number)} width={7.5} height={h as number} rx={1.5} fill={col as string} />
      ))}
      {[[18, C.leaf], [27, C.sky], [36, C.orange], [56, C.teal], [65, C.plum], [74, C.gold]].map(([x, col], i) => (
        <Rect key={i} x={x as number} y={45} width={7.5} height={21} rx={1.5} fill={col as string} />
      ))}
      <Rect x={20} y={76} width={26} height={18} rx={2} fill={C.cream} />
      <Path d={star8Path(33, 85, 6)} fill={C.gold} />
      <Rect x={56} y={80} width={24} height={14} rx={2} fill={C.tealLight} />
    </>
  )),
  'laundry-basket': art(100, 100, (c) => (
    <>
      <Shadow c={c} cx={50} cy={95} rx={40} />
      <Path d="M18 30Q22 20 40 24Q48 14 60 24Q76 18 82 30Z" fill={C.sky} />
      <Path d="M30 28Q40 18 52 26" stroke={C.coral} strokeWidth={8} strokeLinecap="round" fill="none" />
      <Path d="M12 32H88L80 92H20Z" fill={C.sandDeep} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Path key={i} d={`M14 ${42 + i * 10}H86`} stroke={C.sandDark} strokeWidth={2} opacity={0.6} />
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Path key={`v${i}`} d={`M${22 + i * 9.5} 34L${25 + i * 8.5} 90`} stroke={C.sandLight} strokeWidth={2.4} opacity={0.7} />
      ))}
      <Rect x={8} y={28} width={84} height={8} rx={4} fill={C.sandDark} />
    </>
  )),
  'rubbish-bin': art(90, 110, (c) => (
    <>
      <Shadow c={c} cx={45} cy={105} rx={34} />
      <Path d="M16 30H74L68 102H22Z" fill={C.tealMid} />
      <Path d="M56 30H74L68 102H54Z" fill={C.teal} opacity={0.6} />
      {[30, 45, 60].map((x) => (
        <Path key={x} d={`M${x} 40L${x + 1} 94`} stroke={C.tealLight} strokeWidth={3} strokeLinecap="round" />
      ))}
      <Rect x={10} y={20} width={70} height={12} rx={5} fill={C.teal} />
      <Rect x={36} y={12} width={18} height={10} rx={4} fill="none" stroke={C.teal} strokeWidth={4} />
      <Path d="M38 62L45 54 52 62M45 55V72" stroke={C.white} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.85} />
    </>
  )),
  'shoe-rack': art(120, 90, (c) => (
    <>
      <Shadow c={c} cx={60} cy={86} rx={54} />
      <Rect x={8} y={14} width={8} height={70} rx={3} fill={C.wood} />
      <Rect x={104} y={14} width={8} height={70} rx={3} fill={C.wood} />
      {[30, 56, 80].map((y) => (
        <Rect key={y} x={8} y={y} width={104} height={6} rx={3} fill={C.woodLight} />
      ))}
      <ShoePair x={24} y={30} s={0.6} color={C.terracotta} />
      <ShoePair x={66} y={30} s={0.6} color={C.indigo} />
      <ShoePair x={44} y={56} s={0.6} color={C.leafDark} />
    </>
  )),
  ball: art(80, 80, (c) => (
    <>
      <Shadow c={c} cx={40} cy={74} rx={26} />
      <Circle cx={40} cy={40} r={30} fill={C.coral} />
      <Path d="M10 40Q40 28 70 40" stroke={C.white} strokeWidth={6} fill="none" />
      <Path d="M40 10Q30 40 40 70" stroke={C.lemon} strokeWidth={6} fill="none" />
      <Circle cx={30} cy={28} r={7} fill={C.white} opacity={0.35} />
    </>
  )),
  blocks: art(90, 80, (c) => (
    <>
      <Shadow c={c} cx={45} cy={75} rx={40} />
      <Rect x={8} y={44} width={32} height={30} rx={4} fill={C.sky} />
      <Rect x={44} y={44} width={32} height={30} rx={4} fill={C.lemon} />
      <Rect x={26} y={12} width={32} height={30} rx={4} fill={C.leafLight} />
      <Path d="M18 52H30L24 66Z" fill={C.white} opacity={0.8} />
      <Circle cx={60} cy={59} r={7} fill={C.white} opacity={0.8} />
      <Path d={star8Path(42, 27, 8)} fill={C.white} opacity={0.8} />
    </>
  )),
  'toy-car': art(100, 70, (c) => (
    <>
      <Shadow c={c} cx={50} cy={64} rx={42} />
      <Path d="M8 46Q8 34 20 32L30 18H66L80 32Q92 34 92 46V52H8Z" fill={C.tealMid} />
      <Path d="M34 22H48V32H28ZM52 22H64L74 32H52Z" fill={C.skyPale} />
      <Circle cx={28} cy={54} r={10} fill={C.ink} />
      <Circle cx={28} cy={54} r={4} fill={C.grey} />
      <Circle cx={72} cy={54} r={10} fill={C.ink} />
      <Circle cx={72} cy={54} r={4} fill={C.grey} />
      <Rect x={84} y={38} width={8} height={5} rx={2} fill={C.lemon} />
    </>
  )),
  shirt: art(100, 90, (c) => (
    <>
      <Shadow c={c} cx={50} cy={86} rx={36} />
      <Path d="M34 10L10 24 18 42 28 38V84H72V38L82 42 90 24 66 10Q58 20 50 20 42 20 34 10Z" fill={C.sky} />
      <Path d="M34 10Q42 22 50 22 58 22 66 10" stroke={C.waterDeep} strokeWidth={3} fill="none" />
      <Path d="M50 22V84" stroke={C.waterDeep} strokeWidth={1.5} opacity={0.4} />
      <Circle cx={50} cy={40} r={2.4} fill={C.white} />
      <Circle cx={50} cy={54} r={2.4} fill={C.white} />
      <Circle cx={50} cy={68} r={2.4} fill={C.white} />
    </>
  )),
  socks: art(90, 90, (c) => (
    <>
      <Shadow c={c} cx={45} cy={86} rx={34} />
      <Path d="M18 8H38V54Q38 62 46 66L54 72Q60 80 52 84 46 88 38 82L22 70Q18 66 18 58Z" fill={C.lilac} />
      <Rect x={18} y={8} width={20} height={9} fill={C.purple} />
      <Path d="M48 12H66V52Q66 60 74 64L80 68Q86 76 78 80 72 84 64 78L52 68Q48 64 48 56Z" fill={C.pinkPale} />
      <Rect x={48} y={12} width={18} height={9} fill={C.rose} />
    </>
  )),
  'paper-ball': art(80, 80, (c) => (
    <>
      <Shadow c={c} cx={40} cy={72} rx={26} />
      <Path d="M14 40L20 18 40 10 60 16 68 38 60 62 38 68 18 60Z" fill={C.marble} />
      <Path d="M20 18L36 34 40 10M36 34L68 38M36 34L38 68M36 34L18 60" stroke={C.greyLight} strokeWidth={2.4} fill="none" />
      <Path d="M24 46L30 50M48 22L54 26" stroke={C.grey} strokeWidth={1.6} />
    </>
  )),
  'apple-core': art(70, 90, (c) => (
    <>
      <Shadow c={c} cx={35} cy={86} rx={20} />
      <Path d="M22 14Q36 8 48 14Q40 30 42 46Q40 62 48 76Q36 84 22 76Q30 62 28 46Q30 30 22 14Z" fill={C.cream} />
      <Path d="M22 14Q14 12 14 20Q22 24 26 18ZM48 14Q56 12 56 20Q48 24 44 18ZM22 76Q14 78 15 70Q22 68 26 72ZM48 76Q56 78 55 70Q48 68 44 72Z" fill={C.berry} />
      <Ellipse cx={35} cy={40} rx={2} ry={4} fill={C.woodDark} />
      <Ellipse cx={35} cy={52} rx={2} ry={4} fill={C.woodDark} />
      <Path d="M35 12Q36 4 40 2" stroke={C.wood} strokeWidth={3} strokeLinecap="round" fill="none" />
    </>
  )),
  shoes: art(110, 70, (c) => (
    <>
      <Shadow c={c} cx={55} cy={64} rx={48} />
      <ShoePair x={8} y={8} s={1} color={C.terracotta} />
    </>
  )),
} satisfies Record<string, ArtDef>;

/** A pair of shoes (side view) in a 94 × 50 box at scale 1. */
function ShoePair({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  const shoe = (dx: number) => (
    <G key={dx} transform={`translate(${dx} 0)`}>
      <Path d="M2 34Q2 18 10 14H24Q28 24 40 26Q48 28 48 36V40H2Z" fill={color} />
      <Rect x={0} y={38} width={50} height={7} rx={3} fill={C.ink} opacity={0.8} />
      <Path d="M14 18L20 24M18 16L24 22" stroke={C.white} strokeWidth={1.6} opacity={0.7} />
    </G>
  );
  return <G transform={`translate(${x} ${y}) scale(${s})`}>{[shoe(0), shoe(42)]}</G>;
}

// ---------------------------------------------------------------------------------------------------------------

// Return the trust: places and borrowed things; speech bubbles

/** Speech bubble (90 × 70) with a tail at the lower left. */
function Bubble({ fill, stroke, children }: { fill: string; stroke: string; children?: ReactNode }) {
  return (
    <G>
      <Path d="M14 8H76Q84 8 84 16V46Q84 54 76 54H34L18 66 22 54H14Q6 54 6 46V16Q6 8 14 8Z" fill={fill} stroke={stroke} strokeWidth={3} strokeLinejoin="round" />
      {children}
    </G>
  );
}

/** Small closed book (sign on the library). */
function BookSign({ x, y }: { x: number; y: number }) {
  return (
    <G transform={`translate(${x} ${y})`}>
      <Rect x={0} y={0} width={20} height={14} rx={2} fill={C.teal} />
      <Rect x={9} y={0} width={2} height={14} fill={C.gold} />
    </G>
  );
}

const trust = {
  library: art(120, 100, (c) => (
    <>
      <Shadow c={c} cx={60} cy={96} rx={56} />
      <Rect x={10} y={88} width={100} height={8} rx={2} fill={dk(c, C.stoneLight)} />
      <Rect x={16} y={40} width={88} height={48} fill={dk(c, C.marble)} />
      <Path d="M8 42L60 10 112 42Z" fill={dk(c, C.stonePale)} />
      <Path d="M20 38L60 16 100 38Z" fill={dk(c, C.marble)} />
      <BookSign x={50} y={22} />
      {[22, 40, 74, 92].map((x) => (
        <Rect key={x} x={x} y={44} width={7} height={44} rx={2} fill={dk(c, C.stonePale)} />
      ))}
      <Path d="M52 88V62Q60 54 68 62V88Z" fill={C.wood} />
      {c.dark && <Path d="M54 86V63Q60 57 66 63V86Z" fill={C.goldLight} opacity={0.45} />}
    </>
  )),
  school: art(120, 100, (c) => (
    <>
      <Shadow c={c} cx={60} cy={96} rx={56} />
      <Rect x={10} y={40} width={100} height={54} rx={3} fill={dk(c, C.terracotta)} />
      <Rect x={44} y={20} width={32} height={74} rx={3} fill={dk(c, C.coral)} />
      <Path d="M40 22L60 6 80 22Z" fill={dk(c, C.berry)} />
      <Circle cx={60} cy={36} r={9} fill={C.cream} />
      <Path d="M60 30V36L64 39" stroke={C.ink} strokeWidth={2} strokeLinecap="round" fill="none" />
      {[16, 28, 84, 96].map((x) => (
        <G key={x}>
          <Rect x={x} y={52} width={9} height={12} rx={1.5} fill={c.dark ? C.goldLight : C.skyPale} />
          <Rect x={x} y={72} width={9} height={12} rx={1.5} fill={c.dark ? C.goldLight : C.skyPale} />
        </G>
      ))}
      <Rect x={52} y={68} width={16} height={26} rx={2} fill={C.woodDark} />
    </>
  )),
  ladder: art(70, 110, (c) => (
    <>
      <Shadow c={c} cx={35} cy={106} rx={28} />
      <Path d="M14 104L22 6M56 104L48 6" stroke={C.woodLight} strokeWidth={7} strokeLinecap="round" />
      {[22, 40, 58, 76, 94].map((y) => (
        <Path key={y} d={`M${21 - (y - 6) * 0.08} ${y}H${49 + (y - 6) * 0.08}`} stroke={C.wood} strokeWidth={5} strokeLinecap="round" />
      ))}
    </>
  )),
  umbrella: art(90, 100, (c) => (
    <>
      <Shadow c={c} cx={45} cy={96} rx={20} />
      <Path d="M6 44Q8 8 45 6 82 8 84 44Q76 38 66 44 56 38 45 44 34 38 24 44 14 38 6 44Z" fill={C.purple} />
      <Path d="M45 6Q30 20 24 44M45 6Q60 20 66 44" stroke={C.lilac} strokeWidth={2} fill="none" />
      <Path d="M45 44V84Q45 92 37 92Q31 92 31 86" stroke={C.woodDark} strokeWidth={4} strokeLinecap="round" fill="none" />
    </>
  )),
  'quiet-bubble': art(90, 70, () => (
    <Bubble fill={C.tealPale} stroke={C.teal}>
      {[30, 45, 60].map((x) => (
        <Circle key={x} cx={x} cy={31} r={4.5} fill={C.teal} />
      ))}
    </Bubble>
  )),
  'salam-bubble': art(90, 70, () => (
    <Bubble fill={C.goldPale} stroke={C.goldDeep}>
      <Path d={star8Path(45, 31, 14)} fill={C.gold} />
      <Path d={star8Path(45, 31, 6)} fill={C.cream} />
    </Bubble>
  )),
  'secret-bubble': art(90, 70, () => (
    <Bubble fill={C.pinkPale} stroke={C.plum}>
      <Rect x={33} y={26} width={24} height={18} rx={3} fill={C.plum} />
      <Path d="M38 26V20Q45 12 52 20V26" stroke={C.plum} strokeWidth={4} fill="none" />
      <Circle cx={45} cy={34} r={2.6} fill={C.pinkPale} />
    </Bubble>
  )),
} satisfies Record<string, ArtDef>;

// ---------------------------------------------------------------------------------------------------------------
// Gratitude jar

const heartPath = (x: number, y: number, s: number) =>
  `M${x} ${y + s * 0.9}C${x - s * 1.4} ${y} ${x - s * 0.9} ${y - s * 0.9} ${x} ${y - s * 0.3}C${x + s * 0.9} ${y - s * 0.9} ${x + s * 1.4} ${y} ${x} ${y + s * 0.9}Z`;

/** A folded note with a heart (centre x, y; s = scale). */
function Note({ x, y, s = 1, rot = 0, color = C.cream, heart = C.rose }: { x: number; y: number; s?: number; rot?: number; color?: string; heart?: string }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <Rect x={-12} y={-9} width={24} height={18} rx={2} fill={color} />
      <Path d="M-12-9L0 0 12-9" stroke={C.sandDeep} strokeWidth={1} fill="none" opacity={0.6} />
      <Path d={heartPath(0, 2, 4.2)} fill={heart} />
    </G>
  );
}

const gratitude = {
  'gratitude-jar': art(100, 120, (c) => (
    <>
      <Shadow c={c} cx={50} cy={115} rx={38} />
      <Path d="M26 24H74V32C88 40 92 56 92 74 92 100 78 112 50 112S8 100 8 74C8 56 12 40 26 32Z" fill={c.dark ? '#3A4A7A' : '#DDF0F6'} opacity={0.92} />
      <Note x={30} y={96} rot={-12} />
      <Note x={56} y={100} rot={8} color={C.goldPale} heart={C.berry} />
      <Note x={74} y={86} rot={-6} color={C.tealPale} heart={C.teal} />
      <Note x={44} y={78} rot={14} color={C.pinkPale} />
      <Note x={64} y={66} rot={-16} color={C.cream} heart={C.coral} />
      <Path d="M18 60C18 50 22 42 30 38" stroke={C.white} strokeWidth={4} strokeLinecap="round" opacity={0.65} fill="none" />
      <Rect x={22} y={14} width={56} height={12} rx={4} fill={C.coral} />
      <Path d="M50 14C44 4 34 6 38 12ZM50 14C56 4 66 6 62 12Z" fill={C.gold} />
      <Glow c={c} k="jarglow" cx={50} cy={80} r={46} color={C.goldPale} opacity={c.dark ? 0.35 : 0.2} />
    </>
  )),
  'note-heart': art(60, 50, () => <Note x={30} y={25} s={2} />),
} satisfies Record<string, ArtDef>;

// ---------------------------------------------------------------------------------------------------------------
// Calm the storm: skies, calm and angry reactions

/** Soft round cloud (centre x, y; r = size). */
function Puff({ x, y, r, fill, shade }: { x: number; y: number; r: number; fill: string; shade: string }) {
  return (
    <G>
      <Ellipse cx={x} cy={y + r * 0.35} rx={r * 1.9} ry={r * 0.7} fill={shade} />
      <Circle cx={x - r * 0.9} cy={y + r * 0.1} r={r * 0.75} fill={fill} />
      <Circle cx={x} cy={y - r * 0.25} r={r} fill={fill} />
      <Circle cx={x + r * 0.95} cy={y + r * 0.05} r={r * 0.8} fill={fill} />
      <Rect x={x - r * 1.6} y={y} width={r * 3.2} height={r * 0.75} rx={r * 0.37} fill={fill} />
    </G>
  );
}

const storm = {
  'calm-sky': art(240, 320, (c) => (
    <>
      <Rect x={0} y={0} width={240} height={320} fill={c.dark ? '#232861' : '#BFE6F5'} />
      <Rect x={0} y={200} width={240} height={120} fill={c.dark ? '#2E3380' : '#E6F5F2'} opacity={0.8} />
      <Glow c={c} k="calmsun" cx={180} cy={60} r={70} color={c.dark ? C.goldPale : '#FFF4C4'} opacity={c.dark ? 0.3 : 0.9} />
      {c.dark ? <Circle cx={180} cy={60} r={18} fill={C.goldPale} /> : <Circle cx={180} cy={60} r={22} fill={C.goldLight} />}
      <Puff x={60} y={90} r={16} fill={c.dark ? '#3A4590' : C.white} shade={c.dark ? '#2B3270' : '#DCE8F2'} />
      <Puff x={150} y={150} r={11} fill={c.dark ? '#3A4590' : C.white} shade={c.dark ? '#2B3270' : '#DCE8F2'} />
      <Path d="M0 290Q60 270 120 285T240 280V320H0Z" fill={c.dark ? '#24543F' : C.leafPale} />
    </>
  )),
  'storm-sky': art(240, 320, (c) => (
    <>
      <Rect x={0} y={0} width={240} height={320} fill={c.dark ? '#151832' : '#7E86A6'} />
      <Puff x={50} y={60} r={26} fill={c.dark ? '#2A2D52' : '#5D6485'} shade={c.dark ? '#1E2142' : '#4C5272'} />
      <Puff x={170} y={50} r={30} fill={c.dark ? '#2F3360' : '#666E90'} shade={c.dark ? '#1E2142' : '#4C5272'} />
      <Puff x={120} y={120} r={22} fill={c.dark ? '#2A2D52' : '#5D6485'} shade={c.dark ? '#1E2142' : '#4C5272'} />
      <Path d="M150 80L134 118H148L136 152 166 108H150L160 80Z" fill={C.goldLight} />
      {Array.from({ length: 22 }, (_, i) => {
        const x = 12 + ((i * 47) % 220);
        const y = 140 + ((i * 61) % 150);
        return <Path key={i} d={`M${x} ${y}l-5 12`} stroke={C.waterLight} strokeWidth={2} strokeLinecap="round" opacity={0.7} />;
      })}
    </>
  )),
  chair: art(80, 100, (c) => (
    <>
      <Shadow c={c} cx={40} cy={96} rx={30} />
      <Rect x={16} y={8} width={48} height={44} rx={8} fill={C.woodLight} />
      <Rect x={22} y={14} width={36} height={32} rx={5} fill={C.tealMid} />
      <Rect x={10} y={50} width={60} height={12} rx={5} fill={C.wood} />
      <Rect x={14} y={60} width={7} height={34} rx={3} fill={C.woodDark} />
      <Rect x={59} y={60} width={7} height={34} rx={3} fill={C.woodDark} />
      <Path d={star8Path(40, 30, 8)} fill={C.goldLight} opacity={0.8} />
    </>
  )),
  'shout-bubble': art(90, 70, () => (
    <Path d="M10 10L24 18 30 4 42 16 54 2 60 18 78 8 74 26 88 32 74 40 82 56 62 50 56 66 46 52 32 64 30 48 12 52 20 38 2 30 18 24Z" fill={C.coral} stroke={C.berry} strokeWidth={3} strokeLinejoin="round" />
  )),
  'mean-bubble': art(90, 70, () => (
    <Bubble fill={C.greyLight} stroke={C.greyDark}>
      <Path d="M22 30Q28 18 34 30T46 30T58 30T70 30" stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d="M30 40L60 22" stroke={C.berry} strokeWidth={3} strokeLinecap="round" />
    </Bubble>
  )),
  'slam-door': art(90, 100, (c) => (
    <>
      <Shadow c={c} cx={45} cy={96} rx={34} />
      <Rect x={22} y={8} width={46} height={86} rx={3} fill={C.woodDark} />
      <Path d="M26 12H64V92H26Z" fill={C.terracotta} />
      <Rect x={32} y={20} width={26} height={26} rx={2} fill="none" stroke={C.berry} strokeWidth={2} />
      <Rect x={32} y={56} width={26} height={26} rx={2} fill="none" stroke={C.berry} strokeWidth={2} />
      <Circle cx={58} cy={52} r={3} fill={C.gold} />
      <Path d="M76 30L86 24M78 50H88M76 70L86 76M14 30L4 24M12 50H2M14 70L4 76" stroke={C.berry} strokeWidth={3} strokeLinecap="round" />
    </>
  )),
  'broken-cup': art(90, 80, (c) => (
    <>
      <Shadow c={c} cx={45} cy={74} rx={36} />
      <Path d="M14 30H40L36 46 42 58 34 70H22Q14 60 14 46Z" fill={C.tealMid} />
      <Path d="M48 34H74V46Q74 62 64 70H50L56 58 46 48Z" fill={C.tealMid} />
      <Path d="M74 40Q86 40 84 50 82 58 72 58" stroke={C.teal} strokeWidth={4} fill="none" />
      <Path d="M10 72L16 66M78 74L72 68M44 72L46 64" stroke={C.greyDark} strokeWidth={2} strokeLinecap="round" />
    </>
  )),
} satisfies Record<string, ArtDef>;

// ---------------------------------------------------------------------------------------------------------------
// Home: a room with a kitchen corner (no people) and the things to help with

const home = {
  'home-room': art(400, 300, (c) => {
    const wall = dk(c, '#F6E7CF', 0.45);
    const wallShade = dk(c, '#EBD5B3', 0.45);
    return (
      <>
        <Rect x={0} y={0} width={400} height={300} fill={wall} />
        <Rect x={0} y={0} width={400} height={18} fill={wallShade} />
        {/* tiled border */}
        {Array.from({ length: 20 }, (_, i) => (
          <Path key={i} d={star8Path(10 + i * 20, 9, 5)} fill={dk(c, C.teal, 0.4)} opacity={0.35} />
        ))}
        {/* window with arch */}
        <Path d="M40 150V70Q40 36 80 34Q120 36 120 70V150Z" fill={dk(c, C.woodLight)} />
        <Path d="M48 144V72Q48 44 80 42Q112 44 112 72V144Z" fill={c.dark ? '#2E3380' : '#BFE6F5'} />
        {c.dark ? <Circle cx={96} cy={64} r={7} fill={C.goldPale} /> : <Circle cx={96} cy={64} r={9} fill={C.goldLight} />}
        <Path d="M80 42V144M48 100H112" stroke={dk(c, C.woodLight)} strokeWidth={4} />
        <Rect x={34} y={148} width={92} height={8} rx={3} fill={dk(c, C.wood)} />
        {/* framed star ornament */}
        <Rect x={168} y={46} width={54} height={54} rx={4} fill={dk(c, C.woodLight)} />
        <Rect x={174} y={52} width={42} height={42} rx={2} fill={dk(c, C.cream)} />
        <Path d={star8Path(195, 73, 15)} fill={dk(c, C.teal)} />
        <Path d={star8Path(195, 73, 7)} fill={C.gold} />
        {/* kitchen corner */}
        <Rect x={262} y={40} width={124} height={40} rx={4} fill={dk(c, C.tealMid)} />
        <Path d="M324 40V80" stroke={dk(c, C.teal)} strokeWidth={2} />
        <Rect x={256} y={150} width={140} height={14} rx={3} fill={dk(c, C.stonePale)} />
        <Rect x={260} y={164} width={132} height={70} fill={dk(c, C.tealMid)} />
        <Path d="M304 164V234M348 164V234" stroke={dk(c, C.teal)} strokeWidth={2} />
        <Circle cx={296} cy={200} r={2.6} fill={C.gold} />
        <Circle cx={312} cy={200} r={2.6} fill={C.gold} />
        <Circle cx={356} cy={200} r={2.6} fill={C.gold} />
        <Path d="M372 150V120Q372 110 382 110" stroke={C.grey} strokeWidth={4} fill="none" />
        {/* floor and rug */}
        <Rect x={0} y={234} width={400} height={66} fill={dk(c, C.woodPale, 0.4)} />
        {[250, 268, 286].map((y) => (
          <Path key={y} d={`M0 ${y}H400`} stroke={dk(c, C.woodLight, 0.4)} strokeWidth={1.4} opacity={0.5} />
        ))}
        <Ellipse cx={170} cy={268} rx={110} ry={22} fill={dk(c, C.berry)} />
        <Ellipse cx={170} cy={268} rx={92} ry={16} fill="none" stroke={C.gold} strokeWidth={3} opacity={0.8} />
        {/* sofa */}
        <Rect x={140} y={170} width={110} height={30} rx={10} fill={dk(c, C.teal)} />
        <Rect x={132} y={190} width={126} height={36} rx={10} fill={dk(c, C.tealMid)} />
        <Rect x={146} y={200} width={46} height={18} rx={6} fill={dk(c, C.tealLight)} />
        <Rect x={198} y={200} width={46} height={18} rx={6} fill={dk(c, C.tealLight)} />
        <Rect x={138} y={224} width={8} height={12} rx={2} fill={C.woodDark} />
        <Rect x={244} y={224} width={8} height={12} rx={2} fill={C.woodDark} />
        {/* door */}
        <Rect x={0} y={150} width={26} height={86} fill={dk(c, C.wood)} />
      </>
    );
  }),
  'shopping-bags': art(100, 90, (c) => (
    <>
      <Shadow c={c} cx={50} cy={86} rx={44} />
      <Path d="M12 34H52L56 84H8Z" fill={C.sandLight} />
      <Path d="M22 34Q22 16 32 16Q42 16 42 34" stroke={C.sandDark} strokeWidth={3.5} fill="none" />
      <Circle cx={24} cy={30} r={8} fill={C.berry} />
      <Rect x={34} y={20} width={10} height={16} rx={2} fill={C.lemon} />
      <Path d="M46 40H90L94 86H42Z" fill={C.tealMid} />
      <Path d="M56 40Q56 22 68 22Q80 22 80 40" stroke={C.teal} strokeWidth={3.5} fill="none" />
      <Ellipse cx={62} cy={36} rx={7} ry={9} fill={C.leafLight} />
      <Path d={star8Path(68, 64, 9)} fill={C.goldLight} opacity={0.8} />
    </>
  )),
  dishes: art(100, 80, (c) => (
    <>
      <Shadow c={c} cx={50} cy={76} rx={44} />
      {[60, 52, 44].map((y, i) => (
        <G key={y}>
          <Ellipse cx={44} cy={y + 4} rx={36} ry={8} fill={C.tealMid} />
          <Ellipse cx={44} cy={y} rx={36} ry={8} fill={i === 2 ? C.cream : C.ivory} />
        </G>
      ))}
      <Circle cx={34} cy={42} r={3} fill={C.terracotta} opacity={0.6} />
      <Circle cx={52} cy={40} r={2} fill={C.leaf} opacity={0.6} />
      <Path d="M70 20H92L88 50H74Z" fill={C.sky} />
      <Path d="M92 26Q100 28 98 36 96 42 90 42" stroke={C.waterDeep} strokeWidth={3} fill="none" />
      <Path d="M20 30L30 12M28 32L40 14" stroke={C.grey} strokeWidth={3} strokeLinecap="round" />
    </>
  )),
  'game-pad': art(100, 70, (c) => (
    <>
      <Shadow c={c} cx={50} cy={64} rx={40} />
      <Path d="M20 16H80Q96 16 96 40Q96 62 82 62Q72 62 66 50H34Q28 62 18 62Q4 62 4 40Q4 16 20 16Z" fill={C.indigo} />
      <Path d="M22 30V46M14 38H30" stroke={C.white} strokeWidth={5} strokeLinecap="round" />
      <Circle cx={72} cy={32} r={5} fill={C.coral} />
      <Circle cx={82} cy={42} r={5} fill={C.lemon} />
    </>
  )),
} satisfies Record<string, ArtDef>;

// ---------------------------------------------------------------------------------------------------------------

export const akhlaq = {
  ...home,
  ...storm,
  ...tidy,
  ...trust,
  ...gratitude,
} satisfies Record<string, ArtDef>;
