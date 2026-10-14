import { Circle, Ellipse, G, Path } from 'react-native-svg';

import { art, leafPath, Shadow, star8Path, type ArtDef, type Ctx } from '../kit';
import { C, shade } from '../palette';

function BowlBack({ cx, y, rx, inner }: { cx: number; y: number; rx: number; inner: string }) {
  return (
    <G>
      <Ellipse cx={cx} cy={y} rx={rx} ry={rx * 0.22} fill={C.teal} />
      <Ellipse cx={cx} cy={y + 1} rx={rx * 0.9} ry={rx * 0.17} fill={inner} />
    </G>
  );
}

function BowlFront({ c, cx, y, rx, h }: { c: Ctx; cx: number; y: number; rx: number; h: number }) {
  return (
    <G>
      <Shadow c={c} cx={cx} cy={y + h + 2} rx={rx * 0.7} />
      <Path d={`M${cx - rx} ${y}Q${cx - rx * 0.96} ${y + h} ${cx - rx * 0.3} ${y + h}H${cx + rx * 0.3}Q${cx + rx * 0.96} ${y + h} ${cx + rx} ${y}Q${cx} ${y + rx * 0.3} ${cx - rx} ${y}Z`} fill={C.tealMid} />
      <Path d={`M${cx + rx * 0.4} ${y + rx * 0.18}Q${cx + rx * 0.7} ${y + h * 0.6} ${cx + rx * 0.3} ${y + h}Q${cx + rx * 0.96} ${y + h} ${cx + rx} ${y}Q${cx + rx * 0.8} ${y + rx * 0.12} ${cx + rx * 0.4} ${y + rx * 0.18}Z`} fill={C.teal} opacity={0.6} />
      <Path d={`M${cx - rx * 0.86} ${y + h * 0.42}Q${cx} ${y + h * 0.62} ${cx + rx * 0.86} ${y + h * 0.42}`} stroke={C.gold} strokeWidth={2.4} fill="none" />
      <Path d={star8Path(cx, y + h * 0.75, 3.2)} fill={C.goldLight} />
    </G>
  );
}

function Glass({ c, liquid, cream = false }: { c: Ctx; liquid: string; cream?: boolean }) {
  return (
    <G>
      <Shadow c={c} cx={50} cy={86} rx={22} />
      <Path d="M28 12H72L66 80Q65 86 58 86H42Q35 86 34 80Z" fill={c.dark ? '#3A4A7A' : '#E3F1F7'} opacity={0.95} />
      <Path d="M31 36H69L66 80Q65 86 58 86H42Q35 86 34 80Z" fill={liquid} />
      <Ellipse cx={50} cy={36} rx={19} ry={3.4} fill={cream ? C.white : shade(liquid, -0.1)} opacity={cream ? 1 : 0.6} />
      <Path d="M36 18 40 78" stroke={C.white} strokeWidth={4} strokeLinecap="round" opacity={0.55} />
      {!c.dark && <Path d="M28 12H72L66 80Q65 86 58 86H42Q35 86 34 80Z" fill="none" stroke="#B9D3E0" strokeWidth={1.4} />}
    </G>
  );
}

