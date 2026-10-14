import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { Art } from '@/core/art';
import { hashString, seededRandom } from '@/core/utils/random';

import { type AnimalKind, animalArt, rainDrops } from './logic';

/*
 * The illustrated scene above the cards: a sky that darkens with rain while the animals go aboard, a grassy bank,
 * a ramp and the ark (object.ark) on the water. When the ark is full the rain stops and Mount Judi (place.mount-judi,
 * Quran 11:44) appears under a calm sky. No people are drawn; no flood damage is shown. Artwork colours are fixed.
 */

export interface Walker {
  id: string;
  kind: AnimalKind;
}

export interface ArkSceneProps {
  width: number;
  /** 0 calm – 1 heavy rain. */
  storm: number;
  /** 0–1: how full the ark is (its windows glow warmer). */
  fill: number;
  /** The rain stopped – Mount Judi under a calm sky. */
  calm: boolean;
  walkers: Walker[];
  onArrive: (id: string) => void;
  reducedMotion: boolean;
  label: string;
}

export const sceneHeight = (width: number) => Math.round(width * 0.56);

/** Duration of a pair's walk up the ramp. */
export const WALK_MS = 1700;

/** Geometry of the scene (exported for tests). */
export function sceneGeometry(width: number) {
  const height = sceneHeight(width);
  const arkW = width * 0.46;
  const arkH = (arkW * 100) / 140;
  const arkLeft = width - arkW - width * 0.02;
  const arkTop = height - arkH;
  return {
    height,
    arkW,
    arkH,
    arkLeft,
    arkTop,
    start: { x: width * 0.04, y: height * 0.86 },
    rampFoot: { x: width * 0.24, y: height * 0.86 },
    door: { x: arkLeft + arkW * 0.1, y: arkTop + arkH * 0.52 },
    walkerW: width * 0.11,
  };
}

function Drop({ x, delay, height, animate }: { x: number; delay: number; height: number; animate: boolean }) {
  const p = useSharedValue(animate ? 0 : delay / 900);
  useEffect(() => {
    if (!animate) return;
    p.value = withDelay(delay, withRepeat(withTiming(1, { duration: 650, easing: Easing.linear }), -1, false));
  }, [animate, delay, p]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -16 + p.value * (height + 16) }, { translateX: -p.value * 10 }, { rotate: '12deg' }],
  }));
  return <Animated.View style={[styles.drop, { left: x }, style]} />;
}

function Rain({ width, height, count, animate }: { width: number; height: number; count: number; animate: boolean }) {
  const drops = useMemo(() => {
    const random = seededRandom(hashString('ark-rain'));
    return Array.from({ length: 24 }, (_, i) => ({ key: i, x: random() * (width + 10), delay: Math.round(random() * 900) }));
  }, [width]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {drops.slice(0, count).map((d) => (
        <Drop key={d.key} x={d.x} delay={d.delay} height={height} animate={animate} />
      ))}
    </View>
  );
}

function WalkingPair({ walker, width, reducedMotion, onArrive }: { walker: Walker; width: number; reducedMotion: boolean; onArrive: (id: string) => void }) {
  const g = sceneGeometry(width);
  const p = useSharedValue(0);
  const bob = useSharedValue(0);
  const w = g.walkerW;
  const h = w * 0.85;

  useEffect(() => {
    if (reducedMotion) {
      onArrive(walker.id);
      return;
    }
    bob.value = withRepeat(withSequence(withTiming(-3, { duration: 140 }), withTiming(0, { duration: 140 })), -1, false);
    p.value = withTiming(1, { duration: WALK_MS, easing: Easing.inOut(Easing.quad) });
    // The rules live on the JS thread: the pair counts as aboard when the walk is over.
    const timer = setTimeout(() => onArrive(walker.id), WALK_MS);
    return () => clearTimeout(timer);
    // Starts once per walker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pairStyle = useAnimatedStyle(() => {
    const t = p.value;
    // Along the bank to the foot of the ramp, then up the ramp to the door of the ark.
    const split = 0.35;
    const x = t < split ? g.start.x + (g.rampFoot.x - g.start.x) * (t / split) : g.rampFoot.x + (g.door.x - g.rampFoot.x) * ((t - split) / (1 - split));
    const y = t < split ? g.start.y : g.rampFoot.y + (g.door.y - g.rampFoot.y) * ((t - split) / (1 - split));
    const fade = t > 0.88 ? Math.max(0, (1 - t) / 0.12) : 1;
    return {
      opacity: fade,
      transform: [{ translateX: x - w * 1.6 }, { translateY: y - h + bob.value }, { scale: 0.6 + 0.4 * fade }],
    };
  });

  if (reducedMotion) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.pair, { width: w * 2.1, height: h }, pairStyle]}>
      <Art name={animalArt(walker.kind)} size={w} height={h} dark={false} />
      <Art name={animalArt(walker.kind)} size={w} height={h} dark={false} />
    </Animated.View>
  );
}

