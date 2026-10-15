import { type ReactNode, useCallback, useEffect } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { sparklePath } from '../../art/kit';
import { Icon } from '../../components/ui/Icon';
import { useKitColors, useKitMaybe } from './context';

/*
 * Feedback effects of the kit: shake (wrong), glow (hint / selected), burst (right), check badge, pop and grow-in.
 * Every effect has a reduced-motion path (no movement – at most a short fade) and nothing flashes.
 */

function useReduced(prop?: boolean): boolean {
  const env = useKitMaybe();
  return prop ?? env?.reducedMotion ?? false;
}

/** Gentle horizontal shake for a wrong move. `style` goes on an Animated.View. */
export function useShake(reducedMotion?: boolean) {
  const reduced = useReduced(reducedMotion);
  const x = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const shake = useCallback(() => {
    if (reduced) return;
    x.set(withSequence(withTiming(-8, { duration: 55 }), withTiming(8, { duration: 70 }), withTiming(-5, { duration: 60 }), withTiming(3, { duration: 50 }), withTiming(0, { duration: 45 })));
  }, [reduced, x]);
  return { style, shake };
}

/** Plays a short scale pop whenever `trigger` changes to a value > 0 (fade-free, no movement in reduced motion). */
export function Pop({ trigger, children, style, reducedMotion, amount = 0.12 }: { trigger: number; children: ReactNode; style?: StyleProp<ViewStyle>; reducedMotion?: boolean; amount?: number }) {
  const reduced = useReduced(reducedMotion);
  const s = useSharedValue(1);
  useEffect(() => {
    if (trigger <= 0 || reduced) return;
    s.set(withSequence(withTiming(1 + amount, { duration: 110, easing: Easing.out(Easing.quad) }), withSpring(1, { damping: 9, stiffness: 220 })));
  }, [trigger, reduced, s, amount]);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/** Grows a child in when it mounts (spring); reduced motion: a short fade. */
export function GrowIn({ children, style, delay = 0, reducedMotion, from = 0.4 }: { children: ReactNode; style?: StyleProp<ViewStyle>; delay?: number; reducedMotion?: boolean; from?: number }) {
  const reduced = useReduced(reducedMotion);
  const p = useSharedValue(0);
  useEffect(() => {
    p.set(reduced ? withTiming(1, { duration: 220 }) : withDelay(delay, withSpring(1, { damping: 12, stiffness: 150 })));
  }, [delay, p, reduced]);
  const animated = useAnimatedStyle(() =>
    reduced ? { opacity: p.value } : { opacity: Math.min(1, p.value * 2), transform: [{ scale: from + (1 - from) * p.value }] },
  );
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/**
 * Soft glow around its parent (absolute, behind the content): pulses while `active` (static under reduced motion).
 * Put it as the first child of a relatively positioned view.
 */
export function Glow({ active, color, radius = 18, spread = 6, pulse = true, reducedMotion }: { active: boolean; color?: string; radius?: number; spread?: number; pulse?: boolean; reducedMotion?: boolean }) {
  const reduced = useReduced(reducedMotion);
  const k = useKitColors();
  const o = useSharedValue(0);
  useEffect(() => {
    cancelAnimation(o);
    if (!active) {
      o.set(reduced ? 0 : withTiming(0, { duration: 200 }));
      return;
    }
    o.set(
      reduced || !pulse
        ? withTiming(0.9, { duration: reduced ? 0 : 200 })
        : withRepeat(withSequence(withTiming(1, { duration: 750, easing: Easing.inOut(Easing.quad) }), withTiming(0.35, { duration: 750, easing: Easing.inOut(Easing.quad) })), -1, true),
    );
  }, [active, o, pulse, reduced]);
  const animated = useAnimatedStyle(() => ({ opacity: o.value }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left: -spread, right: -spread, top: -spread, bottom: -spread, borderRadius: radius + spread, borderWidth: 3, borderColor: color ?? k.gold, backgroundColor: k.goldSoft },
        animated,
      ]}
    />
  );
}

const PARTICLES = 10;

