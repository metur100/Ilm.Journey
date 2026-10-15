import { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { art, Cloud, crescentPath, Glow, House, Lin, Palm, type ArtDef, type Ctx } from '../../kit';
import { C, mix } from '../../palette';

// ---------------------------------------------------------------------------------------------------------------
// Masjid an-Nabawi in its early form (game "build-the-masjid"). Architecture, landscape and one resting camel only –
// no people. Every `masjid-*` piece shares the same 360 × 260 viewBox and the same oblique projection, so the layers
// stack exactly on top of each other while the learner builds, and `masjid-finished*` draws the whole picture.
// Sources for the forms: Sahih al-Bukhari 446 (mud bricks, palm-trunk pillars, palm-leaf roof), 428 and 3905 (the
// land where the camel knelt), 602 (the people of the Suffa). No dome, no minaret, no mihrab: the early masjid had none.
// The projection is mirrored in src/features/games/build-the-masjid/logic.ts (`project`).

const MW = 360;
const MH = 260;
/** Wall height, front (cut-away) wall height and the height of the palm-leaf roofs (site units). */
const WALL = 34;
const FRONT_WALL = 12;
const ROOF = 30;

type Pt = [u: number, v: number, z?: number];
const r2 = (n: number) => Math.round(n * 100) / 100;
/** Oblique projection: u west → east (0..1), v north → south / back → front (0..1), z up. */
const mp = (u: number, v: number, z = 0): [number, number] => [r2(100 + 200 * u - 46 * v), r2(150 + 64 * v - z)];
const mpoly = (pts: Pt[]) => `M${pts.map(([u, v, z]) => mp(u, v, z ?? 0).join(' ')).join('L')}Z`;
const mline = (a: Pt, b: Pt) => `M${mp(a[0], a[1], a[2] ?? 0).join(' ')}L${mp(b[0], b[1], b[2] ?? 0).join(' ')}`;

type MasjidTime = 'morning' | 'noon' | 'evening';

/** Dim a colour for dark surfaces (the scene turns to a calm night). */
const md = (c: Ctx, color: string, k = 0.42) => (c.dark ? mix(color, '#1B1F4B', k) : color);

const SKIES: Record<MasjidTime, [number, string][]> = {
  morning: [[0, '#9DD5EE'], [0.7, '#E6F2EE'], [1, '#FCE3BC']],
  noon: [[0, '#62B5DE'], [0.75, '#CFEAF5'], [1, '#EEF7F8']],
  evening: [[0, '#4B3F8F'], [0.5, '#D9826A'], [1, '#FBCF8E']],
};

function MasjidBackdrop({ c, time }: { c: Ctx; time: MasjidTime }) {
  const sky: [number, string][] = c.dark ? [[0, '#101333'], [0.7, '#2E2F6E'], [1, '#4B3F8F']] : SKIES[time];
  const warm = time === 'evening' && !c.dark;
  const far = c.dark ? '#2B2E66' : warm ? '#9A6F8E' : time === 'morning' ? '#C3B4C4' : '#B8A68F';
  const near = c.dark ? '#24275A' : warm ? '#7E5A78' : time === 'morning' ? '#A9927F' : '#9E8467';
  const sandTop = md(c, warm ? '#EDBF85' : '#EBCB97', 0.5);
  const sandBottom = md(c, warm ? '#DDA468' : '#E0B072', 0.5);
  const house = md(c, warm ? '#E3B98C' : '#E6CDA6', 0.5);
  const houseShade = md(c, warm ? '#C18A62' : C.sandDeep, 0.5);
  const sun =
    time === 'morning' ? { x: 58, y: 84, r: 12, color: C.goldPale } : time === 'noon' ? { x: 300, y: 34, r: 11, color: '#FFF6D6' } : { x: 296, y: 100, r: 17, color: '#FFB46A' };
  return (
    <>
      <Defs>
        <Lin id={c.id('msky')} stops={sky} />
        <Lin id={c.id('msand')} stops={[[0, sandTop], [1, sandBottom]]} />
      </Defs>
      <Rect x={0} y={0} width={MW} height={MH} fill={c.url('msky')} />
      {c.dark ? (
        <G>
          {[[24, 18], [70, 40], [120, 14], [168, 34], [214, 20], [250, 52], [330, 26], [40, 64], [190, 70], [96, 80]].map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.4 : 0.9} fill={C.white} opacity={0.85} />
          ))}
          <Glow c={c} k="mmoon" cx={292} cy={40} r={30} color={C.goldPale} opacity={0.35} />
          <Path d={crescentPath(292, 40, 11, 5, -3, 9)} fill={C.goldPale} />
        </G>
      ) : (
        <G>
          <Glow c={c} k="msun" cx={sun.x} cy={sun.y} r={sun.r * 4} color={sun.color} opacity={0.85} />
          <Circle cx={sun.x} cy={sun.y} r={sun.r} fill={time === 'evening' ? '#FFC77F' : C.goldLight} />
          {time !== 'evening' && (
            <>
              <Cloud x={150} y={40} r={13} opacity={0.9} />
              <Cloud x={238} y={66} r={9} opacity={0.75} />
            </>
          )}
          {time === 'evening' && <Cloud x={120} y={54} r={12} color="#F6C7A6" shadeColor="#D99A86" opacity={0.7} />}
        </G>
      )}
      {/* far mountains (the hills north of the oasis) */}
      <Path d="M0 116L30 100 58 108 96 86 130 104 160 96 196 110 240 92 286 106 318 96 360 110V124H0Z" fill={far} />
      <Path d="M0 122L44 110 80 118 120 106 170 120 214 112 262 121 306 110 360 120V128H0Z" fill={near} opacity={0.75} />
      {/* palm groves of the oasis */}
      {[[18, 40], [36, 32], [66, 44], [126, 30], [214, 34], [252, 42], [318, 38], [344, 30]].map(([x, h], i) => (
        <Palm key={i} c={c} x={x} y={128} h={h} lean={i % 2 ? 4 : -4} dark />
      ))}
      {/* flat-roofed houses of Madinah */}
      <G>
        <House x={8} y={130} w={18} h={11} color={house} shadeColor={houseShade} door={false} />
        <House x={44} y={131} w={22} h={14} color={house} shadeColor={houseShade} />
        <House x={72} y={129} w={14} h={9} color={house} shadeColor={houseShade} door={false} />
        <House x={276} y={130} w={20} h={12} color={house} shadeColor={houseShade} />
        <House x={300} y={131} w={16} h={9} color={house} shadeColor={houseShade} door={false} />
        <House x={322} y={129} w={24} h={13} color={house} shadeColor={houseShade} />
      </G>
      {/* the ground */}
      <Path d={`M0 126Q90 120 180 125T360 124V${MH}H0Z`} fill={c.url('msand')} />
      <Path d="M8 170Q40 164 70 170M290 236Q318 230 350 236M14 228Q36 223 58 228M300 160Q322 156 346 161" stroke={md(c, C.sandDark, 0.5)} strokeWidth={1.2} fill="none" opacity={0.45} strokeLinecap="round" />
      {/* the path to the door */}
      <Path d={`M146 ${MH}L${mp(0.45, 1)[0]} ${mp(0.45, 1)[1] + 2}H${mp(0.55, 1)[0]}L188 ${MH}Z`} fill={md(c, '#F4DDB0', 0.5)} opacity={0.75} />
    </>
  );
}

