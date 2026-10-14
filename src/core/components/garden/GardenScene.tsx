import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, type LayoutChangeEvent, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';

import { Art, hasArt } from '@/core/art';
import { Icon } from '@/core/components/ui/Icon';
import {
  depthScale,
  GARDEN_SKY_ART,
  GARDEN_SPOTS,
  gardenArt,
  type GardenMotion,
  getGardenElement,
  growthStage,
  type PlacedElement,
  SKY_GRADIENTS,
  skyForDate,
  type ThirstLevel,
} from '@/core/garden';
import { useReducedMotion } from '@/core/hooks/useReducedMotion';
import { useI18n } from '@/core/i18n';
import { radius, TOUCH_TARGET, useTheme } from '@/core/theme';

export type GardenSceneMode = 'view' | 'pickSpot' | 'edit';

interface GardenSceneProps {
  placed: readonly PlacedElement[];
  thirst: ThirstLevel;
  height: number;
  /** Real local time decides the sky (dawn / day / sunset / night). */
  now?: Date;
  mode?: GardenSceneMode;
  /** Free spots offered in `pickSpot` mode. */
  freeSpots?: readonly number[];
  onPickSpot?: (spot: number) => void;
  /** Tapping a placed element in `edit` mode. */
  onPressElement?: (placed: PlacedElement) => void;
  /** Spot of a freshly planted element – it grows in with a small spring. */
  growSpot?: number | null;
  /** Element names for screen readers (the scene describes itself through `accessibilityLabel`). */
  elementLabel?: (elementId: string) => string;
  accessibilityLabel?: string;
  style?: ViewStyle;
  rounded?: boolean;
  children?: React.ReactNode;
}

const GROWTH_SCALE = [0.55, 0.8, 1] as const;
/** Flying creatures hover above their spot (fraction of the scene height). */
const HOVER: Partial<Record<GardenMotion, number>> = { fly: 0.22, flutter: 0.08 };

/**
 * The Ilm Garden as an illustrated, layered scene: sky by the real time of day (sun / moon / stars), the garden
 * backdrop, and the placed elements on 16 spots with depth scaling (back row smaller). Gentle idle animations
 * (swaying plants, flying birds, fluttering butterflies, shimmering water) run on one shared native-driven loop and
 * stop under reduced motion. A thirsty garden looks dry – it never dies.
 */
export function GardenScene({
  placed,
  thirst,
  height,
  now,
  mode = 'view',
  freeSpots = [],
  onPickSpot,
  onPressElement,
  growSpot,
  elementLabel,
  accessibilityLabel,
  style,
  rounded = true,
  children,
}: GardenSceneProps) {
  const reduced = useReducedMotion();
  const { t } = useI18n();
  const { c } = useTheme();
  const [width, setWidth] = useState(0);
  const sky = skyForDate(now ?? new Date());
  const clock = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(Animated.timing(clock, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [clock, reduced]);

  const sorted = useMemo(() => [...placed].sort((a, b) => GARDEN_SPOTS[a.spot].y - GARDEN_SPOTS[b.spot].y || a.spot - b.spot), [placed]);
  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));

  return (
    <View
      style={[styles.root, { height }, rounded && styles.rounded, style]}
      onLayout={onLayout}
    >
      <LinearGradient colors={SKY_GRADIENTS[sky]} style={StyleSheet.absoluteFill} />
      {width > 0 ? (
        <>
          <SkyPieces sky={sky} width={width} height={height} />
          <Backdrop width={width} height={height} />
          {thirst > 0 ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: thirst === 2 ? 'rgba(150,110,50,0.22)' : 'rgba(150,110,50,0.12)' }]} /> : null}
          {sorted.map((p) => (
            <PlacedView
              key={`${p.spot}-${p.elementId}`}
              placed={p}
              width={width}
              height={height}
              clock={clock}
              reduced={reduced}
              thirst={thirst}
              isNew={growSpot === p.spot}
              onPress={mode === 'edit' && onPressElement ? () => onPressElement(p) : undefined}
              label={elementLabel?.(p.elementId) ?? p.elementId}
            />
          ))}
          {mode === 'pickSpot'
            ? freeSpots.map((spot) => (
                <SpotMarker
                  key={spot}
                  spot={spot}
                  width={width}
                  height={height}
                  reduced={reduced}
                  label={t('garden.spot', { number: spot + 1 })}
                  onPress={() => onPickSpot?.(spot)}
                  color={c.gold}
                  iconColor={c.onGold}
                />
              ))
            : null}
        </>
      ) : null}
      {/* The picture describes itself as one image; overlay controls (children) stay reachable for screen readers. */}
      {accessibilityLabel && mode === 'view' ? <View pointerEvents="none" style={StyleSheet.absoluteFill} accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} /> : null}
      {children}
    </View>
  );
}

function SkyPieces({ sky, width, height }: { sky: ReturnType<typeof skyForDate>; width: number; height: number }) {
  const body = Math.round(Math.min(width, height) * 0.22);
  const place: Record<typeof sky, { name: string; left: number; top: number }> = {
    dawn: { name: GARDEN_SKY_ART.sun, left: width * 0.12, top: height * 0.24 },
    day: { name: GARDEN_SKY_ART.sun, left: width * 0.72, top: height * 0.05 },
    sunset: { name: GARDEN_SKY_ART.sun, left: width * 0.7, top: height * 0.22 },
    night: { name: GARDEN_SKY_ART.moon, left: width * 0.14, top: height * 0.06 },
  };
  const p = place[sky];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {sky === 'night' ? <Art name={GARDEN_SKY_ART.stars} size={width * 0.9} style={{ position: 'absolute', left: width * 0.05, top: 0 }} /> : null}
      <Art name={p.name} size={body} style={{ position: 'absolute', left: p.left, top: p.top }} />
    </View>
  );
}

