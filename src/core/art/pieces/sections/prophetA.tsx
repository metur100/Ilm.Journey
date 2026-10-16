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
      <G transform="translate(30 16) scale(0.42)">
        <G transform="translate(-70 -36)">
          <ArkComposite c={c} ramp={false} />
        </G>
      </G>
    </>
  )),
};

// ---------------------------------------------------------------------------------------------------------------
// Hud – ʿAd in al-Ahqaf (46:21), Iram of the lofty pillars (89:6–8), gardens and springs (26:133–134)

/** A tall landmark tower of ʿAd (26:128–129) with its pillar-like body. */
function Tower({ c, x, y, w, h, color = C.sandDark }: { c: Ctx; x: number; y: number; w: number; h: number; color?: string }) {
  return (
    <G>
      <Path d={`M${x - w / 2} ${y}L${x - w * 0.4} ${y - h}H${x + w * 0.4}L${x + w / 2} ${y}Z`} fill={dim(c, color)} />
      <Path d={`M${x + w * 0.1} ${y - h}H${x + w * 0.4}L${x + w / 2} ${y}H${x + w * 0.1}Z`} fill={dim(c, shade(color, 0.25))} opacity={0.6} />
      <Rect x={x - w * 0.52} y={y - h - w * 0.16} width={w * 1.04} height={w * 0.18} rx={2} fill={dim(c, shade(color, 0.12))} />
      {[0.25, 0.5, 0.75].map((t) => (
        <Path key={t} d={`M${x - w * 0.4 - w * 0.1 * t} ${y - h + h * t}H${x + w * 0.4 + w * 0.1 * t}`} stroke={dim(c, shade(color, 0.3))} strokeWidth={1.2} opacity={0.5} />
      ))}
      <Rect x={x - w * 0.09} y={y - h * 0.82} width={w * 0.18} height={w * 0.3} rx={w * 0.09} fill={dim(c, C.woodDark)} />
    </G>
  );
}

/** A slim column with a capital (Iram "of the lofty pillars", 89:7). */
function Pillar({ c, x, y, h, w = 12 }: { c: Ctx; x: number; y: number; h: number; w?: number }) {
  return (
    <G>
      <Rect x={x - w / 2} y={y - h} width={w} height={h} fill={dim(c, C.sandLight)} />
      <Rect x={x} y={y - h} width={w / 2} height={h} fill={dim(c, C.sandDeep)} opacity={0.6} />
      <Rect x={x - w * 0.8} y={y - h - 6} width={w * 1.6} height={7} rx={2} fill={dim(c, C.sandDeep)} />
      <Rect x={x - w * 0.75} y={y - 4} width={w * 1.5} height={5} rx={1.5} fill={dim(c, C.sandDeep)} />
    </G>
  );
}

/** Spring in a garden: water rising from rocks into a pool (26:134). */
function Spring({ c }: { c: Ctx }) {
  return (
    <G>
      <Shadow c={c} cx={100} cy={124} rx={86} />
      <Ellipse cx={100} cy={108} rx={84} ry={20} fill={c.green(C.leafLight)} />
      <Ellipse cx={100} cy={106} rx={62} ry={13} fill={C.water} />
      <Ellipse cx={92} cy={103} rx={40} ry={6} fill={C.waterLight} opacity={0.7} />
      <Rock c={{ ...c, dark: false }} x={58} y={104} w={34} h={26} />
      <Rock c={{ ...c, dark: false }} x={138} y={104} w={30} h={22} color={C.stoneLight} />
      <Path d="M100 102C98 80 92 66 86 56M100 102C102 80 110 66 116 56M100 102V52" stroke={C.waterLight} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d={dropPath(86, 44, 10)} fill={C.waterLight} />
      <Path d={dropPath(116, 44, 10)} fill={C.waterLight} />
      <Path d={dropPath(100, 38, 12)} fill={C.waterLight} />
      <Tuft x={30} y={112} s={1.1} color={c.green(C.leafDark)} />
      <Tuft x={172} y={112} s={1} color={c.green(C.leafDark)} />
    </G>
  );
}

