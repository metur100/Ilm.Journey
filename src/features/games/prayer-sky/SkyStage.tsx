import { memo, useCallback, useEffect, useId, useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Path, Rect } from 'react-native-svg';

import { SKY_H, SKY_HORIZON, SKY_W, type SkyTime } from '@/core/art';
import { Cloud, crescentPath, Lin, Rad, sparklePath } from '@/core/art/kit';
import { AppText } from '@/core/components/ui/AppText';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { clamp01, layerOpacity, SKY_KEYS, sunPoint } from './logic';

/*
 * The wide Prayer Sky: sky colours of the art library's `sky.*` pieces, cross-faded live while the learner drags the
 * sun along its arc (UI thread). The sun dips behind the land before sunrise and after sunset; a ring keeps the handle
 * visible. Artwork colours below mirror src/core/art/pieces/sky.tsx (artwork, not UI colours).
 */

const SKY: Record<SkyTime, { stops: [number, string][]; land: [string, string]; glow?: { color: string; x: number } }> = {
  dawn: { stops: [[0, '#1B1F4B'], [0.55, '#4B4A8F'], [0.85, '#C77F8E'], [1, '#F2A07B']], land: ['#3A3566', '#2A2750'], glow: { color: '#F7B98A', x: 40 } },
  morning: { stops: [[0, '#6FB3E0'], [0.7, '#BFE3F0'], [1, '#FCE3B8']], land: ['#8DBE7A', '#6FA866'], glow: { color: '#FFE2A8', x: 70 } },
  noon: { stops: [[0, '#4FA6DC'], [1, '#CDEBF7']], land: ['#8FC27A', '#6FA866'] },
  afternoon: { stops: [[0, '#5FA9D9'], [0.75, '#CFE6EE'], [1, '#F6E2B4']], land: ['#9CBF73', '#7DA862'], glow: { color: '#FFE6A8', x: 320 } },
  sunset: { stops: [[0, '#4B2C6B'], [0.55, '#B7577A'], [0.85, '#F28C5B'], [1, '#FBC07A']], land: ['#5C3A5E', '#43294A'], glow: { color: '#FFC07A', x: 350 } },
  night: { stops: [[0, '#0B0D24'], [0.7, '#1E2358'], [1, '#2C3274']], land: ['#1A1E47', '#121535'] },
};

const STARS: [number, number, number][] = [
  [24, 30, 1.6], [62, 70, 1.1], [104, 22, 1.4], [150, 54, 1], [186, 18, 1.7], [232, 64, 1.1], [262, 26, 1.3], [338, 30, 1.5],
  [372, 92, 1.2], [44, 120, 1], [208, 110, 1.2], [128, 100, 0.9], [350, 150, 1], [16, 180, 1.1], [384, 14, 1], [90, 160, 1],
  [250, 150, 0.9], [170, 170, 1],
];

const SkyLayer = memo(function SkyLayer({ time, part, width, height }: { time: SkyTime; part: 'sky' | 'land'; width: number; height: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const s = SKY[time];
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${SKY_W} ${SKY_H}`} preserveAspectRatio="none">
      {part === 'sky' ? (
        <>
          <Defs>
            <Lin id={`${uid}sky`} stops={s.stops} />
            {s.glow ? <Rad id={`${uid}glow`} stops={[[0, s.glow.color, 0.8], [0.55, s.glow.color, 0.3], [1, s.glow.color, 0]]} /> : null}
          </Defs>
          <Rect x={0} y={0} width={SKY_W} height={SKY_H} fill={`url(#${uid}sky)`} />
          {s.glow ? <Circle cx={s.glow.x} cy={SKY_HORIZON} r={150} fill={`url(#${uid}glow)`} /> : null}
          {time === 'night' || time === 'dawn' ? (
            <G>
              {STARS.slice(0, time === 'dawn' ? 9 : STARS.length).map(([x, y, r], i) => (
                <Circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" opacity={(time === 'dawn' ? 0.55 : 0.95) * (i % 3 === 0 ? 1 : 0.7)} />
              ))}
              <Path d={sparklePath(300, 120, 5)} fill="#FFE9A8" opacity={time === 'dawn' ? 0.5 : 0.9} />
            </G>
          ) : null}
          {time === 'night' ? <Path d={crescentPath(296, 72, 26, 13, -10, 22)} fill="#F7D774" /> : null}
          {time === 'dawn' ? <Path d={crescentPath(320, 60, 14, 7, -5, 12)} fill="#FFE9A8" opacity={0.9} /> : null}
          {time === 'morning' || time === 'noon' || time === 'afternoon' ? (
            <>
              <Cloud x={time === 'noon' ? 90 : 230} y={78} r={20} opacity={0.9} />
              <Cloud x={time === 'afternoon' ? 120 : 330} y={116} r={14} opacity={0.8} />
            </>
          ) : null}
        </>
      ) : (
        <>
          <Path d={`M0 ${SKY_HORIZON}C60 238 120 242 190 250S320 236 400 246V300H0Z`} fill={s.land[0]} />
          <Path d="M0 270C80 258 160 264 240 272S350 260 400 266V300H0Z" fill={s.land[1]} />
        </>
      )}
    </Svg>
  );
});