function Particle({ i, p, distance, size, colors }: { i: number; p: SharedValue<number>; distance: number; size: number; colors: string[] }) {
  const angle = (i / PARTICLES) * Math.PI * 2 + (i % 2 ? 0.25 : -0.1);
  const far = distance * (i % 3 === 0 ? 1.15 : i % 3 === 1 ? 0.8 : 1);
  const s = size * (i % 2 ? 0.7 : 1);
  const star = i % 2 === 0;
  const color = colors[i % colors.length];
  const animated = useAnimatedStyle(() => {
    const v = p.value;
    const e = 1 - (1 - v) * (1 - v);
    return {
      opacity: v <= 0 || v >= 1 ? 0 : v < 0.15 ? v / 0.15 : 1 - (v - 0.15) / 0.85,
      transform: [{ translateX: Math.cos(angle) * far * e }, { translateY: Math.sin(angle) * far * e + v * v * 10 }, { scale: 0.5 + (1 - v) * 0.7 }, { rotate: `${v * 120}deg` }],
    };
  });
  return (
    <Animated.View style={[styles.particle, { width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2 }, animated]}>
      {star ? (
        <Svg width={s} height={s} viewBox="0 0 20 20">
          <Path d={sparklePath(10, 10, 10, 0.2)} fill={color} />
        </Svg>
      ) : (
        <View style={{ width: s * 0.6, height: s * 0.6, borderRadius: s, backgroundColor: color }} />
      )}
    </Animated.View>
  );
}

/**
 * Particle burst (sparkles and dots in gold and the topic colour) centred in its parent; plays whenever `trigger`
 * changes to a value > 0. Reduced motion: one sparkle fades in and out in place.
 */
export function Burst({ trigger, size = 14, distance = 46, reducedMotion, colors }: { trigger: number; size?: number; distance?: number; reducedMotion?: boolean; colors?: string[] }) {
  const reduced = useReduced(reducedMotion);
  const k = useKitColors();
  const p = useSharedValue(0);
  const fade = useSharedValue(0);
  useEffect(() => {
    if (trigger <= 0) return;
    if (reduced) {
      fade.set(withSequence(withTiming(1, { duration: 150 }), withDelay(300, withTiming(0, { duration: 250 }))));
      return;
    }
    p.set(0);
    p.set(withTiming(1, { duration: 720, easing: Easing.out(Easing.cubic) }));
  }, [fade, p, reduced, trigger]);
  const still = useAnimatedStyle(() => ({ opacity: fade.value }));
  if (trigger <= 0) return null;
  const palette = colors ?? [k.gold, k.accent, k.gold, k.right];
  return (
    <View pointerEvents="none" style={styles.burst}>
      {reduced ? (
        <Animated.View style={[styles.particle, { marginLeft: -size, marginTop: -size }, still]}>
          <Svg width={size * 2} height={size * 2} viewBox="0 0 20 20">
            <Path d={sparklePath(10, 10, 10, 0.2)} fill={k.gold} />
          </Svg>
        </Animated.View>
      ) : (
        Array.from({ length: PARTICLES }, (_, i) => <Particle key={`${trigger}-${i}`} i={i} p={p} distance={distance} size={size} colors={palette} />)
      )}
    </View>
  );
}

/** Round green check that pops onto a corner of its parent when `show` becomes true. */
export function CheckBadge({ show, size = 22, style, reducedMotion }: { show: boolean; size?: number; style?: StyleProp<ViewStyle>; reducedMotion?: boolean }) {
  const reduced = useReduced(reducedMotion);
  const k = useKitColors();
  const s = useSharedValue(show ? 1 : 0);
  useEffect(() => {
    s.set(show ? (reduced ? withTiming(1, { duration: 150 }) : withSpring(1, { damping: 10, stiffness: 240 })) : withTiming(0, { duration: 120 }));
  }, [show, reduced, s]);
  const animated = useAnimatedStyle(() => (reduced ? { opacity: s.value } : { opacity: Math.min(1, s.value * 2), transform: [{ scale: s.value }] }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', top: -size / 3, right: -size / 3, width: size, height: size, borderRadius: size / 2, backgroundColor: k.right, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: k.tileFace }, style, animated]}
    >
      <Icon name="check" size={size * 0.62} color={k.tileFace} strokeWidth={3} />
    </Animated.View>
  );
}

/** Slow continuous float (bobbing) for idle decorations; off under reduced motion. */
export function useFloat(reducedMotion: boolean, amplitude = 4, duration = 1600) {
  const y = useSharedValue(0);
  useEffect(() => {
    if (reducedMotion) {
      cancelAnimation(y);
      y.set(0);
      return;
    }
    y.set(withRepeat(withSequence(withTiming(-amplitude, { duration, easing: Easing.inOut(Easing.sin) }), withTiming(amplitude, { duration, easing: Easing.inOut(Easing.sin) })), -1, true));
    return () => cancelAnimation(y);
  }, [reducedMotion, amplitude, duration, y]);
  return useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
}

const styles = StyleSheet.create({
  burst: { position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 },
  particle: { position: 'absolute', left: 0, top: 0, alignItems: 'center', justifyContent: 'center' },
});