export function ArkScene({ width, storm, fill, calm, walkers, onArrive, reducedMotion, label }: ArkSceneProps) {
  const g = sceneGeometry(width);
  const H = g.height;
  const stormV = useSharedValue(storm);
  const calmV = useSharedValue(calm ? 1 : 0);
  const fillV = useSharedValue(fill);

  useEffect(() => {
    stormV.value = reducedMotion ? storm : withTiming(storm, { duration: 900 });
  }, [storm, reducedMotion, stormV]);
  useEffect(() => {
    calmV.value = reducedMotion ? (calm ? 1 : 0) : withTiming(calm ? 1 : 0, { duration: 1400 });
  }, [calm, reducedMotion, calmV]);
  useEffect(() => {
    fillV.value = reducedMotion ? fill : withTiming(fill, { duration: 600 });
  }, [fill, reducedMotion, fillV]);

  const stormStyle = useAnimatedStyle(() => ({ opacity: stormV.value * 0.85 }));
  const judiStyle = useAnimatedStyle(() => ({ opacity: calmV.value }));
  const arkStyle = useAnimatedStyle(() => ({ opacity: 1 - calmV.value, transform: [{ translateY: fillV.value * 4 }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.15 + fillV.value * 0.85 }));

  if (width <= 0) return <View style={{ height: H }} />;

  const windowSize = (g.arkW * 9) / 140;
  return (
    <View style={[styles.scene, { height: H }]} accessible accessibilityRole="image" accessibilityLabel={label}>
      <Svg width={width} height={H} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="arkCalm" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#74C2E6" />
            <Stop offset="1" stopColor="#E3F3F9" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={H} fill="url(#arkCalm)" />
      </Svg>

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, stormStyle]}>
        <Svg width={width} height={H}>
          <Defs>
            <LinearGradient id="arkStorm" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#262E3A" />
              <Stop offset="1" stopColor="#56636F" />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={width} height={H} fill="url(#arkStorm)" />
          {[0.12, 0.38, 0.66, 0.9].map((cx, i) => (
            <Ellipse key={i} cx={width * cx} cy={H * (0.1 + (i % 2) * 0.05)} rx={width * 0.17} ry={H * 0.1} fill="#3B4552" />
          ))}
        </Svg>
      </Animated.View>

      <Animated.View pointerEvents="none" style={[styles.judi, { left: width * 0.2, top: H * 0.06 }, judiStyle]}>
        <Art name="place.mount-judi" size={width * 0.6} dark={false} />
      </Animated.View>

      <Svg width={width} height={H} style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Water and the grassy bank. */}
        <Path d={`M${width * 0.3} ${H * 0.9} Q${width * 0.6} ${H * 0.84} ${width} ${H * 0.88} V${H} H${width * 0.3} Z`} fill="#4A90B8" />
        <Path d={`M${width * 0.32} ${H * 0.93} q${width * 0.04} -6 ${width * 0.08} 0 t${width * 0.08} 0 t${width * 0.08} 0 t${width * 0.08} 0 t${width * 0.08} 0 t${width * 0.08} 0 t${width * 0.08} 0`} stroke="#9FD2EA" strokeWidth={2} fill="none" />
        <Path d={`M0 ${H * 0.8} Q${width * 0.18} ${H * 0.74} ${width * 0.36} ${H * 0.86} L${width * 0.36} ${H} H0 Z`} fill="#7DAF5A" />
        <Path d={`M0 ${H * 0.86} Q${width * 0.16} ${H * 0.82} ${width * 0.34} ${H * 0.9} L${width * 0.34} ${H} H0 Z`} fill="#5E9446" />
      </Svg>

      <Animated.View pointerEvents="none" style={[styles.abs, { left: g.arkLeft, top: g.arkTop, width: g.arkW, height: g.arkH }, arkStyle]}>
        <Art name="object.ark" size={g.arkW} height={g.arkH} dark={false} />
        {[48, 64, 80].map((x) => (
          <Animated.View
            key={x}
            style={[styles.window, { left: (g.arkW * x) / 140, top: (g.arkH * 35) / 100, width: windowSize, height: windowSize }, glowStyle]}
          />
        ))}
      </Animated.View>

      {!calm && (
        <Svg width={width} height={H} style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* The ramp from the bank up to the deck. */}
          <Path d={`M${g.rampFoot.x - 6} ${g.rampFoot.y + 4} L${g.door.x + 4} ${g.door.y + 2}`} stroke="#8A5A33" strokeWidth={7} strokeLinecap="round" />
          <Path d={`M${g.rampFoot.x - 6} ${g.rampFoot.y + 1} L${g.door.x + 4} ${g.door.y - 1}`} stroke="#C08A57" strokeWidth={2.5} strokeLinecap="round" />
        </Svg>
      )}

      {walkers.map((w) => (
        <WalkingPair key={w.id} walker={w} width={width} reducedMotion={reducedMotion} onArrive={onArrive} />
      ))}

      {!calm && <Rain width={width} height={H} count={rainDrops(storm)} animate={!reducedMotion} />}
    </View>
  );
}

const styles = StyleSheet.create({
  scene: { width: '100%', borderRadius: 22, overflow: 'hidden' },
  abs: { position: 'absolute' },
  judi: { position: 'absolute' },
  pair: { position: 'absolute', left: 0, top: 0, flexDirection: 'row', alignItems: 'flex-end' },
  window: { position: 'absolute', borderRadius: 2, backgroundColor: '#FFD879' },
  drop: { position: 'absolute', top: 0, width: 2, height: 13, borderRadius: 1, backgroundColor: 'rgba(214, 230, 245, 0.75)' },
});