const hud = {
  /** Al-Ahqaf – long, curving sand ridges (46:21). */
  'hud-ahqaf': art(W, H, (c) => (
    <>
      <Path d="M0 150C60 120 120 128 170 148S260 110 320 124 380 150 400 140V240H0Z" fill={dim(c, '#E2B98A', 0.45)} />
      <Path d="M0 150C60 120 120 128 170 148S260 110 320 124 380 150 400 140" stroke={dim(c, C.sandLight)} strokeWidth={2.4} fill="none" />
      <Path d="M0 180C40 160 100 150 150 168S250 196 300 170 370 150 400 160V240H0Z" fill={dim(c, C.sand)} />
      <Path d="M150 168C200 186 250 196 300 170V240H160C170 216 170 190 150 168Z" fill={dim(c, C.sandDark)} opacity={0.35} />
      <Path d="M0 180C40 160 100 150 150 168S250 196 300 170 370 150 400 160" stroke={dim(c, C.sandLight)} strokeWidth={2.6} fill="none" />
      <Path d="M0 210C80 196 140 200 200 212S320 198 400 206V240H0Z" fill={dim(c, C.sandDeep)} />
      <Path d="M0 210C80 196 140 200 200 212S320 198 400 206" stroke={dim(c, C.sandLight)} strokeWidth={2} fill="none" opacity={0.7} />
      <G stroke={dim(c, C.sandDark)} strokeWidth={1.2} fill="none" opacity={0.5} strokeLinecap="round">
        <Path d="M40 196q12-4 24 0M220 222q14-4 28 0M320 186q12-3 24 0M120 230q14-4 28 0" />
      </G>
    </>
  )),

  /** Iram of the lofty pillars – a proud city of towers and columns, quiet and without people (89:6–8). */
  'hud-iram': art(W, H, (c) => (
    <>
      <Path d="M0 160C80 150 160 152 240 158S360 150 400 154V240H0Z" fill={dim(c, C.sand)} />
      <Tower c={c} x={70} y={168} w={34} h={96} />
      <Tower c={c} x={330} y={166} w={38} h={110} color={C.clay} />
      <Rect x={110} y={120} width={180} height={48} fill={dim(c, C.sandDeep)} />
      <Rect x={110} y={112} width={180} height={10} rx={2} fill={dim(c, C.sandDark)} />
      {[124, 150, 176, 202, 228, 254, 280].map((x) => (
        <Pillar key={x} c={c} x={x} y={176} h={96} w={11} />
      ))}
      <Rect x={104} y={70} width={192} height={10} rx={3} fill={dim(c, C.sandDark)} />
      <Path d="M116 70V60H146V50H176V42H224V50H254V60H284V70Z" fill={dim(c, C.sandDeep)} />
      <Path d="M0 186C100 174 200 178 300 188S380 182 400 184V240H0Z" fill={dim(c, C.sandDeep)} />
      <Path d="M0 214C100 204 220 208 300 216S380 210 400 212V240H0Z" fill={dim(c, '#D29E5E')} />
    </>
  )),

  /** A tall landmark tower on a rise (26:128). */
  'hud-tower': art(90, 170, (c) => (
    <>
      <Shadow c={c} cx={45} cy={164} rx={40} />
      <Path d="M4 166Q45 140 86 166Z" fill={dim(c, C.sandDeep)} />
      <Tower c={c} x={45} y={156} w={40} h={128} />
    </>
  )),

  /** Gardens and springs (26:134). */
  'hud-spring': art(200, 130, (c) => <Spring c={c} />),

  /** The valley of ʿAd before Hud's call: open land with space for livestock, gardens and a spring (game scene). */
  'hud-valley': art(400, 300, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={[[0, c.dark ? '#28306A' : '#8FCBE6'], [1, c.dark ? '#6A5A90' : '#F6E3C2']]} />
      </Defs>
      <Rect x={0} y={0} width={400} height={300} fill={c.url('sky')} />
      <Path d="M0 130C60 104 120 112 170 126S260 96 320 108 380 130 400 122V300H0Z" fill={dim(c, '#E2B98A', 0.45)} />
      <Tower c={c} x={340} y={136} w={30} h={84} />
      <Tower c={c} x={60} y={130} w={22} h={56} color={C.clay} />
      <Path d="M0 160C80 140 160 144 240 156S360 140 400 150V300H0Z" fill={c.green(dim(c, '#B9C784'))} />
      <Path d="M0 200C90 184 180 188 260 198S370 186 400 192V300H0Z" fill={c.green(dim(c, '#9DBB6F'))} />
      <Path d="M0 250C100 238 220 242 300 250S380 244 400 246V300H0Z" fill={c.green(dim(c, '#86AA5E'))} />
      {[[20, 290, 1.2], [140, 286, 1], [250, 294, 1.1], [380, 280, 1]].map(([x, y, s], i) => (
        <Tuft key={i} x={x} y={y} s={s} color={c.green(dim(c, C.leafDark))} />
      ))}
      <LeafyTree c={c} x={200} y={182} s={0.4} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
    </>
  )),
};

// ---------------------------------------------------------------------------------------------------------------
// Salih – Thamud, homes carved into the mountains (7:74, 15:82), the she-camel of Allah and the water turns (26:155)

/** A doorway carved into rock: a stepped crown over a dark door. */
function CarvedDoor({ c, x, y, w, h }: { c: Ctx; x: number; y: number; w: number; h: number }) {
  const t = y - h;
  return (
    <G>
      <Path d={`M${x - w / 2} ${y}V${t + h * 0.22}H${x - w * 0.36}V${t + h * 0.1}H${x - w * 0.2}V${t}H${x + w * 0.2}V${t + h * 0.1}H${x + w * 0.36}V${t + h * 0.22}H${x + w / 2}V${y}Z`} fill={dim(c, '#E9B98E')} />
      <Rect x={x - w * 0.42} y={t + h * 0.3} width={w * 0.84} height={h * 0.06} fill={dim(c, '#C98E62')} />
      <Rect x={x - w * 0.18} y={t + h * 0.5} width={w * 0.36} height={h * 0.5} fill={dim(c, '#4A2E22', 0.2)} />
    </G>
  );
}

