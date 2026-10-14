import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { art, Eye, Shadow, type ArtDef, type Ctx } from '../kit';
import { C, shade } from '../palette';
import { BeeShape, DoveShape } from './shared';

/**
 * Animals: friendly, rounded, facing right, standing on the bottom edge (flying ones float). One piece per animal –
 * the Ark pairs game simply shows the same piece twice.
 */

function Legs({ xs, top, bottom, w, color, hoof }: { xs: number[]; top: number; bottom: number; w: number; color: string; hoof?: string }) {
  return (
    <G>
      {xs.map((x, i) => (
        <G key={i}>
          <Rect x={x - w / 2} y={top} width={w} height={bottom - top} rx={w / 2} fill={color} />
          {hoof && <Rect x={x - w / 2} y={bottom - w * 0.9} width={w} height={w * 0.9} rx={w * 0.3} fill={hoof} />}
        </G>
      ))}
    </G>
  );
}

/** Dark creatures get a lighter body tone on dark surfaces so their silhouette stays visible. */
const darkish = (c: Ctx, color: string, onDark: string) => (c.dark ? onDark : color);

function Camel({ x = 0, y = 0, s = 1, color = '#D9A86C', decor = false }: { x?: number; y?: number; s?: number; color?: string; decor?: boolean }) {
  const dk = shade(color, 0.18);
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Legs xs={[34, 70]} top={60} bottom={94} w={6} color={dk} hoof={shade(color, 0.35)} />
      <Path d="M26 50C20 52 18 60 20 66" stroke={dk} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M22 56C22 42 32 36 42 36 48 20 66 18 74 32 80 36 84 44 84 54 84 64 76 68 54 68 32 68 22 64 22 56Z" fill={color} />
      <Path d="M58 22C66 22 72 26 74 32 80 36 84 44 84 54 84 62 78 66 68 68 74 56 72 34 58 22Z" fill={dk} opacity={0.35} />
      <Legs xs={[42, 78]} top={60} bottom={94} w={6.5} color={color} hoof={dk} />
      <Path d="M78 52C88 48 92 38 94 26L106 24C106 38 100 52 88 62Z" fill={color} />
      <Ellipse cx={104} cy={22} rx={11} ry={7.5} fill={color} />
      <Ellipse cx={112} cy={25} rx={5} ry={4.5} fill={dk} opacity={0.4} />
      <Path d="M97 15 95 9 101 13Z" fill={dk} />
      <Eye x={104} y={19} r={1.8} />
      {decor && (
        <G>
          <Path d="M94 26Q100 32 108 28" stroke={C.berry} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <Circle cx={96} cy={34} r={2.6} fill={C.gold} />
          <Path d="M96 36V42" stroke={C.berry} strokeWidth={2} strokeLinecap="round" />
          <Path d="M36 40Q50 46 64 38" stroke={C.berry} strokeWidth={4} fill="none" strokeLinecap="round" />
          <Path d="M40 42V48M48 44V50M56 43V49" stroke={C.gold} strokeWidth={2} strokeLinecap="round" />
        </G>
      )}
    </G>
  );
}

function Sheep({ c, x = 0, y = 0, s = 1, horns = false }: { c: Ctx; x?: number; y?: number; s?: number; horns?: boolean }) {
  const wool = C.white;
  const woolShade = c.dark ? '#D9D4CC' : '#ECE6DA';
  const face = '#5A4A48';
  const puffs: [number, number, number][] = [[24, 40, 12], [36, 32, 13], [50, 30, 13], [64, 34, 12], [72, 44, 11], [62, 52, 12], [46, 54, 13], [30, 52, 12]];
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Legs xs={[32, 42, 58, 68]} top={56} bottom={76} w={5.5} color={face} />
      {!c.dark && <Ellipse cx={48} cy={43} rx={33} ry={20} fill="#D8D0C2" />}
      {puffs.map(([px, py, r], i) => (
        <Circle key={`s${i}`} cx={px + 1} cy={py + 1.5} r={r} fill={woolShade} />
      ))}
      {puffs.map(([px, py, r], i) => (
        <Circle key={`w${i}`} cx={px} cy={py} r={r * 0.9} fill={wool} />
      ))}
      <Ellipse cx={48} cy={42} rx={26} ry={14} fill={wool} />
      <Ellipse cx={80} cy={36} rx={9.5} ry={11.5} fill={face} />
      <Ellipse cx={72} cy={30} rx={6} ry={3} fill={face} transform="rotate(-20 72 30)" />
      <Ellipse cx={88} cy={30} rx={5} ry={2.6} fill={face} transform="rotate(25 88 30)" />
      <Circle cx={80} cy={25} r={6} fill={wool} />
      {horns && (
        <G>
          <Circle cx={71} cy={34} r={9} fill={C.sandDark} />
          <Circle cx={71} cy={34} r={5.5} fill={C.sandDeep} />
          <Circle cx={71} cy={34} r={2.4} fill={C.sandDark} />
        </G>
      )}
      <Eye x={83} y={35} r={1.8} color={C.white} />
      <Circle cx={83} cy={35} r={0.9} fill={C.ink} />
    </G>
  );
}