/** The garden backdrop from the art library, or gentle hills while the piece is not available. */
function Backdrop({ width, height }: { width: number; height: number }) {
  if (hasArt(GARDEN_SKY_ART.backdrop)) {
    return <Art name={GARDEN_SKY_ART.backdrop} size={width} height={height * 0.62} style={{ position: 'absolute', left: 0, bottom: 0 }} />;
  }
  const top = height * 0.42;
  return (
    <Svg pointerEvents="none" width={width} height={height} style={StyleSheet.absoluteFill}>
      <Ellipse cx={width * 0.2} cy={top + height * 0.12} rx={width * 0.45} ry={height * 0.16} fill="#8CC57A" />
      <Ellipse cx={width * 0.85} cy={top + height * 0.1} rx={width * 0.5} ry={height * 0.15} fill="#7DBA6C" />
      <Path d={`M0 ${top + height * 0.08} Q${width / 2} ${top - height * 0.02} ${width} ${top + height * 0.08} V${height} H0 Z`} fill="#9ED28A" />
      <Path d={`M0 ${height * 0.78} Q${width / 2} ${height * 0.7} ${width} ${height * 0.78} V${height} H0 Z`} fill="#8BC877" />
    </Svg>
  );
}

const PHASES = [
  [0, 1, 0, -1, 0],
  [1, 0, -1, 0, 1],
  [0, -1, 0, 1, 0],
  [-1, 0, 1, 0, -1],
] as const;

function PlacedView({
  placed,
  width,
  height,
  clock,
  reduced,
  thirst,
  isNew,
  onPress,
  label,
}: {
  placed: PlacedElement;
  width: number;
  height: number;
  clock: Animated.Value;
  reduced: boolean;
  thirst: ThirstLevel;
  isNew: boolean;
  onPress?: () => void;
  label: string;
}) {
  const element = getGardenElement(placed.elementId);
  const grow = useState(() => new Animated.Value(isNew && !reduced ? 0 : 1))[0];

  useEffect(() => {
    if (!isNew || reduced) return;
    grow.setValue(0);
    Animated.spring(grow, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
  }, [grow, isNew, reduced]);

  if (!element) return null;
  const spot = GARDEN_SPOTS[placed.spot];
  const growing = element.kind === 'tree' || element.kind === 'plant' || element.kind === 'flower';
  const droop = growing ? (thirst === 2 ? 0.9 : thirst === 1 ? 0.96 : 1) : 1;
  const w = Math.round(width * element.size * depthScale(spot) * GROWTH_SCALE[growthStage(placed)] * droop);
  const hover = (HOVER[element.motion] ?? 0) * height;
  const phase = PHASES[placed.spot % PHASES.length];
  const input = [0, 0.25, 0.5, 0.75, 1];

  // Built dynamically per motion; Animated accepts these transform entries.
  const transforms: Record<string, Animated.Value | Animated.AnimatedInterpolation<string | number>>[] = [{ scale: grow }];
  let opacity: Animated.AnimatedInterpolation<number> | number = growing && thirst === 2 ? 0.85 : 1;
  if (!reduced) {
    switch (element.motion) {
      case 'sway':
        transforms.push({ rotate: clock.interpolate({ inputRange: input, outputRange: phase.map((v) => `${v * 1.6}deg`) }) });
        break;
      case 'fly':
        transforms.push({ translateX: clock.interpolate({ inputRange: input, outputRange: phase.map((v) => v * 12) }) });
        transforms.push({ translateY: clock.interpolate({ inputRange: input, outputRange: PHASES[(placed.spot + 1) % 4].map((v) => v * 6) }) });
        break;
      case 'flutter':
        transforms.push({ translateY: clock.interpolate({ inputRange: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1], outputRange: [0, -5, 0, -4, 0, -5, 0, -3, 0] }) });
        transforms.push({ translateX: clock.interpolate({ inputRange: input, outputRange: phase.map((v) => v * 5) }) });
        break;
      case 'shimmer':
        opacity = clock.interpolate({ inputRange: input, outputRange: [1, 0.88, 1, 0.92, 1] });
        break;
      default:
        break;
    }
  }

  const box: ViewStyle = { position: 'absolute', left: spot.x * width - w / 2, bottom: height - spot.y * height + hover, width: w, alignItems: 'center' };
  const art = <Art name={gardenArt(element.id)} size={w} />;
  const content = <Animated.View style={{ transform: transforms as never, opacity }}>{art}</Animated.View>;

  if (onPress) {
    return (
      <Pressable style={[box, { minWidth: TOUCH_TARGET, minHeight: TOUCH_TARGET }]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
        {content}
      </Pressable>
    );
  }
  return (
    <View pointerEvents="none" style={box}>
      {content}
    </View>
  );
}

function SpotMarker({
  spot,
  width,
  height,
  reduced,
  label,
  onPress,
  color,
  iconColor,
}: {
  spot: number;
  width: number;
  height: number;
  reduced: boolean;
  label: string;
  onPress: () => void;
  color: string;
  iconColor: string;
}) {
  const pulse = useState(() => new Animated.Value(1))[0];
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduced]);
  const p = GARDEN_SPOTS[spot];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={{ position: 'absolute', left: p.x * width - TOUCH_TARGET / 2, top: p.y * height - TOUCH_TARGET / 2, width: TOUCH_TARGET, height: TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={[styles.marker, { backgroundColor: color, transform: [{ scale: pulse }] }]}>
        <Icon name="plus" size={22} color={iconColor} strokeWidth={3} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%', overflow: 'hidden' },
  rounded: { borderRadius: radius.xl },
  marker: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
});