/** A camel resting on its folded legs (the camel knelt where the masjid was built). */
function MasjidCamel({ c, x, y, s = 1 }: { c: Ctx; x: number; y: number; s?: number }) {
  const col = md(c, '#D6A46A', 0.35);
  const dk = md(c, '#B07F4B', 0.35);
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Ellipse cx={0} cy={1} rx={24} ry={3.4} fill={c.dark ? '#000000' : C.ink} opacity={c.dark ? 0.3 : 0.12} />
      <Ellipse cx={-9} cy={-2} rx={8} ry={3.2} fill={dk} />
      <Ellipse cx={11} cy={-2} rx={8} ry={3.2} fill={dk} />
      <Path d="M-18 -3C-21 -12 -15 -19 -6 -19C-2 -30 11 -30 15 -19C20 -17 23 -10 20 -3Z" fill={col} />
      <Path d="M4 -27C10 -27 14 -23 15 -19C20 -17 23 -10 20 -3 16 -3 18 -18 4 -27Z" fill={dk} opacity={0.35} />
      <Path d="M-14 -13C-21 -17 -25 -25 -25 -34L-18 -35C-18 -27 -14 -21 -8 -17Z" fill={col} />
      <Ellipse cx={-25} cy={-36} rx={7} ry={4.4} fill={col} />
      <Ellipse cx={-30.5} cy={-34.8} rx={3.2} ry={2.6} fill={dk} opacity={0.5} />
      <Path d="M-21 -40L-22 -44 -18 -41Z" fill={dk} />
      <Circle cx={-25.5} cy={-37.2} r={0.9} fill={C.ink} />
      <Path d="M20 -6Q25 -4 24 2" stroke={dk} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </G>
  );
}

