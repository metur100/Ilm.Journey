import { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { archPath, art, Cloud, crescentPath, Glow, LeafyTree, Lin, Palm, Rad, Shadow, smoothOpen, star8Path, type ArtDef, type Ctx } from '../../kit';
import { C, mix } from '../../palette';

/*
 * `story.*` – generic backdrops and props for the animated story stages (docs/STORIES-V3.md). Owned by the story-fx
 * author. Prophet-specific objects live in `prophet.*` (prophetA/B/C.tsx), Seerah art in `seerah.*`.
 *
 * Full-width bands are 400 × 240 with a transparent sky, so the stage's sky gradient, stars and sun show through.
 * Never people: only landscapes, buildings, objects, plants and light.
 */

/** Darken / cool a colour for night skies (the stage passes `dark` for night, dusk, storm and sea). */
const dim = (c: Ctx, color: string, k = 0.38) => (c.dark ? mix(color, '#1B1F4B', k) : color);
const W = 400;
const H = 240;

function Ripples({ c, rows, color = C.white, opacity = 0.5 }: { c: Ctx; rows: [number, number, number][]; color?: string; opacity?: number }) {
  return (
    <G stroke={color} strokeWidth={1.6} strokeLinecap="round" opacity={c.dark ? opacity * 0.6 : opacity}>
      {rows.map(([x, y, len], i) => (
        <Path key={i} d={`M${x} ${y}h${len}`} />
      ))}
    </G>
  );
}

function Tuft({ x, y, s = 1, color }: { x: number; y: number; s?: number; color: string }) {
  return (
    <Path
      d={`M${x - 6 * s} ${y}C${x - 5 * s} ${y - 8 * s} ${x - 3 * s} ${y - 12 * s} ${x - 4 * s} ${y - 16 * s}C${x - 1 * s} ${y - 10 * s} ${x} ${y - 8 * s} ${x} ${y - 6 * s}C${x + 1 * s} ${y - 10 * s} ${x + 3 * s} ${y - 14 * s} ${x + 6 * s} ${y - 15 * s}C${x + 4 * s} ${y - 10 * s} ${x + 5 * s} ${y - 6 * s} ${x + 6 * s} ${y}Z`}
      fill={color}
    />
  );
}

function Boulder({ c, x, y, w, h, color = C.stone, shade = C.stoneDark, light = C.stoneLight }: { c: Ctx; x: number; y: number; w: number; h: number; color?: string; shade?: string; light?: string }) {
  return (
    <G>
      <Path d={`M${x - w / 2} ${y}C${x - w / 2} ${y - h * 0.7} ${x - w * 0.25} ${y - h} ${x} ${y - h}C${x + w * 0.3} ${y - h} ${x + w / 2} ${y - h * 0.6} ${x + w / 2} ${y}Z`} fill={dim(c, color)} />
      <Path d={`M${x + w * 0.05} ${y - h}C${x + w * 0.3} ${y - h} ${x + w / 2} ${y - h * 0.6} ${x + w / 2} ${y}H${x + w * 0.12}C${x + w * 0.2} ${y - h * 0.4} ${x + w * 0.16} ${y - h * 0.75} ${x + w * 0.05} ${y - h}Z`} fill={dim(c, shade)} opacity={0.6} />
      <Path d={`M${x - w * 0.32} ${y - h * 0.55}C${x - w * 0.25} ${y - h * 0.82} ${x - w * 0.1} ${y - h * 0.92} ${x} ${y - h * 0.93}`} stroke={dim(c, light)} strokeWidth={Math.max(1.5, h * 0.06)} strokeLinecap="round" fill="none" opacity={0.7} />
    </G>
  );
}

/** Hanging lantern with its top hook at (x, y). */
function HangingLantern({ c, x, y, s = 1, glass = C.goldPale }: { c: Ctx; x: number; y: number; s?: number; glass?: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Glow c={c} k={`lg${Math.round(x)}`} cx={0} cy={26} r={26} color={C.goldPale} opacity={c.dark ? 0.55 : 0.35} />
      <Path d="M-6 8H6L4 4H-4Z" fill={C.goldDeep} />
      <Circle cx={0} cy={2} r={2.4} fill="none" stroke={C.goldDeep} strokeWidth={1.2} />
      <Path d="M-9 10H9L11 16 8 34H-8L-11 16Z" fill={C.gold} />
      <Path d="M-6 14H6L7.5 18 5.5 31H-5.5L-7.5 18Z" fill={glass} />
      <Path d="M0 14V31M-6 22H6" stroke={C.goldDeep} strokeWidth={1} opacity={0.6} />
      <Path d="M-8 34H8L4 40H-4Z" fill={C.goldDeep} />
      <Path d="M0 40V45" stroke={C.goldDeep} strokeWidth={1.4} strokeLinecap="round" />
    </G>
  );
}

// ---------------------------------------------------------------------------------------------------------------

export const story = {
  // ---------- full-width bands (400 × 240, transparent sky) ----------

  dunes: art(W, H, (c) => (
    <>
      <Path d="M0 150C50 138 100 136 150 144S260 130 310 137 380 146 400 142V240H0Z" fill={dim(c, '#E6C291', 0.48)} />
      <Path d="M0 172C70 150 130 152 200 166S330 148 400 160V240H0Z" fill={dim(c, C.sand)} />
      <Path d="M0 172C70 150 130 152 200 166S330 148 400 160" stroke={dim(c, C.sandLight)} strokeWidth={3} fill="none" opacity={0.8} />
      <Path d="M200 166C150 176 120 192 110 240H0V178C60 160 140 156 200 166Z" fill={dim(c, C.sandLight)} opacity={0.35} />
      <Path d="M0 200C90 180 170 184 250 197S360 186 400 190V240H0Z" fill={dim(c, C.sandDeep)} />
      <Path d="M250 197C300 190 345 184 400 190V240H320C300 222 280 206 250 197Z" fill={dim(c, C.sandDark)} opacity={0.4} />
      <Path d="M0 224C100 212 200 214 300 224S380 220 400 222V240H0Z" fill={dim(c, '#D29E5E')} />
      <G stroke={dim(c, C.sandDark)} strokeWidth={1.3} fill="none" opacity={0.45} strokeLinecap="round">
        <Path d="M40 212q14-4 28 0M90 208q16-5 32 0M60 230q18-5 36 0M170 230q14-4 28 0M300 232q16-4 32 0" />
      </G>
    </>
  )),

  'desert-flat': art(W, H, (c) => (
    <>
      <Path d="M30 168V150Q32 142 42 140H86Q96 142 98 150V168Z" fill={dim(c, '#C9997A', 0.5)} />
      <Path d="M300 168V146Q303 136 314 134H346Q356 136 358 146V168Z" fill={dim(c, '#C9997A', 0.5)} />
      <Path d="M340 168V156Q342 150 350 150H372Q380 151 382 158V168Z" fill={dim(c, '#BD8C6E', 0.5)} />
      <Path d="M0 166C120 160 280 160 400 164V240H0Z" fill={dim(c, C.sand)} />
      <Path d="M0 186C120 180 280 182 400 186V240H0Z" fill={dim(c, C.sandDeep)} opacity={0.7} />
      <Path d="M0 214C120 208 280 210 400 214V240H0Z" fill={dim(c, '#D6A566')} />
      {[[60, 196, 5], [140, 222, 7], [250, 200, 4], [330, 226, 6], [210, 232, 4]].map(([x, y, r], i) => (
        <Ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.55} fill={dim(c, C.stone)} />
      ))}
    </>
  )),

  sea: art(W, H, (c) => (
    <>
      <Defs>
        <Lin id={c.id('w')} stops={[[0, dim(c, C.waterLight, 0.45)], [0.3, dim(c, C.water, 0.45)], [1, dim(c, C.waterDark, 0.45)]]} />
      </Defs>
      <Rect x={0} y={140} width={W} height={100} fill={c.url('w')} />
      <Rect x={0} y={139} width={W} height={2.5} fill={C.white} opacity={c.dark ? 0.25 : 0.55} />
      <Ripples
        c={c}
        opacity={0.5}
        rows={[[30, 152, 26], [110, 150, 18], [220, 154, 30], [320, 151, 22], [60, 170, 34], [170, 174, 26], [280, 168, 40], [20, 196, 40], [140, 200, 30], [250, 194, 46], [350, 202, 30], [80, 224, 50], [210, 228, 40], [320, 222, 56]]}
      />
    </>
  )),

  'sea-storm': art(W, H, (c) => (
    <>
      <Defs>
        <Lin id={c.id('w')} stops={[[0, dim(c, '#3E6A86', 0.4)], [1, dim(c, '#16324A', 0.4)]]} />
      </Defs>
      <Path d="M0 136C30 124 50 132 70 138S110 120 140 128 180 142 210 132 260 118 290 130 340 140 370 126 400 132V240H0Z" fill={c.url('w')} />
      <Path d="M0 170C40 150 70 158 100 168S150 150 190 160 240 176 280 160 330 148 370 164 400 160 400 160V240H0Z" fill={dim(c, '#2B5675', 0.4)} />
      <Path d="M0 170C40 150 70 158 100 168S150 150 190 160 240 176 280 160 330 148 370 164" stroke={C.white} strokeWidth={2.4} fill="none" opacity={0.5} strokeLinecap="round" />
      <Path d="M0 206C50 186 90 196 130 204S200 186 250 196 320 214 360 198 400 196 400 196V240H0Z" fill={dim(c, '#1F4560', 0.4)} />
      <Path d="M0 206C50 186 90 196 130 204S200 186 250 196 320 214 360 198" stroke={C.white} strokeWidth={2.8} fill="none" opacity={0.55} strokeLinecap="round" />
      <G fill={C.white} opacity={0.6}>
        <Circle cx={96} cy={166} r={2.4} />
        <Circle cx={104} cy={163} r={1.6} />
        <Circle cx={252} cy={194} r={2.6} />
        <Circle cx={262} cy={191} r={1.6} />
        <Circle cx={364} cy={162} r={2} />
      </G>
    </>
  )),

  underwater: art(W, H, (c) => (
    <>
      <Defs>
        <Lin id={c.id('w')} stops={[[0, '#14608A'], [0.45, '#0B3E63'], [1, '#061D35']]} />
        <Lin id={c.id('ray')} stops={[[0, '#BFE6F7', 0.35], [1, '#BFE6F7', 0]]} />
      </Defs>
      <Rect x={0} y={0} width={W} height={H} fill={c.url('w')} />
      <Path d="M60 0H96L150 240H40Z" fill={c.url('ray')} opacity={0.5} />
      <Path d="M170 0H190L240 200H170Z" fill={c.url('ray')} opacity={0.35} />
      <Path d="M280 0H330L360 240H250Z" fill={c.url('ray')} opacity={0.4} />
      <Path d="M0 214C60 204 120 210 190 216S320 204 400 210V240H0Z" fill="#20384C" />
      <Path d="M0 226C80 220 170 224 250 230S360 224 400 226V240H0Z" fill="#172B3C" />
      <Boulder c={{ ...c, dark: false }} x={60} y={222} w={70} h={30} color="#2D4A60" shade="#1A3044" light="#4A6B84" />
      <Boulder c={{ ...c, dark: false }} x={340} y={218} w={90} h={36} color="#2D4A60" shade="#1A3044" light="#4A6B84" />
      {[[30, 220, 70], [44, 222, 52], [110, 218, 46], [300, 214, 60], [318, 216, 82], [372, 216, 54]].map(([x, y, h], i) => (
        <Path key={i} d={smoothOpen([[x, y], [x + 6, y - h * 0.3], [x - 4, y - h * 0.6], [x + 5, y - h]])} stroke={i % 2 ? '#2F7A6A' : '#3E9478'} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.85} />
      ))}
      <G fill="#C8643B" opacity={0.75}>
        <Circle cx={150} cy={214} r={4} />
        <Circle cx={158} cy={210} r={3} />
        <Circle cx={250} cy={220} r={3.5} />
      </G>
    </>
  )),

  mountains: art(W, H, (c) => (
    <>
      <Path d="M0 150L40 118L70 132L110 96L150 128L190 104L230 132L270 92L320 126L360 106L400 128V240H0Z" fill={dim(c, '#B9A6B4', 0.5)} opacity={0.85} />
      <Path d="M0 170L50 128L90 150L140 108L200 156L250 120L300 150L350 112L400 146V240H0Z" fill={dim(c, '#A9816A')} />
      <Path d="M140 108L158 126L150 134L170 140L200 156L180 156L160 140L146 138Z M350 112L366 128L358 136L376 140L400 146V156L372 146L356 140Z M50 128L64 142L58 148L74 150L90 150L70 156L56 148Z" fill={dim(c, '#8C6652')} opacity={0.75} />
      <Path d="M0 190C80 176 160 180 240 186S350 178 400 182V240H0Z" fill={dim(c, '#D2AD7C')} />
      <Path d="M0 214C100 204 200 208 300 216S380 210 400 212V240H0Z" fill={dim(c, '#C49866')} />
    </>
  )),

  hills: art(W, H, (c) => (
    <>
      <Path d="M0 160C60 140 120 138 180 152S300 132 400 148V240H0Z" fill={c.green(dim(c, '#9CC79A', 0.45))} />
      <Path d="M0 186C80 164 150 166 230 182S350 166 400 174V240H0Z" fill={c.green(dim(c, '#7DB574'))} />
      <LeafyTree c={c} x={300} y={178} s={0.42} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
      <LeafyTree c={c} x={330} y={182} s={0.32} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
      <LeafyTree c={c} x={70} y={176} s={0.36} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
      <Path d="M0 210C90 196 180 198 270 208S370 202 400 204V240H0Z" fill={c.green(dim(c, '#68A863'))} />
      {[[30, 226, 1], [110, 236, 1.2], [200, 222, 0.9], [290, 234, 1.1], [370, 224, 1]].map(([x, y, s], i) => (
        <Tuft key={i} x={x} y={y} s={s} color={c.green(dim(c, C.leafDark))} />
      ))}
    </>
  )),

  valley: art(W, H, (c) => (
    <>
      <Path d="M0 60C30 70 60 96 90 120S140 170 170 196L170 240H0Z" fill={dim(c, '#8E6A5A')} />
      <Path d="M0 90C30 100 60 120 86 140S126 180 150 206L150 240H0Z" fill={dim(c, '#A07C68')} />
      <Path d="M30 104C50 116 66 132 80 150M14 140C34 150 50 166 62 184" stroke={dim(c, '#7A5A4C')} strokeWidth={2.4} fill="none" opacity={0.6} strokeLinecap="round" />
      <Path d="M400 50C370 64 336 90 306 118S258 168 232 196L232 240H400Z" fill={dim(c, '#84624F')} />
      <Path d="M400 86C372 98 344 118 318 140S278 180 254 206L254 240H400Z" fill={dim(c, '#9A7660')} />
      <Path d="M370 100C350 112 334 128 320 146M386 136C366 146 350 162 338 180" stroke={dim(c, '#6E5040')} strokeWidth={2.4} fill="none" opacity={0.6} strokeLinecap="round" />
      <Path d="M120 210C170 196 230 196 290 210L300 240H110Z" fill={dim(c, C.sand)} />
      <Path d="M0 226C100 214 300 214 400 226V240H0Z" fill={dim(c, C.sandDeep)} />
      <Path d="M200 240C204 228 196 218 204 206" stroke={dim(c, C.sandLight)} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.7} />
      <Boulder c={c} x={120} y={230} w={26} h={12} color={C.stone} />
      <Boulder c={c} x={290} y={232} w={30} h={13} color={C.stone} />
    </>
  )),

  nile: art(W, H, (c) => (
    <>
      <Path d="M0 150C80 144 160 146 240 150S360 144 400 148V170H0Z" fill={c.green(dim(c, '#8EBF73'))} />
      <Palm c={c} x={60} y={156} h={46} lean={-4} dark={c.dark} />
      <Palm c={c} x={84} y={158} h={34} lean={5} dark={c.dark} />
      <Palm c={c} x={330} y={154} h={50} lean={6} dark={c.dark} />
      <Palm c={c} x={300} y={157} h={32} lean={-3} dark={c.dark} />
      <Defs>
        <Lin id={c.id('r')} stops={[[0, dim(c, C.waterLight)], [1, dim(c, C.waterDeep)]]} />
      </Defs>
      <Path d="M0 166C100 160 300 160 400 166V210C300 204 100 206 0 212Z" fill={c.url('r')} />
      <Ripples c={c} opacity={0.55} rows={[[40, 176, 30], [140, 182, 22], [250, 174, 34], [340, 186, 26], [90, 198, 40], [210, 196, 30], [310, 200, 24]]} />
      <Path d="M0 208C100 202 300 200 400 206V240H0Z" fill={c.green(dim(c, '#79B06A'))} />
      <Path d="M0 222C100 216 300 216 400 222V240H0Z" fill={c.green(dim(c, '#5F9A58'))} />
      {[20, 34, 46, 360, 372, 386].map((x, i) => (
        <G key={x}>
          <Path d={`M${x} 226Q${x + (i % 2 ? 3 : -3)} 200 ${x + (i % 2 ? 6 : -4)} ${184 + (i % 3) * 4}`} stroke={c.green(dim(c, C.leafDark))} strokeWidth={2} fill="none" />
          <Path d={`M${x + (i % 2 ? 6 : -4)} ${184 + (i % 3) * 4}l-6 -6M${x + (i % 2 ? 6 : -4)} ${184 + (i % 3) * 4}l6 -6M${x + (i % 2 ? 6 : -4)} ${184 + (i % 3) * 4}l0 -8`} stroke={c.green(dim(c, C.leaf))} strokeWidth={1.6} strokeLinecap="round" />
        </G>
      ))}
    </>
  )),

  'city-ancient': art(W, H, (c) => {
    const wall = dim(c, C.sandLight);
    const shade = dim(c, C.sandDeep);
    const dark = dim(c, C.woodDark, 0.2);
    const lit = c.dark ? C.goldLight : dark;
    return (
      <>
        <G fill={dim(c, '#D9BC94', 0.5)}>
          <Rect x={110} y={120} width={40} height={60} />
          <Rect x={150} y={108} width={30} height={72} />
          <Rect x={226} y={114} width={46} height={66} />
          <Rect x={272} y={128} width={30} height={52} />
        </G>
        <Rect x={170} y={92} width={60} height={88} fill={dim(c, '#E2C9A2', 0.45)} />
        <Rect x={166} y={88} width={68} height={6} fill={dim(c, '#CFAE80', 0.45)} />
        {[178, 192, 206, 220].map((x) => (
          <Rect key={x} x={x - 2} y={100} width={5} height={78} fill={dim(c, '#CFAE80', 0.45)} />
        ))}
        <Path d="M30 200V160H370V200Z" fill={wall} />
        <Path d={`M30 160${Array.from({ length: 34 }, () => `h5v-6h5v6`).join('')}`} fill={wall} />
        <Rect x={30} y={186} width={340} height={14} fill={shade} opacity={0.5} />
        <Rect x={40} y={136} width={34} height={64} fill={wall} />
        <Path d={`M40 136h6v-6h5v6h6v-6h5v6h6v-6h6v6`} fill={wall} />
        <Rect x={64} y={136} width={10} height={64} fill={shade} opacity={0.5} />
        <Rect x={326} y={136} width={34} height={64} fill={wall} />
        <Path d={`M326 136h6v-6h5v6h6v-6h5v6h6v-6h6v6`} fill={wall} />
        <Rect x={350} y={136} width={10} height={64} fill={shade} opacity={0.5} />
        <Rect x={176} y={144} width={48} height={56} fill={wall} />
        <Rect x={176} y={140} width={48} height={6} fill={shade} />
        <Path d={archPath(200, 156, 24, 200)} fill={dark} />
        {[[54, 150], [338, 150], [100, 172], [140, 174], [260, 172], [300, 174]].map(([x, y], i) => (
          <Path key={i} d={archPath(x, y, 6, y + 9)} fill={lit} opacity={c.dark ? 0.85 : 0.7} />
        ))}
        <Palm c={c} x={16} y={204} h={60} lean={4} dark={c.dark} />
        <Palm c={c} x={388} y={204} h={52} lean={-5} dark={c.dark} />
        <Path d="M0 198C120 194 280 194 400 198V240H0Z" fill={dim(c, C.sand)} />
        <Path d="M0 220C120 214 280 214 400 220V240H0Z" fill={dim(c, C.sandDeep)} />
        <Path d="M190 240C192 226 196 212 200 200H206C206 214 210 228 214 240Z" fill={dim(c, C.sandLight)} opacity={0.7} />
      </>
    );
  }),

  ruins: art(W, H, (c) => {
    const st = dim(c, '#CDB89C');
    const sh = dim(c, '#A8916F');
    return (
      <>
        <Path d="M0 180C120 172 280 172 400 180V240H0Z" fill={dim(c, C.sand)} />
        <Path d="M60 186V128L70 120 78 130 86 122V186Z" fill={st} />
        <Rect x={78} y={124} width={8} height={62} fill={sh} opacity={0.6} />
        <Path d="M120 186V150L132 142 138 156 146 148 150 186Z" fill={st} />
        <Path d="M190 186V114H246V186H234V146Q218 128 202 146V186Z" fill={st} />
        <Path d="M234 186V146Q236 140 240 136V186Z M240 114H246V186H240Z" fill={sh} opacity={0.55} />
        <Path d="M188 114H248L244 106H192Z" fill={sh} />
        <Path d="M190 114L196 104 204 112 210 102 220 112 232 100 240 110 248 104V114Z" fill={st} />
        <Path d="M290 186V136L300 130 306 140 312 132V186Z" fill={st} />
        <Rect x={304} y={134} width={8} height={52} fill={sh} opacity={0.6} />
        <G>
          <Rect x={318} y={176} width={40} height={11} rx={5} fill={st} />
          <Ellipse cx={358} cy={181.5} rx={4} ry={5.5} fill={sh} />
          <Rect x={150} y={190} width={26} height={9} rx={2} fill={st} />
          <Rect x={262} y={188} width={18} height={10} rx={2} fill={sh} />
          <Rect x={96} y={196} width={14} height={8} rx={2} fill={st} />
        </G>
        <Path d="M0 200C80 192 160 196 240 204S360 196 400 200V240H0Z" fill={dim(c, C.sandDeep)} />
        <Path d="M40 200C70 192 100 190 140 198" stroke={dim(c, C.sandLight)} strokeWidth={3} fill="none" opacity={0.6} strokeLinecap="round" />
        <Path d="M0 226C100 218 300 218 400 228V240H0Z" fill={dim(c, '#D09C5E')} />
      </>
    );
  }),

  'rock-dwellings': art(W, H, (c) => {
    const rock = dim(c, '#C98A5E');
    const rockShade = dim(c, '#A86A44');
    const face = dim(c, '#D9A274');
    const door = dim(c, '#5A3524', 0.2);
    const facade = (x: number, base: number, w: number, h: number, k: string) => (
      <G key={k}>
        <Rect x={x - w / 2} y={base - h} width={w} height={h} fill={face} />
        <Path d={`M${x - w / 2} ${base - h}h${w * 0.18}v-${w * 0.1}h${w * 0.14}v-${w * 0.1}h${w * 0.36}v${w * 0.1}h${w * 0.14}v${w * 0.1}h${w * 0.18}Z`} fill={face} />
        <Rect x={x - w / 2} y={base - h + h * 0.18} width={w} height={2} fill={rockShade} opacity={0.6} />
        <Rect x={x - w * 0.16} y={base - h * 0.55} width={w * 0.32} height={h * 0.55} fill={door} />
        <Path d={`M${x - w * 0.22} ${base - h * 0.55}h${w * 0.44}l-${w * 0.06} -${h * 0.08}h-${w * 0.32}Z`} fill={rockShade} />
      </G>
    );
    return (
      <>
        <Path d="M0 190V120C20 96 50 84 80 90S120 70 150 80 180 104 190 130V190Z" fill={rock} />
        <Path d="M150 80C170 88 184 106 190 130V190H168C172 150 166 110 150 80Z" fill={rockShade} opacity={0.6} />
        <Path d="M210 190V110C230 84 270 72 300 82S350 70 380 86 400 110 400 120V190Z" fill={rock} />
        <Path d="M380 86C392 96 400 108 400 120V190H382C388 150 388 116 380 86Z" fill={rockShade} opacity={0.6} />
        <Path d="M30 110C40 104 50 102 60 104M250 96C262 90 274 88 288 92M330 92C344 86 356 88 366 94" stroke={rockShade} strokeWidth={2.2} fill="none" opacity={0.6} strokeLinecap="round" />
        {facade(60, 190, 44, 62, 'a')}
        {facade(140, 190, 30, 44, 'b')}
        {facade(270, 190, 50, 72, 'c')}
        {facade(350, 190, 34, 50, 'd')}
        <Path d="M0 186C120 180 280 180 400 186V240H0Z" fill={dim(c, C.sand)} />
        <Path d="M0 212C120 206 280 206 400 214V240H0Z" fill={dim(c, C.sandDeep)} />
        <Boulder c={c} x={200} y={196} w={34} h={14} color="#C98A5E" shade="#A86A44" light="#E0A67A" />
      </>
    );
  }),

  'dead-sea': art(W, H, (c) => (
    <>
      <Path d="M0 140C40 120 80 126 120 118S190 128 230 116 320 120 360 110 400 120 400 120V160H0Z" fill={dim(c, '#C79F8E', 0.45)} />
      <Path d="M0 132C30 128 60 134 80 130M200 124C230 120 260 124 280 120" stroke={dim(c, '#B08676', 0.45)} strokeWidth={2} fill="none" opacity={0.7} />
      <Defs>
        <Lin id={c.id('s')} stops={[[0, dim(c, '#8FD3CF')], [1, dim(c, '#4FAFAE')]]} />
      </Defs>
      <Path d="M0 156C120 150 280 150 400 156V196C300 190 120 192 0 198Z" fill={c.url('s')} />
      <Ripples c={c} opacity={0.45} rows={[[40, 164, 30], [160, 168, 24], [280, 162, 36], [100, 182, 30], [230, 184, 40], [340, 178, 24]]} />
      <Path d="M0 196C120 190 300 188 400 194V240H0Z" fill={dim(c, '#EDE6D6')} />
      <Path d="M0 196C120 190 300 188 400 194" stroke={C.white} strokeWidth={3} fill="none" opacity={0.85} />
      <G fill={dim(c, C.white)} opacity={0.8}>
        <Ellipse cx={70} cy={214} rx={18} ry={3} />
        <Ellipse cx={180} cy={224} rx={26} ry={3.5} />
        <Ellipse cx={310} cy={212} rx={20} ry={3} />
      </G>
      <Path d="M0 226C120 220 280 222 400 228V240H0Z" fill={dim(c, '#D9CDB4')} />
    </>
  )),

  'olive-grove': art(W, H, (c) => {
    const olive = { leaf: dim(c, C.olive), leafDark: dim(c, C.oliveDark), leafLight: dim(c, '#9DB57A') };
    return (
      <>
        <Path d="M0 150C80 140 160 142 240 148S360 140 400 146V240H0Z" fill={c.green(dim(c, '#B5C493', 0.45))} />
        <Path d="M0 174C90 164 190 166 280 174S370 168 400 170V240H0Z" fill={c.green(dim(c, '#A3B87E'))} />
        <Path d="M0 174C90 164 190 166 280 174S370 168 400 170" stroke={dim(c, C.stoneLight)} strokeWidth={3} fill="none" opacity={0.8} />
        {[[60, 172, 0.36], [150, 168, 0.32], [250, 172, 0.36], [340, 170, 0.32]].map(([x, y, s], i) => (
          <LeafyTree key={i} c={c} x={x} y={y} s={s} trunk={dim(c, C.woodLight)} {...olive} fruit={dim(c, '#5B4A6E')} fruitR={2.6} />
        ))}
        <Path d="M0 204C100 194 200 196 300 204S380 200 400 202V240H0Z" fill={c.green(dim(c, '#93AE70'))} />
        <Path d="M0 204C100 194 200 196 300 204S380 200 400 202" stroke={dim(c, C.stoneLight)} strokeWidth={3.5} fill="none" opacity={0.8} />
        {[[100, 206, 0.5], [300, 208, 0.46]].map(([x, y, s], i) => (
          <LeafyTree key={`f${i}`} c={c} x={x} y={y} s={s} trunk={dim(c, C.woodLight)} {...olive} fruit={dim(c, '#5B4A6E')} fruitR={2.6} />
        ))}
        <Path d="M0 228C100 222 300 222 400 228V240H0Z" fill={c.green(dim(c, '#7E9A5C'))} />
      </>
    );
  }),

  garden: art(W, H, (c) => (
    <>
      <Path d="M0 156C70 140 140 140 210 150S340 136 400 146V240H0Z" fill={c.green(dim(c, '#A9D39B', 0.45))} />
      <LeafyTree c={c} x={60} y={168} s={0.6} fruit={dim(c, C.terracotta)} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
      <LeafyTree c={c} x={340} y={166} s={0.66} fruit={dim(c, C.gold)} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
      <Palm c={c} x={290} y={170} h={74} lean={-6} dates dark={c.dark} />
      <Palm c={c} x={110} y={170} h={60} lean={5} dark={c.dark} />
      <Path d="M0 182C80 168 160 170 240 180S360 168 400 174V240H0Z" fill={c.green(dim(c, '#8CC77A'))} />
      <Defs>
        <Lin id={c.id('r')} stops={[[0, dim(c, C.waterLight)], [1, dim(c, C.water)]]} />
      </Defs>
      <Path d="M150 182C170 196 150 210 170 224S220 236 230 240H280C262 232 236 222 222 208S214 186 196 180Z" fill={c.url('r')} />
      <Path d="M168 196C176 202 172 208 178 214M204 222C214 228 226 232 236 234" stroke={C.white} strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.7} />
      <Path d="M0 214C80 206 140 208 170 214M250 216C300 208 360 208 400 212V240H270C262 230 254 222 250 216Z M0 214V240H160C160 230 164 222 170 214Z" fill={c.green(dim(c, '#76B568'))} />
      {[[30, 222, C.pink], [60, 232, C.white], [96, 220, C.lemon], [124, 234, C.pink], [300, 226, C.white], [330, 234, C.pink], [362, 222, C.lemon], [384, 232, C.white]].map(([x, y, col], i) => (
        <G key={i}>
          <Circle cx={x as number} cy={y as number} r={3.4} fill={dim(c, col as string, 0.25)} />
          <Circle cx={x as number} cy={y as number} r={1.3} fill={C.gold} />
        </G>
      ))}
    </>
  )),

  'cave-mouth': art(W, H, (c) => (
    <>
      <Path d="M0 240V130C30 96 70 70 120 62S220 50 270 66 360 100 400 126V240Z" fill={dim(c, '#8C7A6B')} />
      <Path d="M270 66C320 80 370 104 400 126V240H330C340 180 320 110 270 66Z" fill={dim(c, '#6F5F53')} opacity={0.6} />
      <Path d="M60 110C90 92 120 84 150 82M290 96C320 104 344 116 362 130M40 160C60 150 80 146 100 146" stroke={dim(c, '#6F5F53')} strokeWidth={2.4} fill="none" opacity={0.6} strokeLinecap="round" />
      <Defs>
        <Rad id={c.id('in')} stops={[[0, '#02020A'], [0.7, '#0B0A1A'], [1, '#2A2230']]} cy={0.75} r={0.7} />
      </Defs>
      <Path d="M140 240C140 180 160 128 200 124S262 176 262 240Z" fill={c.url('in')} />
      <Path d="M140 240C140 180 160 128 200 124S262 176 262 240" stroke={dim(c, '#5A4C42')} strokeWidth={5} fill="none" />
      <Boulder c={c} x={110} y={240} w={70} h={28} color="#9C8B78" />
      <Boulder c={c} x={300} y={240} w={80} h={32} color="#9C8B78" />
      <Path d="M60 236C64 222 70 214 80 210M74 236C76 226 84 218 92 216" stroke={c.green(dim(c, C.oliveDark))} strokeWidth={2} fill="none" strokeLinecap="round" />
    </>
  )),

  'night-horizon': art(W, H, (c) => (
    <>
      <Glow c={c} k="h" cx={200} cy={196} r={220} color={c.dark ? '#5B4F9E' : C.goldPale} opacity={0.45} />
      <Path d="M0 186C50 174 100 172 150 180S260 168 320 176 380 182 400 178V240H0Z" fill={c.dark ? '#262A63' : '#7C7AA8'} />
      <Path d="M0 206C70 196 150 198 230 206S350 198 400 202V240H0Z" fill={c.dark ? '#1A1E47' : '#5F5D8C'} />
      <Path d="M0 226C100 218 300 220 400 226V240H0Z" fill={c.dark ? '#121535' : '#4A4874'} />
    </>
  )),

  shore: art(W, H, (c) => (
    <>
      <Defs>
        <Lin id={c.id('w')} stops={[[0, dim(c, C.waterLight, 0.45)], [1, dim(c, C.waterDeep, 0.45)]]} />
      </Defs>
      <Rect x={0} y={150} width={W} height={90} fill={c.url('w')} />
      <Rect x={0} y={149} width={W} height={2} fill={C.white} opacity={c.dark ? 0.25 : 0.55} />
      <Ripples c={c} rows={[[20, 162, 24], [90, 170, 30], [30, 190, 40], [130, 186, 22]]} />
      <Path d="M150 240C180 214 250 196 400 186V240Z" fill={dim(c, C.sandLight)} />
      <Path d="M150 240C180 214 250 196 400 186" stroke={C.white} strokeWidth={4} fill="none" opacity={0.75} />
      <Path d="M230 240C260 222 320 212 400 208V240Z" fill={dim(c, C.sand)} />
      <Boulder c={c} x={360} y={214} w={44} h={20} />
      <G fill={dim(c, C.pinkPale)} opacity={0.9}>
        <Path d="M280 226a5 4 0 0 1 10 0Z" />
        <Path d="M318 232a4 3 0 0 1 8 0Z" />
      </G>
    </>
  )),

  'columns-hall': art(W, H, (c) => {
    const st = dim(c, '#E6D5B8');
    const sh = dim(c, '#C9B28C');
    const cols = [40, 110, 180, 250, 320, 390].map((x) => x - 15);
    return (
      <>
        <Rect x={0} y={40} width={W} height={26} fill={st} />
        <Rect x={0} y={60} width={W} height={6} fill={sh} />
        <Rect x={0} y={40} width={W} height={4} fill={sh} opacity={0.7} />
        {cols.map((x) => (
          <G key={x}>
            <Path d={`M${x - 14} 66H${x + 14}L${x + 10} 80H${x - 10}Z`} fill={sh} />
            <Path d={`M${x - 16} 66C${x - 14} 58 ${x - 6} 56 ${x} 60C${x + 6} 56 ${x + 14} 58 ${x + 16} 66Z`} fill={dim(c, C.gold, 0.5)} opacity={0.75} />
            <Rect x={x - 10} y={80} width={20} height={130} fill={st} />
            <Rect x={x + 3} y={80} width={7} height={130} fill={sh} opacity={0.6} />
            <Path d={`M${x - 6} 90V200M${x - 1} 90V200`} stroke={sh} strokeWidth={1} opacity={0.5} />
            <Rect x={x - 14} y={206} width={28} height={8} fill={sh} />
          </G>
        ))}
        <Rect x={0} y={212} width={W} height={28} fill={dim(c, '#D9C7A6')} />
        <Path d="M0 222H400" stroke={sh} strokeWidth={1.5} opacity={0.6} />
        <Path d="M60 212L20 240M160 212L150 240M240 212L250 240M340 212L380 240" stroke={sh} strokeWidth={1.2} opacity={0.45} />
      </>
    );
  }),

  // ---------- sky (anchor: center) ----------

  'moon-crescent': art(100, 100, (c) => (
    <>
      <Glow c={c} k="g" cx={50} cy={50} r={48} color={C.goldPale} opacity={0.45} />
      <Path d={crescentPath(50, 50, 24, 12, -8, 21)} fill={C.goldLight} />
      <Path d={crescentPath(50, 50, 24, 12, -8, 21)} fill="none" stroke={C.goldPale} strokeWidth={1.2} opacity={0.8} />
    </>
  )),

  'moon-full': art(100, 100, (c) => (
    <>
      <Glow c={c} k="g" cx={50} cy={50} r={48} color="#FFF3C4" opacity={0.45} />
      <Circle cx={50} cy={50} r={22} fill="#FFF3C4" />
      <Circle cx={43} cy={44} r={4.5} fill="#EBDDA6" />
      <Circle cx={57} cy={56} r={3.4} fill="#EBDDA6" />
      <Circle cx={54} cy={41} r={2.2} fill="#EBDDA6" />
      <Circle cx={44} cy={58} r={2} fill="#EBDDA6" />
    </>
  )),

  sun: art(120, 120, (c) => (
    <>
      <Glow c={c} k="g" cx={60} cy={60} r={58} color={C.goldPale} opacity={0.75} />
      <Defs>
        <Rad id={c.id('d')} stops={[[0, '#FFF3C4'], [0.7, C.goldLight], [1, C.gold]]} />
      </Defs>
      <Circle cx={60} cy={60} r={24} fill={c.url('d')} />
    </>
  )),

  'rain-clouds': art(400, 110, (c) => {
    const top = c.dark ? '#4A5266' : '#8C97A8';
    const under = c.dark ? '#2E3444' : '#6B7688';
    const blob = (x: number, y: number, r: number, k: number) => (
      <G key={k}>
        <Ellipse cx={x} cy={y + r * 0.35} rx={r * 1.5} ry={r * 0.55} fill={under} />
        <Circle cx={x - r * 0.6} cy={y} r={r * 0.62} fill={top} />
        <Circle cx={x + r * 0.1} cy={y - r * 0.25} r={r * 0.8} fill={top} />
        <Circle cx={x + r * 0.8} cy={y + r * 0.05} r={r * 0.58} fill={top} />
        <Ellipse cx={x} cy={y + r * 0.3} rx={r * 1.35} ry={r * 0.35} fill={under} opacity={0.8} />
      </G>
    );
    return (
      <>
        <Rect x={0} y={0} width={400} height={40} fill={under} />
        {blob(40, 42, 40, 1)}
        {blob(130, 50, 46, 2)}
        {blob(230, 40, 42, 3)}
        {blob(330, 52, 48, 4)}
        {blob(400, 36, 36, 5)}
        {blob(0, 60, 30, 6)}
      </>
    );
  }),

  cloud: art(140, 70, () => (
    <>
      <Cloud x={70} y={44} r={34} color={C.white} shadeColor="#DCE8F2" />
    </>
  )),

  // ---------- props and foreground ----------

  palms: art(220, 170, (c) => (
    <>
      <Shadow c={c} cx={110} cy={164} rx={90} ry={7} />
      <Palm c={c} x={70} y={164} h={120} lean={-12} dates />
      <Palm c={c} x={140} y={166} h={96} lean={10} />
      <Palm c={c} x={108} y={166} h={70} lean={2} />
      <Path d="M40 166C44 154 54 150 64 152 70 146 82 146 88 154 96 152 104 158 104 166Z" fill={c.green(C.leafDark)} />
      <Path d="M150 166C152 158 160 154 168 156 174 150 184 152 188 160 194 160 198 164 198 166Z" fill={c.green(C.leaf)} />
    </>
  )),

  reeds: art(120, 100, (c) => (
    <>
      {[[20, -8], [32, 4], [44, -4], [58, 6], [70, -6], [84, 3], [98, -2]].map(([x, lean], i) => (
        <Path key={i} d={`M${x} 100Q${x + lean * 0.4} 60 ${x + lean} ${22 + (i % 3) * 8}`} stroke={c.green(i % 2 ? C.leafDark : C.olive)} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      ))}
      {[[24, 26], [52, 30], [90, 24]].map(([x, y], i) => (
        <Ellipse key={i} cx={x} cy={y} rx={2.8} ry={9} fill={C.woodLight} />
      ))}
      {[[38, 30], [76, 22]].map(([x, y], i) => (
        <G key={`u${i}`} stroke={c.green(C.leaf)} strokeWidth={1.6} strokeLinecap="round">
          <Path d={`M${x} ${y}l-10 -8M${x} ${y}l-6 -11M${x} ${y}l0 -12M${x} ${y}l6 -11M${x} ${y}l10 -8`} />
        </G>
      ))}
      <Path d="M10 100C20 86 40 82 60 88S100 84 112 100Z" fill={c.green(C.leafDark)} opacity={0.85} />
    </>
  )),

  rocks: art(160, 60, (c) => (
    <>
      <Shadow c={c} cx={80} cy={56} rx={72} ry={5} />
      <Boulder c={c} x={52} y={56} w={70} h={40} />
      <Boulder c={c} x={112} y={56} w={56} h={30} color={C.stoneLight} shade={C.stone} light={C.stonePale} />
      <Boulder c={c} x={82} y={58} w={34} h={18} color={C.stoneDark} shade={C.granite} />
    </>
  )),

  grass: art(400, 60, (c) => (
    <>
      <Path d="M0 40C80 32 160 34 240 40S360 34 400 38V60H0Z" fill={c.green(dim(c, '#76B568'))} />
      {Array.from({ length: 16 }, (_, i) => (
        <Tuft key={i} x={12 + i * 25 + (i % 3) * 4} y={48 + (i % 2) * 6} s={0.9 + (i % 3) * 0.2} color={c.green(dim(c, i % 2 ? C.leafDark : C.leaf))} />
      ))}
      {[[40, 44, C.pink], [130, 50, C.white], [210, 46, C.lemon], [300, 52, C.pink], [370, 44, C.white]].map(([x, y, col], i) => (
        <G key={`f${i}`}>
          <Circle cx={x as number} cy={y as number} r={3.2} fill={dim(c, col as string, 0.25)} />
          <Circle cx={x as number} cy={y as number} r={1.2} fill={C.gold} />
        </G>
      ))}
    </>
  )),

  lamp: art(100, 80, (c) => (
    <>
      <Glow c={c} k="g" cx={70} cy={30} r={30} color={C.goldPale} opacity={0.8} />
      <Path d="M68 40C62 32 64 22 70 12 76 22 78 32 72 40Z" fill={C.orange} />
      <Path d="M69 40C66 34 67 28 70 22 73 28 74 34 71 40Z" fill={C.goldPale} />
      <Path d="M12 52C12 44 30 40 50 40H78C86 40 90 44 88 48L80 56C70 64 30 66 18 60Z" fill={C.clay} />
      <Path d="M18 60C30 66 70 64 80 56L84 52C80 60 66 68 50 70 32 70 20 66 18 60Z" fill={C.terracotta} opacity={0.8} />
      <Path d="M12 52C6 50 4 44 8 40 12 38 16 42 16 46" stroke={C.clay} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Ellipse cx={46} cy={44} rx={12} ry={3} fill={C.woodDark} opacity={0.6} />
      <Ellipse cx={50} cy={74} rx={30} ry={4} fill={c.dark ? '#000000' : C.ink} opacity={0.15} />
      <Path d="M40 72H60L56 66H44Z" fill={C.clay} />
    </>
  )),

  lanterns: art(400, 110, (c) => (
    <>
      {[[50, 30], [130, 56], [200, 22], [270, 50], [350, 34]].map(([x, drop], i) => (
        <G key={i}>
          <Path d={`M${x} 0V${drop}`} stroke={C.goldDeep} strokeWidth={1.3} />
          <HangingLantern c={c} x={x} y={drop} s={1.05 - (i % 2) * 0.15} glass={i % 2 ? C.goldPale : '#FFF3C4'} />
        </G>
      ))}
    </>
  )),

  mihrab: art(200, 240, (c) => {
    const marble = c.dark ? '#D9D1C2' : C.marble;
    const tile = C.teal;
    return (
      <>
        <Rect x={10} y={20} width={180} height={220} fill={marble} />
        <Rect x={10} y={20} width={180} height={220} fill="none" stroke={C.goldDeep} strokeWidth={3} />
        <Rect x={18} y={28} width={164} height={212} fill="none" stroke={tile} strokeWidth={6} />
        {Array.from({ length: 9 }, (_, i) => (
          <Path key={`t${i}`} d={star8Path(28 + i * 18, 31, 4)} fill={C.gold} />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <G key={`s${i}`}>
            <Path d={star8Path(21, 50 + i * 18, 3.2)} fill={C.gold} />
            <Path d={star8Path(179, 50 + i * 18, 3.2)} fill={C.gold} />
          </G>
        ))}
        <Path d={archPath(100, 46, 128, 240)} fill={C.goldDeep} />
        <Path d={archPath(100, 52, 116, 240)} fill={tile} />
        <Defs>
          <Lin id={c.id('n')} stops={[[0, '#2B3166'], [1, '#14173A']]} />
        </Defs>
        <Path d={archPath(100, 60, 100, 240)} fill={c.url('n')} />
        {[0, 1, 2].map((r) => (
          <Path key={r} d={`M${62 + r * 6} ${108 + r * 10}Q100 ${84 + r * 14} ${138 - r * 6} ${108 + r * 10}`} stroke={C.goldLight} strokeWidth={1.4} fill="none" opacity={0.45} />
        ))}
        <Path d="M100 60V120" stroke={C.goldDeep} strokeWidth={1.2} />
        <HangingLantern c={{ ...c, dark: true }} x={100} y={120} s={1.2} />
        <Rect x={46} y={226} width={108} height={14} fill={C.goldDeep} opacity={0.5} />
      </>
    );
  }),

  'arch-frame': art(W, H, (c) => {
    const stone = c.dark ? '#2A2650' : '#C9AE88';
    const shade = c.dark ? '#1C1940' : '#A88E68';
    const opening = archPath(200, 26, 250, 240);
    return (
      <>
        <Path d={`M0 0H400V240H0Z${opening}`} fill={stone} fillRule="evenodd" />
        <Path d={opening} fill="none" stroke={shade} strokeWidth={10} />
        <Path d={archPath(200, 18, 266, 240)} fill="none" stroke={C.goldDeep} strokeWidth={2.5} opacity={0.7} />
        {Array.from({ length: 6 }, (_, i) => (
          <G key={i}>
            <Path d={star8Path(28, 30 + i * 38, 7)} fill={c.dark ? C.goldDeep : C.gold} opacity={0.8} />
            <Path d={star8Path(372, 30 + i * 38, 7)} fill={c.dark ? C.goldDeep : C.gold} opacity={0.8} />
          </G>
        ))}
        <Rect x={0} y={226} width={W} height={14} fill={shade} />
      </>
    );
  }),

  tents: art(220, 110, (c) => {
    const cloth = dim(c, '#4A3428', 0.2);
    const stripe = dim(c, '#7A5A44', 0.2);
    const tent = (x: number, w: number, h: number, k: string) => (
      <G key={k}>
        <Path d={`M${x - w / 2} 100L${x - w * 0.42} ${100 - h * 0.72}Q${x - w * 0.2} ${100 - h * 1.02} ${x} ${100 - h}Q${x + w * 0.2} ${100 - h * 1.02} ${x + w * 0.42} ${100 - h * 0.72}L${x + w / 2} 100Z`} fill={cloth} />
        <Path d={`M${x - w * 0.42} ${100 - h * 0.62}Q${x} ${100 - h * 0.9} ${x + w * 0.42} ${100 - h * 0.62}`} stroke={stripe} strokeWidth={3} fill="none" />
        <Path d={`M${x - w * 0.14} 100V${100 - h * 0.5}H${x + w * 0.14}V100Z`} fill={dim(c, '#1E140F', 0.1)} />
        <Path d={`M${x - w / 2} 100L${x - w * 0.62} 104M${x + w / 2} 100L${x + w * 0.62} 104`} stroke={stripe} strokeWidth={1.2} />
      </G>
    );
    return (
      <>
        <Shadow c={c} cx={110} cy={102} rx={104} ry={6} />
        {tent(60, 92, 56, 'a')}
        {tent(160, 110, 70, 'b')}
        <Path d="M104 102C104 96 112 92 118 96 122 90 130 92 130 98" stroke={c.dark ? C.goldLight : C.stoneDark} strokeWidth={1.4} fill="none" opacity={0.6} />
      </>
    );
  }),

  'mountain-peak': art(220, 180, (c) => (
    <>
      <Path d="M0 180L70 70Q86 46 104 30Q112 22 120 30Q140 52 160 84L220 180Z" fill={dim(c, '#9E7E6C')} />
      <Path d="M120 30Q140 52 160 84L220 180H130C140 140 134 80 120 30Z" fill={dim(c, '#7E604F')} opacity={0.75} />
      <Path d="M104 30Q112 22 120 30L128 44 118 40 110 50 102 42 94 48Z" fill={dim(c, '#C4A48E')} />
      <Path d="M60 110C76 104 90 106 100 112M40 150C60 142 80 142 96 148M150 120C162 128 172 140 180 152" stroke={dim(c, '#6E5244')} strokeWidth={2.4} fill="none" opacity={0.6} strokeLinecap="round" />
      <Path d="M0 180C40 166 80 164 120 170S190 164 220 172V180Z" fill={dim(c, '#B89478')} />
    </>
  )),
} satisfies Record<string, ArtDef>;
