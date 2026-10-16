import { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { archPath, art, crescentPath, domePath, dropPath, Glow, House, leafPath, LeafyTree, Lin, Palm, Shadow, smoothOpen, sparklePath, star8Path, starPath, type ArtDef, type Ctx } from '../../kit';
import { C, light, mix, shade } from '../../palette';

/*
 * `prophet.*` art of story group B (docs/GAMES-V3.md §3.4, docs/STORIES-V3.md): Yaqub, Yusuf, Ayyub, Shuayb, Musa,
 * Harun, Dhul-Kifl and Dawud (peace be upon them). Owned by the prophets-b author; keys start with the prophet id.
 *
 * Never people: only places, objects, plants, animals, water and light. Miracles are shown calmly (a glow, a
 * sparkle), never as spectacle. Full-width bands are 400 × 240 with a transparent sky. No text inside the art.
 */

/** Darken / cool a colour on dark surfaces (night stages, dark mode). */
const dim = (c: Ctx, color: string, k = 0.32) => (c.dark ? mix(color, '#1B1F4B', k) : color);
const r2 = (n: number) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------------------------------------------
// Shared bits

/** Iron ring (a torus seen from the front) centred at (x, y) with outer radius R. */
function IronRing({ c, x, y, R, tone = '#8C97A8' }: { c: Ctx; x: number; y: number; R: number; tone?: string }) {
  const w = R * 0.3;
  return (
    <G>
      <Circle cx={x} cy={y + R * 0.06} r={R - w / 2} fill="none" stroke={shade(tone, 0.45)} strokeWidth={w} opacity={0.45} />
      <Circle cx={x} cy={y} r={R - w / 2} fill="none" stroke={dim(c, tone, 0.15)} strokeWidth={w} />
      <Path
        d={`M${r2(x - (R - w / 2) * 0.86)} ${r2(y - (R - w / 2) * 0.5)}A${R - w / 2} ${R - w / 2} 0 0 1 ${r2(x + (R - w / 2) * 0.2)} ${r2(y - (R - w / 2) * 0.98)}`}
        stroke={light(tone, 0.55)}
        strokeWidth={w * 0.32}
        strokeLinecap="round"
        fill="none"
      />
    </G>
  );
}

/** Wheat ear (a column of grains) from (x, y) upwards with length L, bent by `lean`. */
function Ear({ x, y, L, lean = 0, color, stalk }: { x: number; y: number; L: number; lean?: number; color: string; stalk: string }) {
  const tx = x + lean;
  const ty = y - L;
  const grains = Array.from({ length: 6 }, (_, i) => {
    const t = 0.55 + i * 0.075;
    const gx = x + lean * t * t;
    const gy = y - L * t;
    return (
      <G key={i}>
        <Ellipse cx={r2(gx - 2.2)} cy={r2(gy)} rx={2.1} ry={3.4} fill={color} transform={`rotate(-24 ${r2(gx - 2.2)} ${r2(gy)})`} />
        <Ellipse cx={r2(gx + 2.2)} cy={r2(gy)} rx={2.1} ry={3.4} fill={color} transform={`rotate(24 ${r2(gx + 2.2)} ${r2(gy)})`} />
      </G>
    );
  });
  return (
    <G>
      <Path d={`M${x} ${y}Q${r2(x + lean * 0.2)} ${r2(y - L * 0.5)} ${r2(tx)} ${r2(ty)}`} stroke={stalk} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      {grains}
      <Ellipse cx={r2(tx)} cy={r2(ty - 1)} rx={1.8} ry={3} fill={color} />
      <Path d={`M${r2(tx)} ${r2(ty - 3)}l${r2(lean * 0.1 - 2)} -9M${r2(tx)} ${r2(ty - 3)}l${r2(lean * 0.1 + 2)} -9`} stroke={color} strokeWidth={0.8} opacity={0.8} />
    </G>
  );
}

/** A sheaf of wheat tied with a band; `dry` gives the pale, drooping look of the dry ears (12:43). */
function Sheaf({ c, x, y, s = 1, dry = false }: { c: Ctx; x: number; y: number; s?: number; dry?: boolean }) {
  const grain = dry ? dim(c, '#C9A46A') : c.green(dim(c, '#9CBF4A'));
  const stalk = dry ? dim(c, '#B08A55') : c.green(dim(c, '#6E9A3A'));
  const leans = dry ? [-18, -10, -4, 6, 14, 22] : [-12, -6, -2, 3, 8, 13];
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {leans.map((lean, i) => (
        <Ear key={i} x={-6 + i * 2.4} y={-26} L={dry ? 44 - Math.abs(lean) * 0.4 : 52 - Math.abs(lean) * 0.3} lean={dry ? lean * 1.6 : lean} color={grain} stalk={stalk} />
      ))}
      <Path d="M-9 0L-6 -28H6L9 0Z" fill={stalk} />
      <Path d="M-2 0L-1 -28H2L3 0Z" fill={dry ? '#8F6E40' : shade(stalk, 0.2)} opacity={0.6} />
      <Rect x={-8} y={-26} width={16} height={5} rx={2} fill={dim(c, C.terracotta)} />
    </G>
  );
}

/** Rounded mud granary (silo) standing on y. */
function Silo({ c, x, y, w, h }: { c: Ctx; x: number; y: number; w: number; h: number }) {
  return (
    <G>
      <Path d={domePath(x, y - h * 0.55, w / 2, 0.9)} fill={dim(c, C.mud)} />
      <Rect x={x - w / 2} y={y - h * 0.56} width={w} height={h * 0.56} fill={dim(c, C.mud)} />
      <Path d={`M${x + w * 0.12} ${y}V${y - h * 0.56}Q${x + w * 0.42} ${y - h * 0.62} ${x + w * 0.38} ${y - h * 0.85}Q${x + w / 2} ${y - h * 0.62} ${x + w / 2} ${y - h * 0.56}V${y}Z`} fill={dim(c, C.clay)} opacity={0.4} />
      <Circle cx={x} cy={y - h * 0.97} r={w * 0.07} fill={dim(c, C.woodDark)} />
      <Path d={archPath(x - w * 0.1, y - h * 0.4, w * 0.2, y - h * 0.18)} fill={dim(c, C.woodDark)} />
      <Path d={`M${x - w / 2} ${y - h * 0.56}H${x + w / 2}`} stroke={dim(c, C.sandDark)} strokeWidth={2} />
    </G>
  );
}

/** Small market weight (brass knob weight). */
function Weight({ c, x, y, s = 1 }: { c: Ctx; x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M-14 0Q-15 -14 -8 -18H8Q15 -14 14 0Z" fill={dim(c, C.goldDeep, 0.15)} />
      <Path d="M3 -18H8Q15 -14 14 0H6Q8 -10 3 -18Z" fill={C.amber} opacity={0.5} />
      <Path d="M-6 -18Q-6 -26 0 -26T6 -18Z" fill={dim(c, C.gold, 0.15)} />
      <Circle cx={0} cy={-29} r={3.4} fill={dim(c, C.gold, 0.15)} />
      <Path d="M-10 -12Q-10 -16 -6 -17" stroke={C.goldPale} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.8} />
    </G>
  );
}

/** Tribe marker symbols for the twelve springs (2:60) – shapes only, never letters. */
type SymbolKind = 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'star8' | 'crescent' | 'drop' | 'leaf' | 'hexagon' | 'heart' | 'sun';
const TRIBE_SYMBOLS: SymbolKind[] = ['circle', 'square', 'triangle', 'diamond', 'star', 'star8', 'crescent', 'drop', 'leaf', 'hexagon', 'heart', 'sun'];
const TRIBE_COLORS = [C.coral, C.goldDeep, C.teal, C.purple, C.waterDeep, C.leafDark, C.rose, C.orange, C.indigo, C.terracotta, C.tealMid, C.plum];

