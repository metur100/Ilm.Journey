import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, type LayoutChangeEvent, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';

import { Art, hasArt } from '@/core/art';
import { Icon } from '@/core/components/ui/Icon';
import {
  type ArtPlacement,
  depthScale,
  GARDEN_BACKDROP_LAYERS,
  GARDEN_SKY_ART,
  GARDEN_SPOTS,
  gardenArt,
  type GardenLayout,
  gardenLayout,
  type GardenMotion,
  getGardenElement,
  growthStage,
  maxWidthFraction,
  type PlacedElement,
  SKY_GRADIENTS,
  skyForDate,
  spotPoint,
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
  /** Free spots offered in `pickSpot` mode (only spots that fit the chosen element). */
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
  /** Height covered by overlay controls at the top (e.g. the Home header) – sun, moon and birds stay below it. */
  topInset?: number;
  /** Stop the idle loop while the scene is not visible (screen in the background, scrolled out of view). */
  paused?: boolean;
  children?: React.ReactNode;
}

const GROWTH_SCALE = [0.55, 0.8, 1] as const;
/** Butterflies and bees hover a little above their flower bed (fraction of the lawn depth). */
const HOVER: Partial<Record<GardenMotion, number>> = { flutter: 0.3 };

/**
 * The Ilm Garden as an illustrated, layered scene: sky by the real time of day (sun / moon / stars), the garden
 * backdrop, and the placed elements on fixed spots (grove, water, flower beds, beside the path, sky) with depth
 * scaling (back row smaller). The land is anchored at a computed horizon (`gardenLayout`), so ground spots stay on the
 * lawn on every screen width. Gentle idle animations (swaying plants, flying birds, fluttering butterflies,
 * shimmering water) run on one shared native-driven loop and stop under reduced motion. A thirsty garden looks dry –
 * it never dies.
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
  topInset = 0,
  paused = false,
  children,
}: GardenSceneProps) {
  const reduced = useReducedMotion();
  const { t } = useI18n();
  const { c } = useTheme();
  const [width, setWidth] = useState(0);
  const layout = useMemo(() => (width > 0 ? gardenLayout(width, height, topInset) : null), [width, height, topInset]);
  const sky = skyForDate(now ?? new Date());
  const clock = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    if (reduced || paused) return;
    // A native loop repeats from the value it started at, so a resumed loop starts the cycle at 0 again.
    clock.setValue(0);
    const loop = Animated.loop(Animated.timing(clock, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [clock, reduced, paused]);

  // Sky first, then the lawn from the back to the front, so nearer things stand in front of farther ones.
  const sorted = useMemo(() => {
    const order = (spot: number) => (GARDEN_SPOTS[spot].kind === 'sky' ? -1 : GARDEN_SPOTS[spot].d);
    return placed.filter((p) => !!GARDEN_SPOTS[p.spot]).sort((a, b) => order(a.spot) - order(b.spot) || a.spot - b.spot);
  }, [placed]);
  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));

  return (
    <View
      style={[styles.root, { height }, rounded && styles.rounded, style]}
      onLayout={onLayout}
    >
      <LinearGradient colors={SKY_GRADIENTS[sky]} style={StyleSheet.absoluteFill} />
      {layout ? (
        <>
          <SkyPieces sky={sky} layout={layout} />
          <Backdrop layout={layout} />
          {thirst > 0 ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: thirst === 2 ? 'rgba(150,110,50,0.22)' : 'rgba(150,110,50,0.12)' }]} /> : null}
          {sorted.map((p) => (
            <PlacedView
              key={`${p.spot}-${p.elementId}`}
              placed={p}
              layout={layout}
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
                  layout={layout}
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

function SkyPieces({ sky, layout }: { sky: ReturnType<typeof skyForDate>; layout: GardenLayout }) {
  const { width, height, skyTop, skyBottom, horizon } = layout;
  // The open sky lies between the overlay controls and the far hills.
  const skyH = Math.max(0, skyBottom - skyTop);
  const body = Math.round(Math.min(width * 0.22, height * 0.22, skyH * 0.7));
  const at = (f: number) => skyTop + Math.max(0, skyH - body) * f;
  const place: Record<typeof sky, { name: string; left: number; top: number }> = {
    dawn: { name: GARDEN_SKY_ART.sun, left: width * 0.12, top: at(0.85) },
    day: { name: GARDEN_SKY_ART.sun, left: width * 0.72, top: at(0.15) },
    sunset: { name: GARDEN_SKY_ART.sun, left: width * 0.7, top: at(0.8) },
    night: { name: GARDEN_SKY_ART.moon, left: width * 0.14, top: at(0.15) },
  };
  const p = place[sky];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {sky === 'night' ? <Art name={GARDEN_SKY_ART.stars} size={width * 0.9} height={Math.max(1, Math.round(horizon))} fit="cover" style={{ position: 'absolute', left: width * 0.05, top: 0 }} /> : null}
      {body > 0 ? <Art name={p.name} size={body} style={{ position: 'absolute', left: p.left, top: p.top }} /> : null}
    </View>
  );
}

/** A land layer at its natural aspect, anchored at the horizon; hills may be stretched sideways on wide screens. */
function LandLayer({ name, at }: { name: string; at: ArtPlacement }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: at.left, top: at.top, width: at.w, height: at.h, transform: [{ scaleX: at.scaleX }] }}>
      <Art name={name} size={at.w} height={at.h} />
    </View>
  );
}