const salih = {
  /** The she-camel of Allah – a sign (7:73): calm, with a soft glow and a simple saddle cloth. */
  'salih-camel': art(140, 120, (c) => (
    <>
      <Glow c={c} k="g" cx={70} cy={60} r={64} color={C.goldPale} opacity={c.dark ? 0.45 : 0.55} />
      <Shadow c={c} cx={70} cy={114} rx={50} />
      <G fill={dim(c, '#E2BE8C', 0.2)}>
        <Path d="M30 72C28 50 44 38 58 44C66 30 82 30 90 44C98 50 104 60 104 72L100 80H34Z" />
        <Path d="M100 66C106 54 108 40 112 30C114 22 124 20 128 26C130 30 126 32 122 32C120 44 116 60 110 74Z" />
        <Rect x={38} y={74} width={7} height={38} rx={3} />
        <Rect x={52} y={74} width={7} height={38} rx={3} />
        <Rect x={84} y={74} width={7} height={38} rx={3} />
        <Rect x={96} y={74} width={7} height={38} rx={3} />
      </G>
      <Path d="M30 72C30 66 32 60 36 56" stroke={dim(c, '#C79A66', 0.2)} strokeWidth={4} strokeLinecap="round" fill="none" />
      <Path d="M48 50C56 44 74 42 86 50L84 64H50Z" fill={C.teal} />
      <Path d="M50 62H84" stroke={C.gold} strokeWidth={2.4} />
      {[56, 66, 76].map((x) => (
        <Circle key={x} cx={x} cy={66} r={1.8} fill={C.gold} />
      ))}
      <Circle cx={123} cy={27} r={1.5} fill={C.ink} />
      <Path d="M118 22L120 17 123 22" fill={dim(c, '#C79A66', 0.2)} />
      <Spark x={18} y={30} r={5} />
      <Spark x={130} y={56} r={4} />
    </>
  )),

  /** Homes carved into the mountains of al-Hijr, with palms in the valley (7:74, 15:82, 26:148–149). */
  'salih-rock-houses': art(W, H, (c) => (
    <>
      <Path d="M-10 190C-6 120 20 70 70 62C110 56 150 80 170 120L184 190Z" fill={dim(c, '#C9845C')} />
      <Path d="M120 70C150 80 166 100 172 124L184 190H130Z" fill={dim(c, '#A9694A')} opacity={0.6} />
      <Path d="M210 190C214 110 250 56 310 52C360 50 404 90 410 190Z" fill={dim(c, '#C47B54')} />
      <Path d="M360 60C390 80 404 120 410 190H350Z" fill={dim(c, '#A3633F')} opacity={0.6} />
      <Path d="M40 100C60 92 80 92 96 100M240 90C262 80 290 80 320 90" stroke={dim(c, '#A9694A')} strokeWidth={2} fill="none" opacity={0.6} />
      <CarvedDoor c={c} x={70} y={182} w={46} h={66} />
      <CarvedDoor c={c} x={130} y={182} w={30} h={44} />
      <CarvedDoor c={c} x={270} y={180} w={52} h={74} />
      <CarvedDoor c={c} x={340} y={182} w={34} h={48} />
      <Path d="M0 186C90 176 190 180 280 186S370 178 400 182V240H0Z" fill={dim(c, C.sand)} />
      <Path d="M0 212C100 202 220 206 300 214S380 208 400 210V240H0Z" fill={dim(c, C.sandDeep)} />
      <Path d="M170 196C176 170 180 150 186 136" stroke={dim(c, C.wood)} strokeWidth={4} strokeLinecap="round" fill="none" />
      <Path d="M186 136q-22-4-30 10M186 136q22-6 30 8M186 136q-8-16-24-16M186 136q10-16 26-14" stroke={c.green(dim(c, C.leaf))} strokeWidth={6} strokeLinecap="round" fill="none" />
    </>
  )),

  /** The well whose water was shared in turns (26:155, 54:28). */
  'salih-well': art(140, 110, (c) => (
    <>
      <Shadow c={c} cx={70} cy={104} rx={60} />
      <Path d="M18 60V96Q18 104 30 104H110Q122 104 122 96V60Z" fill={dim(c, C.stoneLight, 0.2)} />
      <Path d="M80 60H122V96Q122 104 110 104H80Z" fill={dim(c, C.stone, 0.2)} opacity={0.6} />
      {[72, 86].map((y) => (
        <Path key={y} d={`M18 ${y}H122`} stroke={C.stoneDark} strokeWidth={1.2} opacity={0.5} />
      ))}
      {[40, 64, 92, 110, 30, 54, 80, 102].map((x, i) => (
        <Path key={i} d={`M${x} ${i < 4 ? 60 : 72}V${i < 4 ? 72 : 86}`} stroke={C.stoneDark} strokeWidth={1.1} opacity={0.4} />
      ))}
      <Ellipse cx={70} cy={60} rx={52} ry={11} fill={dim(c, C.stonePale, 0.2)} />
      <Ellipse cx={70} cy={60} rx={42} ry={7.5} fill={C.waterDeep} />
      <Ellipse cx={62} cy={59} rx={20} ry={2.6} fill={C.waterLight} opacity={0.7} />
      <Path d="M30 60V18M110 60V18" stroke={C.wood} strokeWidth={6} strokeLinecap="round" />
      <Path d="M24 18H116" stroke={C.woodDark} strokeWidth={6} strokeLinecap="round" />
      <Path d="M70 18V42" stroke={C.sandDark} strokeWidth={1.6} />
      <Path d="M62 42H78L76 54H64Z" fill={C.woodLight} />
    </>
  )),

  /** A clay water jar for the people's turn. */
  'salih-jar': art(70, 100, (c) => (
    <>
      <Shadow c={c} cx={35} cy={96} rx={24} />
      <Path d="M24 8H46V18C60 26 64 44 62 62C60 82 50 94 35 94C20 94 10 82 8 62C6 44 10 26 24 18Z" fill={C.terracotta} />
      <Path d="M35 18C52 28 56 50 52 70C50 84 44 92 35 94C50 94 60 82 62 62C64 44 60 26 46 18Z" fill={shade(C.terracotta, 0.2)} opacity={0.6} />
      <Rect x={20} y={4} width={30} height={8} rx={3} fill={shade(C.terracotta, 0.1)} />
      <Path d="M14 46H56M12 58H58" stroke={C.sandLight} strokeWidth={2} opacity={0.6} />
      <Path d={dropPath(35, 24, 14)} fill={C.waterLight} opacity={c.dark ? 0.9 : 0.75} />
    </>
  )),
};

