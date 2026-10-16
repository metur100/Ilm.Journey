import type React from 'react';
import { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import {
  art,
  Blossom,
  crescentPath,
  dropPath,
  Glow,
  leafPath,
  LeafyTree,
  Lin,
  Mountain,
  Shadow,
  smoothOpen,
  sparklePath,
  starPath,
  type ArtDef,
  type Ctx,
} from '../../kit';
import { C, mix, shade } from '../../palette';

/*
 * `prophet.*` – group A (Adam, Idris, Nuh, Hud, Salih, Ibrahim, Lut, Ismail, Ishaq). Owned by the prophets-a author.
 * Keys start with the prophet id (`nuh-ark`, `salih-camel` …). Used by the story stages (docs/STORIES-V3.md) and the
 * prophets-a games.
 *
 * Never people: no figures, faces or silhouettes of prophets, angels or anyone else – only places, objects, animals,
 * plants and light. No idols. Punishments of past nations are never drawn (only quiet ruins, wind, empty places).
 * Full-width bands are 400 × 240 with a transparent sky so the stage sky shows through.
 */

const W = 400;
const H = 240;

/** Darken / cool a colour for night skies (the stage passes `dark` for night, dusk, storm and sea). */
const dim = (c: Ctx, color: string, k = 0.38) => (c.dark ? mix(color, '#1B1F4B', k) : color);

function Tuft({ x, y, s = 1, color }: { x: number; y: number; s?: number; color: string }) {
  return (
    <Path
      d={`M${x - 6 * s} ${y}C${x - 5 * s} ${y - 8 * s} ${x - 3 * s} ${y - 12 * s} ${x - 4 * s} ${y - 16 * s}C${x - 1 * s} ${y - 10 * s} ${x} ${y - 8 * s} ${x} ${y - 6 * s}C${x + 1 * s} ${y - 10 * s} ${x + 3 * s} ${y - 14 * s} ${x + 6 * s} ${y - 15 * s}C${x + 4 * s} ${y - 10 * s} ${x + 5 * s} ${y - 6 * s} ${x + 6 * s} ${y}Z`}
      fill={color}
    />
  );
}

/** A rounded rock with a lit edge. */
function Rock({ c, x, y, w, h, color = C.stone }: { c: Ctx; x: number; y: number; w: number; h: number; color?: string }) {
  return (
    <G>
      <Path d={`M${x - w / 2} ${y}C${x - w / 2} ${y - h * 0.7} ${x - w * 0.25} ${y - h} ${x} ${y - h}C${x + w * 0.3} ${y - h} ${x + w / 2} ${y - h * 0.6} ${x + w / 2} ${y}Z`} fill={dim(c, color)} />
      <Path d={`M${x + w * 0.05} ${y - h}C${x + w * 0.3} ${y - h} ${x + w / 2} ${y - h * 0.6} ${x + w / 2} ${y}H${x + w * 0.12}C${x + w * 0.2} ${y - h * 0.4} ${x + w * 0.16} ${y - h * 0.75} ${x + w * 0.05} ${y - h}Z`} fill={dim(c, shade(color, 0.25))} opacity={0.6} />
    </G>
  );
}

/** Small five-point star. */
const Star = ({ x, y, r, color = C.goldLight, opacity = 1 }: { x: number; y: number; r: number; color?: string; opacity?: number }) => <Path d={starPath(x, y, r, r * 0.45)} fill={color} opacity={opacity} />;

/** Four-point sparkle. */
const Spark = ({ x, y, r, color = C.goldPale, opacity = 0.9 }: { x: number; y: number; r: number; color?: string; opacity?: number }) => <Path d={sparklePath(x, y, r)} fill={color} opacity={opacity} />;

/** A row of hand-cut building stones (Kaaba walls, basins). */
function StoneCourse({ x, y, w, h, n, color, offset = 0 }: { x: number; y: number; w: number; h: number; n: number; color: string; offset?: number }) {
  const sw = w / n;
  return (
    <G>
      <Rect x={x} y={y} width={w} height={h} rx={1.5} fill={color} />
      {Array.from({ length: n + (offset ? 1 : 0) }, (_, i) => {
        const sx = x + i * sw - offset * sw;
        if (sx <= x + 0.5) return null;
        return <Path key={i} d={`M${sx} ${y + 1}V${y + h - 1}`} stroke={shade(color, 0.3)} strokeWidth={1.1} opacity={0.6} />;
      })}
      <Path d={`M${x} ${y + 0.8}H${x + w}`} stroke={mix(color, '#FFFFFF', 0.35)} strokeWidth={1.2} opacity={0.7} />
    </G>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Adam

const adam = {
  /** The tree in the Garden (2:35) – lush and glowing; no fruit is named in the Quran, so none is drawn. */
  'adam-tree': art(160, 170, (c) => (
    <>
      <Glow c={c} k="g" cx={80} cy={70} r={78} color={C.goldPale} opacity={c.dark ? 0.5 : 0.6} />
      <Shadow c={c} cx={80} cy={163} rx={52} />
      <Path d="M8 164Q80 138 152 164Z" fill={c.green(C.leafLight)} />
      <Path d="M72 162C74 140 72 122 66 106L56 94 61 90 73 101C75 92 77 84 79 76H86C86 88 86 96 89 104L101 90 106 94 94 110C90 126 89 146 92 162Z" fill={C.wood} />
      <Path d="M84 80C84 96 86 110 90 120" stroke={C.woodDark} strokeWidth={2} fill="none" opacity={0.35} />
      {(
        [
          [80, 64, 40],
          [46, 82, 28],
          [114, 82, 28],
          [58, 44, 27],
          [102, 44, 27],
          [80, 28, 24],
        ] as const
      ).map(([x, y, r], i) => (
        <Circle key={`d${i}`} cx={x + 3} cy={y + 4} r={r} fill={c.green(C.leafDeep)} />
      ))}
      {(
        [
          [80, 62, 38],
          [46, 80, 26],
          [114, 80, 26],
          [58, 42, 25],
          [102, 42, 25],
          [80, 26, 22],
        ] as const
      ).map(([x, y, r], i) => (
        <Circle key={`m${i}`} cx={x} cy={y} r={r} fill={c.green(i % 2 ? C.leaf : C.leafDark)} />
      ))}
      {(
        [
          [70, 34, 12],
          [50, 66, 10],
          [94, 52, 13],
          [110, 72, 9],
        ] as const
      ).map(([x, y, r], i) => (
        <Circle key={`h${i}`} cx={x} cy={y} r={r} fill={c.green(C.leafLight)} opacity={0.55} />
      ))}
      {(
        [
          [40, 88],
          [66, 74],
          [92, 86],
          [118, 64],
          [78, 40],
          [56, 52],
          [104, 30],
        ] as const
      ).map(([x, y], i) => (
        <Blossom key={`b${i}`} c={c} x={x} y={y} r={3.4} petal={i % 2 ? C.white : C.pinkPale} center={C.goldLight} />
      ))}
      <Spark x={26} y={40} r={6} />
      <Spark x={138} y={28} r={5} />
      <Spark x={132} y={110} r={4} />
    </>
  )),

  /** "He taught Adam the names – all of them" (2:31): the things of creation in a ring of light. */
  'adam-names': art(180, 130, (c) => {
    const ring: [number, number][] = [
      [90, 18],
      [140, 34],
      [160, 72],
      [136, 108],
      [90, 116],
      [44, 108],
      [20, 72],
      [40, 34],
    ];
    return (
      <>
        <Glow c={c} k="g" cx={90} cy={66} r={70} color={C.goldPale} opacity={c.dark ? 0.55 : 0.75} />
        <Ellipse cx={90} cy={66} rx={66} ry={46} stroke={C.goldDeep} strokeWidth={1.4} strokeDasharray="2 5" strokeLinecap="round" fill="none" opacity={0.7} />
        <Circle cx={90} cy={66} r={9} fill={C.goldLight} />
        <Path d={sparklePath(90, 66, 16)} fill={C.white} opacity={0.85} />
        {ring.map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={14} fill={c.dark ? mix(C.cream, '#1B1F4B', 0.2) : C.cream} stroke={C.goldDeep} strokeWidth={1.2} />
        ))}
        {/* leaf */}
        <Path d={leafPath(83, 24, 15, 6, -40)} fill={c.green(C.leaf)} />
        {/* star */}
        <Path d={starPath(140, 34, 8, 3.6)} fill={C.gold} />
        {/* water drop */}
        <Path d={dropPath(160, 62, 18)} fill={C.water} />
        {/* flower */}
        <Blossom c={c} x={136} y={108} r={7} petal={C.rose} center={C.goldLight} />
        {/* fish */}
        <G>
          <Ellipse cx={88} cy={116} rx={8} ry={4.6} fill={C.waterDeep} />
          <Path d="M95 116L102 111V121Z" fill={C.waterDeep} />
          <Circle cx={84} cy={115} r={1.1} fill={C.white} />
        </G>
        {/* bird */}
        <Path d="M36 106Q40 100 46 104Q50 98 56 100Q50 104 48 110Q42 112 36 106Z" fill={C.terracotta} />
        <Circle cx={53} cy={102} r={0.9} fill={C.ink} />
        {/* mountain */}
        <Path d="M10 80L20 62 30 80Z" fill={C.stoneDark} />
        <Path d="M20 62L23 68 20 66 17 68Z" fill={C.white} />
        {/* crescent */}
        <Path d={crescentPath(40, 34, 8, 4, -3, 7)} fill={C.goldDeep} />
      </>
    );
  }),

  /** The earth at the first dawn: quiet hills, a spring and a young tree (2:36–38). */
  'adam-earth': art(W, H, (c) => (
    <>
      <Mountain x={90} y={168} w={200} h={70} color={dim(c, '#B7A3AE', 0.5)} shadeColor={dim(c, '#9E8896', 0.5)} />
      <Mountain x={300} y={170} w={240} h={84} color={dim(c, '#A98E9C', 0.5)} shadeColor={dim(c, '#8E7482', 0.5)} />
      <Path d="M0 170C70 150 140 152 210 164S330 146 400 158V240H0Z" fill={c.green(dim(c, '#A9C98A'))} />
      <Path d="M0 196C90 176 170 180 250 192S360 178 400 186V240H0Z" fill={c.green(dim(c, '#86B66F'))} />
      <Path d="M150 240C170 220 210 214 226 200S260 186 300 182" stroke={dim(c, C.waterLight)} strokeWidth={9} strokeLinecap="round" fill="none" />
      <Path d="M150 240C170 220 210 214 226 200S260 186 300 182" stroke={dim(c, C.water)} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.6} />
      <Ellipse cx={304} cy={182} rx={14} ry={4} fill={dim(c, C.waterLight)} />
      <LeafyTree c={c} x={330} y={190} s={0.5} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
      <LeafyTree c={c} x={70} y={192} s={0.34} leaf={dim(c, C.olive)} leafDark={dim(c, C.oliveDark)} leafLight={dim(c, C.leafPale)} />
      <Path d="M0 220C100 208 200 212 300 220S380 214 400 216V240H0Z" fill={c.green(dim(c, '#6FA65E'))} />
      {[[24, 230, 1], [110, 236, 1.2], [250, 232, 0.9], [370, 230, 1.1]].map(([x, y, s], i) => (
        <Tuft key={i} x={x} y={y} s={s} color={c.green(dim(c, C.leafDark))} />
      ))}
      <Blossom c={c} x={60} y={222} r={4} petal={dim(c, C.white)} />
      <Blossom c={c} x={208} y={228} r={4} petal={dim(c, C.pinkPale)} />
    </>
  )),
};

