import { Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import { art, Glow, House, LeafyTree, Lin, Palm, Shadow, smoothOpen, sparklePath, type ArtDef, type Ctx } from '../../kit';
import { C, mix } from '../../palette';

/*
 * `seerah.*` scenes for the animated Seerah stages and the Seerah section games (docs/STORIES-V3.md §8, GAMES-V3 §3.5).
 * Owned by the Seerah author; merged into `seerah` (seerah.tsx) after the `masjid-*` pieces.
 *
 * Never people: the Prophet ﷺ, his family and companions are never drawn – only places, buildings, objects, plants,
 * animals and light. Full-width bands are 400 × 240 with a transparent sky (the stage sky shows through).
 */

const W = 400;
const H = 240;
/** Cool a colour on dark (night / dusk) surfaces. */
const dim = (c: Ctx, color: string, k = 0.4) => (c.dark ? mix(color, '#1B1F4B', k) : color);
const r2 = (n: number) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------------------------------------------
// Building blocks

/** The Kaʿbah in three-quarter view, foot at (x, y); about 66 × 64 at s = 1. */
function Kaaba({ c, x, y, s = 1 }: { c: Ctx; x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Ellipse cx={0} cy={4} rx={44} ry={7} fill={c.dark ? '#000000' : C.ink} opacity={c.dark ? 0.35 : 0.14} />
      {c.dark && <Path d="M-37-52-6-59 35-52 35 2-6 10-37 2Z" fill={C.goldPale} opacity={0.14} />}
      <Path d="M-34-50-4-56 32-50 0-44Z" fill="#3A3A44" />
      <Path d="M-34-50 0-44V8L-34 0Z" fill="#1E1E24" />
      <Path d="M0-44 32-50V0L0 8Z" fill="#2C2C34" />
      <Path d="M-34-38 0-32V-27L-34-33Z" fill={C.gold} />
      <Path d="M0-32 32-38V-33L0-27Z" fill={C.goldDeep} />
      <Path d="M-14-18-4-16.3V-2L-14-3.8Z" fill={C.gold} />
      <Path d="M-34-50 0-44 32-50" stroke={c.dark ? '#6A6A78' : '#4A4A55'} strokeWidth={1} fill="none" />
    </G>
  );
}

/** A ridge of mountains: polyline of peaks closed down to `base`. */
function Ridge({ pts, base = H, color, shade }: { pts: [number, number][]; base?: number; color: string; shade?: string }) {
  const d = `${smoothOpen(pts, 0.35)}L${pts[pts.length - 1][0]} ${base}L${pts[0][0]} ${base}Z`;
  return (
    <G>
      <Path d={d} fill={color} />
      {shade && <Path d={d} fill={shade} opacity={0.35} transform={`translate(10 6)`} />}
    </G>
  );
}

/** Stone well: a ring of stones with dark water inside, centre (x, y). */
function Well({ c, x, y, s = 1 }: { c: Ctx; x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Ellipse cx={0} cy={6} rx={22} ry={6} fill={C.ink} opacity={c.dark ? 0.35 : 0.12} />
      <Path d="M-18 0V-8A18 6 0 0 1 18 -8V0A18 6 0 0 1 -18 0Z" fill={dim(c, C.stone)} />
      <Path d="M4 -2.5V-10.5A18 6 0 0 1 18 -8V0A18 6 0 0 1 4 5.5Z" fill={dim(c, C.stoneDark)} opacity={0.45} />
      <Ellipse cx={0} cy={-8} rx={18} ry={6} fill={dim(c, C.stoneLight)} />
      <Ellipse cx={0} cy={-8} rx={13} ry={4} fill={dim(c, C.waterDark, 0.3)} />
      <Ellipse cx={-3} cy={-9} rx={5} ry={1.2} fill={C.waterLight} opacity={0.6} />
      <Path d="M-18-4H18M-12-1V-7M-2 0V-6M8-1V-7" stroke={dim(c, C.stoneDark)} strokeWidth={0.7} opacity={0.5} />
    </G>
  );
}

/** Flat-topped acacia (samurah) tree with its foot at (x, y). */
function Acacia({ c, x, y, s = 1 }: { c: Ctx; x: number; y: number; s?: number }) {
  const leaf = c.green(dim(c, C.olive, 0.35));
  const leafDark = c.green(dim(c, C.oliveDark, 0.35));
  const light = c.green(dim(c, C.leafPale, 0.35));
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Ellipse cx={0} cy={2} rx={52} ry={6} fill={C.ink} opacity={c.dark ? 0.3 : 0.12} />
      <Path d="M-4 0C-3-20-6-34-20-48L-16-50C-6-40-1-32 0-26 2-36 8-46 20-54L23-51C12-42 6-30 5-18 5-10 5-4 6 0Z" fill={dim(c, C.woodDark, 0.3)} />
      <Path d="M-60-50C-50-66-20-72 0-70 24-74 52-66 62-52 50-44 24-46 0-44-24-42-48-42-60-50Z" fill={leafDark} />
      <Path d="M-54-54C-44-68-18-74 2-72 24-76 48-68 56-56 44-50 20-52 0-50-22-48-44-48-54-54Z" fill={leaf} />
      <Path d="M-40-62C-26-70-6-71 8-70M18-70C32-70 42-66 48-60" stroke={light} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.7} />
    </G>
  );
}

/** A plain pitched tent (front view), foot centre (x, y). */
function Tent({ c, x, y, s = 1, color = C.sandLight, shade = C.sandDark }: { c: Ctx; x: number; y: number; s?: number; color?: string; shade?: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Ellipse cx={0} cy={1} rx={22} ry={3} fill={C.ink} opacity={c.dark ? 0.3 : 0.12} />
      <Path d="M-20 0L0-24 20 0Z" fill={dim(c, color)} />
      <Path d="M0-24 20 0H6Z" fill={dim(c, shade)} opacity={0.55} />
      <Path d="M-5 0L0-13 5 0Z" fill={dim(c, C.woodDark, 0.3)} />
      <Path d="M0-24V-28" stroke={dim(c, C.wood)} strokeWidth={1.4} strokeLinecap="round" />
    </G>
  );
}

/** Stars / city lamps on dark surfaces. */
function Lamps({ c, pts }: { c: Ctx; pts: [number, number][] }) {
  if (!c.dark) return null;
  return (
    <G>
      {pts.map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={1.3} fill={C.goldPale} opacity={0.9} />
      ))}
    </G>
  );
}

