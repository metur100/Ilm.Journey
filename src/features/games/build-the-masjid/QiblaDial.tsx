import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { Art } from '@/core/art';
import type { GameApi } from '@/core/games';
import { makeStyles, shadows, useTheme } from '@/core/theme';

import { angleFromCenter, JERUSALEM_BEARING, KAABA_BEARING, nearestTurn } from './logic';

/** Dial units 100 × 100, centre 50/50. */
const D = 100;
const RING = 38;

const useStyles = makeStyles((c) => ({
  dial: { position: 'absolute', borderRadius: 999, backgroundColor: c.surface, borderWidth: 2, borderColor: c.goldBorder, ...shadows(c.shadow).raised },
}));

const polar = (bearingDeg: number, r: number) => {
  const a = (bearingDeg * Math.PI) / 180;
  return { x: 50 + r * Math.sin(a), y: 50 - r * Math.cos(a) };
};

interface QiblaDialProps {
  x: number;
  y: number;
  size: number;
  /** Where the arrow points (degrees from north). */
  angle: number;
  showKaaba: boolean;
  done: boolean;
  disabled: boolean;
  onDrag: (angle: number) => void;
  reducedMotion: boolean;
  t: GameApi['t'];
}

/**
 * The qibla compass of level 3: a small dial over the sky of the scene. The arrow starts on Jerusalem (the first
 * qibla); the learner drags it (or uses the buttons below the scene) towards the Kaʿbah.
 */
export function QiblaDial({ x, y, size, angle, showKaaba, done, disabled, onDrag, reducedMotion, t }: QiblaDialProps) {
  const { c } = useTheme();
  const styles = useStyles();
  const rot = useSharedValue(angle);
  useEffect(() => {
    const target = nearestTurn(rot.value, angle);
    rot.value = reducedMotion ? target : done ? withSpring(target, { damping: 14, stiffness: 140 }) : withTiming(target, { duration: 140 });
  }, [angle, done, reducedMotion, rot]);
  const rotStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));

  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(!disabled)
    .minDistance(2)
    .onBegin((e) => onDrag(angleFromCenter(e.x - size / 2, e.y - size / 2)))
    .onUpdate((e) => onDrag(angleFromCenter(e.x - size / 2, e.y - size / 2)));

  const jerusalem = polar(JERUSALEM_BEARING, RING);
  const kaaba = polar(KAABA_BEARING, RING);
  const k = size / D;
  return (
    <GestureDetector gesture={pan}>
      <View
        style={[styles.dial, { left: x, top: y, width: size, height: size }]}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={t('a11y.dial', { degrees: Math.round(angle) })}
      >
        <Svg width={size - 4} height={size - 4} viewBox={`0 0 ${D} ${D}`} style={StyleSheet.absoluteFill}>
          <Circle cx={50} cy={50} r={RING} fill="none" stroke={c.border} strokeWidth={1} strokeDasharray="2 3" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = polar(i * 30, 47);
            const b = polar(i * 30, i % 3 === 0 ? 42 : 44.5);
            return <Line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={c.textMuted} strokeWidth={i % 3 === 0 ? 1.6 : 0.8} />;
          })}
          {(['n', 'e', 's', 'w'] as const).map((d, i) => {
            const p = polar(i * 90, 30);
            return (
              <SvgText key={d} x={p.x} y={p.y + 3.5} fontSize={10} fontWeight="bold" textAnchor="middle" fill={d === 'n' ? c.primaryText : c.textMuted}>
                {t(`compass.${d}`)}
              </SvgText>
            );
          })}
          <Circle cx={jerusalem.x} cy={jerusalem.y} r={4.2} fill={c.info} stroke={c.surface} strokeWidth={1.2} />
          {showKaaba ? <Circle cx={kaaba.x} cy={kaaba.y} r={6.5} fill={c.gold} opacity={done ? 0.9 : 0.45} /> : null}
        </Svg>
        {showKaaba ? (
          <View style={{ position: 'absolute', left: kaaba.x * k - 9, top: kaaba.y * k - 9 }} pointerEvents="none">
            <Art name="object.kaaba-icon" size={16} />
          </View>
        ) : null}
        <Animated.View style={[StyleSheet.absoluteFill, rotStyle]} pointerEvents="none">
          <Svg width={size - 4} height={size - 4} viewBox={`0 0 ${D} ${D}`}>
            <Path d="M48 50V22H52V50Z" fill={c.primary} />
            <Path d="M50 9 59 24H41Z" fill={c.primary} stroke={c.primaryText} strokeWidth={1.2} strokeLinejoin="round" />
            <Circle cx={50} cy={50} r={5} fill={c.gold} stroke={c.goldText} strokeWidth={1.2} />
          </Svg>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