// ---------------------------------------------------------------------------------------------------------------
// Ibrahim – the star, moon and sun (6:76–79), the fire made cool (21:69), raising the House with Ismail (2:127)

const KAABA_STONE = '#9C8B78';
const KAABA_STONE_LIGHT = '#B5A48F';

const ibrahim = {
  /** The bright star Ibrahim saw at night (6:76). */
  'ibrahim-star': art(70, 70, (c) => (
    <>
      <Glow c={c} k="g" cx={35} cy={35} r={34} color={C.goldPale} opacity={0.8} />
      <Path d={sparklePath(35, 35, 30, 0.1)} fill={C.goldLight} opacity={0.9} />
      <Circle cx={35} cy={35} r={9} fill={C.white} />
      <Circle cx={35} cy={35} r={6} fill={C.goldPale} />
    </>
  )),

  /** "O fire, be coolness and safety for Ibrahim" (21:69): small, calm flames inside a cool, safe halo. */
  'ibrahim-fire-cool': art(160, 130, (c) => (
    <>
      <Glow c={c} k="cool" cx={80} cy={70} r={74} color={C.tealPale} opacity={0.85} />
      <Glow c={c} k="warm" cx={80} cy={86} r={34} color={C.goldPale} opacity={0.6} />
      <Shadow c={c} cx={80} cy={122} rx={56} />
      {[30, 50, 70, 90, 110, 130].map((x, i) => (
        <Ellipse key={x} cx={x} cy={116 - (i === 0 || i === 5 ? 0 : 2)} rx={12} ry={7} fill={i % 2 ? C.stone : C.stoneLight} />
      ))}
      <Path d="M80 40C96 58 104 74 100 92C98 104 90 110 80 110C70 110 62 104 60 92C56 74 66 60 80 40Z" fill={C.goldLight} opacity={0.9} />
      <Path d="M80 62C90 74 92 86 88 96C86 102 84 104 80 104C76 104 74 102 72 96C68 86 72 74 80 62Z" fill={C.white} opacity={0.85} />
      <Path d="M58 70C66 80 68 92 64 102M102 70C94 80 92 92 96 102" stroke={C.tealLight} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.6} />
      <Spark x={28} y={44} r={6} color={C.tealPale} />
      <Spark x={134} y={50} r={5} color={C.tealPale} />
      <Spark x={120} y={20} r={4} color={C.white} />
    </>
  )),

  /** The foundations of the House (2:127) – plain stone, still low, in the valley. */
  'ibrahim-kaaba-rising': art(200, 130, (c) => (
    <>
      <Shadow c={c} cx={100} cy={124} rx={92} />
      <Rect x={14} y={112} width={172} height={12} rx={2} fill={dim(c, shade(KAABA_STONE, 0.15), 0.2)} />
      <StoneCourse x={22} y={88} w={156} h={24} n={7} color={dim(c, KAABA_STONE, 0.2)} />
      <StoneCourse x={22} y={64} w={156} h={24} n={7} offset={0.5} color={dim(c, KAABA_STONE_LIGHT, 0.2)} />
      <G opacity={0.85}>
        <StoneCourse x={22} y={40} w={92} h={24} n={4} color={dim(c, KAABA_STONE, 0.2)} />
      </G>
      <Rect x={130} y={48} width={28} height={16} rx={2} fill={dim(c, KAABA_STONE_LIGHT, 0.2)} transform="rotate(-6 144 56)" />
      <Spark x={170} y={24} r={6} />
    </>
  )),

  /** One building stone. */
  'ibrahim-stone': art(70, 46, (c) => (
    <>
      <Shadow c={c} cx={35} cy={42} rx={30} />
      <Path d="M6 12L14 4H62L66 12V36L60 42H10L6 36Z" fill={dim(c, KAABA_STONE_LIGHT, 0.2)} />
      <Path d="M6 12H66V36L60 42H10L6 36Z" fill={dim(c, KAABA_STONE, 0.2)} />
      <Path d="M14 22H40M30 30H56" stroke={C.stoneDark} strokeWidth={1.4} opacity={0.4} strokeLinecap="round" />
    </>
  )),

  /** The stone Ibrahim stood on while building (Maqam Ibrahim, 2:125; Bukhari 3364) – a plain block, no figure. */
  'ibrahim-maqam': art(40, 26, (c) => (
    <>
      <Rect x={3} y={3} width={34} height={22} rx={4} fill={dim(c, '#C8B79A', 0.2)} />
      <Rect x={3} y={3} width={34} height={6} rx={3} fill={dim(c, '#DCCDB2', 0.2)} />
      <Path d="M24 9V25" stroke={C.stoneDark} strokeWidth={1} opacity={0.3} />
    </>
  )),

  'ibrahim-foundation': art(180, 14, (c) => <Rect x={0} y={1} width={180} height={13} rx={2} fill={dim(c, shade(KAABA_STONE, 0.15), 0.2)} />),
  'ibrahim-course-a': art(170, 26, (c) => <StoneCourse x={0} y={0} w={170} h={26} n={7} color={dim(c, KAABA_STONE, 0.2)} />),
  'ibrahim-course-b': art(170, 26, (c) => <StoneCourse x={0} y={0} w={170} h={26} n={7} offset={0.5} color={dim(c, KAABA_STONE_LIGHT, 0.2)} />),
  'ibrahim-course-c': art(170, 26, (c) => <StoneCourse x={0} y={0} w={170} h={26} n={6} color={dim(c, shade(KAABA_STONE, 0.06), 0.2)} />),
  'ibrahim-course-d': art(170, 26, (c) => <StoneCourse x={0} y={0} w={170} h={26} n={6} offset={0.5} color={dim(c, KAABA_STONE_LIGHT, 0.2)} />),

  /** The valley of Makkah where the House was raised (game scene with its own sky). */
  'ibrahim-building-site': art(400, 300, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={[[0, c.dark ? '#2B2F6E' : '#F2B98A'], [1, c.dark ? '#7A5A86' : '#FCE6C4']]} />
      </Defs>
      <Rect x={0} y={0} width={400} height={300} fill={c.url('sky')} />
      <Circle cx={330} cy={70} r={26} fill={c.dark ? C.goldPale : C.goldLight} opacity={0.9} />
      <Path d="M0 210L40 120 90 160 130 100 170 190Z" fill={dim(c, '#9E7A66')} />
      <Path d="M400 210L370 110 320 150 280 96 240 190Z" fill={dim(c, '#94705C')} />
      <Path d="M130 100L170 190H140L128 140Z M280 96L240 190H270L284 140Z" fill={dim(c, '#7A5A4C')} opacity={0.5} />
      <Path d="M0 236C100 222 300 222 400 236V300H0Z" fill={dim(c, C.sand)} />
      <Path d="M0 262C120 252 280 252 400 262V300H0Z" fill={dim(c, C.sandDeep)} />
      <Ellipse cx={200} cy={252} rx={110} ry={6} fill={C.ink} opacity={0.1} />
    </>
  )),
};