/** Makkah houses: flat-roofed blocks stepping up a slope. */
function SlopeHouses({ c, list }: { c: Ctx; list: [number, number, number, number][] }) {
  const col = dim(c, '#E8D2AE', 0.45);
  const sh = dim(c, C.sandDark, 0.45);
  return (
    <G>
      {list.map(([x, y, w, h], i) => (
        <House key={i} x={x} y={y} w={w} h={h} color={col} shadeColor={sh} window={dim(c, C.woodDark, 0.3)} door={i % 2 === 0} />
      ))}
    </G>
  );
}

function Pebbles({ c, list }: { c: Ctx; list: [number, number, number][] }) {
  return (
    <G>
      {list.map(([x, y, r], i) => (
        <Ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.6} fill={dim(c, i % 2 ? C.stone : C.stoneDark)} opacity={0.75} />
      ))}
    </G>
  );
}

/** Ground band from y down with a soft gradient. */
function Ground({ c, k, y, top, bottom }: { c: Ctx; k: string; y: number; top: string; bottom: string }) {
  return (
    <>
      <Defs>
        <Lin id={c.id(k)} stops={[[0, dim(c, top)], [1, dim(c, bottom)]]} />
      </Defs>
      <Path d={`M0 ${y}C100 ${y - 6} 300 ${y - 6} ${W} ${y}V${H}H0Z`} fill={c.url(k)} />
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Bands (400 × 240, transparent sky)

function MakkahValley({ c, kaaba = true }: { c: Ctx; kaaba?: boolean }) {
  return (
    <>
      <Ridge pts={[[0, 120], [60, 70], [110, 92], [150, 128], [190, 150]]} color={dim(c, '#B89A82', 0.5)} />
      <Ridge pts={[[210, 150], [250, 118], [300, 64], [350, 88], [400, 76]]} color={dim(c, '#B0927B', 0.5)} />
      <Ridge pts={[[120, 160], [170, 132], [230, 138], [280, 160]]} color={dim(c, '#A5876F', 0.5)} />
      <Ridge pts={[[0, 160], [40, 120], [80, 132], [130, 170]]} color={dim(c, '#9C7E66', 0.45)} />
      <Ridge pts={[[270, 172], [320, 126], [360, 140], [400, 118]]} color={dim(c, '#957760', 0.45)} />
      <SlopeHouses
        c={c}
        list={[
          [18, 166, 18, 12], [40, 158, 20, 13], [64, 168, 16, 10], [86, 176, 22, 13], [112, 184, 18, 11],
          [274, 184, 20, 12], [298, 174, 18, 11], [320, 164, 22, 13], [346, 156, 18, 12], [370, 166, 22, 13],
        ]}
      />
      <Ground c={c} k="mvg" y={186} top={C.sandLight} bottom={C.sandDeep} />
      <Ellipse cx={200} cy={210} rx={92} ry={16} fill={dim(c, C.sandLight)} opacity={0.75} />
      {kaaba && <Kaaba c={c} x={200} y={206} s={0.9} />}
      <SlopeHouses c={c} list={[[20, 232, 30, 18], [60, 236, 26, 15], [318, 236, 28, 16], [352, 232, 34, 20]]} />
      <Lamps c={c} pts={[[24, 160], [48, 150], [92, 170], [300, 168], [326, 156], [376, 160], [70, 162], [350, 150]]} />
    </>
  );
}

function HiraMountain({ c }: { c: Ctx }) {
  const rock = dim(c, '#9E7F6A', 0.5);
  const rockSh = dim(c, '#7E6152', 0.5);
  return (
    <>
      <Ridge pts={[[0, 170], [70, 140], [130, 160], [170, 176]]} color={dim(c, '#B39B86', 0.55)} />
      <Ridge pts={[[300, 176], [350, 150], [400, 160]]} color={dim(c, '#B39B86', 0.55)} />
      <Path d="M120 240C150 190 190 120 222 66 230 54 242 48 252 52 262 56 270 66 280 86 306 134 340 190 380 240Z" fill={rock} />
      <Path d="M252 52C262 56 270 66 280 86 306 134 340 190 380 240H300C290 180 270 120 252 52Z" fill={rockSh} opacity={0.6} />
      <Path d="M160 200L190 170M205 150L222 128M180 222L214 186M240 120L246 100M260 160L270 140M300 210L290 186" stroke={dim(c, '#6E5446', 0.5)} strokeWidth={1.6} strokeLinecap="round" opacity={0.5} />
      {/* the cave near the top, with a soft light */}
      <Glow c={c} k="hira" cx={244} cy={84} r={40} color={C.goldPale} opacity={c.dark ? 0.75 : 0.45} />
      <Path d="M234 92C234 82 240 76 246 76 252 76 256 82 256 92Z" fill={c.dark ? '#2A1E2A' : '#4A3530'} />
      <Path d="M238 92C238 85 242 81 246 81 250 81 253 85 253 92Z" fill={C.goldLight} opacity={c.dark ? 0.55 : 0.3} />
      <Path d="M228 94H262" stroke={rockSh} strokeWidth={3} strokeLinecap="round" />
      {/* a path up the mountain */}
      <Path d="M150 240C170 220 200 210 196 190S220 160 214 140 236 112 240 96" stroke={dim(c, C.sandLight, 0.5)} strokeWidth={2} strokeDasharray="4 4" fill="none" opacity={0.75} />
      <Ground c={c} k="hg" y={222} top={C.sand} bottom={C.sandDeep} />
      <SlopeHouses c={c} list={[[10, 230, 20, 12], [34, 234, 16, 10], [54, 228, 22, 13], [80, 236, 18, 10]]} />
      <Lamps c={c} pts={[[16, 222], [44, 228], [62, 220], [88, 230]]} />
    </>
  );
}

function TaifGardens({ c }: { c: Ctx }) {
  const g1 = c.green(dim(c, C.leafLight, 0.45));
  const g2 = c.green(dim(c, C.leaf, 0.45));
  const g3 = c.green(dim(c, C.leafDark, 0.45));
  const wall = dim(c, C.stoneLight, 0.45);
  return (
    <>
      <Ridge pts={[[0, 110], [60, 70], [120, 96], [190, 60], [260, 90], [330, 58], [400, 86]]} color={dim(c, '#8E9A8A', 0.55)} />
      <Ridge pts={[[0, 140], [80, 112], [160, 130], [240, 108], [320, 126], [400, 112]]} color={dim(c, '#7D8E76', 0.5)} />
      {/* terraces */}
      {[
        [150, g1],
        [176, g2],
        [204, g3],
      ].map(([y, col], i) => (
        <G key={i}>
          <Path d={`M0 ${y}C100 ${(y as number) - 8} 300 ${(y as number) + 4} 400 ${(y as number) - 6}V${H}H0Z`} fill={col as string} />
          <Path d={`M0 ${y}C100 ${(y as number) - 8} 300 ${(y as number) + 4} 400 ${(y as number) - 6}`} stroke={wall} strokeWidth={3} fill="none" />
        </G>
      ))}
      {[30, 70, 110, 150, 250, 290, 330, 370].map((x, i) => (
        <LeafyTree key={`a${x}`} c={c} x={x} y={150 - (i % 3) * 2} s={0.32} fruit={i % 2 ? C.berry : C.orange} fruitR={3} />
      ))}
      {[50, 100, 160, 220, 280, 340, 390].map((x, i) => (
        <LeafyTree key={`b${x}`} c={c} x={x} y={178 - (i % 2) * 3} s={0.42} leaf={C.leaf} fruit={i % 2 ? C.plum : undefined} fruitR={3} />
      ))}
      {/* vine rows */}
      <G stroke={c.green(dim(c, C.oliveDark, 0.4))} strokeWidth={2.4} strokeLinecap="round">
        {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map((x) => (
          <Path key={x} d={`M${x} 226V214M${x - 6} 214H${x + 6}`} />
        ))}
      </G>
      <G fill={c.green(dim(c, C.leafLight, 0.4))}>
        {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map((x) => (
          <Circle key={x} cx={x} cy={212} r={5} />
        ))}
      </G>
      <SlopeHouses c={c} list={[[196, 128, 18, 12], [218, 124, 22, 14], [244, 128, 16, 10]]} />
    </>
  );
}

function CaravanTrail({ c }: { c: Ctx }) {
  return (
    <>
      <Path d="M20 150V136Q24 128 36 126H90Q100 128 104 136V150Z" fill={dim(c, '#C79C7C', 0.5)} />
      <Path d="M290 150V130Q294 120 306 118H350Q360 120 364 130V150Z" fill={dim(c, '#BB8F70', 0.5)} />
      <Path d="M0 148C80 140 200 144 400 146V240H0Z" fill={dim(c, C.sand)} />
      <Path d="M0 176C90 166 200 172 400 168V240H0Z" fill={dim(c, C.sandDeep)} opacity={0.7} />
      <Path d="M0 212C120 202 260 206 400 210V240H0Z" fill={dim(c, '#D6A566')} />
      <Path d="M30 240C80 214 150 206 190 190S260 166 300 158 360 150 380 148" stroke={dim(c, C.sandLight)} strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.75} />
      <Path d="M30 240C80 214 150 206 190 190S260 166 300 158 360 150 380 148" stroke={dim(c, C.sandDark)} strokeWidth={1.4} strokeDasharray="2 6" fill="none" opacity={0.6} />
      <Acacia c={c} x={84} y={178} s={0.42} />
      <Acacia c={c} x={330} y={166} s={0.28} />
      <Pebbles c={c} list={[[140, 226, 5], [250, 200, 4], [330, 222, 6], [60, 200, 4], [200, 232, 3]]} />
    </>
  );
}

function ThawrCave({ c }: { c: Ctx }) {
  const rock = dim(c, '#9A8070', 0.5);
  const rockSh = dim(c, '#7A6052', 0.5);
  const web = c.dark ? '#E8EAF8' : '#8C93AE';
  const spokes = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4);
  return (
    <>
      <Ridge pts={[[0, 130], [70, 92], [150, 70], [220, 60], [300, 84], [400, 110]]} color={rock} />
      <Path d="M220 60C260 70 300 84 400 110V240H260C270 180 250 110 220 60Z" fill={rockSh} opacity={0.55} />
      <Path d="M40 150L70 130M110 120L140 110M290 120L320 132M330 160L360 150M60 190L90 180" stroke={dim(c, '#6A5044', 0.5)} strokeWidth={1.6} strokeLinecap="round" opacity={0.5} />
      {/* cave mouth */}
      <Path d="M150 196C150 160 170 140 200 140 230 140 250 160 250 196Z" fill={c.dark ? '#1C1420' : '#3E2C28'} />
      <Path d="M160 196C162 168 178 152 200 152 222 152 238 168 240 196Z" fill={c.dark ? '#120C16' : '#2A1E1C'} />
      {/* the spider's web across the mouth */}
      <G stroke={web} strokeWidth={0.8} opacity={0.85} fill="none">
        {spokes.map((a, i) => (
          <Line key={i} x1={200} y1={170} x2={r2(200 + Math.cos(a) * 30)} y2={r2(170 + Math.sin(a) * 26)} />
        ))}
        {[8, 15, 22].map((r) => (
          <Path key={r} d={spokes.map((a, i) => `${i ? 'L' : 'M'}${r2(200 + Math.cos(a) * r)} ${r2(170 + Math.sin(a) * r * 0.87)}`).join('') + 'Z'} />
        ))}
      </G>
      {/* a dove on its nest on a ledge */}
      <Path d="M108 166H150" stroke={rockSh} strokeWidth={5} strokeLinecap="round" />
      <Ellipse cx={128} cy={162} rx={13} ry={5} fill={dim(c, C.woodLight, 0.3)} />
      <Path d="M118 160C120 150 132 148 138 154L144 152 140 158C136 162 124 163 118 160Z" fill={c.dark ? '#D9DCEF' : '#F4F4F8'} />
      <Circle cx={139} cy={153} r={0.9} fill={C.ink} />
      <Path d="M122 156Q128 152 134 156" stroke={C.grey} strokeWidth={0.8} fill="none" />
      <Ground c={c} k="tg" y={196} top="#C9A884" bottom="#B48F6C" />
      <Pebbles c={c} list={[[120, 214, 7], [280, 210, 9], [330, 226, 6], [70, 230, 8], [230, 228, 5]]} />
    </>
  );
}