/** The levelled plot, marked with stakes and a cord; the camel rests beside it. */
function MasjidPlot({ c, stakes = true }: { c: Ctx; stakes?: boolean }) {
  const corners: Pt[] = [[0, 0], [1, 0], [1, 1], [0, 1]];
  return (
    <G>
      <Path d={mpoly([[-0.05, -0.07], [1.05, -0.07], [1.05, 1.07], [-0.05, 1.07]])} fill={md(c, '#F1D8AA', 0.5)} opacity={0.85} />
      <Path d={mpoly(corners)} fill={md(c, '#EFD3A1', 0.5)} />
      {[0.2, 0.4, 0.6, 0.8].map((v) => (
        <Path key={v} d={mline([0.03, v], [0.97, v])} stroke={md(c, '#E2BF86', 0.5)} strokeWidth={0.8} opacity={0.6} />
      ))}
      {stakes && (
        <G>
          <Path d={mpoly(corners.map(([u, v]) => [u, v, 6] as Pt))} fill="none" stroke={md(c, C.woodLight, 0.3)} strokeWidth={0.9} strokeDasharray="3 2" />
          {corners.map(([u, v]) => {
            const [x, y] = mp(u, v);
            return <Rect key={`${u}${v}`} x={x - 1.2} y={y - 8} width={2.4} height={9} rx={0.8} fill={md(c, C.wood, 0.3)} />;
          })}
        </G>
      )}
      <MasjidCamel c={c} x={300} y={240} />
    </G>
  );
}

/** Mud-brick courses on a wall face given by its bottom edge a → b and height. */
function MasjidBricks({ c, a, b, z0 = 0, z1, steps }: { c: Ctx; a: [number, number]; b: [number, number]; z0?: number; z1: number; steps: number }) {
  let d = '';
  const course = 5;
  for (let z = z0 + course; z < z1 - 0.5; z += course) d += mline([a[0], a[1], z], [b[0], b[1], z]);
  let row = 0;
  for (let z = z0; z < z1 - 0.5; z += course, row++) {
    for (let i = row % 2 ? 0.5 : 1; i < steps; i++) {
      const t = i / steps;
      const u = a[0] + (b[0] - a[0]) * t;
      const v = a[1] + (b[1] - a[1]) * t;
      d += mline([u, v, z], [u, v, Math.min(z + course, z1)]);
    }
  }
  return <Path d={d} stroke={md(c, C.clay, 0.4)} strokeWidth={0.6} opacity={0.5} fill="none" />;
}

const wallColors = (c: Ctx) => ({
  lit: md(c, '#D2AC80'),
  side: md(c, '#BE966A'),
  shade: md(c, '#A9825A'),
  top: md(c, '#E4C69C'),
});

