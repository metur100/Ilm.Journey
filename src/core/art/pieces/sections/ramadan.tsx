import { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { archPath, art, type ArtDef, crescentPath, type Ctx, domePath, Glow, Lin, Shadow, smoothOpen, sparklePath, star8Path, starPath } from '../../kit';
import { C, mix, shade } from '../../palette';

/*
 * Section art (see docs/GAMES-V3.md). Owned by the ramadan section – add pieces here only.
 * Warm Ramadan nights: lanterns, the crescent, dates and water, the iftar table, the masjid at night and stars.
 * No people – objects, architecture and skies only.
 */

const NIGHT: [number, string][] = [
  [0, '#0B0D24'],
  [0.6, '#1E2358'],
  [1, '#3A3480'],
];

const STARS: [number, number, number][] = [
  [18, 14, 1.2], [44, 30, 0.9], [70, 10, 1.4], [96, 26, 1], [128, 12, 1.2], [152, 34, 0.9], [176, 18, 1.3], [190, 44, 0.8],
  [30, 52, 0.8], [112, 46, 0.8], [60, 64, 0.7], [164, 60, 0.7],
];

function Stars({ sx = 1, sy = 1, opacity = 0.85 }: { sx?: number; sy?: number; opacity?: number }) {
  return (
    <G>
      {STARS.map(([x, y, r], i) => (
        <Circle key={i} cx={x * sx} cy={y * sy} r={r * Math.min(sx, sy) ** 0.5} fill={C.white} opacity={opacity * (i % 3 === 0 ? 1 : 0.65)} />
      ))}
    </G>
  );
}

/** Masjid silhouette: a big dome, two minarets and small domes, with warm lit windows. Base on y = base. */
function MasjidSilhouette({ x, base, s = 1, color = '#1A1E47', windows = C.goldLight, glow = true }: { x: number; base: number; s?: number; color?: string; windows?: string; glow?: boolean }) {
  const X = (n: number) => x + n * s;
  const Y = (n: number) => base - n * s;
  return (
    <G>
      {/* minarets */}
      <Rect x={X(-62)} y={Y(92)} width={8 * s} height={92 * s} fill={color} />
      <Path d={`M${X(-64)} ${Y(92)}H${X(-52)}L${X(-58)} ${Y(108)}Z`} fill={color} />
      <Rect x={X(-65)} y={Y(70)} width={14 * s} height={4 * s} rx={1.5 * s} fill={color} />
      <Rect x={X(54)} y={Y(92)} width={8 * s} height={92 * s} fill={color} />
      <Path d={`M${X(52)} ${Y(92)}H${X(64)}L${X(58)} ${Y(108)}Z`} fill={color} />
      <Rect x={X(51)} y={Y(70)} width={14 * s} height={4 * s} rx={1.5 * s} fill={color} />
      {/* body and domes */}
      <Rect x={X(-46)} y={Y(40)} width={92 * s} height={40 * s} fill={color} />
      <Path d={domePath(X(0), Y(40), 30 * s, 1.35)} fill={color} />
      <Path d={domePath(X(-32), Y(40), 11 * s, 1.2)} fill={color} />
      <Path d={domePath(X(32), Y(40), 11 * s, 1.2)} fill={color} />
      <Path d={crescentPath(X(0), Y(87), 4 * s, 2 * s, -1.4 * s, 3.4 * s)} fill={C.gold} />
      {/* windows */}
      {glow
        ? [-30, -15, 0, 15, 30].map((wx) => <Path key={wx} d={archPath(X(wx), Y(30), 7 * s, Y(12))} fill={windows} opacity={wx === 0 ? 1 : 0.85} />)
        : null}
      {glow ? <Rect x={X(-60)} y={Y(60)} width={4 * s} height={7 * s} rx={2 * s} fill={windows} opacity={0.8} /> : null}
      {glow ? <Rect x={X(56)} y={Y(60)} width={4 * s} height={7 * s} rx={2 * s} fill={windows} opacity={0.8} /> : null}
    </G>
  );
}

/** A hanging lantern (Ramadan fanous); `lit` adds the glow and the warm glass. */
function Lantern({ c, k, x, y, s = 1, lit = true }: { c: Ctx; k: string; x: number; y: number; s?: number; lit?: boolean }) {
  const X = (n: number) => x + n * s;
  const Y = (n: number) => y + n * s;
  const metal = lit ? C.goldDeep : '#7D6E5E';
  const cap = lit ? C.gold : '#9C8B78';
  return (
    <G>
      {lit ? <Glow c={c} k={k} cx={X(0)} cy={Y(30)} r={30 * s} color={C.goldPale} opacity={c.dark ? 0.8 : 0.6} /> : null}
      <Path d={`M${X(0)} ${Y(-6)}V${Y(4)}`} stroke={metal} strokeWidth={1.6 * s} />
      <Path d={domePath(X(0), Y(12), 10 * s, 1)} fill={cap} />
      <Rect x={X(-12)} y={Y(11)} width={24 * s} height={4 * s} rx={1.5 * s} fill={metal} />
      <Path d={`M${X(-11)} ${Y(15)}H${X(11)}L${X(15)} ${Y(30)}L${X(11)} ${Y(46)}H${X(-11)}L${X(-15)} ${Y(30)}Z`} fill={metal} />
      <Path d={`M${X(-8)} ${Y(18)}H${X(-1)}V${Y(43)}H${X(-8)}L${X(-11.5)} ${Y(30)}Z`} fill={lit ? C.berry : '#4A4366'} opacity={0.92} />
      <Path d={`M${X(1)} ${Y(18)}H${X(8)}L${X(11.5)} ${Y(30)}L${X(8)} ${Y(43)}H${X(1)}Z`} fill={lit ? C.tealLight : '#3B3F6E'} opacity={0.92} />
      {lit ? <Path d={`M${X(0)} ${Y(24)}C${X(-4)} ${Y(30)} ${X(-3)} ${Y(36)} ${X(0)} ${Y(39)} ${X(3)} ${Y(36)} ${X(4)} ${Y(30)} ${X(0)} ${Y(24)}Z`} fill={C.goldPale} /> : null}
      <Path d={`M${X(-11)} ${Y(46)}H${X(11)}L${X(6)} ${Y(53)}H${X(-6)}Z`} fill={cap} />
      <Path d={`M${X(-2)} ${Y(53)}H${X(2)}L${X(0)} ${Y(59)}Z`} fill={metal} />
    </G>
  );
}

function DatePile({ x, y, s = 1, fresh = false }: { x: number; y: number; s?: number; fresh?: boolean }) {
  const cols = fresh ? ['#E0A030', '#C97A22', '#E8B040'] : ['#7A3B1F', '#8A4520', '#6B321A'];
  const pts: [number, number, number][] = [[-14, 2, -30], [0, -2, -10], [14, 1, 25], [-7, -9, 40], [8, -10, -50], [0, 6, 80]];
  return (
    <G>
      {pts.map(([dx, dy, a], i) => (
        <G key={i} transform={`rotate(${a} ${x + dx * s} ${y + dy * s})`}>
          <Ellipse cx={x + dx * s} cy={y + dy * s} rx={8 * s} ry={5 * s} fill={cols[i % 3]} />
          <Ellipse cx={x + dx * s - 2.4 * s} cy={y + dy * s - 2 * s} rx={3 * s} ry={1.3 * s} fill={C.white} opacity={0.35} />
        </G>
      ))}
    </G>
  );
}

function Glass({ x, y, s = 1, liquid = C.waterLight }: { x: number; y: number; s?: number; liquid?: string }) {
  return (
    <G>
      <Path d={`M${x - 9 * s} ${y - 24 * s}H${x + 9 * s}L${x + 7 * s} ${y}H${x - 7 * s}Z`} fill={C.skyPale} opacity={0.75} />
      <Path d={`M${x - 8 * s} ${y - 15 * s}H${x + 8 * s}L${x + 7 * s} ${y}H${x - 7 * s}Z`} fill={liquid} />
      <Path d={`M${x - 6 * s} ${y - 21 * s}V${y - 4 * s}`} stroke={C.white} strokeWidth={1.4 * s} opacity={0.6} strokeLinecap="round" />
    </G>
  );
}

const scene = art;

export const ramadan = {
  /** Dusk over the hills with the first thin crescent – the new month. */
  'crescent-dusk': scene(200, 150, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={[[0, '#1B1F4B'], [0.5, '#4B3F8F'], [0.82, '#C77F8E'], [1, '#F2A07B']]} />
      </Defs>
      <Rect width={200} height={150} fill={c.url('sky')} />
      <Stars sy={0.9} opacity={0.75} />
      <Glow c={c} k="m" cx={132} cy={52} r={34} color={C.goldPale} opacity={0.35} />
      <Path d={crescentPath(132, 52, 18, 9, -6, 16)} fill={C.goldLight} />
      <Path d="M0 118Q40 96 86 112T200 104V150H0Z" fill="#3A3566" />
      <Path d="M0 132Q60 112 120 128T200 124V150H0Z" fill="#2A2750" />
      <MasjidSilhouette x={46} base={132} s={0.32} color="#221F45" />
      <Path d={sparklePath(170, 24, 4)} fill={C.goldPale} />
    </>
  )),

  /** The day as an arc: the moon at night, the sun over the masjid – from suhoor to iftar. */
  'sky-arc': scene(200, 150, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} x1={0} y1={0} x2={1} y2={0} stops={[[0, '#14173A'], [0.3, '#F2A07B'], [0.5, '#8FCBEA'], [0.72, '#F28C5B'], [1, '#14173A']]} />
      </Defs>
      <Rect width={200} height={150} fill={c.url('sky')} />
      <Path d="M18 120A82 82 0 0 1 182 120" stroke={C.white} strokeWidth={2.4} strokeDasharray="3 7" strokeLinecap="round" fill="none" opacity={0.8} />
      <Circle cx={26} cy={30} r={1.2} fill={C.white} />
      <Circle cx={14} cy={56} r={1} fill={C.white} />
      <Circle cx={186} cy={34} r={1.2} fill={C.white} />
      <Path d={crescentPath(26, 92, 10, 5, -3, 8.6)} fill={C.goldLight} />
      <Glow c={c} k="sun" cx={100} cy={40} r={30} color={C.goldPale} opacity={0.8} />
      <Circle cx={100} cy={40} r={13} fill={C.gold} />
      <Circle cx={96} cy={36} r={5} fill={C.goldPale} opacity={0.7} />
      <Path d={star8Path(176, 92, 6)} fill={C.goldPale} opacity={0.9} />
      <Path d="M0 124H200V150H0Z" fill="#2C2A5A" />
      <MasjidSilhouette x={100} base={128} s={0.42} color="#25224E" />
    </>
  )),

  /** Masjid skyline band with lit windows on a transparent sky (for the sky dial). */
  'mosque-skyline': scene(400, 120, (c) => (
    <>
      <Path d="M0 96Q60 84 130 92T260 88 400 92V120H0Z" fill={c.dark ? '#141738' : '#1A1E47'} opacity={0.92} />
      <MasjidSilhouette x={200} base={104} s={0.78} color={c.dark ? '#141738' : '#1A1E47'} />
      <Path d={domePath(70, 100, 16, 1.2)} fill="#1A1E47" />
      <Rect x={54} y={100} width={32} height={20} fill="#1A1E47" />
      <Path d={domePath(330, 100, 14, 1.2)} fill="#1A1E47" />
      <Rect x={316} y={100} width={28} height={20} fill="#1A1E47" />
      <Rect x={20} y={106} width={360} height={14} fill="#16193D" />
    </>
  )),

  /** The masjid at night with lanterns – the night prayer (teravija). */
  'night-mosque': scene(200, 150, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={NIGHT} />
      </Defs>
      <Rect width={200} height={150} fill={c.url('sky')} />
      <Stars />
      <Path d={crescentPath(168, 26, 11, 5, -4, 9.6)} fill={C.goldLight} />
      <Glow c={c} k="w" cx={100} cy={108} r={64} color={C.gold} opacity={0.32} />
      <Path d="M0 132Q100 120 200 132V150H0Z" fill="#141738" />
      <MasjidSilhouette x={100} base={134} s={0.82} color="#262A62" windows={C.goldLight} />
      <Lantern c={c} k="l1" x={26} y={12} s={0.62} />
      <Lantern c={c} k="l2" x={176} y={58} s={0.5} />
    </>
  )),

  /** Laylat al-Qadr: a calm, radiant night full of stars and light from above, peace until dawn. */
  'qadr-sky': scene(200, 150, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={[[0, '#0B0D24'], [0.55, '#232861'], [1, '#4B3F8F']]} />
      </Defs>
      <Rect width={200} height={150} fill={c.url('sky')} />
      <Glow c={c} k="top" cx={100} cy={0} r={110} color={C.goldPale} opacity={0.45} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI * (0.18 + (i / 8) * 0.64);
        return <Path key={i} d={`M100 -6L${100 + Math.cos(a) * 170} ${Math.sin(a) * 170}L${100 + Math.cos(a + 0.05) * 170} ${Math.sin(a + 0.05) * 170}Z`} fill={C.goldPale} opacity={0.12} />;
      })}
      <Stars opacity={1} />
      {[[40, 40, 5], [150, 30, 6], [124, 64, 4], [70, 70, 4]].map(([x, y, r], i) => (
        <Path key={i} d={sparklePath(x, y, r)} fill={C.goldPale} />
      ))}
      <Path d={star8Path(100, 46, 9)} fill={C.goldLight} />
      <Path d={star8Path(100, 46, 5)} fill={C.white} opacity={0.8} />
      <Path d="M0 130Q100 116 200 130V150H0Z" fill="#141738" />
      <MasjidSilhouette x={100} base={134} s={0.5} color="#20245A" />
    </>
  )),

  /** An unlit lantern (dark glass) – waiting to be lit. */
  'lantern-unlit': art(70, 110, (c) => <Lantern c={c} k="u" x={35} y={22} s={1.45} lit={false} />),

  /** A lit lantern for the 30-lantern path. */
  'lantern-lit': art(70, 110, (c) => <Lantern c={c} k="l" x={35} y={22} s={1.45} />),

  /** Night hills with a winding path towards the masjid (background of the lantern path). */
  'lantern-night': scene(400, 300, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={NIGHT} />
        <Lin id={c.id('h1')} stops={[[0, '#2A2D66'], [1, '#1A1E47']]} />
      </Defs>
      <Rect width={400} height={300} fill={c.url('sky')} />
      <Stars sx={2} sy={1.6} />
      <Glow c={c} k="m" cx={336} cy={44} r={40} color={C.goldPale} opacity={0.3} />
      <Path d={crescentPath(336, 44, 20, 10, -7, 17)} fill={C.goldLight} />
      <Path d="M0 120Q90 96 190 112T400 100V300H0Z" fill="#232861" />
      <MasjidSilhouette x={300} base={112} s={0.48} color="#1E2250" />
      <Path d="M0 170Q120 140 240 160T400 150V300H0Z" fill={c.url('h1')} />
      <Path d="M0 236Q150 212 280 230T400 222V300H0Z" fill="#161A40" />
      <Path d={smoothOpen([[30, 290], [120, 250], [260, 236], [330, 200], [250, 170], [150, 150], [240, 126], [300, 114]])} stroke="#3B3F7A" strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.55} />
    </>
  )),

  /** The empty iftar table by the window at sunset – the masjid and the crescent outside. */
  'iftar-table': scene(400, 300, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={[[0, '#4B2C6B'], [0.55, '#B7577A'], [0.9, '#F28C5B'], [1, '#FBC07A']]} />
        <Lin id={c.id('wall')} stops={[[0, c.dark ? '#3A2E4E' : '#F3DDB3'], [1, c.dark ? '#2A2340' : '#E9C38A']]} />
        <Lin id={c.id('cloth')} stops={[[0, '#F7EEDB'], [1, '#E7D3AE']]} />
      </Defs>
      <Rect width={400} height={300} fill={c.url('wall')} />
      {/* window */}
      <Path d={archPath(200, 18, 220, 168)} fill={C.woodDark} />
      <Path d={archPath(200, 26, 204, 162)} fill={c.url('sky')} />
      <Glow c={c} k="sun" cx={200} cy={164} r={70} color="#FFC07A" opacity={0.6} />
      <Path d={crescentPath(262, 62, 11, 5, -4, 9.4)} fill={C.goldPale} />
      <Circle cx={150} cy={58} r={1.2} fill={C.white} />
      <Circle cx={240} cy={44} r={1} fill={C.white} />
      <MasjidSilhouette x={196} base={162} s={0.58} color="#43294A" windows={C.goldLight} />
      <Path d="M200 26V162M98 100H302" stroke={C.woodDark} strokeWidth={3} opacity={0.6} />
      {/* hanging lanterns */}
      <Lantern c={c} k="la" x={56} y={0} s={0.9} />
      <Lantern c={c} k="lb" x={344} y={0} s={0.9} />
      {/* table */}
      <Path d="M10 196H390L398 236H2Z" fill={c.url('cloth')} />
      <Path d="M2 236H398V250H2Z" fill="#D9C08F" />
      <Path d="M10 196H390" stroke="#C9A86A" strokeWidth={2} />
      {Array.from({ length: 13 }, (_, i) => (
        <Path key={i} d={star8Path(22 + i * 30, 243, 4)} fill={C.teal} opacity={0.55} />
      ))}
      <Rect x={20} y={250} width={14} height={50} fill={C.woodDark} />
      <Rect x={366} y={250} width={14} height={50} fill={C.woodDark} />
      <Rect x={0} y={286} width={400} height={14} fill={c.dark ? '#1E1830' : '#C9A27A'} opacity={0.6} />
    </>
  )),

  /** Cover: the iftar table set with dates, water and soup at sunset. */
  'iftar-feast': scene(200, 150, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={[[0, '#4B2C6B'], [0.6, '#B7577A'], [1, '#FBC07A']]} />
      </Defs>
      <Rect width={200} height={150} fill={c.url('sky')} />
      <Path d={crescentPath(154, 30, 10, 5, -3.6, 8.6)} fill={C.goldPale} />
      <MasjidSilhouette x={100} base={96} s={0.42} color="#43294A" />
      <Path d="M0 92H200V150H0Z" fill="#F3E3C2" />
      <Path d="M0 92H200" stroke="#C9A86A" strokeWidth={2} />
      <Ellipse cx={58} cy={118} rx={34} ry={11} fill={C.goldLight} />
      <Ellipse cx={58} cy={116} rx={30} ry={9} fill={C.goldPale} />
      <DatePile x={58} y={112} s={0.9} />
      <Glass x={110} y={126} s={1.1} />
      <Ellipse cx={156} cy={124} rx={24} ry={8} fill={C.tealMid} />
      <Path d="M132 116Q134 134 156 134T180 116Z" fill={C.teal} />
      <Ellipse cx={156} cy={116} rx={24} ry={6} fill={C.orange} />
      <Path d="M150 104Q146 98 150 92M160 104Q156 98 160 92" stroke={C.white} strokeWidth={1.6} fill="none" opacity={0.6} strokeLinecap="round" />
    </>
  )),

  /** Fresh (golden) dates in a small dish. */
  'fresh-dates': art(100, 80, (c) => (
    <>
      <Shadow c={c} cx={50} cy={72} rx={42} ry={5} />
      <Ellipse cx={50} cy={58} rx={42} ry={14} fill={C.tealMid} />
      <Ellipse cx={50} cy={56} rx={42} ry={14} fill={C.tealLight} />
      <Ellipse cx={50} cy={56} rx={33} ry={10} fill={C.tealPale} />
      <Path d="M50 18C46 30 40 36 30 42M50 18C54 30 60 36 72 40M50 18V40" stroke={C.wood} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <DatePile x={50} y={48} s={1.05} fresh />
    </>
  )),

  /** Morning courtyard on Eid: an arch opening onto the masjid, a low table and a shelf (TapScene backdrop). */
  'eid-morning': scene(400, 300, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={[[0, '#6FB3E0'], [0.7, '#BFE3F0'], [1, '#FCE3B8']]} />
        <Lin id={c.id('wall')} stops={[[0, c.dark ? '#4A3C5E' : '#FBF5EA'], [1, c.dark ? '#33294A' : '#F3DDB3']]} />
      </Defs>
      <Rect width={400} height={300} fill={c.url('wall')} />
      <Path d={archPath(250, 24, 170, 210)} fill={C.sandDark} />
      <Path d={archPath(250, 32, 154, 210)} fill={c.url('sky')} />
      <Glow c={c} k="sun" cx={300} cy={80} r={46} color={C.goldPale} opacity={0.8} />
      <MasjidSilhouette x={250} base={196} s={0.62} color="#E9DCC6" windows={C.gold} glow={false} />
      <Path d={domePath(250, 165, 18.6, 1.35)} fill={C.domeGreen} />
      <Path d="M173 196H327V210H173Z" fill="#A6D38D" />
      {/* bunting */}
      <Path d="M0 18Q100 46 200 18" stroke={C.wood} strokeWidth={1.4} fill="none" />
      {[20, 50, 80, 110, 140, 170].map((x, i) => (
        <Path key={x} d={`M${x - 8} ${18 + Math.sin((x / 200) * Math.PI) * 26}L${x + 8} ${18 + Math.sin((x / 200) * Math.PI) * 26}L${x} ${32 + Math.sin((x / 200) * Math.PI) * 26}Z`} fill={[C.gold, C.tealLight, C.berry][i % 3]} />
      ))}
      {/* shelf */}
      <Rect x={20} y={120} width={130} height={8} rx={3} fill={C.wood} />
      <Path d={archPath(84, 54, 44, 118)} fill={c.dark ? '#2A2340' : '#EADBBE'} />
      {/* floor, carpet and low table */}
      <Rect x={0} y={210} width={400} height={90} fill={c.dark ? '#2A2238' : '#E9C38A'} />
      <Path d="M30 236H370L390 296H10Z" fill={C.berry} opacity={0.85} />
      <Path d="M46 244H354L368 288H32Z" fill="none" stroke={C.goldLight} strokeWidth={3} strokeDasharray="10 6" />
      <Ellipse cx={170} cy={248} rx={92} ry={14} fill={C.woodDark} />
      <Ellipse cx={170} cy={244} rx={92} ry={14} fill={C.woodLight} />
    </>
  )),

  /** Nice clothes for Eid, folded, with a hanger. */
  'eid-clothes': art(100, 100, (c) => (
    <>
      <Shadow c={c} cx={50} cy={94} rx={40} />
      <Path d="M50 8C44 8 44 16 50 18" stroke={C.greyDark} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      <Path d="M50 18L16 34H84Z" stroke={C.greyDark} strokeWidth={2.4} fill="none" strokeLinejoin="round" />
      <Path d="M20 34Q30 30 40 34L50 44 60 34Q70 30 80 34L88 56 76 60V92H24V60L12 56Z" fill={C.tealMid} />
      <Path d="M40 34 50 44 60 34" stroke={C.goldLight} strokeWidth={2.4} fill="none" />
      <Path d="M50 44V92" stroke={C.teal} strokeWidth={2} />
      {[54, 66, 78].map((y) => (
        <Circle key={y} cx={50} cy={y} r={1.8} fill={C.goldLight} />
      ))}
      <Path d="M24 84H76" stroke={C.goldLight} strokeWidth={2.4} />
      <Path d={star8Path(36, 66, 5)} fill={C.goldLight} opacity={0.6} />
    </>
  )),

  /** A cloth sack of food tied with a crescent tag – zakat al-fitr / sadaqa. */
  'charity-bag': art(100, 100, (c) => (
    <>
      <Shadow c={c} cx={50} cy={94} rx={38} />
      <Path d="M32 30C18 40 12 60 14 78 16 90 28 94 50 94S84 90 86 78C88 60 82 40 68 30Z" fill="#E7CFA4" />
      <Path d="M62 32C74 42 82 60 80 78 78 88 70 92 58 94 70 80 72 54 62 32Z" fill="#D2B482" />
      <Path d="M34 30C38 34 62 34 66 30L64 22C58 26 42 26 36 22Z" fill="#D2B482" />
      <DatePile x={50} y={20} s={0.62} />
      <Rect x={33} y={28} width={34} height={5} rx={2.5} fill={C.berry} />
      <Path d="M66 31Q76 40 74 50" stroke={C.berry} strokeWidth={1.6} fill="none" />
      <Circle cx={74} cy={56} r={8} fill={C.gold} />
      <Path d={crescentPath(74, 56, 5, 2.4, -1.6, 4.2)} fill={C.white} />
      <Path d={star8Path(46, 66, 9)} fill="#C8A874" opacity={0.6} />
    </>
  )),

  /** A suitcase – the traveller. */
  suitcase: art(100, 90, (c) => (
    <>
      <Shadow c={c} cx={50} cy={86} rx={40} />
      <Path d="M38 22V14Q38 10 42 10H58Q62 10 62 14V22" stroke={C.woodDark} strokeWidth={4} fill="none" />
      <Rect x={12} y={22} width={76} height={60} rx={9} fill={C.terracotta} />
      <Rect x={60} y={22} width={28} height={60} rx={9} fill={shade(C.terracotta, 0.2)} opacity={0.5} />
      <Rect x={28} y={22} width={6} height={60} fill={C.woodDark} opacity={0.5} />
      <Rect x={66} y={22} width={6} height={60} fill={C.woodDark} opacity={0.5} />
      <Rect x={12} y={46} width={76} height={4} fill={C.goldDeep} />
      <Rect x={44} y={42} width={12} height={12} rx={2} fill={C.gold} />
      <Path d="M16 30Q16 26 20 26" stroke={C.white} strokeWidth={2} opacity={0.4} fill="none" strokeLinecap="round" />
    </>
  )),

  /** Medicine bottle, spoon and thermometer – someone who is ill. */
  medicine: art(100, 90, (c) => (
    <>
      <Shadow c={c} cx={50} cy={86} rx={40} />
      <Rect x={22} y={30} width={34} height={54} rx={7} fill={C.coral} />
      <Rect x={26} y={18} width={26} height={14} rx={3} fill={C.white} />
      <Rect x={26} y={46} width={26} height={22} rx={3} fill={C.cream} />
      <Path d="M39 50V64M32 57H46" stroke={C.berry} strokeWidth={4} strokeLinecap="round" />
      <G transform="rotate(-30 74 52)">
        <Rect x={70} y={18} width={8} height={56} rx={4} fill={C.white} />
        <Rect x={72.5} y={40} width={3} height={30} fill={C.berry} />
        <Circle cx={74} cy={74} r={6} fill={C.berry} />
      </G>
      <Path d="M58 84Q72 84 84 76" stroke={C.grey} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Ellipse cx={86} cy={74} rx={6} ry={4} fill={C.grey} />
    </>
  )),

  /** A walking cane – old age. */
  cane: art(70, 100, (c) => (
    <>
      <Shadow c={c} cx={35} cy={96} rx={18} />
      <Path d="M24 26Q24 10 38 10T52 26" stroke={C.wood} strokeWidth={7} fill="none" strokeLinecap="round" />
      <Path d="M52 24V94" stroke={C.wood} strokeWidth={7} strokeLinecap="round" />
      <Path d="M50 30V90" stroke={C.woodPale} strokeWidth={2} opacity={0.6} />
      <Rect x={47} y={90} width={10} height={6} rx={2} fill={C.ink} />
    </>
  )),

  /** Small shoes – a child. */
  'small-shoes': art(100, 70, (c) => (
    <>
      <Shadow c={c} cx={50} cy={64} rx={42} />
      <Path d="M8 58Q8 40 22 36L34 34Q38 44 46 48Q48 58 44 60H12Q8 60 8 58Z" fill={C.tealMid} />
      <Path d="M8 56H46V60H8Z" fill={C.white} />
      <Path d="M54 58Q54 40 68 36L80 34Q84 44 92 48Q94 58 90 60H58Q54 60 54 58Z" fill={C.tealLight} />
      <Path d="M54 56H92V60H54Z" fill={C.white} />
      <Path d="M24 40L30 46M28 38L34 44M70 40L76 46M74 38L80 44" stroke={C.white} strokeWidth={1.6} />
      <Path d={star8Path(22, 50, 3.4)} fill={C.goldLight} />
      <Path d={star8Path(68, 50, 3.4)} fill={C.goldLight} />
    </>
  )),

  /** A calendar page with marked days – making up days later. */
  calendar: art(100, 100, (c) => (
    <>
      <Shadow c={c} cx={50} cy={94} rx={38} />
      <Rect x={14} y={16} width={72} height={76} rx={8} fill={C.cream} />
      <Rect x={14} y={16} width={72} height={18} rx={8} fill={C.teal} />
      <Rect x={14} y={26} width={72} height={8} fill={C.teal} />
      <Rect x={28} y={8} width={6} height={16} rx={3} fill={C.greyDark} />
      <Rect x={66} y={8} width={6} height={16} rx={3} fill={C.greyDark} />
      {Array.from({ length: 16 }, (_, i) => {
        const x = 24 + (i % 4) * 17;
        const y = 44 + Math.floor(i / 4) * 12;
        return <Rect key={i} x={x} y={y} width={10} height={7} rx={2} fill={i === 9 || i === 10 || i === 13 ? C.gold : C.stonePale} />;
      })}
      <Path d={crescentPath(74, 25, 4.4, 2, -1.6, 3.8)} fill={C.goldLight} />
    </>
  )),

  /** A thought bubble with a bowl and spoon – eating by forgetting. */
  thought: art(100, 90, (c) => (
    <>
      <Path d="M24 52C10 52 8 34 20 30 18 14 40 10 46 20 54 6 78 10 78 26 92 28 92 50 76 52 74 62 54 64 48 56 40 64 26 62 24 52Z" fill={c.dark ? '#E3E6F2' : C.white} stroke={C.greyLight} strokeWidth={2} />
      <Circle cx={22} cy={70} r={6} fill={c.dark ? '#E3E6F2' : C.white} stroke={C.greyLight} strokeWidth={2} />
      <Circle cx={12} cy={82} r={3.6} fill={c.dark ? '#E3E6F2' : C.white} stroke={C.greyLight} strokeWidth={2} />
      <Path d="M32 34Q34 48 50 48T68 34Z" fill={C.tealMid} />
      <Ellipse cx={50} cy={34} rx={18} ry={4} fill={C.orange} />
      <Path d="M66 18L56 30" stroke={C.grey} strokeWidth={3} strokeLinecap="round" />
      <Ellipse cx={68} cy={16} rx={4} ry={3} fill={C.grey} />
    </>
  )),

  /** A shower head with drops – bathing does not break the fast. */
  shower: art(100, 100, (c) => (
    <>
      <Path d="M12 8V28Q12 34 18 34H44" stroke={C.greyDark} strokeWidth={5} fill="none" strokeLinecap="round" />
      <Path d="M36 34H64L72 46H28Z" fill={C.grey} />
      <Path d="M28 46H72" stroke={C.greyDark} strokeWidth={3} />
      {[[34, 56], [44, 60], [54, 58], [64, 56], [38, 74], [50, 78], [62, 74], [44, 92], [56, 90]].map(([x, y], i) => (
        <Path key={i} d={`M${x} ${y - 6}C${x + 3} ${y - 1} ${x + 3} ${y + 3} ${x} ${y + 3} ${x - 3} ${y + 3} ${x - 3} ${y - 1} ${x} ${y - 6}Z`} fill={C.water} opacity={0.85} />
      ))}
      <Shadow c={c} cx={50} cy={97} rx={30} />
    </>
  )),

  /** A miswak stick. */
  miswak: art(100, 60, (c) => (
    <>
      <Shadow c={c} cx={50} cy={52} rx={42} />
      <G transform="rotate(-14 50 30)">
        <Rect x={10} y={24} width={74} height={12} rx={6} fill={C.woodPale} />
        <Rect x={10} y={24} width={74} height={4} rx={2} fill={C.sandLight} opacity={0.7} />
        <Path d="M84 24Q96 24 96 30T84 36Z" fill="#F3E6C6" />
        {[86, 89, 92].map((x) => (
          <Path key={x} d={`M${x} 25V35`} stroke={C.sandDeep} strokeWidth={1} />
        ))}
        <Path d="M30 26Q32 30 30 34M50 26Q52 30 50 34" stroke={C.wood} strokeWidth={1.2} fill="none" opacity={0.6} />
      </G>
    </>
  )),

  /** A pack of chewing gum. */
  gum: art(100, 70, (c) => (
    <>
      <Shadow c={c} cx={50} cy={64} rx={40} />
      <Rect x={14} y={20} width={60} height={40} rx={6} fill={C.pink} />
      <Rect x={14} y={34} width={60} height={12} fill={C.rose} />
      <G transform="rotate(12 76 34)">
        <Rect x={62} y={14} width={22} height={40} rx={4} fill={C.white} />
        <Rect x={62} y={14} width={22} height={10} rx={4} fill={C.pinkPale} />
      </G>
      <Path d={star8Path(30, 40, 5)} fill={C.white} opacity={0.7} />
    </>
  )),

  /** A glass of juice. */
  juice: art(70, 100, (c) => (
    <>
      <Shadow c={c} cx={35} cy={94} rx={24} />
      <Path d="M12 20H58L52 92H18Z" fill={C.skyPale} opacity={0.7} />
      <Path d="M14 36H56L52 92H18Z" fill={C.orange} />
      <Path d="M20 26V86" stroke={C.white} strokeWidth={3} opacity={0.5} strokeLinecap="round" />
      <Path d="M44 6L36 54" stroke={C.berry} strokeWidth={4} strokeLinecap="round" />
      <Circle cx={56} cy={22} r={10} fill={C.lemon} />
      <Circle cx={56} cy={22} r={6} fill={mix(C.lemon, C.white, 0.4)} />
    </>
  )),

  /** A pillow and a little moon – sleeping. */
  pillow: art(100, 80, (c) => (
    <>
      <Shadow c={c} cx={50} cy={74} rx={42} />
      <Path d="M10 44Q8 30 22 30H78Q92 30 90 44 92 64 78 66H22Q8 66 10 44Z" fill={C.lilac} />
      <Path d="M22 34H78" stroke={C.white} strokeWidth={2} opacity={0.5} />
      <Path d={crescentPath(76, 16, 9, 4, -3, 7.6)} fill={C.gold} />
      <Path d={sparklePath(56, 12, 4)} fill={C.gold} />
    </>
  )),

  /** A big gift for Eid with a crescent ribbon. */
  'eid-gift': art(90, 90, (c) => (
    <>
      <Shadow c={c} cx={45} cy={86} rx={36} />
      <Rect x={12} y={40} width={66} height={46} rx={5} fill={C.purple} />
      <Rect x={50} y={40} width={28} height={46} fill={shade(C.purple, 0.25)} opacity={0.5} />
      <Rect x={8} y={30} width={74} height={14} rx={4} fill={C.lilac} />
      <Rect x={40} y={30} width={10} height={56} fill={C.gold} />
      <Path d="M45 30C36 14 20 14 22 24 24 32 36 30 45 30ZM45 30C54 14 70 14 68 24 66 32 54 30 45 30Z" fill={C.gold} />
      <Path d={crescentPath(28, 64, 7, 3, -2.4, 6)} fill={C.goldLight} />
      <Path d={starPath(62, 64, 6, 2.6)} fill={C.goldLight} />
    </>
  )),

  /** A stack of taraweeh: lit floors of a minaret (cover of the stacking game). */
  'taraweeh-tower': scene(200, 150, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={NIGHT} />
      </Defs>
      <Rect width={200} height={150} fill={c.url('sky')} />
      <Stars />
      <Glow c={c} k="t" cx={100} cy={80} r={70} color={C.gold} opacity={0.3} />
      {[0, 1, 2, 3, 4].map((i) => (
        <G key={i}>
          <Rect x={70 + i * 3} y={130 - (i + 1) * 20} width={60 - i * 6} height={18} rx={4} fill={i % 2 ? C.tealMid : C.teal} />
          <Rect x={76 + i * 3} y={134 - (i + 1) * 20} width={20 - i * 2} height={10} rx={3} fill={C.goldPale} opacity={0.9} />
          <Rect x={104 - i * 3} y={134 - (i + 1) * 20} width={20 - i * 2} height={10} rx={3} fill={C.goldPale} opacity={0.9} />
        </G>
      ))}
      <Path d={domePath(100, 30, 16, 1.3)} fill={C.gold} />
      <Path d={crescentPath(100, 4, 4, 2, -1.4, 3.4)} fill={C.goldLight} />
      <Path d="M0 132Q100 124 200 132V150H0Z" fill="#141738" />
    </>
  )),
} satisfies Record<string, ArtDef>;
