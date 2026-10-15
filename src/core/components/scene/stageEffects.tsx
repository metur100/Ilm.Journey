import React, { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import Svg, { Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Cloud, leafPath, sparklePath } from '@/core/art/kit';

import { STAGE_H, STAGE_W, type StageEffect, type StageEffectName } from './stage';
import { loopPeriod, type Motion, Particle, seeded } from './stageMotion';

/*
 * Ambient effect presets of the stage engine (docs/STORIES-V3.md §3). Each preset is a handful of particles driven
 * by the stage clock. Everything is calm: slow loops, soft colours, nothing flashes. Shapes are plain views where
 * possible (cheap on Android) and tiny SVGs where a shape is needed (leaves, sparkles, waves, glows).
 */

export interface EffectEnv {
  clock: SharedValue<number>;
  /** Stage unit → pixels. */
  s: number;
  /** The stage sky is dark (night, dusk, storm, sea). */
  dark: boolean;
}

/** Default draw order of effects (layers default to 10, 20, 30 …). */
export const EFFECT_Z: Record<StageEffectName, number> = {
  stars: 1,
  sunrays: 2,
  clouds: 3,
  birds: 4,
  lightBeam: 95,
  waves: 100,
  rain: 100,
  wind: 100,
  sand: 100,
  sparkle: 100,
  fireflies: 100,
  lanternGlow: 100,
  ripples: 100,
  dust: 100,
  bubbles: 100,
  flameGlow: 100,
  leaves: 100,
  mist: 100,
};

const COUNT = (e: StageEffect, counts: [number, number, number]) => counts[(e.intensity ?? 2) - 1];
const pick = <T,>(r: () => number, list: readonly T[]) => list[Math.floor(r() * list.length) % list.length];

interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

const region = (e: StageEffect, d: Region): Region => ({ x: e.x ?? d.x, y: e.y ?? d.y, w: e.w ?? d.w, h: e.h ?? d.h });

/** Soft round glow (radial gradient) of radius r, drawn in a 2r box. */
function GlowDisc({ r, color, opacity = 1, s }: { r: number; color: string; opacity?: number; s: number }) {
  const id = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg width={2 * r * s} height={2 * r * s} viewBox={`0 0 ${2 * r} ${2 * r}`}>
      <Defs>
        <RadialGradient id={id} cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="0.45" stopColor={color} stopOpacity={opacity * 0.4} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={2 * r} height={2 * r} fill={`url(#${id})`} />
    </Svg>
  );
}

function Dot({ size, color, s, ring }: { size: number; color: string; s: number; ring?: boolean }) {
  const px = Math.max(1, size * s);
  return (
    <View
      style={
        ring
          ? { width: px, height: px, borderRadius: px / 2, borderWidth: Math.max(1, 0.7 * s), borderColor: color, backgroundColor: 'rgba(255,255,255,0.12)' }
          : { width: px, height: px, borderRadius: px / 2, backgroundColor: color }
      }
    />
  );
}

const center = StyleSheet.create({ c: { flex: 1, alignItems: 'center', justifyContent: 'center' } }).c;

// ---------------------------------------------------------------------------------------------------------------

function Stars({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const r = seeded(11);
  const reg = region(e, { x: 0, y: 0, w: STAGE_W, h: 120 });
  const n = COUNT(e, [12, 20, 30]);
  const color = e.color ?? '#FFFFFF';
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const size = 1.2 + r() * 1.6;
        const big = i % 7 === 0;
        const m: Motion = { period: loopPeriod(3000 + r() * 4000), offset: r(), twinkle: big ? 0.5 : 0.75, pulse: big ? 0.25 : 0 };
        const x = reg.x + r() * reg.w;
        const y = reg.y + r() * reg.h;
        return big ? (
          <Particle key={i} clock={env.clock} s={env.s} x={x} y={y} w={12} h={12} motion={m}>
            <Svg width={12 * env.s} height={12 * env.s} viewBox="0 0 12 12">
              <Path d={sparklePath(6, 6, 6, 0.16)} fill={e.color ?? '#FFF3C4'} />
            </Svg>
          </Particle>
        ) : (
          <Particle key={i} clock={env.clock} s={env.s} x={x} y={y} w={size} h={size} motion={m}>
            <Dot size={size} color={color} s={env.s} />
          </Particle>
        );
      })}
    </>
  );
}

