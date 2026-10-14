import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { archPath, art, crescentPath, domePath, Eye, Glow, Shadow, star8Path, starPath, type ArtDef, type Ctx } from '../kit';
import { C, shade } from '../palette';
import { Well } from './places';

/** Closed book (cover colour, gold frame, eight-pointed medallion) – never any writing. */
export function ClosedBook({ x, y, w, h, cover = C.teal, edge = C.cream }: { x: number; y: number; w: number; h: number; cover?: string; edge?: string }) {
  return (
    <G>
      <Rect x={x + 3} y={y + 3} width={w} height={h} rx={4} fill={edge} />
      <Path d={`M${x + w} ${y + 5}V${y + h + 1}`} stroke={C.stonePale} strokeWidth={1} />
      <Rect x={x} y={y} width={w} height={h} rx={4} fill={cover} />
      <Rect x={x} y={y} width={w * 0.12} height={h} rx={3} fill={shade(cover, 0.25)} />
      <Rect x={x + w * 0.2} y={y + h * 0.08} width={w * 0.72} height={h * 0.84} rx={3} fill="none" stroke={C.gold} strokeWidth={Math.max(1.2, w * 0.025)} />
      <Path d={star8Path(x + w * 0.56, y + h / 2, Math.min(w, h) * 0.17)} fill={C.gold} />
      <Circle cx={x + w * 0.56} cy={y + h / 2} r={Math.min(w, h) * 0.06} fill={cover} />
    </G>
  );
}

function Coin({ x, y, r, tilt = 0.32 }: { x: number; y: number; r: number; tilt?: number }) {
  return (
    <G>
      <Ellipse cx={x} cy={y + r * 0.16} rx={r} ry={r * tilt} fill={C.goldDeep} />
      <Ellipse cx={x} cy={y} rx={r} ry={r * tilt} fill={C.gold} />
      <Ellipse cx={x} cy={y} rx={r * 0.7} ry={r * tilt * 0.7} fill={C.goldLight} />
    </G>
  );
}

function FlatCoin({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <G>
      <Circle cx={x} cy={y} r={r} fill={C.goldDeep} />
      <Circle cx={x - r * 0.06} cy={y - r * 0.06} r={r * 0.92} fill={C.gold} />
      <Path d={star8Path(x - r * 0.06, y - r * 0.06, r * 0.5)} fill={C.goldLight} />
    </G>
  );
}

function Flame({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M0 0C-14 0-20-12-14-24-12-18-8-16-6-16-8-28-2-40 8-46 6-36 12-28 16-20 22-10 14 0 0 0Z" fill={C.orange} />
      <Path d="M0 0C-8 0-11-7-8-14-6-10-4-9-2-9-3-16 0-22 5-26 4-20 8-15 10-10 12-4 7 0 0 0Z" fill={C.goldLight} />
    </G>
  );
}

function Pot({ c, x, y, w, h, color, neck = 0.5 }: { c: Ctx; x: number; y: number; w: number; h: number; color: string; neck?: number }) {
  // Rounded clay pot with its foot at (x, y).
  const top = y - h;
  const nw = w * neck * 0.5;
  return (
    <G>
      <Shadow c={c} cx={x} cy={y} rx={w * 0.45} />
      <Path d={`M${x - nw} ${top}C${x - nw} ${top + h * 0.2} ${x - w / 2} ${top + h * 0.25} ${x - w / 2} ${top + h * 0.6}C${x - w / 2} ${y - h * 0.08} ${x - w * 0.3} ${y} ${x} ${y}C${x + w * 0.3} ${y} ${x + w / 2} ${y - h * 0.08} ${x + w / 2} ${top + h * 0.6}C${x + w / 2} ${top + h * 0.25} ${x + nw} ${top + h * 0.2} ${x + nw} ${top}Z`} fill={color} />
      <Path d={`M${x + w * 0.12} ${y - 1}C${x + w * 0.36} ${y - h * 0.1} ${x + w * 0.44} ${top + h * 0.45} ${x + w * 0.3} ${top + h * 0.3}C${x + w / 2} ${top + h * 0.4} ${x + w / 2} ${y - h * 0.15} ${x + w * 0.12} ${y - 1}Z`} fill={shade(color, 0.2)} opacity={0.6} />
      <Rect x={x - nw - 2} y={top - 3} width={nw * 2 + 4} height={6} rx={3} fill={shade(color, 0.12)} />
    </G>
  );
}

function CompassFace() {
  return (
    <>
      <Circle cx={50} cy={50} r={44} fill={C.goldDeep} />
      <Circle cx={50} cy={50} r={40} fill={C.gold} />
      <Circle cx={50} cy={50} r={34} fill={C.cream} />
      {Array.from({ length: 16 }, (_, i) => (
        <Path key={i} d={`M50 18V${i % 4 === 0 ? 24 : 21}`} stroke={C.sandDark} strokeWidth={i % 4 === 0 ? 2.4 : 1.2} transform={`rotate(${i * 22.5} 50 50)`} strokeLinecap="round" />
      ))}
      <Path d={star8Path(50, 50, 16)} fill={C.sandLight} />
      <Path d="M50 20 57 50H43Z" fill={C.berry} />
      <Path d="M50 80 57 50H43Z" fill={C.nightLine} />
      <Circle cx={50} cy={50} r={4} fill={C.gold} />
      <Circle cx={50} cy={6} r={4} fill={C.goldDeep} />
    </>
  );
}