function TribeSymbol({ kind, x, y, r, fill }: { kind: SymbolKind; x: number; y: number; r: number; fill: string }) {
  switch (kind) {
    case 'circle':
      return <Circle cx={x} cy={y} r={r * 0.8} fill={fill} />;
    case 'square':
      return <Rect x={x - r * 0.72} y={y - r * 0.72} width={r * 1.44} height={r * 1.44} rx={r * 0.18} fill={fill} />;
    case 'triangle':
      return <Path d={starPath(x, y + r * 0.15, r * 0.95, r * 0.95 * 0.5, 3)} fill={fill} />;
    case 'diamond':
      return <Path d={`M${x} ${y - r}L${x + r * 0.75} ${y}L${x} ${y + r}L${x - r * 0.75} ${y}Z`} fill={fill} />;
    case 'star':
      return <Path d={starPath(x, y + r * 0.08, r, r * 0.45)} fill={fill} />;
    case 'star8':
      return <Path d={star8Path(x, y, r * 0.95)} fill={fill} />;
    case 'crescent':
      return <Path d={crescentPath(x, y, r * 0.9, r * 0.45, -r * 0.2, r * 0.75)} fill={fill} />;
    case 'drop':
      return <Path d={dropPath(x, y - r, r * 2)} fill={fill} />;
    case 'leaf':
      return <Path d={leafPath(x - r * 0.75, y + r * 0.75, r * 2.1, r * 0.7, -45)} fill={fill} />;
    case 'hexagon': {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i;
        return `${r2(x + Math.cos(a) * r * 0.9)} ${r2(y + Math.sin(a) * r * 0.9)}`;
      });
      return <Path d={`M${pts.join('L')}Z`} fill={fill} />;
    }
    case 'heart':
      return (
        <Path
          d={`M${x} ${y + r * 0.85}C${x - r * 1.2} ${y} ${x - r * 0.9} ${y - r * 0.95} ${x} ${y - r * 0.35}C${x + r * 0.9} ${y - r * 0.95} ${x + r * 1.2} ${y} ${x} ${y + r * 0.85}Z`}
          fill={fill}
        />
      );
    case 'sun':
      return (
        <G>
          <Circle cx={x} cy={y} r={r * 0.5} fill={fill} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (Math.PI / 4) * i;
            return <Path key={i} d={`M${r2(x + Math.cos(a) * r * 0.68)} ${r2(y + Math.sin(a) * r * 0.68)}L${r2(x + Math.cos(a) * r)} ${r2(y + Math.sin(a) * r)}`} stroke={fill} strokeWidth={r * 0.2} strokeLinecap="round" />;
          })}
        </G>
      );
  }
}

/** Camp of one tribe: a tent with a banner in the tribe's colour and symbol. */
function tribeCamp(i: number): ArtDef {
  const color = TRIBE_COLORS[i];
  const kind = TRIBE_SYMBOLS[i];
  return art(80, 72, (c) => (
    <>
      <Shadow c={c} cx={40} cy={68} rx={32} ry={4} />
      <Path d="M6 68L30 26L54 68Z" fill={dim(c, C.sandLight)} />
      <Path d="M30 26L54 68H40Z" fill={dim(c, C.sandDeep)} />
      <Path d="M24 68L30 46L36 68Z" fill={dim(c, C.woodDark)} />
      <Path d="M30 26V12" stroke={dim(c, C.woodDark)} strokeWidth={2} />
      <Path d="M58 68V8" stroke={dim(c, C.wood)} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M59 9H78L74 21 78 33H59Z" fill={dim(c, color, 0.15)} />
      <TribeSymbol kind={kind} x={68} y={21} r={6} fill={C.white} />
    </>
  ));
}

/** Spring of one tribe: a small pool flowing from a stone marked with the tribe's colour and symbol. */
function tribeSpring(i: number): ArtDef {
  const color = TRIBE_COLORS[i];
  const kind = TRIBE_SYMBOLS[i];
  return art(80, 72, (c) => (
    <>
      <Ellipse cx={40} cy={56} rx={34} ry={12} fill={dim(c, C.sandDeep)} />
      <Ellipse cx={40} cy={55} rx={28} ry={9} fill={dim(c, C.water, 0.2)} />
      <Ellipse cx={36} cy={53} rx={16} ry={4} fill={dim(c, C.waterLight, 0.2)} opacity={0.8} />
      <Path d="M24 56q6-3 12 0M42 58q6-3 12 0" stroke={C.white} strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.6} />
      <Path d="M16 50C14 32 22 14 40 12S66 28 64 50Z" fill={dim(c, C.stone)} />
      <Path d="M44 13C58 18 66 32 64 50H50C54 36 52 22 44 13Z" fill={dim(c, C.stoneDark)} opacity={0.5} />
      <Circle cx={40} cy={30} r={11} fill={dim(c, color, 0.15)} />
      <TribeSymbol kind={kind} x={40} y={30} r={7} fill={C.white} />
      <Path d="M40 44C38 48 38 52 40 56" stroke={C.waterLight} strokeWidth={3} strokeLinecap="round" fill="none" />
    </>
  ));
}

const tribeArt = Object.fromEntries(
  TRIBE_COLORS.flatMap((_, i) => [
    [`musa-camp-${i + 1}`, tribeCamp(i)],
    [`musa-spring-${i + 1}`, tribeSpring(i)],
  ]),
) as Record<string, ArtDef>;

// ---------------------------------------------------------------------------------------------------------------