function Sunrays({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const R = 170 * ((e.intensity ?? 2) / 2 + 0.25);
  const x = e.x ?? 320;
  const y = e.y ?? 50;
  const color = e.color ?? '#FFE9A8';
  const id = `r${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a0 = (i / 12) * Math.PI * 2;
    const a1 = a0 + 0.13;
    return `M${R} ${R}L${R + Math.cos(a0) * R} ${R + Math.sin(a0) * R}L${R + Math.cos(a1) * R} ${R + Math.sin(a1) * R}Z`;
  }).join('');
  return (
    <Particle clock={env.clock} s={env.s} x={x} y={y} w={2 * R} h={2 * R} motion={{ period: 60000, spin: 360, twinkle: 0.3, opacity: env.dark ? 0.35 : 0.55 }}>
      <Svg width={2 * R * env.s} height={2 * R * env.s} viewBox={`0 0 ${2 * R} ${2 * R}`}>
        <Defs>
          <RadialGradient id={id} cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
            <Stop offset="0" stopColor={color} stopOpacity={0.7} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Path d={rays} fill={`url(#${id})`} />
      </Svg>
    </Particle>
  );
}

function Clouds({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const r = seeded(23);
  const n = COUNT(e, [2, 3, 4]);
  const reg = region(e, { x: 0, y: 14, w: STAGE_W, h: 80 });
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const w = 90 + r() * 60;
        const h = w * 0.55;
        const m: Motion = { period: loopPeriod(i % 2 ? 60000 : 30000), offset: (i / n + r() * 0.2) % 1, dx: STAGE_W + w * 2, fade: 0.06, opacity: env.dark ? 0.3 : 0.9 };
        return (
          <Particle key={i} clock={env.clock} s={env.s} x={-w} y={reg.y + r() * reg.h} w={w} h={h} motion={m}>
            <Svg width={w * env.s} height={h * env.s} viewBox="0 0 100 55">
              <Cloud x={50} y={24} r={36} color={e.color ?? '#FFFFFF'} shadeColor={env.dark ? '#9AA3C8' : '#DCE8F2'} />
            </Svg>
          </Particle>
        );
      })}
    </>
  );
}

function Birds({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const r = seeded(31);
  const n = COUNT(e, [1, 2, 3]);
  const reg = region(e, { x: 0, y: 24, w: STAGE_W, h: 70 });
  const color = e.color ?? (env.dark ? '#E8E6F5' : '#3A3F66');
  const wing = (x: number, y: number, k: number) => `M${x - 6 * k} ${y - 2 * k}Q${x - 3 * k} ${y - 4 * k} ${x} ${y}Q${x + 3 * k} ${y - 4 * k} ${x + 6 * k} ${y - 2 * k}`;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const flock = 3 + Math.floor(r() * 3);
        const pts = Array.from({ length: flock }, (_, j) => [10 + j * 9 + r() * 4, 10 + (j % 2) * 6 + r() * 4, 0.8 + r() * 0.4] as const);
        const m: Motion = { period: loopPeriod(i % 2 ? 30000 : 20000), offset: (i * 0.45 + r() * 0.2) % 1, dx: STAGE_W + 140, swayY: 4, cycles: 3, fade: 0.05 };
        return (
          <Particle key={i} clock={env.clock} s={env.s} x={-60} y={reg.y + r() * reg.h} w={60} h={30} motion={m}>
            <Svg width={60 * env.s} height={30 * env.s} viewBox="0 0 60 30">
              {pts.map(([x, y, k], j) => (
                <Path key={j} d={wing(x, y, k)} stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
              ))}
            </Svg>
          </Particle>
        );
      })}
    </>
  );
}

