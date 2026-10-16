import { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { archPath, art, Eye, Glow, LeafyTree, leafPath, Lin, Palm, Rad, Shadow, smoothOpen, sparklePath, star8Path, type ArtDef, type Ctx } from '../../kit';
import { C, light, mix, shade } from '../../palette';

/*
 * `prophet.*` pieces of story group C (docs/GAMES-V3.md §3.4, docs/STORIES-V3.md): Sulayman, Ilyas, Al-Yasa, Yunus,
 * Zakariyya, Yahya, Isa and Muhammad ﷺ. Keys start with the prophet's story id.
 *
 * Never people: prophets are shown only through places, objects, animals, nature and light. Full-width bands are
 * 400 × 240 with a transparent sky so the stage sky, stars and sun show through; `c.dark` (night, dusk, storm and sea
 * stages) cools the scenery and strengthens glows.
 */

const W = 400;
const H = 240;
const f = (n: number) => Math.round(n * 100) / 100;

/** Darken / cool a colour on dark stages. */
const dim = (c: Ctx, color: string, k = 0.38) => (c.dark ? mix(color, '#1B1F4B', k) : color);

// ---------------------------------------------------------------------------------------------------------------
// Small shared bits

function Ant({ x, y, s = 1, color, flip = false }: { x: number; y: number; s?: number; color: string; flip?: boolean }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <G stroke={color} strokeWidth={0.9} strokeLinecap="round" fill="none">
        <Path d="M-1 0-4 3M0 0 0 3.4M1 0 4 3M4-3 7-6M5-2 8-4" />
      </G>
      <Ellipse cx={-4} cy={-1} rx={3} ry={2.2} fill={color} />
      <Circle cx={0.5} cy={-1.2} r={1.5} fill={color} />
      <Circle cx={4} cy={-2} r={2} fill={color} />
    </G>
  );
}

function Anthill({ c, x, y, w, ant }: { c: Ctx; x: number; y: number; w: number; ant: string }) {
  const h = w * 0.42;
  return (
    <G>
      <Ellipse cx={x} cy={y} rx={w * 0.62} ry={w * 0.08} fill={c.dark ? '#000000' : C.ink} opacity={c.dark ? 0.3 : 0.08} />
      <Path d={`M${x - w / 2} ${y}C${x - w * 0.36} ${y - h * 0.9} ${x - w * 0.14} ${y - h} ${x} ${y - h}C${x + w * 0.16} ${y - h} ${x + w * 0.38} ${y - h * 0.86} ${x + w / 2} ${y}Z`} fill={dim(c, '#C9945E')} />
      <Path d={`M${x + w * 0.04} ${y - h}C${x + w * 0.2} ${y - h} ${x + w * 0.38} ${y - h * 0.86} ${x + w / 2} ${y}H${x + w * 0.16}C${x + w * 0.2} ${y - h * 0.5} ${x + w * 0.14} ${y - h * 0.8} ${x + w * 0.04} ${y - h}Z`} fill={dim(c, '#A9764A')} opacity={0.7} />
      <Ellipse cx={x - w * 0.02} cy={y - h * 0.86} rx={w * 0.09} ry={w * 0.05} fill={dim(c, '#5A3A20')} />
      {[[-0.3, -0.35], [0.22, -0.5], [-0.08, -0.55], [0.32, -0.2]].map(([dx, dy], i) => (
        <Circle key={i} cx={x + dx * w} cy={y + dy * h} r={w * 0.018} fill={dim(c, '#8E643E')} />
      ))}
      <Ant x={x - w * 0.62} y={y - 1} s={w / 60} color={ant} />
      <Ant x={x + w * 0.66} y={y - 2} s={w / 66} color={ant} flip />
      <Ant x={x + w * 0.18} y={y - h * 0.62} s={w / 80} color={ant} />
    </G>
  );
}

function Lantern({ c, x, y, s = 1, lit = true }: { c: Ctx; x: number; y: number; s?: number; lit?: boolean }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {lit && <Glow c={c} k={`ln${Math.round(x)}_${Math.round(y)}`} cx={0} cy={22} r={30} color={C.goldPale} opacity={c.dark ? 0.7 : 0.45} />}
      <Path d="M-6 6H6L4 2H-4Z" fill={C.goldDeep} />
      <Circle cx={0} cy={0} r={2.2} fill="none" stroke={C.goldDeep} strokeWidth={1.2} />
      <Path d="M-9 8H9L11 14 8 32H-8L-11 14Z" fill={C.gold} />
      <Path d="M-6 12H6L7.5 16 5.5 29H-5.5L-7.5 16Z" fill={lit ? '#FFF3C4' : '#8F8A7A'} />
      {lit && <Path d="M0 27C-3 24-2 19 0 16 2 19 3 24 0 27Z" fill={C.orange} opacity={0.85} />}
      <Path d="M-8 32H8L4 38H-4Z" fill={C.goldDeep} />
    </G>
  );
}

function Fruit({ c, kind, x, y, s = 1 }: { c: Ctx; kind: 'grape' | 'pomegranate' | 'fig' | 'apple' | 'date'; x: number; y: number; s?: number }) {
  if (kind === 'grape') {
    const pts: [number, number][] = [[0, 0], [-5, -2], [5, -2], [-2.5, 4], [2.5, 4], [0, 8], [-7, -7], [0, -7], [7, -7]];
    return (
      <G transform={`translate(${x} ${y}) scale(${s})`}>
        <Path d="M0-12Q2-17 6-18" stroke={C.oliveDark} strokeWidth={1.4} fill="none" strokeLinecap="round" />
        <Path d={leafPath(1, -12, 9, 4, -30)} fill={c.green(C.leaf)} />
        {pts.map(([px, py], i) => (
          <G key={i}>
            <Circle cx={px} cy={py} r={3.4} fill={c.bloom(C.purple)} />
            <Circle cx={px - 1} cy={py - 1.2} r={1} fill={C.white} opacity={0.45} />
          </G>
        ))}
      </G>
    );
  }
  if (kind === 'pomegranate') {
    return (
      <G transform={`translate(${x} ${y}) scale(${s})`}>
        <Circle cx={0} cy={0} r={9} fill={c.bloom(C.berry)} />
        <Path d="M-3-8-4-12-1-10 0-13 1-10 4-12 3-8Z" fill={c.bloom(C.plum)} />
        <Ellipse cx={-3} cy={-3} rx={3} ry={2} fill={C.white} opacity={0.3} />
      </G>
    );
  }
  if (kind === 'fig') {
    return (
      <G transform={`translate(${x} ${y}) scale(${s})`}>
        <Path d="M0-9C3-9 4-6 5-3 8 1 7 8 0 8-7 8-8 1-5-3-4-6-3-9 0-9Z" fill={c.bloom('#7A4C8C')} />
        <Path d="M0-9V-12" stroke={C.oliveDark} strokeWidth={1.6} strokeLinecap="round" />
        <Ellipse cx={-2} cy={0} rx={1.8} ry={3} fill={C.white} opacity={0.22} />
      </G>
    );
  }
  if (kind === 'date') {
    return (
      <G transform={`translate(${x} ${y}) scale(${s})`}>
        <Ellipse cx={0} cy={0} rx={3.2} ry={5} fill={c.bloom(C.terracotta)} />
        <Ellipse cx={-1} cy={-1.6} rx={1} ry={1.8} fill={C.white} opacity={0.3} />
      </G>
    );
  }
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Circle cx={0} cy={0} r={8} fill={c.bloom(C.lemon)} />
      <Path d={leafPath(0, -7, 7, 3, -40)} fill={c.green(C.leaf)} />
      <Ellipse cx={-3} cy={-2} rx={2.4} ry={1.6} fill={C.white} opacity={0.35} />
    </G>
  );
}

function Sparkles({ pts, color = C.goldPale, opacity = 0.9 }: { pts: [number, number, number][]; color?: string; opacity?: number }) {
  return (
    <G fill={color} opacity={opacity}>
      {pts.map(([x, y, r], i) => (
        <Path key={i} d={sparklePath(x, y, r)} />
      ))}
    </G>
  );
}

