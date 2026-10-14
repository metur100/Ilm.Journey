import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Icon } from '@/core/components/ui/Icon';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { formatClock } from './scoring';

/*
 * Small visual effects shared by the Salah games. Every effect has a reduced-motion path (no movement, at most a
 * short fade) and never flashes.
 */

/** Gentle horizontal shake for a wrong move (no movement with reduced motion). */
export function useShake(reducedMotion: boolean) {
  const x = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const shake = useCallback(() => {
    if (reducedMotion) return;
    x.set(
      withSequence(
        withTiming(-7, { duration: 55 }),
        withTiming(7, { duration: 70 }),
        withTiming(-4, { duration: 60 }),
        withTiming(0, { duration: 55 }),
      ),
    );
  }, [reducedMotion, x]);
  return { style, shake };
}

/** A burst of `ui.sparkle` pieces whenever `trigger` increases (a soft fade with reduced motion). */
export function Sparkles({ trigger, reducedMotion, size = 120 }: { trigger: number; reducedMotion: boolean; size?: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    if (trigger <= 0) return;
    p.set(0);
    p.set(withTiming(1, { duration: reducedMotion ? 450 : 750, easing: Easing.out(Easing.cubic) }));
  }, [trigger, reducedMotion, p]);
  const pieces = [
    { dx: -0.32, dy: -0.3, s: 0.34 },
    { dx: 0.3, dy: -0.26, s: 0.28 },
    { dx: 0.34, dy: 0.24, s: 0.22 },
    { dx: -0.28, dy: 0.28, s: 0.25 },
    { dx: 0, dy: -0.42, s: 0.2 },
  ];
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
      {pieces.map((piece, i) => (
        <SparklePiece key={i} p={p} size={size} piece={piece} reducedMotion={reducedMotion} />
      ))}
    </View>
  );
}

function SparklePiece({
  p,
  size,
  piece,
  reducedMotion,
}: {
  p: SharedValue<number>;
  size: number;
  piece: { dx: number; dy: number; s: number };
  reducedMotion: boolean;
}) {
  const art = Math.round(size * piece.s);
  const style = useAnimatedStyle(() => {
    const v = p.value;
    const visible = v > 0 && v < 1;
    const travel = reducedMotion ? 1 : 0.4 + v * 0.6;
    return {
      opacity: visible ? (v < 0.3 ? v / 0.3 : 1 - (v - 0.3) / 0.7) : 0,
      transform: [
        { translateX: piece.dx * size * travel },
        { translateY: piece.dy * size * travel },
        { scale: reducedMotion ? 1 : 0.5 + v * 0.7 },
      ],
    };
  });
  return (
    <Animated.View style={[styles.abs, style]}>
      <Art name="ui.sparkle" size={art} />
    </Animated.View>
  );
}

/** Expanding water ring (a calm fade with reduced motion). */
export function Ripple({ trigger, color, reducedMotion }: { trigger: number; color: string; reducedMotion: boolean }) {
  const p = useSharedValue(0);
  useEffect(() => {
    if (trigger <= 0) return;
    p.set(0);
    p.set(withTiming(1, { duration: reducedMotion ? 400 : 800, easing: Easing.out(Easing.quad) }));
  }, [trigger, reducedMotion, p]);
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
      <RippleRing p={p} delay={0} color={color} reducedMotion={reducedMotion} />
      <RippleRing p={p} delay={0.25} color={color} reducedMotion={reducedMotion} />
    </View>
  );
}

function RippleRing({ p, delay, color, reducedMotion }: { p: SharedValue<number>; delay: number; color: string; reducedMotion: boolean }) {
  const style = useAnimatedStyle(() => {
    const v = Math.max(0, Math.min(1, (p.value - delay) / (1 - delay)));
    return {
      opacity: v > 0 && v < 1 ? 0.75 * (1 - v) : 0,
      transform: [{ scale: reducedMotion ? 1 : 0.4 + v * 0.9 }],
    };
  });
  return <Animated.View style={[styles.ring, { borderColor: color }, style]} />;
}

/** Soft pulsing glow border around a hint target (a steady border with reduced motion). */
export function HintGlow({ active, reducedMotion, children, style }: { active: boolean; reducedMotion: boolean; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (active && !reducedMotion) {
      pulse.set(withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0.3, { duration: 700 })), -1));
    } else {
      cancelAnimation(pulse);
      pulse.set(active ? 1 : 0);
    }
  }, [active, reducedMotion, pulse]);
  const glow = useAnimatedStyle(() => ({ opacity: active ? 0.35 + pulse.value * 0.65 : 0 }));
  return (
    <View style={style}>
      <Animated.View pointerEvents="none" style={[styles.glow, { borderColor: c.gold, backgroundColor: c.goldSoft }, glow]} />
      {children}
    </View>
  );
}

const useDotStyles = makeStyles((c) => ({
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.track },
  done: { backgroundColor: c.primary },
  current: { width: 22, backgroundColor: c.gold },
}));

/** Progress dots: done (teal), current (wide gold), open (track). */
export function ProgressDots({ total, done, label }: { total: number; done: number; label: string }) {
  const styles = useDotStyles();
  return (
    <View style={styles.row} accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: total, now: done }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.dot, i < done && styles.done, i === done && styles.current]} />
      ))}
    </View>
  );
}

/** Challenge mode only: a calm stopwatch (counts up – there is never a "time's up"). */
export function useStopwatch(active: boolean): { elapsed: () => number; ms: number } {
  const [start] = useState(() => Date.now());
  const [ms, setMs] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setMs(Date.now() - start), 1000);
    return () => clearInterval(id);
  }, [active, start]);
  return { elapsed: () => Date.now() - start, ms };
}

const useClockStyles = makeStyles((c) => ({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: c.goldSoft,
    borderWidth: 1,
    borderColor: c.goldBorder,
  },
}));

export function ChallengeClock({ ms, label }: { ms: number; label: string }) {
  const { c } = useTheme();
  const styles = useClockStyles();
  return (
    <View style={styles.pill} accessible accessibilityLabel={`${label} ${formatClock(ms)}`}>
      <Icon name="flame" size={14} color={c.goldText} />
      <AppText variant="tiny" color={c.goldText}>
        {formatClock(ms)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  abs: { position: 'absolute' },
  ring: { position: 'absolute', width: '90%', aspectRatio: 1, borderRadius: 999, borderWidth: 3 },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius.lg, borderWidth: 3, margin: -4 },
});