/** The back (north) wall and the two side walls of the enclosure. */
function MasjidWalls({ c }: { c: Ctx }) {
  const w = wallColors(c);
  const t = 0.03;
  return (
    <G>
      {/* soft shadow along the inside of the walls */}
      <Path d={mpoly([[t, t], [1 - t, t], [1 - t, 0.1], [t, 0.1]])} fill={C.ink} opacity={c.dark ? 0.2 : 0.08} />
      <Path d={mpoly([[t, t], [0.08, t], [0.08, 0.97], [t, 0.97]])} fill={C.ink} opacity={c.dark ? 0.18 : 0.07} />
      {/* back wall, inner face (faces the courtyard) */}
      <Path d={mpoly([[t, t], [1 - t, t], [1 - t, t, WALL], [t, t, WALL]])} fill={w.lit} />
      <MasjidBricks c={c} a={[t, t]} b={[1 - t, t]} z1={WALL} steps={24} />
      <Path d={mpoly([[0, 0, WALL], [1, 0, WALL], [1, t, WALL], [0, t, WALL]])} fill={w.top} />
      {/* west wall, inner face */}
      <Path d={mpoly([[t, t], [t, 0.97], [t, 0.97, WALL], [t, t, WALL]])} fill={w.shade} />
      <MasjidBricks c={c} a={[t, t]} b={[t, 0.97]} z1={WALL} steps={11} />
      <Path d={mpoly([[0, 0, WALL], [t, 0, WALL], [t, 1, WALL], [0, 1, WALL]])} fill={w.top} />
      {/* east wall, outer face */}
      <Path d={mpoly([[1, 0], [1, 1], [1, 1, WALL], [1, 0, WALL]])} fill={w.side} />
      <MasjidBricks c={c} a={[1, 0]} b={[1, 1]} z1={WALL} steps={11} />
      <Path d={mpoly([[1 - t, 0, WALL], [1, 0, WALL], [1, 1, WALL], [1 - t, 1, WALL]])} fill={w.top} />
      <Path d={mline([1, 0, WALL], [1, 1, WALL])} stroke={md(c, '#F0D6B0')} strokeWidth={0.8} />
      {/* ground shadow east of the enclosure */}
      <Path d={mpoly([[1, 0.02], [1.06, 0.06], [1.06, 1.04], [1, 1]])} fill={C.ink} opacity={c.dark ? 0.22 : 0.1} />
    </G>
  );
}

/** The low, cut-away front (south) wall with the doorway. */
function MasjidFrontWall({ c }: { c: Ctx }) {
  const w = wallColors(c);
  const segs: [number, number][] = [[0, 0.44], [0.56, 1]];
  return (
    <G>
      {segs.map(([u0, u1]) => (
        <G key={u0}>
          <Path d={mpoly([[u0, 1], [u1, 1], [u1, 1, FRONT_WALL], [u0, 1, FRONT_WALL]])} fill={w.lit} />
          <MasjidBricks c={c} a={[u0, 1]} b={[u1, 1]} z1={FRONT_WALL} steps={Math.round((u1 - u0) * 24)} />
          <Path d={mpoly([[u0, 0.97, FRONT_WALL], [u1, 0.97, FRONT_WALL], [u1, 1, FRONT_WALL], [u0, 1, FRONT_WALL]])} fill={w.top} />
        </G>
      ))}
      {/* the side of the doorway and two stone door posts */}
      <Path d={mpoly([[0.44, 0.97], [0.44, 1], [0.44, 1, FRONT_WALL], [0.44, 0.97, FRONT_WALL]])} fill={w.shade} />
      {[0.44, 0.56].map((u) => {
        const [x, y] = mp(u, 1);
        return <Rect key={u} x={x - 2.2} y={y - FRONT_WALL - 3} width={4.4} height={FRONT_WALL + 3} rx={1} fill={md(c, C.stoneLight)} stroke={md(c, C.stone)} strokeWidth={0.6} />;
      })}
    </G>
  );
}

const PILLAR_US = [0.12, 0.272, 0.424, 0.576, 0.728, 0.88];

/** Two rows of palm-trunk pillars at the given depths. */
function MasjidPillars({ c, rows }: { c: Ctx; rows: number[] }) {
  const trunk = md(c, C.wood, 0.3);
  const ring = md(c, C.woodDark, 0.3);
  return (
    <G>
      {rows.map((v) =>
        PILLAR_US.map((u) => {
          const [x, y] = mp(u, v);
          const top = y - ROOF;
          let rings = '';
          for (let z = 3; z < ROOF; z += 3.2) rings += `M${r2(x - 1.6)} ${r2(y - z)}q1.6 -0.9 3.2 0`;
          return (
            <G key={`${u}-${v}`}>
              <Ellipse cx={x + 1} cy={y} rx={4.2} ry={1.3} fill={C.ink} opacity={c.dark ? 0.3 : 0.14} />
              <Path d={`M${x - 2.3} ${y}L${x - 1.8} ${top}H${x + 1.8}L${x + 2.3} ${y}Z`} fill={trunk} />
              <Path d={`M${x + 0.4} ${y}L${x + 0.4} ${top}H${x + 1.8}L${x + 2.3} ${y}Z`} fill={ring} opacity={0.35} />
              <Path d={rings} stroke={ring} strokeWidth={0.55} fill="none" opacity={0.7} />
            </G>
          );
        }),
      )}
    </G>
  );
}