function Waves({ c, y, w, color, crest = C.white }: { c: Ctx; y: number; w: number; color: string; crest?: string }) {
  const n = Math.ceil(w / 40);
  let d = `M0 ${y}`;
  for (let i = 0; i < n; i++) d += `q10 -7 20 0t20 0`;
  return (
    <G>
      <Path d={`${d}V${y + 60}H0Z`} fill={color} />
      <Path d={d} stroke={crest} strokeWidth={2} fill="none" opacity={c.dark ? 0.35 : 0.6} strokeLinecap="round" />
    </G>
  );
}

function AntsValley({ c }: { c: Ctx }) {
  const ant = c.dark ? '#D07A54' : '#7A3420';
  return (
    <>
      <Path d="M0 120C40 112 80 120 120 140S170 168 200 172L200 240H0Z" fill={dim(c, '#B98F6E')} />
      <Path d="M400 112C360 108 320 118 286 138S236 166 200 172L200 240H400Z" fill={dim(c, '#A97F60')} />
      <Path d="M0 146C50 140 90 152 130 166S170 182 200 186V240H0Z" fill={dim(c, '#C9A07A')} />
      <Path d="M400 142C350 138 310 150 270 166S230 182 200 186V240H400Z" fill={dim(c, '#BE9471')} />
      <Path d="M30 124C60 128 90 140 116 156M350 120C320 126 296 138 274 154" stroke={dim(c, '#8E6A50')} strokeWidth={2.2} fill="none" opacity={0.55} strokeLinecap="round" />
      <Path d="M0 192C80 180 160 180 240 186S360 182 400 186V240H0Z" fill={dim(c, C.sand)} />
      <Path d="M0 214C100 204 200 206 300 212S380 208 400 210V240H0Z" fill={dim(c, C.sandDeep)} />
      {/* the ants' road */}
      <Path d={smoothOpen([[20, 228], [90, 214], [170, 220], [240, 206], [320, 214], [390, 202]])} stroke={dim(c, '#B78553')} strokeWidth={7} fill="none" opacity={0.45} strokeLinecap="round" />
      {Array.from({ length: 22 }, (_, i) => {
        const t = i / 21;
        const x = 24 + t * 360;
        const y = 226 - t * 20 + Math.sin(t * 9) * 6;
        return <Ant key={i} x={x} y={y} s={0.85} color={ant} flip={i % 5 === 0} />;
      })}
      <Anthill c={c} x={70} y={204} w={52} ant={ant} />
      <Anthill c={c} x={196} y={198} w={64} ant={ant} />
      <Anthill c={c} x={330} y={200} w={56} ant={ant} />
      {[[24, 196], [128, 202], [262, 194], [376, 196]].map(([x, y], i) => (
        <G key={`g${i}`} stroke={c.green(dim(c, C.olive))} strokeWidth={1.8} strokeLinecap="round">
          <Path d={`M${x} ${y}l-4-9M${x} ${y}l0-11M${x} ${y}l4-9`} />
        </G>
      ))}
    </>
  );
}

