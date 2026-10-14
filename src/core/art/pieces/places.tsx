import React from 'react';
import { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { archPath, art, Cloud, crescentPath, domePath, Dunes, Glow, House, LeafyTree, Lin, Mountain, Palm, roundDomePath, Shadow, sparklePath, starPath, type ArtDef, type Ctx } from '../kit';
import { C, mix } from '../palette';

/** Dim a landscape colour for dark mode (vignettes switch to an evening light). */
const dim = (c: Ctx, color: string, k = 0.32) => (c.dark ? mix(color, '#1B1F4B', k) : color);

type SkyKind = 'day' | 'warm' | 'sea';
const SKY: Record<SkyKind, { light: [string, string]; dark: [string, string] }> = {
  day: { light: ['#8FD0EA', '#E3F4F8'], dark: ['#1B1F4B', '#4B3F8F'] },
  warm: { light: ['#9BD3EA', '#FCE9C8'], dark: ['#1B1F4B', '#7B5CA6'] },
  sea: { light: ['#7CC6E6', '#E3F4F8'], dark: ['#14173A', '#3A4590'] },
};

/** Rounded landscape vignette (sky + clipped content). Width/height of the viewBox, corner radius 22. */
function Vignette({ c, w, h, sky = 'day', sun = true, children }: { c: Ctx; w: number; h: number; sky?: SkyKind; sun?: boolean; children: React.ReactNode }) {
  const [top, bottom] = c.dark ? SKY[sky].dark : SKY[sky].light;
  return (
    <>
      <Defs>
        <ClipPath id={c.id('clip')}>
          <Rect x={0} y={0} width={w} height={h} rx={22} />
        </ClipPath>
        <Lin id={c.id('sky')} stops={[[0, top], [1, bottom]]} />
      </Defs>
      <G clipPath={c.url('clip')}>
        <Rect x={0} y={0} width={w} height={h} fill={c.url('sky')} />
        {sun && !c.dark && (
          <>
            <Glow c={c} k="sun" cx={w * 0.8} cy={h * 0.22} r={h * 0.26} color={C.goldPale} opacity={0.9} />
            <Circle cx={w * 0.8} cy={h * 0.22} r={h * 0.085} fill={C.goldLight} />
          </>
        )}
        {sun && c.dark && (
          <>
            {[[0.12, 0.12], [0.3, 0.22], [0.5, 0.1], [0.66, 0.26], [0.92, 0.14], [0.2, 0.34]].map(([x, y], i) => (
              <Circle key={i} cx={w * x} cy={h * y} r={1.2} fill={C.white} opacity={0.8} />
            ))}
            <Path d={crescentPath(w * 0.8, h * 0.2, h * 0.075, h * 0.04, -h * 0.03, h * 0.065)} fill={C.goldLight} />
          </>
        )}
        {children}
      </G>
    </>
  );
}

function Kaaba3D({ c, x, y, s = 1 }: { c: Ctx; x: number; y: number; s?: number }) {
  // Local coordinates: a cube in three-quarter view, ~68 wide, 66 high, foot at (0, 0).
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {c.dark && <Path d="M-36-50-6-58 34-50 34 0-6 8-36 0Z" fill={C.goldPale} opacity={0.12} transform="scale(1.06)" />}
      <Path d="M-34-50-4-56 32-50-0-44Z" fill="#3A3A44" />
      <Path d="M-34-50 0-44V8L-34 0Z" fill="#1E1E24" />
      <Path d="M0-44 32-50V0L0 8Z" fill="#2C2C34" />
      <Path d="M-34-38 0-32V-27L-34-33Z" fill={C.gold} />
      <Path d="M0-32 32-38V-33L0-27Z" fill={C.goldDeep} />
      <Path d="M-34-36.5 0-30.5M0-30.5 32-36.5" stroke={C.goldPale} strokeWidth={0.8} opacity={0.7} />
      <Path d="M-14-18-4-16.3V-2L-14-3.8Z" fill={C.gold} />
      <Path d="M-12.6-15.8-5.4-14.6V-3.6L-12.6-4.8Z" fill={C.goldDeep} />
      <Path d="M-34-50 0-44 32-50" stroke={c.dark ? '#6A6A78' : '#4A4A55'} strokeWidth={1} fill="none" />
    </G>
  );
}

function Minaret({ x, base, h, w = 8, body = C.marble, side = C.stonePale, cap = C.marble, tip = C.gold, balcony = C.stoneLight }: { x: number; base: number; h: number; w?: number; body?: string; side?: string; cap?: string; tip?: string; balcony?: string }) {
  const top = base - h;
  return (
    <G>
      <Rect x={x - w / 2} y={top + w * 1.4} width={w} height={h - w * 1.4} fill={body} />
      <Rect x={x + w * 0.1} y={top + w * 1.4} width={w * 0.4} height={h - w * 1.4} fill={side} />
      <Rect x={x - w * 0.75} y={top + h * 0.35} width={w * 1.5} height={w * 0.45} rx={w * 0.2} fill={balcony} />
      <Rect x={x - w * 0.75} y={top + h * 0.12} width={w * 1.5} height={w * 0.4} rx={w * 0.2} fill={balcony} />
      <Path d={`M${x - w * 0.42} ${top + w * 1.45}L${x} ${top + w * 0.2}L${x + w * 0.42} ${top + w * 1.45}Z`} fill={cap} />
      <Rect x={x - 0.6} y={top - w * 0.4} width={1.2} height={w * 0.7} fill={tip} />
      <Circle cx={x} cy={top - w * 0.45} r={w * 0.18} fill={tip} />
    </G>
  );
}