/** A flat roof of palm leaves (jarid) between the depths v0 and v1, with its shade on the floor. */
function MasjidRoof({ c, v0, v1 }: { c: Ctx; v0: number; v1: number }) {
  const straw = md(c, '#BBAA63', 0.4);
  const dry = md(c, '#8F8446', 0.4);
  const light = md(c, '#D9C886', 0.4);
  let fronds = '';
  let tips = '';
  for (let i = 0; i <= 34; i++) {
    const u = 0.025 + i * 0.0279;
    fronds += mline([u, v0, ROOF], [Math.min(u + 0.018, 0.98), v1, ROOF]);
  }
  for (let u = 0.03; u < 0.97; u += 0.024) {
    const [x, y] = mp(u, v1, ROOF - 3);
    tips += `M${x} ${y}l1.4 ${r2(2.6 + (Math.round(u * 1000) % 3))}l1.4 -${r2(2.6 + (Math.round(u * 1000) % 3))}`;
  }
  return (
    <G>
      <Path d={mpoly([[0.03, v0], [0.97, v0], [0.97, Math.min(v1 + 0.07, 0.97)], [0.03, Math.min(v1 + 0.07, 0.97)]])} fill={C.ink} opacity={c.dark ? 0.24 : 0.13} />
      {/* the walls under the roof lie in the shade */}
      {v0 < 0.1 && <Path d={mpoly([[0.03, 0.03], [0.97, 0.03], [0.97, 0.03, ROOF], [0.03, 0.03, ROOF]])} fill={C.ink} opacity={c.dark ? 0.25 : 0.16} />}
      <Path d={mpoly([[0.03, v0], [0.03, v1], [0.03, v1, ROOF], [0.03, v0, ROOF]])} fill={C.ink} opacity={c.dark ? 0.22 : 0.14} />
      <Path d={mpoly([[0.02, v0 - 0.01, ROOF], [0.98, v0 - 0.01, ROOF], [0.98, v1, ROOF], [0.02, v1, ROOF]])} fill={straw} />
      <Path d={fronds} stroke={dry} strokeWidth={0.9} opacity={0.75} />
      <Path d={mline([0.02, v0 + (v1 - v0) * 0.5, ROOF], [0.98, v0 + (v1 - v0) * 0.5, ROOF])} stroke={light} strokeWidth={1.2} opacity={0.6} />
      <Path d={mpoly([[0.02, v1, ROOF], [0.98, v1, ROOF], [0.98, v1, ROOF - 3], [0.02, v1, ROOF - 3]])} fill={md(c, C.woodDark, 0.3)} />
      <Path d={tips} stroke={md(c, C.oliveDark, 0.4)} strokeWidth={0.9} fill="none" strokeLinejoin="round" />
    </G>
  );
}

/** The Suffa: a raised platform under the old (northern) shade. */
function MasjidSuffa({ c }: { c: Ctx }) {
  const h = 5;
  const [u0, u1, v0, v1] = [0.06, 0.52, 0.045, 0.17];
  const [jx, jy] = mp(0.47, 0.1, h);
  return (
    <G>
      <Path d={mpoly([[u0, v1], [u1, v1], [u1, v1, h], [u0, v1, h]])} fill={md(c, '#C59B6E')} />
      <Path d={mpoly([[u1, v0], [u1, v1], [u1, v1, h], [u1, v0, h]])} fill={md(c, '#B38A5F')} />
      <Path d={mpoly([[u0, v0, h], [u1, v0, h], [u1, v1, h], [u0, v1, h]])} fill={md(c, '#E8CDA2')} />
      <Path d={mpoly([[0.09, 0.07, h + 0.2], [0.2, 0.07, h + 0.2], [0.2, 0.15, h + 0.2], [0.09, 0.15, h + 0.2]])} fill={md(c, C.teal, 0.3)} />
      <Path d={mpoly([[0.24, 0.07, h + 0.2], [0.35, 0.07, h + 0.2], [0.35, 0.15, h + 0.2], [0.24, 0.15, h + 0.2]])} fill={md(c, C.terracotta, 0.3)} />
      <Path d={mline([0.11, 0.11, h + 0.3], [0.18, 0.11, h + 0.3])} stroke={md(c, C.gold, 0.3)} strokeWidth={0.8} />
      <Path d={mline([0.26, 0.11, h + 0.3], [0.33, 0.11, h + 0.3])} stroke={md(c, C.goldPale, 0.3)} strokeWidth={0.8} />
      <Ellipse cx={jx} cy={jy - 3} rx={2.6} ry={3.2} fill={md(c, C.clay, 0.3)} />
      <Rect x={jx - 1} y={jy - 8.4} width={2} height={2.6} fill={md(c, C.clay, 0.3)} />
    </G>
  );
}