function MadinahPalms({ c }: { c: Ctx }) {
  return (
    <>
      <Ridge pts={[[0, 130], [80, 96], [150, 104], [220, 90], [300, 112], [400, 100]]} color={dim(c, '#B57D64', 0.55)} />
      <Path d="M0 150C120 142 280 142 400 148V240H0Z" fill={c.green(dim(c, C.leafPale, 0.5))} />
      {[20, 46, 80, 120, 290, 330, 362, 392].map((x, i) => (
        <Palm key={x} c={c} x={x} y={152} h={40 + (i % 3) * 8} lean={i % 2 ? 4 : -4} dark />
      ))}
      <SlopeHouses c={c} list={[[140, 160, 24, 14], [170, 162, 20, 12], [196, 158, 26, 16], [228, 162, 20, 12], [254, 160, 22, 14]]} />
      <Path d="M0 172C120 164 280 166 400 170V240H0Z" fill={dim(c, '#D9BC8C')} />
      <Path d="M0 198C120 190 280 194 400 196V240H0Z" fill={c.green(dim(c, C.olive, 0.45))} opacity={0.6} />
      {[34, 92, 318, 376].map((x, i) => (
        <Palm key={`f${x}`} c={c} x={x} y={232} h={90 + (i % 2) * 20} lean={i < 2 ? -6 : 6} dates={i % 2 === 0} />
      ))}
      <Path d="M140 236C170 214 230 214 260 236" stroke={c.green(dim(c, C.leafDark, 0.4))} strokeWidth={2} fill="none" opacity={0.5} />
    </>
  );
}