export const object = {
  ark: art(140, 100, () => (
    <>
      <Path d="M4 86q8-6 16 0t16 0 16 0 16 0 16 0 16 0 16 0 16 0 16 0" stroke={C.water} strokeWidth={4} strokeLinecap="round" fill="none" />
      <Path d="M8 54H132L118 82Q114 88 106 88H34Q26 88 22 82Z" fill={C.woodLight} />
      <Path d="M70 54H132L118 82Q114 88 106 88H70Z" fill={C.wood} opacity={0.45} />
      <Path d="M14 64H126M20 74H120" stroke={C.woodDark} strokeWidth={1.6} opacity={0.5} />
      <Rect x={4} y={50} width={132} height={7} rx={3.5} fill={C.wood} />
      <Rect x={36} y={28} width={68} height={23} rx={2} fill={C.woodPale} />
      <Rect x={80} y={28} width={24} height={23} fill={C.woodLight} opacity={0.5} />
      <Path d="M28 30L70 10 112 30Z" fill={C.terracotta} />
      <Path d="M70 10 112 30H84Z" fill={shade(C.terracotta, 0.2)} />
      {[48, 64, 80].map((x) => (
        <Rect key={x} x={x} y={35} width={9} height={9} rx={2} fill={C.woodDark} />
      ))}
      <Circle cx={30} cy={69} r={3} fill={C.woodDark} opacity={0.6} />
      <Circle cx={110} cy={69} r={3} fill={C.woodDark} opacity={0.6} />
    </>
  )),

  staff: art(60, 120, (c) => (
    <>
      <Shadow c={c} cx={26} cy={114} rx={12} />
      <Path d="M24 114C25 90 27 60 28 32 28 18 34 8 44 8 52 8 56 16 54 24" stroke={C.woodLight} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Path d="M26 108C27 84 28 60 29 40" stroke={C.woodPale} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.7} />
      <Path d="M27 70l4-2M28 46l4-2" stroke={C.wood} strokeWidth={2} strokeLinecap="round" />
    </>
  )),

  basket: art(100, 80, (c) => (
    <>
      <Shadow c={c} cx={50} cy={74} rx={42} />
      <Path d="M8 32H92L84 66Q82 74 72 74H28Q18 74 16 66Z" fill={C.sand} />
      <Path d="M60 32H92L84 66Q82 74 72 74H60Z" fill={C.sandDeep} opacity={0.6} />
      {[42, 52, 62].map((y) => (
        <Path key={y} d={`M${10 + (y - 32) * 0.2} ${y}H${90 - (y - 32) * 0.2}`} stroke={C.sandDark} strokeWidth={1.6} opacity={0.7} />
      ))}
      {[22, 34, 46, 58, 70, 80].map((x) => (
        <Path key={x} d={`M${x} 34Q${x + (x < 50 ? 2 : -2)} 54 ${x + (x < 50 ? 4 : -4)} 72`} stroke={C.sandDark} strokeWidth={1.4} opacity={0.5} fill="none" />
      ))}
      <Ellipse cx={50} cy={32} rx={43} ry={8} fill={C.sandDark} />
      <Ellipse cx={50} cy={31} rx={38} ry={5.5} fill={C.woodLight} />
      <Path d="M20 28C24 22 36 22 44 26 54 20 70 20 80 28" fill={C.cream} />
      <Rect x={4} y={28} width={10} height={6} rx={3} fill={C.sandDark} />
      <Rect x={86} y={28} width={10} height={6} rx={3} fill={C.sandDark} />
    </>
  )),

  'grain-sack': art(90, 100, (c) => (
    <>
      <Shadow c={c} cx={45} cy={94} rx={38} />
      <Path d="M30 22C18 30 10 52 12 76 14 90 24 94 45 94S76 90 78 76C80 52 72 30 60 22Z" fill="#D8B98C" />
      <Path d="M56 24C68 34 76 54 76 76 74 88 64 92 52 94 64 80 66 48 56 24Z" fill="#C2A06F" />
      <Path d="M30 22C34 26 56 26 60 22L58 16C52 20 38 20 32 16Z" fill="#C2A06F" />
      <Path d="M32 18C30 10 34 6 38 10 40 4 46 4 46 10 50 4 56 6 54 12 60 10 62 16 58 18Z" fill={C.gold} />
      <Rect x={29} y={20} width={32} height={5} rx={2.5} fill={C.wood} />
      <Path d="M24 56H66" stroke="#B89462" strokeWidth={2} opacity={0.5} />
      <Path d={star8Path(45, 68, 8)} fill="#B89462" opacity={0.6} />
      {[[16, 92], [22, 94], [70, 93], [76, 91], [80, 94]].map(([x, y], i) => (
        <Ellipse key={i} cx={x} cy={y} rx={2.2} ry={1.4} fill={C.goldDeep} />
      ))}
    </>
  )),

  storehouse: art(130, 110, (c) => (
    <>
      <Shadow c={c} cx={65} cy={104} rx={62} ry={6} />
      <Path d="M12 104V58Q12 30 34 30T56 58V104Z" fill={C.mud} />
      <Path d="M74 104V58Q74 30 96 30T118 58V104Z" fill={C.mud} />
      <Path d="M40 34Q56 40 56 58V104H46V58Q46 44 40 34ZM102 34Q118 40 118 58V104H108V58Q108 44 102 34Z" fill={C.clay} opacity={0.45} />
      <Rect x={30} y={56} width={70} height={48} fill={C.sandLight} />
      <Rect x={80} y={56} width={20} height={48} fill={C.sandDeep} opacity={0.4} />
      <Path d="M26 58L65 40 104 58Z" fill={C.clay} />
      <Path d={archPath(65, 70, 22, 104)} fill={C.woodDark} />
      <Path d={archPath(65, 74, 16, 104)} fill={C.woodLight} />
      <Rect x={20} y={46} width={6} height={6} rx={1} fill={C.woodDark} />
      <Rect x={104} y={46} width={6} height={6} rx={1} fill={C.woodDark} />
      <Path d="M30 104C28 94 34 88 40 88S50 94 48 104Z" fill="#D8B98C" />
      <Path d="M84 104C82 96 88 90 94 90S102 96 100 104Z" fill="#D8B98C" />
      <Rect x={35} y={86} width={10} height={3} rx={1.5} fill={C.wood} />
      <Rect x={89} y={88} width={10} height={3} rx={1.5} fill={C.wood} />
    </>
  )),

  scales: art(110, 100, (c) => (
    <>
      <Shadow c={c} cx={55} cy={94} rx={30} />
      <Path d="M36 94Q36 84 55 84T74 94Z" fill={C.goldDeep} />
      <Rect x={52} y={20} width={6} height={66} rx={3} fill={C.gold} />
      <Circle cx={55} cy={16} r={6} fill={C.gold} />
      <Path d="M14 28H96" stroke={C.goldDeep} strokeWidth={5} strokeLinecap="round" />
      <Path d="M16 28 6 62M16 28 26 62M94 28 84 62M94 28 104 62" stroke={C.goldDeep} strokeWidth={1.4} />
      <Path d="M2 62H30Q28 74 16 74T2 62Z" fill={C.gold} />
      <Path d="M80 62H108Q106 74 94 74T80 62Z" fill={C.gold} />
      <Ellipse cx={16} cy={62} rx={14} ry={3} fill={C.goldLight} />
      <Ellipse cx={94} cy={62} rx={14} ry={3} fill={C.goldLight} />
      <Circle cx={55} cy={16} r={2.4} fill={C.goldLight} />
    </>
  )),

  lantern: art(60, 100, (c) => (
    <>
      <Glow c={c} k="g" cx={30} cy={56} r={30} color={C.goldPale} opacity={c.dark ? 0.75 : 0.55} />
      <Path d="M30 2V14" stroke={C.goldDeep} strokeWidth={1.6} />
      <Circle cx={30} cy={15} r={3.2} fill="none" stroke={C.goldDeep} strokeWidth={1.8} />
      <Path d={domePath(30, 34, 13, 1.2)} fill={C.gold} />
      <Rect x={15} y={32} width={30} height={5} rx={2} fill={C.goldDeep} />
      <Path d="M17 37H43L40 70H20Z" fill={C.goldPale} />
      <Path d="M30 37V70M23.5 37 25 70M36.5 37 35 70" stroke={C.gold} strokeWidth={1.6} />
      <Path d="M30 46C26 52 26 58 30 63 34 58 34 52 30 46Z" fill={C.orange} opacity={0.85} />
      <Path d="M18 70H42L36 80H24Z" fill={C.goldDeep} />
      <Path d="M28 80H32L30 90Z" fill={C.gold} />
    </>
  )),

  lamp: art(100, 70, (c) => (
    <>
      <Glow c={c} k="g" cx={78} cy={22} r={22} color={C.goldPale} opacity={c.dark ? 0.8 : 0.6} />
      <Shadow c={c} cx={46} cy={64} rx={34} />
      <Path d="M10 46C10 36 26 32 46 32S80 36 86 42L94 40Q92 50 80 52C70 60 54 62 40 62 22 62 10 56 10 46Z" fill={C.terracotta} />
      <Path d="M46 56C60 56 74 54 80 52 70 60 54 62 40 62 30 62 22 60 16 56 26 58 36 58 46 56Z" fill={shade(C.terracotta, 0.2)} />
      <Ellipse cx={40} cy={38} rx={14} ry={4} fill={shade(C.terracotta, 0.3)} />
      <Path d="M8 44C2 44 0 36 6 34" stroke={C.terracotta} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Flame x={86} y={40} s={0.5} />
      <Path d="M24 48H60" stroke={C.goldLight} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
    </>
  )),

  'quran-stand': art(110, 100, (c) => (
    <>
      <Shadow c={c} cx={55} cy={94} rx={46} />
      <Path d="M14 92 70 34 78 40 24 94ZM96 92 40 34 32 40 86 94Z" fill={C.woodLight} />
      <Path d="M14 92 70 34 72 36 18 93ZM96 92 40 34 38 36 92 93Z" fill={C.woodPale} opacity={0.6} />
      <Path d="M52 58 58 58 58 66 52 66Z" fill={C.woodDark} opacity={0.5} />
      <Path d="M10 40 55 56 100 40 100 46 55 62 10 46Z" fill={C.wood} />
      <G transform="rotate(-8 55 30)">
        <ClosedBook x={30} y={10} w={50} h={36} cover={C.teal} />
      </G>
      <Path d="M28 46 55 54 84 46" stroke={C.woodDark} strokeWidth={1.4} fill="none" opacity={0.5} />
    </>
  )),

  book: art(90, 100, (c) => (
    <>
      <Shadow c={c} cx={45} cy={93} rx={36} />
      <ClosedBook x={14} y={10} w={60} h={80} cover={C.teal} />
    </>
  )),

  scroll: art(110, 80, (c) => (
    <>
      <Shadow c={c} cx={55} cy={74} rx={46} />
      <Path d="M22 22H90V62H22Z" fill={C.cream} />
      <Path d="M22 22H90V30H22Z" fill={C.sandLight} />
      <Path d="M30 58H82" stroke={C.sandDeep} strokeWidth={1.4} opacity={0.6} />
      <Path d={star8Path(56, 44, 8)} fill={C.gold} opacity={0.75} />
      <Rect x={10} y={14} width={14} height={56} rx={7} fill={C.sandLight} />
      <Rect x={16} y={14} width={8} height={56} rx={4} fill={C.sandDeep} opacity={0.5} />
      <Rect x={86} y={14} width={14} height={56} rx={7} fill={C.sandLight} />
      <Rect x={92} y={14} width={8} height={56} rx={4} fill={C.sandDeep} opacity={0.5} />
      <Rect x={14} y={8} width={6} height={68} rx={3} fill={C.wood} />
      <Rect x={90} y={8} width={6} height={68} rx={3} fill={C.wood} />
      <Circle cx={17} cy={8} r={4} fill={C.woodDark} />
      <Circle cx={17} cy={76} r={4} fill={C.woodDark} />
      <Circle cx={93} cy={8} r={4} fill={C.woodDark} />
      <Circle cx={93} cy={76} r={4} fill={C.woodDark} />
      <Path d="M40 62H70V74L55 68 40 74Z" fill={C.berry} />
    </>
  )),

  pen: art(100, 100, (c) => (
    <>
      <Shadow c={c} cx={40} cy={92} rx={28} />
      <G transform="rotate(40 50 50)">
        <Rect x={44} y={6} width={12} height={70} rx={5} fill={C.woodPale} />
        <Rect x={51} y={6} width={5} height={70} rx={2.5} fill={C.woodLight} />
        <Path d="M44 30H56M44 52H56" stroke={C.wood} strokeWidth={1.6} />
        <Path d="M44 74H56L52 96 50 98 48 96Z" fill={C.sand} />
        <Path d="M48 88 50 98 52 88Z" fill={C.ink} />
      </G>
    </>
  )),

  inkwell: art(80, 90, (c) => (
    <>
      <Shadow c={c} cx={40} cy={84} rx={30} />
      <G transform="rotate(18 52 30)">
        <Rect x={48} y={2} width={8} height={50} rx={3.5} fill={C.woodPale} />
        <Rect x={52} y={2} width={4} height={50} rx={2} fill={C.woodLight} />
      </G>
      <Path d="M14 56C14 44 26 40 40 40S66 44 66 56V74Q66 84 56 84H24Q14 84 14 74Z" fill={c.dark ? C.nightLine : C.night} />
      <Path d="M48 41C58 44 66 48 66 56V74Q66 84 56 84H50C56 74 58 54 48 41Z" fill={C.nightSoft} opacity={c.dark ? 0.6 : 0.8} />
      <Rect x={26} y={34} width={28} height={8} rx={3} fill={C.gold} />
      <Path d="M20 60H60" stroke={C.gold} strokeWidth={2} opacity={0.8} />
      <Path d={star8Path(40, 70, 6)} fill={C.gold} />
      <Path d="M20 52C20 48 22 46 26 45" stroke={C.white} strokeWidth={2.4} strokeLinecap="round" opacity={0.3} fill="none" />
    </>
  )),

  'prayer-mat': art(90, 120, (c) => (
    <>
      <Shadow c={c} cx={45} cy={114} rx={38} ry={5} />
      <Rect x={10} y={6} width={70} height={106} rx={6} fill={C.plum} />
      <Rect x={16} y={12} width={58} height={94} rx={4} fill="none" stroke={C.gold} strokeWidth={2.4} />
      <Path d={archPath(45, 22, 34, 78)} fill={shade(C.plum, 0.25)} />
      <Path d={archPath(45, 22, 34, 78)} fill="none" stroke={C.gold} strokeWidth={1.8} />
      <Path d={star8Path(45, 44, 6)} fill={C.gold} />
      <Path d="M20 86H70M20 94H70" stroke={C.gold} strokeWidth={1.4} opacity={0.6} />
      {[26, 36, 46, 56, 64].map((x) => (
        <Path key={x} d={`M${x} 90l3-3 3 3-3 3Z`} fill={C.goldLight} />
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <Path key={i} d={`M${14 + i * 6.2} 112V117`} stroke={C.goldLight} strokeWidth={1.6} strokeLinecap="round" />
      ))}
    </>
  )),

  'prayer-beads': art(100, 100, (c) => {
    const beads = Array.from({ length: 33 }, (_, i) => {
      const a = (i / 33) * Math.PI * 2 + Math.PI / 2 + 0.2;
      return [50 + Math.cos(a) * 32, 44 + Math.sin(a) * 30];
    });
    return (
      <>
        <Shadow c={c} cx={50} cy={92} rx={30} />
        {beads.map(([x, y], i) => (
          <G key={i}>
            <Circle cx={x} cy={y} r={4.6} fill={i % 11 === 0 ? C.gold : C.teal} />
            <Circle cx={x - 1.3} cy={y - 1.3} r={1.4} fill={C.white} opacity={0.5} />
          </G>
        ))}
        <Path d="M50 74V82" stroke={C.gold} strokeWidth={2} />
        <Path d="M50 80C46 84 44 92 44 96H56C56 92 54 84 50 80Z" fill={C.gold} />
        <Rect x={46} y={78} width={8} height={5} rx={2.5} fill={C.goldDeep} />
      </>
    );
  }),

  compass: art(100, 100, (c) => (
    <>
      <Shadow c={c} cx={50} cy={94} rx={34} />
      <CompassFace />
    </>
  )),
  /** The compass without its ground shadow – for a compass that turns (Find the Qibla). */
  'compass-face': art(100, 100, () => <CompassFace />),

  'qibla-arrow': art(100, 100, (c) => (
    <>
      <Path d="M50 92V44" stroke={C.teal} strokeWidth={12} strokeLinecap="round" />
      <Path d="M28 52 50 30 72 52" stroke={C.teal} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Rect x={38} y={2} width={24} height={22} rx={2} fill={c.dark ? '#2C2C34' : C.black} />
      <Rect x={38} y={8} width={24} height={4} fill={C.gold} />
      <Rect x={52} y={14} width={5} height={8} fill={C.gold} />
      {c.dark && <Rect x={38} y={2} width={24} height={22} rx={2} fill="none" stroke={C.goldPale} strokeWidth={1} opacity={0.5} />}
    </>
  )),

  'kaaba-icon': art(100, 100, (c) => (
    <>
      <Shadow c={c} cx={50} cy={90} rx={40} />
      {c.dark && <Rect x={12} y={18} width={76} height={74} rx={6} fill={C.goldPale} opacity={0.12} />}
      <Rect x={14} y={20} width={72} height={70} rx={4} fill={C.black} />
      <Rect x={14} y={20} width={72} height={8} rx={4} fill="#2E2E36" />
      <Rect x={14} y={34} width={72} height={10} fill={C.gold} />
      <Path d="M14 39H86" stroke={C.goldPale} strokeWidth={1} opacity={0.7} />
      <Rect x={58} y={56} width={16} height={26} rx={1.5} fill={C.gold} />
      <Rect x={61} y={59} width={10} height={20} rx={1} fill={C.goldDeep} />
    </>
  )),

  clock: art(100, 100, (c) => (
    <>
      <Shadow c={c} cx={50} cy={94} rx={30} />
      <Circle cx={50} cy={50} r={44} fill={C.teal} />
      <Circle cx={50} cy={50} r={38} fill={C.cream} />
      {Array.from({ length: 12 }, (_, i) => (
        <Circle key={i} cx={50} cy={17} r={i % 3 === 0 ? 3 : 1.8} fill={i % 3 === 0 ? C.gold : C.sandDark} transform={`rotate(${i * 30} 50 50)`} />
      ))}
      <Path d="M50 50 50 28" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
      <Path d="M50 50 66 58" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
      <Circle cx={50} cy={50} r={4} fill={C.gold} />
    </>
  )),

  sundial: art(110, 90, (c) => (
    <>
      <Shadow c={c} cx={55} cy={84} rx={44} />
      <Path d="M30 84 34 56H76L80 84Z" fill={C.stoneLight} />
      <Path d="M60 56H76L80 84H62Z" fill={C.stone} opacity={0.5} />
      <Ellipse cx={55} cy={54} rx={46} ry={14} fill={C.stone} />
      <Ellipse cx={55} cy={52} rx={46} ry={14} fill={C.stonePale} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI + (i / 8) * Math.PI;
        return <Circle key={i} cx={55 + Math.cos(a) * 38} cy={52 + Math.sin(a) * 11} r={1.8} fill={C.stoneDark} />;
      })}
      <Path d="M55 52 22 60" stroke={C.stoneDark} strokeWidth={3} strokeLinecap="round" opacity={0.45} />
      <Path d="M55 52V24L78 52Z" fill={C.gold} />
      <Path d="M55 24 78 52H68Z" fill={C.goldDeep} />
    </>
  )),

  'water-jug': art(80, 110, (c) => (
    <>
      <Shadow c={c} cx={40} cy={104} rx={26} />
      <Path d="M60 50C68 44 74 34 78 22L74 20C70 30 64 38 56 44Z" fill={C.goldDeep} />
      <Path d="M18 46C8 46 6 66 18 72" stroke={C.goldDeep} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d="M30 24C30 34 18 40 16 60 14 82 24 98 40 98S66 82 64 60C62 40 50 34 50 24Z" fill={C.terracotta} />
      <Path d="M50 30C54 40 64 48 64 62 64 80 56 94 44 98 56 84 58 56 50 30Z" fill={shade(C.terracotta, 0.2)} opacity={0.7} />
      <Rect x={27} y={18} width={26} height={7} rx={3} fill={C.goldDeep} />
      <Path d="M28 18Q40 6 52 18Z" fill={C.gold} />
      <Path d="M17 64H63" stroke={C.gold} strokeWidth={3} />
      <Path d="M24 50C24 44 26 40 30 38" stroke={C.white} strokeWidth={3} strokeLinecap="round" opacity={0.35} fill="none" />
    </>
  )),

  cup: art(80, 80, (c) => (
    <>
      <Shadow c={c} cx={40} cy={74} rx={26} />
      <Path d="M14 26H66L60 66Q58 74 50 74H30Q22 74 20 66Z" fill={C.clay} />
      <Path d="M50 26H66L60 66Q58 74 50 74H44Z" fill={shade(C.clay, 0.2)} opacity={0.6} />
      <Ellipse cx={40} cy={26} rx={26} ry={6} fill={shade(C.clay, 0.15)} />
      <Ellipse cx={40} cy={27} rx={22} ry={4} fill={C.water} />
      <Path d="M20 44H60" stroke={C.cream} strokeWidth={2.4} opacity={0.8} />
      <Path d="M28 27Q34 25 40 25.5" stroke={C.white} strokeWidth={1.4} strokeLinecap="round" opacity={0.7} fill="none" />
    </>
  )),

  dates: art(100, 90, (c) => (
    <>
      <Shadow c={c} cx={50} cy={84} rx={34} />
      <Path d="M50 4C50 14 48 22 46 30" stroke={C.woodPale} strokeWidth={4} strokeLinecap="round" fill="none" />
      {[[30, 36], [44, 40], [58, 36], [70, 42], [24, 52], [38, 56], [52, 54], [66, 58], [32, 70], [46, 72], [60, 70], [76, 54]].map(([x, y], i) => (
        <G key={i}>
          <Path d={`M47 30Q${(x + 47) / 2} ${y - 16} ${x} ${y - 9}`} stroke={C.woodPale} strokeWidth={1.4} fill="none" />
          <Ellipse cx={x} cy={y} rx={6.4} ry={9} fill={i % 3 === 0 ? '#8A4520' : '#7A3B1F'} />
          <Ellipse cx={x - 2} cy={y - 3} rx={1.8} ry={3} fill={C.white} opacity={0.3} />
        </G>
      ))}
    </>
  )),

  bread: art(100, 70, (c) => (
    <>
      <Shadow c={c} cx={50} cy={60} rx={44} />
      <Ellipse cx={50} cy={42} rx={44} ry={18} fill={C.sandDark} />
      <Ellipse cx={50} cy={38} rx={44} ry={18} fill="#E2B577" />
      <Ellipse cx={50} cy={36} rx={34} ry={12} fill="#EBC58E" />
      {[[34, 32], [48, 28], [62, 34], [42, 40], [58, 42], [70, 30]].map(([x, y], i) => (
        <Ellipse key={i} cx={x} cy={y} rx={3.6} ry={2} fill={C.woodLight} opacity={0.65} />
      ))}
    </>
  )),

  milk: art(80, 100, (c) => (
    <>
      <Shadow c={c} cx={40} cy={94} rx={26} />
      <Path d="M58 40C74 38 74 66 58 66" stroke={C.clay} strokeWidth={5} fill="none" strokeLinecap="round" />
      <Path d="M22 22C22 34 14 44 14 64 14 84 24 94 40 94S66 84 66 64C66 44 58 34 58 22Z" fill={C.clay} />
      <Path d="M50 26C56 38 66 46 66 64 66 82 58 92 46 94 58 78 60 50 50 26Z" fill={shade(C.clay, 0.2)} opacity={0.6} />
      <Path d="M14 60H66" stroke={C.cream} strokeWidth={3} opacity={0.9} />
      <Path d="M20 22H60L56 16H24Z" fill={shade(C.clay, 0.12)} />
      <Path d="M24 16 14 12 20 20Z" fill={shade(C.clay, 0.12)} />
      <Ellipse cx={40} cy={18} rx={15} ry={3} fill={C.white} />
      <Path d="M22 46C22 38 24 34 28 30" stroke={C.white} strokeWidth={3} strokeLinecap="round" opacity={0.35} fill="none" />
    </>
  )),

  honey: art(90, 100, (c) => (
    <>
      <Shadow c={c} cx={45} cy={94} rx={32} />
      <Path d="M16 40C10 56 12 80 22 88 30 94 60 94 68 88 78 80 80 56 74 40Z" fill={C.goldDeep} />
      <Path d="M18 44C14 58 16 78 24 84 34 88 56 88 66 84 74 78 76 58 72 44Z" fill={C.gold} />
      <Path d="M14 34H76V44H14Z" fill={C.cream} />
      <Path d="M14 44C18 50 22 44 26 50 30 56 34 44 40 48S50 54 54 46 62 52 66 46 74 48 76 44" fill={C.cream} />
      <Rect x={12} y={28} width={66} height={8} rx={3} fill={C.terracotta} />
      <Path d="M40 52C38 60 40 62 42 60 42 58 42 56 40 52Z" fill={C.goldLight} />
      <Path d={starPath(45, 70, 9, 7.8, 6, -90)} fill={C.goldLight} opacity={0.7} />
      <Path d="M62 10 52 44" stroke={C.woodLight} strokeWidth={4} strokeLinecap="round" />
      <Ellipse cx={64} cy={8} rx={6} ry={4} fill={C.woodLight} transform="rotate(-20 64 8)" />
    </>
  )),

  fire: art(90, 110, (c) => (
    <>
      <Glow c={c} k="g" cx={45} cy={64} r={44} color={C.goldPale} opacity={c.dark ? 0.6 : 0.45} />
      <Shadow c={c} cx={45} cy={102} rx={36} />
      <Flame x={45} y={92} s={1.5} />
      <Rect x={14} y={88} width={62} height={10} rx={5} fill={C.wood} transform="rotate(12 45 93)" />
      <Rect x={14} y={88} width={62} height={10} rx={5} fill={C.woodLight} transform="rotate(-12 45 93)" />
      <Circle cx={18} cy={86} r={3} fill={C.woodPale} transform="rotate(-12 45 93)" />
    </>
  )),

  tent: art(140, 100, (c) => (
    <>
      <Shadow c={c} cx={70} cy={92} rx={66} ry={6} />
      <Path d="M8 92 22 40Q46 30 70 34 94 30 118 40L132 92Z" fill="#5A3A2A" />
      {[46, 58, 70].map((y, i) => (
        <Path key={y} d={`M${18 - i * 2} ${y}Q70 ${y - 6} ${122 + i * 2} ${y}`} stroke="#8A5A3A" strokeWidth={3} fill="none" />
      ))}
      <Path d="M48 92V58Q70 50 92 58V92Z" fill="#2E1E16" />
      <Path d="M48 58Q70 50 92 58L86 66Q70 60 54 66Z" fill={C.berry} />
      <Path d="M22 40V92M118 40V92M70 34V20" stroke={C.woodDark} strokeWidth={3} />
      <Path d="M22 40 4 92M118 40 136 92" stroke={C.woodPale} strokeWidth={1.4} />
      {c.dark && <Path d="M58 92V70Q70 64 82 70V92Z" fill={C.goldLight} opacity={0.25} />}
    </>
  )),

  'camel-saddle': art(110, 80, (c) => (
    <>
      <Shadow c={c} cx={55} cy={74} rx={46} />
      <Path d="M14 40Q55 22 96 40L90 66Q55 56 20 66Z" fill={C.berry} />
      <Path d="M20 50Q55 38 90 50" stroke={C.gold} strokeWidth={3} fill="none" />
      {[24, 36, 48, 60, 72, 84].map((x) => (
        <Path key={x} d={`M${x} ${66 - (x - 55) * (x - 55) * 0.004 - 4}v10`} stroke={C.gold} strokeWidth={2.4} strokeLinecap="round" />
      ))}
      <Path d="M24 40C22 24 28 14 34 12M86 40C88 24 82 14 76 12" stroke={C.woodLight} strokeWidth={6} strokeLinecap="round" fill="none" />
      <Circle cx={34} cy={12} r={5} fill={C.wood} />
      <Circle cx={76} cy={12} r={5} fill={C.wood} />
      <Path d="M30 34Q55 26 80 34" stroke={C.woodLight} strokeWidth={6} strokeLinecap="round" fill="none" />
    </>
  )),

  rope: art(100, 80, (c) => (
    <>
      <Shadow c={c} cx={50} cy={72} rx={42} />
      {[38, 30, 22, 14].map((r, i) => (
        <Ellipse key={r} cx={50} cy={50 - i * 2} rx={r + 8} ry={(r + 8) * 0.42} fill="none" stroke={i % 2 ? C.sandDark : C.sandDeep} strokeWidth={7} />
      ))}
      <Ellipse cx={50} cy={42} rx={10} ry={4} fill={C.sandDark} />
      <Path d="M86 50C94 46 96 36 90 30" stroke={C.sandDeep} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Path d="M88 32l6 -2" stroke={C.sandLight} strokeWidth={3} strokeLinecap="round" />
    </>
  )),

  'spider-web': art(100, 100, (c) => {
    const col = c.dark ? C.white : '#8C93AE';
    const spokes = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);
    const ring = (r: number) => spokes.map((a, i) => `${i ? 'L' : 'M'}${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)}`).join('') + 'Z';
    return (
      <>
        <G stroke={col} strokeWidth={1.6} fill="none" strokeLinejoin="round" opacity={0.9}>
          {spokes.map((a, i) => (
            <Path key={i} d={`M50 50L${(50 + Math.cos(a) * 46).toFixed(1)} ${(50 + Math.sin(a) * 46).toFixed(1)}`} />
          ))}
          {[10, 20, 30, 40].map((r) => (
            <Path key={r} d={ring(r)} />
          ))}
        </G>
        <Path d="M74 8V30" stroke={col} strokeWidth={1.2} />
        <Ellipse cx={74} cy={34} rx={4.5} ry={5.5} fill={c.dark ? C.greyDark : C.ink} />
        <Circle cx={74} cy={28.5} r={3} fill={c.dark ? C.greyDark : C.ink} />
      </>
    );
  }),

  'dove-nest': art(100, 80, (c) => (
    <>
      <Shadow c={c} cx={50} cy={74} rx={42} />
      {!c.dark && <Path d="M30 50C26 36 40 26 56 28 62 22 74 22 78 30L86 32 78 36C76 46 66 50 54 50Z" fill="#C5CEDF" transform="translate(0 1.5)" />}
      <Path d="M30 46 18 38 22 50Z" fill="#DDE3EE" />
      <Ellipse cx={50} cy={42} rx={22} ry={13} fill={C.white} />
      <Path d="M34 40C40 32 54 30 62 36 56 46 44 48 34 40Z" fill="#E3E8F2" />
      <Circle cx={70} cy={30} r={8} fill={C.white} />
      <Path d="M77 28 84 30 77 32Z" fill={C.coral} />
      <Eye x={72} y={28} r={1.5} />
      <Path d="M8 48Q50 40 92 48 88 72 50 74 12 72 8 48Z" fill={C.woodLight} />
      {[54, 60, 66].map((y) => (
        <Path key={y} d={`M${12 + (y - 48)} ${y}Q50 ${y + 6} ${88 - (y - 48)} ${y}`} stroke={C.wood} strokeWidth={2} fill="none" opacity={0.7} />
      ))}
      <Path d="M10 48l-6-4M90 48l6-5M30 70l-6 4M72 70l6 4M20 50l-4-8M80 50l5-8" stroke={C.woodLight} strokeWidth={2} strokeLinecap="round" />
      <Path d="M8 48Q50 54 92 48" stroke={C.woodDark} strokeWidth={2.4} fill="none" />
      <Ellipse cx={22} cy={50} rx={5} ry={6} fill={C.cream} />
      <Ellipse cx={80} cy={51} rx={4.4} ry={5.4} fill={C.cream} />
    </>
  )),

  'well-bucket': art(90, 100, (c) => (
    <>
      <Shadow c={c} cx={45} cy={94} rx={32} />
      <Path d="M18 40Q45 2 72 40" stroke={C.sandDeep} strokeWidth={3} fill="none" />
      <Path d="M16 40H74L68 88Q67 94 60 94H30Q23 94 22 88Z" fill={C.woodLight} />
      <Path d="M56 40H74L68 88Q67 94 60 94H54Z" fill={C.wood} opacity={0.4} />
      <Path d="M30 40 32 94M45 40V94M60 40 58 94" stroke={C.wood} strokeWidth={1.2} opacity={0.6} />
      <Rect x={17} y={52} width={56} height={5} fill={C.stoneDark} />
      <Rect x={20} y={78} width={50} height={5} fill={C.stoneDark} />
      <Ellipse cx={45} cy={40} rx={29} ry={6} fill={C.wood} />
      <Ellipse cx={45} cy={40} rx={25} ry={4} fill={C.water} />
      <Path d="M32 39Q40 37 46 37.5" stroke={C.white} strokeWidth={1.4} strokeLinecap="round" opacity={0.7} fill="none" />
    </>
  )),

  coins: art(100, 80, (c) => (
    <>
      <Shadow c={c} cx={50} cy={74} rx={42} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Coin key={i} x={36} y={70 - i * 7} r={18} />
      ))}
      {[0, 1, 2].map((i) => (
        <Coin key={i} x={66} y={72 - i * 7} r={16} />
      ))}
      <FlatCoin x={80} y={30} r={14} />
    </>
  )),

  'coin-jar': art(90, 100, (c) => (
    <>
      <Shadow c={c} cx={45} cy={95} rx={32} />
      <Path d="M24 22H66V30C78 36 82 50 82 64 82 84 70 94 45 94S8 84 8 64C8 50 12 36 24 30Z" fill={c.dark ? '#3A4A7A' : '#D7EEF6'} opacity={0.9} />
      <FlatCoin x={30} y={78} r={11} />
      <FlatCoin x={52} y={80} r={11} />
      <FlatCoin x={66} y={70} r={10} />
      <FlatCoin x={40} y={64} r={10} />
      <FlatCoin x={58} y={56} r={9} />
      <Path d="M16 52C16 44 20 38 26 34" stroke={C.white} strokeWidth={4} strokeLinecap="round" opacity={0.6} fill="none" />
      <Rect x={20} y={14} width={50} height={10} rx={4} fill={C.wood} />
      <Rect x={36} y={16} width={18} height={3} rx={1.5} fill={C.woodDark} />
    </>
  )),

  gift: art(90, 90, (c) => (
    <>
      <Shadow c={c} cx={45} cy={86} rx={36} />
      <Rect x={12} y={40} width={66} height={46} rx={5} fill={C.tealMid} />
      <Rect x={50} y={40} width={28} height={46} fill={C.teal} opacity={0.5} />
      <Rect x={8} y={30} width={74} height={14} rx={4} fill={C.tealLight} />
      <Rect x={40} y={30} width={10} height={56} fill={C.gold} />
      <Path d="M45 30C36 14 20 14 22 24 24 32 36 30 45 30ZM45 30C54 14 70 14 68 24 66 32 54 30 45 30Z" fill={C.gold} />
      <Path d="M45 30C40 22 32 20 30 24M45 30C50 22 58 20 60 24" stroke={C.goldDeep} strokeWidth={1.6} fill="none" />
      <Path d={star8Path(28, 64, 6)} fill={C.goldLight} opacity={0.8} />
      <Path d={star8Path(62, 64, 6)} fill={C.goldLight} opacity={0.8} />
    </>
  )),

  envelope: art(110, 80, (c) => (
    <>
      <Shadow c={c} cx={55} cy={74} rx={46} />
      <Rect x={8} y={10} width={94} height={62} rx={6} fill={C.cream} />
      <Path d="M8 66 46 38H64L102 66V68Q102 72 96 72H14Q8 72 8 68Z" fill={C.sandLight} />
      <Path d="M10 12 55 46 100 12" fill={C.sandLight} />
      <Path d="M10 12 55 46 100 12" stroke={C.sandDeep} strokeWidth={1.4} fill="none" />
      <Circle cx={55} cy={44} r={11} fill={C.berry} />
      <Path d={star8Path(55, 44, 6)} fill={C.goldLight} />
      {!c.dark && <Rect x={8} y={10} width={94} height={62} rx={6} fill="none" stroke={C.sandDeep} strokeWidth={1.2} />}
    </>
  )),

  key: art(110, 60, (c) => (
    <>
      <Shadow c={c} cx={56} cy={54} rx={40} ry={4} />
      <Path d="M36 26H98V34H92V44H84V34H78V40H72V34H36Z" fill={C.gold} />
      <Path d="M36 32H98V34H36Z" fill={C.goldDeep} />
      <Circle cx={24} cy={30} r={18} fill={C.gold} />
      <Path d={star8Path(24, 30, 10)} fill={C.goldDeep} />
      <Circle cx={24} cy={30} r={4.4} fill={C.gold} />
      <Path d="M14 20Q18 16 24 15" stroke={C.goldPale} strokeWidth={2.4} strokeLinecap="round" fill="none" />
    </>
  )),

  shield: art(90, 100, (c) => (
    <>
      <Shadow c={c} cx={45} cy={95} rx={32} />
      <Circle cx={45} cy={50} r={42} fill={C.woodDark} />
      <Circle cx={45} cy={50} r={38} fill={C.woodLight} />
      <Circle cx={45} cy={50} r={28} fill={C.wood} />
      {Array.from({ length: 12 }, (_, i) => (
        <Circle key={i} cx={45} cy={16} r={2.2} fill={C.gold} transform={`rotate(${i * 30} 45 50)`} />
      ))}
      <Path d={star8Path(45, 50, 18)} fill={C.gold} />
      <Circle cx={45} cy={50} r={7} fill={C.goldDeep} />
      <Circle cx={43} cy={48} r={2.4} fill={C.goldPale} />
    </>
  )),

  crescent: art(100, 100, () => (
    <>
      <Path d={crescentPath(46, 52, 40, 18, -14, 32)} fill={C.gold} />
      <Path d={crescentPath(46, 52, 40, 10, -8, 37)} fill={C.goldLight} />
    </>
  )),

  star8: art(100, 100, (c) => (
    <>
      <Path d={star8Path(50, 50, 46)} fill={C.gold} />
      <Path d={star8Path(50, 50, 38)} fill={C.goldLight} />
      <Circle cx={50} cy={50} r={13} fill={c.dark ? C.nightLine : C.night} />
    </>
  )),

  'lantern-ramadan': art(70, 110, (c) => (
    <>
      <Glow c={c} k="g" cx={35} cy={62} r={34} color={C.goldPale} opacity={c.dark ? 0.75 : 0.55} />
      <Circle cx={35} cy={7} r={4} fill="none" stroke={C.goldDeep} strokeWidth={2} />
      <Path d="M35 11V18" stroke={C.goldDeep} strokeWidth={2} />
      <Path d={domePath(35, 32, 16, 1)} fill={C.gold} />
      <Rect x={17} y={30} width={36} height={6} rx={2} fill={C.goldDeep} />
      <Path d="M19 36H51L58 56 51 80H19L12 56Z" fill={C.goldDeep} />
      <Path d="M22 39H33V77H22L16 56Z" fill={C.berry} opacity={0.9} />
      <Path d="M37 39H48L54 56 48 77H37Z" fill={C.tealLight} opacity={0.9} />
      <Path d="M33 39H37V77H33Z" fill={C.goldLight} />
      <Path d="M24 50l4 6-4 6-4-6ZM44 50l4 6-4 6-4-6Z" fill={C.goldPale} />
      <Path d="M17 80H53L46 90H24Z" fill={C.gold} />
      <Path d="M31 90H39L35 100Z" fill={C.goldDeep} />
      <Path d="M24 40C22 46 20 50 20 56" stroke={C.white} strokeWidth={2} strokeLinecap="round" opacity={0.4} fill="none" />
    </>
  )),

  plate: art(100, 60, (c) => (
    <>
      <Shadow c={c} cx={50} cy={52} rx={44} ry={5} />
      <Ellipse cx={50} cy={34} rx={46} ry={18} fill={C.tealMid} />
      <Ellipse cx={50} cy={32} rx={46} ry={18} fill={C.cream} />
      <Ellipse cx={50} cy={32} rx={40} ry={15} fill="none" stroke={C.teal} strokeWidth={3} />
      <Ellipse cx={50} cy={33} rx={28} ry={9.5} fill={C.ivory} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <Circle key={i} cx={50 + Math.cos(a) * 34} cy={32 + Math.sin(a) * 12.6} r={1.6} fill={C.gold} />;
      })}
    </>
  )),

  bowl: art(100, 70, (c) => (
    <>
      <Shadow c={c} cx={50} cy={64} rx={34} />
      <Path d="M6 26Q8 60 36 62H64Q92 60 94 26Z" fill={C.tealMid} />
      <Path d="M70 26H94Q92 60 64 62H54Q74 52 70 26Z" fill={C.teal} opacity={0.6} />
      <Path d="M12 38Q50 46 88 38" stroke={C.gold} strokeWidth={3} fill="none" />
      {[24, 38, 50, 62, 76].map((x) => (
        <Path key={x} d={star8Path(x, 50 - Math.abs(x - 50) * 0.08, 3)} fill={C.goldLight} />
      ))}
      <Ellipse cx={50} cy={26} rx={44} ry={9} fill={C.teal} />
      <Ellipse cx={50} cy={27} rx={40} ry={7} fill={C.cream} />
      <Rect x={38} y={62} width={24} height={4} rx={2} fill={C.teal} />
    </>
  )),

  // --- extras ---
  well: art(80, 90, (c) => (
    <>
      <Shadow c={c} cx={40} cy={84} rx={30} />
      <Well c={c} x={40} y={84} s={1.5} />
    </>
  )),

  boat: art(120, 80, (c) => (
    <>
      <Path d="M4 70q7-5 14 0t14 0 14 0 14 0 14 0 14 0 14 0 14 0" stroke={C.water} strokeWidth={3.4} strokeLinecap="round" fill="none" />
      <Path d="M10 52H110L98 66Q94 70 86 70H34Q26 70 22 66Z" fill={C.woodLight} />
      <Path d="M60 52H110L98 66Q94 70 86 70H60Z" fill={C.wood} opacity={0.45} />
      <Rect x={8} y={48} width={104} height={6} rx={3} fill={C.wood} />
      <Path d="M58 48V6" stroke={C.woodDark} strokeWidth={3} />
      <Path d="M61 8C80 18 92 32 96 44H61Z" fill={C.cream} />
      <Path d="M55 14C42 24 32 36 28 44H55Z" fill={C.sandLight} />
      {!c.dark && <Path d="M61 8C80 18 92 32 96 44H61Z" fill="none" stroke={C.sandDeep} strokeWidth={1} />}
    </>
  )),

  hourglass: art(70, 100, (c) => (
    <>
      <Shadow c={c} cx={35} cy={94} rx={26} />
      <Path d="M16 12H54C54 32 40 42 38 50 40 58 54 68 54 88H16C16 68 30 58 32 50 30 42 16 32 16 12Z" fill={c.dark ? '#3A4A7A' : '#DCEFF6'} />
      <Path d="M22 22H48C46 32 38 38 35 44 32 38 24 32 22 22Z" fill={C.sand} />
      <Path d="M34 50H36V80H34Z" fill={C.sand} />
      <Path d="M20 86C22 76 30 70 35 70S48 76 50 86Z" fill={C.sandDeep} />
      <Rect x={8} y={6} width={54} height={8} rx={3} fill={C.woodLight} />
      <Rect x={8} y={86} width={54} height={8} rx={3} fill={C.woodLight} />
      <Rect x={10} y={14} width={4} height={72} rx={2} fill={C.wood} />
      <Rect x={56} y={14} width={4} height={72} rx={2} fill={C.wood} />
    </>
  )),
} satisfies Record<string, ArtDef>;

export { Coin, FlatCoin, Flame, Pot };
