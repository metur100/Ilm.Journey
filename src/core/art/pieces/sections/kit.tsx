import { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { art, Lin, Shadow, sparklePath, star8Path, type ArtDef } from '../../kit';
import { C, shade } from '../../palette';

/**
 * `kit.*` – art of the casual game kit (src/core/games/kit): baskets and containers for sorting, path stones,
 * pins and flags for routes and timelines, and small icons for the kit demo games. Owned by the kit author.
 */
export const kit = {
  /** Woven basket, wide opening (SortBins default bin). */
  basket: art(120, 90, (c) => (
    <>
      <Defs>
        <Lin id={c.id('b')} x1={0} y1={0} x2={1} y2={0} stops={[[0, C.sandDark], [0.3, C.sand], [0.7, C.sand], [1, C.sandDark]]} />
        <Lin id={c.id('in')} stops={[[0, shade(C.woodLight, 0.25)], [1, C.woodLight]]} />
      </Defs>
      <Shadow c={c} cx={60} cy={84} rx={46} />
      <Path d="M22 30C22 6 98 6 98 30" stroke={C.sandDark} strokeWidth={7} fill="none" strokeLinecap="round" />
      <Path d="M22 30C22 9 98 9 98 30" stroke={C.sand} strokeWidth={3.4} fill="none" strokeLinecap="round" />
      <Ellipse cx={60} cy={32} rx={52} ry={11} fill={c.url('in')} />
      <Path d="M8 32Q60 50 112 32L102 72Q98 84 84 84H36Q22 84 18 72Z" fill={c.url('b')} />
      {[44, 56, 68].map((y) => (
        <Path key={y} d={`M${10 + (y - 34) * 0.24} ${y}Q60 ${y + 14} ${110 - (y - 34) * 0.24} ${y}`} stroke={C.sandDark} strokeWidth={2.4} fill="none" opacity={0.75} />
      ))}
      {[24, 38, 52, 66, 80, 94].map((x, i) => (
        <Path key={x} d={`M${x} ${40 + (i === 0 || i === 5 ? -2 : 4)}L${x + (x < 60 ? 3 : -3)} 82`} stroke={C.sandDeep} strokeWidth={2} opacity={0.55} />
      ))}
      <Path d="M8 32Q60 50 112 32" stroke={C.sandDark} strokeWidth={6} fill="none" strokeLinecap="round" />
      <Path d="M8 32Q60 50 112 32" stroke={C.sandLight} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.8} />
      <Path d="M28 78Q60 86 92 78" stroke={C.sandDark} strokeWidth={3} fill="none" opacity={0.6} />
    </>
  )),

  /** Wooden crate (alternative bin). */
  crate: art(120, 90, (c) => (
    <>
      <Shadow c={c} cx={60} cy={86} rx={50} />
      <Rect x={10} y={22} width={100} height={62} rx={6} fill={C.woodLight} />
      <Rect x={10} y={22} width={100} height={10} rx={4} fill={C.woodPale} />
      {[42, 62].map((y) => (
        <Rect key={y} x={10} y={y} width={100} height={3} fill={C.wood} opacity={0.45} />
      ))}
      <Rect x={10} y={22} width={12} height={62} rx={4} fill={C.wood} />
      <Rect x={98} y={22} width={12} height={62} rx={4} fill={C.wood} />
      <Path d="M22 32 98 84M98 32 22 84" stroke={C.wood} strokeWidth={4} opacity={0.35} />
      <Circle cx={16} cy={28} r={2} fill={C.woodDark} />
      <Circle cx={104} cy={28} r={2} fill={C.woodDark} />
      <Circle cx={16} cy={78} r={2} fill={C.woodDark} />
      <Circle cx={104} cy={78} r={2} fill={C.woodDark} />
    </>
  )),

  /** Clay jar (pour / fill). */
  jar: art(80, 110, (c) => (
    <>
      <Defs>
        <Lin id={c.id('j')} x1={0} y1={0} x2={1} y2={0} stops={[[0, shade(C.clay, 0.15)], [0.35, C.clay], [1, shade(C.clay, 0.3)]]} />
      </Defs>
      <Shadow c={c} cx={40} cy={104} rx={30} />
      <Path d="M26 10H54V20C70 28 76 44 74 66 72 88 60 102 40 102S8 88 6 66C4 44 10 28 26 20Z" fill={c.url('j')} />
      <Rect x={22} y={6} width={36} height={8} rx={4} fill={shade(C.clay, 0.2)} />
      <Path d="M12 52Q40 60 68 52" stroke={C.sandLight} strokeWidth={3} fill="none" opacity={0.7} />
      <Path d="M14 60Q40 68 66 60" stroke={C.terracotta} strokeWidth={2} fill="none" opacity={0.6} />
      <Path d="M20 36C16 44 14 56 16 66" stroke={C.white} strokeWidth={4} strokeLinecap="round" opacity={0.35} fill="none" />
    </>
  )),

  /** Stepping stone of a path (SequenceBoard path, PathTrace). */
  'path-stone': art(100, 70, (c) => (
    <>
      <Shadow c={c} cx={50} cy={60} rx={44} ry={8} />
      <Path d="M8 34C8 16 30 8 52 8S94 16 94 34 74 60 50 60 8 52 8 34Z" fill={C.stoneLight} />
      <Path d="M8 34C8 46 26 56 50 56S92 46 94 34C94 50 74 60 50 60S8 52 8 34Z" fill={C.stone} />
      <Path d="M24 22C30 16 42 14 52 14" stroke={C.white} strokeWidth={4} strokeLinecap="round" opacity={0.45} fill="none" />
    </>
  )),

  /** Little flag on a pole (finish of a route). */
  flag: art(70, 100, (c) => (
    <>
      <Shadow c={c} cx={22} cy={94} rx={16} />
      <Rect x={18} y={8} width={5} height={86} rx={2.5} fill={C.woodDark} />
      <Path d="M23 12C36 6 46 18 62 12V44C46 50 36 38 23 44Z" fill={C.teal} />
      <Path d={star8Path(41, 28, 7)} fill={C.goldLight} />
      <Circle cx={20.5} cy={8} r={5} fill={C.gold} />
    </>
  )),

  /** Map / timeline pin. */
  pin: art(60, 80, (c) => (
    <>
      <Shadow c={c} cx={30} cy={76} rx={10} />
      <Path d="M30 76C30 76 6 50 6 30 6 14 16 4 30 4S54 14 54 30C54 50 30 76 30 76Z" fill={C.coral} />
      <Path d="M30 76C30 76 46 54 50 38 48 56 30 76 30 76Z" fill={shade(C.coral, 0.2)} />
      <Circle cx={30} cy={29} r={11} fill={C.white} />
      <Path d={star8Path(30, 29, 7)} fill={C.gold} />
    </>
  )),

  /** Magnifying glass (find in the scene). */
  magnifier: art(100, 100, (c) => (
    <>
      <Shadow c={c} cx={50} cy={94} rx={36} />
      <Path d="M62 62 88 88" stroke={C.woodDark} strokeWidth={14} strokeLinecap="round" />
      <Path d="M62 62 88 88" stroke={C.woodLight} strokeWidth={7} strokeLinecap="round" />
      <Circle cx={40} cy={40} r={30} fill={C.skyPale} opacity={0.85} />
      <Circle cx={40} cy={40} r={30} fill="none" stroke={C.gold} strokeWidth={8} />
      <Path d="M24 32C26 24 32 18 40 16" stroke={C.white} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.8} />
    </>
  )),

  /** Jigsaw piece. */
  puzzle: art(100, 100, (c) => (
    <>
      <Shadow c={c} cx={50} cy={94} rx={38} />
      <Path d="M14 30H38C34 22 38 12 48 12S62 22 58 30H82V54C90 50 98 54 98 64S90 78 82 74V90H58C62 82 58 74 48 74S34 82 38 90H14Z" fill={C.tealLight} />
      <Path d="M58 30H82V54C90 50 98 54 98 64S90 78 82 74V90H58C62 82 58 74 48 74Z" fill={C.tealMid} opacity={0.7} />
      <Path d={sparklePath(36, 52, 10)} fill={C.goldPale} />
    </>
  )),

  /** Two memory cards (one open). */
  cards: art(110, 100, (c) => (
    <>
      <Shadow c={c} cx={55} cy={94} rx={44} />
      <G transform="rotate(-10 34 52)">
        <Rect x={10} y={14} width={48} height={70} rx={8} fill={C.indigo} />
        <Path d={star8Path(34, 49, 16)} fill={C.gold} />
      </G>
      <G transform="rotate(8 74 50)">
        <Rect x={50} y={12} width={48} height={70} rx={8} fill={C.cream} stroke={C.gold} strokeWidth={3} />
        <Path d={sparklePath(74, 46, 14)} fill={C.gold} />
      </G>
    </>
  )),

  /** Two dots joined by a curved line (connect pairs). */
  connect: art(110, 100, (c) => (
    <>
      <Shadow c={c} cx={55} cy={94} rx={44} />
      <Rect x={6} y={14} width={34} height={30} rx={8} fill={C.cream} stroke={C.tealMid} strokeWidth={3} />
      <Rect x={70} y={56} width={34} height={30} rx={8} fill={C.cream} stroke={C.coral} strokeWidth={3} />
      <Path d="M40 29C70 29 40 71 70 71" stroke={C.gold} strokeWidth={6} fill="none" strokeLinecap="round" />
      <Circle cx={40} cy={29} r={6} fill={C.goldDeep} />
      <Circle cx={70} cy={71} r={6} fill={C.goldDeep} />
    </>
  )),

  /** Stacked building blocks (build scene). */
  blocks: art(100, 100, (c) => (
    <>
      <Shadow c={c} cx={50} cy={94} rx={42} />
      <Rect x={10} y={62} width={40} height={30} rx={4} fill={C.sand} />
      <Rect x={50} y={62} width={40} height={30} rx={4} fill={C.sandDeep} />
      <Rect x={30} y={32} width={40} height={30} rx={4} fill={C.terracotta} />
      <Path d="M34 32 50 12 66 32Z" fill={C.domeGreen} />
      <Rect x={10} y={62} width={40} height={6} rx={3} fill={C.sandLight} opacity={0.8} />
      <Rect x={30} y={32} width={40} height={6} rx={3} fill={C.white} opacity={0.25} />
    </>
  )),

  /** Falling dates into a basket (catch game cover). */
  catch: art(100, 100, (c) => (
    <>
      <Shadow c={c} cx={50} cy={94} rx={40} />
      <Ellipse cx={30} cy={18} rx={6} ry={9} fill={C.terracotta} />
      <Ellipse cx={56} cy={30} rx={6} ry={9} fill={C.wood} />
      <Ellipse cx={74} cy={12} rx={6} ry={9} fill={C.terracotta} />
      <Path d="M12 56Q50 70 88 56L80 86Q78 92 70 92H30Q22 92 20 86Z" fill={C.sand} />
      <Path d="M12 56Q50 70 88 56" stroke={C.sandDark} strokeWidth={5} fill="none" strokeLinecap="round" />
      <Path d="M20 70Q50 82 80 70" stroke={C.sandDark} strokeWidth={2} fill="none" opacity={0.6} />
    </>
  )),

  /** Dashed route with a start dot and a flag (path trace cover). */
  route: art(110, 100, (c) => (
    <>
      <Shadow c={c} cx={55} cy={94} rx={46} />
      <Path d="M14 80C30 40 60 90 70 50S96 30 96 18" stroke={C.goldDeep} strokeWidth={6} strokeDasharray="2 10" strokeLinecap="round" fill="none" />
      <Circle cx={14} cy={80} r={9} fill={C.tealMid} />
      <Circle cx={14} cy={80} r={4} fill={C.white} />
      <Rect x={94} y={4} width={4} height={26} rx={2} fill={C.woodDark} />
      <Path d="M98 6H112L106 12 112 18H98Z" fill={C.coral} />
    </>
  )),

  /** A traced curve with a pen (trace shape cover). */
  trace: art(100, 100, (c) => (
    <>
      <Shadow c={c} cx={50} cy={94} rx={40} />
      <Path d="M16 70C16 40 40 20 60 30S80 70 50 72" stroke={C.stonePale} strokeWidth={14} fill="none" strokeLinecap="round" />
      <Path d="M16 70C16 40 40 20 60 30" stroke={C.tealMid} strokeWidth={8} fill="none" strokeLinecap="round" />
      <Circle cx={16} cy={70} r={7} fill={C.gold} />
      <G transform="rotate(35 70 40)">
        <Rect x={64} y={10} width={12} height={46} rx={3} fill={C.indigo} />
        <Path d="M64 56H76L70 68Z" fill={C.sand} />
      </G>
    </>
  )),

  /** Balance with two pans (balance scale cover). */
  balance: art(110, 100, (c) => (
    <>
      <Shadow c={c} cx={55} cy={94} rx={30} />
      <Path d="M38 94Q38 84 55 84T72 94Z" fill={C.woodDark} />
      <Rect x={52} y={20} width={6} height={66} rx={3} fill={C.wood} />
      <Path d="M12 30 98 22" stroke={C.goldDeep} strokeWidth={5} strokeLinecap="round" />
      <Path d="M14 30 4 62M14 30 24 62M96 22 86 54M96 22 106 54" stroke={C.goldDeep} strokeWidth={1.4} />
      <Path d="M0 62H28Q26 74 14 74T0 62Z" fill={C.gold} />
      <Path d="M82 54H110Q108 66 96 66T82 54Z" fill={C.gold} />
      <Ellipse cx={14} cy={58} rx={8} ry={5} fill={C.terracotta} />
      <Circle cx={55} cy={18} r={6} fill={C.gold} />
    </>
  )),

  /** Timeline ribbon with pins (timeline cover). */
  timeline: art(110, 100, (c) => (
    <>
      <Shadow c={c} cx={55} cy={94} rx={46} />
      <Rect x={6} y={60} width={98} height={10} rx={5} fill={C.sandDeep} />
      {[20, 46, 72, 96].map((x) => (
        <Rect key={x} x={x - 1.5} y={56} width={3} height={18} rx={1.5} fill={C.wood} />
      ))}
      <G transform="translate(30 10) scale(0.6)">
        <Path d="M30 76C30 76 6 50 6 30 6 14 16 4 30 4S54 14 54 30C54 50 30 76 30 76Z" fill={C.coral} />
        <Circle cx={30} cy={29} r={10} fill={C.white} />
      </G>
      <G transform="translate(62 18) scale(0.5)">
        <Path d="M30 76C30 76 6 50 6 30 6 14 16 4 30 4S54 14 54 30C54 50 30 76 30 76Z" fill={C.tealMid} />
        <Circle cx={30} cy={29} r={10} fill={C.white} />
      </G>
    </>
  )),

  /** Jug pouring water into a cup (pour fill cover). */
  pour: art(110, 100, (c) => (
    <>
      <Shadow c={c} cx={60} cy={94} rx={40} />
      <G transform="rotate(-30 40 30)">
        <Path d="M20 14H52V22C60 28 62 40 60 54 58 66 50 72 36 72S14 66 12 54C10 40 12 28 20 22Z" fill={C.clay} />
        <Rect x={18} y={10} width={36} height={6} rx={3} fill={shade(C.clay, 0.2)} />
      </G>
      <Path d="M66 36C68 50 70 60 70 70" stroke={C.water} strokeWidth={5} strokeLinecap="round" fill="none" />
      <Path d="M52 62H92L86 90Q85 94 80 94H64Q59 94 58 90Z" fill={C.waterPale} stroke={C.waterDeep} strokeWidth={2} />
      <Path d="M55 74H89L86 90Q85 94 80 94H64Q59 94 58 90Z" fill={C.water} />
    </>
  )),

  /** Arabic letter tiles joining (letter join cover). */
  join: art(110, 100, (c) => (
    <>
      <Shadow c={c} cx={55} cy={94} rx={46} />
      <Rect x={6} y={44} width={30} height={34} rx={7} fill={C.cream} stroke={C.berry} strokeWidth={2.5} />
      <Rect x={40} y={44} width={30} height={34} rx={7} fill={C.cream} stroke={C.berry} strokeWidth={2.5} />
      <Rect x={74} y={44} width={30} height={34} rx={7} fill={C.cream} stroke={C.berry} strokeWidth={2.5} />
      <Path d="M14 66H96" stroke={C.berry} strokeWidth={4} strokeLinecap="round" />
      <Circle cx={55} cy={56} r={2.6} fill={C.berry} />
      <Path d="M24 12Q55 -4 86 12" stroke={C.gold} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d={sparklePath(55, 24, 8)} fill={C.gold} />
    </>
  )),

  /** Word tiles in a row (word tiles cover). */
  tiles: art(110, 100, (c) => (
    <>
      <Shadow c={c} cx={55} cy={94} rx={46} />
      {[6, 40, 74].map((x, i) => (
        <G key={x}>
          <Rect x={x} y={34 + (i === 1 ? -8 : 0)} width={30} height={34} rx={6} fill={shade(C.sand, 0.15)} />
          <Rect x={x} y={30 + (i === 1 ? -8 : 0)} width={30} height={34} rx={6} fill={C.cream} stroke={C.sandDark} strokeWidth={2} />
          <Rect x={x + 8} y={44 + (i === 1 ? -8 : 0)} width={14} height={4} rx={2} fill={C.indigo} opacity={0.6} />
        </G>
      ))}
      <Path d="M10 84H100" stroke={C.goldDeep} strokeWidth={3} strokeDasharray="6 6" strokeLinecap="round" />
    </>
  )),

  /** Ordered steps (sequence board cover). */
  steps: art(110, 100, (c) => (
    <>
      <Shadow c={c} cx={55} cy={94} rx={46} />
      {[0, 1, 2].map((i) => (
        <G key={i}>
          <Rect x={10 + i * 4} y={14 + i * 26} width={90 - i * 8} height={22} rx={7} fill={i === 1 ? C.goldPale : C.cream} stroke={C.sandDark} strokeWidth={2} />
          <Circle cx={24 + i * 4} cy={25 + i * 26} r={7} fill={C.tealMid} />
          <Rect x={36 + i * 4} y={22 + i * 26} width={46 - i * 8} height={5} rx={2.5} fill={C.indigo} opacity={0.5} />
        </G>
      ))}
    </>
  )),
} satisfies Record<string, ArtDef>;