// ---------------------------------------------------------------------------------------------------------------
// Lut – a city near the Dead Sea, the journey by night (11:81), remains by a road still travelled (15:76)

/** Small flat-roofed houses of a town (lit windows on dark skies). */
function Town({ c, x, y, s = 1 }: { c: Ctx; x: number; y: number; s?: number }) {
  const blocks: [number, number, number][] = [
    [0, 30, 26],
    [28, 22, 34],
    [52, 34, 22],
    [88, 26, 30],
    [116, 30, 20],
    [148, 24, 28],
  ];
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {blocks.map(([bx, w, h], i) => (
        <G key={i}>
          <Rect x={bx} y={-h} width={w} height={h} rx={2} fill={dim(c, i % 2 ? C.sandLight : '#E7CFA6')} />
          <Rect x={bx + w * 0.62} y={-h} width={w * 0.38} height={h} fill={dim(c, C.sandDeep)} opacity={0.5} />
          <Rect x={bx + w * 0.25} y={-h * 0.62} width={5} height={6} rx={1} fill={c.dark ? C.goldLight : C.woodDark} />
        </G>
      ))}
    </G>
  );
}

const lut = {
  /** A town on the plain by the Dead Sea (no people). */
  'lut-city': art(W, H, (c) => (
    <>
      <Path d="M0 150C60 136 120 132 200 140S330 128 400 136V170H0Z" fill={dim(c, '#BFA6A0', 0.5)} />
      <Rect x={0} y={162} width={W} height={30} fill={dim(c, '#7CC4C2', 0.45)} />
      <Path d="M20 172h40M120 176h30M250 170h50M330 178h40" stroke={C.white} strokeWidth={1.6} opacity={c.dark ? 0.3 : 0.6} strokeLinecap="round" />
      <Path d="M0 192C100 184 200 186 300 192S380 188 400 190V240H0Z" fill={dim(c, '#E5D3B5')} />
      <Town c={c} x={60} y={212} s={1.2} />
      <Path d="M0 220C100 212 220 214 300 222S380 216 400 218V240H0Z" fill={dim(c, '#D6BE96')} />
      <Path d="M280 240C300 228 330 222 380 220" stroke={dim(c, C.sandLight)} strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.8} />
    </>
  )),

  /** The night path out of the town towards the hills and the dawn (portrait map, 11:81). */
  'lut-night-map': art(300, 400, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={[[0, '#F2C38E'], [0.18, '#7A5E96'], [0.5, '#262B66'], [1, '#141838']]} />
      </Defs>
      <Rect x={0} y={0} width={300} height={400} fill={c.url('sky')} />
      {[[40, 140], [260, 170], [120, 200], [200, 120], [70, 240], [240, 260]].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={1.3} fill={C.white} opacity={0.7} />
      ))}
      <Path d="M0 120L50 70 100 96 150 54 210 92 260 64 300 90V160H0Z" fill="#5E4A78" />
      <Path d="M0 160C60 140 140 146 200 156S280 146 300 150V400H0Z" fill="#3A3460" />
      <Path d="M150 380C120 340 190 310 150 270S90 220 140 190 200 150 170 110" stroke="#6E6496" strokeWidth={22} strokeLinecap="round" fill="none" opacity={0.6} />
      <Path d="M150 380C120 340 190 310 150 270S90 220 140 190 200 150 170 110" stroke="#8E84B8" strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" fill="none" opacity={0.7} />
      <G transform="translate(70 400) scale(0.9)">
        <Town c={{ ...c, dark: true }} x={0} y={0} />
      </G>
      <Path d="M0 400V376C40 370 80 372 100 380" fill="#2A2650" />
    </>
  )),

  /** A small hand lantern for the night journey. */
  'lut-lantern': art(60, 90, (c) => (
    <>
      <Glow c={c} k="g" cx={30} cy={56} r={30} color={C.goldPale} opacity={0.7} />
      <Path d="M18 26Q30 4 42 26" stroke={C.goldDeep} strokeWidth={3} fill="none" />
      <Path d="M16 28H44L46 34H14Z" fill={C.goldDeep} />
      <Path d="M16 34H44L42 72H18Z" fill={C.gold} />
      <Path d="M21 38H39L37 68H23Z" fill={C.goldPale} />
      <Path d="M30 46C34 52 34 58 30 62C26 58 26 52 30 46Z" fill={C.orange} />
      <Path d="M14 72H46L42 80H18Z" fill={C.goldDeep} />
    </>
  )),

  /** Quiet remains by the road: low broken walls and pale stones near the salt shore (15:76, 37:137–138). */
  'lut-ruins': art(220, 110, (c) => (
    <>
      <Shadow c={c} cx={110} cy={104} rx={100} />
      <Path d="M10 104C60 96 160 96 210 104Z" fill={dim(c, '#E8DCC6')} />
      <Path d="M30 104V74H44V64H56V104Z" fill={dim(c, '#CDB89A')} />
      <Path d="M120 104V58H134V70H148V82H156V104Z" fill={dim(c, '#C4AE8E')} />
      <Path d="M70 104V86H96V104Z" fill={dim(c, '#D8C6A8')} />
      {[[176, 100, 16, 10], [196, 102, 10, 7], [100, 102, 12, 8], [16, 102, 10, 6]].map(([x, y, w, h], i) => (
        <Rock key={i} c={c} x={x} y={y} w={w} h={h} color={C.stonePale} />
      ))}
      <Path d="M44 64L48 70M134 58L140 66" stroke={C.stoneDark} strokeWidth={1.2} opacity={0.5} />
    </>
  )),
};

