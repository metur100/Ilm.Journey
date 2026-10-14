import { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { archPath, art, Blossom, Cloud, crescentPath, domePath, dropPath, Eye, Glow, LeafyTree, leafPath, Lin, Palm, Shadow, sparklePath, starPath, type ArtDef, type Ctx } from '../kit';
import { C, shade } from '../palette';
import { BeeShape, DoveShape } from './shared';

/** Garden elements are bottom-anchored (they stand on the bottom edge) unless they fly or float in the sky. */

function Leaf({ c, x, y, L, w, a, color = C.leaf }: { c: Ctx; x: number; y: number; L: number; w: number; a: number; color?: string }) {
  return <Path d={leafPath(x, y, L, w, a)} fill={c.green(color)} />;
}

function SoilMound({ c, cx, cy, rx }: { c: Ctx; cx: number; cy: number; rx: number }) {
  return (
    <G>
      <Shadow c={c} cx={cx} cy={cy + 1} rx={rx * 1.1} />
      <Path d={`M${cx - rx} ${cy}Q${cx} ${cy - rx * 0.55} ${cx + rx} ${cy}Z`} fill={C.woodLight} />
      <Path d={`M${cx - rx * 0.2} ${cy - rx * 0.24}Q${cx + rx * 0.5} ${cy - rx * 0.26} ${cx + rx} ${cy}H${cx + rx * 0.3}Z`} fill={C.wood} opacity={0.5} />
    </G>
  );
}

function FruitTree(props: { c: Ctx; leaf: string; leafDark: string; leafLight: string; fruit: string; fruitR?: number; blobs?: [number, number, number][]; fruits?: [number, number][]; trunk?: string }) {
  return (
    <>
      <Shadow c={props.c} cx={60} cy={124} rx={40} />
      <LeafyTree x={60} y={124} s={1.18} {...props} />
    </>
  );
}

export const garden = {
  palm: art(120, 160, (c) => (
    <>
      <Shadow c={c} cx={58} cy={153} rx={30} />
      <Palm c={c} x={56} y={153} h={112} lean={8} dates />
    </>
  )),

  olive: art(120, 130, (c) => (
    <FruitTree
      c={c}
      leaf={C.olive}
      leafDark={C.oliveDark}
      leafLight="#A9BE84"
      trunk={C.stoneDark}
      fruit="#4A3B52"
      fruitR={2.6}
      blobs={[
        [0, -56, 24],
        [-26, -50, 19],
        [26, -50, 19],
        [-12, -70, 18],
        [14, -70, 18],
        [-38, -42, 12],
        [38, -42, 12],
      ]}
      fruits={[[-20, -46], [-14, -44], [6, -52], [12, -50], [28, -44], [-4, -66], [20, -62], [-30, -56]]}
    />
  )),

  fig: art(120, 130, (c) => (
    <FruitTree
      c={c}
      leaf="#3F8F4E"
      leafDark={C.leafDeep}
      leafLight={C.leafLight}
      fruit="#7B3F6E"
      fruitR={4}
      blobs={[
        [0, -58, 26],
        [-24, -48, 21],
        [24, -48, 21],
        [-12, -76, 17],
        [13, -76, 17],
      ]}
      fruits={[[-20, -42], [10, -50], [26, -40], [-6, -70], [-28, -58], [20, -66]]}
    />
  )),

  pomegranate: art(120, 130, (c) => (
    <>
      <FruitTree
        c={c}
        leaf={C.leaf}
        leafDark={C.leafDark}
        leafLight={C.leafLight}
        fruit={C.berry}
        fruitR={5.2}
        blobs={[
          [0, -60, 25],
          [-23, -48, 21],
          [23, -48, 21],
          [-10, -76, 17],
          [12, -74, 17],
        ]}
        fruits={[[-20, -40], [8, -48], [27, -38], [-6, -70], [-30, -58], [22, -66]]}
      />
      {[[-20, -40], [8, -48], [27, -38], [-6, -70], [-30, -58], [22, -66]].map(([x, y], i) => (
        <G key={i}>
          <Path d={`M${60 + x * 1.18 - 2} ${124 + y * 1.18 - 5.4}l2-3 2 3Z`} fill={c.bloom(shade(C.berry, 0.25))} />
          <Circle cx={60 + x * 1.18 - 1.8} cy={124 + y * 1.18 - 1.8} r={1.6} fill="#FFFFFF" opacity={0.45} />
        </G>
      ))}
    </>
  )),

  lemon: art(120, 130, (c) => (
    <FruitTree
      c={c}
      leaf="#4FA35A"
      leafDark={C.leafDark}
      leafLight={C.leafPale}
      fruit={C.lemon}
      fruitR={4.4}
      fruits={[[-20, -42], [8, -50], [26, -40], [-6, -68], [-28, -56], [20, -66], [-2, -38]]}
    />
  )),

  'date-palm-young': art(110, 110, (c) => (
    <>
      <Shadow c={c} cx={55} cy={104} rx={30} />
      <Palm c={c} x={52} y={104} h={44} lean={3} fronds={2} />
    </>
  )),

  sapling: art(80, 90, (c) => (
    <>
      <SoilMound c={c} cx={40} cy={84} rx={24} />
      <Path d="M39 80C38 64 40 50 42 34" stroke={C.wood} strokeWidth={3.2} strokeLinecap="round" fill="none" />
      <Leaf c={c} x={41} y={60} L={20} w={6} a={-150} color={C.leafDark} />
      <Leaf c={c} x={40} y={52} L={20} w={6} a={-30} />
      <Leaf c={c} x={42} y={40} L={18} w={5.5} a={-140} color={C.leafLight} />
      <Leaf c={c} x={42} y={36} L={16} w={5} a={-60} />
      <Leaf c={c} x={42} y={34} L={12} w={4} a={-95} color={C.leafLight} />
    </>
  )),

  bush: art(110, 80, (c) => (
    <>
      <Shadow c={c} cx={55} cy={74} rx={46} />
      {[[30, 52, 22], [55, 42, 26], [80, 52, 22], [44, 60, 18], [68, 60, 18]].map(([x, y, r], i) => (
        <Circle key={`a${i}`} cx={x + 2} cy={y + 3} r={r} fill={c.green(C.leafDark)} />
      ))}
      {[[30, 50, 20], [55, 40, 24], [80, 50, 20], [44, 58, 16], [68, 58, 16]].map(([x, y, r], i) => (
        <Circle key={`b${i}`} cx={x} cy={y} r={r} fill={c.green(C.leaf)} />
      ))}
      <Circle cx={48} cy={32} r={9} fill={c.green(C.leafLight)} opacity={0.7} />
      <Circle cx={24} cy={44} r={6} fill={c.green(C.leafLight)} opacity={0.6} />
      <Path d="M14 74Q14 64 24 66H86Q96 64 96 74Z" fill={c.green(C.leafDark)} />
      <Blossom c={c} x={36} y={42} r={5} petal={C.pink} />
      <Blossom c={c} x={66} y={30} r={5} petal={C.white} />
      <Blossom c={c} x={78} y={56} r={4.5} petal={C.pink} />
    </>
  )),

  'flower-rose': art(60, 100, (c) => (
    <>
      <Shadow c={c} cx={30} cy={96} rx={14} />
      <Path d="M30 95C30 80 29 60 30 40" stroke={c.green(C.leafDark)} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Leaf c={c} x={30} y={72} L={18} w={6} a={-20} color={C.leafDark} />
      <Leaf c={c} x={30} y={60} L={16} w={5.5} a={-160} />
      <Path d="M15 32C14 16 22 10 30 10S46 16 45 32C42 42 18 42 15 32Z" fill={c.bloom(C.berry)} />
      <Path d="M18 28C20 16 26 14 30 18 34 14 40 16 42 28 38 34 22 34 18 28Z" fill={c.bloom(C.rose)} />
      <Path d="M23 24C25 18 35 18 37 24 34 28 26 28 23 24Z" fill={c.bloom(C.berry)} />
      <Path d="M27 21C29 18 32 19 33 22" stroke={c.bloom(shade(C.berry, 0.3))} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <Path d="M17 36Q22 44 30 43 38 44 43 36 36 42 30 40 23 42 17 36Z" fill={c.green(C.leaf)} />
    </>
  )),

  'flower-tulip': art(60, 100, (c) => (
    <>
      <Shadow c={c} cx={30} cy={96} rx={14} />
      <Path d="M30 95C30 80 30 60 30 40" stroke={c.green(C.leafDark)} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M30 95C22 86 16 70 18 54 26 62 30 76 30 95Z" fill={c.green(C.leaf)} />
      <Path d="M31 95C38 84 44 74 42 60 35 68 31 80 31 95Z" fill={c.green(C.leafDark)} />
      <Path d="M17 18C16 32 20 42 30 42S44 32 43 18L37 26 30 14 23 26Z" fill={c.bloom(C.coral)} />
      <Path d="M23 26L30 14 37 26C36 36 34 42 30 42S24 36 23 26Z" fill={c.bloom(C.orange)} />
      <Path d="M26 22 30 16 33 22C32 28 31 30 29 30" fill={c.bloom(C.gold)} opacity={0.6} />
    </>
  )),

  'flower-jasmine': art(80, 90, (c) => (
    <>
      <Shadow c={c} cx={40} cy={86} rx={26} />
      <Path d="M40 85C38 70 30 56 20 46M40 85C42 66 50 54 62 44M40 85C40 70 40 50 42 30" stroke={c.green(C.leafDark)} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <Leaf c={c} x={28} y={56} L={13} w={4.5} a={-170} color={C.leafDark} />
      <Leaf c={c} x={53} y={52} L={13} w={4.5} a={-10} color={C.leafDark} />
      <Leaf c={c} x={41} y={58} L={12} w={4} a={-40} />
      <Leaf c={c} x={40} y={46} L={12} w={4} a={-150} />
      <Leaf c={c} x={34} y={70} L={12} w={4} a={-160} />
      <Leaf c={c} x={46} y={72} L={12} w={4} a={-20} />
      {[[20, 42, 8], [62, 40, 8], [42, 26, 9], [30, 32, 6], [54, 30, 6]].map(([x, y, r], i) => (
        <G key={i}>
          <Path d={starPath(x, y, r, r * 0.5, 5)} fill={c.bloom(C.white)} stroke={c.bloom(C.white)} strokeWidth={r * 0.45} strokeLinejoin="round" />
          <Circle cx={x} cy={y} r={r * 0.22} fill={C.goldLight} />
        </G>
      ))}
      {c.dark ? null : (
        <G opacity={0.35}>
          <Path d={starPath(42, 26, 9, 4.5, 5)} fill="none" stroke={C.pinkPale} strokeWidth={1} />
        </G>
      )}
    </>
  )),

  'flower-lily': art(70, 100, (c) => (
    <>
      <Shadow c={c} cx={35} cy={96} rx={16} />
      <Path d="M35 95C35 80 34 62 35 46" stroke={c.green(C.leafDark)} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M34 95C22 88 14 74 14 58 26 66 32 80 34 95Z" fill={c.green(C.leaf)} />
      <Path d="M36 95C48 88 56 76 56 62 45 70 38 80 36 95Z" fill={c.green(C.leafDark)} />
      <Path d="M35 46C24 44 10 36 6 22 18 24 28 32 35 46Z" fill={c.bloom('#F6E7F0')} />
      <Path d="M35 46C46 44 60 36 64 22 52 24 42 32 35 46Z" fill={c.bloom('#F6E7F0')} />
      <Path d="M35 46C28 36 26 22 35 8 44 22 42 36 35 46Z" fill={c.bloom(C.white)} />
      <Path d="M35 46C26 40 20 28 22 16 30 24 34 34 35 46Z" fill={c.bloom(C.pinkPale)} />
      <Path d="M35 46C44 40 50 28 48 16 40 24 36 34 35 46Z" fill={c.bloom(C.pinkPale)} />
      <Path d="M35 44V24M35 44 30 28M35 44 40 28" stroke={C.goldDeep} strokeWidth={1.2} strokeLinecap="round" />
      <Circle cx={35} cy={23} r={2} fill={C.terracotta} />
      <Circle cx={30} cy={27} r={2} fill={C.terracotta} />
      <Circle cx={40} cy={27} r={2} fill={C.terracotta} />
    </>
  )),

  grass: art(100, 50, (c) => (
    <>
      <Path d="M6 48C10 30 12 20 10 8 16 22 18 34 18 48ZM18 48C22 28 28 18 36 12 30 26 28 38 28 48ZM28 48C30 34 30 22 26 14 34 24 38 36 38 48Z" fill={c.green(C.leafDark)} />
      <Path d="M40 48C44 30 50 20 58 14 52 28 50 38 50 48ZM50 48C52 32 50 18 46 6 56 20 60 34 60 48ZM60 48C64 34 72 24 82 20 74 30 70 40 70 48ZM70 48C72 36 74 26 72 14 80 26 82 38 80 48ZM80 48C84 36 88 28 96 24 90 34 90 42 90 48Z" fill={c.green(C.leaf)} />
      <Path d="M14 48C16 36 20 28 24 24 22 32 22 40 22 48ZM44 48C44 38 42 30 38 24 46 30 50 38 50 48ZM64 48C64 40 62 32 58 26 66 32 70 40 70 48Z" fill={c.green(C.leafLight)} />
      <Rect x={2} y={46} width={96} height={4} rx={2} fill={c.green(C.leafDark)} />
    </>
  )),

  fountain: art(120, 110, (c) => (
    <>
      <Defs>
        <Lin id={c.id('w')} stops={[[0, C.waterLight], [1, C.water]]} />
      </Defs>
      <Shadow c={c} cx={60} cy={102} rx={50} ry={7} />
      <Path d="M12 78H108V92Q108 102 98 102H22Q12 102 12 92Z" fill={C.stoneLight} />
      <Path d="M80 78H108V92Q108 102 98 102H80Z" fill={C.stone} opacity={0.6} />
      <Path d="M12 84H108" stroke={C.stone} strokeWidth={2} opacity={0.5} />
      <Ellipse cx={60} cy={78} rx={48} ry={9} fill={C.stonePale} />
      <Ellipse cx={60} cy={78} rx={42} ry={6} fill={c.url('w')} />
      <Path d="M30 78Q44 74 60 75" stroke={C.white} strokeWidth={1.6} strokeLinecap="round" opacity={0.7} fill="none" />
      <Rect x={53} y={44} width={14} height={34} rx={3} fill={C.stoneLight} />
      <Rect x={61} y={44} width={6} height={34} rx={2} fill={C.stone} opacity={0.5} />
      <Path d="M30 42Q60 64 90 42Z" fill={C.stoneLight} />
      <Ellipse cx={60} cy={42} rx={30} ry={5} fill={C.stonePale} />
      <Ellipse cx={60} cy={42} rx={25} ry={3.2} fill={c.url('w')} />
      <Path d="M31 43Q26 56 28 72M89 43Q94 56 92 72" stroke={C.waterLight} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.85} />
      <Path d="M60 40C60 28 56 18 46 16 52 22 54 30 54 40M60 40C60 28 64 18 74 16 68 22 66 30 66 40" fill={C.waterLight} opacity={0.9} />
      <Path d="M57 40C57 26 58 16 60 10 62 16 63 26 63 40Z" fill={C.waterPale} />
      <Circle cx={44} cy={14} r={2} fill={C.waterLight} />
      <Circle cx={76} cy={14} r={2} fill={C.waterLight} />
      <Circle cx={60} cy={6} r={1.8} fill={C.waterPale} />
      <G fill={C.teal} opacity={0.75}>
        <Rect x={18} y={88} width={8} height={8} rx={1.5} transform="rotate(45 22 92)" />
        <Rect x={56} y={88} width={8} height={8} rx={1.5} transform="rotate(45 60 92)" />
        <Rect x={94} y={88} width={8} height={8} rx={1.5} transform="rotate(45 98 92)" />
      </G>
    </>
  )),

  stream: art(200, 80, (c) => (
    <>
      <Defs>
        <Lin id={c.id('w')} x1={0} y1={0} x2={1} y2={0} stops={[[0, C.waterLight], [0.5, C.water], [1, C.waterLight]]} />
      </Defs>
      <Path d="M0 26C40 18 70 44 110 42S170 22 200 30V54C172 46 150 66 112 66S40 44 0 52Z" fill={c.url('w')} />
      <Path d="M14 34C34 30 50 40 66 44M120 50C140 48 156 40 176 38M86 56C96 58 106 58 116 57" stroke={C.white} strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.75} />
      {[[8, 24, 6], [26, 22, 4], [70, 36, 5], [150, 30, 5], [184, 26, 6], [40, 52, 5], [96, 68, 6], [140, 62, 4], [190, 56, 5]].map(([x, y, r], i) => (
        <Ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.6} fill={i % 2 ? C.stoneLight : C.stone} />
      ))}
    </>
  )),

  pond: art(140, 70, (c) => (
    <>
      <Defs>
        <Lin id={c.id('w')} stops={[[0, C.water], [1, C.waterDeep]]} />
      </Defs>
      <Ellipse cx={70} cy={42} rx={66} ry={26} fill={C.stoneLight} />
      <Ellipse cx={70} cy={44} rx={66} ry={24} fill={C.stone} opacity={0.4} />
      <Ellipse cx={70} cy={40} rx={58} ry={20} fill={c.url('w')} />
      <Path d="M30 34Q50 28 70 30" stroke={C.white} strokeWidth={2} strokeLinecap="round" opacity={0.6} fill="none" />
      <Path d="M40 46A9 5 0 1 1 49 41L40 46Z" fill={c.green(C.leaf)} />
      <Path d="M92 36A10 5.5 0 1 1 101 31L92 36Z" fill={c.green(C.leafDark)} />
      <Path d="M76 50A7 4 0 1 1 82 46L76 50Z" fill={c.green(C.leafLight)} />
      <Path d="M90 30C88 22 92 18 94 22 96 16 100 16 100 22 102 18 106 22 104 30Z" fill={c.bloom(C.pink)} />
      <Path d="M94 30C94 24 96 22 97 22 98 22 100 24 100 30Z" fill={c.bloom(C.pinkPale)} />
      {[[10, 34, 5], [130, 36, 6], [22, 58, 6], [116, 58, 5], [70, 64, 5]].map(([x, y, r], i) => (
        <Ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.65} fill={i % 2 ? C.stonePale : C.stoneLight} />
      ))}
    </>
  )),

  bench: art(110, 70, (c) => (
    <>
      <Shadow c={c} cx={55} cy={66} rx={46} ry={5} />
      <Rect x={14} y={42} width={7} height={24} rx={2} fill={C.woodDark} />
      <Rect x={89} y={42} width={7} height={24} rx={2} fill={C.woodDark} />
      <Rect x={16} y={8} width={6} height={36} rx={2} fill={C.woodDark} />
      <Rect x={88} y={8} width={6} height={36} rx={2} fill={C.woodDark} />
      <Rect x={10} y={12} width={90} height={9} rx={4} fill={C.woodLight} />
      <Rect x={10} y={25} width={90} height={9} rx={4} fill={C.woodLight} />
      <Rect x={10} y={12} width={90} height={3} rx={1.5} fill={C.woodPale} opacity={0.7} />
      <Rect x={6} y={40} width={98} height={9} rx={4} fill={C.woodPale} />
      <Rect x={6} y={46} width={98} height={4} rx={2} fill={C.wood} opacity={0.6} />
      <Rect x={4} y={34} width={14} height={5} rx={2.5} fill={C.woodDark} />
      <Rect x={92} y={34} width={14} height={5} rx={2.5} fill={C.woodDark} />
    </>
  )),

  'lantern-post': art(50, 130, (c) => (
    <>
      <Glow c={c} k="g" cx={25} cy={30} r={24} color={C.goldPale} opacity={c.dark ? 0.7 : 0.5} />
      <Shadow c={c} cx={25} cy={126} rx={14} />
      <Rect x={17} y={116} width={16} height={10} rx={3} fill={C.nightLine} />
      <Rect x={22} y={48} width={6} height={72} rx={3} fill={c.dark ? C.nightLine : C.nightSoft} />
      <Path d="M13 48H37L33 44H17Z" fill={C.goldDeep} />
      <Path d="M15 20H35L33 44H17Z" fill={C.gold} />
      <Path d="M19 24H31L29.5 40H20.5Z" fill={C.goldPale} />
      <Path d="M25 26C22 30 22 34 25 38 28 34 28 30 25 26Z" fill={C.orange} opacity={0.8} />
      <Path d="M12 20H38L25 8Z" fill={C.goldDeep} />
      <Circle cx={25} cy={6} r={3} fill={C.gold} />
    </>
  )),

  arch: art(110, 130, (c) => (
    <>
      <Shadow c={c} cx={55} cy={126} rx={50} ry={5} />
      <Path
        fillRule="evenodd"
        d={`M6 126V48Q6 10 55 4Q104 10 104 48V126Z${archPath(55, 30, 58, 126)}`}
        fill={C.sandLight}
      />
      <Path d="M84 126V58Q84 30 55 30" stroke={C.sandDeep} strokeWidth={6} fill="none" opacity={0.5} />
      <Path d="M6 48Q6 10 55 4Q104 10 104 48" stroke={C.terracotta} strokeWidth={5} fill="none" />
      <Path d="M27 60Q27 34 55 30Q83 34 83 60" stroke={C.teal} strokeWidth={4} fill="none" />
      <Rect x={4} y={60} width={24} height={8} rx={2} fill={C.teal} />
      <Rect x={82} y={60} width={24} height={8} rx={2} fill={C.teal} />
      <Rect x={4} y={118} width={24} height={8} rx={2} fill={C.sandDeep} />
      <Rect x={82} y={118} width={24} height={8} rx={2} fill={C.sandDeep} />
      <Path d={starPath(55, 16, 6, 4.6, 8)} fill={C.gold} />
      <Path d="M10 124C6 100 16 84 10 64" stroke={c.green(C.leafDark)} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <Leaf c={c} x={10} y={110} L={11} w={4} a={-20} />
      <Leaf c={c} x={12} y={96} L={11} w={4} a={-160} color={C.leafDark} />
      <Leaf c={c} x={12} y={84} L={11} w={4} a={-30} />
      <Leaf c={c} x={11} y={72} L={10} w={3.5} a={-150} />
      <Blossom c={c} x={16} y={90} r={4} petal={C.pink} />
      <Blossom c={c} x={8} y={70} r={3.6} petal={C.white} />
    </>
  )),

  'masjid-small': art(140, 120, (c) => (
    <>
      <Shadow c={c} cx={70} cy={113} rx={62} ry={6} />
      <Rect x={112} y={34} width={12} height={80} rx={2} fill={C.marble} />
      <Rect x={119} y={34} width={5} height={80} fill={C.stonePale} />
      <Rect x={109} y={50} width={18} height={5} rx={2} fill={C.gold} />
      <Path d="M112 34L118 18 124 34Z" fill={C.tealMid} />
      <Path d={crescentPath(118, 12, 3.6, 1.6, -1, 3)} fill={C.gold} />
      <Rect x={26} y={60} width={84} height={54} rx={3} fill={C.marble} />
      <Rect x={84} y={60} width={26} height={54} rx={3} fill={C.stonePale} />
      <Rect x={22} y={56} width={92} height={7} rx={3} fill={C.stonePale} />
      <Rect x={44} y={48} width={48} height={10} rx={2} fill={C.marble} />
      <Rect x={44} y={48} width={48} height={3} rx={1.5} fill={C.gold} />
      <Path d={domePath(68, 49, 24, 1.5)} fill={C.tealMid} />
      <Path d="M52 44C52 30 58 24 64 20 60 28 58 36 58 44Z" fill={C.tealLight} opacity={0.6} />
      <Rect x={67} y={6} width={2.5} height={10} fill={C.gold} />
      <Path d={crescentPath(68.2, 6, 4, 1.8, -1.2, 3.3)} fill={C.gold} />
      <Path d={archPath(68, 78, 18, 114)} fill={C.gold} />
      <Path d={archPath(68, 82, 12, 114)} fill={C.woodLight} />
      <Path d={archPath(40, 72, 11, 92)} fill={C.teal} />
      <Path d={archPath(96, 72, 11, 92)} fill={C.teal} />
      <Rect x={58} y={110} width={20} height={4} rx={1} fill={C.stoneLight} />
    </>
  )),

  minaret: art(50, 150, (c) => (
    <>
      <Shadow c={c} cx={25} cy={146} rx={18} />
      <Rect x={13} y={120} width={24} height={26} rx={2} fill={C.stonePale} />
      <Rect x={15} y={56} width={20} height={66} rx={2} fill={C.marble} />
      <Rect x={27} y={56} width={8} height={66} fill={C.stonePale} />
      <Path d={archPath(25, 84, 6, 98)} fill={C.teal} />
      <Path d="M9 52H41L37 60H13Z" fill={C.gold} />
      <Rect x={9} y={48} width={32} height={5} rx={2} fill={C.goldDeep} />
      <Rect x={18} y={30} width={14} height={19} rx={2} fill={C.marble} />
      <Rect x={27} y={30} width={5} height={19} fill={C.stonePale} />
      <Path d={archPath(25, 34, 5, 44)} fill={C.teal} />
      <Path d="M16 31L25 10 34 31Z" fill={C.tealMid} />
      <Path d="M25 10 34 31H28Z" fill={C.teal} />
      <Rect x={24.2} y={4} width={1.6} height={7} fill={C.gold} />
      <Path d={crescentPath(25, 4, 3.4, 1.5, -1, 2.8)} fill={C.gold} />
    </>
  )),

  bird: art(60, 45, (c) => (
    <>
      <Path d="M14 22 2 14 4 26Z" fill={c.dark ? C.woodLight : C.wood} />
      <Ellipse cx={28} cy={26} rx={17} ry={13} fill={C.terracotta} />
      <Path d="M18 30C24 40 38 40 44 30 38 36 26 36 18 30Z" fill={C.cream} />
      <Path d="M30 30C38 32 44 26 44 26 46 36 34 40 24 36Z" fill={C.cream} />
      <Path d="M14 24C20 16 30 18 34 26 28 30 18 30 14 24Z" fill={shade(C.terracotta, 0.25)} />
      <Circle cx={42} cy={17} r={10} fill={C.terracotta} />
      <Path d="M50 16 58 18 50 21Z" fill={C.gold} />
      <Eye x={45} y={15} r={1.9} />
      <Path d="M26 38V44M32 38V44" stroke={C.woodDark} strokeWidth={1.6} strokeLinecap="round" />
    </>
  )),

  dove: art(70, 50, (c) => <DoveShape c={c} x={2} y={3} s={0.93} />),

  bee: art(50, 40, (c) => <BeeShape c={c} x={25} y={22} s={1} />),

  butterfly: art(60, 50, (c) => (
    <>
      <Path d="M30 24C22 6 6 2 4 12 2 22 14 28 30 26Z" fill={c.bloom(C.tealLight)} />
      <Path d="M30 24C38 6 54 2 56 12 58 22 46 28 30 26Z" fill={c.bloom(C.tealLight)} />
      <Path d="M30 26C18 28 10 36 14 44 20 48 28 38 30 28Z" fill={c.bloom(C.gold)} />
      <Path d="M30 26C42 28 50 36 46 44 40 48 32 38 30 28Z" fill={c.bloom(C.gold)} />
      <Circle cx={14} cy={14} r={4} fill={C.white} opacity={0.8} />
      <Circle cx={46} cy={14} r={4} fill={C.white} opacity={0.8} />
      <Circle cx={19} cy={39} r={2.6} fill={C.coral} />
      <Circle cx={41} cy={39} r={2.6} fill={C.coral} />
      <Rect x={28} y={16} width={4} height={26} rx={2} fill={c.dark ? C.nightLine : C.night} />
      <Path d="M29 17C27 10 24 7 21 6M31 17C33 10 36 7 39 6" stroke={c.dark ? C.nightLine : C.night} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <Circle cx={21} cy={6} r={1.6} fill={c.dark ? C.nightLine : C.night} />
      <Circle cx={39} cy={6} r={1.6} fill={c.dark ? C.nightLine : C.night} />
    </>
  )),

  beehive: art(80, 90, (c) => (
    <>
      <Shadow c={c} cx={40} cy={86} rx={30} />
      <Rect x={12} y={76} width={56} height={6} rx={3} fill={C.woodLight} />
      <Rect x={18} y={80} width={6} height={8} rx={2} fill={C.wood} />
      <Rect x={56} y={80} width={6} height={8} rx={2} fill={C.wood} />
      <Path d="M14 76C14 50 22 26 40 26S66 50 66 76Z" fill={C.gold} />
      <Path d="M48 30C58 38 66 56 66 76H54C56 56 54 40 48 30Z" fill={C.goldDeep} opacity={0.5} />
      {[66, 56, 46, 37].map((y, i) => (
        <Path key={y} d={`M${16 + i * 2.5} ${y}Q40 ${y + 5} ${64 - i * 2.5} ${y}`} stroke={C.amber} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.55} />
      ))}
      <Path d="M33 76V70A7 7 0 0 1 47 70V76Z" fill={C.woodDark} />
      <Rect x={37} y={20} width={6} height={8} rx={3} fill={C.goldDeep} />
      <BeeShape c={c} x={66} y={20} s={0.55} />
    </>
  )),

  'path-stone': art(80, 40, () => (
    <>
      {[[18, 26, 14, 8], [44, 18, 13, 7], [64, 30, 12, 7]].map(([x, y, rx, ry], i) => (
        <G key={i}>
          <Ellipse cx={x} cy={y + 2} rx={rx} ry={ry} fill={C.stone} />
          <Ellipse cx={x} cy={y} rx={rx} ry={ry} fill={C.stonePale} />
          <Ellipse cx={x - rx * 0.3} cy={y - ry * 0.3} rx={rx * 0.35} ry={ry * 0.25} fill={C.white} opacity={0.5} />
        </G>
      ))}
    </>
  )),

  rock: art(80, 55, (c) => (
    <>
      <Shadow c={c} cx={40} cy={50} rx={36} ry={5} />
      <Path d="M6 50C4 34 14 18 30 14 44 10 60 14 70 26 78 36 76 46 72 50Z" fill={C.stoneLight} />
      <Path d="M48 13C62 16 72 26 76 38 77 44 74 50 72 50H40C52 40 56 26 48 13Z" fill={C.stone} />
      <Path d="M18 28C22 22 28 18 34 18" stroke={C.white} strokeWidth={3} strokeLinecap="round" opacity={0.45} fill="none" />
      <Path d="M8 50C10 44 16 42 22 44 28 42 32 46 34 50Z" fill={c.green(C.leafLight)} opacity={0.85} />
    </>
  )),

  fence: art(140, 60, (c) => (
    <>
      <Shadow c={c} cx={70} cy={56} rx={66} ry={4} />
      <Rect x={2} y={22} width={136} height={7} rx={3} fill={C.woodLight} />
      <Rect x={2} y={40} width={136} height={7} rx={3} fill={C.woodLight} />
      {[6, 28, 50, 72, 94, 116].map((x) => (
        <G key={x}>
          <Path d={`M${x} 56V12Q${x + 9} 2 ${x + 18} 12V56Z`} fill={C.woodPale} />
          <Path d={`M${x + 12} 56V8Q${x + 16} 9 ${x + 18} 12V56Z`} fill={C.woodLight} opacity={0.6} />
        </G>
      ))}
    </>
  )),

  gate: art(120, 110, (c) => (
    <>
      <Shadow c={c} cx={60} cy={106} rx={56} ry={5} />
      <Path d="M24 106V44Q60 10 96 44V106Z" fill={C.woodLight} />
      <Path d="M60 22Q80 26 96 44V106H60Z" fill={C.wood} opacity={0.45} />
      {[33, 42, 51, 69, 78, 87].map((x) => (
        <Path key={x} d={`M${x} 106V${x < 60 ? 44 - (x - 24) * 0.55 : 44 - (96 - x) * 0.55}`} stroke={C.wood} strokeWidth={1.6} opacity={0.6} />
      ))}
      <Rect x={59} y={22} width={2} height={84} fill={C.woodDark} />
      <Rect x={24} y={56} width={72} height={5} rx={2} fill={C.woodDark} opacity={0.8} />
      <Rect x={24} y={86} width={72} height={5} rx={2} fill={C.woodDark} opacity={0.8} />
      <Circle cx={54} cy={74} r={2.6} fill={C.gold} />
      <Circle cx={66} cy={74} r={2.6} fill={C.gold} />
      <Rect x={6} y={30} width={18} height={76} rx={2} fill={C.sandLight} />
      <Rect x={96} y={30} width={18} height={76} rx={2} fill={C.sandLight} />
      <Rect x={106} y={30} width={8} height={76} fill={C.sandDeep} opacity={0.5} />
      <Rect x={16} y={30} width={8} height={76} fill={C.sandDeep} opacity={0.5} />
      <Rect x={3} y={26} width={24} height={7} rx={2} fill={C.terracotta} />
      <Rect x={93} y={26} width={24} height={7} rx={2} fill={C.terracotta} />
      <Path d={domePath(15, 26, 8, 1.4)} fill={C.teal} />
      <Path d={domePath(105, 26, 8, 1.4)} fill={C.teal} />
    </>
  )),

  sun: art(100, 100, (c) => (
    <>
      <Defs>
        <Lin id={c.id('s')} stops={[[0, C.goldLight], [1, C.gold]]} />
      </Defs>
      <Glow c={c} k="g" cx={50} cy={50} r={50} color={C.goldPale} opacity={0.7} />
      {Array.from({ length: 12 }, (_, i) => (
        <Path key={i} d="M50 6 55 18H45Z" fill={C.gold} stroke={C.gold} strokeWidth={3} strokeLinejoin="round" transform={`rotate(${i * 30} 50 50)`} />
      ))}
      <Circle cx={50} cy={50} r={26} fill={c.url('s')} />
      <Circle cx={42} cy={41} r={8} fill={C.white} opacity={0.35} />
    </>
  )),

  moon: art(100, 100, (c) => (
    <>
      <Glow c={c} k="g" cx={48} cy={50} r={48} color={C.goldPale} opacity={c.dark ? 0.45 : 0.6} />
      <Path d={crescentPath(46, 50, 31, 15, -13, 26)} fill={C.goldLight} />
      <Path d={crescentPath(46, 50, 31, 9, -8, 28)} fill={C.gold} opacity={0.45} />
      <Path d={crescentPath(46, 50, 31, 15, -13, 26)} fill="none" />
      <Circle cx={27} cy={58} r={3.2} fill={C.gold} opacity={0.55} />
      <Circle cx={36} cy={72} r={2.2} fill={C.gold} opacity={0.55} />
      <Circle cx={24} cy={44} r={1.8} fill={C.white} opacity={0.6} />
    </>
  )),

  stars: art(100, 80, (c) => (
    <>
      <Glow c={c} k="g" cx={34} cy={34} r={26} color={C.goldPale} opacity={0.5} />
      <Path d={starPath(34, 34, 16, 7.5, 5)} fill={C.goldLight} stroke={C.goldLight} strokeWidth={3} strokeLinejoin="round" />
      <Path d={starPath(74, 22, 9, 4.2, 5)} fill={C.goldPale} stroke={C.goldPale} strokeWidth={2} strokeLinejoin="round" />
      <Path d={starPath(70, 60, 11, 5.2, 5)} fill={C.goldLight} stroke={C.goldLight} strokeWidth={2.4} strokeLinejoin="round" />
      <Path d={sparklePath(14, 64, 7)} fill={C.goldPale} />
      <Path d={sparklePath(90, 44, 5)} fill={C.goldPale} />
      <Circle cx={50} cy={10} r={2} fill={C.goldPale} />
      <Circle cx={44} cy={70} r={1.6} fill={C.goldPale} />
    </>
  )),

  cloud: art(120, 70, (c) => <Cloud x={60} y={38} r={36} color={c.dark ? '#E6EBF5' : '#EEF4FA'} shadeColor={c.dark ? '#C3CCE0' : '#C6D9E8'} />),

  'watering-can': art(110, 80, (c) => (
    <>
      <Shadow c={c} cx={62} cy={76} rx={34} ry={4} />
      <Path d="M44 36 10 16 6 22 40 46Z" fill={C.tealMid} />
      <Path d="M2 12 14 6 18 22 8 28Z" fill={C.teal} />
      <Ellipse cx={10} cy={17} rx={4} ry={9} transform="rotate(-25 10 17)" fill={C.tealLight} />
      <Path d="M72 26C92 20 104 30 100 46 98 54 92 58 86 58" stroke={C.teal} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Path d="M40 28H86V68Q86 76 78 76H48Q40 76 40 68Z" fill={C.tealMid} />
      <Path d="M70 28H86V68Q86 76 78 76H70Z" fill={C.teal} opacity={0.6} />
      <Rect x={36} y={24} width={54} height={8} rx={4} fill={C.teal} />
      <Path d="M46 38V64" stroke={C.white} strokeWidth={4} strokeLinecap="round" opacity={0.35} />
      <Path d={starPath(62, 52, 8, 6.1, 8)} fill={C.gold} />
      <Path d={dropPath(6, 34, 9)} fill={C.water} />
      <Path d={dropPath(14, 42, 7)} fill={C.waterLight} />
      <Path d={dropPath(2, 48, 6)} fill={C.water} />
    </>
  )),

  seed: art(60, 60, (c) => (
    <>
      <Defs>
        <Lin id={c.id('s')} x1={0} y1={0} x2={1} y2={1} stops={[[0, C.woodPale], [1, C.woodLight]]} />
      </Defs>
      <Shadow c={c} cx={30} cy={53} rx={16} ry={3} />
      <Path d="M30 6C44 14 48 34 40 46 34 54 26 54 20 46 12 34 16 14 30 6Z" fill={c.url('s')} />
      <Path d="M30 10C38 20 38 38 32 50" stroke={C.wood} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.6} />
      <Path d="M22 22C22 18 24 14 27 12" stroke={C.white} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.5} />
    </>
  )),

  'water-drop': art(60, 70, (c) => (
    <>
      <Defs>
        <Lin id={c.id('d')} x1={0} y1={0} x2={1} y2={1} stops={[[0, C.waterLight], [1, C.waterDeep]]} />
      </Defs>
      <Path d={dropPath(30, 4, 62)} fill={c.url('d')} />
      <Path d="M20 44C18 36 22 30 26 26" stroke={C.white} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.55} />
      <Circle cx={21} cy={51} r={2.2} fill={C.white} opacity={0.55} />
    </>
  )),

  sprout: art(70, 70, (c) => (
    <>
      <SoilMound c={c} cx={35} cy={64} rx={24} />
      <Path d="M35 60C35 50 35 40 35 34" stroke={c.green(C.leafDark)} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M35 36C30 22 18 18 8 22 12 34 24 40 35 36Z" fill={c.green(C.leaf)} />
      <Path d="M35 34C38 20 50 14 62 16 60 30 48 38 35 34Z" fill={c.green(C.leafLight)} />
      <Path d="M35 36C28 30 20 26 12 24" stroke={c.green(C.leafDark)} strokeWidth={1.2} fill="none" opacity={0.6} />
      <Path d="M35 34C42 28 50 22 58 18" stroke={c.green(C.leafDark)} strokeWidth={1.2} fill="none" opacity={0.6} />
    </>
  )),

  'thirsty-plant': art(80, 90, (c) => (
    <>
      <Shadow c={c} cx={40} cy={84} rx={28} />
      <Path d="M14 84Q40 66 66 84Z" fill={C.sandDeep} />
      <Path d="M30 80 34 76 32 72M48 80 46 76 50 73" stroke={C.sandDark} strokeWidth={1.4} strokeLinecap="round" fill="none" />
      <Path d="M40 78C40 62 42 48 48 38 52 32 56 30 58 34" stroke={C.oliveDark} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M58 34C62 38 64 46 60 54 56 48 56 40 58 34Z" fill={C.olive} />
      <Path d="M41 62C34 60 26 64 22 72 30 74 38 70 41 62Z" fill={C.olive} />
      <Path d="M42 52C50 52 58 58 60 66 52 68 44 62 42 52Z" fill="#9AAE6A" />
      <Path d="M44 44C38 40 30 42 26 50 34 52 40 50 44 44Z" fill="#A9B873" />
      <Path d={dropPath(18, 30, 12)} fill={C.waterLight} opacity={0.9} />
      <Path d={dropPath(26, 18, 8)} fill={C.waterLight} opacity={0.6} />
    </>
  )),
} satisfies Record<string, ArtDef>;
