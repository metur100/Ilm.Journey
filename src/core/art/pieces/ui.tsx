import { Circle, Defs, G, Path, Rect } from 'react-native-svg';

import { art, dropPath, Lin, sparklePath, star8Path, starPath, type ArtDef } from '../kit';
import { C, shade } from '../palette';

/** UI pieces are square (except frames/ribbon) and centred, for use at 16–64 dp next to text. */
export const ui = {
  'star-filled': art(100, 100, (c) => (
    <>
      <Defs>
        <Lin id={c.id('s')} stops={[[0, C.goldLight], [1, C.gold]]} />
      </Defs>
      <Path d={starPath(50, 54, 42, 20, 5)} fill={C.goldDeep} stroke={C.goldDeep} strokeWidth={10} strokeLinejoin="round" />
      <Path d={starPath(50, 51, 42, 20, 5)} fill={c.url('s')} stroke={C.gold} strokeWidth={10} strokeLinejoin="round" />
      <Path d="M34 38C36 32 40 28 44 26" stroke={C.white} strokeWidth={5} strokeLinecap="round" opacity={0.55} fill="none" />
    </>
  )),

  'star-empty': art(100, 100, (c) => {
    const col = c.dark ? '#3A3F6E' : '#E3DCCD';
    return (
      <>
        <Path d={starPath(50, 54, 42, 20, 5)} fill={shade(col, 0.12)} stroke={shade(col, 0.12)} strokeWidth={10} strokeLinejoin="round" />
        <Path d={starPath(50, 51, 42, 20, 5)} fill={col} stroke={col} strokeWidth={10} strokeLinejoin="round" />
        <Path d={starPath(50, 52, 24, 11, 5)} fill={c.dark ? '#2C3060' : '#D4CBB8'} stroke={c.dark ? '#2C3060' : '#D4CBB8'} strokeWidth={5} strokeLinejoin="round" />
      </>
    );
  }),

  seed: art(100, 100, (c) => (
    <>
      <Defs>
        <Lin id={c.id('s')} x1={0} y1={0} x2={1} y2={1} stops={[[0, '#D9A066'], [1, C.woodLight]]} />
      </Defs>
      <Path d="M50 14C68 24 74 52 62 72 56 84 44 84 38 72 26 52 32 24 50 14Z" fill={c.url('s')} transform="rotate(20 50 50)" />
      <Path d="M52 20C60 34 60 56 52 76" stroke={C.wood} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.6} transform="rotate(20 50 50)" />
      <Path d="M40 34C40 28 42 24 46 21" stroke={C.white} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.5} transform="rotate(20 50 50)" />
      <Path d="M70 20C70 12 76 8 84 8 84 16 78 20 70 20Z" fill={c.green(C.leafLight)} />
      <Path d="M70 20Q72 26 66 30" stroke={c.green(C.leafDark)} strokeWidth={2.4} strokeLinecap="round" fill="none" />
    </>
  )),

  'water-drop': art(100, 100, (c) => (
    <>
      <Defs>
        <Lin id={c.id('d')} x1={0} y1={0} x2={1} y2={1} stops={[[0, C.waterLight], [1, C.waterDeep]]} />
      </Defs>
      <Path d={dropPath(50, 6, 90)} fill={c.url('d')} />
      <Path d="M34 62C32 52 36 44 42 38" stroke={C.white} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.55} />
    </>
  )),

  sparkle: art(100, 100, () => (
    <>
      <Path d={sparklePath(44, 54, 40, 0.16)} fill={C.goldLight} />
      <Path d={sparklePath(44, 54, 20, 0.2)} fill={C.goldPale} />
      <Path d={sparklePath(82, 18, 14, 0.2)} fill={C.gold} />
      <Circle cx={84} cy={70} r={5} fill={C.goldLight} />
    </>
  )),

  trophy: art(100, 100, (c) => (
    <>
      <Defs>
        <Lin id={c.id('t')} x1={0} y1={0} x2={1} y2={0} stops={[[0, C.goldLight], [0.6, C.gold], [1, C.goldDeep]]} />
      </Defs>
      <Path d="M24 22C8 22 8 50 30 52M76 22C92 22 92 50 70 52" stroke={C.goldDeep} strokeWidth={6} fill="none" strokeLinecap="round" />
      <Path d="M24 12H76V34C76 52 64 62 50 62S24 52 24 34Z" fill={c.url('t')} />
      <Rect x={44} y={60} width={12} height={14} fill={C.goldDeep} />
      <Path d="M34 74H66L70 86H30Z" fill={C.gold} />
      <Rect x={26} y={84} width={48} height={10} rx={3} fill={C.wood} />
      <Path d={star8Path(50, 34, 11)} fill={C.goldPale} />
      <Path d="M32 18V36" stroke={C.white} strokeWidth={4} strokeLinecap="round" opacity={0.45} />
    </>
  )),

  'badge-frame': art(100, 100, (c) => (
    <>
      <Path d="M30 70 20 98 34 92 42 100 50 74ZM70 70 80 98 66 92 58 100 50 74Z" fill={C.berry} />
      <Path d={star8Path(50, 46, 46)} fill={C.goldDeep} />
      <Path d={star8Path(50, 44, 46)} fill={C.gold} />
      <Circle cx={50} cy={44} r={33} fill={C.goldPale} />
      <Circle cx={50} cy={44} r={29} fill={c.dark ? C.nightSoft : C.cream} />
    </>
  )),

  'card-frame': art(140, 200, (c) => {
    const bg = c.dark ? C.nightSoft : C.cream;
    const corner = (x: number, y: number, r: number) => (
      <G key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${r})`}>
        <Path d="M0 0H24A24 24 0 0 1 0 24Z" fill={C.gold} opacity={0.9} />
        <Path d={star8Path(9, 9, 6)} fill={C.goldPale} />
      </G>
    );
    return (
      <>
        <Rect x={0} y={4} width={140} height={196} rx={18} fill={c.dark ? '#000000' : C.ink} opacity={c.dark ? 0.35 : 0.1} />
        <Rect x={0} y={0} width={140} height={196} rx={18} fill={C.gold} />
        <Rect x={6} y={6} width={128} height={184} rx={13} fill={bg} />
        <Rect x={12} y={12} width={116} height={172} rx={9} fill="none" stroke={C.gold} strokeWidth={1.6} opacity={0.8} />
        {corner(12, 12, 0)}
        {corner(128, 12, 90)}
        {corner(128, 184, 180)}
        {corner(12, 184, 270)}
      </>
    );
  }),

  lock: art(100, 100, (c) => (
    <>
      <Path d="M30 46V32C30 16 40 8 50 8S70 16 70 32V46" stroke={c.dark ? C.greyLight : C.greyDark} strokeWidth={10} fill="none" />
      <Rect x={18} y={42} width={64} height={52} rx={10} fill={C.gold} />
      <Rect x={18} y={42} width={64} height={10} rx={5} fill={C.goldLight} />
      <Circle cx={50} cy={64} r={7} fill={C.amber} />
      <Rect x={47} y={66} width={6} height={14} rx={3} fill={C.amber} />
    </>
  )),

  'lock-open': art(100, 100, (c) => (
    <>
      <Path d="M30 46V32C30 16 40 8 50 8S70 16 70 28" stroke={c.dark ? C.greyLight : C.greyDark} strokeWidth={10} fill="none" transform="translate(-14 -6) rotate(-12 30 46)" />
      <Rect x={18} y={42} width={64} height={52} rx={10} fill={C.gold} />
      <Rect x={18} y={42} width={64} height={10} rx={5} fill={C.goldLight} />
      <Circle cx={50} cy={64} r={7} fill={C.amber} />
      <Rect x={47} y={66} width={6} height={14} rx={3} fill={C.amber} />
    </>
  )),

  check: art(100, 100, (c) => (
    <>
      <Circle cx={50} cy={50} r={44} fill={c.dark ? '#3FB27A' : '#2E9B5E'} />
      <Circle cx={50} cy={46} r={40} fill={c.dark ? '#5FD08F' : '#3FB27A'} />
      <Path d="M30 50 44 64 72 34" stroke={C.white} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  )),

  'confetti-piece': art(60, 60, () => (
    <>
      <Path d="M10 40C18 28 26 44 34 32S48 24 52 16" stroke={C.coral} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Rect x={6} y={6} width={12} height={8} rx={2} fill={C.tealLight} transform="rotate(-25 12 10)" />
      <Circle cx={46} cy={46} r={5} fill={C.gold} />
    </>
  )),

  'level-up-ribbon': art(200, 80, () => (
    <>
      <Path d="M8 26H40V66H8L18 46Z" fill={shade(C.berry, 0.2)} />
      <Path d="M192 26H160V66H192L182 46Z" fill={shade(C.berry, 0.2)} />
      <Path d="M30 58 40 66V58ZM170 58 160 66V58Z" fill={shade(C.berry, 0.45)} />
      <Rect x={30} y={16} width={140} height={42} rx={6} fill={C.berry} />
      <Rect x={30} y={16} width={140} height={8} rx={4} fill={C.white} opacity={0.18} />
      <Path d={star8Path(100, 37, 30)} fill={C.goldDeep} />
      <Path d={star8Path(100, 35, 30)} fill={C.gold} />
      <Path d="M88 42 100 28 112 42" stroke={C.white} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M88 50 100 36 112 50" stroke={C.white} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.6} />
      <Path d={sparklePath(50, 37, 7)} fill={C.goldPale} />
      <Path d={sparklePath(150, 37, 7)} fill={C.goldPale} />
    </>
  )),

  heart: art(100, 100, (c) => (
    <>
      <Path d="M50 88C20 68 6 50 8 32 10 18 22 10 34 12 42 13 47 18 50 24 53 18 58 13 66 12 78 10 90 18 92 32 94 50 80 68 50 88Z" fill={c.dark ? '#F28B7F' : C.coral} />
      <Path d="M22 30C22 24 26 20 32 20" stroke={C.white} strokeWidth={6} strokeLinecap="round" opacity={0.5} fill="none" />
    </>
  )),

  flame: art(100, 100, () => (
    <>
      <Path d="M50 94C26 94 14 76 20 56 24 64 30 66 34 66 28 44 38 22 58 6 54 26 64 38 72 50 82 64 84 94 50 94Z" fill={C.orange} />
      <Path d="M50 94C36 94 30 84 34 72 36 76 40 78 42 78 40 66 46 56 56 48 54 60 62 66 66 74 70 84 64 94 50 94Z" fill={C.goldLight} />
    </>
  )),

  medal: art(100, 100, () => (
    <>
      <Path d="M30 4H48L60 40H42ZM70 4H52L40 40H58Z" fill={C.tealMid} />
      <Path d="M52 4H70L58 40H52Z" fill={C.teal} />
      <Circle cx={50} cy={64} r={30} fill={C.goldDeep} />
      <Circle cx={50} cy={62} r={30} fill={C.gold} />
      <Circle cx={50} cy={62} r={21} fill={C.goldLight} />
      <Path d={star8Path(50, 62, 13)} fill={C.gold} />
    </>
  )),
} satisfies Record<string, ArtDef>;