// ---------------------------------------------------------------------------------------------------------------
// Ismail – the valley without plants (14:37), Safa and Marwa (2:158), the spring of Zamzam (Bukhari 3364)

/** A rocky hill (Safa / Marwa) standing on y. */
function Hill({ c, x, y, w, h, color = '#A88672' }: { c: Ctx; x: number; y: number; w: number; h: number; color?: string }) {
  return (
    <G>
      <Path d={`M${x - w / 2} ${y}C${x - w * 0.4} ${y - h * 0.7} ${x - w * 0.15} ${y - h} ${x} ${y - h}C${x + w * 0.2} ${y - h} ${x + w * 0.42} ${y - h * 0.6} ${x + w / 2} ${y}Z`} fill={dim(c, color)} />
      <Path d={`M${x + w * 0.05} ${y - h}C${x + w * 0.2} ${y - h} ${x + w * 0.42} ${y - h * 0.6} ${x + w / 2} ${y}H${x + w * 0.1}C${x + w * 0.16} ${y - h * 0.5} ${x + w * 0.12} ${y - h * 0.8} ${x + w * 0.05} ${y - h}Z`} fill={dim(c, shade(color, 0.25))} opacity={0.6} />
      {[0.3, 0.55].map((t) => (
        <Ellipse key={t} cx={x - w * 0.18 + t * w * 0.4} cy={y - h * t} rx={w * 0.06} ry={h * 0.04} fill={dim(c, shade(color, 0.3))} opacity={0.5} />
      ))}
    </G>
  );
}

/** The spring: water welling up in a ring of stones. */
function ZamzamSpring({ c, cx, cy, s = 1 }: { c: Ctx; cx: number; cy: number; s?: number }) {
  return (
    <G transform={`translate(${cx} ${cy}) scale(${s})`}>
      <Glow c={c} k={`zz${Math.round(cx)}`} cx={0} cy={-6} r={50} color={C.waterPale} opacity={0.7} />
      <Ellipse cx={0} cy={0} rx={46} ry={13} fill={dim(c, C.stone, 0.2)} />
      <Ellipse cx={0} cy={-1} rx={38} ry={9} fill={C.water} />
      <Ellipse cx={-6} cy={-2} rx={20} ry={3} fill={C.waterLight} opacity={0.8} />
      <Path d="M0 -4C-3 -16 -8 -24 -12 -28M0 -4C3 -16 8 -24 12 -28M0 -4V-32" stroke={C.waterLight} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      <Path d={dropPath(-13, -38, 8)} fill={C.waterLight} />
      <Path d={dropPath(13, -38, 8)} fill={C.waterLight} />
      <Path d={dropPath(0, -44, 9)} fill={C.waterPale} />
    </G>
  );
}