export const food = {
  dates: art(100, 80, (c) => (
    <>
      <Shadow c={c} cx={50} cy={72} rx={44} ry={5} />
      <Ellipse cx={50} cy={56} rx={46} ry={16} fill={C.goldDeep} />
      <Ellipse cx={50} cy={54} rx={46} ry={16} fill={C.goldLight} />
      <Ellipse cx={50} cy={54} rx={36} ry={11} fill={C.goldPale} />
      {[[30, 48, -30], [44, 44, -10], [58, 46, 20], [70, 50, 40], [38, 56, -50], [52, 56, 10], [64, 58, 60], [46, 36, 80]].map(([x, y, a], i) => (
        <G key={i} transform={`rotate(${a} ${x} ${y})`}>
          <Ellipse cx={x} cy={y} rx={10} ry={6.2} fill={i % 2 ? '#7A3B1F' : '#8A4520'} />
          <Ellipse cx={x - 3} cy={y - 2.4} rx={4} ry={1.6} fill={C.white} opacity={0.3} />
        </G>
      ))}
    </>
  )),

  water: art(100, 90, (c) => <Glass c={c} liquid={C.waterLight} />),

  milk: art(100, 90, (c) => <Glass c={c} liquid={C.white} cream />),

  soup: art(100, 90, (c) => (
    <>
      <Path d="M36 24C30 16 40 12 34 4M50 22C44 14 54 10 48 2M64 24C58 16 68 12 62 4" stroke={c.dark ? C.greyLight : C.stoneLight} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.8} />
      <BowlBack cx={50} y={40} rx={42} inner={C.orange} />
      <Circle cx={38} cy={41} r={3} fill={C.leafLight} />
      <Circle cx={56} cy={40} r={2.4} fill={C.lemon} />
      <Circle cx={64} cy={42} r={2.4} fill={C.leafLight} />
      <BowlFront c={c} cx={50} y={40} rx={42} h={38} />
    </>
  )),

  bread: art(100, 80, (c) => (
    <>
      <Shadow c={c} cx={50} cy={72} rx={44} ry={5} />
      <Ellipse cx={50} cy={62} rx={42} ry={12} fill={C.sandDark} />
      <Ellipse cx={50} cy={58} rx={42} ry={12} fill="#E2B577" />
      <Ellipse cx={46} cy={46} rx={40} ry={12} fill={C.sandDark} />
      <Ellipse cx={46} cy={42} rx={40} ry={12} fill="#EBC58E" />
      <Ellipse cx={46} cy={40} rx={30} ry={8} fill="#F2D4A2" />
      {[[30, 38], [44, 36], [58, 40], [38, 44], [54, 46], [66, 36]].map(([x, y], i) => (
        <Ellipse key={i} cx={x} cy={y} rx={3} ry={1.6} fill={C.woodLight} opacity={0.6} />
      ))}
      <Path d="M70 30C76 22 86 22 92 28 94 34 88 40 80 38Z" fill="#E2B577" />
      <Path d="M76 30C80 27 86 27 88 30" stroke={C.woodLight} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </>
  )),

  rice: art(100, 90, (c) => (
    <>
      <BowlBack cx={50} y={40} rx={40} inner={C.white} />
      <Path d="M18 40C20 22 36 14 50 14S80 22 82 40Z" fill={C.white} />
      {!c.dark && <Path d="M18 40C20 22 36 14 50 14S80 22 82 40" fill="none" stroke="#DDD6C8" strokeWidth={1.4} />}
      {[[36, 26], [48, 22], [60, 28], [42, 34], [56, 34], [30, 34], [68, 34], [50, 30]].map(([x, y], i) => (
        <Ellipse key={i} cx={x} cy={y} rx={2.6} ry={1.2} fill="#E8E1D2" transform={`rotate(${i * 37} ${x} ${y})`} />
      ))}
      <Path d={leafPath(54, 18, 12, 4, -40)} fill={C.leafLight} />
      <BowlFront c={c} cx={50} y={40} rx={40} h={38} />
    </>
  )),

  'fruit-bowl': art(110, 90, (c) => (
    <>
      <BowlBack cx={55} y={44} rx={46} inner={shade(C.teal, 0.1)} />
      <Circle cx={36} cy={34} r={14} fill={c.bloom(C.berry)} />
      <Path d="M30 22 36 20 42 22 36 24Z" fill={shade(C.berry, 0.3)} />
      <Ellipse cx={72} cy={32} rx={15} ry={12} fill={C.lemon} />
      <Path d="M54 30C54 18 62 12 70 16" stroke={C.woodDark} strokeWidth={2} fill="none" />
      {[[50, 22], [56, 24], [53, 30], [59, 30], [47, 28]].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={5.4} fill={C.purple} />
      ))}
      <Circle cx={56} cy={38} r={13} fill={C.orange} />
      <Path d={leafPath(56, 25, 12, 4, -30)} fill={C.leaf} />
      <Circle cx={30} cy={30} r={3} fill={C.white} opacity={0.4} />
      <BowlFront c={c} cx={55} y={44} rx={46} h={36} />
    </>
  )),

  olives: art(100, 90, (c) => (
    <>
      <BowlBack cx={50} y={44} rx={40} inner={C.oliveDark} />
      <Path d={leafPath(60, 30, 30, 6, -40)} fill={C.olive} />
      <Path d={leafPath(60, 30, 26, 5, -80)} fill={C.oliveDark} />
      <Path d={leafPath(60, 30, 28, 5.5, -10)} fill="#A9BE84" />
      {[[30, 36], [40, 32], [50, 36], [60, 38], [70, 34], [36, 40], [56, 40], [46, 40]].map(([x, y], i) => (
        <G key={i}>
          <Ellipse cx={x} cy={y} rx={6} ry={4.6} fill={i % 3 === 0 ? C.olive : i % 3 === 1 ? '#4A3B52' : C.oliveDark} />
          <Circle cx={x - 2} cy={y - 1.6} r={1.2} fill={C.white} opacity={0.45} />
        </G>
      ))}
      <BowlFront c={c} cx={50} y={44} rx={40} h={34} />
    </>
  )),
} satisfies Record<string, ArtDef>;
