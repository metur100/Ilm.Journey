import React, { useEffect } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/*
 * Motion primitives of the stage engine. One shared clock per stage runs 0 → 1 every 60 s on the UI thread; every
 * looping motion derives its phase from it, so a whole stage costs a single running animation. Loop periods are
 * rounded to divisors of 60 s so the loop wraps without a jump.
 */

export const STAGE_CYCLE = 60000;
/** Clock value of still pictures (reduced motion): particles are spread over their paths instead of bunched up. */
export const STILL_T = 0.37;

/** Round a loop length to a divisor of the 60 s cycle. */
export function loopPeriod(ms: number): number {
  return STAGE_CYCLE / Math.max(1, Math.round(STAGE_CYCLE / Math.max(200, ms)));
}

export function useStageClock(running: boolean): SharedValue<number> {
  const clock = useSharedValue(STILL_T);
  useEffect(() => {
    if (!running) {
      cancelAnimation(clock);
      clock.value = STILL_T;
      return undefined;
    }
    clock.value = 0;
    clock.value = withRepeat(withTiming(1, { duration: STAGE_CYCLE, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(clock);
  }, [running, clock]);
  return clock;
}

/** A looping motion, all distances in stage units (scaled by `s` when drawn). */
export interface Motion {
  /** Loop length in ms (use `loopPeriod`). */
  period: number;
  /** Phase offset 0..1. */
  offset?: number;
  /** Linear travel over one loop (rain falling, clouds crossing). */
  dx?: number;
  dy?: number;
  /** Sine sway around the path. */
  swayX?: number;
  swayY?: number;
  /** Sway cycles per loop (default 1). */
  cycles?: number;
  /** Static rotation and rotation per loop (degrees). */
  rot?: number;
  spin?: number;
  /** Scale breathing (in phase with `twinkle`). */
  pulse?: number;
  /** Opacity breathing 0..1 (1 = fades fully out once per loop). */
  twinkle?: number;
  /** Scale from → to over the loop (ripples). */
  grow?: [number, number];
  /** Fade in and out over this fraction at both ends of the loop (travelling particles). */
  fade?: number;
  /** Fade out over the loop (ripples). */
  fadeOut?: boolean;
  opacity?: number;
}

const TAU = Math.PI * 2;

export function useMotionStyle(clock: SharedValue<number>, m: Motion, s: number) {
  return useAnimatedStyle(() => {
    const n = Math.max(1, Math.round(STAGE_CYCLE / m.period));
    const p = (clock.value * n + (m.offset ?? 0)) % 1;
    const a = p * TAU * (m.cycles ?? 1);
    const wave = 0.5 + 0.5 * Math.sin(p * TAU);
    const tx = ((m.dx ?? 0) * p + (m.swayX ?? 0) * Math.sin(a)) * s;
    const ty = ((m.dy ?? 0) * p + (m.swayY ?? 0) * Math.cos(a)) * s;
    let scale = m.grow ? m.grow[0] + (m.grow[1] - m.grow[0]) * p : 1 + (m.pulse ?? 0) * (wave - 0.5) * 2;
    if (scale < 0.001) scale = 0.001;
    let opacity = m.opacity ?? 1;
    if (m.twinkle) opacity *= 1 - m.twinkle + m.twinkle * wave;
    if (m.fade) opacity *= Math.max(0, Math.min(1, p / m.fade, (1 - p) / m.fade));
    if (m.fadeOut) opacity *= 1 - p;
    return {
      opacity,
      transform: [{ translateX: tx }, { translateY: ty }, { rotate: `${(m.rot ?? 0) + (m.spin ?? 0) * p}deg` }, { scale }],
    };
  });
}

interface ParticleProps {
  clock: SharedValue<number>;
  /** Stage → pixel scale. */
  s: number;
  /** Centre of the particle at phase 0 (stage units). */
  x: number;
  y: number;
  /** Box size (stage units). */
  w: number;
  h: number;
  motion: Motion;
  children?: React.ReactNode;
  style?: ViewStyle;
}

/** A small moving thing (drop, grain, bubble, leaf, glow …) drawn by its children inside a w × h box. */
export function Particle({ clock, s, x, y, w, h, motion, children, style }: ParticleProps) {
  const animated = useMotionStyle(clock, motion, s);
  return (
    <Animated.View pointerEvents="none" style={[styles.abs, { left: (x - w / 2) * s, top: (y - h / 2) * s, width: w * s, height: h * s }, style, animated]}>
      {children}
    </Animated.View>
  );
}

/** Timeline wrapper: fades its children in at `at` ms and out at `until` ms (static when `animate` is false). */
export function Appear({ at = 0, until, duration = 900, animate, children }: { at?: number; until?: number; duration?: number; animate: boolean; children: React.ReactNode }) {
  const finalOpacity = until !== undefined ? 0 : 1;
  const v = useSharedValue(animate ? (at > 0 ? 0 : 1) : finalOpacity);
  useEffect(() => {
    if (!animate) {
      v.value = finalOpacity;
      return;
    }
    const steps = [] as number[];
    if (at > 0) steps.push(1);
    if (until !== undefined) steps.push(0);
    if (steps.length === 0) return;
    const show = withDelay(at, withTiming(1, { duration }));
    v.value = until !== undefined ? withSequence(show, withDelay(Math.max(0, until - at - duration), withTiming(0, { duration }))) : show;
  }, [animate, at, until, duration, v, finalOpacity]);
  const style = useAnimatedStyle(() => ({ opacity: v.value }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      {children}
    </Animated.View>
  );
}

/** Seeded pseudo-random numbers – stages look the same on every render and in tests. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
});
