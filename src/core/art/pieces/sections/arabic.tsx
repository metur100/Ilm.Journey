import { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { art, Glow, Lin, Shadow, sparklePath, star8Path, type ArtDef, type Ctx } from '../../kit';
import { C, shade } from '../../palette';

/**
 * Section art of Arabic / Sufara (see docs/GAMES-V3.md). Owned by the arabic section – add pieces here only.
 * Real letters are always rendered as text in the app's Arabic font, never drawn: these covers use writing tools,
 * tablets, tiles, rhombus dots and calligraphic strokes only.
 */

/** Arabic-style rhombus dot. */
const dot = (cx: number, cy: number, r: number, fill: string, key?: string | number) => <Path key={key} d={`M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z`} fill={fill} />;

/** A raised tile (game tile look). */
const tile = (c: Ctx, x: number, y: number, w: number, h: number, face: string = C.cream, key?: string | number) => (
  <G key={key}>
    <Rect x={x} y={y + 3} width={w} height={h} rx={8} fill={c.dark ? '#000000' : C.ink} opacity={0.12} />
    <Rect x={x} y={y} width={w} height={h} rx={8} fill={shade(face, 0.18)} />
    <Rect x={x} y={y} width={w} height={h - 4} rx={8} fill={face} stroke={C.goldDeep} strokeWidth={1.2} />
  </G>
);

/** A calligraphic stroke (a swash ending in a thin tail) – decoration, not a letter. */
const swash = (d: string, color: string, width = 7, key?: string | number) => <Path key={key} d={d} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none" />;

/** Reed pen (qalam) lying diagonally. */
const reedPen = (x: number, y: number, len: number, rot: number) => (
  <G transform={`translate(${x} ${y}) rotate(${rot})`}>
    <Rect x={0} y={-3.5} width={len} height={7} rx={3} fill={C.woodPale} />
    <Rect x={len * 0.08} y={-3.5} width={len * 0.1} height={7} fill={C.woodLight} opacity={0.6} />
    <Path d={`M${len} -3.5L${len + 14} 0L${len} 3.5Z`} fill={C.wood} />
    <Path d={`M${len + 9} -1L${len + 14} 0L${len + 9} 1Z`} fill={C.ink} />
  </G>
);

export const arabic = {
  /** Wooden writing tablet (levha) with a dashed guide stroke and a reed pen – letter tracing. */
  'trace-tablet': art(140, 120, (c) => (
    <>
      <Defs>
        <Lin id={c.id('w')} stops={[[0, C.woodPale], [1, C.woodLight]]} />
      </Defs>
      <Shadow c={c} cx={70} cy={112} rx={56} />
      <Rect x={14} y={10} width={112} height={98} rx={14} fill={c.url('w')} />
      <Rect x={22} y={18} width={96} height={82} rx={10} fill={C.cream} />
      <Path d="M70 4a8 8 0 1 1 0.1 0" fill="none" stroke={C.wood} strokeWidth={3} />
      {swash('M98 40C96 62 86 74 66 74S38 66 40 52', C.stoneLight, 9)}
      <Path d="M98 40C96 62 86 74 66 74S38 66 40 52" stroke={C.gold} strokeWidth={3} strokeDasharray="5 6" fill="none" strokeLinecap="round" />
      {dot(70, 88, 5, C.ink)}
      <Circle cx={98} cy={40} r={5} fill={C.tealMid} />
      {reedPen(30, 98, 60, -32)}
    </>
  )),

  /** Inkwell with rhombus dots flying out – the dots game. */
  'dots-inkwell': art(140, 120, (c) => (
    <>
      <Shadow c={c} cx={60} cy={112} rx={40} />
      <Path d="M34 64H86L94 104Q94 110 86 110H34Q26 110 26 104Z" fill={C.indigo} />
      <Path d="M30 64H90V56Q90 50 84 50H36Q30 50 30 56Z" fill={C.nightSoft} />
      <Rect x={46} y={40} width={28} height={12} rx={4} fill={C.night} />
      <Path d="M34 76Q60 84 86 76" stroke={C.goldLight} strokeWidth={2} fill="none" opacity={0.6} />
      {swash('M92 34Q108 22 118 30', C.goldDeep, 2)}
      {dot(104, 18, 7, C.ink, 'a')}
      {dot(122, 40, 6, C.ink, 'b')}
      {dot(118, 64, 5, C.ink, 'c')}
      <Path d={sparklePath(20, 30, 9)} fill={C.gold} />
      {reedPen(56, 40, 54, -70)}
    </>
  )),

  /** Two baskets, one with a single dot, one with three – sorting letter twins. */
  'twin-letters': art(140, 110, (c) => (
    <>
      <Shadow c={c} cx={70} cy={104} rx={62} />
      {[22, 78].map((x, i) => (
        <G key={x}>
          <Path d={`M${x - 6} 58Q${x + 20} 70 ${x + 46} 58L${x + 40} 96Q${x + 38} 102 ${x + 30} 102H${x + 10}Q${x + 2} 102 ${x} 96Z`} fill={i ? C.sandDeep : C.sand} />
          <Path d={`M${x - 6} 58Q${x + 20} 70 ${x + 46} 58`} stroke={C.sandDark} strokeWidth={4} fill="none" strokeLinecap="round" />
          {[72, 84].map((y) => (
            <Path key={y} d={`M${x} ${y}Q${x + 20} ${y + 8} ${x + 40} ${y}`} stroke={C.sandDark} strokeWidth={2} fill="none" opacity={0.6} />
          ))}
        </G>
      ))}
      {tile(c, 26, 18, 34, 36)}
      {tile(c, 82, 14, 34, 36)}
      {swash('M52 36Q44 44 34 36', C.ink, 4)}
      {dot(43, 46, 3.5, C.ink)}
      {swash('M108 32Q100 40 90 32', C.ink, 4)}
      {dot(99, 20, 3, C.ink, 1)}
      {dot(94, 25, 3, C.ink, 2)}
      {dot(104, 25, 3, C.ink, 3)}
    </>
  )),

  /** Four tiles in a row joined by a line – the four letter forms. */
  'four-forms': art(150, 100, (c) => (
    <>
      <Shadow c={c} cx={75} cy={92} rx={66} />
      {[8, 44, 80, 116].map((x, i) => tile(c, x, 26, 28, 46, i === 0 ? C.goldPale : C.cream, x))}
      <Path d="M36 54H44M72 54H80M108 54H116" stroke={C.tealMid} strokeWidth={4} strokeLinecap="round" />
      {swash('M30 54Q22 60 14 52', C.ink, 4, 'a')}
      {swash('M64 54H52', C.ink, 4, 'b')}
      {swash('M100 54H88', C.ink, 4, 'c')}
      {swash('M138 54H130Q122 60 122 50', C.ink, 4, 'd')}
      {[22, 58, 94, 128].map((x) => dot(x, 64, 3, C.ink, x))}
      <Path d={star8Path(75, 14, 8)} fill={C.gold} />
    </>
  )),

  /** A chain of letter tiles with one link open – non-joining letters. */
  'broken-link': art(150, 100, (c) => (
    <>
      <Shadow c={c} cx={75} cy={92} rx={64} />
      {tile(c, 10, 34, 34, 42, C.cream, 'a')}
      {tile(c, 58, 34, 34, 42, C.goldPale, 'b')}
      {tile(c, 106, 34, 34, 42, C.cream, 'c')}
      <Path d="M44 55H58" stroke={C.tealMid} strokeWidth={5} strokeLinecap="round" />
      <Path d="M92 55H97M101 55H106" stroke={C.coral} strokeWidth={5} strokeLinecap="round" strokeDasharray="1 0" />
      <Path d="M97 46L101 64" stroke={C.coral} strokeWidth={3} strokeLinecap="round" />
      <Path d="M75 42V68" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
      {swash('M34 56H18', C.ink, 4)}
      {swash('M130 50Q130 66 116 62', C.ink, 4)}
      <Path d={sparklePath(75, 18, 9)} fill={C.gold} />
    </>
  )),

  /** Two letter tiles flying together and fusing with a golden glow – joining letters (spajanje harfova). */
  'join-letters': art(150, 110, (c) => (
    <>
      <Glow c={c} k="g" cx={75} cy={56} r={46} color={C.goldPale} opacity={0.8} />
      <Shadow c={c} cx={75} cy={102} rx={58} />
      {tile(c, 18, 34, 40, 50, C.cream, 'a')}
      {tile(c, 92, 34, 40, 50, C.cream, 'b')}
      <Path d="M58 60H92" stroke={C.gold} strokeWidth={6} strokeLinecap="round" />
      {swash('M50 62H34Q26 62 28 54', C.ink, 5, 's1')}
      {swash('M120 62H100', C.ink, 5, 's2')}
      {dot(42, 74, 3.5, C.ink, 'd1')}
      {dot(110, 50, 3.2, C.ink, 'd2')}
      {dot(118, 50, 3.2, C.ink, 'd3')}
      <Path d="M8 28l8 6M142 28l-8 6M75 8v10" stroke={C.goldDeep} strokeWidth={3} strokeLinecap="round" />
      <Path d={sparklePath(75, 60, 7)} fill={C.white} opacity={0.9} />
    </>
  )),

  /** Small vowel marks floating above a letter tile, a speaker wave beside – harakat sounds. */
  'harakat-sounds': art(140, 110, (c) => (
    <>
      <Shadow c={c} cx={64} cy={104} rx={46} />
      {tile(c, 34, 44, 58, 58, C.cream)}
      {swash('M80 80H52Q42 80 44 70', C.ink, 6)}
      {dot(64, 92, 4, C.ink)}
      <Path d="M52 30L72 22" stroke={C.tealMid} strokeWidth={5} strokeLinecap="round" />
      <Path d="M18 26L30 20" stroke={C.coral} strokeWidth={4} strokeLinecap="round" />
      <Path d="M96 24c6-6 12 0 6 6l-8 8" stroke={C.purple} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d="M108 64q8 8 0 16M116 58q14 14 0 28" stroke={C.gold} strokeWidth={4} fill="none" strokeLinecap="round" />
    </>
  )),

  /** A dotted circle with sukun, shadda and tanwin marks around it – the marks workshop. */
  'marks': art(140, 110, (c) => (
    <>
      <Shadow c={c} cx={70} cy={104} rx={50} />
      <Circle cx={70} cy={64} r={30} fill={C.cream} stroke={C.goldDeep} strokeWidth={3} strokeDasharray="3 7" strokeLinecap="round" />
      <Circle cx={70} cy={20} r={8} fill="none" stroke={C.teal} strokeWidth={4} />
      <Path d="M18 40q4 10 9 0q4 10 9 0" stroke={C.coral} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M104 34L122 26M104 44L122 36" stroke={C.purple} strokeWidth={4} strokeLinecap="round" />
      <Path d={sparklePath(70, 64, 10)} fill={C.gold} />
    </>
  )),

  /** A long golden ribbon pulled out of a tile – madd, the stretched vowel. */
  'stretch': art(150, 100, (c) => (
    <>
      <Shadow c={c} cx={75} cy={92} rx={66} />
      {tile(c, 100, 28, 40, 52, C.cream)}
      <Path d="M100 58H30Q14 58 12 46" stroke={C.gold} strokeWidth={10} strokeLinecap="round" fill="none" />
      <Path d="M100 58H30Q14 58 12 46" stroke={C.goldLight} strokeWidth={3} strokeLinecap="round" fill="none" />
      {swash('M128 62H110', C.ink, 5)}
      <Path d="M120 36L132 30" stroke={C.teal} strokeWidth={4} strokeLinecap="round" />
      <Path d="M48 42l-10 16 10 16M70 42l10 16-10 16" stroke={C.goldDeep} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
    </>
  )),

  /** An open sufara booklet on a wooden book stand (rahla) with lines of syllables – reading line by line. */
  'sufara-book': art(150, 120, (c) => (
    <>
      <Shadow c={c} cx={75} cy={114} rx={60} />
      <Path d="M30 112L120 70M120 112L30 70" stroke={C.wood} strokeWidth={7} strokeLinecap="round" />
      <Path d="M75 30Q50 20 14 26V82Q50 76 75 88Z" fill={C.ivory} stroke={C.sandDark} strokeWidth={2} />
      <Path d="M75 30Q100 20 136 26V82Q100 76 75 88Z" fill={C.cream} stroke={C.sandDark} strokeWidth={2} />
      <Path d="M75 30V88" stroke={C.sandDark} strokeWidth={2} />
      {[40, 52, 64].map((y, row) => (
        <G key={y}>
          {[0, 1, 2].map((i) => (
            <G key={i}>
              {swash(`M${126 - i * 16} ${y + row}H${116 - i * 16}`, row === 0 && i === 0 ? C.tealMid : C.ink, 3)}
              <Path d={`M${124 - i * 16} ${y - 6 + row}L${119 - i * 16} ${y - 4 + row}`} stroke={C.ink} strokeWidth={1.6} strokeLinecap="round" />
            </G>
          ))}
          {swash(`M64 ${y + row}H24`, C.ink, 3)}
        </G>
      ))}
      <Rect x={84} y={34} width={46} height={12} rx={6} fill={C.gold} opacity={0.35} />
    </>
  )),

  /** Stepping stones with letter tiles leading to a scroll – the alphabet path. */
  'alphabet-path': art(150, 110, (c) => (
    <>
      <Path d="M12 96Q50 70 72 84T138 40" stroke={C.sandDeep} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6} />
      {[
        [20, 88],
        [52, 76],
        [84, 78],
        [112, 56],
      ].map(([x, y], i) => (
        <G key={i}>
          <Ellipse cx={x} cy={y + 8} rx={14} ry={5} fill={C.stone} />
          {tile(c, x - 11, y - 18, 22, 24, i === 3 ? C.goldPale : C.cream)}
          {dot(x, y - 6, 3, C.ink)}
        </G>
      ))}
      <Rect x={124} y={14} width={20} height={26} rx={3} fill={C.sandLight} stroke={C.sandDark} strokeWidth={2} />
      <Circle cx={124} cy={14} r={4} fill={C.sandDark} />
      <Circle cx={144} cy={40} r={4} fill={C.sandDark} />
    </>
  )),

  /** Two flipped memory cards: one with a word tile, one with a picture of a lamp – word memory. */
  'word-cards': art(140, 110, (c) => (
    <>
      <Shadow c={c} cx={70} cy={104} rx={58} />
      <G transform="rotate(-8 40 60)">
        <Rect x={14} y={20} width={52} height={74} rx={10} fill={C.teal} />
        <Path d={star8Path(40, 57, 16)} fill="none" stroke={C.goldLight} strokeWidth={2} />
        <Path d={star8Path(40, 57, 8)} fill={C.gold} />
      </G>
      <G transform="rotate(7 96 58)">
        <Rect x={70} y={18} width={52} height={74} rx={10} fill={C.cream} stroke={C.goldDeep} strokeWidth={2} />
        <Circle cx={96} cy={46} r={12} fill={C.goldPale} />
        <Path d="M90 56H102L100 66H92Z" fill={C.goldDeep} />
        <Path d="M96 32V40" stroke={C.gold} strokeWidth={3} strokeLinecap="round" />
        {swash('M110 80H84', C.ink, 3)}
      </G>
    </>
  )),
} satisfies Record<string, ArtDef>;
