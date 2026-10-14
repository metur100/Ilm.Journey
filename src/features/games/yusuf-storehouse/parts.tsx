import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Ellipse, G, Path, Rect } from 'react-native-svg';

import { Art } from '@/core/art';
import { makeStyles, radius } from '@/core/theme';
import { hashString, seededRandom } from '@/core/utils/random';

import type { GrainForm } from './logic';

/*
 * Artwork of Yusuf's Storehouse: the sheaf (grain kept in its ears), the grain sack (object.grain-sack), the year
 * timeline and the scene above the board. No person is drawn – the village is houses, the storehouse is a building.
 * Artwork colours are fixed; UI colours come from the theme.
 */

/** A sheaf of grain still in its ears (the 12:47 twist). */
export function Sheaf({ size }: { size: number }) {
  const stalks = [-14, -7, 0, 7, 14];
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Ellipse cx={40} cy={76} rx={22} ry={3} fill="rgba(0,0,0,0.12)" />
      {stalks.map((dx, i) => (
        <G key={i}>
          <Path d={`M40 74 L${40 + dx * 1.3} 22`} stroke="#B98B3E" strokeWidth={2.4} strokeLinecap="round" />
          {[0, 1, 2, 3].map((k) => (
            <Ellipse key={k} cx={40 + dx * 1.3 - dx * 0.04 * k} cy={12 + k * 6} rx={3.4} ry={5.2} fill={k % 2 ? '#E9B44C' : '#F2C766'} transform={`rotate(${dx * 1.2} ${40 + dx * 1.3} ${12 + k * 6})`} />
          ))}
        </G>
      ))}
      <Rect x={30} y={50} width={20} height={6} rx={3} fill="#8A5A33" />
    </Svg>
  );
}

/** One harvest item: a grain sack (loose grain) or a sheaf (grain in the ear). */
export function GrainItem({ form, size, spoiled }: { form: GrainForm; size: number; spoiled?: boolean }) {
  const style = spoiled ? { opacity: 0.4 } : undefined;
  return <View style={style}>{form === 'ears' ? <Sheaf size={size} /> : <Art name="object.grain-sack" size={size * 0.9} height={size} />}</View>;
}

const useTimelineStyles = makeStyles((c) => ({
  row: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  dot: { flex: 1, height: 8, borderRadius: radius.pill },
  good: { backgroundColor: c.success },
  hard: { backgroundColor: c.gold },
  relief: { backgroundColor: c.info },
  dim: { opacity: 0.25 },
  current: { height: 14 },
}));

/** 15 marks: 7 good years (green), 7 hard years (gold), 1 year of relief (blue). */
export function Timeline({ index, label }: { index: number; label: string }) {
  const styles = useTimelineStyles();
  return (
    <View style={styles.row} accessible accessibilityRole="progressbar" accessibilityLabel={label}>
      {Array.from({ length: 15 }, (_, i) => (
        <View key={i} style={[styles.dot, i < 7 ? styles.good : i < 14 ? styles.hard : styles.relief, i > index && styles.dim, i === index && styles.current]} />
      ))}
    </View>
  );
}

export type SceneMode = 'good' | 'hard' | 'relief';

function RainDrop({ x, delay, height, animate }: { x: number; delay: number; height: number; animate: boolean }) {
  const p = useSharedValue(animate ? 0 : (delay % 700) / 700);
  useEffect(() => {
    if (animate) p.value = withDelay(delay, withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1, false));
  }, [animate, delay, p]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: -12 + p.value * (height + 12) }] }));
  return <Animated.View style={[sceneStyles.drop, { left: x }, style]} />;
}

/** A sack travelling from the storehouse to the village in a hard year. */
function FlyingSack({ from, to, delay, animate }: { from: { x: number; y: number }; to: { x: number; y: number }; delay: number; animate: boolean }) {
  const p = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    if (animate) p.value = withDelay(delay, withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }));
  }, [animate, delay, p]);
  const style = useAnimatedStyle(() => {
    const t = p.value;
    const arc = -Math.sin(t * Math.PI) * 26;
    return {
      opacity: t >= 1 ? 0 : 1,
      transform: [{ translateX: from.x + (to.x - from.x) * t }, { translateY: from.y + (to.y - from.y) * t + arc }, { scale: 1 - t * 0.3 }],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[sceneStyles.flying, style]}>
      <Art name="object.grain-sack" size={26} height={28} dark={false} />
    </Animated.View>
  );
}