function Waves({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const n = COUNT(e, [2, 3, 4]);
  const y0 = e.y ?? 190;
  const L = 80;
  const W = STAGE_W + 2 * L;
  const base = e.color ?? (env.dark ? '#2A5F8F' : '#4FA3D1');
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const y = y0 + i * 14;
        const amp = 4 + i;
        const crest = Array.from({ length: Math.ceil(W / L) + 1 }, () => `q${L / 4} ${-amp} ${L / 2} 0t${L / 2} 0`).join('');
        const m: Motion = { period: loopPeriod(5000 + i * 1500), dx: i % 2 ? L : -L, swayY: 1.5, offset: i * 0.3 };
        return (
          <Particle key={i} clock={env.clock} s={env.s} x={i % 2 ? STAGE_W / 2 - L : STAGE_W / 2} y={y + 20} w={W} h={40} motion={m}>
            <Svg width={W * env.s} height={40 * env.s} viewBox={`0 0 ${W} 40`}>
              <Path d={`M0 12${crest}V40H0Z`} fill={base} opacity={0.32 + i * 0.08} />
              <Path d={`M0 12${crest}`} stroke="#FFFFFF" strokeOpacity={env.dark ? 0.35 : 0.6} strokeWidth={2} strokeLinecap="round" fill="none" />
            </Svg>
          </Particle>
        );
      })}
    </>
  );
}

function Ripples({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const n = COUNT(e, [2, 3, 4]);
  const k = (e.intensity ?? 2) / 2;
  const rx = (e.w ?? 60) / 2;
  const ry = rx * 0.24;
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <Particle key={i} clock={env.clock} s={env.s} x={e.x ?? 200} y={e.y ?? 200} w={rx * 2 + 4} h={ry * 2 + 4} motion={{ period: loopPeriod(3600), offset: i / n, grow: [0.15, 1.1], fadeOut: true, opacity: 0.55 + 0.2 * k }}>
          <Svg width={(rx * 2 + 4) * env.s} height={(ry * 2 + 4) * env.s} viewBox={`0 0 ${rx * 2 + 4} ${ry * 2 + 4}`}>
            <Ellipse cx={rx + 2} cy={ry + 2} rx={rx} ry={ry} stroke={e.color ?? '#FFFFFF'} strokeWidth={1.6} fill="none" />
          </Svg>
        </Particle>
      ))}
    </>
  );
}

function Rain({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const r = seeded(41);
  const n = COUNT(e, [14, 26, 40]);
  const reg = region(e, { x: 0, y: 0, w: STAGE_W, h: STAGE_H });
  const color = e.color ?? (env.dark ? '#B8C8DE' : '#E4EEF8');
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const fall = reg.h + 30;
        const m: Motion = { period: loopPeriod(pick(r, [1000, 1200, 1500])), offset: r(), dx: -fall * 0.25, dy: fall, rot: 14, fade: 0.08, opacity: 0.45 + r() * 0.3 };
        return (
          <Particle key={i} clock={env.clock} s={env.s} x={reg.x + r() * (reg.w + 60)} y={reg.y - 15} w={1.6} h={14} motion={m}>
            <View style={{ flex: 1, borderRadius: 1, backgroundColor: color }} />
          </Particle>
        );
      })}
    </>
  );
}

function Wind({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const r = seeded(53);
  const n = COUNT(e, [5, 8, 12]);
  const reg = region(e, { x: 0, y: 30, w: STAGE_W, h: 170 });
  const color = e.color ?? '#FFFFFF';
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const len = 50 + r() * 70;
        const m: Motion = { period: loopPeriod(3000 + r() * 2500), offset: r(), dx: reg.w + 220, swayY: 4, fade: 0.3, opacity: env.dark ? 0.35 : 0.55 };
        return (
          <Particle key={i} clock={env.clock} s={env.s} x={reg.x - 110} y={reg.y + r() * reg.h} w={len} h={2} motion={m}>
            <View style={{ flex: 1, borderRadius: 2, backgroundColor: color }} />
          </Particle>
        );
      })}
    </>
  );
}