function BadrPlain({ c, wells = true }: { c: Ctx; wells?: boolean }) {
  return (
    <>
      <Ridge pts={[[0, 140], [60, 112], [120, 128], [200, 120], [280, 108], [350, 126], [400, 118]]} color={dim(c, '#C6A483', 0.5)} />
      <Path d="M0 150C120 140 280 142 400 148V240H0Z" fill={dim(c, C.sand)} />
      <Path d="M0 186C120 178 280 182 400 184V240H0Z" fill={dim(c, C.sandDeep)} opacity={0.6} />
      <Path d="M0 224C120 216 280 218 400 222V240H0Z" fill={dim(c, '#D6A566')} />
      <Pebbles c={c} list={[[40, 206, 5], [350, 200, 6], [300, 232, 5], [90, 230, 4], [180, 214, 3]]} />
      {wells && (
        <>
          <Well c={c} x={110} y={186} s={0.9} />
          <Well c={c} x={250} y={170} s={0.7} />
          <Well c={c} x={330} y={196} s={0.85} />
        </>
      )}
      <Acacia c={c} x={30} y={168} s={0.3} />
    </>
  );
}

function TrenchPlain({ c, dug }: { c: Ctx; dug: boolean }) {
  return (
    <>
      <Ridge pts={[[0, 110], [80, 70], [160, 92], [220, 84], [300, 100], [400, 92]]} color={dim(c, '#B57D64', 0.55)} />
      {[16, 44, 76, 330, 360, 390].map((x, i) => (
        <Palm key={x} c={c} x={x} y={132} h={36 + (i % 3) * 6} lean={i % 2 ? 4 : -4} dark />
      ))}
      <SlopeHouses c={c} list={[[100, 134, 22, 14], [128, 136, 18, 11], [152, 132, 26, 16], [184, 136, 20, 12], [210, 134, 24, 15], [240, 136, 20, 12], [266, 132, 24, 15], [296, 136, 20, 12]]} />
      <Path d="M0 136C120 128 280 130 400 134V240H0Z" fill={dim(c, '#D9BC8C')} />
      {/* black lava rock (harrah) on both sides */}
      <Path d="M0 150C30 140 60 150 70 170 50 182 20 178 0 186Z" fill={dim(c, '#4E4446', 0.3)} />
      <Path d="M400 148C370 140 340 150 330 172 352 184 380 178 400 188Z" fill={dim(c, '#4E4446', 0.3)} />
      <Path d="M0 174C120 168 280 170 400 174V240H0Z" fill={dim(c, '#CDAA78')} />
      {dug && <TrenchCut c={c} x0={40} x1={360} y={196} />}
      <Path d="M0 224C120 218 280 220 400 224V240H0Z" fill={dim(c, '#C09A68')} />
    </>
  );
}

/** A dug trench from x0 to x1 at y: a dark channel with the earth piled along its near side. */
function TrenchCut({ c, x0, x1, y }: { c: Ctx; x0: number; x1: number; y: number }) {
  return (
    <G>
      <Path d={`M${x0} ${y - 6}H${x1}L${x1 - 4} ${y + 8}H${x0 + 4}Z`} fill={dim(c, '#5A3E2C', 0.3)} />
      <Path d={`M${x0 + 4} ${y + 2}H${x1 - 4}L${x1 - 6} ${y + 8}H${x0 + 6}Z`} fill={dim(c, '#3E2A1E', 0.3)} />
      <Path d={`M${x0} ${y - 6}H${x1}`} stroke={dim(c, '#8A6448', 0.3)} strokeWidth={1.5} />
      <Path d={`M${x0 - 4} ${y + 10}C${x0 + 30} ${y + 2} ${(x0 + x1) / 2} ${y + 4} ${x1 + 4} ${y + 10}L${x1 + 4} ${y + 14}H${x0 - 4}Z`} fill={dim(c, '#B08A5C', 0.3)} />
    </G>
  );
}

function HudaybiyyahCamp({ c }: { c: Ctx }) {
  return (
    <>
      <Ridge pts={[[0, 128], [70, 100], [140, 118], [220, 96], [300, 114], [400, 104]]} color={dim(c, '#BF9F84', 0.5)} />
      <Path d="M0 150C120 142 280 144 400 148V240H0Z" fill={dim(c, C.sand)} />
      <Path d="M0 190C120 182 280 186 400 188V240H0Z" fill={dim(c, C.sandDeep)} opacity={0.6} />
      {[[40, 168, 0.8], [76, 172, 0.9], [112, 166, 0.7], [60, 194, 1], [104, 198, 0.9]].map(([x, y, s], i) => (
        <Tent key={i} c={c} x={x} y={y} s={s} />
      ))}
      <Acacia c={c} x={270} y={206} s={1.05} />
      <Pebbles c={c} list={[[170, 222, 5], [380, 214, 5], [200, 206, 3], [340, 230, 4]]} />
    </>
  );
}