export const animal = {
  camel: art(120, 100, (c) => (
    <>
      <Shadow c={c} cx={58} cy={95} rx={44} />
      <Camel />
    </>
  )),

  'she-camel': art(130, 100, (c) => (
    <>
      <Shadow c={c} cx={64} cy={95} rx={56} />
      <Camel color="#E6C49A" decor />
      <Camel x={8} y={50} s={0.46} color="#EED7B4" />
    </>
  )),

  sheep: art(100, 80, (c) => (
    <>
      <Shadow c={c} cx={50} cy={76} rx={36} />
      <Sheep c={c} />
    </>
  )),

  ram: art(100, 80, (c) => (
    <>
      <Shadow c={c} cx={50} cy={76} rx={36} />
      <Sheep c={c} horns />
    </>
  )),

  goat: art(100, 90, (c) => {
    const col = '#B98457';
    return (
      <>
        <Shadow c={c} cx={48} cy={86} rx={34} />
        <Legs xs={[26, 36, 58, 68]} top={56} bottom={86} w={5} color={shade(col, 0.2)} hoof={C.ink} />
        <Path d="M18 44 10 32 16 30 22 40Z" fill={col} />
        <Ellipse cx={46} cy={50} rx={28} ry={15} fill={col} />
        <Path d="M30 50C40 58 58 60 70 52 66 62 52 66 40 64 32 62 28 56 30 50Z" fill={C.cream} opacity={0.8} />
        <Path d="M66 46C70 36 72 28 76 22L86 24C84 32 80 42 74 52Z" fill={col} />
        <Path d="M74 22C68 14 64 6 70 2 72 8 76 14 80 20Z" fill={C.sandDark} />
        <Ellipse cx={84} cy={24} rx={9} ry={7} fill={col} />
        <Ellipse cx={90} cy={28} rx={5} ry={4} fill={C.cream} />
        <Path d="M76 22 66 26 72 18Z" fill={shade(col, 0.2)} />
        <Path d="M86 31C86 38 84 42 82 44 82 38 82 34 84 31Z" fill={C.cream} />
        <Eye x={84} y={21} r={1.7} />
      </>
    );
  }),

  horse: art(120, 100, (c) => {
    const col = '#A0603A';
    const mane = '#4A2E20';
    return (
      <>
        <Shadow c={c} cx={56} cy={95} rx={44} />
        <Legs xs={[30, 66]} top={56} bottom={94} w={6.5} color={shade(col, 0.2)} hoof={C.ink} />
        <Path d="M22 46C10 50 8 66 14 76 16 64 20 56 26 52Z" fill={mane} />
        <Ellipse cx={50} cy={50} rx={32} ry={16} fill={col} />
        <Legs xs={[38, 74]} top={56} bottom={94} w={7} color={col} hoof={C.ink} />
        <Path d="M70 44C76 32 80 22 86 14L100 18C96 30 90 42 82 54Z" fill={col} />
        <Path d="M86 12C78 18 74 30 68 40L74 44C78 34 84 24 92 16Z" fill={mane} />
        <Path d="M86 14C94 10 104 14 110 26 112 32 106 36 100 32L92 28Z" fill={col} />
        <Ellipse cx={107} cy={30} rx={6} ry={5} fill={shade(col, 0.15)} />
        <Path d="M88 12 87 4 93 10Z" fill={col} />
        <Eye x={96} y={20} r={1.9} />
        <Circle cx={108} cy={30} r={1} fill={C.ink} />
        <Path d="M94 18C96 22 98 24 100 24" stroke={C.white} strokeWidth={2.4} strokeLinecap="round" opacity={0.7} />
      </>
    );
  }),

  donkey: art(110, 90, (c) => {
    const col = '#9A949E';
    return (
      <>
        <Shadow c={c} cx={50} cy={86} rx={38} />
        <Legs xs={[28, 64]} top={54} bottom={86} w={6} color={shade(col, 0.2)} hoof={C.ink} />
        <Path d="M22 44C16 50 16 58 18 64" stroke={col} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Circle cx={18} cy={65} r={3} fill={C.ink} />
        <Ellipse cx={46} cy={46} rx={28} ry={15} fill={col} />
        <Path d="M28 50C38 58 56 60 68 52 64 60 52 62 42 61 34 60 28 56 28 50Z" fill="#D8D4DC" />
        <Legs xs={[34, 70]} top={54} bottom={86} w={6.5} color={col} hoof={C.ink} />
        <Path d="M64 42C70 34 74 26 78 20L90 24C88 32 82 42 76 50Z" fill={col} />
        <Path d="M78 18C72 22 68 30 64 38" stroke="#5A5560" strokeWidth={4} strokeLinecap="round" fill="none" />
        <Ellipse cx={88} cy={26} rx={10} ry={8} fill={col} />
        <Ellipse cx={95} cy={30} rx={6} ry={5} fill="#D8D4DC" />
        <Path d="M80 20C76 10 76 2 80 0 84 4 86 12 84 20Z" fill={col} />
        <Path d="M86 18C88 8 92 2 96 2 96 8 92 14 88 20Z" fill={col} />
        <Path d="M81 16C80 10 80 6 81 4 82 8 83 12 82 16Z" fill="#E4C9CF" />
        <Eye x={88} y={23} r={1.8} />
      </>
    );
  }),

  cow: art(120, 90, (c) => {
    const patch = '#7A4A30';
    return (
      <>
        <Shadow c={c} cx={56} cy={86} rx={44} />
        <Legs xs={[30, 70]} top={54} bottom={86} w={7} color="#E4DCD0" hoof={C.ink} />
        <Path d="M20 42C14 48 14 58 16 64" stroke="#E4DCD0" strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d="M12 62 16 70 20 62Z" fill={patch} />
        <Rect x={18} y={30} width={66} height={30} rx={15} fill={C.white} />
        {!c.dark && <Rect x={18} y={30} width={66} height={30} rx={15} fill="none" stroke="#D8D0C2" strokeWidth={1.4} />}
        <Path d="M30 32C40 30 44 38 38 44 32 48 24 44 24 38Z" fill={patch} />
        <Path d="M58 46C66 42 74 46 72 54 66 58 58 56 58 46Z" fill={patch} />
        <Ellipse cx={58} cy={60} rx={7} ry={3} fill={C.pink} />
        <Legs xs={[38, 78]} top={54} bottom={86} w={7.5} color={C.white} hoof={C.ink} />
        <Ellipse cx={92} cy={36} rx={14} ry={13} fill={C.white} />
        <Ellipse cx={98} cy={46} rx={11} ry={7} fill={C.pinkPale} />
        <Circle cx={94} cy={46} r={1.4} fill={C.plum} />
        <Circle cx={102} cy={46} r={1.4} fill={C.plum} />
        <Path d="M80 26C76 22 72 22 70 24 74 28 78 30 82 30Z" fill={patch} />
        <Path d="M104 28C108 24 112 24 114 26 110 30 106 31 102 30Z" fill={patch} />
        <Path d="M84 24C82 16 84 12 88 12 88 16 88 20 88 24ZM100 24C102 16 100 12 96 12 96 16 96 20 96 24Z" fill={C.cream} />
        <Path d="M88 26C90 22 96 22 98 26 96 30 90 30 88 26Z" fill={patch} />
        <Eye x={87} y={35} r={1.8} />
        <Eye x={98} y={35} r={1.8} />
      </>
    );
  }),

  ox: art(130, 100, (c) => {
    const col = '#6E4630';
    return (
      <>
        <Shadow c={c} cx={60} cy={95} rx={50} />
        <Legs xs={[32, 76]} top={60} bottom={94} w={8} color={shade(col, 0.2)} hoof={C.ink} />
        <Path d="M22 48C14 54 14 64 16 72" stroke={col} strokeWidth={3.4} strokeLinecap="round" fill="none" />
        <Path d="M12 70 16 78 20 70Z" fill={C.ink} />
        <Path d="M20 50C20 36 34 30 50 32 60 24 74 24 82 32 90 36 92 46 90 56 88 66 76 68 56 68 30 68 20 62 20 50Z" fill={col} />
        <Path d="M50 32C60 24 74 24 82 32 76 30 66 30 58 36Z" fill={shade(col, 0.25)} />
        <Legs xs={[42, 84]} top={60} bottom={94} w={8.5} color={col} hoof={C.ink} />
        <Ellipse cx={100} cy={46} rx={14} ry={13} fill={col} />
        <Ellipse cx={106} cy={56} rx={10} ry={7} fill="#B98C70" />
        <Circle cx={103} cy={56} r={1.4} fill={C.ink} />
        <Circle cx={110} cy={56} r={1.4} fill={C.ink} />
        <Path d="M90 36C80 30 76 20 82 14 84 22 88 28 94 32Z" fill={C.cream} />
        <Path d="M108 34C118 28 122 18 116 12 114 20 110 26 104 30Z" fill={C.cream} />
        <Path d="M86 42C82 40 78 40 76 42 80 46 84 47 88 46Z" fill={shade(col, 0.2)} />
        <Eye x={96} y={44} r={1.9} />
        <Eye x={106} y={44} r={1.9} />
      </>
    );
  }),

  lion: art(110, 90, (c) => {
    const body = '#E2A84E';
    const mane = '#B5652E';
    return (
      <>
        <Shadow c={c} cx={52} cy={86} rx={40} />
        <Path d="M18 48C8 42 6 30 12 26" stroke={body} strokeWidth={3.4} strokeLinecap="round" fill="none" />
        <Circle cx={12} cy={25} r={4.4} fill={mane} />
        <Legs xs={[26, 58]} top={56} bottom={86} w={8} color={shade(body, 0.15)} />
        <Ellipse cx={44} cy={52} rx={28} ry={15} fill={body} />
        <Legs xs={[34, 66]} top={56} bottom={86} w={8.5} color={body} />
        <Circle cx={78} cy={38} r={22} fill={mane} />
        {Array.from({ length: 10 }, (_, i) => (
          <Circle key={i} cx={78 + Math.cos((i / 10) * Math.PI * 2) * 20} cy={38 + Math.sin((i / 10) * Math.PI * 2) * 20} r={6} fill={mane} />
        ))}
        <Circle cx={80} cy={40} r={14} fill={body} />
        <Circle cx={70} cy={28} r={4} fill={body} />
        <Circle cx={90} cy={28} r={4} fill={body} />
        <Ellipse cx={82} cy={46} rx={7} ry={5} fill={C.cream} />
        <Path d="M79 43H85L82 46Z" fill={C.woodDark} />
        <Eye x={76} y={37} r={1.9} />
        <Eye x={87} y={37} r={1.9} />
      </>
    );
  }),

  elephant: art(120, 100, (c) => {
    const col = '#8E95A8';
    const dk = '#737A8E';
    return (
      <>
        <Shadow c={c} cx={56} cy={95} rx={46} />
        <Legs xs={[30, 70]} top={60} bottom={94} w={11} color={dk} />
        <Ellipse cx={52} cy={52} rx={38} ry={26} fill={col} />
        <Path d="M16 50C12 54 12 60 14 64" stroke={dk} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Legs xs={[40, 80]} top={62} bottom={94} w={12} color={col} />
        <Circle cx={88} cy={40} r={20} fill={col} />
        <Path d="M100 46C110 52 112 66 106 76 102 82 96 80 98 76 104 68 102 58 94 54Z" fill={col} />
        <Path d="M96 56Q104 54 108 58" stroke={dk} strokeWidth={1.4} fill="none" opacity={0.6} />
        <Path d="M96 52C100 56 106 56 108 52 104 54 100 54 96 52Z" fill={C.white} />
        <Path d="M72 28C60 20 52 30 54 44 56 56 66 60 76 56 80 46 80 36 72 28Z" fill={dk} />
        <Path d="M70 32C62 28 58 34 59 44 60 52 66 54 72 52 75 44 75 38 70 32Z" fill="#C7A4AE" opacity={0.6} />
        <Eye x={93} y={36} r={2} />
      </>
    );
  }),

  dove: art(70, 50, (c) => <DoveShape c={c} x={2} y={3} s={0.93} />),

  pigeon: art(80, 80, (c) => {
    const col = '#9AA3B8';
    return (
      <>
        <Shadow c={c} cx={40} cy={76} rx={24} />
        <Path d="M12 50 2 58 6 62 18 56Z" fill="#6F7891" />
        <Ellipse cx={36} cy={50} rx={24} ry={17} fill={col} />
        <Path d="M20 44C30 38 46 42 50 52 42 60 28 60 20 54Z" fill="#7F89A3" />
        <Path d="M28 48H44M30 54H44" stroke="#5A6380" strokeWidth={2.4} strokeLinecap="round" />
        <Path d="M44 40C46 32 50 26 56 24 62 30 62 40 58 48 52 50 46 46 44 40Z" fill={C.tealMid} />
        <Path d="M48 44C50 38 54 34 58 34 60 40 58 46 54 48Z" fill={C.purple} opacity={0.7} />
        <Circle cx={56} cy={22} r={9} fill={col} />
        <Path d="M64 21 72 24 64 26Z" fill="#5A5560" />
        <Circle cx={64} cy={20.5} r={1.6} fill={C.white} opacity={0.9} />
        <Eye x={58} y={20} r={1.7} color={C.coral} />
        <Path d="M32 66V74M40 66V74M30 74H34M38 74H42" stroke={C.coral} strokeWidth={2} strokeLinecap="round" />
      </>
    );
  }),

  hoopoe: art(100, 90, (c) => {
    const body = '#E09A5C';
    const ink = darkish(c, C.ink, '#565A80');
    return (
      <>
        <Shadow c={c} cx={46} cy={86} rx={28} />
        <Path d="M24 50 4 62 8 68 28 58Z" fill={ink} />
        <Path d="M8 63 14 60M14 66 20 62" stroke={C.white} strokeWidth={2} />
        <Ellipse cx={42} cy={54} rx={24} ry={16} fill={body} />
        <Path d="M22 50C30 44 46 46 54 56 46 66 30 66 22 58Z" fill={ink} />
        <Path d="M28 50 32 62M36 48 40 62M44 50 47 62" stroke={C.white} strokeWidth={3} strokeLinecap="round" />
        <Circle cx={60} cy={34} r={11} fill={body} />
        {[-60, -35, -10, 15, 40].map((a, i) => {
          const r = (a * Math.PI) / 180;
          const x2 = 58 + Math.sin(r) * 22;
          const y2 = 26 - Math.cos(r) * 22;
          return (
            <G key={i}>
              <Path d={`M58 28L${x2} ${y2}`} stroke={C.orange} strokeWidth={6} strokeLinecap="round" />
              <Circle cx={x2} cy={y2} r={3} fill={ink} />
              <Circle cx={58 + Math.sin(r) * 17} cy={26 - Math.cos(r) * 17} r={2.2} fill={C.white} />
            </G>
          );
        })}
        <Path d="M70 34C80 36 88 42 96 52 86 46 78 42 70 38Z" fill={ink} />
        <Eye x={63} y={32} r={1.8} />
        <Path d="M40 70V82M48 70V82" stroke={ink} strokeWidth={2} strokeLinecap="round" />
      </>
    );
  }),

  crow: art(90, 80, (c) => {
    const col = darkish(c, '#2B2D3E', '#4A4E6E');
    const dk = darkish(c, '#1C1D2A', '#363A58');
    return (
      <>
        <Shadow c={c} cx={44} cy={76} rx={26} />
        <Path d="M20 48 2 60 8 64 24 56Z" fill={dk} />
        <Ellipse cx={42} cy={50} rx={24} ry={15} fill={col} />
        <Path d="M22 46C32 40 48 44 54 54 44 62 30 60 22 54Z" fill={dk} />
        <Circle cx={64} cy={32} r={11} fill={col} />
        <Path d="M72 28 88 34 72 38Z" fill={darkish(c, '#4A4D60', '#6A6F90')} />
        <Eye x={67} y={29} r={2} color={C.white} />
        <Circle cx={67.5} cy={29} r={1.1} fill={C.ink} />
        <Path d="M40 64V74M48 64V74" stroke={dk} strokeWidth={2.4} strokeLinecap="round" />
        <Path d="M30 46C36 42 44 42 48 46" stroke={C.white} strokeWidth={2} strokeLinecap="round" opacity={0.18} fill="none" />
      </>
    );
  }),

  ant: art(90, 60, (c) => {
    const col = darkish(c, '#8A3A22', '#B5583A');
    return (
      <>
        <Shadow c={c} cx={46} cy={56} rx={34} ry={3} />
        <G stroke={shade(col, 0.2)} strokeWidth={2.4} strokeLinecap="round" fill="none">
          <Path d="M40 36 30 46 26 56M46 36 46 46 42 56M50 36 58 46 62 56" />
          <Path d="M72 22C76 12 80 8 86 8M68 20C68 10 70 6 74 4" />
        </G>
        <Ellipse cx={22} cy={36} rx={16} ry={12} fill={col} />
        <Circle cx={46} cy={34} r={8} fill={col} />
        <Circle cx={66} cy={28} r={11} fill={col} />
        <Eye x={70} y={25} r={2.4} color={C.white} />
        <Circle cx={71} cy={25} r={1.3} fill={C.ink} />
        <Ellipse cx={18} cy={31} rx={6} ry={3} fill={C.white} opacity={0.25} />
      </>
    );
  }),

  bee: art(70, 56, (c) => <BeeShape c={c} x={35} y={32} s={1.4} />),

  spider: art(80, 80, (c) => {
    const col = darkish(c, '#3B3550', '#6A6290');
    return (
      <>
        <Path d="M40 2V26" stroke={c.dark ? C.white : '#8C93AE'} strokeWidth={1.2} />
        <G stroke={col} strokeWidth={3} strokeLinecap="round" fill="none">
          <Path d="M32 42 18 34 10 42M32 48 14 48 8 58M34 54 20 62 16 72M36 56 30 68 30 78" />
          <Path d="M48 42 62 34 70 42M48 48 66 48 72 58M46 54 60 62 64 72M44 56 50 68 50 78" />
        </G>
        <Ellipse cx={40} cy={50} rx={14} ry={13} fill={col} />
        <Circle cx={40} cy={32} r={9} fill={col} />
        <Eye x={36} y={31} r={2.2} color={C.white} />
        <Eye x={44} y={31} r={2.2} color={C.white} />
        <Circle cx={36.4} cy={31.4} r={1.1} fill={C.ink} />
        <Circle cx={44.4} cy={31.4} r={1.1} fill={C.ink} />
        <Path d={'M34 46Q40 42 46 46'} stroke={C.white} strokeWidth={1.6} strokeLinecap="round" opacity={0.3} fill="none" />
      </>
    );
  }),

  fish: art(100, 60, () => (
    <>
      <Path d="M20 30 4 14Q2 30 4 46Z" fill={C.orange} />
      <Path d="M46 12C40 4 54 2 62 10Z" fill={C.orange} />
      <Path d="M16 30C26 12 56 8 76 16 88 20 94 26 94 30 94 34 88 40 76 44 56 52 26 48 16 30Z" fill={C.gold} />
      <Path d="M30 40C48 48 70 48 86 38 80 44 66 50 50 50 40 50 34 46 30 40Z" fill={C.goldDeep} opacity={0.6} />
      <Path d="M44 18C40 24 40 36 44 42M56 16C52 24 52 36 56 44" stroke={C.orange} strokeWidth={2} fill="none" opacity={0.6} strokeLinecap="round" />
      <Path d="M52 34C56 40 62 42 66 40 60 38 56 36 52 34Z" fill={C.orange} />
      <Eye x={80} y={26} r={3} />
    </>
  )),

  whale: art(160, 90, () => (
    <>
      <Path d="M112 18C108 8 104 4 98 4M112 18C114 8 118 4 124 4M112 18V8" stroke={C.waterLight} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M14 46C2 36 0 22 6 18 12 26 18 32 28 38Z" fill="#3D6B93" />
      <Path d="M14 46C2 54 0 66 6 70 12 62 18 58 28 52Z" fill="#3D6B93" />
      <Path d="M22 46C34 22 80 16 116 22 142 26 156 40 154 56 152 72 134 80 104 80 64 80 34 68 22 46Z" fill="#4A7FAE" />
      <Path d="M40 60C60 76 100 82 130 76 146 72 154 62 154 56 150 66 140 72 124 74 94 78 64 74 40 60Z" fill="#CFE3F0" />
      <Path d="M70 70Q100 76 130 70M80 74Q104 78 126 75" stroke="#A9C7DD" strokeWidth={1.6} fill="none" />
      <Path d="M86 60C90 72 100 78 110 76 102 70 96 66 86 60Z" fill="#3D6B93" />
      <Eye x={126} y={48} r={3.2} />
      <Path d="M138 62Q144 64 148 60" stroke="#2F5577" strokeWidth={2} strokeLinecap="round" fill="none" />
    </>
  )),

  frog: art(90, 80, (c) => {
    const col = '#5DB46A';
    return (
      <>
        <Shadow c={c} cx={45} cy={75} rx={36} />
        <Ellipse cx={20} cy={68} rx={14} ry={6} fill={shade(col, 0.15)} />
        <Ellipse cx={70} cy={68} rx={14} ry={6} fill={shade(col, 0.15)} />
        <Path d="M14 66C10 44 24 30 45 30S80 44 76 66C70 74 20 74 14 66Z" fill={col} />
        <Ellipse cx={45} cy={58} rx={20} ry={12} fill="#B7E0A8" />
        <Circle cx={30} cy={28} r={11} fill={col} />
        <Circle cx={60} cy={28} r={11} fill={col} />
        <Circle cx={30} cy={27} r={6.5} fill={C.white} />
        <Circle cx={60} cy={27} r={6.5} fill={C.white} />
        <Circle cx={31} cy={28} r={3.4} fill={C.ink} />
        <Circle cx={61} cy={28} r={3.4} fill={C.ink} />
        <Path d="M34 44Q45 50 56 44" stroke={shade(col, 0.35)} strokeWidth={2} strokeLinecap="round" fill="none" />
        <Ellipse cx={28} cy={72} rx={6} ry={3} fill={col} />
        <Ellipse cx={62} cy={72} rx={6} ry={3} fill={col} />
      </>
    );
  }),

  cat: art(90, 90, (c) => {
    const col = '#E59A4E';
    const dk = '#C2763A';
    return (
      <>
        <Shadow c={c} cx={44} cy={86} rx={30} />
        <Path d="M60 82C78 82 84 70 80 60" stroke={col} strokeWidth={7} strokeLinecap="round" fill="none" />
        <Path d="M24 84C20 66 26 48 42 46S66 60 64 84Z" fill={col} />
        <Path d="M30 60 36 62M28 70 34 71M58 60 52 62M60 70 54 71" stroke={dk} strokeWidth={2.6} strokeLinecap="round" />
        <Ellipse cx={44} cy={72} rx={10} ry={12} fill={C.cream} />
        <Circle cx={44} cy={36} r={18} fill={col} />
        <Path d="M28 30 26 12 40 22ZM60 30 62 12 48 22Z" fill={col} />
        <Path d="M30 26 29 16 37 22ZM58 26 59 16 51 22Z" fill={C.pink} />
        <Path d="M38 22 40 28M44 20V27M50 22 48 28" stroke={dk} strokeWidth={2} strokeLinecap="round" />
        <Ellipse cx={44} cy={44} rx={8} ry={6} fill={C.cream} />
        <Path d="M41.5 41H46.5L44 44Z" fill={C.rose} />
        <Eye x={37} y={36} r={2.2} />
        <Eye x={51} y={36} r={2.2} />
        <Ellipse cx={36} cy={84} rx={6} ry={3.4} fill={C.cream} />
        <Ellipse cx={52} cy={84} rx={6} ry={3.4} fill={C.cream} />
      </>
    );
  }),

  dog: art(100, 90, (c) => {
    const col = '#C9A27A';
    const ear = '#8A6448';
    return (
      <>
        <Shadow c={c} cx={50} cy={86} rx={34} />
        <Path d="M22 50C14 44 12 34 16 30" stroke={col} strokeWidth={5} strokeLinecap="round" fill="none" />
        <Legs xs={[28, 60]} top={56} bottom={86} w={7} color={shade(col, 0.15)} />
        <Ellipse cx={44} cy={54} rx={26} ry={14} fill={col} />
        <Legs xs={[36, 68]} top={58} bottom={86} w={7.5} color={col} />
        <Circle cx={72} cy={36} r={15} fill={col} />
        <Ellipse cx={84} cy={42} rx={10} ry={7} fill={C.cream} />
        <Circle cx={92} cy={40} r={3} fill={C.ink} />
        <Path d="M60 28C54 32 52 44 56 50 62 46 64 36 62 28Z" fill={ear} />
        <Eye x={74} y={32} r={2} />
        <Path d="M30 48C40 44 52 46 58 50" stroke={C.cream} strokeWidth={4} strokeLinecap="round" opacity={0.6} fill="none" />
      </>
    );
  }),

  wolf: art(110, 90, (c) => {
    const col = '#8E8C9C';
    const light = '#D6D4DE';
    return (
      <>
        <Shadow c={c} cx={52} cy={86} rx={40} />
        <Path d="M22 48C10 50 4 58 6 66 14 62 20 58 26 54Z" fill={col} />
        <Path d="M6 66 10 62 12 66Z" fill={light} />
        <Legs xs={[30, 64]} top={56} bottom={86} w={6.5} color={shade(col, 0.15)} />
        <Ellipse cx={46} cy={50} rx={28} ry={14} fill={col} />
        <Path d="M30 54C42 62 60 62 70 54 64 64 40 66 30 54Z" fill={light} />
        <Legs xs={[38, 72]} top={56} bottom={86} w={7} color={col} />
        <Path d="M68 46C70 34 78 26 88 26 96 28 104 34 106 38 102 42 94 44 86 46 80 50 72 52 68 46Z" fill={col} />
        <Path d="M86 46C94 44 102 42 106 38 104 44 96 48 86 48Z" fill={light} />
        <Path d="M76 30 76 16 86 26Z" fill={col} />
        <Path d="M78 26 78 20 82 25Z" fill={light} />
        <Circle cx={105} cy={37} r={2.2} fill={C.ink} />
        <Eye x={88} y={33} r={1.8} />
      </>
    );
  }),

  birds: art(120, 70, (c) => {
    const col = c.dark ? '#C9CCEA' : C.nightSoft;
    const bird = (x: number, y: number, s: number) => (
      <Path key={`${x}`} d={`M${x - 14 * s} ${y - 4 * s}Q${x - 7 * s} ${y - 10 * s} ${x} ${y}Q${x + 7 * s} ${y - 10 * s} ${x + 14 * s} ${y - 4 * s}Q${x + 7 * s} ${y - 6 * s} ${x} ${y + 3 * s}Q${x - 7 * s} ${y - 6 * s} ${x - 14 * s} ${y - 4 * s}Z`} fill={col} />
    );
    return (
      <>
        {bird(30, 30, 1.4)}
        {bird(70, 20, 1.1)}
        {bird(92, 46, 1.25)}
        {bird(54, 52, 0.8)}
      </>
    );
  }),

  rooster: art(90, 100, (c) => (
    <>
      <Shadow c={c} cx={46} cy={96} rx={26} />
      <Path d="M30 56C16 40 14 20 24 10 28 24 32 34 38 42Z" fill={C.teal} />
      <Path d="M30 58C10 52 4 34 10 24 16 38 24 46 36 50Z" fill={C.tealMid} />
      <Path d="M32 60C18 64 8 56 8 46 18 54 28 54 36 54Z" fill={C.leafDeep} />
      <Ellipse cx={46} cy={62} rx={20} ry={16} fill="#C8643B" />
      <Path d="M30 60C36 52 52 54 56 64 48 72 36 72 30 66Z" fill="#9C4A2A" />
      <Path d="M54 54C54 42 56 30 60 24L72 28C72 40 66 50 62 58Z" fill={C.orange} />
      <Circle cx={66} cy={24} r={10} fill={C.orange} />
      <Path d="M60 15C60 8 64 6 66 10 68 4 72 4 72 10 76 8 78 12 74 16Z" fill={C.berry} />
      <Path d="M74 22 84 25 74 28Z" fill={C.gold} />
      <Path d="M72 30C76 32 76 38 72 38 70 36 70 32 72 30Z" fill={C.berry} />
      <Eye x={68} y={21} r={1.8} />
      <Path d="M42 76V92M50 76V92M38 92H46M46 92H54" stroke={C.gold} strokeWidth={2.6} strokeLinecap="round" />
    </>
  )),
} satisfies Record<string, ArtDef>;

export { Camel, Sheep };
