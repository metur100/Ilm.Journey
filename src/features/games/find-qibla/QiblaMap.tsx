import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { Art, MAKKAH, projectWorld } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { greatCirclePoints, KAABA, type LatLon } from './logic';

const MAP_W = 400;
const MAP_H = 200;

/** SVG path through lat/lon points on `scene.map-world-simple` (viewBox 400 × 200). */
export function mapPath(points: readonly LatLon[]): string {
  return points
    .map((p, i) => {
      const { x, y } = projectWorld(p.lon, p.lat);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join('');
}

const useStyles = makeStyles((c) => ({
  wrap: { width: '100%', aspectRatio: MAP_W / MAP_H, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: c.surfaceAlt },
  label: { position: 'absolute', paddingHorizontal: spacing.sm, paddingVertical: 1, borderRadius: radius.pill, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
}));

export interface QiblaMapProps {
  width: number;
  city: LatLon;
  cityName: string;
  makkahName: string;
  /** Show the great-circle path (after checking). */
  showPath: boolean;
  reducedMotion: boolean;
  label: string;
}

/** World map with the city, Makkah, and – after checking – the shortest path on the globe (gold) vs the flat-map line. */
export function QiblaMap({ width, city, cityName, makkahName, showPath, reducedMotion, label }: QiblaMapProps) {
  const { c, dark } = useTheme();
  const styles = useStyles();
  const k = width / MAP_W;
  const height = width / 2;
  const p = projectWorld(city.lon, city.lat);
  const m = projectWorld(MAKKAH.lon, MAKKAH.lat);
  const great = useMemo(() => mapPath(greatCirclePoints(city, KAABA, 48)), [city]);
  const reveal = useSharedValue(showPath ? 1 : 0);
  useEffect(() => {
    reveal.set(showPath ? (reducedMotion ? 1 : withTiming(1, { duration: 700 })) : 0);
  }, [showPath, reducedMotion, reveal]);
  const pathStyle = useAnimatedStyle(() => ({ opacity: reveal.value }));
  const labelLeft = p.x * k > width * 0.6;

  return (
    <View style={styles.wrap} accessible accessibilityRole="image" accessibilityLabel={label}>
      {width > 0 ? (
        <>
          <Art name="scene.map-world-simple" size={width} height={height} />
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, pathStyle]}>
            <Svg width={width} height={height} viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
              <Path d={`M${p.x} ${p.y}L${m.x} ${m.y}`} stroke={dark ? '#C9CCEA' : '#555A75'} strokeWidth={1.4} strokeDasharray="4 4" fill="none" opacity={0.8} />
              <Path d={great} stroke="#D99A2B" strokeWidth={4.4} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.35} />
              <Path d={great} stroke="#F2B544" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </Animated.View>
          <Svg width={width} height={height} viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Circle cx={p.x} cy={p.y} r={8} fill="#0F7A6E" opacity={0.25} />
            <Circle cx={p.x} cy={p.y} r={4} fill="#0F7A6E" stroke="#FFFFFF" strokeWidth={1.4} />
            <Circle cx={m.x} cy={m.y} r={10} fill="none" stroke="#F2B544" strokeWidth={1.6} />
          </Svg>
          <View pointerEvents="none" style={[styles.label, { top: Math.max(2, p.y * k - 12), ...(labelLeft ? { right: width - p.x * k + 10 } : { left: p.x * k + 10 }) }]}>
            <AppText variant="tiny" color={c.text}>
              {cityName}
            </AppText>
          </View>
          <View pointerEvents="none" style={[styles.label, { top: m.y * k + 10, left: Math.max(2, m.x * k - 26) }]}>
            <AppText variant="tiny" color={c.goldText}>
              {makkahName}
            </AppText>
          </View>
        </>
      ) : null}
    </View>
  );
}