/** A row of Makkah houses seen from the street; the doors are closed (safety for whoever closed their door). */
export const DOOR_SPOTS: [number, number, number, number][] = [
  [42, 170, 22, 36],
  [126, 166, 22, 40],
  [214, 172, 20, 34],
  [296, 168, 22, 38],
  [362, 174, 18, 32],
];

function MakkahDoors({ c, open }: { c: Ctx; open: boolean }) {
  const wall = dim(c, '#EAD5B2', 0.45);
  const wallSh = dim(c, '#D6B88E', 0.45);
  const wood = dim(c, C.woodLight, 0.3);
  const woodDk = dim(c, C.woodDark, 0.3);
  const houses: [number, number, number][] = [
    [0, 92, 120],
    [86, 82, 116],
    [174, 88, 124],
    [256, 84, 112],
    [336, 64, 128],
  ];
  return (
    <>
      <Ridge pts={[[0, 96], [80, 60], [160, 80], [250, 54], [330, 76], [400, 62]]} color={dim(c, '#B0927B', 0.55)} />
      {houses.map(([x, w, top], i) => (
        <G key={i}>
          <Rect x={x} y={top} width={w} height={210 - top} fill={i % 2 ? wallSh : wall} />
          <Rect x={x - 2} y={top - 5} width={w + 4} height={7} rx={2} fill={dim(c, C.sandDark, 0.45)} />
          <Rect x={x + w * 0.62} y={top + 16} width={12} height={12} rx={2} fill={woodDk} opacity={0.8} />
          <Rect x={x + w * 0.18} y={top + 18} width={10} height={10} rx={2} fill={woodDk} opacity={0.8} />
        </G>
      ))}
      {DOOR_SPOTS.map(([x, y, w, h], i) => (
        <G key={`d${i}`}>
          <Path d={`M${x - w / 2 - 3} ${y + h / 2 + 2}V${y - h / 2 + 6}Q${x} ${y - h / 2 - 6} ${x + w / 2 + 3} ${y - h / 2 + 6}V${y + h / 2 + 2}Z`} fill={dim(c, C.stoneLight, 0.4)} />
          {open ? (
            <>
              <Path d={`M${x - w / 2} ${y + h / 2}V${y - h / 2 + 7}Q${x} ${y - h / 2 - 3} ${x + w / 2} ${y - h / 2 + 7}V${y + h / 2}Z`} fill={c.dark ? '#1A1424' : '#4A3428'} />
              <Path d={`M${x - w / 2} ${y + h / 2}V${y - h / 2 + 7}L${x - w / 2 - 6} ${y - h / 2 + 10}V${y + h / 2 + 3}Z`} fill={wood} />
            </>
          ) : (
            <>
              <Path d={`M${x - w / 2} ${y + h / 2}V${y - h / 2 + 7}Q${x} ${y - h / 2 - 3} ${x + w / 2} ${y - h / 2 + 7}V${y + h / 2}Z`} fill={wood} />
              <Path d={`M${x} ${y - h / 2 + 2}V${y + h / 2}M${x - w / 2} ${y}H${x + w / 2}`} stroke={woodDk} strokeWidth={1} opacity={0.6} />
              <Circle cx={x + 3} cy={y + 2} r={1.3} fill={C.gold} />
            </>
          )}
        </G>
      ))}
      <Path d="M0 206C120 202 280 202 400 206V240H0Z" fill={dim(c, C.sandLight)} />
      <Path d="M0 224C120 220 280 220 400 224V240H0Z" fill={dim(c, C.sandDeep)} opacity={0.7} />
    </>
  );
}