// ---------------------------------------------------------------------------------------------------------------
// Idris – "a man of truth and a prophet … We raised him to a high station" (19:56–57)

/** Stone steps winding up a quiet mountain path. */
function Steps({ c, pts, color }: { c: Ctx; pts: [number, number, number][]; color: string }) {
  return (
    <G>
      {pts.map(([x, y, w], i) => (
        <G key={i}>
          <Rect x={x - w / 2} y={y} width={w} height={w * 0.26} rx={w * 0.08} fill={dim(c, shade(color, 0.25))} />
          <Rect x={x - w / 2} y={y - w * 0.06} width={w} height={w * 0.22} rx={w * 0.08} fill={dim(c, color)} />
        </G>
      ))}
    </G>
  );
}

const idris = {
  /** A high mountain whose summit glows under the stars – the "high station" (19:57), told only as light. */
  'idris-high-place': art(W, H, (c) => (
    <>
      <Glow c={c} k="top" cx={236} cy={52} r={70} color={C.goldPale} opacity={c.dark ? 0.45 : 0.55} />
      <Path d="M0 176L60 140 100 158 150 120 186 146Z" fill={dim(c, '#9A8FB0', 0.5)} />
      <Path d="M300 160L350 130 400 150V180H290Z" fill={dim(c, '#9A8FB0', 0.5)} />
      <Path d="M120 210L214 62Q236 40 258 62L352 210Z" fill={dim(c, '#8E7B8C')} />
      <Path d="M236 48Q246 50 258 62L352 210H260L246 120Z" fill={dim(c, '#6F5E70')} opacity={0.75} />
      <Path d="M222 62Q236 44 250 60L244 72 236 66 228 74Z" fill={dim(c, C.goldPale, 0.2)} />
      <Steps
        c={c}
        color={C.stoneLight}
        pts={[
          [196, 200, 26],
          [212, 184, 24],
          [200, 168, 22],
          [216, 152, 20],
          [206, 136, 18],
          [220, 120, 16],
          [212, 106, 14],
          [226, 92, 12],
          [232, 78, 10],
        ]}
      />
      <Path d="M0 196C80 180 160 186 240 196S360 184 400 190V240H0Z" fill={dim(c, '#B79C86')} />
      <Path d="M0 220C100 210 220 214 300 222S380 216 400 218V240H0Z" fill={dim(c, '#A3876F')} />
      <Spark x={236} y={36} r={10} color={C.goldLight} />
      <Spark x={196} y={28} r={4} />
      <Spark x={276} y={30} r={5} />
    </>
  )),

  /** A glowing eight-pointed star (a stop on the path to the high station). */
  'idris-star': art(80, 80, (c) => (
    <>
      <Glow c={c} k="g" cx={40} cy={40} r={38} color={C.goldPale} opacity={0.75} />
      <G transform="rotate(45 40 40)">
        <Path d={sparklePath(40, 40, 20, 0.2)} fill={C.goldLight} opacity={0.85} />
      </G>
      <Path d={sparklePath(40, 40, 32, 0.16)} fill={C.gold} />
      <Path d={sparklePath(40, 40, 18, 0.2)} fill={C.goldPale} />
      <Circle cx={40} cy={40} r={4.5} fill={C.white} />
    </>
  )),

  /** Night sky above the mountain (portrait map for the star path game). */
  'idris-sky-steps': art(300, 400, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={[[0, '#141A44'], [0.6, '#2E3380'], [1, '#5B4E95']]} />
      </Defs>
      <Rect x={0} y={0} width={300} height={400} fill={c.url('sky')} />
      {(
        [
          [30, 40, 1.6], [80, 90, 1.2], [140, 30, 1.4], [210, 70, 1.8], [270, 30, 1.2], [250, 140, 1.4], [40, 170, 1.2], [120, 150, 1], [280, 220, 1.3], [20, 260, 1.4], [170, 210, 1],
        ] as const
      ).map(([x, y, r], i) => (
        <Circle key={i} cx={x} cy={y} r={r} fill={C.white} opacity={0.75} />
      ))}
      <Path d={crescentPath(250, 64, 18, 8, -5, 16)} fill={C.goldLight} />
      <Glow c={c} k="g" cx={150} cy={300} r={120} color={C.lilac} opacity={0.25} />
      <Path d="M0 360L70 300 110 324 150 270 200 318 240 296 300 340V400H0Z" fill="#3E3566" />
      <Path d="M150 270L200 318 170 318 156 296Z" fill="#2E2852" />
      <Path d="M0 380C80 366 200 370 300 378V400H0Z" fill="#2B2448" />
    </>
  )),
};

