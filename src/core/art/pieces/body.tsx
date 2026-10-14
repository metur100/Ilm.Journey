import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { art, dropPath, Glow, Shadow, type ArtDef, type Ctx } from '../kit';
import { C, shade } from '../palette';

/**
 * Neutral wudu pictograms and prayer-position silhouettes. No facial features, no expressions; the figure tone is
 * `c.tint` (Art prop `tint`, default warm sand) so a screen can recolour them.
 */

const WATER = C.water;

function Drops({ pts }: { pts: [number, number, number][] }) {
  return (
    <G>
      {pts.map(([x, y, h], i) => (
        <Path key={i} d={dropPath(x, y, h)} fill={i % 2 ? C.waterLight : WATER} />
      ))}
    </G>
  );
}

/** Profile head facing right (no features). */
function ProfileHead({ c }: { c: Ctx }) {
  return (
    <G>
      <Path d="M34 98C34 86 30 80 26 72 18 58 18 36 30 24 42 12 64 12 74 24 80 32 80 40 80 44L88 56C89 58 88 60 85 60H82C82 64 82 66 80 68 81 70 81 72 79 74 80 78 78 82 72 82H62C60 88 60 92 62 98Z" fill={c.tint} />
      <Path d="M30 24C42 12 64 12 74 24 70 22 62 20 54 22 44 24 36 32 32 44 30 56 32 66 36 74 30 78 26 72 26 72 18 58 18 36 30 24Z" fill={shade(c.tint, 0.18)} />
    </G>
  );
}

function Palm({ c, x, y, flip = false, color }: { c: Ctx; x: number; y: number; flip?: boolean; color?: string }) {
  const col = color ?? c.tint;
  return (
    <G transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <Rect x={-13} y={-34} width={6.5} height={24} rx={3.25} fill={col} />
      <Rect x={-6} y={-40} width={6.5} height={30} rx={3.25} fill={col} />
      <Rect x={1} y={-38} width={6.5} height={28} rx={3.25} fill={col} />
      <Rect x={8} y={-32} width={6} height={22} rx={3} fill={col} />
      <Path d="M-14-16H15V4Q15 14 4 16H-4Q-14 14-14 4Z" fill={col} />
      <Path d="M14-6C20-12 24-14 26-10 26-6 20 2 14 6Z" fill={col} />
      <Rect x={-10} y={14} width={22} height={18} rx={4} fill={col} />
      <Path d="M-6 0Q0 4 8 0" stroke={shade(col, 0.2)} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </G>
  );
}

export const body = {
  hands: art(100, 100, (c) => (
    <>
      <Glow c={c} k="g" cx={50} cy={50} r={48} color={C.waterPale} opacity={c.dark ? 0.25 : 0.55} />
      <Palm c={c} x={30} y={62} flip color={shade(c.tint, 0.1)} />
      <Palm c={c} x={70} y={62} />
      <Drops pts={[[24, 6, 10], [50, 12, 12], [76, 6, 10]]} />
    </>
  )),

  mouth: art(100, 100, (c) => (
    <>
      <ProfileHead c={c} />
      <Glow c={c} k="g" cx={82} cy={71} r={14} color={C.waterLight} opacity={0.9} />
      <Path d="M76 71H86" stroke={shade(c.tint, 0.3)} strokeWidth={2} strokeLinecap="round" />
      <Drops pts={[[94, 62, 8], [96, 76, 7]]} />
    </>
  )),

  nose: art(100, 100, (c) => (
    <>
      <ProfileHead c={c} />
      <Glow c={c} k="g" cx={86} cy={55} r={13} color={C.waterLight} opacity={0.9} />
      <Path d="M82 58Q84 60 86 59" stroke={shade(c.tint, 0.3)} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <Drops pts={[[95, 42, 8], [96, 58, 7]]} />
    </>
  )),

  face: art(100, 100, (c) => (
    <>
      <Path d="M30 100C30 88 38 82 50 82S70 88 70 100Z" fill={shade(c.tint, 0.18)} />
      <Rect x={42} y={70} width={16} height={16} rx={6} fill={shade(c.tint, 0.1)} />
      <Ellipse cx={50} cy={46} rx={26} ry={32} fill={c.tint} />
      <Path d="M24 40C24 22 36 14 50 14S76 22 76 40C70 30 60 26 50 26S30 30 24 40Z" fill={shade(c.tint, 0.18)} />
      <Ellipse cx={22} cy={48} rx={4} ry={8} fill={c.tint} />
      <Ellipse cx={78} cy={48} rx={4} ry={8} fill={c.tint} />
      <Path d="M30 44C28 56 32 68 42 74M70 44C72 56 68 68 58 74" stroke={C.waterLight} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.9} />
      <Path d="M36 36Q50 32 64 36" stroke={C.waterLight} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.9} />
      <Drops pts={[[10, 64, 9], [88, 66, 9], [50, 0, 10]]} />
    </>
  )),

  arms: art(110, 90, (c) => (
    <>
      <Path d="M16 66 70 50" stroke={c.tint} strokeWidth={20} strokeLinecap="round" />
      <Circle cx={16} cy={66} r={11} fill={shade(c.tint, 0.15)} />
      <G transform="translate(86 46) rotate(74) scale(0.62)">
        <Palm c={c} x={0} y={0} />
      </G>
      <Path d="M100 36C90 38 80 40 70 42S30 52 14 56" stroke={C.waterLight} strokeWidth={5} strokeLinecap="round" fill="none" />
      <Path d="M92 40C84 42 76 44 66 46S34 54 20 58" stroke={C.white} strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.7} />
      <Drops pts={[[10, 76, 9], [24, 78, 7], [98, 14, 9]]} />
    </>
  )),

  head: art(100, 100, (c) => (
    <>
      <ProfileHead c={c} />
      <Path d="M26 22C38 6 62 4 78 18" stroke={C.waterLight} strokeWidth={6} strokeLinecap="round" fill="none" />
      <Path d="M74 12 84 22 70 24Z" fill={C.waterLight} />
      <Drops pts={[[18, 8, 9], [50, 0, 7]]} />
    </>
  )),

  ears: art(100, 100, (c) => (
    <>
      <ProfileHead c={c} />
      <Glow c={c} k="g" cx={44} cy={50} r={18} color={C.waterLight} opacity={0.9} />
      <Path d="M38 40C38 34 46 32 50 38 54 44 52 54 48 60 46 64 40 62 40 58 42 54 38 50 38 40Z" fill={shade(c.tint, 0.12)} />
      <Path d="M43 42C45 40 48 42 48 46" stroke={shade(c.tint, 0.32)} strokeWidth={2} strokeLinecap="round" fill="none" />
      <Drops pts={[[16, 36, 9], [14, 56, 7]]} />
    </>
  )),

  feet: art(110, 90, (c) => (
    <>
      <Shadow c={c} cx={55} cy={84} rx={46} />
      <Path d="M14 30C14 18 30 18 30 30V54C30 62 40 64 50 68 56 70 56 82 46 82H18C12 82 10 76 12 68Z" fill={shade(c.tint, 0.12)} />
      <Path d="M62 30C62 18 78 18 78 30V54C78 62 88 64 98 68 104 70 104 82 94 82H66C60 82 58 76 60 68Z" fill={c.tint} />
      <Path d="M8 58Q30 66 52 64M56 58Q78 66 100 64" stroke={C.waterLight} strokeWidth={4} strokeLinecap="round" fill="none" />
      <Drops pts={[[22, 2, 10], [70, 2, 10], [104, 46, 8], [52, 40, 8]]} />
    </>
  )),

  'water-on-hands': art(100, 110, (c) => (
    <>
      <Path d="M2 10C8 6 20 8 30 14L36 22 28 24C20 18 10 16 4 18Z" fill={C.goldDeep} />
      <Path d="M30 22C34 40 40 46 44 56" stroke={C.waterLight} strokeWidth={6} strokeLinecap="round" fill="none" />
      <Path d="M32 24C35 38 40 46 44 54" stroke={C.white} strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.7} />
      <Path d="M14 66C14 60 20 58 26 62L50 76 74 62C80 58 86 60 86 66 86 82 70 96 50 96S14 82 14 66Z" fill={c.tint} />
      <Path d="M50 76 74 62C80 58 86 60 86 66 86 82 70 96 50 96Z" fill={shade(c.tint, 0.12)} />
      <Ellipse cx={50} cy={68} rx={22} ry={7} fill={WATER} />
      <Path d="M36 66Q44 63 52 64" stroke={C.white} strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.7} />
      <Path d="M34 92 24 106M66 92 76 106" stroke={c.tint} strokeWidth={14} strokeLinecap="round" />
      <Drops pts={[[16, 40, 8], [84, 36, 9]]} />
    </>
  )),
} satisfies Record<string, ArtDef>;