const ismail = {
  /** "An uncultivated valley near Your sacred House" (14:37): bare hills, sand, no plants. */
  'ismail-valley': art(W, H, (c) => (
    <>
      <Path d="M0 170L40 100 90 138 140 84 190 150Z" fill={dim(c, '#9E7A66')} />
      <Path d="M400 170L370 92 320 130 270 80 220 150Z" fill={dim(c, '#94705C')} />
      <Path d="M140 84L190 150H160L146 116Z M270 80L220 150H252L268 112Z" fill={dim(c, '#7A5A4C')} opacity={0.5} />
      <Path d="M0 176C100 160 300 160 400 176V240H0Z" fill={dim(c, C.sand)} />
      <Path d="M0 206C120 194 280 194 400 206V240H0Z" fill={dim(c, C.sandDeep)} />
      {[[60, 214, 6], [150, 228, 5], [260, 220, 7], [350, 230, 5]].map(([x, y, r], i) => (
        <Ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.55} fill={dim(c, C.stone)} />
      ))}
    </>
  )),

  /** The spring of Zamzam with its little basin (Bukhari 3364). */
  'ismail-zamzam': art(140, 100, (c) => (
    <>
      <Shadow c={c} cx={70} cy={92} rx={58} />
      <ZamzamSpring c={c} cx={70} cy={80} s={1.2} />
      <Spark x={20} y={24} r={5} />
      <Spark x={120} y={30} r={4} />
    </>
  )),

  /** A rocky hill – Safa or Marwa (2:158). */
  'ismail-hill': art(160, 100, (c) => (
    <>
      <Shadow c={c} cx={80} cy={96} rx={72} />
      <Hill c={c} x={80} y={96} w={150} h={84} />
    </>
  )),

  /** A leather waterskin. */
  'ismail-waterskin': art(70, 80, (c) => (
    <>
      <Shadow c={c} cx={35} cy={76} rx={26} />
      <Path d="M26 8H44V16C58 22 64 38 62 54C60 68 50 76 35 76C20 76 10 68 8 54C6 38 12 22 26 16Z" fill={C.woodLight} />
      <Path d="M35 18C50 26 54 44 50 58C48 68 42 74 35 76C50 76 60 68 62 54C64 38 58 22 44 16Z" fill={C.wood} opacity={0.5} />
      <Rect x={24} y={4} width={22} height={7} rx={3} fill={C.woodDark} />
      <Path d="M18 34Q35 30 52 34" stroke={C.woodDark} strokeWidth={2} fill="none" opacity={0.5} />
      <Path d={dropPath(35, 40, 16)} fill={C.waterLight} opacity={0.8} />
    </>
  )),

  /** Safa (left) and Marwa (right) with the valley between them (game map with its own sky). */
  'ismail-safa-marwa': art(400, 240, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={[[0, c.dark ? '#2B2F6E' : '#F7C98F'], [1, c.dark ? '#7A5A86' : '#FDEBCB']]} />
      </Defs>
      <Rect x={0} y={0} width={400} height={240} fill={c.url('sky')} />
      <Path d="M0 140L60 96 120 126 200 90 280 124 340 92 400 130V170H0Z" fill={dim(c, '#C39C84', 0.4)} opacity={0.7} />
      <Path d="M0 170C100 156 300 156 400 170V240H0Z" fill={dim(c, C.sand)} />
      <Path d="M70 196C150 186 250 186 330 196" stroke={dim(c, C.sandLight)} strokeWidth={26} strokeLinecap="round" fill="none" opacity={0.6} />
      <Hill c={c} x={58} y={206} w={120} h={92} />
      <Hill c={c} x={346} y={206} w={110} h={80} color="#9C7C68" />
      <Path d="M0 214C120 204 280 204 400 214V240H0Z" fill={dim(c, C.sandDeep)} />
    </>
  )),

  /** The spring in the valley before the basin is built (game scene). */
  'ismail-zamzam-site': art(400, 300, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={[[0, c.dark ? '#2B2F6E' : '#9FD0E8'], [1, c.dark ? '#7A5A86' : '#FCEBD0']]} />
      </Defs>
      <Rect x={0} y={0} width={400} height={300} fill={c.url('sky')} />
      <Path d="M0 200L50 120 110 168 160 110 220 190Z" fill={dim(c, '#9E7A66')} />
      <Path d="M400 200L360 112 300 160 250 104 190 190Z" fill={dim(c, '#94705C')} />
      <Path d="M0 206C100 192 300 192 400 206V300H0Z" fill={dim(c, C.sand)} />
      <Path d="M0 266C120 256 280 256 400 266V300H0Z" fill={dim(c, C.sandDeep)} />
      <ZamzamSpring c={c} cx={200} cy={232} />
    </>
  )),

  'ismail-basin-back': art(120, 23, (c) => (
    <Path d="M2 21C10 6 40 2 60 2S110 6 118 21L104 21C96 12 80 10 60 10S24 12 16 21Z" fill={dim(c, C.stoneLight, 0.2)} />
  )),
  'ismail-basin-front': art(140, 28, (c) => (
    <>
      <Path d="M2 4C14 20 40 26 70 26S126 20 138 4L124 4C112 14 92 18 70 18S28 14 16 4Z" fill={dim(c, C.stone, 0.2)} />
      <Path d="M30 14L34 22M70 18V26M108 14L104 22" stroke={C.stoneDark} strokeWidth={1.2} opacity={0.5} />
    </>
  )),
};

// ---------------------------------------------------------------------------------------------------------------
// Ishaq – the honoured guests of Ibrahim (51:24–27, 11:69) and the glad tidings of Ishaq and Yaqub (11:71)