// ---------------------------------------------------------------------------------------------------------------
// Nuh – the ark of planks and nails (54:13), built under Allah's eyes (11:37), resting on al-Judi (11:44)

/* Ark parts in their own boxes; `nuh-ark` composes them at the places of the build game's shipyard scene. */
function Hull({ c }: { c: Ctx }) {
  return (
    <G>
      <Path d="M0 6H240L214 54Q208 66 194 66H46Q32 66 26 54Z" fill={dim(c, C.woodLight, 0.25)} />
      <Path d="M130 6H240L214 54Q208 66 194 66H130Z" fill={dim(c, C.wood, 0.25)} opacity={0.45} />
      <Path d="M8 22H232M16 38H222M24 52H214" stroke={dim(c, C.woodDark, 0.2)} strokeWidth={1.6} opacity={0.5} />
      {[40, 88, 136, 184].map((x) => (
        <Path key={x} d={`M${x} 8V64`} stroke={dim(c, C.woodDark, 0.2)} strokeWidth={1.2} opacity={0.35} />
      ))}
      {[30, 70, 110, 150, 190].map((x) => (
        <Circle key={x} cx={x + 6} cy={30} r={1.6} fill={C.stoneDark} />
      ))}
      <Rect x={0} y={0} width={240} height={9} rx={4} fill={dim(c, C.wood, 0.25)} />
    </G>
  );
}

