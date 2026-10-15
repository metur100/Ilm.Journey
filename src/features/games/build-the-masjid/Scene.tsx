import { type ReactNode, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Art } from '@/core/art';
import { makeStyles, radius, useTheme } from '@/core/theme';

import { type Appear, LAYER_ORDER, outlinePoints, PARTS, type PartId, project, SITE, slotBox } from './logic';

export type MasjidTime = 'morning' | 'noon' | 'evening';

const useStyles = makeStyles((c) => ({
  stage: { position: 'absolute', borderRadius: radius.lg, overflow: 'hidden', backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.border },
}));

const LAYER_PART: Record<string, PartId> = Object.fromEntries(
  (Object.keys(PARTS) as PartId[]).flatMap((id) => PARTS[id].layers.map((layer) => [layer, id] as const)),
);

/** One art layer of the scene; it appears with its part's motion (settle, rise from the ground, drop from above). */
function Layer({ name, appear, width, height, reducedMotion }: { name: string; appear: Appear; width: number; height: number; reducedMotion: boolean }) {
  const p = useSharedValue(0);
  const part = LAYER_PART[name];
  const box = slotBox(part);
  // Rising parts grow up from their ground line.
  const originY = `${Math.round(((box.y + box.h) / SITE.h) * 100)}%`;

  useEffect(() => {
    p.value = reducedMotion ? withTiming(1, { duration: 260 }) : withSpring(1, { damping: appear === 'rise' ? 10 : 13, stiffness: 120, mass: 0.8 });
  }, [appear, p, reducedMotion]);

  const style = useAnimatedStyle(() => {
    const v = p.value;
    const opacity = Math.min(1, v * 1.8);
    if (reducedMotion) return { opacity: v };
    if (appear === 'rise') return { opacity, transform: [{ scaleY: 0.08 + 0.92 * v }] };
    if (appear === 'drop') return { opacity, transform: [{ translateY: -(1 - v) * height * 0.22 }] };
    return { opacity, transform: [{ scale: 1.035 - 0.035 * v }] };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: ['50%', originY, 0] }, style]} pointerEvents="none">
      <Art name={name} size={width} height={height} />
    </Animated.View>
  );
}

/** Pulsing outline of the place where the guided part belongs (level 1). */
function SlotGlow({ part, width, height, reducedMotion }: { part: PartId; width: number; height: number; reducedMotion: boolean }) {
  const { c } = useTheme();
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (reducedMotion) return;
    pulse.value = withRepeat(withSequence(withTiming(0.35, { duration: 750, easing: Easing.inOut(Easing.quad) }), withTiming(1, { duration: 750, easing: Easing.inOut(Easing.quad) })), -1);
  }, [pulse, reducedMotion]);
  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const d = `M${outlinePoints(part)
    .map((p) => `${p.x} ${p.y}`)
    .join('L')}Z`;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width={width} height={height} viewBox={`0 0 ${SITE.w} ${SITE.h}`}>
        <Path d={d} fill={c.gold} fillOpacity={0.22} stroke={c.gold} strokeWidth={2.2} strokeDasharray="7 4" strokeLinejoin="round" />
      </Svg>
    </Animated.View>
  );
}

/** The qibla arrow on the courtyard floor: to the back (north, Jerusalem) or to the front (south, the Kaʿbah). */
function FloorArrow({ to, width, height, reducedMotion }: { to: 'north' | 'south'; width: number; height: number; reducedMotion: boolean }) {
  const { c } = useTheme();
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = 0;
    p.value = reducedMotion ? withTiming(1, { duration: 200 }) : withSpring(1, { damping: 12 });
  }, [p, reducedMotion, to]);
  const style = useAnimatedStyle(() => ({ opacity: Math.min(1, p.value * 1.5), transform: [{ scale: reducedMotion ? 1 : 0.6 + 0.4 * p.value }] }));
  const [tail, tip] = to === 'north' ? [0.7, 0.48] : [0.5, 0.72];
  const dir = Math.sign(tip - tail);
  const pts = [
    project(0.485, tail),
    project(0.485, tip - dir * 0.07),
    project(0.45, tip - dir * 0.07),
    project(0.5, tip),
    project(0.55, tip - dir * 0.07),
    project(0.515, tip - dir * 0.07),
    project(0.515, tail),
  ];
  const centre = project(0.5, (tail + tip) / 2);
  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { transformOrigin: [`${(centre.x / SITE.w) * 100}%`, `${(centre.y / SITE.h) * 100}%`, 0] }, style]}
      pointerEvents="none"
    >
      <Svg width={width} height={height} viewBox={`0 0 ${SITE.w} ${SITE.h}`}>
        <Path d={`M${pts.map((q) => `${q.x} ${q.y}`).join('L')}Z`} fill={c.gold} stroke={c.goldText} strokeWidth={1.2} strokeLinejoin="round" />
      </Svg>
    </Animated.View>
  );
}