function RockyMountain({ c, x, y, w, h, color, shadeColor }: { c: Ctx; x: number; y: number; w: number; h: number; color: string; shadeColor: string }) {
  const top = y - h;
  return (
    <G>
      <Path d={`M${x - w / 2} ${y}C${x - w * 0.36} ${y - h * 0.3} ${x - w * 0.2} ${top + h * 0.2} ${x - w * 0.08} ${top + h * 0.06}Q${x} ${top - h * 0.03} ${x + w * 0.08} ${top + h * 0.08}C${x + w * 0.22} ${top + h * 0.3} ${x + w * 0.36} ${y - h * 0.35} ${x + w / 2} ${y}Z`} fill={dim(c, color)} />
      <Path d={`M${x + w * 0.02} ${top + h * 0.02}Q${x + w * 0.06} ${top + h * 0.04} ${x + w * 0.08} ${top + h * 0.08}C${x + w * 0.22} ${top + h * 0.3} ${x + w * 0.36} ${y - h * 0.35} ${x + w / 2} ${y}H${x + w * 0.1}C${x + w * 0.16} ${y - h * 0.4} ${x + w * 0.02} ${top + h * 0.4} ${x + w * 0.02} ${top + h * 0.02}Z`} fill={dim(c, shadeColor)} />
      <Path d={`M${x - w * 0.3} ${y - h * 0.3}l${w * 0.06} ${-h * 0.04}M${x - w * 0.18} ${top + h * 0.45}l${w * 0.05} ${-h * 0.03}M${x + w * 0.2} ${y - h * 0.25}l${w * 0.05} ${-h * 0.02}`} stroke={dim(c, shadeColor)} strokeWidth={2} strokeLinecap="round" />
    </G>
  );
}

function Well({ c, x, y, s = 1 }: { c: Ctx; x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      <Path d="M-14-26V-44M14-26V-44" stroke={dim(c, C.woodDark)} strokeWidth={3} strokeLinecap="round" />
      <Rect x={-17} y={-47} width={34} height={4} rx={2} fill={dim(c, C.wood)} />
      <Path d="M0-43V-30" stroke={dim(c, C.woodPale)} strokeWidth={1.2} />
      <Rect x={-3} y={-33} width={6} height={5} rx={1} fill={dim(c, C.woodLight)} />
      <Path d="M-18-24H18V-2Q18 2 14 2H-14Q-18 2-18-2Z" fill={dim(c, C.stoneLight)} />
      <Path d="M6-24H18V-2Q18 2 14 2H6Z" fill={dim(c, C.stone)} opacity={0.6} />
      <Path d="M-18-14H18M-6-24V-14M8-14V2" stroke={dim(c, C.stone)} strokeWidth={1.2} />
      <Ellipse cx={0} cy={-24} rx={18} ry={4.5} fill={dim(c, C.stonePale)} />
      <Ellipse cx={0} cy={-24} rx={13} ry={3} fill={dim(c, C.waterDark)} />
    </G>
  );
}

function Umbrella({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <G>
      <Rect x={x - 0.8} y={y - w * 0.6} width={1.6} height={w * 0.6} fill={C.stoneLight} />
      <Path d={`M${x - w / 2} ${y - w * 0.52}Q${x - w / 4} ${y - w * 0.66} ${x} ${y - w * 0.82}Q${x + w / 4} ${y - w * 0.66} ${x + w / 2} ${y - w * 0.52}Q${x} ${y - w * 0.6} ${x - w / 2} ${y - w * 0.52}Z`} fill={C.white} />
      <Path d={`M${x} ${y - w * 0.82}Q${x + w / 4} ${y - w * 0.66} ${x + w / 2} ${y - w * 0.52}Q${x + w * 0.2} ${y - w * 0.58} ${x} ${y - w * 0.58}Z`} fill={C.stonePale} />
    </G>
  );
}