function Deck({ c }: { c: Ctx }) {
  return (
    <G>
      <Rect x={0} y={1} width={256} height={13} rx={5} fill={dim(c, C.wood, 0.25)} />
      <Rect x={2} y={1} width={252} height={4} rx={2} fill={dim(c, C.woodPale, 0.25)} opacity={0.8} />
      {Array.from({ length: 10 }, (_, i) => (
        <Path key={i} d={`M${24 + i * 23} 3V12`} stroke={C.woodDark} strokeWidth={1.2} opacity={0.4} />
      ))}
    </G>
  );
}

function Cabin({ c }: { c: Ctx }) {
  return (
    <G>
      <Rect x={0} y={0} width={144} height={48} rx={3} fill={dim(c, C.woodPale, 0.25)} />
      <Rect x={96} y={0} width={48} height={48} fill={dim(c, C.woodLight, 0.25)} opacity={0.5} />
      {[12, 26, 40].map((y) => (
        <Path key={y} d={`M2 ${y}H142`} stroke={C.wood} strokeWidth={1} opacity={0.35} />
      ))}
      {[18, 42, 102, 122].map((x) => (
        <Rect key={x} x={x} y={12} width={12} height={12} rx={2} fill={c.dark ? C.goldLight : C.woodDark} opacity={c.dark ? 0.85 : 1} />
      ))}
      <Path d="M62 48V24Q72 14 82 24V48Z" fill={C.woodDark} />
    </G>
  );
}

