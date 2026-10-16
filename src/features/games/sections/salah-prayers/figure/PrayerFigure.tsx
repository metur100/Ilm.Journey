import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, FadeIn, runOnJS, useAnimatedProps, useDerivedValue, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';

import { makeCtx } from '@/core/art/kit';
import {
  FIG_H,
  FIG_W,
  FIGURE_LAYERS,
  FigureCueLayer,
  FigureHighlight,
  figureColors,
  figureFrame,
  FigureShapes,
  layerStyle,
  Mat,
  mixPose,
  movementPath,
  prayerPose,
  type FigureCues,
  type FigureFrame,
  type FigureLayer,
  type PoseVec,
  type PrayerPosition,
  type PrayerVariant,
} from '@/core/art/pieces/sections/salahFigure';
import { useTheme } from '@/core/theme';

/** Part of the figure's viewBox to show: [x, y, width, height]. */
export type FigureView = [number, number, number, number];

export const FULL_VIEW: FigureView = [0, 0, FIG_W, FIG_H];
/** Crop that keeps the figure and the mat but drops most of the empty sky above a sitting / bowing figure. */
export const STAGE_VIEW: FigureView = [14, 10, 220, 186];

export interface PrayerFigureProps {
  position: PrayerPosition;
  variant: PrayerVariant;
  /** Width in dp; the height follows the view's aspect. */
  width: number;
  view?: FigureView;
  cues?: FigureCues;
  reducedMotion?: boolean;
  /** Draw for a dark surface (default: the theme). */
  dark?: boolean;
  /** Milliseconds per movement (a movement to sajda passes the kneeling pose: two movements). */
  speed?: number;
  /** Called when the figure has arrived in `position` (immediately with reduced motion). */
  onSettled?: (position: PrayerPosition) => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
  /** Overlays (e.g. tap targets) positioned with `figurePoint`. */
  children?: ReactNode;
}

/** Converts a point of the figure's viewBox to dp inside a PrayerFigure of the given width / view. */
export function figurePoint(x: number, y: number, width: number, view: FigureView = FULL_VIEW): { left: number; top: number } {
  const s = width / view[2];
  return { left: (x - view[0]) * s, top: (y - view[1]) * s };
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

function LayerPath({ frame, layer, style }: { frame: SharedValue<FigureFrame>; layer: FigureLayer; style: ReturnType<typeof layerStyle> }) {
  const animatedProps = useAnimatedProps(() => ({ d: frame.value[layer] }));
  return <AnimatedPath animatedProps={animatedProps} {...style} />;
}

/**
 * The faceless prayer figure on its mat, moving smoothly from one position to the next (the limbs are interpolated on
 * the UI thread). With reduced motion the new position fades in instead. Cues (gaze line, arrows, the 7 points of
 * sajda, the glow behind the moving part) appear once the figure has arrived.
 */
export function PrayerFigure({ position, variant, width, view = FULL_VIEW, cues, reducedMotion = false, dark: darkProp, speed = 520, onSettled, label, style, children }: PrayerFigureProps) {
  const theme = useTheme();
  const dark = darkProp ?? theme.dark;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const ctx = useMemo(() => makeCtx(`pf${uid}`, { dark }), [uid, dark]);
  const colors = useMemo(() => figureColors(dark), [dark]);
  const height = (width * view[3]) / view[2];

  const [settled, setSettled] = useState<PrayerPosition>(position);
  const keys = useSharedValue<PoseVec[]>([prayerPose(position, variant)]);
  const progress = useSharedValue(0);
  const cueOpacity = useSharedValue(1);
  const last = useRef({ position, variant });
  const settledCb = useRef(onSettled);
  settledCb.current = onSettled;

  useEffect(() => {
    const prev = last.current;
    if (prev.position === position && prev.variant === variant) return;
    last.current = { position, variant };
    const arrive = (p: PrayerPosition) => {
      setSettled(p);
      settledCb.current?.(p);
    };
    if (reducedMotion || prev.variant !== variant) {
      keys.value = [prayerPose(position, variant)];
      progress.value = 0;
      arrive(position);
      return;
    }
    // start from wherever the figure is now (a new move may interrupt a running one)
    const ks = keys.value;
    const n = ks.length;
    const p = Math.max(0, Math.min(n - 1, progress.value));
    const seg = Math.min(Math.max(0, n - 2), Math.floor(p));
    const t = p - seg;
    const e = t * t * (3 - 2 * t);
    const current = n === 1 ? ks[0] : mixPose(ks[seg], ks[seg + 1], e);
    const path = movementPath(prev.position, position);
    const next = [current, ...path.slice(1).map((q) => prayerPose(q, variant))];
    cueOpacity.value = 0;
    keys.value = next;
    progress.value = 0;
    progress.value = withTiming(next.length - 1, { duration: speed * (next.length - 1), easing: Easing.linear }, (finished) => {
      if (finished) runOnJS(arrive)(position);
    });
  }, [position, variant, reducedMotion, speed, keys, progress, cueOpacity]);

  useEffect(() => {
    cueOpacity.value = reducedMotion ? 1 : withTiming(1, { duration: 260 });
  }, [settled, reducedMotion, cueOpacity]);

  const frame = useDerivedValue(() => {
    const ks = keys.value;
    const n = ks.length;
    if (n === 1) return figureFrame(ks[0], variant);
    const p = Math.max(0, Math.min(n - 1, progress.value));
    const seg = Math.min(n - 2, Math.floor(p));
    const t = p - seg;
    // each movement eases in and out on its own, so the figure pauses softly in the kneeling pose
    const e = t * t * (3 - 2 * t);
    return figureFrame(mixPose(ks[seg], ks[seg + 1], e), variant);
  });
  const cueProps = useAnimatedProps(() => ({ opacity: cueOpacity.value }));

  const viewBox = view.join(' ');
  const showCues = !!cues && settled === position;
  const staticFrame = useMemo(() => (reducedMotion ? figureFrame(prayerPose(position, variant), variant) : null), [reducedMotion, position, variant]);

  return (
    <View
      style={[{ width, height }, style]}
      accessible={!!label}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
    >
      {staticFrame ? (
        <Animated.View key={`${variant}-${position}`} entering={FadeIn.duration(240)}>
          <Svg width={width} height={height} viewBox={viewBox}>
            <Mat c={ctx} variant={variant} />
            {cues?.highlight ? <FigureHighlight c={ctx} position={position} variant={variant} /> : null}
            <FigureShapes c={ctx} frame={staticFrame} variant={variant} />
            {cues ? <FigureCueLayer c={ctx} position={position} variant={variant} cues={cues} /> : null}
          </Svg>
        </Animated.View>
      ) : (
        <Svg width={width} height={height} viewBox={viewBox}>
          <Mat c={ctx} variant={variant} />
          {showCues && cues?.highlight ? (
            <AnimatedG animatedProps={cueProps}>
              <FigureHighlight c={ctx} position={position} variant={variant} />
            </AnimatedG>
          ) : null}
          {FIGURE_LAYERS.map((layer) => (
            <LayerPath key={layer} frame={frame} layer={layer} style={layerStyle(layer, variant, colors)} />
          ))}
          {showCues ? (
            <AnimatedG animatedProps={cueProps}>
              <FigureCueLayer c={ctx} position={position} variant={variant} cues={cues} />
            </AnimatedG>
          ) : null}
        </Svg>
      )}
      {children}
    </View>
  );
}