function JourneyMap({ c }: { c: Ctx }) {
  return (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={[[0, c.dark ? '#2B3270' : '#F7C98A'], [1, c.dark ? '#4B4A8F' : '#FCEBD0']]} />
      </Defs>
      <Rect x={0} y={0} width={W} height={H} fill={c.url('sky')} />
      <Circle cx={200} cy={40} r={20} fill={c.dark ? '#FFF3C4' : C.goldLight} opacity={0.9} />
      <Path d="M0 120C60 108 120 112 200 120S330 108 400 114V240H0Z" fill={dim(c, '#E6C291', 0.48)} />
      <Path d="M0 150C80 134 150 138 220 150S340 136 400 144V240H0Z" fill={dim(c, C.sand)} />
      <Path d="M0 196C90 180 170 184 250 194S360 184 400 188V240H0Z" fill={dim(c, C.sandDeep)} />
      {/* Sulayman's camp (tents) on the left */}
      {[[40, 150, 46], [86, 156, 38]].map(([x, y, w], i) => (
        <G key={i}>
          <Path d={`M${x - w / 2} ${y}L${x} ${y - w * 0.7}L${x + w / 2} ${y}Z`} fill={dim(c, i ? C.teal : C.tealMid)} />
          <Path d={`M${x - w * 0.12} ${y}L${x} ${y - w * 0.3}L${x + w * 0.12} ${y}Z`} fill={dim(c, C.night, 0.1)} />
          <Path d={`M${x} ${y - w * 0.7}V${y - w * 0.95}`} stroke={C.woodDark} strokeWidth={2} />
          <Path d={`M${x} ${y - w * 0.95}h10l-3 4 3 4h-10Z`} fill={C.gold} />
        </G>
      ))}
      {/* an oasis in the middle */}
      <Ellipse cx={200} cy={186} rx={34} ry={8} fill={dim(c, C.water, 0.3)} />
      <Palm c={c} x={180} y={184} h={60} lean={-6} />
      <Palm c={c} x={220} y={186} h={50} lean={8} />
      {/* Saba' on the right */}
      {[[300, 150, 36, 40], [338, 156, 30, 52], [372, 150, 32, 36]].map(([x, y, w, h], i) => (
        <G key={`h${i}`}>
          <Rect x={x - w / 2} y={y - h} width={w} height={h} rx={2} fill={dim(c, i === 1 ? C.sandLight : '#EBD3A8')} />
          <Rect x={x - w / 2 - 2} y={y - h - 3} width={w + 4} height={4} fill={dim(c, C.sandDark)} />
          <Path d={archPath(x, y - h * 0.5, w * 0.3, y)} fill={dim(c, C.wood)} />
        </G>
      ))}
      <Path d="M338 104V92" stroke={C.goldDeep} strokeWidth={2} />
      <Circle cx={338} cy={90} r={3} fill={C.gold} />
      <Path d={smoothOpen([[20, 230], [120, 214], [210, 222], [300, 210], [390, 220]])} stroke={dim(c, C.sandDark)} strokeWidth={1.4} fill="none" strokeDasharray="3 6" opacity={0.6} />
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------

export const prophetC = {
  // ======================= Sulayman (27:15–44, 21:81, 34:12) =======================

  /** The valley of the ants (27:18): sandy valley floor, ant trails and anthills. Full-width band. */
  'sulayman-ants-valley': art(W, H, (c) => <AntsValley c={c} />),

  /** Game map: the ants' valley with its sky (PathTrace board). */
  'sulayman-valley-map': art(W, H, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={[[0, c.dark ? '#2B3270' : '#8FD0EC'], [1, c.dark ? '#4B4A8F' : '#E8F6FB']]} />
      </Defs>
      <Rect x={0} y={0} width={W} height={H} fill={c.url('sky')} />
      <Circle cx={330} cy={44} r={18} fill={c.dark ? '#FFF3C4' : C.goldLight} opacity={0.9} />
      <AntsValley c={c} />
    </>
  )),

  /** Game map: the hoopoe's way from Sulayman's camp across the desert to Saba' (27:20–28). */
  'sulayman-journey-map': art(W, H, (c) => <JourneyMap c={c} />),

  /** One anthill with its ants (27:18). */
  'sulayman-anthill': art(100, 60, (c) => <Anthill c={c} x={50} y={52} w={56} ant={c.dark ? '#D07A54' : '#7A3420'} />),

  /** The hoopoe in flight carrying the letter (27:20–28). */
  'sulayman-hoopoe-letter': art(130, 100, (c) => {
    const body = '#E09A5C';
    const ink = c.dark ? '#565A80' : C.ink;
    return (
      <>
        {c.dark && <Circle cx={66} cy={50} r={44} fill={C.white} opacity={0.07} />}
        {/* far wing */}
        <Path d="M60 44C52 22 40 8 22 6 30 18 34 30 44 44Z" fill={shade(body, 0.25)} />
        <Path d="M36 14 44 30M30 10 38 26" stroke={ink} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
        {/* tail */}
        <Path d="M38 56 10 66 14 74 40 62Z" fill={ink} />
        <Path d="M16 67 22 64M20 71 26 67" stroke={C.white} strokeWidth={2} />
        <Ellipse cx={58} cy={56} rx={24} ry={14} fill={body} />
        {/* near wing with stripes */}
        <Path d="M50 52C56 30 70 18 92 14 88 30 80 42 66 56Z" fill={ink} />
        <Path d="M60 44 74 26M66 48 80 32M72 50 86 38" stroke={C.white} strokeWidth={3} strokeLinecap="round" />
        {/* head + crest */}
        <Circle cx={84} cy={50} r={10} fill={body} />
        {[-70, -45, -20, 5, 30].map((a, i) => {
          const r = (a * Math.PI) / 180;
          const x2 = 80 + Math.sin(r) * 19;
          const y2 = 44 - Math.cos(r) * 19;
          return (
            <G key={i}>
              <Path d={`M81 45L${f(x2)} ${f(y2)}`} stroke={C.orange} strokeWidth={5} strokeLinecap="round" />
              <Circle cx={f(x2)} cy={f(y2)} r={2.6} fill={ink} />
              <Circle cx={f(80 + Math.sin(r) * 14.5)} cy={f(44 - Math.cos(r) * 14.5)} r={1.8} fill={C.white} />
            </G>
          );
        })}
        <Path d="M93 50C102 52 110 56 116 62 106 58 99 56 93 54Z" fill={ink} />
        <Eye x={87} y={48} r={1.7} />
        {/* the letter in its beak */}
        <G transform="rotate(14 112 66)">
          <Rect x={100} y={60} width={26} height={12} rx={5} fill={C.cream} />
          <Ellipse cx={126} cy={66} rx={3} ry={6} fill={C.sandLight} />
          <Ellipse cx={100} cy={66} rx={3} ry={6} fill={C.sandLight} />
          <Path d="M110 60V72" stroke={C.berry} strokeWidth={2.4} />
          <Circle cx={112} cy={66} r={4} fill={C.berry} />
          <Path d={star8Path(112, 66, 2.4)} fill={C.goldLight} />
        </G>
        <Path d="M54 70V80M62 70V80" stroke={ink} strokeWidth={2} strokeLinecap="round" />
      </>
    );
  }),

  /** The sealed letter of Sulayman (27:28–31) – a rolled scroll with a seal; no writing is drawn. */
  'sulayman-letter': art(110, 80, (c) => (
    <>
      <Glow c={c} k="g" cx={55} cy={40} r={46} color={C.goldPale} opacity={c.dark ? 0.55 : 0.35} />
      <Shadow c={c} cx={55} cy={70} rx={40} ry={4} />
      <Rect x={18} y={22} width={74} height={40} rx={8} fill={C.cream} />
      <Path d="M18 30H92M18 54H92" stroke={C.sandLight} strokeWidth={1.5} />
      <Ellipse cx={18} cy={42} rx={9} ry={20} fill={C.sandLight} />
      <Ellipse cx={18} cy={42} rx={4} ry={14} fill={C.sand} />
      <Ellipse cx={92} cy={42} rx={9} ry={20} fill={C.sandLight} />
      <Path d="M88 24C94 30 96 54 88 60" stroke={C.sand} strokeWidth={2} fill="none" />
      <Path d="M56 22V62" stroke={C.berry} strokeWidth={4} />
      <Path d="M52 62 48 74M60 62 64 74" stroke={C.berry} strokeWidth={3} strokeLinecap="round" />
      <Circle cx={56} cy={42} r={11} fill={C.berry} />
      <Circle cx={56} cy={42} r={8} fill={shade(C.berry, 0.15)} />
      <Path d={star8Path(56, 42, 6)} fill={C.goldLight} />
      <Sparkles pts={[[96, 14, 5], [12, 12, 3.5]]} />
    </>
  )),

  /** The palace made smooth with glass over water (27:44): columns, arches and a glass floor with fish beneath. */
  'sulayman-glass-palace': art(W, H, (c) => {
    const stone = dim(c, '#EDE3D0', 0.3);
    const stoneSh = dim(c, '#CDBE9E', 0.3);
    const cols = [30, 110, 290, 370];
    return (
      <>
        <Defs>
          <Lin id={c.id('fl')} stops={[[0, c.dark ? '#3A6E8E' : '#9ED6EE'], [1, c.dark ? '#163E5C' : '#3E94C4']]} />
          <Lin id={c.id('gl')} x1={0} y1={0} x2={1} y2={1} stops={[[0, C.white, 0.5], [0.5, C.white, 0.05], [1, C.white, 0.35]]} />
        </Defs>
        {/* back wall with arches */}
        <Rect x={0} y={40} width={W} height={130} fill={stone} />
        {[70, 200, 330].map((x) => (
          <G key={x}>
            <Path d={archPath(x, 66, 70, 170)} fill={c.dark ? '#262B5C' : '#BFE3F0'} />
            <Path d={archPath(x, 66, 70, 170)} fill="none" stroke={C.goldDeep} strokeWidth={2.5} />
            <Path d={star8Path(x, 56, 6)} fill={C.gold} />
          </G>
        ))}
        <Rect x={0} y={40} width={W} height={8} fill={stoneSh} />
        {/* the glass floor over water */}
        <Path d="M0 170H400V240H0Z" fill={c.url('fl')} />
        {[[60, 200, 1], [250, 218, -1], [330, 192, 1], [150, 226, -1]].map(([x, y, d], i) => (
          <G key={`f${i}`} transform={`translate(${x} ${y}) scale(${d} 1)`} opacity={0.75}>
            <Path d="M-10 0C-4-6 6-6 10 0 6 6-4 6-10 0Z" fill={i % 2 ? C.orange : C.gold} />
            <Path d="M-10 0-16-5-16 5Z" fill={i % 2 ? C.orange : C.gold} />
          </G>
        ))}
        <G stroke={C.white} strokeWidth={1.4} fill="none" opacity={0.5} strokeLinecap="round">
          <Path d="M20 184q14-4 28 0M120 196q16-5 32 0M210 182q14-4 28 0M300 206q16-5 32 0M90 222q14-4 28 0M260 230q14-4 28 0" />
        </G>
        {/* glass tiles */}
        <G stroke={C.white} strokeWidth={1} opacity={c.dark ? 0.35 : 0.6}>
          <Path d="M0 186H400M0 206H400M0 228H400" />
          <Path d="M200 170V240M140 170 110 240M260 170 290 240M80 170 20 240M320 170 380 240" />
        </G>
        <Path d="M0 170H400V240H0Z" fill={c.url('gl')} />
        <Rect x={0} y={168} width={W} height={4} fill={C.white} opacity={0.7} />
        {/* columns */}
        {cols.map((x) => (
          <G key={`c${x}`}>
            <Rect x={x - 12} y={36} width={24} height={10} rx={2} fill={C.gold} />
            <Rect x={x - 9} y={46} width={18} height={124} fill={stone} />
            <Rect x={x + 2} y={46} width={7} height={124} fill={stoneSh} opacity={0.7} />
            <Rect x={x - 12} y={166} width={24} height={8} rx={2} fill={C.gold} />
            <Rect x={x - 9} y={176} width={18} height={50} fill={stone} opacity={0.18} />
          </G>
        ))}
        <Sparkles pts={[[180, 190, 5], [236, 212, 4], [100, 182, 3.5], [344, 222, 4]]} color={C.white} />
      </>
    );
  }),

  /** A great throne, empty (27:23, 27:38–42) – gold, with jewels. */
  'sulayman-throne': art(130, 140, (c) => (
    <>
      <Glow c={c} k="g" cx={65} cy={60} r={64} color={C.goldPale} opacity={c.dark ? 0.6 : 0.4} />
      <Shadow c={c} cx={65} cy={134} rx={52} ry={5} />
      <Path d="M30 128V54C30 24 46 10 65 6 84 10 100 24 100 54V128Z" fill={C.goldDeep} />
      <Path d="M38 120V58C38 34 50 20 65 16 80 20 92 34 92 58V120Z" fill={C.berry} />
      <Path d="M65 22C74 26 84 36 84 56V112H46V56C46 36 56 26 65 22Z" fill={shade(C.berry, 0.18)} />
      <Path d={star8Path(65, 48, 10)} fill={C.goldLight} />
      <Circle cx={65} cy={48} r={4} fill={C.teal} />
      <Rect x={22} y={92} width={86} height={14} rx={5} fill={C.gold} />
      <Rect x={26} y={104} width={78} height={10} rx={3} fill={C.goldDeep} />
      <Rect x={24} y={76} width={12} height={30} rx={4} fill={C.gold} />
      <Rect x={94} y={76} width={12} height={30} rx={4} fill={C.gold} />
      <Path d="M30 114V132H38V114M92 114V132H100V114" fill={C.goldDeep} />
      {[[30, 84, C.teal], [100, 84, C.teal], [50, 99, C.rose], [65, 99, C.tealLight], [80, 99, C.rose]].map(([x, y, col], i) => (
        <Circle key={i} cx={x as number} cy={y as number} r={3} fill={col as string} />
      ))}
      <Circle cx={65} cy={7} r={5} fill={C.goldLight} />
      <Sparkles pts={[[112, 20, 6], [18, 36, 4], [108, 64, 3.5]]} />
    </>
  )),

  /** The wind made subject to Sulayman (21:81, 34:12) – swirling ribbons of air with leaves (sky piece). */
  'sulayman-wind': art(180, 90, (c) => {
    const col = c.dark ? '#C9D8F2' : C.white;
    return (
      <>
        <G stroke={col} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85}>
          <Path d="M8 40C40 30 70 34 96 42S150 50 160 36C168 24 152 14 142 22 136 28 142 36 150 34" />
          <Path d="M20 62C56 54 86 58 116 66S160 70 172 60" opacity={0.7} />
          <Path d="M40 22C66 16 90 18 112 24" opacity={0.55} />
        </G>
        <Path d={leafPath(70, 52, 14, 5, -20)} fill={c.green(C.leafLight)} />
        <Path d={leafPath(124, 28, 12, 4.4, 30)} fill={c.green(C.leaf)} />
        <Path d={leafPath(36, 70, 11, 4, -50)} fill={c.green(C.olive)} />
      </>
    );
  }),

  // ======================= Ilyas (37:123–132, 6:85) =======================

  /** Hills at dusk with a winding path and lanterns – the call to worship Allah alone (37:123–126). Full band. */
  'ilyas-hill-lanterns': art(W, H, (c) => (
    <>
      <Path d="M0 120L50 92 90 110 150 72 210 104 260 80 320 108 370 86 400 98V240H0Z" fill={dim(c, '#9C8AA8', 0.45)} opacity={0.9} />
      <Path d="M0 156C60 130 110 132 170 146S290 124 400 140V240H0Z" fill={c.green(dim(c, '#7FA06A'))} />
      <Path d="M0 192C80 172 160 174 240 184S360 172 400 178V240H0Z" fill={c.green(dim(c, '#6A9058'))} />
      <Path d="M0 222C100 212 200 214 300 220S380 216 400 218V240H0Z" fill={c.green(dim(c, '#557A48'))} />
      <Path d={smoothOpen([[60, 240], [120, 214], [200, 204], [250, 182], [300, 160], [330, 140]])} stroke={dim(c, C.sandLight)} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.85} />
      <Path d={smoothOpen([[60, 240], [120, 214], [200, 204], [250, 182], [300, 160], [330, 140]])} stroke={dim(c, C.sand)} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray="2 10" />
      {[[110, 214, 0.9], [196, 200, 0.8], [262, 174, 0.7], [318, 146, 0.6]].map(([x, y, s], i) => (
        <G key={i}>
          <Path d={`M${x} ${y}V${y - 46 * s}`} stroke={C.woodDark} strokeWidth={3 * s} strokeLinecap="round" />
          <Path d={`M${x} ${y - 46 * s}h${10 * s}`} stroke={C.woodDark} strokeWidth={2.4 * s} strokeLinecap="round" />
          <Lantern c={c} x={x + 10 * s} y={y - 46 * s} s={0.8 * s} />
        </G>
      ))}
      <LeafyTree c={c} x={40} y={196} s={0.45} leaf={dim(c, C.olive)} leafDark={dim(c, C.oliveDark)} leafLight={dim(c, C.leafPale)} />
      <LeafyTree c={c} x={372} y={182} s={0.38} leaf={dim(c, C.olive)} leafDark={dim(c, C.oliveDark)} leafLight={dim(c, C.leafPale)} />
    </>
  )),

  /** A lit lantern on its post – one part of Ilyas' call (game piece and stage prop). */
  'ilyas-lantern': art(70, 120, (c) => (
    <>
      <Shadow c={c} cx={30} cy={116} rx={16} ry={3} />
      <Path d="M24 116V30" stroke={C.woodDark} strokeWidth={5} strokeLinecap="round" />
      <Path d="M24 30H44" stroke={C.woodDark} strokeWidth={4} strokeLinecap="round" />
      <Path d="M18 116H30" stroke={C.wood} strokeWidth={6} strokeLinecap="round" />
      <Lantern c={c} x={44} y={30} s={1.15} />
    </>
  )),

  // ======================= Al-Yasa (6:86, 38:48) =======================

  /** A chain of lanterns joined by a golden chain – the guided prophets named together in 6:83–90. Sky piece. */
  'alyasa-lantern-chain': art(W, 120, (c) => {
    const pts: [number, number][] = [[30, 40], [100, 58], [170, 66], [240, 66], [310, 58], [370, 40]];
    return (
      <>
        <Path d={smoothOpen([[0, 20], ...pts, [400, 20]])} stroke={C.goldDeep} strokeWidth={2} fill="none" />
        <Path d={smoothOpen([[0, 20], ...pts, [400, 20]])} stroke={C.goldLight} strokeWidth={1} fill="none" strokeDasharray="3 4" />
        {pts.map(([x, y], i) => (
          <Lantern key={i} c={c} x={x} y={y} s={i === 2 || i === 3 ? 1.25 : 1} />
        ))}
      </>
    );
  }),

  /** A bright eight-pointed star with soft rays – "all among the best" (38:48). */
  'alyasa-star': art(110, 110, (c) => (
    <>
      <Glow c={c} k="g" cx={55} cy={55} r={54} color={C.goldPale} opacity={c.dark ? 0.75 : 0.55} />
      <G stroke={C.goldLight} strokeWidth={2} strokeLinecap="round" opacity={0.6}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return <Path key={i} d={`M${f(55 + Math.cos(a) * 30)} ${f(55 + Math.sin(a) * 30)}L${f(55 + Math.cos(a) * (i % 2 ? 40 : 48))} ${f(55 + Math.sin(a) * (i % 2 ? 40 : 48))}`} />;
        })}
      </G>
      <Path d={star8Path(55, 55, 26)} fill={C.gold} />
      <Path d={star8Path(55, 55, 18, 22.5)} fill={C.goldLight} />
      <Circle cx={55} cy={55} r={8} fill="#FFF3C4" />
    </>
  )),

  // ======================= Yunus (37:139–148, 21:87–88, 10:98) =======================

  /** The laden ship (37:140). */
  'yunus-ship': art(200, 140, (c) => {
    const hull = dim(c, C.wood, 0.2);
    return (
      <>
        <Path d="M96 14V96" stroke={C.woodDark} strokeWidth={4} strokeLinecap="round" />
        <Path d="M98 18C128 30 146 54 150 84H98Z" fill={dim(c, C.cream, 0.2)} />
        <Path d="M98 18C118 34 128 56 130 84H98Z" fill={dim(c, C.sandLight, 0.2)} opacity={0.7} />
        <Path d="M94 26C76 40 66 60 64 84H94Z" fill={dim(c, C.ivory, 0.2)} />
        <Path d="M96 14 112 18 96 22Z" fill={C.berry} />
        {/* cargo */}
        {[[40, 86, 18, 14, C.clay], [58, 82, 16, 18, C.woodLight], [140, 84, 20, 16, C.clay], [158, 88, 14, 12, C.woodPale]].map(([x, y, w, h, col], i) => (
          <Rect key={i} x={x as number} y={(y as number) - (h as number) + 12} width={w as number} height={h as number} rx={2} fill={dim(c, col as string, 0.25)} />
        ))}
        <Path d="M120 98C120 88 126 84 132 86 130 92 128 96 128 98Z" fill={dim(c, C.terracotta, 0.25)} />
        <Path d="M14 96H186L170 124C160 132 40 132 30 124Z" fill={hull} />
        <Path d="M14 96H186L183 102H17Z" fill={shade(hull, 0.25)} />
        <Path d="M26 110H174" stroke={shade(hull, 0.3)} strokeWidth={2} />
        {[40, 70, 100, 130, 160].map((x) => (
          <Circle key={x} cx={x} cy={116} r={2.6} fill={shade(hull, 0.35)} />
        ))}
        <Path d="M186 96 196 86M14 96 6 88" stroke={hull} strokeWidth={4} strokeLinecap="round" />
      </>
    );
  }),

  /** The great whale in the deep sea (37:142) – gentle, mouth closed. */
  'yunus-whale': art(240, 120, (c) => (
    <>
      {c.dark && <Ellipse cx={120} cy={64} rx={118} ry={52} fill={C.white} opacity={0.05} />}
      <Path d="M24 60C8 44 4 26 12 20 20 30 28 40 40 50Z" fill="#2E5578" />
      <Path d="M24 64C8 78 4 96 12 102 20 92 28 82 40 72Z" fill="#2E5578" />
      <Path d="M32 62C50 28 116 18 168 26 206 32 230 52 228 74 226 96 200 108 158 108 98 108 52 92 32 62Z" fill="#3B6B96" />
      <Path d="M58 34C90 22 140 20 176 28 150 26 110 28 76 40Z" fill="#5C8DB8" opacity={0.6} />
      <Path d="M58 82C84 102 142 110 186 104 210 100 226 88 228 74 222 90 206 98 182 100 140 104 96 98 58 82Z" fill="#C4DAEA" />
      <Path d="M100 96Q140 104 184 98M112 102Q146 108 180 103" stroke="#9DBBD2" strokeWidth={1.8} fill="none" />
      <Path d="M126 78C132 94 146 102 160 100 148 92 140 86 126 78Z" fill="#2E5578" />
      <Eye x={192} y={62} r={3.6} />
      <Path d="M206 82Q214 84 220 78" stroke="#24476A" strokeWidth={2.2} strokeLinecap="round" fill="none" />
      {[[70, 50], [90, 42], [112, 46]].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={2.2} fill="#5C8DB8" opacity={0.7} />
      ))}
    </>
  )),

  /**
   * The darknesses (21:87): the night, the deep sea and the inside of the whale (Ibn Kathir on 21:87) as three
   * layered bands of darkness around a faint warm light. Use with `fill`.
   */
  'yunus-darkness': art(W, H, (c) => (
    <>
      <Defs>
        <Lin id={c.id('n')} stops={[[0, '#0B0E26'], [1, '#141A3E']]} />
        <Rad id={c.id('l')} stops={[[0, '#FFE9A8', 0.55], [0.4, '#F2B544', 0.15], [1, '#F2B544', 0]]} />
      </Defs>
      <Rect x={0} y={0} width={W} height={H} fill={c.url('n')} />
      {[[30, 24], [90, 40], [160, 18], [250, 30], [320, 16], [370, 44]].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={1.2} fill={C.white} opacity={0.35} />
      ))}
      <Path d="M0 70C60 60 120 66 200 72S330 62 400 68V240H0Z" fill="#0D2A44" />
      <Path d="M0 70C60 60 120 66 200 72S330 62 400 68" stroke="#3E6A86" strokeWidth={1.6} fill="none" opacity={0.5} />
      <Path d="M-20 240C-10 150 80 112 200 112S410 150 420 240Z" fill="#071A2C" />
      <Path d="M30 240C40 170 110 140 200 140S360 170 370 240Z" fill="#050F1C" />
      <Path d="M30 240C40 170 110 140 200 140S360 170 370 240" stroke="#22405A" strokeWidth={2} fill="none" opacity={0.6} />
      <Circle cx={200} cy={196} r={70} fill={c.url('l')} />
      <Circle cx={200} cy={200} r={5} fill="#FFF3C4" opacity={0.85} />
    </>
  )),

  /** The gourd plant (yaqtin) Allah caused to grow over Yunus on the shore (37:146). */
  'yunus-gourd': art(170, 130, (c) => {
    const leaf = c.green(C.leaf);
    const leafD = c.green(C.leafDark);
    const big = (x: number, y: number, r: number, rot: number, col: string) => (
      <G transform={`translate(${x} ${y}) rotate(${rot})`}>
        <Path d={`M0 ${r}C${-r * 1.1} ${r * 0.5} ${-r * 1.1} ${-r * 0.7} ${-r * 0.3} ${-r}C0 ${-r * 0.7} 0 ${-r * 0.7} ${r * 0.3} ${-r}C${r * 1.1} ${-r * 0.7} ${r * 1.1} ${r * 0.5} 0 ${r}Z`} fill={col} />
        <Path d={`M0 ${r}V${-r * 0.6}M0 ${r * 0.2}L${-r * 0.5} ${-r * 0.3}M0 ${r * 0.2}L${r * 0.5} ${-r * 0.3}`} stroke={C.white} strokeWidth={1} opacity={0.3} />
      </G>
    );
    return (
      <>
        <Shadow c={c} cx={85} cy={124} rx={72} ry={6} />
        <Path d="M10 126C30 110 60 106 86 108S140 112 160 126Z" fill={dim(c, C.sand, 0.25)} />
        {/* vine frame */}
        <Path d="M34 122C30 90 40 50 70 34S130 30 142 60 140 104 134 122" stroke={c.green(C.oliveDark)} strokeWidth={4} fill="none" strokeLinecap="round" />
        <Path d="M50 80C70 62 100 58 124 74" stroke={c.green(C.olive)} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        {big(52, 52, 18, -30, leafD)}
        {big(84, 30, 20, 0, leaf)}
        {big(118, 40, 19, 28, leafD)}
        {big(140, 74, 16, 50, leaf)}
        {big(36, 88, 15, -60, leaf)}
        {big(100, 64, 16, 10, c.green(C.leafLight))}
        {/* gourds */}
        {[[70, 92, 1], [112, 98, 0.85]].map(([x, y, s], i) => (
          <G key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <Path d="M0-14V-20" stroke={c.green(C.oliveDark)} strokeWidth={2} />
            <Path d="M0-15C5-15 6-10 5-6 10-2 11 10 0 12-11 10-10-2-5-6-6-10-5-15 0-15Z" fill={c.bloom('#B9C46A')} />
            <Path d="M-3-4C-4 2-3 6 0 9" stroke={C.white} strokeWidth={1.4} opacity={0.4} fill="none" />
          </G>
        ))}
        <Path d="M120 14C120 8 126 4 130 6" stroke={c.green(C.olive)} strokeWidth={1.6} fill="none" />
        <Circle cx={30} cy={40} r={4} fill={c.bloom(C.lemon)} />
        <Circle cx={30} cy={40} r={1.6} fill={C.orange} />
      </>
    );
  }),

  // ======================= Zakariyya (3:37–41, 19:2–11) =======================

  /** The mihrab where Maryam was cared for (3:37): arch, lamp and the provision that came from Allah. */
  'zakariyya-mihrab': art(200, 240, (c) => {
    const marble = c.dark ? '#D9D1C2' : C.marble;
    return (
      <>
        <Rect x={10} y={20} width={180} height={220} fill={marble} />
        <Rect x={10} y={20} width={180} height={220} fill="none" stroke={C.goldDeep} strokeWidth={3} />
        <Rect x={18} y={28} width={164} height={212} fill="none" stroke={C.tealMid} strokeWidth={5} />
        {Array.from({ length: 10 }, (_, i) => (
          <G key={i}>
            <Path d={star8Path(22, 46 + i * 19, 3)} fill={C.gold} />
            <Path d={star8Path(178, 46 + i * 19, 3)} fill={C.gold} />
          </G>
        ))}
        <Path d={archPath(100, 42, 130, 240)} fill={C.goldDeep} />
        <Path d={archPath(100, 48, 118, 240)} fill={C.teal} />
        <Defs>
          <Lin id={c.id('n')} stops={[[0, '#2B3166'], [1, '#191D48']]} />
        </Defs>
        <Path d={archPath(100, 56, 102, 240)} fill={c.url('n')} />
        <Glow c={c} k="lamp" cx={100} cy={118} r={50} color={C.goldPale} opacity={0.55} />
        <Path d="M100 56V92" stroke={C.goldDeep} strokeWidth={1.2} />
        <Lantern c={{ ...c, dark: true }} x={100} y={92} s={1.15} />
        {/* ledge with the provision */}
        <Rect x={56} y={186} width={88} height={8} rx={3} fill={C.woodLight} />
        <Rect x={56} y={192} width={88} height={4} fill={C.woodDark} opacity={0.6} />
        <Glow c={c} k="prov" cx={100} cy={172} r={38} color="#FFF3C4" opacity={0.7} />
        <Path d="M74 172H126C126 184 114 188 100 188S74 184 74 172Z" fill={C.clay} />
        <Path d="M74 172H126" stroke={shade(C.clay, 0.2)} strokeWidth={2} />
        <Fruit c={c} kind="grape" x={86} y={164} s={0.8} />
        <Fruit c={c} kind="pomegranate" x={104} y={164} s={0.85} />
        <Fruit c={c} kind="fig" x={118} y={166} s={0.8} />
        <Sparkles pts={[[70, 150, 5], [132, 148, 4], [100, 140, 3.5]]} color="#FFF3C4" />
        <Rect x={40} y={224} width={120} height={16} fill={C.goldDeep} opacity={0.45} />
      </>
    );
  }),

  /** A bowl of provision with a soft glow (3:37) – the fruit is drawn only as a picture of provision. */
  'zakariyya-provision': art(120, 90, (c) => (
    <>
      <Glow c={c} k="g" cx={60} cy={46} r={52} color="#FFF3C4" opacity={c.dark ? 0.7 : 0.5} />
      <Shadow c={c} cx={60} cy={84} rx={40} ry={4} />
      <Path d="M22 54H98C98 72 82 80 60 80S22 72 22 54Z" fill={C.clay} />
      <Path d="M28 60H92" stroke={C.goldLight} strokeWidth={2} opacity={0.6} />
      <Path d="M22 54H98" stroke={shade(C.clay, 0.25)} strokeWidth={3} strokeLinecap="round" />
      <Fruit c={c} kind="grape" x={40} y={44} />
      <Fruit c={c} kind="pomegranate" x={62} y={42} s={1.1} />
      <Fruit c={c} kind="fig" x={82} y={46} />
      <Fruit c={c} kind="apple" x={52} y={50} s={0.8} />
      <Fruit c={c} kind="date" x={74} y={52} />
      <Sparkles pts={[[20, 22, 5], [100, 18, 6], [60, 12, 4]]} color={c.dark ? '#FFF3C4' : C.gold} />
    </>
  )),

  // ======================= Yahya (19:12–15, 3:39) =======================

  /** "Take the Book with strength" (19:12): an open book with rays of light – no writing is drawn. */
  'yahya-book': art(130, 100, (c) => (
    <>
      <Glow c={c} k="g" cx={65} cy={44} r={56} color={C.goldPale} opacity={c.dark ? 0.7 : 0.5} />
      <G stroke={C.goldLight} strokeWidth={2.4} strokeLinecap="round" opacity={0.7}>
        <Path d="M65 30V6M48 34 36 14M82 34 94 14M36 42 16 30M94 42 114 30" />
      </G>
      <Shadow c={c} cx={65} cy={92} rx={50} ry={4} />
      <Path d="M10 52C30 44 50 46 65 56 80 46 100 44 120 52V86C100 78 80 80 65 90 50 80 30 78 10 86Z" fill={C.tealMid} />
      <Path d="M14 50C32 42 50 44 65 54V84C50 76 32 74 14 80Z" fill={C.cream} />
      <Path d="M116 50C98 42 80 44 65 54V84C80 76 98 74 116 80Z" fill={C.ivory} />
      <Path d="M65 54V86" stroke={C.sandDeep} strokeWidth={1.6} />
      <Path d="M24 56C36 52 48 54 58 60M24 64C36 60 48 62 58 68M72 60C82 54 94 52 106 56M72 68C82 62 94 60 106 64" stroke={C.sandDeep} strokeWidth={1.2} fill="none" opacity={0.55} strokeDasharray="5 3" />
      <Path d="M90 46V70L94 66 98 70V46" fill={C.berry} />
    </>
  )),

  /** A young tree in soft light – "We gave him wisdom while still a child" (19:12–13). */
  'yahya-sapling': art(110, 130, (c) => (
    <>
      <Glow c={c} k="g" cx={55} cy={56} r={54} color={C.goldPale} opacity={c.dark ? 0.6 : 0.45} />
      <Shadow c={c} cx={55} cy={124} rx={34} ry={4} />
      <Path d="M26 126C34 116 46 114 55 116S76 118 84 126Z" fill={dim(c, C.mud, 0.25)} />
      <LeafyTree
        c={c}
        x={55}
        y={120}
        s={0.95}
        blobs={[[0, -64, 22], [-18, -52, 16], [18, -50, 17], [-6, -82, 14], [10, -78, 15]]}
        fruit={C.pink}
        fruitR={3}
        fruits={[[-14, -56], [6, -70], [16, -54], [-4, -84], [22, -62]]}
      />
      <Sparkles pts={[[18, 26, 5], [94, 34, 4], [86, 12, 3]]} />
    </>
  )),

  // ======================= Isa (19:16–34, 3:45–55, 5:110–118, 4:157–158) =======================

  /** The palm tree and the stream beneath it (19:23–26). */
  'isa-palm-stream': art(240, 200, (c) => (
    <>
      <Defs>
        <Lin id={c.id('w')} x1={0} y1={0} x2={1} y2={0} stops={[[0, C.waterLight], [1, C.water]]} />
      </Defs>
      <Shadow c={c} cx={120} cy={176} rx={100} ry={8} />
      <Path d="M8 180C40 166 90 162 130 166S210 170 232 180V200H8Z" fill={dim(c, C.sand, 0.25)} />
      <Path d="M0 196C40 184 80 186 120 190S190 182 240 188V200H0Z" fill={c.url('w')} />
      <Path d="M0 196C40 184 80 186 120 190S190 182 240 188" stroke={C.white} strokeWidth={2} fill="none" opacity={0.7} />
      <G stroke={C.white} strokeWidth={1.2} opacity={0.6} strokeLinecap="round">
        <Path d="M30 194h14M100 196h18M170 192h12" />
      </G>
      {[[24, 186, 7], [208, 184, 8], [150, 188, 5]].map(([x, y, r], i) => (
        <Ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.55} fill={dim(c, C.stone, 0.25)} />
      ))}
      <Palm c={c} x={112} y={172} h={150} lean={14} fronds={1.05} dates />
      {/* ripe date clusters */}
      {[[116, 44], [136, 46], [124, 52]].map(([x, y], i) => (
        <G key={i}>
          {[[0, 0], [4, 3], [-4, 3], [0, 6], [6, 8], [-5, 9]].map(([dx, dy], j) => (
            <Ellipse key={j} cx={x + dx} cy={y + dy} rx={2.6} ry={3.6} fill={c.bloom(j % 2 ? C.terracotta : C.orange)} />
          ))}
        </G>
      ))}
      <G stroke={c.green(C.olive)} strokeWidth={2} strokeLinecap="round">
        <Path d="M196 184l-4-14M200 184l0-16M204 184l4-13M38 184l-4-12M42 184l2-14" />
      </G>
    </>
  )),

  /** A basket of fresh ripe dates (19:25). */
  'isa-date-basket': art(100, 80, (c) => (
    <>
      <Shadow c={c} cx={50} cy={76} rx={38} ry={4} />
      {[[30, 30], [40, 26], [50, 24], [60, 26], [70, 30], [36, 34], [46, 32], [56, 32], [66, 34], [50, 36]].map(([x, y], i) => (
        <G key={i}>
          <Ellipse cx={x} cy={y} rx={4.4} ry={6} fill={c.bloom(i % 3 ? C.terracotta : '#A44E2C')} transform={`rotate(${(i % 5) * 12 - 24} ${x} ${y})`} />
          <Ellipse cx={x - 1.4} cy={y - 2} rx={1.2} ry={2} fill={C.white} opacity={0.3} />
        </G>
      ))}
      <Path d="M14 38H86L78 72C76 76 24 76 22 72Z" fill={C.woodPale} />
      <Path d="M18 48H82M20 58H80M22 68H78" stroke={C.woodLight} strokeWidth={2.2} />
      <Path d="M30 38 32 74M44 38 44 76M58 38 56 76M72 38 68 74" stroke={C.woodLight} strokeWidth={1.6} opacity={0.7} />
      <Path d="M12 38H88" stroke={C.wood} strokeWidth={4} strokeLinecap="round" />
    </>
  )),

  /** The table spread sent down from the sky (5:112–115) – a cloth with food in soft light from above. */
  'isa-table': art(220, 140, (c) => (
    <>
      <Defs>
        <Lin id={c.id('ray')} stops={[[0, '#FFF3C4', c.dark ? 0.6 : 0.45], [1, '#FFF3C4', 0]]} />
      </Defs>
      <Path d="M80 0H140L196 104H24Z" fill={c.url('ray')} />
      <Shadow c={c} cx={110} cy={130} rx={96} ry={7} />
      <Ellipse cx={110} cy={108} rx={98} ry={24} fill={C.teal} />
      <Ellipse cx={110} cy={104} rx={94} ry={22} fill={C.cream} />
      <Ellipse cx={110} cy={104} rx={84} ry={18} fill="none" stroke={C.gold} strokeWidth={2} strokeDasharray="4 4" />
      {/* dishes */}
      <Ellipse cx={70} cy={100} rx={20} ry={7} fill={C.clay} />
      <Ellipse cx={70} cy={97} rx={16} ry={5} fill={C.goldPale} />
      <Ellipse cx={150} cy={100} rx={20} ry={7} fill={C.clay} />
      <Fruit c={c} kind="grape" x={144} y={92} s={0.7} />
      <Fruit c={c} kind="pomegranate" x={156} y={93} s={0.7} />
      <Path d="M92 104C92 92 104 86 112 86S132 92 132 104Z" fill={C.woodPale} />
      <Path d="M98 96Q112 90 126 96M96 101Q112 95 128 101" stroke={C.woodLight} strokeWidth={1.6} fill="none" />
      <Ellipse cx={110} cy={116} rx={12} ry={4} fill={C.clay} />
      <Fruit c={c} kind="date" x={106} y={113} s={0.7} />
      <Fruit c={c} kind="date" x={114} y={113} s={0.7} />
      <Path d="M58 92C58 84 64 82 68 86" stroke={C.white} strokeWidth={1.6} fill="none" opacity={0.7} />
      <Path d="M76 90C76 82 82 80 86 84" stroke={C.white} strokeWidth={1.6} fill="none" opacity={0.7} />
      <Sparkles pts={[[40, 60, 6], [180, 56, 6], [110, 30, 5], [70, 40, 3.5], [150, 36, 4]]} />
    </>
  )),

  /** A wooden cradle with a soft blanket, in gentle light (19:29–30). Never a figure. */
  'isa-cradle': art(130, 100, (c) => (
    <>
      <Glow c={c} k="g" cx={65} cy={52} r={54} color={C.goldPale} opacity={c.dark ? 0.6 : 0.4} />
      <Shadow c={c} cx={65} cy={94} rx={50} ry={4} />
      <Path d="M18 90C30 80 50 76 65 76S100 80 112 90" stroke={C.woodDark} strokeWidth={5} fill="none" strokeLinecap="round" />
      <Path d="M22 44H108L100 78C98 82 32 82 30 78Z" fill={C.woodLight} />
      <Path d="M22 44H108" stroke={C.wood} strokeWidth={5} strokeLinecap="round" />
      {[34, 48, 62, 76, 90].map((x) => (
        <Path key={x} d={`M${x} 48V78`} stroke={C.wood} strokeWidth={2} opacity={0.5} />
      ))}
      <Path d="M26 44C40 34 56 36 66 42 78 34 96 34 104 44Z" fill={C.pinkPale} />
      <Path d="M34 44C44 38 54 39 62 44" stroke={C.white} strokeWidth={2} fill="none" opacity={0.7} />
      <Path d="M22 44V30C22 22 30 18 36 22" stroke={C.wood} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d="M108 44V30C108 22 100 18 94 22" stroke={C.wood} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Sparkles pts={[[20, 14, 4.5], [110, 10, 5], [65, 12, 3.5]]} />
    </>
  )),

  // ======================= Muhammad ﷺ (96:1–5, 33:40, 21:107) =======================

  /** Jabal an-Nur with the cave of Hira at night and a beam of light from above (96:1–5). Full band. */
  'muhammad-hira': art(W, H, (c) => (
    <>
      <Defs>
        <Lin id={c.id('b')} stops={[[0, '#FFF3C4', c.dark ? 0.55 : 0.45], [1, '#FFF3C4', 0]]} />
      </Defs>
      <Path d="M0 170C60 160 100 150 140 152S240 162 300 156 380 158 400 162V240H0Z" fill={dim(c, '#8C7A86', 0.5)} />
      <Path d="M60 240L150 110Q190 54 214 46Q228 42 240 60L330 190 360 240Z" fill={dim(c, '#9E7E6C')} />
      <Path d="M214 46Q228 42 240 60L330 190 360 240H270C290 180 260 100 214 46Z" fill={dim(c, '#7E604F')} opacity={0.75} />
      <Path d="M150 110C170 104 186 108 196 116M120 160C140 150 160 152 176 160M250 120C262 130 272 144 280 160" stroke={dim(c, '#6E5244')} strokeWidth={2.4} fill="none" opacity={0.55} strokeLinecap="round" />
      {/* the cave */}
      <Path d="M206 92C206 80 214 74 222 76 230 78 234 86 232 96Z" fill="#14112A" />
      <Path d="M168 0H262L226 92H210Z" fill={c.url('b')} />
      <Glow c={c} k="cave" cx={220} cy={88} r={26} color="#FFF3C4" opacity={0.55} />
      <Path d="M0 214C100 204 200 208 300 214S380 210 400 212V240H0Z" fill={dim(c, '#B08A6A')} />
    </>
  )),

  /** A chain of 25 stars ending in one bright star – the messengers, sealed by the final messenger (33:40). */
  'muhammad-star-chain': art(W, 160, (c) => {
    const pts = Array.from({ length: 25 }, (_, i) => {
      const t = i / 24;
      return [20 + t * 340, 130 - Math.sin(t * Math.PI * 0.92) * 90 + t * 10] as [number, number];
    });
    const last = pts[24];
    return (
      <>
        <Path d={smoothOpen(pts)} stroke={C.goldLight} strokeWidth={1.4} fill="none" opacity={0.55} strokeDasharray="2 5" />
        {pts.slice(0, 24).map(([x, y], i) => (
          <Path key={i} d={star8Path(x, y, 4 + (i % 3) * 0.8)} fill={i % 2 ? C.goldLight : C.gold} opacity={0.9} />
        ))}
        <Glow c={c} k="last" cx={last[0]} cy={last[1]} r={34} color={C.goldPale} opacity={0.85} />
        <Path d={star8Path(last[0], last[1], 15)} fill={C.gold} />
        <Path d={star8Path(last[0], last[1], 10, 22.5)} fill="#FFF3C4" />
      </>
    );
  }),

  /** The pen and the inkwell beside an open page in soft light – "He taught by the pen" (96:4). No writing drawn. */
  'muhammad-pen': art(120, 110, (c) => (
    <>
      <Glow c={c} k="g" cx={60} cy={50} r={56} color={C.goldPale} opacity={c.dark ? 0.6 : 0.45} />
      <Shadow c={c} cx={60} cy={104} rx={50} ry={4} />
      <Path d="M10 80C30 72 46 74 60 82 74 74 90 72 110 80V98C90 90 74 92 60 100 46 92 30 90 10 98Z" fill={C.cream} />
      <Path d="M60 82V100" stroke={C.sandDeep} strokeWidth={1.4} />
      <Path d="M10 98C30 90 46 92 60 100 74 92 90 90 110 98" stroke={C.sandDeep} strokeWidth={1.4} fill="none" />
      <Path d="M80 72C80 64 84 60 92 60S104 64 104 72V82H80Z" fill={C.night} />
      <Ellipse cx={92} cy={60} rx={7} ry={2.4} fill={C.nightLine} />
      <Path d="M30 76 74 22 80 26 38 80Z" fill={C.woodLight} />
      <Path d="M30 76 26 86 38 80Z" fill={C.woodDark} />
      <Path d="M74 22 80 26 84 18 78 16Z" fill={C.wood} />
      <Sparkles pts={[[20, 24, 5], [100, 22, 6], [56, 10, 3.5]]} />
    </>
  )),

  // ======================= Game boards =======================

  /** The sea with waves at the bottom (Yunus game backdrop; transparent sky). */
  'yunus-sea-band': art(W, H, (c) => (
    <>
      <Waves c={c} y={170} w={W} color={dim(c, C.water, 0.4)} />
      <Waves c={c} y={196} w={W} color={dim(c, C.waterDeep, 0.4)} />
      <Path d="M0 222H400V240H0Z" fill={dim(c, C.waterDark, 0.4)} />
    </>
  )),

  /** A starry night sky band for the chain of the messengers (Muhammad ﷺ game backdrop). */
  'muhammad-night-band': art(W, H, (c) => (
    <>
      <Defs>
        <Lin id={c.id('s')} stops={[[0, '#141A44'], [1, c.dark ? '#262C66' : '#3A3F86']]} />
      </Defs>
      <Rect x={0} y={0} width={W} height={H} fill={c.url('s')} />
      {Array.from({ length: 40 }, (_, i) => (
        <Circle key={i} cx={(i * 97) % 400} cy={(i * 53) % 200} r={0.8 + (i % 3) * 0.5} fill={C.white} opacity={0.3 + (i % 4) * 0.15} />
      ))}
      <Path d="M0 210C80 196 160 198 240 206S360 198 400 202V240H0Z" fill="#1A1E47" />
      <Path d="M220 210L250 186Q262 176 270 184L300 212Z" fill="#232861" />
    </>
  )),

  /** Light pieces used as "tiles" of the light: a small warm light orb. */
  'yunus-light': art(60, 60, (c) => (
    <>
      <Glow c={c} k="g" cx={30} cy={30} r={30} color="#FFE9A8" opacity={0.9} />
      <Circle cx={30} cy={30} r={9} fill="#FFF3C4" />
      <Path d={sparklePath(30, 30, 16, 0.14)} fill={C.white} opacity={0.8} />
    </>
  )),

  /** A dark sea-cave rock (game piece: one of the darknesses). */
  'yunus-dark-wave': art(80, 60, (c) => (
    <>
      <Path d="M0 60C6 34 22 18 40 18S74 34 80 60Z" fill={c.dark ? '#22405A' : '#163552'} />
      <Path d="M8 60C14 40 26 30 40 30S66 40 72 60" stroke="#3E6A86" strokeWidth={2} fill="none" opacity={0.7} />
    </>
  )),

  /** Little sprout with a gourd leaf – growth stage of the gourd plant (game). */
  'yunus-gourd-sprout': art(80, 80, (c) => (
    <>
      <Shadow c={c} cx={40} cy={76} rx={24} ry={3} />
      <Path d="M20 78C26 70 34 68 40 68S54 70 60 78Z" fill={dim(c, C.sand, 0.25)} />
      <Path d="M40 70C40 56 42 44 48 36" stroke={c.green(C.oliveDark)} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d={leafPath(42, 52, 22, 9, -150)} fill={c.green(C.leaf)} />
      <Path d={leafPath(46, 40, 22, 9, -30)} fill={c.green(C.leafLight)} />
      <Path d="M48 36C52 30 58 30 60 34" stroke={c.green(C.olive)} strokeWidth={1.6} fill="none" />
    </>
  )),

  /** Light on the ground: a small campfire-free lamp of glass to mark a place on a path (Sulayman game). */
  'sulayman-banner': art(60, 90, (c) => (
    <>
      <Shadow c={c} cx={20} cy={86} rx={12} ry={2.5} />
      <Path d="M18 86V8" stroke={C.woodDark} strokeWidth={3.4} strokeLinecap="round" />
      <Path d="M20 10C34 6 44 14 56 10V40C44 44 34 36 20 40Z" fill={C.teal} />
      <Path d={star8Path(38, 25, 7)} fill={C.goldLight} />
      <Circle cx={18} cy={7} r={3.4} fill={C.gold} />
    </>
  )),

  /** A light (glowing) palm leaf frond – tile art for Isa's game (19:25). */
  'isa-palm-small': art(110, 140, (c) => (
    <>
      <Shadow c={c} cx={55} cy={134} rx={30} ry={4} />
      <Palm c={c} x={52} y={134} h={110} lean={8} dates />
    </>
  )),

  /** Ripe date (single), for catching (19:25). */
  'isa-date': art(40, 50, (c) => (
    <>
      <Ellipse cx={20} cy={28} rx={11} ry={16} fill={c.bloom(C.terracotta)} />
      <Ellipse cx={16} cy={22} rx={3.4} ry={6} fill={C.white} opacity={0.3} />
      <Path d="M20 12V5" stroke={C.woodDark} strokeWidth={2.4} strokeLinecap="round" />
    </>
  )),

  /** A palm leaf that drifts down (not to be caught, Isa's game). */
  'isa-leaf': art(60, 40, (c) => (
    <>
      <Path d={leafPath(6, 30, 52, 9, -20)} fill={c.green(C.leafDark)} />
      <Path d="M8 30 54 12" stroke={c.green(C.leafLight)} strokeWidth={1.2} opacity={0.7} />
    </>
  )),

  /** A pebble from the stream bed (not to be caught, Isa's game). */
  'isa-pebble': art(50, 36, (c) => (
    <>
      <Ellipse cx={25} cy={20} rx={20} ry={13} fill={dim(c, C.stoneLight, 0.2)} />
      <Ellipse cx={20} cy={15} rx={7} ry={4} fill={C.white} opacity={0.35} />
    </>
  )),

  /** Tile helper art: a gentle light ray symbol (wisdom / guidance) used on quality cards. */
  'yahya-light': art(80, 80, (c) => (
    <>
      <Glow c={c} k="g" cx={40} cy={40} r={40} color={C.goldPale} opacity={0.8} />
      <Path d={star8Path(40, 40, 14)} fill={C.gold} />
      <Circle cx={40} cy={40} r={6} fill="#FFF3C4" />
    </>
  )),

  /** Two hands-free symbol of kindness: a heart with a small house (dutiful to his parents, 19:14). */
  'yahya-home-heart': art(90, 80, (c) => (
    <>
      <Shadow c={c} cx={45} cy={76} rx={30} ry={3} />
      <Path d="M18 76V42L45 20 72 42V76Z" fill={dim(c, C.sandLight, 0.2)} />
      <Path d="M12 44 45 16 78 44" stroke={C.terracotta} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={archPath(45, 54, 16, 76)} fill={C.wood} />
      <Path d="M45 48C40 40 30 42 30 50 30 56 38 60 45 66 52 60 60 56 60 50 60 42 50 40 45 48Z" fill={C.rose} transform="translate(0 -14) scale(1) " />
    </>
  )),

  /** A simple dove of peace (19:15 "peace be upon him"). */
  'yahya-peace': art(90, 70, (c) => (
    <>
      {c.dark && <Circle cx={45} cy={36} r={32} fill={C.white} opacity={0.08} />}
      <Path d="M20 40C30 28 46 26 58 32 66 28 74 28 80 32 74 34 70 38 68 42 60 52 40 56 24 50 18 48 16 44 20 40Z" fill={C.white} />
      <Path d="M36 34C40 16 52 8 66 8 60 18 56 28 50 36Z" fill={light(C.greyLight, 0.3)} />
      <Path d="M20 40 6 36 10 46Z" fill={C.white} />
      <Path d="M80 32 86 33 80 35Z" fill={C.orange} />
      <Eye x={73} y={31} r={1.6} />
      <Path d="M62 40C70 44 72 50 70 52" stroke={c.green(C.leaf)} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d={leafPath(70, 52, 8, 3, 70)} fill={c.green(C.leaf)} />
    </>
  )),
} satisfies Record<string, ArtDef>;