function Reeds({ c, x, y, s = 1 }: { c: Ctx; x: number; y: number; s?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`}>
      {[-6, -2, 2, 6].map((dx, i) => (
        <G key={i}>
          <Path d={`M${dx} 0Q${dx + (i - 1.5) * 2} -12 ${dx + (i - 1.5) * 4} ${-20 - (i % 2) * 4}`} stroke={dim(c, c.green(C.leafDark))} strokeWidth={1.4} fill="none" />
          <Path d={`M${dx + (i - 1.5) * 4} ${-20 - (i % 2) * 4}l-4 -5 8 0Z`} fill={dim(c, c.green(C.olive))} />
        </G>
      ))}
    </G>
  );
}

export const place = {
  kaaba: art(120, 110, (c) => (
    <>
      <Ellipse cx={60} cy={92} rx={56} ry={15} fill={c.dark ? '#2A2F5C' : C.marble} />
      <Ellipse cx={60} cy={92} rx={44} ry={11} fill={c.dark ? '#343A6E' : '#E9E3D6'} />
      <Path d="M90 86A14 6 0 0 1 104 94" stroke={c.dark ? '#4A5190' : C.stonePale} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Kaaba3D c={c} x={60} y={92} s={1.05} />
    </>
  )),

  'masjid-haram': art(200, 130, (c) => {
    return (
      <>
        <Shadow c={c} cx={100} cy={118} rx={96} ry={9} />
        <Ellipse cx={100} cy={102} rx={94} ry={22} fill={c.dark ? '#B9B1A4' : C.stonePale} />
        <Path d="M6 102V82A94 30 0 0 1 194 82V102A94 30 0 0 0 6 102Z" fill={C.marble} />
        <Path d="M120 53A94 30 0 0 1 194 82V102A94 30 0 0 0 150 82Z" fill={C.stonePale} opacity={0.7} />
        {Array.from({ length: 15 }, (_, i) => {
          const t = (i + 0.5) / 15;
          const ang = Math.PI * (1 - t);
          const x = 100 + Math.cos(ang) * 86;
          const y = 92 - Math.sin(ang) * 22;
          return <Path key={i} d={archPath(x, y - 6, 6.5, y + 6)} fill={c.dark ? C.goldPale : C.sandDeep} opacity={c.dark ? 0.8 : 0.55} />;
        })}
        <Ellipse cx={100} cy={104} rx={74} ry={16} fill={c.dark ? '#D9D2C4' : C.white} />
        <Ellipse cx={100} cy={104} rx={50} ry={10} fill={c.dark ? '#E6E0D4' : '#F1EDE4'} />
        <Kaaba3D c={{ ...c, dark: false }} x={100} y={108} s={0.6} />
        <Minaret x={20} base={86} h={70} w={7} />
        <Minaret x={46} base={72} h={62} w={6} />
        <Minaret x={154} base={72} h={62} w={6} />
        <Minaret x={180} base={86} h={70} w={7} />
        <Path d="M6 102A94 22 0 0 0 194 102V106A94 24 0 0 1 6 106Z" fill={C.stoneLight} opacity={0.6} />
      </>
    );
  }),

  'masjid-nabawi': art(200, 130, (c) => (
    <>
      <Shadow c={c} cx={100} cy={122} rx={96} ry={7} />
      <Minaret x={22} base={110} h={92} w={8} body={C.cream} tip={C.gold} cap={C.domeGreen} />
      <Minaret x={178} base={110} h={92} w={8} body={C.cream} tip={C.gold} cap={C.domeGreen} />
      <Rect x={30} y={66} width={140} height={54} rx={3} fill={C.cream} />
      <Rect x={130} y={66} width={40} height={54} fill={C.sandLight} opacity={0.6} />
      <Rect x={26} y={62} width={148} height={6} rx={3} fill={C.sandLight} />
      {[46, 66, 86, 114, 134, 154].map((x) => (
        <Path key={x} d={archPath(x, 82, 12, 120)} fill={c.dark ? C.goldPale : C.sandDeep} opacity={c.dark ? 0.85 : 0.8} />
      ))}
      <Path d={archPath(100, 76, 18, 120)} fill={C.wood} />
      <Path d={roundDomePath(52, 63, 10)} fill={C.stoneLight} />
      <Path d={roundDomePath(148, 63, 10)} fill={C.stoneLight} />
      <Rect x={64} y={52} width={36} height={12} rx={2} fill={C.cream} />
      <Path d={domePath(82, 53, 17, 1.6)} fill={C.domeGreen} />
      <Path d="M70 48C70 38 74 32 79 28 76 36 75 42 75 48Z" fill="#5BC48A" opacity={0.7} />
      <Rect x={81} y={18} width={2} height={10} fill={C.gold} />
      <Path d={crescentPath(82, 16, 3.4, 1.5, -1, 2.8)} fill={C.gold} />
      <Minaret x={128} base={64} h={46} w={6} body={C.cream} cap={C.domeGreen} />
      <Umbrella x={40} y={122} w={22} />
      <Umbrella x={160} y={122} w={22} />
    </>
  )),

  'masjid-nabawi-early': art(200, 120, (c) => (
    <>
      <Shadow c={c} cx={100} cy={112} rx={94} ry={7} />
      <Palm c={c} x={18} y={112} h={70} lean={-6} />
      <Palm c={c} x={184} y={112} h={62} lean={6} />
      <Path d="M24 112V64H176V112H156V76H44V112Z" fill={C.mud} />
      <Path d="M24 64H176V70H24Z" fill={C.clay} opacity={0.6} />
      <Path d="M30 72H38M30 84H38M30 96H38M162 72H170M162 84H170M162 96H170" stroke={C.clay} strokeWidth={1.6} opacity={0.7} />
      <Rect x={44} y={76} width={112} height={36} fill={c.dark ? '#3A2C22' : '#E4C9A3'} />
      <Rect x={44} y={76} width={112} height={8} fill={c.dark ? '#2A2019' : C.sandDeep} opacity={0.8} />
      {[54, 74, 94, 114, 134, 150].map((x) => (
        <G key={x}>
          <Rect x={x - 3} y={74} width={6} height={38} rx={2} fill={C.wood} />
          {[80, 88, 96, 104].map((y) => (
            <Path key={y} d={`M${x - 3} ${y}Q${x} ${y - 2} ${x + 3} ${y}`} stroke={C.woodDark} strokeWidth={1} fill="none" opacity={0.6} />
          ))}
        </G>
      ))}
      <Path d="M36 76L44 60H156L164 76Z" fill={C.olive} />
      <Path d="M40 70H160" stroke={C.oliveDark} strokeWidth={1.4} />
      {Array.from({ length: 16 }, (_, i) => (
        <Path key={i} d={`M${48 + i * 7} 61l-5 14`} stroke={i % 2 ? C.oliveDark : '#A9B873'} strokeWidth={1.6} strokeLinecap="round" />
      ))}
      <Path d="M36 76H164V79H36Z" fill={C.woodDark} />
    </>
  )),

  'masjid-aqsa': art(160, 130, (c) => (
    <>
      <Defs>
        <Lin id={c.id('gold')} x1={0} y1={0} x2={1} y2={0} stops={[[0, C.goldLight], [0.55, C.gold], [1, C.goldDeep]]} />
      </Defs>
      <Shadow c={c} cx={80} cy={122} rx={76} ry={7} />
      <Rect x={4} y={112} width={152} height={10} rx={3} fill={C.stonePale} />
      <Path d="M12 112C8 98 10 82 14 70 18 82 20 98 16 112Z" fill={c.green(C.leafDeep)} />
      <Path d="M148 112C152 98 150 82 146 70 142 82 140 98 144 112Z" fill={c.green(C.leafDeep)} />
      <Path d="M24 112V74H42V112ZM118 112V74H136V112Z" fill="#E8E2D6" />
      <Rect x={42} y={70} width={76} height={42} fill={C.marble} />
      <Rect x={24} y={70} width={112} height={18} fill="#2F6FB0" />
      <Rect x={42} y={70} width={76} height={18} fill="#3B82C4" />
      {[30, 130].map((x) => (
        <Path key={x} d={archPath(x, 76, 6, 86)} fill="#1E4F86" />
      ))}
      {[52, 66, 80, 94, 108].map((x) => (
        <Path key={x} d={archPath(x, 75, 7, 86)} fill="#1E4F86" />
      ))}
      <Path d="M24 88H136" stroke={C.gold} strokeWidth={1.4} />
      {[52, 66, 94, 108].map((x) => (
        <Path key={x} d={archPath(x, 94, 7, 106)} fill={C.stonePale} />
      ))}
      <Path d={archPath(80, 92, 12, 112)} fill={C.wood} />
      <Path d="M22 70H138V66H22Z" fill={C.stoneLight} />
      <Rect x={52} y={50} width={56} height={17} fill="#2F6FB0" />
      <Rect x={52} y={50} width={56} height={3} fill={C.gold} />
      {[60, 70, 80, 90, 100].map((x) => (
        <Path key={x} d={archPath(x, 55, 4.5, 65)} fill="#1E4F86" />
      ))}
      <Path d="M52 51C52 26 64 14 80 10 96 14 108 26 108 51Z" fill={c.url('gold')} />
      <Path d="M60 44C60 30 66 22 74 18 70 26 68 34 68 44Z" fill={C.goldPale} opacity={0.6} />
      <Rect x={79} y={2} width={2} height={9} fill={C.goldDeep} />
      <Path d={crescentPath(80, 2, 3.2, 1.4, -1, 2.7)} fill={C.goldDeep} />
    </>
  )),

  'cave-hira': art(160, 130, (c) => (
    <>
      <Shadow c={c} cx={80} cy={124} rx={76} ry={6} />
      <RockyMountain c={c} x={58} y={124} w={110} h={60} color="#B39A7E" shadeColor="#97806A" />
      <RockyMountain c={c} x={92} y={124} w={130} h={112} color="#A48A70" shadeColor="#86705C" />
      <Path d="M88 34C82 34 78 40 79 46H96C97 40 94 34 88 34Z" fill={C.night} />
      <Path d="M80 46H96" stroke="#6E5A48" strokeWidth={2.4} strokeLinecap="round" />
      <Glow c={c} k="g" cx={88} cy={41} r={16} color={C.goldPale} opacity={c.dark ? 0.5 : 0.35} />
      <Path d="M88 48C80 62 92 74 84 88S70 104 74 122" stroke={c.dark ? '#8C7A64' : C.sandLight} strokeWidth={2} strokeDasharray="3 4" fill="none" strokeLinecap="round" />
      <Ellipse cx={34} cy={120} rx={10} ry={5} fill="#8C765F" />
      <Ellipse cx={140} cy={121} rx={8} ry={4} fill="#8C765F" />
    </>
  )),

  'cave-thawr': art(160, 130, (c) => (
    <>
      <Shadow c={c} cx={80} cy={124} rx={76} ry={6} />
      <Path d="M6 124C10 92 30 60 60 44 80 34 104 36 124 52 146 70 154 100 156 124Z" fill={dim(c, '#9E8670')} />
      <Path d="M104 38C126 46 148 74 156 124H118C128 96 124 64 104 38Z" fill={dim(c, '#836D59')} />
      <Path d="M30 84l8-4M58 60l8-3M120 70l6 3M136 96l7 2" stroke={dim(c, '#7A6552')} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M58 124V102C58 88 68 80 80 80S102 88 102 102V124Z" fill={C.night} />
      <G stroke={C.white} strokeWidth={0.9} fill="none" opacity={0.9}>
        <Path d="M60 86 80 104 100 86M80 80V104M58 104H102M66 122 80 104 94 122" />
        <Path d="M67 90Q72 96 69 102Q74 108 72 114M93 90Q88 96 91 102Q86 108 88 114M74 84Q80 88 86 84M70 96Q80 92 90 96M68 110Q80 114 92 110" />
      </G>
      <Path d="M104 98Q114 92 124 98Q122 106 114 106Q106 106 104 98Z" fill={C.woodLight} />
      <Path d="M106 98Q114 94 122 98" stroke={C.woodDark} strokeWidth={1.2} fill="none" />
      <Ellipse cx={111} cy={96} rx={3} ry={2.4} fill={C.white} />
      <Ellipse cx={117} cy={96} rx={3} ry={2.4} fill="#EEF1F7" />
    </>
  )),

  'mount-judi': art(180, 120, (c) => (
    <>
      <Shadow c={c} cx={90} cy={114} rx={86} ry={6} />
      <Mountain x={46} y={114} w={96} h={56} color={dim(c, '#7E9A6A')} shadeColor={dim(c, '#657F55')} />
      <Mountain x={140} y={114} w={84} h={48} color={dim(c, '#7E9A6A')} shadeColor={dim(c, '#657F55')} />
      <Mountain x={92} y={114} w={120} h={88} color={dim(c, '#8F8A6E')} shadeColor={dim(c, '#76705A')} />
      <G transform="translate(92 28)">
        <Path d="M-22 0H22L16 9H-16Z" fill={C.woodLight} />
        <Path d="M-22 0H22" stroke={C.woodDark} strokeWidth={2} />
        <Rect x={-10} y={-10} width={20} height={10} fill={C.woodPale} />
        <Path d="M-13-10H13L0-17Z" fill={C.wood} />
        <Rect x={-4} y={-7} width={3} height={3} fill={C.woodDark} />
        <Rect x={2} y={-7} width={3} height={3} fill={C.woodDark} />
      </G>
      <Path d="M30 104c10-6 20-6 30 0M118 106c8-5 16-5 24 0" stroke={c.green(C.leafLight)} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.6} />
    </>
  )),

  'mount-uhud': art(200, 110, (c) => (
    <>
      <Shadow c={c} cx={100} cy={104} rx={96} ry={6} />
      <Path d="M4 104C10 80 24 64 40 60 52 50 62 38 76 40 88 30 100 32 110 42 122 36 136 40 146 52 162 54 178 70 196 104Z" fill={dim(c, '#B4664A')} />
      <Path d="M110 42C122 36 136 40 146 52 162 54 178 70 196 104H140C146 86 136 64 110 42Z" fill={dim(c, '#94503A')} />
      <Path d="M40 60C46 68 50 78 48 88M76 40C80 50 82 60 78 72M146 52C150 62 152 72 150 82" stroke={dim(c, '#94503A')} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Path d="M96 106C102 90 114 80 128 80S152 90 158 106Z" fill={dim(c, '#D4A57E')} />
      <Path d="M128 80C142 80 152 90 158 106H138C140 94 136 86 128 80Z" fill={dim(c, '#BC8B64')} />
      <Path d="M110 96l6-3M124 88l6-2" stroke={dim(c, '#BC8B64')} strokeWidth={2} strokeLinecap="round" />
    </>
  )),

  'mount-sinai': art(160, 130, (c) => (
    <>
      <Glow c={c} k="g" cx={84} cy={22} r={34} color={C.goldPale} opacity={c.dark ? 0.55 : 0.7} />
      <Shadow c={c} cx={80} cy={124} rx={76} ry={6} />
      <RockyMountain c={c} x={36} y={124} w={70} h={58} color="#B07A62" shadeColor="#93624E" />
      <RockyMountain c={c} x={128} y={124} w={64} h={50} color="#B07A62" shadeColor="#93624E" />
      <RockyMountain c={c} x={84} y={124} w={120} h={104} color="#C08A6A" shadeColor="#9C6B52" />
      <Path d="M76 26Q84 18 92 27L88 32 84 28 80 33Z" fill={C.goldPale} opacity={0.8} />
    </>
  )),

  'makkah-city': art(200, 140, (c) => (
    <Vignette c={c} w={200} h={140} sky="warm">
      <RockyMountain c={c} x={30} y={110} w={110} h={70} color="#A48A70" shadeColor="#8C765F" />
      <RockyMountain c={c} x={170} y={110} w={120} h={78} color="#A48A70" shadeColor="#8C765F" />
      <RockyMountain c={c} x={100} y={104} w={110} h={46} color="#B39A7E" shadeColor="#97806A" />
      {[[16, 92, 14, 10], [32, 86, 12, 9], [150, 88, 13, 10], [166, 94, 14, 9], [182, 86, 12, 10], [50, 96, 12, 8]].map(([x, y, w, h], i) => (
        <House key={i} x={x} y={y} w={w} h={h} color={dim(c, C.sandLight)} shadeColor={dim(c, C.sandDeep)} window={c.dark ? C.goldLight : C.woodLight} />
      ))}
      <Rect x={0} y={108} width={200} height={32} fill={dim(c, C.sand)} />
      <Ellipse cx={100} cy={118} rx={62} ry={14} fill={dim(c, C.marble, 0.2)} />
      <Ellipse cx={100} cy={119} rx={44} ry={9} fill={dim(c, C.white, 0.2)} />
      <Minaret x={46} base={116} h={42} w={5} />
      <Minaret x={154} base={116} h={42} w={5} />
      <Kaaba3D c={{ ...c, dark: false }} x={100} y={121} s={0.42} />
    </Vignette>
  )),

  'madinah-city': art(200, 140, (c) => (
    <Vignette c={c} w={200} h={140} sky="day">
      <Path d="M0 96C20 74 50 66 80 70 110 62 150 66 200 86V140H0Z" fill={dim(c, '#C07A5C')} />
      <Path d="M0 110C40 98 90 96 200 104V140H0Z" fill={dim(c, C.sand)} />
      <Palm c={c} x={18} y={118} h={46} lean={-4} />
      <Palm c={c} x={36} y={122} h={38} lean={4} />
      <Palm c={c} x={182} y={118} h={46} lean={4} />
      <Palm c={c} x={164} y={124} h={36} lean={-3} />
      {[[52, 116, 18, 14], [130, 116, 20, 14], [146, 120, 14, 10]].map(([x, y, w, h], i) => (
        <House key={i} x={x} y={y} w={w} h={h} color={dim(c, C.cream)} shadeColor={dim(c, C.sandLight)} window={c.dark ? C.goldLight : C.woodLight} />
      ))}
      <Rect x={74} y={94} width={52} height={28} rx={2} fill={dim(c, C.cream, 0.15)} />
      {[82, 92, 108, 118].map((x) => (
        <Path key={x} d={archPath(x, 104, 6, 122)} fill={c.dark ? C.goldLight : C.sandDeep} opacity={0.8} />
      ))}
      <Path d={domePath(98, 95, 12, 1.6)} fill={C.domeGreen} />
      <Rect x={97.2} y={70} width={1.6} height={6} fill={C.gold} />
      <Minaret x={70} base={122} h={56} w={5} body={C.cream} cap={C.domeGreen} />
      <Minaret x={130} base={122} h={56} w={5} body={C.cream} cap={C.domeGreen} />
      <Rect x={0} y={122} width={200} height={18} fill={dim(c, C.sandDeep)} />
      <Path d="M0 124H200" stroke={c.green(dim(c, C.leaf))} strokeWidth={3} opacity={0.6} />
    </Vignette>
  )),

  taif: art(200, 140, (c) => (
    <Vignette c={c} w={200} h={140} sky="day">
      <Cloud x={52} y={30} r={14} opacity={c.dark ? 0.25 : 0.95} />
      <Mountain x={60} y={120} w={150} h={84} color={dim(c, '#6FA067')} shadeColor={dim(c, '#5A8A55')} />
      <Mountain x={160} y={120} w={140} h={70} color={dim(c, '#80AE70')} shadeColor={dim(c, '#6A9760')} />
      {[0, 1, 2, 3].map((i) => (
        <Path key={i} d={`M${10 + i * 8} ${112 - i * 14}Q${60} ${104 - i * 16} ${110 - i * 6} ${112 - i * 14}`} stroke={dim(c, '#4F8150')} strokeWidth={2} fill="none" opacity={0.7} />
      ))}
      <Rect x={0} y={112} width={200} height={28} fill={dim(c, '#9CC77F')} />
      <LeafyTree c={c} x={28} y={126} s={0.42} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
      <LeafyTree c={c} x={176} y={128} s={0.36} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
      <House x={120} y={118} w={18} h={13} color={dim(c, C.sandLight)} shadeColor={dim(c, C.sandDeep)} window={c.dark ? C.goldLight : C.woodLight} />
      <House x={140} y={120} w={14} h={10} color={dim(c, C.sandLight)} shadeColor={dim(c, C.sandDeep)} window={c.dark ? C.goldLight : C.woodLight} />
      {[[60, 126], [70, 130], [82, 125], [94, 131], [104, 127], [50, 132]].map(([x, y], i) => (
        <G key={i}>
          <Circle cx={x} cy={y} r={3.4} fill={dim(c, i % 2 ? C.rose : C.pink)} />
          <Circle cx={x} cy={y} r={1.2} fill={dim(c, C.berry)} />
        </G>
      ))}
    </Vignette>
  )),

  'badr-wells': art(200, 140, (c) => (
    <Vignette c={c} w={200} h={140} sky="warm">
      <Path d="M0 92C30 80 60 84 90 88S150 78 200 86V140H0Z" fill={dim(c, '#C9A27A')} />
      <Dunes w={200} h={140} y={92} colors={[dim(c, C.sandLight), dim(c, C.sand), dim(c, C.sandDeep)]} />
      <Palm c={c} x={176} y={110} h={44} lean={4} />
      <Palm c={c} x={162} y={114} h={34} lean={-3} />
      <Well c={c} x={60} y={124} s={0.8} />
      <Well c={c} x={110} y={118} s={0.62} />
      <Well c={c} x={24} y={114} s={0.5} />
    </Vignette>
  )),

  'well-zamzam': art(110, 110, (c) => (
    <>
      <Glow c={c} k="g" cx={55} cy={52} r={50} color={C.waterPale} opacity={c.dark ? 0.35 : 0.6} />
      <Shadow c={c} cx={55} cy={102} rx={42} ry={6} />
      <Path d="M24 64V24Q24 14 34 12H76Q86 14 86 24V64" stroke={C.goldDeep} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d="M55 12V6" stroke={C.goldDeep} strokeWidth={3} strokeLinecap="round" />
      <Path d={starPath(55, 6, 5, 3.8, 8)} fill={C.gold} />
      <Path d="M55 14V34" stroke={C.woodPale} strokeWidth={1.4} />
      <Path d="M48 34H62L60 46H50Z" fill={C.gold} />
      <Rect x={47} y={32} width={16} height={3} rx={1.5} fill={C.goldDeep} />
      <Path d="M16 66H94V94Q94 102 86 102H24Q16 102 16 94Z" fill={C.marble} />
      <Path d="M70 66H94V94Q94 102 86 102H70Z" fill={C.stonePale} />
      <Path d="M16 78H94" stroke={C.gold} strokeWidth={2.4} />
      <Path d={archPath(30, 84, 8, 98)} fill={C.stoneLight} opacity={0.7} />
      <Path d={archPath(55, 84, 8, 98)} fill={C.stoneLight} opacity={0.7} />
      <Path d={archPath(80, 84, 8, 98)} fill={C.stoneLight} opacity={0.7} />
      <Ellipse cx={55} cy={66} rx={39} ry={9} fill={C.stonePale} />
      <Ellipse cx={55} cy={66} rx={31} ry={6} fill={C.waterDeep} />
      <Path d="M36 65Q46 62 56 63" stroke={C.waterLight} strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d={sparklePath(84, 44, 6)} fill={C.white} />
      <Path d={sparklePath(22, 52, 4)} fill={C.white} />
    </>
  )),

  'desert-road': art(200, 140, (c) => (
    <Vignette c={c} w={200} h={140} sky="warm">
      <Path d="M0 84C40 74 70 78 100 82S160 72 200 80V140H0Z" fill={dim(c, '#D9B07A')} />
      <Dunes w={200} h={140} y={86} colors={[dim(c, C.sandLight), dim(c, C.sand), dim(c, C.sandDeep)]} />
      <Path d="M96 84C102 84 106 90 110 96 120 110 150 120 160 140H96C110 124 92 110 90 100 88 92 90 86 96 84Z" fill={dim(c, C.cream)} opacity={0.9} />
      <G transform="translate(120 106) scale(0.36)" fill={dim(c, C.woodDark)}>
        <Path d="M0 0C5-14 22-16 30-6 34-14 42-14 46-6L52-18 58-16 54 2 50 18H46L44 6H14L10 18H6L4 6C0 4 0 2 0 0Z" />
      </G>
      <G transform="translate(100 97) scale(0.28)" fill={dim(c, C.woodDark)}>
        <Path d="M0 0C5-14 22-16 30-6 34-14 42-14 46-6L52-18 58-16 54 2 50 18H46L44 6H14L10 18H6L4 6C0 4 0 2 0 0Z" />
      </G>
      <Palm c={c} x={24} y={112} h={40} lean={-4} />
    </Vignette>
  )),

  oasis: art(200, 140, (c) => (
    <Vignette c={c} w={200} h={140} sky="warm">
      <Dunes w={200} h={140} y={78} colors={[dim(c, C.sandLight), dim(c, C.sand), dim(c, C.sandDeep)]} />
      <Ellipse cx={100} cy={118} rx={70} ry={16} fill={c.green(dim(c, C.leafLight))} />
      <Ellipse cx={100} cy={118} rx={50} ry={10} fill={dim(c, C.water)} />
      <Path d="M70 116Q86 112 100 113" stroke={C.white} strokeWidth={2} strokeLinecap="round" opacity={0.6} fill="none" />
      <Palm c={c} x={52} y={116} h={60} lean={-8} dates />
      <Palm c={c} x={70} y={112} h={44} lean={4} />
      <Palm c={c} x={144} y={116} h={56} lean={8} />
      <Palm c={c} x={128} y={112} h={38} lean={-3} />
    </Vignette>
  )),

  nile: art(200, 140, (c) => (
    <Vignette c={c} w={200} h={140} sky="warm">
      <Path d="M0 84C50 78 120 80 200 84V140H0Z" fill={c.green(dim(c, '#8DBE6E'))} />
      <Path d="M0 96C60 90 120 92 200 96V122C140 116 70 118 0 124Z" fill={dim(c, C.water)} />
      <Path d="M20 104Q50 100 80 102M110 108Q140 106 170 108" stroke={C.white} strokeWidth={1.8} strokeLinecap="round" opacity={0.55} fill="none" />
      <Path d="M0 124C70 118 140 116 200 122V140H0Z" fill={dim(c, C.sand)} />
      <G transform="translate(120 104)">
        <Path d="M-14 0H14L10 6H-10Z" fill={dim(c, C.woodLight)} />
        <Path d="M0 0V-26" stroke={dim(c, C.woodDark)} strokeWidth={1.6} />
        <Path d="M1-26C10-18 14-8 14-2H1Z" fill={dim(c, C.cream)} />
      </G>
      <Palm c={c} x={30} y={88} h={34} lean={-3} />
      <Palm c={c} x={170} y={88} h={30} lean={3} />
      <Reeds c={c} x={22} y={128} />
      <Reeds c={c} x={40} y={130} s={0.8} />
      <Reeds c={c} x={176} y={128} s={0.9} />
    </Vignette>
  )),

  sea: art(200, 140, (c) => (
    <Vignette c={c} w={200} h={140} sky="sea">
      <Cloud x={50} y={36} r={16} opacity={c.dark ? 0.25 : 0.95} />
      <Rect x={0} y={78} width={200} height={62} fill={dim(c, C.waterDeep)} />
      <Rect x={0} y={78} width={200} height={8} fill={dim(c, C.water)} />
      {[92, 106, 120, 134].map((y, i) => (
        <Path key={y} d={`M${-10 + (i % 2) * 14} ${y}${Array.from({ length: 9 }, () => 'q6 -5 12 0t12 0').join('')}`} stroke={C.white} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.45 - i * 0.05} />
      ))}
      <Path d="M140 60l4 3 4-3M156 52l3 2 3-2" stroke={c.dark ? C.greyLight : C.ink} strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.6} />
    </Vignette>
  )),

  river: art(200, 140, (c) => (
    <Vignette c={c} w={200} h={140} sky="day">
      <Mountain x={50} y={86} w={110} h={40} color={dim(c, '#9AB6C8')} shadeColor={dim(c, '#86A2B6')} />
      <Mountain x={150} y={86} w={130} h={50} color={dim(c, '#9AB6C8')} shadeColor={dim(c, '#86A2B6')} />
      <Rect x={0} y={84} width={200} height={56} fill={c.green(dim(c, '#8DBE6E'))} />
      <Path d="M92 84H104C112 96 86 104 96 116S150 128 156 140H60C80 126 70 112 80 100S86 88 92 84Z" fill={dim(c, C.water)} />
      <Path d="M88 104Q92 110 88 114M112 126Q122 128 128 134" stroke={C.white} strokeWidth={1.6} strokeLinecap="round" opacity={0.6} fill="none" />
      <LeafyTree c={c} x={34} y={118} s={0.42} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
      <LeafyTree c={c} x={164} y={110} s={0.34} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
      <Reeds c={c} x={60} y={132} s={0.8} />
    </Vignette>
  )),

  valley: art(200, 140, (c) => (
    <Vignette c={c} w={200} h={140} sky="day">
      <Path d="M0 30C30 40 60 70 84 110H0Z" fill={dim(c, '#A48A70')} />
      <Path d="M200 24C170 40 140 70 116 110H200Z" fill={dim(c, '#8C765F')} />
      <Path d="M0 60C24 70 48 90 64 116H0Z" fill={dim(c, '#B39A7E')} />
      <Path d="M200 64C176 74 152 92 136 116H200Z" fill={dim(c, '#97806A')} />
      <Path d="M0 112C30 104 60 100 100 100S170 104 200 112V140H0Z" fill={c.green(dim(c, '#8DBE6E'))} />
      <Path d="M100 102C96 112 108 120 98 140H110C116 124 104 114 104 102Z" fill={dim(c, C.sandLight)} />
      <LeafyTree c={c} x={70} y={126} s={0.3} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
      <LeafyTree c={c} x={136} y={124} s={0.26} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
    </Vignette>
  )),

  'city-generic': art(200, 140, (c) => {
    const win = c.dark ? C.goldLight : C.woodLight;
    return (
      <Vignette c={c} w={200} h={140} sky="warm">
        <Path d="M0 100C40 92 80 96 120 92S180 94 200 98V140H0Z" fill={dim(c, '#D9B07A')} />
        <House x={14} y={118} w={26} h={30} color={dim(c, C.sandLight)} shadeColor={dim(c, C.sandDeep)} window={win} />
        <House x={40} y={118} w={22} h={42} color={dim(c, C.cream)} shadeColor={dim(c, C.sandLight)} window={win} dome={dim(c, C.tealMid)} />
        <House x={64} y={118} w={30} h={24} color={dim(c, C.sand)} shadeColor={dim(c, C.sandDeep)} window={win} />
        <Rect x={98} y={64} width={10} height={54} fill={dim(c, C.cream)} />
        <Path d="M96 64H110L103 50Z" fill={dim(c, C.terracotta)} />
        <House x={112} y={118} w={32} h={34} color={dim(c, C.sandLight)} shadeColor={dim(c, C.sandDeep)} window={win} dome={dim(c, C.gold)} />
        <House x={146} y={118} w={22} h={26} color={dim(c, C.cream)} shadeColor={dim(c, C.sandLight)} window={win} />
        <House x={168} y={118} w={24} h={36} color={dim(c, C.sand)} shadeColor={dim(c, C.sandDeep)} window={win} />
        <Rect x={0} y={118} width={200} height={22} fill={dim(c, C.sandDeep)} />
        <Path d="M0 118H200" stroke={dim(c, C.sandDark)} strokeWidth={2} />
      </Vignette>
    );
  }),

  village: art(200, 140, (c) => {
    const win = c.dark ? C.goldLight : C.woodLight;
    return (
      <Vignette c={c} w={200} h={140} sky="day">
        <Path d="M0 90C40 70 90 74 130 84S180 80 200 86V140H0Z" fill={c.green(dim(c, '#9CC77F'))} />
        <Path d="M0 108C60 96 140 100 200 106V140H0Z" fill={c.green(dim(c, '#86B86E'))} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Path key={i} d={`M${120 + i * 14} 102L${110 + i * 18} 140`} stroke={dim(c, '#C9B26A')} strokeWidth={5} opacity={0.6} />
        ))}
        <House x={30} y={112} w={30} h={22} color={dim(c, C.cream)} shadeColor={dim(c, C.sandLight)} window={win} />
        <House x={64} y={108} w={24} h={18} color={dim(c, C.sandLight)} shadeColor={dim(c, C.sandDeep)} window={win} />
        <Palm c={c} x={96} y={112} h={40} lean={4} />
        <LeafyTree c={c} x={16} y={118} s={0.3} leaf={dim(c, C.leaf)} leafDark={dim(c, C.leafDark)} leafLight={dim(c, C.leafLight)} />
        <Path d="M40 140C44 128 50 120 46 112" stroke={dim(c, C.sandLight)} strokeWidth={6} strokeLinecap="round" fill="none" />
      </Vignette>
    );
  }),

  house: art(110, 100, (c) => (
    <>
      <Shadow c={c} cx={55} cy={95} rx={50} ry={5} />
      <Rect x={12} y={30} width={86} height={65} rx={3} fill={C.sandLight} />
      <Rect x={72} y={30} width={26} height={65} fill={C.sandDeep} opacity={0.5} />
      <Path d={`M10 30${Array.from({ length: 9 }, (_, i) => `L${14 + i * 10} 22L${19 + i * 10} 30`).join('')}H100V34H10Z`} fill={C.sand} />
      <Path d={archPath(36, 58, 18, 95)} fill={C.wood} />
      <Path d={archPath(36, 62, 12, 95)} fill={C.woodLight} />
      <Circle cx={40} cy={80} r={1.4} fill={C.gold} />
      <Rect x={58} y={40} width={30} height={30} rx={2} fill={C.woodLight} />
      <Rect x={58} y={66} width={30} height={6} rx={2} fill={C.wood} />
      <Rect x={56} y={38} width={34} height={5} rx={2} fill={C.wood} />
      <G stroke={C.wood} strokeWidth={1.4}>
        <Path d="M63 44V64M68 44V64M73 44V64M78 44V64M83 44V64M60 50H86M60 57H86" />
      </G>
      {c.dark && <Rect x={60} y={44} width={26} height={20} fill={C.goldLight} opacity={0.25} />}
      <Rect x={18} y={40} width={10} height={10} rx={1.5} fill={C.wood} opacity={0.8} />
    </>
  )),

  market: art(180, 110, (c) => {
    const stall = (x: number, a: string, b: string) => (
      <G key={x}>
        <Rect x={x + 2} y={44} width={3} height={58} fill={C.woodDark} />
        <Rect x={x + 49} y={44} width={3} height={58} fill={C.woodDark} />
        <Rect x={x} y={80} width={54} height={22} rx={2} fill={C.woodLight} />
        <Rect x={x} y={80} width={54} height={4} rx={2} fill={C.woodPale} />
        <Path d={`M${x - 4} 50L${x + 4} 34H${x + 50}L${x + 58} 50Z`} fill={a} />
        {[0, 1, 2, 3].map((i) => (
          <Path key={i} d={`M${x + 7 + i * 12} 34H${x + 13 + i * 12}L${x + 10 + i * 15} 50H${x + 3 + i * 15}Z`} fill={b} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <Circle key={i} cx={x + 1 + i * 10.4} cy={50} r={5.2} fill={i % 2 ? a : b} />
        ))}
      </G>
    );
    return (
      <>
        <Shadow c={c} cx={90} cy={104} rx={86} ry={6} />
        {stall(4, C.terracotta, C.cream)}
        {stall(63, C.tealMid, C.cream)}
        {stall(122, C.gold, C.cream)}
        <Path d="M12 80C12 70 30 70 30 80Z" fill={C.woodDark} />
        {[[16, 74], [21, 72], [26, 75], [19, 77], [24, 78]].map(([x, y], i) => (
          <Ellipse key={i} cx={x} cy={y} rx={2.4} ry={3.2} fill="#7A3B1F" />
        ))}
        <Path d="M36 80C34 70 38 64 42 62 46 64 50 70 48 80Z" fill={C.terracotta} />
        <Rect x={40} y={58} width={4} height={6} fill={C.terracotta} />
        <Circle cx={78} cy={74} r={6} fill={C.coral} />
        <Circle cx={90} cy={74} r={6} fill={C.lemon} />
        <Circle cx={84} cy={68} r={6} fill={C.leafLight} />
        <Circle cx={104} cy={74} r={6} fill={C.berry} />
        <Rect x={130} y={70} width={20} height={10} rx={5} fill={C.plum} />
        <Rect x={150} y={66} width={20} height={14} rx={7} fill={C.tealLight} />
        <Rect x={140} y={62} width={18} height={8} rx={4} fill={C.gold} />
      </>
    );
  }),
} satisfies Record<string, ArtDef>;

export { Kaaba3D, Minaret, RockyMountain, Vignette, Well, dim };
