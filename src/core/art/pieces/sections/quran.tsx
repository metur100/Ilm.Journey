import { Circle, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { art, Cloud, crescentPath, Glow, Lin, Mountain, Palm, Shadow, sparklePath, star8Path, starPath, type ArtDef, type Ctx } from '../../kit';
import { C, mix } from '../../palette';
import { animal } from '../animals';
import { garden } from '../garden';
import { object } from '../objects';
import { place } from '../places';

/**
 * Section art of the Quran games (docs/GAMES-V3.md). Landscapes, objects, animals and light only – no people.
 * Larger scenes reuse library pieces (the Kaaba, camels, the elephant, birds, fig and olive) through `Use`.
 */

/** Draws another art definition inside this piece at (x, y) with width w (own gradient ids per position). */
function Use({ c, def, x, y, w, flip }: { c: Ctx; def: ArtDef; x: number; y: number; w: number; flip?: boolean }) {
  const key = `u${Math.round(x)}_${Math.round(y)}_${Math.round(w)}`.replace(/-/g, 'm');
  const sub: Ctx = { ...c, id: (k) => c.id(`${key}${k}`), url: (k) => `url(#${c.id(`${key}${k}`)})` };
  const s = w / def.w;
  const transform = flip ? `translate(${x + w} ${y}) scale(${-s} ${s})` : `translate(${x} ${y}) scale(${s})`;
  return <G transform={transform}>{def.draw(sub)}</G>;
}

const nightSky = (c: Ctx): [number, string][] => (c.dark ? [[0, '#0B0E2A'], [0.7, '#1E2260'], [1, '#3A3580']] : [[0, '#14173A'], [0.65, '#2E3380'], [1, '#6E5AA8']]);

function Stars({ pts, color = C.white }: { pts: [number, number, number?][]; color?: string }) {
  return (
    <G>
      {pts.map(([x, y, r], i) => (
        <Circle key={i} cx={x} cy={y} r={r ?? (i % 3 === 0 ? 1.6 : 1)} fill={color} opacity={i % 2 ? 0.7 : 0.95} />
      ))}
    </G>
  );
}

/** An open mushaf (two pages with lines of text drawn as soft strokes, never letters). */
function OpenMushaf({ x, y, w, cover = C.teal }: { x: number; y: number; w: number; cover?: string }) {
  const h = w * 0.5;
  const m = x + w / 2;
  const lines = [0.28, 0.42, 0.56, 0.7];
  return (
    <G>
      <Path d={`M${x - 4} ${y + 6}Q${m} ${y + h * 0.22} ${x + w + 4} ${y + 6}V${y + h + 8}Q${m} ${y + h + 2} ${x - 4} ${y + h + 8}Z`} fill={cover} />
      <Path d={`M${x} ${y}Q${m - w * 0.22} ${y - 6} ${m} ${y + 6}V${y + h}Q${m - w * 0.22} ${y + h - 8} ${x} ${y + h - 2}Z`} fill={C.cream} />
      <Path d={`M${x + w} ${y}Q${m + w * 0.22} ${y - 6} ${m} ${y + 6}V${y + h}Q${m + w * 0.22} ${y + h - 8} ${x + w} ${y + h - 2}Z`} fill={C.ivory} />
      <Path d={`M${m} ${y + 6}V${y + h}`} stroke={C.sandDeep} strokeWidth={1.2} />
      {lines.map((t, i) => (
        <G key={i}>
          <Path d={`M${x + w * 0.08} ${y + h * t}Q${x + w * 0.25} ${y + h * t - 3} ${m - w * 0.06} ${y + h * t + 2}`} stroke={C.ink} strokeWidth={1.4} opacity={0.45} fill="none" strokeLinecap="round" strokeDasharray="5 3" />
          <Path d={`M${m + w * 0.06} ${y + h * t + 2}Q${x + w * 0.75} ${y + h * t - 3} ${x + w * 0.92} ${y + h * t}`} stroke={C.ink} strokeWidth={1.4} opacity={0.45} fill="none" strokeLinecap="round" strokeDasharray="6 2" />
        </G>
      ))}
      <Path d={`M${x + w * 0.04} ${y + 4}H${x + w * 0.2}M${x + w * 0.8} ${y + 4}H${x + w * 0.96}`} stroke={C.gold} strokeWidth={2} strokeLinecap="round" />
    </G>
  );
}

/** A wooden rahle (folding Quran stand). */
function Rahle({ x, y, w }: { x: number; y: number; w: number }) {
  const m = x + w / 2;
  return (
    <G>
      <Path d={`M${x} ${y + w * 0.62}L${m + 4} ${y}L${m + 12} ${y + 6}L${x + 10} ${y + w * 0.64}Z`} fill={C.woodLight} />
      <Path d={`M${x + w} ${y + w * 0.62}L${m - 4} ${y}L${m - 12} ${y + 6}L${x + w - 10} ${y + w * 0.64}Z`} fill={C.wood} />
      <Path d={`M${m - 6} ${y + w * 0.26}H${m + 6}V${y + w * 0.34}H${m - 6}Z`} fill={C.woodDark} opacity={0.6} />
    </G>
  );
}

function Lantern({ c, x, y, s = 1, k }: { c: Ctx; x: number; y: number; s?: number; k: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Glow c={c} k={k} cx={0} cy={18} r={34} color={C.goldLight} opacity={0.75} />
      <Path d="M0 -14V-4" stroke={C.goldDeep} strokeWidth={1.6} />
      <Path d="M-8 -4H8L6 0H-6Z" fill={C.goldDeep} />
      <Path d="M-10 0Q-14 18 -6 34H6Q14 18 10 0Z" fill={C.goldPale} />
      <Path d="M-10 0Q-14 18 -6 34H-2Q-8 18 -4 0Z" fill={C.gold} opacity={0.55} />
      <Path d="M-6 34H6L4 39H-4Z" fill={C.goldDeep} />
      <Path d={sparklePath(0, 17, 5)} fill={C.white} opacity={0.9} />
    </G>
  );
}

export const quran = {
  /** Tawhid: one radiant eight-pointed star. */
  'one-star': art(100, 100, (c) => (
    <>
      <Glow c={c} k="g" cx={50} cy={50} r={48} color={C.goldPale} opacity={0.9} />
      <Path d={star8Path(50, 50, 34)} fill={C.gold} />
      <Path d={star8Path(50, 50, 24)} fill={C.goldLight} />
      <Circle cx={50} cy={50} r={10} fill={C.cream} />
      <Path d={sparklePath(50, 50, 7)} fill={C.goldDeep} />
    </>
  )),

  /** An unrolled scroll with a star seal (the message of a surah). */
  'message-scroll': art(120, 100, (c) => (
    <>
      <Shadow c={c} cx={60} cy={92} rx={48} />
      <Path d="M24 18H96V80H24Z" fill={C.cream} />
      <Path d="M24 18H96V26H24Z" fill={C.sandLight} />
      {[38, 48, 58, 68].map((y, i) => (
        <Path key={y} d={`M34 ${y}H${i % 2 ? 78 : 86}`} stroke={C.teal} strokeWidth={2.2} strokeLinecap="round" strokeDasharray="7 4" opacity={0.75} />
      ))}
      <Rect x={12} y={10} width={16} height={78} rx={8} fill={C.sandLight} />
      <Rect x={92} y={10} width={16} height={78} rx={8} fill={C.sandLight} />
      <Rect x={18} y={4} width={5} height={90} rx={2.5} fill={C.wood} />
      <Rect x={97} y={4} width={5} height={90} rx={2.5} fill={C.wood} />
      <Circle cx={86} cy={74} r={10} fill={C.berry} />
      <Path d={star8Path(86, 74, 6)} fill={C.goldLight} />
    </>
  )),

  /** An open mushaf on a rahle. */
  'mushaf-rahle': art(140, 120, (c) => (
    <>
      <Glow c={c} k="g" cx={70} cy={44} r={60} color={C.goldPale} opacity={0.6} />
      <Shadow c={c} cx={70} cy={112} rx={52} />
      <Rahle x={22} y={50} w={96} />
      <G transform="rotate(-6 70 50)">
        <OpenMushaf x={22} y={18} w={96} />
      </G>
    </>
  )),

  /** A glowing lantern on a night sky (cover of Ayah Lanterns). */
  'lantern-night': art(120, 120, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={nightSky(c)} />
      </Defs>
      <Rect x={0} y={0} width={120} height={120} rx={22} fill={c.url('sky')} />
      <Stars pts={[[14, 18], [30, 40, 1.4], [96, 16], [104, 52], [20, 86], [88, 96, 1.4], [62, 12]]} />
      <Path d={crescentPath(98, 30, 10, 4, -3, 8.5)} fill={C.goldPale} />
      <Lantern c={c} x={44} y={34} s={1.15} k="l1" />
      <Lantern c={c} x={84} y={66} s={0.75} k="l2" />
      <Lantern c={c} x={22} y={74} s={0.6} k="l3" />
    </>
  )),

  /** Wide night sky over low hills (backdrop for the rising lanterns). */
  'night-hills': art(360, 480, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={nightSky(c)} />
        <Lin id={c.id('hill')} stops={[[0, '#2A2860'], [1, '#1A1A40']]} />
      </Defs>
      <Rect x={0} y={0} width={360} height={480} fill={c.url('sky')} />
      <Stars
        pts={[[20, 30], [64, 70, 1.6], [110, 24], [150, 92], [200, 40, 1.6], [246, 80], [290, 30], [334, 66, 1.6], [40, 150], [96, 190], [180, 160, 1.4], [260, 140], [320, 200], [30, 250], [140, 260], [230, 230], [300, 290, 1.4], [70, 320], [190, 320]]}
      />
      <Glow c={c} k="m" cx={286} cy={92} r={44} color={C.goldPale} opacity={0.35} />
      <Path d={crescentPath(286, 92, 18, 7, -5, 15)} fill={C.goldPale} />
      <Path d="M0 410Q60 380 120 400T240 392T360 398V480H0Z" fill={c.url('hill')} />
      <Path d="M0 440Q90 420 180 436T360 430V480H0Z" fill="#14142F" opacity={0.85} />
    </>
  )),

  /** The night sky of Juz ʿAmma: faint stars, dawn rising at the bottom (map of the path game). */
  'juz-sky': art(300, 420, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={c.dark ? [[0, '#0B0E2A'], [0.6, '#232861'], [1, '#6E4F7E']] : [[0, '#1C2050'], [0.55, '#3B3F8F'], [0.85, '#B67A8C'], [1, '#F6C98A']]} />
      </Defs>
      <Rect x={0} y={0} width={300} height={420} fill={c.url('sky')} />
      <Stars pts={[[18, 20], [60, 48], [110, 16, 1.4], [170, 36], [230, 18], [280, 50, 1.4], [40, 110], [140, 96], [250, 120], [16, 180, 1.4], [200, 170], [280, 230], [90, 240], [30, 300], [170, 290]]} />
      <Path d={crescentPath(250, 64, 13, 5, -4, 11)} fill={C.goldPale} />
      <Path d="M0 392Q75 372 150 386T300 380V420H0Z" fill={c.dark ? '#2B2550' : '#5B4A6E'} opacity={0.8} />
    </>
  )),

  /** Puzzle picture of Al-Fil: the Kaaba in the valley of Makkah, flocks of birds above. */
  'puzzle-fil': art(240, 240, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={c.dark ? [[0, '#1E2260'], [1, '#6A5A8E']] : [[0, '#7CC3E6'], [1, '#FCE6C2']]} />
        <Lin id={c.id('sand')} stops={[[0, '#E8C48E'], [1, '#D6A66A']]} />
      </Defs>
      <Rect x={0} y={0} width={240} height={240} fill={c.url('sky')} />
      <Mountain x={-20} y={170} w={120} h={70} color="#B48A63" shadeColor="#9A7350" />
      <Mountain x={140} y={170} w={130} h={78} color="#B9906A" shadeColor="#9E7754" />
      <Mountain x={70} y={176} w={100} h={46} color="#C79E74" shadeColor="#AA825C" />
      <Path d="M0 172Q120 160 240 172V240H0Z" fill={c.url('sand')} />
      <Use c={c} def={place.kaaba} x={78} y={140} w={84} />
      <Use c={c} def={animal.birds} x={20} y={22} w={110} />
      <Use c={c} def={animal.birds} x={128} y={56} w={92} flip />
      <Use c={c} def={animal.birds} x={60} y={86} w={70} />
    </>
  )),

  /** Puzzle picture of At-Tin: fig and olive trees, Mount Sinai and the secure city. */
  'puzzle-tin': art(240, 240, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={c.dark ? [[0, '#1E2260'], [1, '#56507E']] : [[0, '#8ED0EC'], [1, '#EAF6F4']]} />
        <Lin id={c.id('grass')} stops={[[0, '#9FCB7A'], [1, '#6DA35A']]} />
      </Defs>
      <Rect x={0} y={0} width={240} height={240} fill={c.url('sky')} />
      <Circle cx={198} cy={38} r={16} fill={C.goldLight} />
      <Cloud x={70} y={34} r={13} opacity={0.9} />
      <Use c={c} def={place['mount-sinai']} x={110} y={58} w={130} />
      <Use c={c} def={place['makkah-city']} x={-6} y={92} w={130} />
      <Path d="M0 176Q120 162 240 176V240H0Z" fill={c.url('grass')} />
      <Use c={c} def={garden.fig} x={8} y={128} w={98} />
      <Use c={c} def={garden.olive} x={128} y={126} w={100} />
    </>
  )),

  /** Puzzle picture of Ad-Duha: the morning brightness rising while the night withdraws. */
  'puzzle-duha': art(240, 240, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} x1={0} y1={0} x2={1} y2={0} stops={[[0, '#1C2050'], [0.45, '#4B3F8F'], [0.7, '#F2A97E'], [1, '#FFE3A6']]} />
        <Lin id={c.id('hill')} stops={[[0, '#7C9A62'], [1, '#4E7246']]} />
      </Defs>
      <Rect x={0} y={0} width={240} height={240} fill={c.url('sky')} />
      <Stars pts={[[20, 24], [56, 54, 1.4], [30, 96], [90, 30], [74, 120]]} />
      <Path d={crescentPath(52, 70, 13, 5, -4, 11)} fill={C.goldPale} />
      <Glow c={c} k="sun" cx={186} cy={150} r={80} color={C.goldPale} opacity={0.9} />
      <Circle cx={186} cy={150} r={26} fill={C.goldLight} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI * (i + 0.5)) / 8 + Math.PI;
        return <Path key={i} d={`M${186 + Math.cos(a) * 34} ${150 + Math.sin(a) * 34}L${186 + Math.cos(a) * 52} ${150 + Math.sin(a) * 52}`} stroke={C.goldLight} strokeWidth={4} strokeLinecap="round" />;
      })}
      <Path d="M0 170Q60 150 130 166T240 160V240H0Z" fill={c.url('hill')} />
      <Palm c={c} x={40} y={196} h={52} lean={-5} />
      <Palm c={c} x={204} y={204} h={40} lean={6} />
    </>
  )),

  /** Sun and moon, day and night, sky and earth (Ash-Shams 91:1–6; scene of the tap game). */
  'signs-sky': art(320, 240, (c) => (
    <>
      <Defs>
        <Lin id={c.id('day')} stops={[[0, '#6FBFE0'], [1, '#DDF2F8']]} />
        <Lin id={c.id('night')} stops={[[0, '#14173A'], [1, '#3B3F8F']]} />
        <Lin id={c.id('earth')} stops={[[0, '#A6CF84'], [0.5, '#7DB062'], [1, '#C9A27A']]} />
      </Defs>
      <Rect x={0} y={0} width={160} height={240} fill={c.url('day')} />
      <Rect x={160} y={0} width={160} height={240} fill={c.url('night')} />
      <Cloud x={92} y={96} r={12} opacity={0.85} />
      <Stars pts={[[180, 30], [214, 70, 1.4], [250, 22], [296, 56], [186, 110], [280, 116, 1.4], [230, 140]]} />
      <Glow c={c} k="sun" cx={60} cy={56} r={50} color={C.goldPale} opacity={0.9} />
      <Circle cx={60} cy={56} r={22} fill={C.goldLight} />
      <Glow c={c} k="moon" cx={262} cy={70} r={34} color={C.goldPale} opacity={0.35} />
      <Path d={crescentPath(262, 70, 18, 7, -5, 15)} fill={C.goldPale} />
      <Path d="M0 176Q80 160 160 172T320 168V240H0Z" fill={c.url('earth')} />
      <Path d="M0 206Q90 194 170 204T320 200" stroke={mix('#7DB062', '#000000', 0.2)} strokeWidth={2} fill="none" opacity={0.5} />
    </>
  )),

  /** Valley of Makkah under an open sky (backdrop of the Al-Fil scene). */
  'valley-makkah': art(320, 240, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={c.dark ? [[0, '#1B1F4B'], [1, '#5A4F86']] : [[0, '#8CCBEA'], [1, '#FCE9C8']]} />
        <Lin id={c.id('sand')} stops={[[0, '#EBCB97'], [1, '#D8A86C']]} />
      </Defs>
      <Rect x={0} y={0} width={320} height={240} fill={c.url('sky')} />
      <Mountain x={-30} y={180} w={150} h={84} color="#B48A63" shadeColor="#9A7350" />
      <Mountain x={200} y={180} w={160} h={90} color="#B9906A" shadeColor="#9E7754" />
      <Mountain x={100} y={184} w={130} h={50} color="#C79E74" shadeColor="#AA825C" />
      <Path d="M0 182Q160 170 320 182V240H0Z" fill={c.url('sand')} />
    </>
  )),

  /** A desert road under a sky that is half winter, half summer (backdrop of the Quraysh scene). */
  'caravan-road': art(320, 240, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} x1={0} y1={0} x2={1} y2={0} stops={c.dark ? [[0, '#2A3060'], [1, '#4B3F6F']] : [[0, '#B9CCDD'], [0.5, '#D8E8F0'], [1, '#FCD99A']]} />
        <Lin id={c.id('sand')} stops={[[0, '#EBCB97'], [1, '#D8A86C']]} />
      </Defs>
      <Rect x={0} y={0} width={320} height={240} fill={c.url('sky')} />
      <Cloud x={50} y={42} r={16} color="#E9EEF4" shadeColor="#C4CFDB" />
      <Cloud x={92} y={60} r={11} color="#E9EEF4" shadeColor="#C4CFDB" opacity={0.85} />
      <Glow c={c} k="sun" cx={270} cy={46} r={40} color={C.goldPale} opacity={0.9} />
      <Circle cx={270} cy={46} r={15} fill={C.goldLight} />
      <Path d="M0 160Q160 146 320 160V240H0Z" fill={c.url('sand')} />
      <Path d="M150 240Q156 200 160 160Q164 200 176 240Z" fill="#F4DDB0" opacity={0.8} />
    </>
  )),

  /** Plain land under a wide sky (backdrop of the Al-Ghashiyah scene, 88:17–20). */
  'open-land': art(320, 240, (c) => (
    <>
      <Defs>
        <Lin id={c.id('sky')} stops={c.dark ? [[0, '#141842'], [1, '#3E3A78']] : [[0, '#D9EEF7'], [1, '#F7EFDC']]} />
      </Defs>
      <Rect x={0} y={0} width={320} height={240} fill={c.url('sky')} />
      <Path d="M0 186Q160 178 320 186V240H0Z" fill={c.dark ? '#5A4E6E' : '#E9D3A6'} opacity={0.6} />
    </>
  )),

  /** The sky raised high: a dome of stars (part of the Al-Ghashiyah scene). */
  'sky-dome': art(300, 110, (c) => (
    <>
      <Defs>
        <Lin id={c.id('d')} stops={[[0, '#2E3380'], [1, '#6FBFE0']]} />
      </Defs>
      <Path d="M0 110Q0 0 150 0T300 110Z" fill={c.url('d')} />
      <Stars pts={[[60, 60], [100, 30, 1.6], [150, 16], [200, 34, 1.6], [240, 64], [120, 70], [180, 74]]} />
      <Path d={starPath(150, 44, 7, 3)} fill={C.goldLight} />
    </>
  )),

  /** Mountains set firmly (part of the Al-Ghashiyah scene). */
  mountains: art(200, 110, () => (
    <>
      <Mountain x={-10} y={110} w={120} h={96} color="#9C8B78" shadeColor="#7D6E5E" snow="#F4F1EA" />
      <Mountain x={70} y={110} w={140} h={108} color="#A69584" shadeColor="#857563" snow="#F4F1EA" />
    </>
  )),

  /** The earth spread out: wide fields and a stream (part of the Al-Ghashiyah scene). */
  'earth-spread': art(320, 70, () => (
    <>
      <Path d="M0 20Q160 0 320 20V70H0Z" fill="#8FC06E" />
      <Path d="M0 36Q160 18 320 36V70H0Z" fill="#6DA35A" />
      <Path d="M20 60Q120 40 200 52T320 46" stroke="#8CC8EA" strokeWidth={6} fill="none" strokeLinecap="round" />
    </>
  )),

  /** Winter: snowflake cloud (part of the Quraysh scene). */
  winter: art(100, 80, () => (
    <>
      <Cloud x={50} y={34} r={24} color="#EEF2F8" shadeColor="#C4CFDB" />
      {[[30, 66], [52, 72], [72, 64]].map(([x, y], i) => (
        <Path key={i} d={`M${x - 5} ${y}H${x + 5}M${x} ${y - 5}V${y + 5}M${x - 3.5} ${y - 3.5}L${x + 3.5} ${y + 3.5}M${x + 3.5} ${y - 3.5}L${x - 3.5} ${y + 3.5}`} stroke="#8CC8EA" strokeWidth={1.8} strokeLinecap="round" />
      ))}
    </>
  )),

  /** Summer: a bright sun (part of the Quraysh scene). */
  summer: art(100, 100, (c) => (
    <>
      <Glow c={c} k="g" cx={50} cy={50} r={48} color={C.goldPale} opacity={0.9} />
      <Circle cx={50} cy={50} r={22} fill={C.goldLight} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <Path key={i} d={`M${50 + Math.cos(a) * 28} ${50 + Math.sin(a) * 28}L${50 + Math.cos(a) * 40} ${50 + Math.sin(a) * 40}`} stroke={C.gold} strokeWidth={4} strokeLinecap="round" />;
      })}
    </>
  )),

  /** A caravan: two camels with loads (part of the Quraysh scene). */
  caravan: art(200, 100, (c) => (
    <>
      <Use c={c} def={animal.camel} x={0} y={10} w={100} />
      <Use c={c} def={animal.camel} x={90} y={18} w={92} />
      <Rect x={34} y={22} width={22} height={14} rx={3} fill={C.berry} />
      <Rect x={122} y={30} width={20} height={13} rx={3} fill={C.teal} />
    </>
  )),

  /** Food and safety: a bowl of dates and a shield of light (part of the Quraysh scene, 106:4). */
  'food-safety': art(120, 90, (c) => (
    <>
      <Shadow c={c} cx={60} cy={84} rx={46} />
      <Path d="M22 50H98Q94 80 60 82Q26 80 22 50Z" fill={C.woodLight} />
      {[[36, 46], [50, 42], [64, 44], [78, 42], [88, 47], [56, 36], [70, 36]].map(([x, y], i) => (
        <Ellipse key={i} cx={x} cy={y} rx={7} ry={4.4} fill={i % 2 ? '#7A3E22' : '#8E4A2A'} transform={`rotate(${i * 25 - 40} ${x} ${y})`} />
      ))}
      <Path d={sparklePath(102, 20, 10)} fill={C.goldLight} />
    </>
  )),

  /** A mushaf kept high on a clean shelf with a water jug for wudu (cover of Quran etiquette). */
  etiquette: art(130, 120, (c) => (
    <>
      <Glow c={c} k="g" cx={66} cy={36} r={48} color={C.goldPale} opacity={0.5} />
      <Rect x={14} y={56} width={102} height={8} rx={3} fill={C.wood} />
      <Path d="M24 64L30 76H36L32 64ZM106 64L100 76H94L98 64Z" fill={C.woodDark} />
      <Use c={c} def={object.book} x={42} y={2} w={48} />
      <Use c={c} def={object['water-jug']} x={74} y={70} w={40} />
      <Use c={c} def={object['prayer-mat']} x={8} y={84} w={66} />
    </>
  )),

  /** A closed mushaf with numbered ribbons (cover of Surah Order). */
  'mushaf-ribbons': art(110, 120, (c) => (
    <>
      <Shadow c={c} cx={55} cy={112} rx={42} />
      <Use c={c} def={object.book} x={10} y={8} w={90} />
      <Path d="M40 96V118L45 113 50 118V96Z" fill={C.berry} />
      <Path d="M58 96V114L63 109 68 114V96Z" fill={C.gold} />
      <Path d="M76 96V110L80 106 84 110V96Z" fill={C.tealLight} />
    </>
  )),

  /** A basket with glowing good deeds (cover of Good Deeds of Juz ʿAmma). */
  'good-deeds': art(120, 110, (c) => (
    <>
      <Glow c={c} k="g" cx={60} cy={40} r={50} color={C.goldPale} opacity={0.75} />
      <Use c={c} def={object.basket} x={14} y={34} w={92} />
      {[[40, 30, 8], [64, 18, 11], [86, 34, 7], [54, 46, 6]].map(([x, y, r], i) => (
        <Path key={i} d={sparklePath(x, y, r)} fill={i % 2 ? C.goldLight : C.gold} />
      ))}
    </>
  )),

  /** A garden bed with flowers and a small open book (cover of Surah Garden). */
  'surah-garden': art(130, 110, (c) => (
    <>
      <Shadow c={c} cx={65} cy={102} rx={56} />
      <Path d="M8 80Q65 66 122 80V98Q65 108 8 98Z" fill={C.clay} />
      <Path d="M8 80Q65 66 122 80Q65 90 8 80Z" fill="#8A5A36" />
      <Use c={c} def={garden['flower-rose']} x={10} y={22} w={40} />
      <Use c={c} def={garden['flower-tulip']} x={46} y={12} w={40} />
      <Use c={c} def={garden['flower-lily']} x={82} y={24} w={40} />
    </>
  )),
} satisfies Record<string, ArtDef>;