/** A wide open tent of welcome. */
function WelcomeTent({ c, x, y, s = 1 }: { c: Ctx; x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M-100 0L-80 -70 0 -96 80 -70 100 0Z" fill={dim(c, '#E8D3B0')} />
      <Path d="M0 -96L80 -70 100 0H30Z" fill={dim(c, '#D6BC92')} />
      <Path d="M-100 0L-80 -70 -40 -82 -54 0Z" fill={dim(c, '#C9A97C')} />
      {[-60, -20, 20, 60].map((sx) => (
        <Path key={sx} d={`M${sx} -${86 - Math.abs(sx) * 0.25}L${sx * 1.2} 0`} stroke={dim(c, '#B89466')} strokeWidth={1.4} opacity={0.6} />
      ))}
      <Path d="M-34 0V-56Q0 -72 34 -56V0Z" fill={dim(c, '#6E4A2E', 0.3)} />
      <Path d="M-34 -56Q0 -72 34 -56L40 -62Q0 -80 -40 -62Z" fill={C.terracotta} />
      <Path d="M-100 0L-80 -70M100 0L80 -70" stroke={C.woodDark} strokeWidth={3} />
      <Path d="M0 -96V-108" stroke={C.woodDark} strokeWidth={3} strokeLinecap="round" />
    </G>
  );
}

function Platter({ c }: { c: Ctx }) {
  return (
    <G>
      <Shadow c={c} cx={60} cy={58} rx={52} />
      <Ellipse cx={60} cy={50} rx={54} ry={12} fill={C.goldDeep} />
      <Ellipse cx={60} cy={47} rx={50} ry={10} fill={C.gold} />
      <Path d="M24 46C24 30 40 22 60 22S96 30 96 46Z" fill={C.clay} />
      <Path d="M32 44C34 34 44 28 60 28" stroke={C.terracotta} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
      <Path d="M60 22C70 24 80 30 84 38" stroke={C.sandLight} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.6} />
      {[18, 30, 90, 102].map((x, i) => (
        <Circle key={x} cx={x} cy={46 + (i % 2)} r={4} fill={c.green(C.leafLight)} />
      ))}
      <Path d="M48 16Q44 10 48 4M60 14Q56 8 60 2M72 16Q68 10 72 4" stroke={C.white} strokeWidth={2} fill="none" strokeLinecap="round" opacity={c.dark ? 0.5 : 0.8} />
    </G>
  );
}

const ishaq = {
  /** Ibrahim's tent of welcome for his honoured guests (51:24). */
  'ishaq-tent': art(220, 130, (c) => (
    <>
      <Shadow c={c} cx={110} cy={122} rx={104} />
      <WelcomeTent c={c} x={110} y={122} />
      <Glow c={c} k="door" cx={110} cy={100} r={30} color={C.goldPale} opacity={c.dark ? 0.5 : 0.25} />
    </>
  )),

  /** The roasted calf brought quickly for the guests, served on a platter (11:69, 51:26–27). */
  'ishaq-platter': art(120, 66, (c) => <Platter c={c} />),

  /** A woven rug for the guests. */
  'ishaq-rug': art(200, 40, (c) => (
    <>
      <Path d="M10 6H190L200 34H0Z" fill={dim(c, C.berry, 0.2)} />
      <Path d="M22 11H178L186 29H14Z" fill="none" stroke={C.goldLight} strokeWidth={2} />
      {[50, 100, 150].map((x) => (
        <Path key={x} d={`M${x} 13L${x + 8} 20 ${x} 27 ${x - 8} 20Z`} fill={C.goldLight} />
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <Path key={i} d={`M${2 + i * 19.6} 34V39`} stroke={C.goldDeep} strokeWidth={2} />
      ))}
    </>
  )),

  /** A cushion. */
  'ishaq-cushion': art(70, 40, (c) => (
    <>
      <Shadow c={c} cx={35} cy={36} rx={30} />
      <Path d="M6 30C2 18 8 8 20 8H50C62 8 68 18 64 30C60 36 10 36 6 30Z" fill={dim(c, C.teal, 0.2)} />
      <Path d="M14 16H56" stroke={C.goldLight} strokeWidth={2} opacity={0.8} />
      <Circle cx={35} cy={22} r={3} fill={C.goldLight} />
    </>
  )),

  /** In front of the tent, ready to welcome guests (game scene with its own sky). */
  'ishaq-tent-site': art(400, 300, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={[[0, c.dark ? '#2B2F6E' : '#A9D6EA'], [1, c.dark ? '#6A5A90' : '#FBEBD0']]} />
      </Defs>
      <Rect x={0} y={0} width={400} height={300} fill={c.url('sky')} />
      <Path d="M0 170C80 150 160 152 240 162S360 148 400 156V300H0Z" fill={c.green(dim(c, '#C9C08A'))} />
      <WelcomeTent c={c} x={200} y={196} s={1.15} />
      <Path d="M0 196C100 186 300 186 400 196V300H0Z" fill={dim(c, C.sand)} />
      <Path d="M0 270C120 262 280 262 400 270V300H0Z" fill={dim(c, C.sandDeep)} />
      <LeafyTree c={c} x={52} y={198} s={0.6} leaf={dim(c, C.olive)} leafDark={dim(c, C.oliveDark)} leafLight={dim(c, C.leafPale)} />
      <LeafyTree c={c} x={356} y={198} s={0.5} leaf={dim(c, C.olive)} leafDark={dim(c, C.oliveDark)} leafLight={dim(c, C.leafPale)} />
    </>
  )),
};

// ---------------------------------------------------------------------------------------------------------------

/** Section art (see docs/GAMES-V3.md). Owned by the prophetA section – add pieces here only. */
export const prophetA = {
  ...adam,
  ...idris,
  ...nuh,
  ...hud,
  ...salih,
  ...ibrahim,
  ...lut,
  ...ismail,
  ...ishaq,
} satisfies Record<string, ArtDef>;

// Kept for pieces that come later in this file (prevents unused-import churn while the file grows).
void [Star];