function Roof({ c }: { c: Ctx }) {
  return (
    <G>
      <Path d="M0 38L88 0 176 38Z" fill={dim(c, C.terracotta, 0.25)} />
      <Path d="M88 0L176 38H110Z" fill={dim(c, shade(C.terracotta, 0.25), 0.25)} />
      <Path d="M26 27H150M50 17H126" stroke={shade(C.terracotta, 0.35)} strokeWidth={1.4} opacity={0.5} />
    </G>
  );
}

function Ramp({ c }: { c: Ctx }) {
  return (
    <G>
      <Path d="M30 46V53M66 50V53" stroke={C.woodDark} strokeWidth={4} />
      <Path d="M0 2L80 44 78 52 -2 10Z" fill={dim(c, C.woodLight, 0.25)} />
      {[12, 26, 40, 54, 68].map((x) => (
        <Path key={x} d={`M${x} ${x * 0.52 + 1}L${x - 2} ${x * 0.52 + 10}`} stroke={C.woodDark} strokeWidth={2} opacity={0.55} />
      ))}
    </G>
  );
}

const part = (w: number, h: number, Part: (p: { c: Ctx }) => React.ReactNode) => art(w, h, (c) => <Part c={c} />);

/** The whole ark at its place in a 400 × 240 frame (hull 80–320, roof from y 38). */
function ArkComposite({ c, ramp = true }: { c: Ctx; ramp?: boolean }) {
  return (
    <G>
      <G transform="translate(80 115)">
        <Hull c={c} />
      </G>
      <G transform="translate(128 72)">
        <Cabin c={c} />
      </G>
      <G transform="translate(112 38)">
        <Roof c={c} />
      </G>
      <G transform="translate(72 106)">
        <Deck c={c} />
      </G>
      {ramp ? (
        <G transform="translate(288 144)">
          <Ramp c={c} />
        </G>
      ) : null}
    </G>
  );
}