/**
 * The garden landscape (far hills with the little masjid, trees, lawn) from the art library – only the land layers,
 * so the time-of-day sky above stays visible – or gentle hills while the pieces are not available. Either way the
 * lawn begins at `layout.horizon`, where the ground spots are.
 */
function Backdrop({ layout }: { layout: GardenLayout }) {
  const { width, height, horizon } = layout;
  if (GARDEN_BACKDROP_LAYERS.every(hasArt)) {
    const [far, mid, lawn] = GARDEN_BACKDROP_LAYERS;
    return (
      <>
        <LandLayer name={far} at={layout.hills} />
        <LandLayer name={mid} at={layout.hills} />
        <LandLayer name={lawn} at={layout.lawn} />
      </>
    );
  }
  const hill = Math.min(height * 0.16, horizon * 0.5);
  const front = horizon + (height - horizon) * 0.55;
  return (
    <Svg pointerEvents="none" width={width} height={height} style={StyleSheet.absoluteFill}>
      <Ellipse cx={width * 0.2} cy={horizon} rx={width * 0.45} ry={hill} fill="#8CC57A" />
      <Ellipse cx={width * 0.85} cy={horizon} rx={width * 0.5} ry={hill * 0.9} fill="#7DBA6C" />
      <Path d={`M0 ${horizon} Q${width / 2} ${horizon - hill * 0.25} ${width} ${horizon} V${height} H0 Z`} fill="#9ED28A" />
      <Path d={`M0 ${front} Q${width / 2} ${front - (height - horizon) * 0.12} ${width} ${front} V${height} H0 Z`} fill="#8BC877" />
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
  layout,
  clock,
  reduced,
  thirst,
  isNew,
  onPress,
  label,
}: {
  placed: PlacedElement;
  layout: GardenLayout;
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

  const spot = GARDEN_SPOTS[placed.spot];
  if (!element || !spot) return null;
  const { width, height, horizon } = layout;
  const point = spotPoint(layout, placed.spot);
  const growing = element.kind === 'tree' || element.kind === 'plant' || element.kind === 'flower';
  const droop = growing ? (thirst === 2 ? 0.9 : thirst === 1 ? 0.96 : 1) : 1;
  const rawW = layout.unit * element.size * depthScale(spot) * GROWTH_SCALE[growthStage(placed)] * droop;
  // Never wider than its spot: neighbouring elements cannot cover each other.
  const w = Math.round(Math.min(rawW, width * maxWidthFraction(placed.spot)));
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

  // Ground elements stand with their feet on the spot; sky elements are centred on it.
  const hover = spot.kind === 'sky' ? 0 : (HOVER[element.motion] ?? 0) * (height - horizon);
  const feet = spot.kind === 'sky' ? point.y + w / 2 : point.y - hover;
  const box: ViewStyle = { position: 'absolute', left: point.x - w / 2, bottom: height - feet, width: w, alignItems: 'center' };
  const art = <Art name={gardenArt(element.id)} size={w} thirsty={growing && thirst > 0} />;
  const content = <Animated.View style={{ transform: transforms as never, opacity }}>{art}</Animated.View>;

  if (onPress) {
    return (
      <Pressable style={[box, { minWidth: TOUCH_TARGET, minHeight: TOUCH_TARGET, marginLeft: Math.min(0, (w - TOUCH_TARGET) / 2) }]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
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
  layout,
  reduced,
  label,
  onPress,
  color,
  iconColor,
}: {
  spot: number;
  layout: GardenLayout;
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
  const p = spotPoint(layout, spot);
  // Keep the whole marker inside the scene (front-row spots sit close to the bottom edge).
  const left = Math.max(0, Math.min(layout.width - TOUCH_TARGET, p.x - TOUCH_TARGET / 2));
  const top = Math.max(0, Math.min(layout.height - TOUCH_TARGET, p.y - TOUCH_TARGET / 2));
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={{ position: 'absolute', left, top, width: TOUCH_TARGET, height: TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' }}
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