/** Prayer mat strip under the poses. */
function Mat({ c }: { c: Ctx }) {
  return (
    <G>
      <Shadow c={c} cx={55} cy={104} rx={50} ry={4} />
      <Rect x={4} y={98} width={102} height={7} rx={3} fill={C.plum} />
      <Rect x={4} y={98} width={102} height={2} rx={1} fill={C.gold} opacity={0.8} />
    </G>
  );
}

const limb = (c: Ctx, d: string, w = 13, far = false) => <Path d={d} stroke={far ? shade(c.tint, 0.16) : c.tint} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />;

export const pose = {
  standing: art(110, 110, (c) => (
    <>
      <Mat c={c} />
      <Path d="M42 32H68L74 96H36Z" fill={c.tint} />
      <Path d="M58 32H68L74 96H60Z" fill={shade(c.tint, 0.12)} />
      <Circle cx={55} cy={18} r={11} fill={c.tint} />
      <Path d="M38 40C38 34 42 30 48 30H62C68 30 72 34 72 40" fill={c.tint} />
      <Rect x={40} y={46} width={30} height={9} rx={4.5} fill={shade(c.tint, 0.22)} />
    </>
  )),

  bowing: art(110, 110, (c) => (
    <>
      <Mat c={c} />
      {limb(c, 'M34 58V96', 14, true)}
      {limb(c, 'M38 58 40 96', 14)}
      {limb(c, 'M36 54H76', 18)}
      <Circle cx={88} cy={54} r={10} fill={c.tint} />
      {limb(c, 'M70 58 46 76', 9, true)}
      {limb(c, 'M74 58 48 78', 9)}
    </>
  )),

  prostrating: art(110, 110, (c) => (
    <>
      <Mat c={c} />
      {limb(c, 'M14 94H40', 12, true)}
      {limb(c, 'M38 92 30 72', 14)}
      {limb(c, 'M30 70 66 84', 17)}
      <Circle cx={80} cy={88} r={9.5} fill={c.tint} />
      {limb(c, 'M62 84 70 94 92 94', 8, true)}
      {limb(c, 'M66 86 74 95 94 95', 8)}
    </>
  )),

  sitting: art(110, 110, (c) => (
    <>
      <Mat c={c} />
      {limb(c, 'M28 92H62', 14, true)}
      {limb(c, 'M30 86H60', 16)}
      {limb(c, 'M34 82 38 44', 18)}
      <Circle cx={40} cy={26} r={11} fill={c.tint} />
      {limb(c, 'M40 50 58 78', 9, true)}
      {limb(c, 'M42 52 62 80', 9)}
    </>
  )),
} satisfies Record<string, ArtDef>;