function Sand({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const r = seeded(61);
  const n = COUNT(e, [10, 18, 28]);
  const reg = region(e, { x: 0, y: 165, w: STAGE_W, h: 70 });
  const color = e.color ?? '#F3DDB3';
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const big = i % 6 === 0;
        const m: Motion = big
          ? { period: loopPeriod(5000), offset: r(), dx: reg.w + 200, dy: -8, swayY: 3, fade: 0.3, opacity: 0.35 }
          : { period: loopPeriod(2000 + r() * 1500), offset: r(), dx: 220 + r() * 120, dy: -10 - r() * 14, swayY: 3, cycles: 2, fade: 0.2, opacity: 0.7 };
        const x = big ? reg.x - 100 : reg.x + r() * reg.w - 120;
        return (
          <Particle key={i} clock={env.clock} s={env.s} x={x} y={reg.y + r() * reg.h} w={big ? 70 : 2.6} h={big ? 3 : 1.4} motion={m}>
            <View style={{ flex: 1, borderRadius: 2, backgroundColor: color }} />
          </Particle>
        );
      })}
    </>
  );
}

function Dust({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const r = seeded(71);
  const n = COUNT(e, [8, 14, 20]);
  const reg = region(e, { x: 0, y: 30, w: STAGE_W, h: 200 });
  const color = e.color ?? '#FFF1C9';
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const size = 1.4 + r() * 1.6;
        const m: Motion = { period: loopPeriod(10000 + r() * 6000), offset: r(), dx: 24, dy: -20, swayX: 6, swayY: 3, fade: 0.3, opacity: 0.55 };
        return (
          <Particle key={i} clock={env.clock} s={env.s} x={reg.x + r() * reg.w} y={reg.y + r() * reg.h} w={size} h={size} motion={m}>
            <Dot size={size} color={color} s={env.s} />
          </Particle>
        );
      })}
    </>
  );
}

function Fireflies({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const r = seeded(83);
  const n = COUNT(e, [5, 8, 12]);
  const reg = region(e, { x: 20, y: 90, w: STAGE_W - 40, h: 140 });
  const color = e.color ?? '#FFE38A';
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const m: Motion = { period: loopPeriod(5000 + r() * 4000), offset: r(), swayX: 10 + r() * 8, swayY: 6 + r() * 6, cycles: 1, twinkle: 0.85, pulse: 0.2 };
        return (
          <Particle key={i} clock={env.clock} s={env.s} x={reg.x + r() * reg.w} y={reg.y + r() * reg.h} w={12} h={12} motion={m}>
            <View style={center}>
              <View style={{ position: 'absolute', width: 12 * env.s, height: 12 * env.s, borderRadius: 6 * env.s, backgroundColor: color, opacity: 0.22 }} />
              <Dot size={3} color={color} s={env.s} />
            </View>
          </Particle>
        );
      })}
    </>
  );
}

function Bubbles({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const r = seeded(97);
  const n = COUNT(e, [6, 10, 16]);
  const reg = region(e, { x: 30, y: 40, w: STAGE_W - 60, h: 200 });
  const color = e.color ?? 'rgba(220,240,255,0.85)';
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const size = 3 + r() * 6;
        const m: Motion = { period: loopPeriod(5000 + r() * 4000), offset: r(), dy: -(reg.h + 20), swayX: 4 + r() * 4, cycles: 2, fade: 0.12, opacity: 0.85 };
        return (
          <Particle key={i} clock={env.clock} s={env.s} x={reg.x + r() * reg.w} y={reg.y + reg.h + 10} w={size} h={size} motion={m}>
            <Dot size={size} color={color} s={env.s} ring />
          </Particle>
        );
      })}
    </>
  );
}