function FadingLayer({ index, s, children }: { index: number; s: SharedValue<number>; children: React.ReactNode }) {
  const style = useAnimatedStyle(() => ({ opacity: layerOpacity(s.value, index) }));
  return <Animated.View style={[StyleSheet.absoluteFill, style]}>{children}</Animated.View>;
}

const SUN_BOX = 96;

const useStyles = makeStyles((c) => ({
  stage: { width: '100%', aspectRatio: SKY_W / SKY_H, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: c.night },
  sun: { position: 'absolute', left: 0, top: 0, width: SUN_BOX, height: SUN_BOX },
  handle: { position: 'absolute', left: 0, top: 0, width: 54, height: 54, borderRadius: 27, borderWidth: 2.5, borderColor: c.onNight },
  caption: { position: 'absolute', left: spacing.sm, top: spacing.sm, right: spacing.sm, alignItems: 'flex-start' },
  captionPill: { borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4, overflow: 'hidden' },
  captionBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.night, opacity: 0.62 },
}));

export interface SkyStageProps {
  /** Day position 0..1 (React state – the source of truth for checks). */
  value: number;
  onChange: (value: number) => void;
  caption: string;
  label: string;
  disabled?: boolean;
  reducedMotion: boolean;
  /** Step used by the screen-reader adjust actions. */
  step?: number;
}

export function SkyStage({ value, onChange, caption, label, disabled, reducedMotion, step = 0.02 }: SkyStageProps) {
  const { c } = useTheme();
  const styles = useStyles();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const s = useSharedValue(value);
  const width = useSharedValue(1);
  const dragging = useSharedValue(0);

  useEffect(() => {
    if (dragging.get()) return;
    s.set(reducedMotion ? value : withTiming(value, { duration: 320 }));
  }, [value, reducedMotion, s, dragging]);

  const report = useCallback(
    (v: number) => {
      onChange(Math.round(v * 200) / 200);
    },
    [onChange],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!disabled)
        .minDistance(0)
        .onBegin((e) => {
          dragging.set(1);
          const v = clamp01(e.x / width.value);
          s.set(v);
          runOnJS(report)(v);
        })
        .onUpdate((e) => {
          const v = clamp01(e.x / width.value);
          s.set(v);
          runOnJS(report)(v);
        })
        .onFinalize(() => {
          dragging.set(0);
        }),
    [disabled, report, s, width, dragging],
  );

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    width.set(w > 0 ? w : 1);
    if (Math.abs(w - size.w) > 1 || Math.abs(h - size.h) > 1) setSize({ w, h });
  };

  const k = size.w / SKY_W;
  const sunStyle = useAnimatedStyle(() => {
    const p = sunPoint(s.value);
    return {
      transform: [{ translateX: p.x * k - SUN_BOX / 2 }, { translateY: p.y * k - SUN_BOX / 2 }],
    };
  });
  const handleStyle = useAnimatedStyle(() => {
    const p = sunPoint(s.value);
    const y = Math.min(p.y, SKY_HORIZON + 18);
    return {
      opacity: disabled ? 0 : p.up ? 0.85 : 1,
      transform: [{ translateX: p.x * k - 27 }, { translateY: y * k - 27 }],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <View
        style={styles.stage}
        onLayout={onLayout}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ text: caption }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          if (disabled) return;
          const delta = e.nativeEvent.actionName === 'increment' ? step : -step;
          onChange(Math.round(clamp01(value + delta) * 200) / 200);
        }}
      >
        {size.w > 0 ? (
          <>
            {SKY_KEYS.map((key, i) => (
              <FadingLayer key={`sky${i}`} index={i} s={s}>
                <SkyLayer time={key.time} part="sky" width={size.w} height={size.h} />
              </FadingLayer>
            ))}
            <Animated.View pointerEvents="none" style={[styles.sun, sunStyle]}>
              <Sun size={SUN_BOX} k={k} />
            </Animated.View>
            {SKY_KEYS.map((key, i) => (
              <FadingLayer key={`land${i}`} index={i} s={s}>
                <SkyLayer time={key.time} part="land" width={size.w} height={size.h} />
              </FadingLayer>
            ))}
            <Animated.View pointerEvents="none" style={[styles.handle, handleStyle]} />
          </>
        ) : null}
        <View pointerEvents="none" style={styles.caption}>
          <View style={styles.captionPill}>
            <View style={styles.captionBg} />
            <AppText variant="small" color={c.onNight}>
              {caption}
            </AppText>
          </View>
        </View>
      </View>
    </GestureDetector>
  );
}

const Sun = memo(function Sun({ size, k }: { size: number; k: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const r = Math.max(12, 24 * k);
  const mid = size / 2;
  return (
    <Svg width={size} height={size}>
      <Defs>
        <Rad id={`${uid}g`} stops={[[0, '#FFF6D6', 0.9], [0.5, '#FFE9A8', 0.35], [1, '#FFE9A8', 0]]} />
      </Defs>
      <Circle cx={mid} cy={mid} r={mid} fill={`url(#${uid}g)`} />
      <Circle cx={mid} cy={mid} r={r} fill="#FFD45E" />
      <Circle cx={mid - r * 0.3} cy={mid - r * 0.3} r={r * 0.32} fill="#FFFFFF" opacity={0.35} />
    </Svg>
  );
});