const PARTICLES = 10;

/** A short burst of sparks where a part has just snapped in (a soft glow under reduced motion). */
export function Burst({ x, y, colors, reducedMotion, spread = 38 }: { x: number; y: number; colors: string[]; reducedMotion: boolean; spread?: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withTiming(1, { duration: reducedMotion ? 500 : 720, easing: Easing.out(Easing.cubic) });
  }, [p, reducedMotion]);
  const ring = useAnimatedStyle(() => ({ opacity: 0.55 * (1 - p.value), transform: [{ scale: 0.4 + p.value * 1.4 }] }));
  return (
    <View style={{ position: 'absolute', left: x, top: y }} pointerEvents="none">
      <Animated.View style={[{ position: 'absolute', left: -28, top: -28, width: 56, height: 56, borderRadius: 28, backgroundColor: colors[0] }, ring]} />
      {reducedMotion ? null : Array.from({ length: PARTICLES }, (_, i) => <Spark key={i} p={p} angle={(i / PARTICLES) * Math.PI * 2 + 0.3} spread={spread * (i % 2 ? 0.75 : 1)} color={colors[i % colors.length]} />)}
    </View>
  );
}

function Spark({ p, angle, spread, color }: { p: { value: number }; angle: number; spread: number; color: string }) {
  const style = useAnimatedStyle(() => ({
    opacity: 1 - p.value,
    transform: [{ translateX: Math.cos(angle) * spread * p.value }, { translateY: Math.sin(angle) * spread * p.value - 12 * p.value }, { scale: 1 - 0.5 * p.value }],
  }));
  return <Animated.View style={[{ position: 'absolute', left: -3.5, top: -3.5, width: 7, height: 7, borderRadius: 3.5, backgroundColor: color }, style]} />;
}

/** Gentle entrance for overlays inside the scene (the qibla dial). */
export function FadeUp({ children, reducedMotion, delay = 0 }: { children: ReactNode; reducedMotion: boolean; delay?: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration: reducedMotion ? 200 : 420, easing: Easing.out(Easing.cubic) }));
  }, [delay, p, reducedMotion]);
  const style = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: reducedMotion ? 0 : (1 - p.value) * 12 }] }));
  return <Animated.View style={style}>{children}</Animated.View>;
}

export interface SceneProps {
  x: number;
  y: number;
  width: number;
  height: number;
  time: MasjidTime;
  placed: readonly PartId[];
  /** The part whose place glows (guided level). */
  glow: PartId | null;
  /** The qibla arrow on the floor (level 3). */
  qibla: 'north' | 'south' | null;
  burst: { key: number; x: number; y: number; part: PartId } | null;
  reducedMotion: boolean;
  label: string;
  children?: ReactNode;
}

/**
 * The building site: sky and Madinah by the time of day, the parts as stacked art layers in their drawing order, palms
 * in front for depth, the glowing slot, the floor arrow of the qibla and the sparks of the last placement.
 */
export function Scene({ x, y, width, height, time, placed, glow, qibla, burst, reducedMotion, label, children }: SceneProps) {
  const { c } = useTheme();
  const styles = useStyles();
  const layers = LAYER_ORDER.filter((name) => placed.includes(LAYER_PART[name]));
  const k = width / SITE.w;
  return (
    <View style={[styles.stage, { left: x, top: y, width, height }]} accessible accessibilityRole="image" accessibilityLabel={label}>
      <Art name={`seerah.masjid-sky-${time}`} size={width} height={height} />
      {layers.map((name) => (
        <Layer key={name} name={name} appear={PARTS[LAYER_PART[name]].appear} width={width} height={height} reducedMotion={reducedMotion} />
      ))}
      {qibla ? <FloorArrow key={qibla} to={qibla} width={width} height={height} reducedMotion={reducedMotion} /> : null}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Art name="seerah.masjid-foreground" size={width} height={height} />
      </View>
      {glow ? <SlotGlow key={glow} part={glow} width={width} height={height} reducedMotion={reducedMotion} /> : null}
      {burst ? (
        <Burst
          key={burst.key}
          x={burst.x * k}
          y={burst.y * k}
          colors={burst.part === 'ground' ? [c.goldSoft, c.gold, c.goldBorder] : [c.goldSoft, c.gold, c.primaryBorder, c.goldBorder]}
          reducedMotion={reducedMotion}
        />
      ) : null}
      {children}
    </View>
  );
}