export const prophetB = {
  // ================= Yaqub =================

  /** The shirt of Yusuf, brought from Egypt to Yaqub (12:93–96): a linen tunic laid flat, no person. */
  'yaqub-shirt': art(110, 100, (c) => (
    <>
      <Glow c={c} k="g" cx={55} cy={50} r={50} color={C.goldPale} opacity={c.dark ? 0.55 : 0.4} />
      <Shadow c={c} cx={55} cy={94} rx={36} ry={4} />
      <Path d="M34 12L46 8Q55 16 64 8L76 12L102 32L92 48L80 40V90H30V40L18 48L8 32Z" fill={dim(c, C.ivory, 0.25)} />
      <Path d="M64 8L76 12L102 32L92 48L80 40V90H62C70 64 70 30 64 8Z" fill={dim(c, C.sandLight, 0.25)} opacity={0.75} />
      <Path d="M46 8Q55 22 64 8" stroke={dim(c, C.goldDeep, 0.15)} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d="M55 16V40" stroke={dim(c, C.goldDeep, 0.15)} strokeWidth={1.6} strokeDasharray="2 3" />
      <Path d="M30 82H80V90H30Z" fill={dim(c, C.teal, 0.15)} />
      <Path d="M32 86H78" stroke={C.goldLight} strokeWidth={1.4} strokeDasharray="3 2" />
      <Path d="M8 32L18 48L22 45L12 29Z" fill={dim(c, C.teal, 0.15)} />
      <Path d="M102 32L92 48L88 45L98 29Z" fill={dim(c, C.teal, 0.15)} />
      <Path d="M42 50Q44 66 40 80M70 46Q67 64 71 80" stroke={dim(c, C.sandDeep, 0.2)} strokeWidth={1.3} fill="none" opacity={0.7} strokeLinecap="round" />
      <Path d={sparklePath(92, 14, 7)} fill={C.goldLight} />
      <Path d={sparklePath(16, 70, 5)} fill={C.goldLight} opacity={0.8} />
    </>
  )),

  /** Yaqub's home in Canaan: a stone house among olive trees, a warm lamp in the window. */
  'yaqub-home': art(170, 120, (c) => (
    <>
      <Shadow c={c} cx={85} cy={112} rx={80} ry={6} />
      <Path d="M0 112C40 102 120 100 170 108V120H0Z" fill={c.green(dim(c, '#9DB878'))} />
      <LeafyTree c={c} x={26} y={110} s={0.62} leaf={dim(c, C.olive)} leafDark={dim(c, C.oliveDark)} leafLight={dim(c, '#A9BE86')} fruit={dim(c, C.oliveDark)} fruitR={2.4} />
      <House x={56} y={110} w={66} h={52} color={dim(c, '#E6D6BC')} shadeColor={dim(c, '#C9B394')} window={dim(c, C.woodDark)} />
      <Rect x={60} y={50} width={58} height={8} rx={2} fill={dim(c, '#CDB89A')} />
      {c.dark ? <Glow c={c} k="w" cx={97} cy={76} r={20} color={C.goldLight} opacity={0.75} /> : null}
      <Rect x={92} y={70} width={11} height={11} rx={1.5} fill={c.dark ? C.goldLight : dim(c, C.wood)} />
      <Path d="M124 110V86H156V110Z" fill={dim(c, '#D8C5A6')} />
      <Path d="M122 86H158" stroke={dim(c, '#BCA582')} strokeWidth={3} strokeLinecap="round" />
      <LeafyTree c={c} x={148} y={112} s={0.5} leaf={dim(c, C.olive)} leafDark={dim(c, C.oliveDark)} leafLight={dim(c, '#A9BE86')} />
      <Path d="M40 112C60 106 84 106 104 112" stroke={dim(c, C.sandLight)} strokeWidth={4} fill="none" opacity={0.6} strokeLinecap="round" />
    </>
  )),

  // ================= Yusuf =================

  /** The dream of Yusuf (12:4): eleven stars, the sun and the moon bowing in an arc around a soft light. */
  'yusuf-dream': art(220, 130, (c) => {
    const stars = Array.from({ length: 11 }, (_, i) => {
      const a = Math.PI * (0.12 + (0.76 * i) / 10);
      return { x: 110 - Math.cos(a) * 82, y: 46 + Math.sin(a) * 58, r: 6 + (i % 3 === 1 ? 1.5 : 0) };
    });
    return (
      <>
        <Glow c={c} k="core" cx={110} cy={70} r={52} color={C.goldPale} opacity={0.7} />
        {stars.map((s, i) => (
          <G key={i}>
            <Circle cx={r2(s.x)} cy={r2(s.y)} r={s.r * 1.8} fill={C.goldPale} opacity={0.25} />
            <Path d={starPath(r2(s.x), r2(s.y), s.r, s.r * 0.45)} fill={C.goldLight} />
          </G>
        ))}
        <Circle cx={30} cy={34} r={20} fill={C.gold} opacity={0.3} />
        <Circle cx={30} cy={34} r={14} fill={C.gold} />
        <Circle cx={26} cy={30} r={5} fill={C.goldPale} opacity={0.7} />
        <Path d={crescentPath(190, 34, 14, 6, -4, 12)} fill={C.goldPale} />
        <Path d={sparklePath(110, 70, 10)} fill={C.white} opacity={0.85} />
      </>
    );
  }),

  /** The well in the desert (12:10–15, 19): a stone well with a beam, rope and bucket. */
  'yusuf-well': art(120, 120, (c) => (
    <>
      <Shadow c={c} cx={60} cy={112} rx={48} ry={6} />
      <Path d="M22 34V100M98 34V100" stroke={dim(c, C.woodDark)} strokeWidth={6} strokeLinecap="round" />
      <Path d="M14 32H106" stroke={dim(c, C.wood)} strokeWidth={7} strokeLinecap="round" />
      <Circle cx={60} cy={32} r={7} fill={dim(c, C.woodLight)} />
      <Circle cx={60} cy={32} r={2.4} fill={dim(c, C.woodDark)} />
      <Path d="M60 39V62" stroke={dim(c, C.sandDark)} strokeWidth={1.8} />
      <Path d="M52 62H68L66 76H54Z" fill={dim(c, C.woodLight)} />
      <Path d="M52 62H68" stroke={dim(c, C.woodDark)} strokeWidth={2} />
      <Ellipse cx={60} cy={82} rx={44} ry={11} fill={dim(c, C.stoneDark)} />
      <Ellipse cx={60} cy={83} rx={36} ry={7} fill={dim(c, '#3A3456', 0.1)} />
      <Ellipse cx={52} cy={82} rx={12} ry={2} fill={C.waterLight} opacity={0.35} />
      <Path d="M16 82V104Q16 112 26 112H94Q104 112 104 104V82Q104 93 60 93T16 82Z" fill={dim(c, C.stoneLight)} />
      <Path d="M16 82Q16 93 60 93T104 82" stroke={dim(c, C.stonePale)} strokeWidth={4} fill="none" />
      <G stroke={dim(c, C.stone)} strokeWidth={1.5} opacity={0.75}>
        <Path d="M30 96V111M48 98V112M66 98V112M84 96V111M22 102H104M40 106" />
      </G>
      <Path d="M80 92Q96 90 104 82V104Q104 112 94 112H80Z" fill={dim(c, C.stone)} opacity={0.45} />
      <Ellipse cx={14} cy={110} rx={8} ry={3.4} fill={dim(c, C.stone)} />
      <Ellipse cx={106} cy={111} rx={6} ry={2.6} fill={dim(c, C.stoneDark)} />
    </>
  )),

  /** Granaries of Egypt (12:47–49, 12:55): mud silos, sacks and sheaves of the good years. */
  'yusuf-granary': art(190, 130, (c) => (
    <>
      <Shadow c={c} cx={95} cy={124} rx={90} ry={6} />
      <Path d="M8 124V96H182V124Z" fill={dim(c, C.sandLight)} />
      <Path d="M8 96H182" stroke={dim(c, C.sandDeep)} strokeWidth={3} />
      <Silo c={c} x={44} y={100} w={46} h={76} />
      <Silo c={c} x={98} y={100} w={56} h={92} />
      <Silo c={c} x={150} y={100} w={44} h={70} />
      <Path d="M70 124V104H126V124" fill={dim(c, C.sand)} />
      <Path d={archPath(98, 104, 16, 124)} fill={dim(c, C.woodDark)} />
      <Sheaf c={c} x={22} y={124} s={0.48} />
      <Sheaf c={c} x={172} y={124} s={0.5} />
      <G>
        <Path d="M128 124C126 112 132 106 140 106S154 112 152 124Z" fill={dim(c, '#D8B98C')} />
        <Rect x={134} y={104} width={12} height={4} rx={2} fill={dim(c, C.wood)} />
        <Path d="M46 124C44 114 50 108 56 108S68 114 66 124Z" fill={dim(c, '#D8B98C')} />
        <Rect x={51} y={106} width={10} height={3.4} rx={1.7} fill={dim(c, C.wood)} />
      </G>
    </>
  )),

  /** Seven green ears (12:43, 46) – a green sheaf. */
  'yusuf-sheaf-green': art(70, 100, (c) => (
    <>
      <Shadow c={c} cx={35} cy={96} rx={20} ry={3} />
      <Sheaf c={c} x={35} y={96} s={1} />
    </>
  )),

  /** The dry ears (12:43, 46) – a pale, drooping sheaf (never scary). */
  'yusuf-sheaf-dry': art(70, 100, (c) => (
    <>
      <Shadow c={c} cx={35} cy={96} rx={20} ry={3} />
      <Sheaf c={c} x={35} y={96} s={1} dry />
    </>
  )),

  // ================= Ayyub =================

  /** The cool spring that came forth when Ayyub struck the ground with his foot (38:42): water, rocks, new green. */
  'ayyub-spring': art(160, 100, (c) => (
    <>
      <Ellipse cx={80} cy={84} rx={74} ry={14} fill={c.green(dim(c, '#8FBF6A'))} />
      <Ellipse cx={80} cy={82} rx={52} ry={10} fill={dim(c, C.water, 0.2)} />
      <Ellipse cx={74} cy={80} rx={30} ry={5} fill={dim(c, C.waterLight, 0.2)} />
      <Path d="M44 84q8-4 16 0M88 86q8-4 16 0M64 78q6-3 12 0" stroke={C.white} strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.65} />
      <Path d="M18 84C14 70 24 60 38 62S52 76 48 84Z" fill={dim(c, C.stone)} />
      <Path d="M112 84C110 66 124 58 138 62S150 78 144 86Z" fill={dim(c, C.stone)} />
      <Path d="M126 62C138 62 150 74 144 86H132C136 76 134 68 126 62Z" fill={dim(c, C.stoneDark)} opacity={0.5} />
      <Path d="M80 80C78 64 76 52 80 36C84 52 82 64 80 80Z" fill={dim(c, C.waterLight, 0.1)} />
      <Path d="M80 46C70 42 64 46 60 56M80 46C90 42 96 46 100 56" stroke={dim(c, C.waterLight, 0.1)} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Circle cx={58} cy={60} r={2.4} fill={C.waterPale} />
      <Circle cx={102} cy={60} r={2.4} fill={C.waterPale} />
      <Circle cx={80} cy={32} r={3} fill={C.waterPale} />
      <Path d={sparklePath(96, 30, 5)} fill={C.white} opacity={0.9} />
      {[[30, 86], [50, 92], [116, 92], [134, 88]].map(([x, y], i) => (
        <Path key={i} d={`M${x - 4} ${y}Q${x - 3} ${y - 8} ${x} ${y - 11}Q${x + 2} ${y - 6} ${x + 4} ${y}Z`} fill={c.green(dim(c, C.leaf))} />
      ))}
    </>
  )),

  /** A thirsty plant in the garden game (it waits for care – never dead). */
  'ayyub-plant-dry': art(70, 80, (c) => (
    <>
      <Ellipse cx={35} cy={72} rx={28} ry={7} fill={dim(c, '#B98A5E')} />
      <Path d="M35 70Q34 54 36 40" stroke={dim(c, '#9C7A4C')} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <Path d={leafPath(35, 58, 18, 5, 160)} fill={dim(c, '#C4A25E')} />
      <Path d={leafPath(36, 50, 16, 4.5, 20)} fill={dim(c, '#B99556')} />
      <Path d={leafPath(36, 42, 12, 4, 120)} fill={dim(c, '#C9AE6E')} />
      <Path d="M20 72q4-3 8 0M44 73q4-3 8 0" stroke={dim(c, '#9C7A4C')} strokeWidth={1.2} fill="none" opacity={0.7} />
    </>
  )),

  /** A young green plant (the garden game). */
  'ayyub-plant-sprout': art(70, 80, (c) => (
    <>
      <Ellipse cx={35} cy={72} rx={28} ry={7} fill={dim(c, '#8E6A48')} />
      <Path d="M35 70Q34 50 35 32" stroke={c.green(dim(c, C.leafDark))} strokeWidth={2.8} fill="none" strokeLinecap="round" />
      <Path d={leafPath(35, 56, 20, 6, 200)} fill={c.green(dim(c, C.leaf))} />
      <Path d={leafPath(35, 48, 20, 6, -20)} fill={c.green(dim(c, C.leafLight))} />
      <Path d={leafPath(35, 36, 14, 5, -110)} fill={c.green(dim(c, C.leaf))} />
      <Circle cx={22} cy={70} r={1.6} fill={C.waterLight} />
      <Circle cx={50} cy={71} r={1.4} fill={C.waterLight} />
    </>
  )),

  /** A plant in bloom (the garden game). */
  'ayyub-plant-bloom': art(70, 80, (c) => (
    <>
      <Ellipse cx={35} cy={72} rx={28} ry={7} fill={dim(c, '#8E6A48')} />
      <Path d="M35 70Q33 48 35 26" stroke={c.green(dim(c, C.leafDark))} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d={leafPath(35, 60, 22, 7, 195)} fill={c.green(dim(c, C.leaf))} />
      <Path d={leafPath(35, 52, 22, 7, -15)} fill={c.green(dim(c, C.leafLight))} />
      <Path d={leafPath(35, 42, 16, 5, 210)} fill={c.green(dim(c, C.leafDark))} />
      {[0, 72, 144, 216, 288].map((a) => {
        const rad = ((a - 90) * Math.PI) / 180;
        return <Circle key={a} cx={r2(35 + Math.cos(rad) * 7)} cy={r2(22 + Math.sin(rad) * 7)} r={5.6} fill={c.bloom(C.pink)} />;
      })}
      <Circle cx={35} cy={22} r={4.4} fill={C.gold} />
      <Path d={sparklePath(56, 18, 4)} fill={C.goldLight} />
    </>
  )),

  // ================= Shuayb =================

  /** A fair balance of the market of Madyan (7:85, 11:84–85, 26:181–182): level beam, grain and a weight. */
  'shuayb-scales': art(160, 130, (c) => (
    <>
      <Shadow c={c} cx={80} cy={124} rx={44} ry={5} />
      <Path d="M56 124Q56 110 80 110T104 124Z" fill={dim(c, C.wood)} />
      <Rect x={76} y={26} width={8} height={88} rx={3} fill={dim(c, C.woodLight)} />
      <Rect x={82} y={26} width={2} height={88} fill={dim(c, C.woodDark)} opacity={0.5} />
      <Path d="M72 22H88L80 12Z" fill={dim(c, C.gold, 0.15)} />
      <Path d="M80 18V30" stroke={dim(c, C.goldDeep, 0.15)} strokeWidth={3} strokeLinecap="round" />
      <Path d="M16 32H144" stroke={dim(c, C.goldDeep, 0.15)} strokeWidth={6} strokeLinecap="round" />
      <Circle cx={80} cy={32} r={5} fill={dim(c, C.gold, 0.15)} />
      <Path d="M20 32 8 78M20 32 32 78M140 32 128 78M140 32 152 78" stroke={dim(c, C.goldDeep, 0.15)} strokeWidth={1.5} />
      <Path d="M2 78H38Q36 92 20 92T2 78Z" fill={dim(c, C.gold, 0.15)} />
      <Path d="M122 78H158Q156 92 140 92T122 78Z" fill={dim(c, C.gold, 0.15)} />
      <Path d="M8 78C10 66 30 66 32 78Z" fill={dim(c, '#E2B865')} />
      <G fill={dim(c, '#C79A48')}>
        <Circle cx={14} cy={74} r={1.4} />
        <Circle cx={20} cy={70} r={1.4} />
        <Circle cx={26} cy={74} r={1.4} />
      </G>
      <Weight c={c} x={140} y={78} s={0.62} />
      <Ellipse cx={20} cy={78} rx={18} ry={3} fill={C.goldLight} opacity={0.6} />
      <Ellipse cx={140} cy={78} rx={18} ry={3} fill={C.goldLight} opacity={0.6} />
    </>
  )),

  /** A brass weight (the scales game). */
  'shuayb-weight': art(50, 50, (c) => (
    <>
      <Shadow c={c} cx={25} cy={46} rx={18} ry={3} />
      <Weight c={c} x={25} y={45} s={1.12} />
    </>
  )),

  /** A wooden measure filled with grain (7:85 "give full measure"). */
  'shuayb-measure': art(80, 76, (c) => (
    <>
      <Shadow c={c} cx={40} cy={72} rx={30} ry={4} />
      <Path d="M10 28C14 22 66 22 70 28" fill={dim(c, '#E2B865')} />
      <Path d="M12 30C10 18 30 12 40 12S70 18 68 30Z" fill={dim(c, '#E2B865')} />
      <G fill={dim(c, '#C79A48')}>
        <Circle cx={28} cy={20} r={1.6} />
        <Circle cx={40} cy={16} r={1.6} />
        <Circle cx={52} cy={21} r={1.6} />
        <Circle cx={34} cy={25} r={1.6} />
        <Circle cx={46} cy={25} r={1.6} />
      </G>
      <Path d="M10 28H70L64 70H16Z" fill={dim(c, C.woodLight)} />
      <Path d="M48 28H70L64 70H46Z" fill={dim(c, C.wood)} opacity={0.5} />
      <Path d="M10 28H70" stroke={dim(c, C.woodDark)} strokeWidth={4} strokeLinecap="round" />
      <Path d="M13 46H67M15 60H65" stroke={dim(c, C.woodDark)} strokeWidth={2} opacity={0.6} />
    </>
  )),

  /** The well of Madyan where Musa watered the flocks (28:23): a stone well, a trough and sheep. */
  'shuayb-madyan-well': art(200, 120, (c) => (
    <>
      <Shadow c={c} cx={100} cy={114} rx={94} ry={6} />
      <Palm c={c} x={22} y={112} h={78} lean={6} />
      <Palm c={c} x={182} y={112} h={64} lean={-8} />
      <Path d="M60 112V86Q60 80 66 80H102Q108 80 108 86V112Z" fill={dim(c, C.stoneLight)} />
      <Ellipse cx={84} cy={80} rx={24} ry={6} fill={dim(c, '#2B2140', 0.1)} />
      <Path d="M60 80Q84 88 108 80" stroke={dim(c, C.stonePale)} strokeWidth={3} fill="none" />
      <Path d="M66 92V112M84 94V112M100 92V112" stroke={dim(c, C.stone)} strokeWidth={1.4} opacity={0.7} />
      <Path d="M70 80V52M98 80V52M64 52H104" stroke={dim(c, C.woodDark)} strokeWidth={4} strokeLinecap="round" />
      <Path d="M84 52V68" stroke={dim(c, C.sandDark)} strokeWidth={1.5} />
      <Path d="M78 68H90L88 76H80Z" fill={dim(c, C.woodLight)} />
      <Path d="M112 112V98H160V112Z" fill={dim(c, C.stone)} />
      <Path d="M114 100H158V104H114Z" fill={dim(c, C.water, 0.2)} />
      {[132, 152].map((x, i) => (
        <G key={i} transform={`translate(${x} ${96}) scale(${i ? -0.9 : 0.9} 0.9)`}>
          <Ellipse cx={0} cy={0} rx={12} ry={8} fill={dim(c, C.cream, 0.15)} />
          <Circle cx={-6} cy={-4} r={5} fill={dim(c, C.cream, 0.15)} />
          <Circle cx={4} cy={-5} r={5} fill={dim(c, C.cream, 0.15)} />
          <Ellipse cx={-14} cy={4} rx={4.5} ry={3.4} fill={dim(c, '#6B5A4E')} />
          <Path d="M-6 6V14M6 6V14" stroke={dim(c, '#6B5A4E')} strokeWidth={2} />
        </G>
      ))}
    </>
  )),

  /** A market stall of Madyan with an awning, sacks and a balance. */
  'shuayb-market': art(190, 130, (c) => (
    <>
      <Shadow c={c} cx={95} cy={124} rx={88} ry={6} />
      <Path d="M20 50V124M170 50V124" stroke={dim(c, C.woodDark)} strokeWidth={5} strokeLinecap="round" />
      <Path d="M8 52L28 18H162L182 52Z" fill={dim(c, C.terracotta)} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Path key={i} d={`M${28 + i * 30.8 + 15.4} 18L${8 + i * 34.8 + 17.4} 52H${8 + i * 34.8 + 34.8}L${28 + i * 30.8 + 30.8} 18Z`} fill={dim(c, C.cream)} opacity={0.9} />
      ))}
      <Path d="M8 52H182" stroke={dim(c, C.plum)} strokeWidth={3} />
      <Rect x={14} y={92} width={162} height={32} rx={4} fill={dim(c, C.woodLight)} />
      <Rect x={14} y={92} width={162} height={6} rx={3} fill={dim(c, C.wood)} />
      <Path d="M24 92C22 76 30 70 40 70S58 76 56 92Z" fill={dim(c, '#D8B98C')} />
      <Path d="M28 74C32 68 48 68 52 74" fill={dim(c, '#E2B865')} />
      <Path d="M140 92C138 78 146 72 156 72S172 78 170 92Z" fill={dim(c, '#C9A27A')} />
      <Path d="M144 76C148 70 164 70 168 76" fill={dim(c, C.terracotta)} />
      <G transform="translate(66 34) scale(0.36)">
        <Path d="M56 156Q56 142 80 142T104 156Z" fill={dim(c, C.wood)} />
        <Rect x={76} y={30} width={8} height={116} rx={3} fill={dim(c, C.woodDark)} />
        <Path d="M16 40H144" stroke={dim(c, C.goldDeep, 0.15)} strokeWidth={7} strokeLinecap="round" />
        <Path d="M20 40 8 120M20 40 32 120M140 40 128 120M140 40 152 120" stroke={dim(c, C.goldDeep, 0.15)} strokeWidth={3} />
        <Path d="M2 120H38Q36 138 20 138T2 120Z" fill={dim(c, C.gold, 0.15)} />
        <Path d="M122 120H158Q156 138 140 138T122 120Z" fill={dim(c, C.gold, 0.15)} />
      </G>
      <Weight c={c} x={124} y={92} s={0.42} />
      <Weight c={c} x={112} y={92} s={0.32} />
    </>
  )),

  // ================= Musa =================

  /** The chest on the river (20:39, 28:7): a small wooden chest among the reeds, soft cloth inside – no person. */
  'musa-chest': art(110, 70, (c) => (
    <>
      <Path d="M4 60q9-5 18 0t18 0 18 0 18 0 18 0 18 0" stroke={dim(c, C.waterLight, 0.2)} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M22 34H88L82 56Q80 60 74 60H36Q30 60 28 56Z" fill={dim(c, C.woodLight)} />
      <Path d="M60 34H88L82 56Q80 60 74 60H60Z" fill={dim(c, C.wood)} opacity={0.45} />
      <Path d="M24 42H86M26 50H84" stroke={dim(c, C.woodDark)} strokeWidth={1.4} opacity={0.6} />
      <Rect x={18} y={30} width={74} height={7} rx={3.5} fill={dim(c, C.wood)} />
      <Path d="M30 30C36 20 74 20 80 30Z" fill={dim(c, C.cream, 0.2)} />
      <Path d="M40 26C46 22 64 22 70 26" stroke={dim(c, C.sandDeep, 0.2)} strokeWidth={1.4} fill="none" />
      <Rect x={52} y={30} width={6} height={30} rx={2} fill={dim(c, C.goldDeep, 0.2)} opacity={0.8} />
      {[[8, 60, 30], [14, 60, 22], [98, 60, 28], [104, 60, 20]].map(([x, y, h], i) => (
        <G key={i}>
          <Path d={`M${x} ${y}Q${x + (i % 2 ? 2 : -2)} ${y - h * 0.6} ${x + (i < 2 ? -3 : 3)} ${y - h}`} stroke={c.green(dim(c, C.olive))} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          <Ellipse cx={x + (i < 2 ? -3 : 3)} cy={y - h + 4} rx={2.2} ry={5} fill={dim(c, C.woodLight)} />
        </G>
      ))}
    </>
  )),

  /** The valley of Tuwa (20:9–12): a desert bush in the night with a warm, calm light – narrated, never a figure. */
  'musa-bush': art(140, 130, (c) => (
    <>
      <Glow c={c} k="halo" cx={70} cy={58} r={64} color={C.goldPale} opacity={c.dark ? 0.8 : 0.6} />
      <Shadow c={c} cx={70} cy={124} rx={46} ry={5} />
      <Path d="M70 124V92M70 104L52 88M70 98L90 80M70 112L94 100" stroke={dim(c, C.woodDark, 0.15)} strokeWidth={4} strokeLinecap="round" fill="none" />
      {[[50, 74, 22], [88, 66, 24], [70, 56, 26], [42, 92, 16], [98, 90, 18], [70, 82, 22]].map(([x, y, r], i) => (
        <Circle key={i} cx={x} cy={y} r={r} fill={c.green(dim(c, i % 2 ? C.oliveDark : C.olive, 0.15))} />
      ))}
      {[[60, 50], [82, 60], [50, 76], [90, 84], [70, 70], [66, 92], [42, 60]].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={3} fill={C.goldPale} opacity={0.9} />
      ))}
      <Path d="M70 22C62 34 62 44 70 52C78 44 78 34 70 22Z" fill={C.goldLight} opacity={0.85} />
      <Path d="M70 32C66 38 66 44 70 48C74 44 74 38 70 32Z" fill={C.white} opacity={0.8} />
      <Path d={sparklePath(104, 34, 6)} fill={C.goldPale} />
      <Path d={sparklePath(34, 40, 4.5)} fill={C.goldPale} opacity={0.8} />
    </>
  )),

  /** The staff of Musa (20:17–18): a shepherd's staff with a softly glowing grain of light. */
  'musa-staff': art(50, 160, (c) => (
    <>
      <Glow c={c} k="g" cx={25} cy={40} r={24} color={C.goldPale} opacity={c.dark ? 0.6 : 0.35} />
      <Shadow c={c} cx={25} cy={154} rx={14} ry={3} />
      <Path d="M22 154C24 120 22 80 26 40C27 30 26 22 22 14C20 10 22 6 28 8C34 10 34 20 32 30C30 44 30 96 28 154Z" fill={dim(c, C.wood, 0.15)} />
      <Path d="M28 8C34 10 34 20 32 30C30 44 30 96 28 154H25C27 100 27 50 30 30C31 22 31 14 28 8Z" fill={dim(c, C.woodDark, 0.15)} opacity={0.6} />
      <Path d="M24 60q3 2 0 4M25 96q3 2 0 4M24 128q3 2 0 4" stroke={dim(c, C.woodDark)} strokeWidth={1.4} fill="none" />
      <Path d={leafPath(30, 46, 10, 3, -30)} fill={c.green(C.leaf)} />
    </>
  )),

  /**
   * The path through the sea (26:63): the water stands on both sides "like a great mountain", a dry path between.
   * Full-width band (400 × 240), transparent sky.
   */
  'musa-sea-path': art(400, 240, (c) => (
    <>
      <Defs>
        <Lin id={c.id('wl')} stops={[[0, dim(c, C.waterLight, 0.35)], [0.5, dim(c, C.water, 0.35)], [1, dim(c, C.waterDark, 0.35)]]} x1={0} y1={0} x2={1} y2={1} />
        <Lin id={c.id('wr')} stops={[[0, dim(c, C.waterLight, 0.35)], [0.5, dim(c, C.water, 0.35)], [1, dim(c, C.waterDark, 0.35)]]} x1={1} y1={0} x2={0} y2={1} />
        <Lin id={c.id('path')} stops={[[0, dim(c, C.sandLight)], [1, dim(c, C.sandDeep)]]} />
      </Defs>
      <Path d="M0 150H400V240H0Z" fill={dim(c, C.waterDeep, 0.35)} opacity={0.5} />
      <Path d="M186 150H214L300 240H100Z" fill={c.url('path')} />
      <Path d="M196 156L200 240M206 160L232 240M190 166L170 240" stroke={dim(c, C.sandDark)} strokeWidth={1.2} opacity={0.35} />
      <Path d="M0 240V110C40 96 80 74 120 66C150 60 172 80 180 112L186 150L100 240Z" fill={c.url('wl')} />
      <Path d="M400 240V110C360 96 320 74 280 66C250 60 228 80 220 112L214 150L300 240Z" fill={c.url('wr')} />
      <Path d="M120 66C150 60 172 80 180 112L186 150L156 180C162 136 150 92 120 66Z" fill={dim(c, C.waterLight, 0.35)} opacity={0.55} />
      <Path d="M280 66C250 60 228 80 220 112L214 150L244 180C238 136 250 92 280 66Z" fill={dim(c, C.waterLight, 0.35)} opacity={0.55} />
      <G stroke={C.white} strokeWidth={2} strokeLinecap="round" fill="none" opacity={c.dark ? 0.35 : 0.55}>
        <Path d="M30 120q20-8 40-14M60 146q24-10 50-14M20 180q30-12 60-16M300 106q20 6 40 14M290 132q26 8 50 14M320 166q30 10 60 16" />
      </G>
      <Path d="M120 66C130 62 142 62 150 66M280 66C270 62 258 62 250 66" stroke={C.white} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
    </>
  )),

  /** The rock and the twelve springs (2:60, 7:160): twelve small streams flow from one rock. */
  'musa-springs': art(200, 130, (c) => {
    const streams = Array.from({ length: 12 }, (_, i) => {
      const a = Math.PI * (1.05 + (0.9 * i) / 11);
      return [100 + Math.cos(a) * 34, 86, 100 + Math.cos(a) * 94, 118] as const;
    });
    return (
      <>
        <Ellipse cx={100} cy={118} rx={98} ry={12} fill={dim(c, C.sandDeep)} />
        {streams.map(([x1, y1, x2, y2], i) => (
          <Path key={i} d={smoothOpen([[x1, y1], [r2((x1 + x2) / 2 + (i % 2 ? 4 : -4)), r2((y1 + y2) / 2)], [x2, y2]])} stroke={dim(c, i % 2 ? C.water : C.waterLight, 0.2)} strokeWidth={4} strokeLinecap="round" fill="none" />
        ))}
        {streams.map(([, , x2], i) => (
          <Ellipse key={`p${i}`} cx={r2(x2)} cy={118} rx={7} ry={3} fill={dim(c, C.waterLight, 0.2)} />
        ))}
        <Path d="M62 88C58 62 72 30 100 28S144 60 138 88Q100 98 62 88Z" fill={dim(c, C.stoneLight)} />
        <Path d="M108 29C128 34 142 60 138 88Q124 93 112 94C124 74 122 50 108 29Z" fill={dim(c, C.stone)} opacity={0.6} />
        <Path d="M70 60C78 52 90 48 100 48" stroke={dim(c, C.stonePale)} strokeWidth={3} fill="none" strokeLinecap="round" />
        <Path d={sparklePath(132, 40, 6)} fill={C.white} opacity={0.85} />
        <Path d={sparklePath(64, 46, 4)} fill={C.white} opacity={0.7} />
      </>
    );
  }),

  /** The tablets given to Musa (7:145): two stone tablets with engraved lines (no writing), a calm light. */
  'musa-tablets': art(120, 120, (c) => (
    <>
      <Glow c={c} k="g" cx={60} cy={56} r={56} color={C.goldPale} opacity={c.dark ? 0.6 : 0.45} />
      <Shadow c={c} cx={60} cy={114} rx={46} ry={5} />
      {[[16, 0], [62, 1]].map(([x, i]) => (
        <G key={i}>
          <Path d={`M${x} 112V40Q${x} 18 ${x + 21} 18T${x + 42} 40V112Z`} fill={dim(c, C.stonePale)} />
          <Path d={`M${x + 30} 20Q${x + 42} 26 ${x + 42} 40V112H${x + 34}V42Q${x + 34} 28 ${x + 30} 20Z`} fill={dim(c, C.stoneLight)} />
          {[46, 58, 70, 82, 94].map((y) => (
            <Path key={y} d={`M${x + 8} ${y}H${x + (y % 24 ? 32 : 26)}`} stroke={dim(c, C.stone)} strokeWidth={2.4} strokeLinecap="round" />
          ))}
          <Path d={`M${x + 21} 26l2 4 4 0-3 3 1 4-4-2-4 2 1-4-3-3 4 0z`} fill={C.goldDeep} opacity={0.7} />
        </G>
      ))}
    </>
  )),

  ...tribeArt,

  // ================= Harun =================

  /** Two lanterns shining together – Musa and his brother Harun helping each other (20:29–32). */
  'harun-lanterns': art(130, 120, (c) => (
    <>
      <Glow c={c} k="g" cx={65} cy={70} r={60} color={C.goldPale} opacity={c.dark ? 0.7 : 0.45} />
      <Path d="M10 12H120" stroke={dim(c, C.woodDark)} strokeWidth={5} strokeLinecap="round" />
      {[38, 92].map((x, i) => (
        <G key={i}>
          <Path d={`M${x} 12V26`} stroke={C.goldDeep} strokeWidth={1.6} />
          <Path d={domePath(x, 40, 13, 1.1)} fill={C.gold} />
          <Rect x={x - 15} y={38} width={30} height={5} rx={2} fill={C.goldDeep} />
          <Path d={`M${x - 13} 43H${x + 13}L${x + 10} 80H${x - 10}Z`} fill={C.goldPale} />
          <Path d={`M${x} 43V80M${x - 6.5} 43 ${x - 5} 80M${x + 6.5} 43 ${x + 5} 80`} stroke={C.gold} strokeWidth={1.5} />
          <Path d={`M${x} 52C${x - 4} 58 ${x - 4} 64 ${x} 70C${x + 4} 64 ${x + 4} 58 ${x} 52Z`} fill={C.orange} opacity={0.85} />
          <Path d={`M${x - 12} 80H${x + 12}L${x + 6} 90H${x - 6}Z`} fill={C.goldDeep} />
        </G>
      ))}
      <Path d="M50 66C58 60 72 60 80 66" stroke={C.goldLight} strokeWidth={2} strokeDasharray="3 3" fill="none" />
      <Path d={sparklePath(65, 100, 7)} fill={C.goldLight} />
    </>
  )),

  /** "Expand my chest" (20:25) – a flower opening in light. */
  'harun-bloom': art(70, 70, (c) => (
    <>
      <Glow c={c} k="g" cx={35} cy={32} r={30} color={C.goldPale} opacity={0.5} />
      <Path d="M35 66V40" stroke={c.green(C.leafDark)} strokeWidth={3} strokeLinecap="round" />
      <Path d={leafPath(35, 56, 16, 5, 200)} fill={c.green(C.leaf)} />
      <Path d={leafPath(35, 52, 16, 5, -20)} fill={c.green(C.leafLight)} />
      {[-60, -30, 0, 30, 60].map((a, i) => (
        <Path key={i} d={leafPath(35, 38, 18, 6.5, -90 + a)} fill={c.bloom(i % 2 ? C.pink : C.rose)} />
      ))}
      <Circle cx={35} cy={36} r={5} fill={C.gold} />
    </>
  )),

  /** "Ease my task" (20:26) – a smooth winding path with a flag at the end. */
  'harun-path': art(70, 70, (c) => (
    <>
      <Ellipse cx={35} cy={60} rx={32} ry={8} fill={c.green(dim(c, '#9DC27A'))} />
      <Path d="M10 66C26 60 16 48 34 44S58 34 50 22" stroke={dim(c, C.sandLight)} strokeWidth={9} strokeLinecap="round" fill="none" />
      <Path d="M10 66C26 60 16 48 34 44S58 34 50 22" stroke={dim(c, C.sandDeep)} strokeWidth={1.2} strokeDasharray="3 4" fill="none" />
      <Path d="M50 22V4" stroke={dim(c, C.woodDark)} strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M51 5H64L60 10 64 15H51Z" fill={C.coral} />
    </>
  )),

  /** "Untie the knot from my tongue" (20:27) – a rope knot coming loose. */
  'harun-knot': art(70, 70, (c) => (
    <>
      <Path d="M6 40C16 40 22 30 30 30S40 44 34 48 22 40 30 32 46 30 52 36 60 40 64 34" stroke={dim(c, C.sandDark)} strokeWidth={6} strokeLinecap="round" fill="none" />
      <Path d="M6 40C16 40 22 30 30 30S40 44 34 48 22 40 30 32 46 30 52 36 60 40 64 34" stroke={dim(c, C.sand)} strokeWidth={3} strokeLinecap="round" fill="none" strokeDasharray="4 3" />
      <Path d={sparklePath(56, 18, 6)} fill={C.goldLight} />
      <Path d={sparklePath(16, 22, 4)} fill={C.goldLight} opacity={0.8} />
    </>
  )),

  /** "That they understand my speech" (20:28) – a scroll and soft rings of sound. */
  'harun-voice': art(70, 70, (c) => (
    <>
      <Rect x={8} y={20} width={30} height={36} rx={4} fill={dim(c, C.cream)} />
      <Rect x={4} y={16} width={38} height={7} rx={3.5} fill={dim(c, C.woodLight)} />
      <Rect x={4} y={53} width={38} height={7} rx={3.5} fill={dim(c, C.woodLight)} />
      <Path d="M14 30H32M14 37H30M14 44H32" stroke={dim(c, C.sandDeep)} strokeWidth={2} strokeLinecap="round" />
      <Path d="M48 28Q54 38 48 48M54 22Q64 38 54 54M60 16Q74 38 60 60" stroke={C.teal} strokeWidth={2.6} strokeLinecap="round" fill="none" />
    </>
  )),

  /** "Strengthen me through him" (20:31) – two pillars holding one arch. */
  'harun-pillars': art(70, 70, (c) => (
    <>
      <Path d="M10 30Q35 4 60 30" stroke={dim(c, C.sandDeep)} strokeWidth={7} fill="none" strokeLinecap="round" />
      <Rect x={8} y={28} width={12} height={36} rx={2} fill={dim(c, C.sandLight)} />
      <Rect x={50} y={28} width={12} height={36} rx={2} fill={dim(c, C.sandLight)} />
      <Rect x={16} y={28} width={4} height={36} fill={dim(c, C.sandDeep)} opacity={0.5} />
      <Rect x={58} y={28} width={4} height={36} fill={dim(c, C.sandDeep)} opacity={0.5} />
      <Rect x={4} y={62} width={62} height={6} rx={2} fill={dim(c, C.stone)} />
      <Path d={star8Path(35, 20, 6)} fill={C.gold} />
    </>
  )),

  /** "Let him share my task" (20:32) – one boat, two oars. */
  'harun-oars': art(80, 64, (c) => (
    <>
      <Path d="M2 54q8-5 16 0t16 0 16 0 16 0 16 0" stroke={dim(c, C.water, 0.2)} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M8 36H72L64 48Q62 51 56 51H24Q18 51 16 48Z" fill={dim(c, C.woodLight)} />
      <Rect x={6} y={33} width={68} height={5} rx={2.5} fill={dim(c, C.wood)} />
      <Path d="M26 34L12 58M54 34L68 58" stroke={dim(c, C.woodDark)} strokeWidth={3} strokeLinecap="round" />
      <Ellipse cx={11} cy={59} rx={3} ry={6} fill={dim(c, C.woodDark)} transform="rotate(30 11 59)" />
      <Ellipse cx={69} cy={59} rx={3} ry={6} fill={dim(c, C.woodDark)} transform="rotate(-30 69 59)" />
    </>
  )),

  // ================= Dhul-Kifl =================

  /** A lamp burning steadily in an arched niche – patience and steadfastness (21:85–86, 38:48). */
  'dhulkifl-lamp': art(110, 130, (c) => (
    <>
      <Path d={archPath(55, 8, 92, 124)} fill={dim(c, '#3B3470', 0.1)} />
      <Path d={archPath(55, 16, 78, 124)} fill={dim(c, '#2A2552', 0.1)} />
      <Glow c={c} k="g" cx={55} cy={74} r={40} color={C.goldPale} opacity={0.75} />
      <Path d={archPath(55, 8, 92, 124)} fill="none" stroke={C.gold} strokeWidth={3} />
      <Path d="M30 118H80V124H30Z" fill={C.goldDeep} />
      <Path d="M48 118L52 104H58L62 118Z" fill={C.gold} />
      <Path d="M32 100C34 92 76 92 78 100C78 106 32 106 32 100Z" fill={C.gold} />
      <Path d="M78 98C86 96 90 92 90 88" stroke={C.gold} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M32 100C42 96 50 96 54 100" stroke={C.goldPale} strokeWidth={2} fill="none" opacity={0.8} />
      <Path d="M90 88C84 78 86 68 92 60C98 68 98 80 90 88Z" fill={C.orange} />
      <Path d="M91 84C88 78 89 72 92 68C95 72 95 80 91 84Z" fill={C.goldPale} />
      <Path d={star8Path(55, 36, 8)} fill={C.gold} opacity={0.85} />
    </>
  )),

  /** An unlit lamp (the lantern game, before it is lit). */
  'dhulkifl-lamp-unlit': art(70, 60, (c) => (
    <>
      <Shadow c={c} cx={35} cy={56} rx={24} ry={3} />
      <Path d="M24 54L28 42H42L46 54Z" fill={dim(c, C.goldDeep, 0.25)} />
      <Path d="M8 40C10 30 60 30 62 40C62 46 8 46 8 40Z" fill={dim(c, C.goldDeep, 0.25)} />
      <Path d="M62 38C68 36 70 32 70 28" stroke={dim(c, C.goldDeep, 0.25)} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Circle cx={70} cy={27} r={1.6} fill={dim(c, C.woodDark)} />
    </>
  )),

  /** A lit lamp (the lantern game). */
  'dhulkifl-lamp-lit': art(70, 60, (c) => (
    <>
      <Glow c={c} k="g" cx={56} cy={20} r={20} color={C.goldPale} opacity={0.85} />
      <Shadow c={c} cx={35} cy={56} rx={24} ry={3} />
      <Path d="M24 54L28 42H42L46 54Z" fill={C.goldDeep} />
      <Path d="M8 40C10 30 60 30 62 40C62 46 8 46 8 40Z" fill={C.gold} />
      <Path d="M10 38C20 34 30 34 34 38" stroke={C.goldPale} strokeWidth={2} fill="none" opacity={0.8} />
      <Path d="M62 38C68 36 70 32 70 28" stroke={C.gold} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M68 28C62 20 64 10 68 4C73 10 74 20 68 28Z" fill={C.orange} />
      <Path d="M68 25C66 20 66 14 68 10C70 14 71 20 68 25Z" fill={C.goldPale} />
    </>
  )),

  // ================= Dawud =================

  /** A coat of mail made of linked rings (21:80, 34:10–11) – a garment only, no person. */
  'dawud-armour': art(130, 140, (c) => {
    const rings: [number, number][] = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const x = 21 + col * 11 + (row % 2 ? 5.5 : 0);
        const y = 38 + row * 10;
        rings.push([x, y]);
      }
    }
    return (
      <>
        <Shadow c={c} cx={65} cy={134} rx={44} ry={5} />
        <Defs>
          <Lin id={c.id('m')} stops={[[0, dim(c, '#A8B3C2', 0.15)], [1, dim(c, '#6F7B8E', 0.15)]]} />
        </Defs>
        <Path d="M42 14L54 10Q65 18 76 10L88 14L120 36L110 58L96 48V128H34V48L20 58L10 36Z" fill={c.url('m')} />
        <G>
          {rings
            .filter(([x, y]) => y < 126 && x > 30 && x < 100)
            .map(([x, y], i) => (
              <Circle key={i} cx={x} cy={y} r={5} fill="none" stroke={dim(c, '#525D70', 0.1)} strokeWidth={1.6} opacity={0.75} />
            ))}
        </G>
        {[[18, 42], [24, 50], [104, 42], [110, 50], [28, 36], [100, 36]].map(([x, y], i) => (
          <Circle key={`s${i}`} cx={x} cy={y} r={4.5} fill="none" stroke={dim(c, '#525D70', 0.1)} strokeWidth={1.5} opacity={0.75} />
        ))}
        <Path d="M54 10Q65 24 76 10" stroke={C.goldDeep} strokeWidth={4} fill="none" strokeLinecap="round" />
        <Path d="M34 122H96V128H34Z" fill={C.goldDeep} />
        <Path d="M40 30Q42 80 38 120" stroke={C.white} strokeWidth={3} opacity={0.25} strokeLinecap="round" fill="none" />
      </>
    );
  }),

  /** One iron ring of the armour (the ring game). */
  'dawud-ring': art(60, 60, (c) => <IronRing c={c} x={30} y={30} R={26} />),

  /** A short chain of linked rings ("measure the links", 34:11). */
  'dawud-chain': art(160, 50, (c) => (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <IronRing key={i} c={c} x={24 + i * 28} y={25} R={17} tone={i % 2 ? '#7F8A9C' : '#8C97A8'} />
      ))}
    </>
  )),

  /** Iron made soft for Dawud (34:10): glowing iron rings on an anvil – calm, no tools in use. */
  'dawud-iron': art(130, 90, (c) => (
    <>
      <Glow c={c} k="g" cx={65} cy={34} r={40} color={C.orange} opacity={0.35} />
      <Shadow c={c} cx={65} cy={86} rx={44} ry={4} />
      <Path d="M30 52H100Q108 52 108 46V40H22V46Q22 52 30 52Z" fill={dim(c, '#5E6878', 0.1)} />
      <Path d="M22 40H112Q120 40 124 34H18Q16 38 22 40Z" fill={dim(c, '#7A8597', 0.1)} />
      <Path d="M48 52H82L88 76H42Z" fill={dim(c, '#4E5868', 0.1)} />
      <Rect x={34} y={76} width={62} height={10} rx={3} fill={dim(c, '#5E6878', 0.1)} />
      <IronRing c={c} x={50} y={24} R={12} tone="#E58F4A" />
      <IronRing c={c} x={68} y={22} R={12} tone="#F2A65A" />
      <IronRing c={c} x={86} y={24} R={12} tone="#E58F4A" />
      <Path d={sparklePath(102, 12, 5)} fill={C.goldLight} />
    </>
  )),

  /** The Zabur given to Dawud (4:163, 17:55): an open scroll on a stand, lines only, a calm light. */
  'dawud-zabur': art(140, 100, (c) => (
    <>
      <Glow c={c} k="g" cx={70} cy={40} r={50} color={C.goldPale} opacity={c.dark ? 0.6 : 0.4} />
      <Shadow c={c} cx={70} cy={96} rx={40} ry={4} />
      <Path d="M50 96L70 62L90 96" stroke={dim(c, C.woodDark)} strokeWidth={5} strokeLinecap="round" fill="none" />
      <Path d="M20 26Q70 16 120 26V62Q70 52 20 62Z" fill={dim(c, C.cream)} />
      <Path d="M70 21V57" stroke={dim(c, C.sandDeep)} strokeWidth={1.4} />
      {[32, 40, 48].map((y) => (
        <G key={y}>
          <Path d={`M30 ${y}Q46 ${y - 2.5} 62 ${y - 1}`} stroke={dim(c, C.sandDark)} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d={`M78 ${y - 1}Q94 ${y - 2.5} 110 ${y}`} stroke={dim(c, C.sandDark)} strokeWidth={1.8} strokeLinecap="round" fill="none" />
        </G>
      ))}
      <Rect x={12} y={22} width={10} height={44} rx={5} fill={dim(c, C.woodLight)} />
      <Rect x={118} y={22} width={10} height={44} rx={5} fill={dim(c, C.woodLight)} />
      <Circle cx={17} cy={20} r={4} fill={C.gold} />
      <Circle cx={123} cy={20} r={4} fill={C.gold} />
      <Circle cx={17} cy={68} r={4} fill={C.gold} />
      <Circle cx={123} cy={68} r={4} fill={C.gold} />
    </>
  )),

  /** Mountains and birds glorifying Allah with Dawud (34:10, 38:18–19): peaks and a ring of birds. */
  'dawud-mountains-birds': art(200, 120, (c) => {
    const bird = (x: number, y: number, s: number, k: number) => (
      <Path key={k} d={`M${x - 8 * s} ${y}Q${x - 4 * s} ${y - 5 * s} ${x} ${y}Q${x + 4 * s} ${y - 5 * s} ${x + 8 * s} ${y}`} stroke={c.dark ? C.goldPale : C.night} strokeWidth={2 * s} strokeLinecap="round" fill="none" opacity={0.85} />
    );
    return (
      <>
        <Path d="M0 120L40 64L64 84L100 30L140 82L162 66L200 120Z" fill={dim(c, '#A9816A')} />
        <Path d="M100 30L118 54L108 60L124 70L140 82L120 84L106 66L96 62Z" fill={dim(c, '#8C6652')} opacity={0.75} />
        <Path d="M92 40L100 30L108 40L104 44L100 40L96 44Z" fill={dim(c, C.cream)} opacity={0.8} />
        <Path d="M0 120C60 104 140 104 200 120Z" fill={dim(c, '#C49866')} />
        {[[60, 30, 1], [76, 18, 0.9], [124, 18, 0.9], [140, 30, 1], [44, 46, 0.8], [156, 46, 0.8], [100, 10, 0.8]].map(([x, y, s], i) => bird(x, y, s, i))}
        <Path d={sparklePath(100, 22, 5)} fill={C.goldLight} opacity={0.85} />
      </>
    );
  }),
} satisfies Record<string, ArtDef>;