function ArafatPlain({ c }: { c: Ctx }) {
  return (
    <>
      <Ridge pts={[[0, 120], [60, 86], [130, 104], [200, 92], [270, 108], [340, 84], [400, 100]]} color={dim(c, '#A98A76', 0.55)} />
      <Path d="M0 146C120 140 280 140 400 144V240H0Z" fill={dim(c, C.sand)} />
      {/* the hill of ʿArafat */}
      <Path d="M80 160C96 132 118 114 140 112 162 114 186 134 200 160Z" fill={dim(c, '#9E806A', 0.5)} />
      <Path d="M140 112C162 114 186 134 200 160H150C150 140 146 124 140 112Z" fill={dim(c, '#7E6152', 0.5)} opacity={0.5} />
      <Pebbles c={c} list={[[110, 150, 4], [150, 140, 3], [170, 152, 4], [128, 132, 3]]} />
      {/* rows of white tents across the plain */}
      {[0, 1, 2].map((row) =>
        Array.from({ length: 9 - row }, (_, i) => {
          const x = 220 + row * 10 + i * 20 - row * 4;
          const y = 166 + row * 18;
          return x < 400 ? <Tent key={`${row}-${i}`} c={c} x={x} y={y} s={0.55 + row * 0.12} color={C.white} shade={C.greyLight} /> : null;
        }),
      )}
      {Array.from({ length: 7 }, (_, i) => (
        <Tent key={`l${i}`} c={c} x={20 + i * 26} y={204 + (i % 2) * 6} s={0.8} color={C.white} shade={C.greyLight} />
      ))}
      <Path d="M0 222C120 216 280 216 400 222V240H0Z" fill={dim(c, C.sandDeep)} />
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Objects

function SealedLetter({ c }: { c: Ctx }) {
  return (
    <>
      <Shadow c={c} cx={60} cy={82} rx={50} />
      <Path d="M14 30C14 22 20 18 28 18H96V70H28C20 70 14 66 14 58Z" fill={C.cream} />
      <Path d="M20 30H92M20 40H92M20 50H80M20 60H70" stroke={C.sandDark} strokeWidth={1.4} opacity={0.5} />
      <Rect x={92} y={14} width={14} height={60} rx={7} fill={C.sandLight} />
      <Rect x={92} y={14} width={5} height={60} rx={2.5} fill={C.sand} />
      <Path d="M60 70C58 78 54 82 50 86M64 70C66 78 70 82 74 86" stroke={C.teal} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Circle cx={62} cy={66} r={13} fill={C.berry} />
      <Circle cx={62} cy={66} r={9} fill="none" stroke={C.pinkPale} strokeWidth={1.2} opacity={0.7} />
      <Path d="M57 63H67M57 66.5H67M57 70H67" stroke={C.pinkPale} strokeWidth={1.2} opacity={0.75} />
      {c.dark && <Circle cx={62} cy={66} r={16} fill={C.goldPale} opacity={0.1} />}
    </>
  );
}

function SealRing({ c }: { c: Ctx }) {
  return (
    <>
      <Shadow c={c} cx={40} cy={74} rx={28} />
      <Ellipse cx={40} cy={50} rx={22} ry={20} fill="none" stroke={C.greyLight} strokeWidth={7} />
      <Ellipse cx={40} cy={50} rx={22} ry={20} fill="none" stroke={C.white} strokeWidth={2} opacity={0.7} />
      <Ellipse cx={40} cy={26} rx={16} ry={12} fill={C.grey} />
      <Ellipse cx={40} cy={25} rx={12} ry={9} fill={C.greyLight} />
      <Path d="M33 21H47M33 25H47M33 29H47" stroke={C.greyDark} strokeWidth={1.4} strokeLinecap="round" />
    </>
  );
}

function TreatyScroll({ c }: { c: Ctx }) {
  return (
    <>
      <Defs>
        <Lin id={c.id('ts')} stops={[[0, '#FBF1D9'], [1, '#EFDDB4']]} />
      </Defs>
      <Rect x={0} y={0} width={300} height={220} fill={c.dark ? '#2A2F5C' : '#F6EAD0'} opacity={0.0} />
      <Path d="M30 22H270V198H30Z" fill={c.url('ts')} />
      <Rect x={18} y={10} width={264} height={18} rx={9} fill={C.woodPale} />
      <Rect x={18} y={192} width={264} height={18} rx={9} fill={C.woodPale} />
      <Rect x={18} y={10} width={264} height={6} rx={3} fill={C.woodLight} opacity={0.5} />
      <Rect x={18} y={192} width={264} height={6} rx={3} fill={C.woodLight} opacity={0.5} />
      {[48, 80, 112, 144].map((y) => (
        <Path key={y} d={`M52 ${y + 14}H248`} stroke={C.sandDark} strokeWidth={1} strokeDasharray="3 4" opacity={0.6} />
      ))}
      <Circle cx={236} cy={174} r={10} fill={C.berry} opacity={0.85} />
    </>
  );
}

function PledgeTree({ c }: { c: Ctx }) {
  return (
    <>
      <Glow c={c} k="pt" cx={80} cy={50} r={70} color={C.goldPale} opacity={c.dark ? 0.35 : 0.25} />
      <Acacia c={c} x={80} y={104} s={1.1} />
    </>
  );
}

function Cistern({ c }: { c: Ctx }) {
  return (
    <>
      <Shadow c={c} cx={60} cy={52} rx={56} ry={6} />
      <Path d="M8 22H112L104 48H16Z" fill={dim(c, C.mud, 0.3)} />
      <Path d="M8 22H112" stroke={dim(c, C.sandDark, 0.3)} strokeWidth={3} strokeLinecap="round" />
      <Path d="M14 26H106L100 40H20Z" fill={dim(c, C.water, 0.3)} />
      <Path d="M30 31H50M64 34H88" stroke={C.waterPale} strokeWidth={1.4} strokeLinecap="round" opacity={0.8} />
    </>
  );
}

function CampTents({ c }: { c: Ctx }) {
  return (
    <>
      <Tent c={c} x={30} y={70} s={1.1} />
      <Tent c={c} x={80} y={62} s={1.3} color="#EADBC2" />
      <Tent c={c} x={128} y={72} s={1} />
    </>
  );
}

function ClayStones({ c }: { c: Ctx }) {
  const list: [number, number, number][] = [[20, 40, 7], [36, 44, 6], [50, 38, 8], [64, 45, 6], [30, 32, 5], [46, 28, 6], [78, 40, 6], [60, 30, 5]];
  return (
    <>
      <Shadow c={c} cx={50} cy={50} rx={42} ry={5} />
      {list.map(([x, y, r], i) => (
        <G key={i}>
          <Ellipse cx={x} cy={y} rx={r} ry={r * 0.8} fill={i % 2 ? C.terracotta : C.clay} />
          <Ellipse cx={x - r * 0.3} cy={y - r * 0.3} rx={r * 0.35} ry={r * 0.25} fill={C.sandLight} opacity={0.4} />
        </G>
      ))}
    </>
  );
}

function Straw({ c }: { c: Ctx }) {
  const col = c.green('#D8C27A');
  const dk = '#B79E54';
  return (
    <>
      <Shadow c={c} cx={60} cy={56} rx={52} ry={5} />
      <G stroke={col} strokeWidth={2.2} strokeLinecap="round" fill="none">
        {[[14, 54, 40, 20], [24, 56, 60, 14], [40, 55, 70, 24], [56, 56, 96, 18], [70, 55, 104, 30], [30, 56, 22, 22], [84, 56, 80, 22]].map(([x1, y1, x2, y2], i) => (
          <Path key={i} d={`M${x1} ${y1}Q${(x1 + x2) / 2} ${y1 - 18} ${x2} ${y2}`} />
        ))}
      </G>
      <G fill={dk}>
        {[[40, 20], [60, 14], [70, 24], [96, 18], [104, 30], [22, 22], [80, 22]].map(([x, y], i) => (
          <Ellipse key={i} cx={x} cy={y} rx={3} ry={1.6} />
        ))}
      </G>
    </>
  );
}

/** Stylised map: Arabia and its neighbours (no labels – the game names the places). 400 × 260. */
export const RULERS_MAP_POINTS = {
  madinah: { x: 0.57, y: 0.54 },
  makkah: { x: 0.6, y: 0.68 },
  sham: { x: 0.48, y: 0.17 },
  persia: { x: 0.86, y: 0.25 },
  egypt: { x: 0.3, y: 0.42 },
  abyssinia: { x: 0.52, y: 0.9 },
};

function RulersMap({ c }: { c: Ctx }) {
  const sea = c.dark ? '#1A2E5A' : '#BFE3F2';
  const land = c.dark ? '#5B4C5E' : '#EBCF9C';
  const land2 = c.dark ? '#524660' : '#E3C48E';
  const green = c.dark ? '#3E5A4E' : '#CFDDA0';
  const coast = c.dark ? '#7A86B8' : '#8FC6DE';
  return (
    <>
      <Rect x={0} y={0} width={400} height={260} fill={land} />
      {/* Africa (west of the Red Sea) a little darker */}
      <Path d="M0 86L30 86 80 80 130 82 168 76 170 104 188 138 218 184 250 226 268 250 270 260H0Z" fill={land2} />
      {/* the Mediterranean */}
      <Path d="M0 22C30 26 60 32 90 28S140 24 160 34C170 42 172 58 168 76 140 84 110 80 80 80S30 86 0 86Z" fill={sea} stroke={coast} strokeWidth={1.5} />
      {/* the Red Sea */}
      <Path d="M166 86C172 92 180 104 192 124 206 150 222 178 240 204 254 224 266 238 276 246L268 252C256 238 244 224 230 206 212 182 196 156 184 134 176 118 170 104 166 92Z" fill={sea} stroke={coast} strokeWidth={1.2} />
      {/* the Persian Gulf */}
      <Path d="M298 96C312 102 326 114 340 128 352 140 364 154 378 168L370 174C356 160 344 148 330 136 316 124 304 112 294 102Z" fill={sea} stroke={coast} strokeWidth={1.2} />
      {/* the Arabian Sea */}
      <Path d="M276 246C300 240 330 230 360 216 380 206 392 198 400 194V260H270Z" fill={sea} stroke={coast} strokeWidth={1.2} />
      {/* the Nile and its delta */}
      <Path d="M118 82C122 100 124 120 128 140 132 164 136 190 146 214" stroke={c.dark ? '#3A6EA0' : C.water} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d="M100 82C108 88 128 88 136 82 128 94 120 96 118 104 116 96 108 90 100 82Z" fill={green} />
      {/* fertile lands: Sham and Mesopotamia */}
      <Path d="M172 34C186 28 200 30 206 44 204 62 192 72 180 70 174 60 172 46 172 34Z" fill={green} opacity={0.85} />
      <Path d="M250 30C276 34 298 52 306 82 296 92 282 84 272 70 262 56 254 44 250 30Z" fill={green} opacity={0.85} />
      {/* Arabia */}
      <Path d="M196 92C230 84 270 90 296 102 330 128 362 160 376 182 360 204 320 226 286 238 270 242 258 230 246 214 228 188 210 160 198 132 190 112Z" fill={C.goldPale} opacity={c.dark ? 0.1 : 0.3} />
      {/* sea ripples */}
      <G stroke={C.white} strokeWidth={1.2} opacity={c.dark ? 0.25 : 0.55} strokeLinecap="round">
        <Path d="M30 50h20M80 58h16M120 44h14M330 236h14M370 226h12" />
      </G>
    </>
  );
}

function TimelineRoad({ c }: { c: Ctx }) {
  const road = dim(c, C.sandLight, 0.4);
  return (
    <>
      <Path d="M0 120C60 110 140 116 200 112S340 104 400 110V200H0Z" fill={dim(c, C.sand)} />
      <Path d="M10 190C80 180 120 150 180 150S300 140 330 120 380 100 392 96" stroke={road} strokeWidth={14} strokeLinecap="round" fill="none" />
      <Path d="M10 190C80 180 120 150 180 150S300 140 330 120 380 100 392 96" stroke={dim(c, C.sandDark)} strokeWidth={1.4} strokeDasharray="4 6" fill="none" />
      {[[40, 182], [130, 158], [230, 148], [320, 126]].map(([x, y], i) => (
        <G key={i}>
          <Rect x={x - 3} y={y - 26} width={6} height={26} rx={2} fill={dim(c, C.wood, 0.3)} />
          <Circle cx={x} cy={y - 30} r={8} fill={i === 3 ? C.gold : dim(c, C.teal, 0.3)} />
          <Circle cx={x} cy={y - 30} r={3} fill={C.white} opacity={0.85} />
        </G>
      ))}
      <Kaaba c={c} x={378} y={98} s={0.32} />
    </>
  );
}

function TwoHouses({ c }: { c: Ctx }) {
  return (
    <>
      <Shadow c={c} cx={100} cy={124} rx={92} ry={8} />
      <House x={18} y={124} w={64} h={48} color={dim(c, '#E8D2AE', 0.35)} shadeColor={dim(c, C.sandDark, 0.35)} />
      <House x={118} y={124} w={64} h={52} color={dim(c, '#EBD9B8', 0.35)} shadeColor={dim(c, C.sandDark, 0.35)} />
      <Palm c={c} x={100} y={126} h={96} lean={-3} dates />
      <Path d="M50 104C70 92 130 92 150 104" stroke={C.gold} strokeWidth={3} strokeDasharray="5 4" fill="none" strokeLinecap="round" />
      <Path d={sparklePath(100, 30, 8)} fill={C.goldLight} />
    </>
  );
}

function SafaHill({ c }: { c: Ctx }) {
  return (
    <>
      <Shadow c={c} cx={90} cy={96} rx={84} ry={7} />
      <Path d="M8 96C30 64 60 40 92 38 124 40 152 64 172 96Z" fill={dim(c, '#BDA58C', 0.4)} />
      <Path d="M92 38C124 40 152 64 172 96H120C116 70 104 50 92 38Z" fill={dim(c, '#9C8470', 0.4)} opacity={0.6} />
      <Pebbles c={c} list={[[50, 80, 6], [80, 66, 5], [110, 74, 6], [140, 86, 5], [92, 50, 4]]} />
    </>
  );
}

function ElephantScene({ c }: { c: Ctx }) {
  const birds = c.dark ? '#C9CCEA' : C.nightSoft;
  const bird = (x: number, y: number, s: number) =>
    `M${x - 10 * s} ${y - 3 * s}Q${x - 5 * s} ${y - 8 * s} ${x} ${y}Q${x + 5 * s} ${y - 8 * s} ${x + 10 * s} ${y - 3 * s}`;
  return (
    <>
      <G transform="translate(0 0)">
        <MakkahValley c={c} />
      </G>
      <G transform="translate(64 196) scale(0.62)">
        <ElephantShape c={c} />
      </G>
      <G stroke={birds} strokeWidth={2.2} fill="none" strokeLinecap="round">
        {[[150, 40, 1], [170, 30, 0.8], [190, 46, 0.9], [214, 34, 0.7], [236, 50, 0.8], [260, 38, 0.6], [120, 56, 0.7]].map(([x, y, s], i) => (
          <Path key={i} d={bird(x, y, s)} />
        ))}
      </G>
    </>
  );
}

/** A calm elephant standing, side view, feet at (0, 0), ~120 wide. */
function ElephantShape({ c }: { c: Ctx }) {
  const col = dim(c, '#8E95A8', 0.25);
  const dk = dim(c, '#737A8E', 0.25);
  return (
    <G>
      <Ellipse cx={0} cy={2} rx={60} ry={6} fill={C.ink} opacity={c.dark ? 0.3 : 0.12} />
      <Path d="M-46-10V-54C-46-80-20-92 6-90 28-88 42-74 44-56V-10Z" fill={col} />
      <Rect x={-44} y={-26} width={14} height={26} rx={4} fill={dk} />
      <Rect x={-24} y={-26} width={14} height={26} rx={4} fill={col} />
      <Rect x={14} y={-26} width={14} height={26} rx={4} fill={dk} />
      <Rect x={30} y={-26} width={14} height={26} rx={4} fill={col} />
      <Path d="M40-70C54-84 72-80 76-62 78-50 72-40 70-26 68-14 72-6 78-4 74 0 64 0 60-8 56-18 60-34 58-46Z" fill={col} />
      <Path d="M44-74C34-82 30-60 40-48 50-44 54-60 48-72Z" fill={dk} />
      <Circle cx={64} cy={-64} r={2.2} fill={C.ink} />
      <Path d="M70-48C76-46 80-44 82-40" stroke={C.ivory} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M-46-50C-54-46-56-36-52-30" stroke={dk} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M-20-86C-4-90 16-90 30-84" stroke={dim(c, C.berry, 0.2)} strokeWidth={0} fill="none" />
    </G>
  );
}

// ---------------------------------------------------------------------------------------------------------------

export const seerahScenes = {
  // --- bands (400 × 240) ---
  /** Makkah: the dry valley, houses up the slopes, the Kaʿbah in the middle (Ibn Hisham). */
  'makkah-valley': art(W, H, (c) => <MakkahValley c={c} />),
  /** The same valley without the Kaʿbah drawn in (for build games). */
  'makkah-valley-empty': art(W, H, (c) => <MakkahValley c={c} kaaba={false} />),
  /** Jabal al-Nur with the Cave of Hiraʾ near the top and a soft light (Bukhari 3). */
  'hira-mountain': art(W, H, (c) => <HiraMountain c={c} />),
  /** Taʾif: a mountain town of gardens and terraces, south-east of Makkah. */
  'taif-gardens': art(W, H, (c) => <TaifGardens c={c} />),
  /** A desert trail for the journeys and caravans. */
  'caravan-trail': art(W, H, (c) => <CaravanTrail c={c} />),
  /** The Cave of Thawr, south of Makkah, with a web over the mouth and a dove on a ledge. */
  'thawr-cave': art(W, H, (c) => <ThawrCave c={c} />),
  /** Madinah: palm groves and flat mud houses, the hills behind. */
  'madinah-palms': art(W, H, (c) => <MadinahPalms c={c} />),
  /** The wells of Badr on the caravan route (Ibn Hisham). */
  'badr-plain': art(W, H, (c) => <BadrPlain c={c} />),
  'badr-plain-empty': art(W, H, (c) => <BadrPlain c={c} wells={false} />),
  /** The edge of Madinah before the trench was dug (lava fields at the sides). */
  'trench-plain': art(W, H, (c) => <TrenchPlain c={c} dug={false} />),
  /** The same plain with the trench dug across it (Quran 33:9; Ibn Hisham). */
  'trench-dug': art(W, H, (c) => <TrenchPlain c={c} dug />),
  /** Al-Hudaybiyyah: the camp of the pilgrims and the tree of the pledge (Quran 48:18). */
  'hudaybiyyah-camp': art(W, H, (c) => <HudaybiyyahCamp c={c} />),
  /** Makkah houses with closed doors (Muslim 1780: whoever closed his door was safe). */
  'makkah-doors': art(W, H, (c) => <MakkahDoors c={c} open={false} />),
  'makkah-doors-open': art(W, H, (c) => <MakkahDoors c={c} open />),
  /** The plain of ʿArafat with tents (Muslim 1218). */
  'arafat-plain': art(W, H, (c) => <ArafatPlain c={c} />),
  // --- objects ---
  'letter-sealed': art(120, 92, (c) => <SealedLetter c={c} />),
  'seal-ring': art(80, 80, (c) => <SealRing c={c} />),
  'treaty-scroll': art(300, 220, (c) => <TreatyScroll c={c} />),
  'pledge-tree': art(160, 110, (c) => <PledgeTree c={c} />),
  cistern: art(120, 60, (c) => <Cistern c={c} />),
  'camp-tents': art(160, 80, (c) => <CampTents c={c} />),
  'trench-section': art(120, 40, (c) => <TrenchCut c={c} x0={8} x1={112} y={16} />),
  'clay-stones': art(100, 56, (c) => <ClayStones c={c} />),
  straw: art(120, 62, (c) => <Straw c={c} />),
  'safa-hill': art(180, 100, (c) => <SafaHill c={c} />),
  'rulers-map': art(400, 260, (c) => <RulersMap c={c} />),
  'timeline-road': art(400, 200, (c) => <TimelineRoad c={c} />),
  'two-houses': art(200, 130, (c) => <TwoHouses c={c} />),
  'elephant-scene': art(W, H, (c) => <ElephantScene c={c} />),
  elephant: art(140, 100, (c) => (
    <G transform="translate(62 94)">
      <ElephantShape c={c} />
    </G>
  )),
  well: art(60, 40, (c) => <Well c={c} x={30} y={28} s={1.2} />),
  kaaba: art(100, 80, (c) => <Kaaba c={c} x={50} y={68} s={1} />),
  'acacia': art(140, 90, (c) => <Acacia c={c} x={70} y={84} s={1} />),
  tent: art(60, 36, (c) => <Tent c={c} x={30} y={32} s={1.2} />),
} satisfies Record<string, ArtDef>;