/** Large palms in front, for depth. */
function MasjidForeground({ c }: { c: Ctx }) {
  return (
    <G>
      <Ellipse cx={22} cy={256} rx={34} ry={5} fill={C.ink} opacity={c.dark ? 0.3 : 0.12} />
      <Palm c={c} x={16} y={262} h={150} lean={-8} dates />
      <Palm c={c} x={354} y={262} h={104} lean={12} />
      <Path d="M44 258q4 -10 8 0M52 259q3 -7 6 0M318 258q4 -9 8 0" stroke={c.green(C.leafDark)} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </G>
  );
}

function MasjidBirds({ c }: { c: Ctx }) {
  if (c.dark) return null;
  return (
    <Path
      d="M150 58q4 -4 8 0q4 -4 8 0M178 46q3 -3 6 0q3 -3 6 0M196 62q3 -3 6 0q3 -3 6 0"
      stroke={C.night}
      strokeWidth={1.3}
      fill="none"
      strokeLinecap="round"
      opacity={0.55}
    />
  );
}

const NORTH_ROWS = [0.13, 0.27];
const SOUTH_ROWS = [0.8, 0.91];

function MasjidFinished({ c, qibla }: { c: Ctx; qibla: boolean }) {
  return (
    <>
      <MasjidBackdrop c={c} time="evening" />
      <MasjidBirds c={c} />
      <MasjidPlot c={c} stakes={false} />
      <MasjidWalls c={c} />
      {qibla && <MasjidSuffa c={c} />}
      <MasjidPillars c={c} rows={NORTH_ROWS} />
      <MasjidRoof c={c} v0={0.03} v1={0.36} />
      {qibla && (
        <>
          <MasjidPillars c={c} rows={SOUTH_ROWS} />
          <MasjidRoof c={c} v0={0.74} v1={0.965} />
        </>
      )}
      <MasjidFrontWall c={c} />
      <MasjidForeground c={c} />
    </>
  );
}

/** Section art (see docs/GAMES-V3.md). Owned by the seerah section – add pieces here only. */
export const seerah = {
  // --- Build the Masjid (masjid-*): stacked layers of one scene (360 × 260) and the finished picture. ---
  'masjid-sky-morning': art(MW, MH, (c) => <MasjidBackdrop c={c} time="morning" />),
  'masjid-sky-noon': art(MW, MH, (c) => <MasjidBackdrop c={c} time="noon" />),
  'masjid-sky-evening': art(MW, MH, (c) => <MasjidBackdrop c={c} time="evening" />),
  'masjid-plot': art(MW, MH, (c) => <MasjidPlot c={c} />),
  'masjid-walls': art(MW, MH, (c) => <MasjidWalls c={c} />),
  'masjid-suffa': art(MW, MH, (c) => <MasjidSuffa c={c} />),
  'masjid-pillars': art(MW, MH, (c) => <MasjidPillars c={c} rows={NORTH_ROWS} />),
  'masjid-roof': art(MW, MH, (c) => <MasjidRoof c={c} v0={0.03} v1={0.36} />),
  'masjid-shade-south': art(MW, MH, (c) => (
    <>
      <MasjidPillars c={c} rows={SOUTH_ROWS} />
      <MasjidRoof c={c} v0={0.74} v1={0.965} />
    </>
  )),
  'masjid-walls-front': art(MW, MH, (c) => <MasjidFrontWall c={c} />),
  'masjid-foreground': art(MW, MH, (c) => <MasjidForeground c={c} />),
  /** The early Masjid an-Nabawi (1 AH): enclosure of mud bricks, palm-trunk pillars, palm-leaf roof. */
  'masjid-finished': art(MW, MH, (c) => <MasjidFinished c={c} qibla={false} />),
  /** After the change of the qibla (2 AH): the shade on the side of the Kaʿbah and the Suffa under the old shade. */
  'masjid-finished-qibla': art(MW, MH, (c) => <MasjidFinished c={c} qibla />),
} satisfies Record<string, ArtDef>;