function Sparkle({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const r = seeded(101);
  const n = COUNT(e, [4, 6, 9]);
  const cx = e.x ?? 200;
  const cy = e.y ?? 130;
  const rw = (e.w ?? 120) / 2;
  const rh = (e.h ?? 80) / 2;
  const color = e.color ?? '#FFE9A8';
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const size = 7 + r() * 8;
        const m: Motion = { period: loopPeriod(2400 + r() * 2400), offset: r(), twinkle: 1, pulse: 0.55, rot: r() * 30 };
        return (
          <Particle key={i} clock={env.clock} s={env.s} x={cx + (r() * 2 - 1) * rw} y={cy + (r() * 2 - 1) * rh} w={size} h={size} motion={m}>
            <Svg width={size * env.s} height={size * env.s} viewBox="0 0 20 20">
              <Path d={sparklePath(10, 10, 10, 0.16)} fill={color} />
            </Svg>
          </Particle>
        );
      })}
    </>
  );
}

function Leaves({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const r = seeded(113);
  const n = COUNT(e, [4, 6, 9]);
  const reg = region(e, { x: 0, y: 20, w: STAGE_W, h: 210 });
  const colors = e.color ? [e.color] : ['#6DB36D', '#4E9A5B', '#A6D38D', '#D9B44A'];
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const m: Motion = { period: loopPeriod(8000 + r() * 5000), offset: r(), dx: 30 + r() * 30, dy: reg.h + 20, swayX: 16, cycles: 2, spin: (r() > 0.5 ? 1 : -1) * 300, fade: 0.08 };
        return (
          <Particle key={i} clock={env.clock} s={env.s} x={reg.x + r() * reg.w} y={reg.y - 10} w={12} h={12} motion={m}>
            <Svg width={12 * env.s} height={12 * env.s} viewBox="0 0 24 24">
              <Path d={leafPath(3, 12, 18, 6, 0)} fill={pick(r, colors)} />
            </Svg>
          </Particle>
        );
      })}
    </>
  );
}

function Mist({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const r = seeded(127);
  const n = COUNT(e, [2, 3, 4]);
  const reg = region(e, { x: 0, y: 120, w: STAGE_W, h: 110 });
  const color = e.color ?? (env.dark ? '#B9C3E6' : '#FFFFFF');
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const w = 240 + r() * 120;
        const m: Motion = { period: loopPeriod(i % 2 ? 30000 : 20000), offset: r(), dx: i % 2 ? 140 : -140, fade: 0.35, opacity: env.dark ? 0.4 : 0.6 };
        return (
          <Particle key={i} clock={env.clock} s={env.s} x={reg.x + r() * reg.w} y={reg.y + r() * reg.h} w={w} h={50} motion={m}>
            <MistBand w={w} s={env.s} color={color} />
          </Particle>
        );
      })}
    </>
  );
}

function MistBand({ w, s, color }: { w: number; s: number; color: string }) {
  const id = `m${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg width={w * s} height={50 * s} viewBox={`0 0 ${w} 50`}>
      <Defs>
        <RadialGradient id={id} cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
          <Stop offset="0" stopColor={color} stopOpacity={0.55} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={w / 2} cy={25} rx={w / 2} ry={25} fill={`url(#${id})`} />
    </Svg>
  );
}