export interface YusufSceneProps {
  width: number;
  mode: SceneMode;
  /** Changes for every share-out (re-runs the flying sacks). */
  shareKey: string;
  given: number;
  reducedMotion: boolean;
  label: string;
}

export const yusufSceneHeight = (width: number) => Math.round(width * 0.42);

/** The scene above the board: fields by the river (good years), warm dry land (hard years), rain (relief). */
export function YusufScene({ width, mode, shareKey, given, reducedMotion, label }: YusufSceneProps) {
  const H = yusufSceneHeight(width);
  const drops = useMemo(() => {
    const random = seededRandom(hashString('yusuf-rain'));
    return Array.from({ length: 16 }, (_, i) => ({ key: i, x: random() * width, delay: Math.round(random() * 900) }));
  }, [width]);
  if (width <= 0) return <View style={{ height: H }} />;

  const village = { x: width * 0.06, y: H * 0.5 };
  const store = { x: width * 0.66, y: H * 0.5 };
  const green = mode !== 'hard';
  return (
    <View style={[sceneStyles.scene, { height: H }]} accessible accessibilityRole="image" accessibilityLabel={label}>
      <Art name={green ? 'sky.morning' : 'sky.afternoon'} size={width} height={H} fit="cover" dark={false} style={StyleSheet.absoluteFill} />
      <Svg width={width} height={H} style={StyleSheet.absoluteFill}>
        {green ? (
          <G>
            <Path d={`M0 ${H * 0.62} Q${width * 0.5} ${H * 0.55} ${width} ${H * 0.62} V${H} H0 Z`} fill="#8DBE6E" />
            <Path d={`M0 ${H * 0.74} Q${width * 0.5} ${H * 0.68} ${width} ${H * 0.74} V${H * 0.84} Q${width * 0.5} ${H * 0.78} 0 ${H * 0.86} Z`} fill="#5BA3C9" />
            <Path d={`M0 ${H * 0.86} Q${width * 0.5} ${H * 0.8} ${width} ${H * 0.84} V${H} H0 Z`} fill="#E3C27A" />
            {Array.from({ length: 9 }, (_, i) => (
              <Path key={i} d={`M${width * (0.04 + i * 0.11)} ${H * 0.98} v-${H * 0.1}`} stroke="#C99A3E" strokeWidth={3} strokeLinecap="round" />
            ))}
          </G>
        ) : (
          <G>
            <Path d={`M0 ${H * 0.6} Q${width * 0.4} ${H * 0.5} ${width} ${H * 0.6} V${H} H0 Z`} fill="#E8C98E" />
            <Path d={`M0 ${H * 0.78} Q${width * 0.6} ${H * 0.68} ${width} ${H * 0.8} V${H} H0 Z`} fill="#D9AE6A" />
          </G>
        )}
      </Svg>
      {mode === 'hard' ? (
        <>
          <View style={[sceneStyles.abs, { left: village.x, top: H * 0.3 }]}>
            <View style={sceneStyles.houses}>
              <Art name="place.house" size={width * 0.16} dark={false} />
              <Art name="place.house" size={width * 0.12} dark={false} />
            </View>
          </View>
          <View style={[sceneStyles.abs, { left: store.x, top: H * 0.28 }]}>
            <Art name="object.storehouse" size={width * 0.3} dark={false} />
          </View>
          {Array.from({ length: given }, (_, i) => (
            <FlyingSack key={`${shareKey}-${i}`} from={{ x: store.x + width * 0.08, y: H * 0.55 }} to={{ x: village.x + width * 0.1, y: H * 0.6 }} delay={i * 220} animate={!reducedMotion} />
          ))}
        </>
      ) : (
        <View style={[sceneStyles.abs, { left: width * 0.04, top: H * 0.2 }]}>
          <Art name={mode === 'relief' ? 'garden.olive' : 'garden.palm'} size={width * 0.2} dark={false} />
        </View>
      )}
      {mode === 'relief' && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {drops.map((d) => (
            <RainDrop key={d.key} x={d.x} delay={d.delay} height={H} animate={!reducedMotion} />
          ))}
        </View>
      )}
    </View>
  );
}

const sceneStyles = StyleSheet.create({
  scene: { width: '100%', borderRadius: 22, overflow: 'hidden' },
  abs: { position: 'absolute' },
  houses: { flexDirection: 'row', alignItems: 'flex-end' },
  flying: { position: 'absolute', left: 0, top: 0 },
  drop: { position: 'absolute', top: 0, width: 2, height: 12, borderRadius: 1, backgroundColor: 'rgba(90, 150, 200, 0.6)' },
});