const nuh = {
  'nuh-hull': part(240, 67, Hull),
  'nuh-deck': part(256, 14, Deck),
  'nuh-cabin': part(144, 48, Cabin),
  'nuh-roof': part(176, 38, Roof),
  'nuh-ramp': part(80, 53, Ramp),

  /** The ark of Nuh – planks and nails, a cabin and a roof; no mast, no figures. */
  'nuh-ark': art(260, 170, (c) => (
    <>
      <Shadow c={c} cx={130} cy={150} rx={90} ry={7} />
      <G transform="translate(-70 -36)">
        <ArkComposite c={c} ramp={false} />
      </G>
    </>
  )),

  /** Planks and nails (54:13). */
  'nuh-planks': art(120, 80, (c) => (
    <>
      <Shadow c={c} cx={60} cy={74} rx={52} />
      {[0, 1, 2, 3].map((i) => (
        <G key={i}>
          <Rect x={8 + (i % 2) * 6} y={56 - i * 12} width={100} height={11} rx={3} fill={i % 2 ? C.woodLight : C.woodPale} />
          <Path d={`M${18 + (i % 2) * 6} ${61 - i * 12}h20M${60 + (i % 2) * 6} ${60 - i * 12}h30`} stroke={C.wood} strokeWidth={1} opacity={0.5} />
        </G>
      ))}
      {[78, 88, 98].map((x, i) => (
        <G key={x} transform={`rotate(${-20 + i * 14} ${x} 14)`}>
          <Rect x={x - 1.5} y={4} width={3} height={18} rx={1} fill={C.greyDark} />
          <Rect x={x - 4} y={3} width={8} height={3} rx={1.5} fill={C.grey} />
        </G>
      ))}
    </>
  )),

  /** The shipyard: dry land on a hill, far from any sea – where the ark was built (11:37–38). */
  'nuh-shipyard': art(W, H, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={[[0, c.dark ? '#2B3270' : '#9FD3EC'], [1, c.dark ? '#5A4E8F' : '#E6F4F9']]} />
      </Defs>
      <Rect x={0} y={0} width={W} height={H} fill={c.url('sky')} />
      <Path d="M0 150L60 120 110 136 170 104 230 132 300 110 360 128 400 118V200H0Z" fill={dim(c, '#B9A6B4', 0.45)} />
      <Path d="M0 190C80 170 170 172 260 182S360 172 400 176V240H0Z" fill={c.green(dim(c, '#C2B279'))} />
      <Path d="M0 214C100 200 220 204 300 212S380 206 400 208V240H0Z" fill={c.green(dim(c, '#A99A62'))} />
      {[[30, 222, 1], [150, 232, 1.2], [360, 226, 1]].map(([x, y, s], i) => (
        <Tuft key={i} x={x} y={y} s={s} color={c.green(dim(c, C.oliveDark))} />
      ))}
      <Ellipse cx={200} cy={190} rx={150} ry={7} fill={C.ink} opacity={0.12} />
      <G transform="translate(28 186) scale(0.5)">
        <Path d="M0 50H96V64H0Z" fill={dim(c, C.woodPale)} />
        <Path d="M6 36H100V50H6Z" fill={dim(c, C.woodLight)} />
      </G>
    </>
  )),

  /** Great waves like mountains (11:42) – a band of the sea in the storm, no ship and no figures. */
  'nuh-flood': art(W, H, (c) => {
    const crest = (y: number, a: number, phase: number) => {
      const pts: [number, number][] = [];
      for (let x = -20; x <= 420; x += 40) pts.push([x, y - Math.abs(Math.sin((x + phase) / 70)) * a]);
      return smoothOpen(pts);
    };
    const band = (y: number, a: number, phase: number, color: string) => <Path d={`${crest(y, a, phase)}V240H-20Z`} fill={dim(c, color, 0.3)} />;
    return (
      <>
        {band(120, 46, 0, '#4F7C96')}
        <Path d={crest(120, 46, 0)} stroke={C.white} strokeWidth={2.4} fill="none" opacity={0.45} />
        {band(160, 40, 50, '#336581')}
        <Path d={crest(160, 40, 50)} stroke={C.white} strokeWidth={2.8} fill="none" opacity={0.5} />
        {band(200, 30, 20, '#21506C')}
        <Path d={crest(200, 30, 20)} stroke={C.white} strokeWidth={3} fill="none" opacity={0.55} />
        {band(232, 14, 80, '#173E57')}
      </>
    );
  }),

  /** The ark resting on Mount al-Judi under a clear sky (11:44). */
  'nuh-judi': art(240, 170, (c) => (
    <>
      <Glow c={c} k="g" cx={150} cy={40} r={70} color={C.goldPale} opacity={0.4} />
      <Path d="M0 170L70 70Q86 52 102 66L150 104 180 86 240 150V170Z" fill={dim(c, '#8E7468')} />
      <Path d="M86 56Q96 56 102 66L150 104 120 170H90L96 90Z" fill={dim(c, '#6E5850')} opacity={0.6} />
      <Path d="M0 170L40 128 90 150 150 124 240 160V170Z" fill={c.green(dim(c, '#7DA36A'))} />
      <G transform="translate(36 -2) scale(0.42)">
        <G transform="translate(-70 -36)">
          <ArkComposite c={c} ramp={false} />
        </G>
      </G>
    </>
  )),
};

// ---------------------------------------------------------------------------------------------------------------

/** Section art (see docs/GAMES-V3.md). Owned by the prophetA section – add pieces here only. */
export const prophetA = {
  ...adam,
  ...idris,
  ...nuh,
} satisfies Record<string, ArtDef>;

// Kept for pieces that come later in this file (prevents unused-import churn while the file grows).
void [Rock, Star, StoneCourse, smoothOpen];