function LanternGlow({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const R = [30, 46, 64][(e.intensity ?? 2) - 1];
  return (
    <Particle clock={env.clock} s={env.s} x={e.x ?? 200} y={e.y ?? 120} w={2 * R} h={2 * R} motion={{ period: loopPeriod(4000), pulse: 0.07, twinkle: 0.35, offset: ((e.x ?? 0) % 97) / 97 }}>
      <GlowDisc r={R} color={e.color ?? '#FFD27A'} opacity={0.85} s={env.s} />
    </Particle>
  );
}

function FlameGlow({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const x = e.x ?? 200;
  const y = e.y ?? 170;
  const k = (e.intensity ?? 2) / 2;
  const r = seeded(139);
  return (
    <>
      {/* The cool, safe halo (21:69) breathes slowly around a gentle warm flicker. */}
      <Particle clock={env.clock} s={env.s} x={x} y={y - 10} w={200 * k} h={200 * k} motion={{ period: loopPeriod(6000), pulse: 0.05, twinkle: 0.25 }}>
        <GlowDisc r={100 * k} color={e.color ?? '#9ED8F0'} opacity={0.55} s={env.s} />
      </Particle>
      <Particle clock={env.clock} s={env.s} x={x} y={y} w={90 * k} h={90 * k} motion={{ period: loopPeriod(1500), pulse: 0.06, twinkle: 0.35 }}>
        <GlowDisc r={45 * k} color="#FFC46B" opacity={0.7} s={env.s} />
      </Particle>
      {Array.from({ length: 5 }, (_, i) => (
        <Particle key={i} clock={env.clock} s={env.s} x={x + (r() * 2 - 1) * 30 * k} y={y} w={3} h={3} motion={{ period: loopPeriod(3000 + r() * 2000), offset: r(), dy: -70 * k, swayX: 6, fade: 0.25, opacity: 0.8 }}>
          <Dot size={3} color="#FFE9A8" s={env.s} />
        </Particle>
      ))}
    </>
  );
}

function LightBeam({ e, env }: { e: StageEffect; env: EffectEnv }) {
  const x = e.x ?? 200;
  const bottom = e.y ?? STAGE_H;
  const k = (e.intensity ?? 2) / 2;
  const top = 26 * k;
  const base = 110 * k;
  const color = e.color ?? '#FFF3C4';
  const id = `b${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const r = seeded(151);
  return (
    <>
      <Particle clock={env.clock} s={env.s} x={x} y={bottom / 2} w={base} h={bottom} motion={{ period: loopPeriod(6000), twinkle: 0.35, opacity: env.dark ? 0.75 : 0.6 }}>
        <Svg width={base * env.s} height={bottom * env.s} viewBox={`0 0 ${base} ${bottom}`}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.65} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={`M${base / 2 - top / 2} 0H${base / 2 + top / 2}L${base} ${bottom}H0Z`} fill={`url(#${id})`} />
        </Svg>
      </Particle>
      {Array.from({ length: 4 }, (_, i) => (
        <Particle key={i} clock={env.clock} s={env.s} x={x + (r() * 2 - 1) * base * 0.3} y={bottom * (0.3 + r() * 0.6)} w={2.5} h={2.5} motion={{ period: loopPeriod(9000 + r() * 4000), offset: r(), dy: -30, swayX: 4, fade: 0.3, opacity: 0.8 }}>
          <Dot size={2.5} color={color} s={env.s} />
        </Particle>
      ))}
    </>
  );
}

const RENDERERS: Record<StageEffectName, (p: { e: StageEffect; env: EffectEnv }) => React.ReactElement> = {
  stars: Stars,
  sunrays: Sunrays,
  clouds: Clouds,
  birds: Birds,
  waves: Waves,
  ripples: Ripples,
  rain: Rain,
  wind: Wind,
  sand: Sand,
  dust: Dust,
  fireflies: Fireflies,
  bubbles: Bubbles,
  sparkle: Sparkle,
  leaves: Leaves,
  mist: Mist,
  lanternGlow: LanternGlow,
  flameGlow: FlameGlow,
  lightBeam: LightBeam,
};

/** One effect preset (unknown names render nothing). */
export function StageEffectView({ effect, env }: { effect: StageEffect; env: EffectEnv }) {
  const Renderer = RENDERERS[effect.type];
  if (!Renderer) return null;
  return <Renderer e={effect} env={env} />;
}
