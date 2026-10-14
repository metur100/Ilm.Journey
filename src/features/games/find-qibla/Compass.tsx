import { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { useTheme } from '@/core/theme';

import { normalizeDeg } from './logic';

/*
 * Compass for Find the Qibla. The learner turns the whole `object.compass` (its red needle shows the chosen direction)
 * by dragging around it (circular drag, UI thread) or with a two-finger rotation; screen readers use the adjust
 * actions. The dial ring with N/E/S/W stays fixed (north = up, like the map).
 */

const SPRING = { damping: 18, stiffness: 160, mass: 0.8 };

export interface CompassProps {
  size: number;
  /** Needle angle in degrees (unwrapped – may exceed 360 so animations take the short way). */
  angle: number;
  onChange: (angle: number, fromDrag: boolean) => void;
  onTick?: () => void;
  /** Hint arrow (nearest compass point), level 1 and 2. */
  hintBearing?: number | null;
  /** Revealed qibla after checking. */
  answerBearing?: number | null;
  disabled?: boolean;
  reducedMotion: boolean;
  letters: { n: string; e: string; s: string; w: string };
  label: string;
  valueText: string;
}

export function Compass({ size, angle, onChange, onTick, hintBearing, answerBearing, disabled, reducedMotion, letters, label, valueText }: CompassProps) {
  const { c } = useTheme();
  const rot = useSharedValue(angle);
  const prevFinger = useSharedValue(0);
  const lastTick = useSharedValue(Math.floor(angle / 15));
  const startRot = useSharedValue(0);
  const dragging = useSharedValue(0);
  const mid = size / 2;

  useEffect(() => {
    if (dragging.get()) return;
    rot.set(reducedMotion ? angle : withSpring(angle, SPRING));
  }, [angle, reducedMotion, rot, dragging]);

  const report = useCallback(
    (v: number) => {
      onChange(Math.round(v), true);
    },
    [onChange],
  );
  const tick = useCallback(() => onTick?.(), [onTick]);

  const gesture = useMemo(() => {
    const fingerAngle = (x: number, y: number) => {
      'worklet';
      return (Math.atan2(x - mid, mid - y) * 180) / Math.PI;
    };
    const pan = Gesture.Pan()
      .enabled(!disabled)
      .maxPointers(1)
      .minDistance(2)
      .onBegin((e) => {
        dragging.set(1);
        prevFinger.set(fingerAngle(e.x, e.y));
      })
      .onUpdate((e) => {
        const a = fingerAngle(e.x, e.y);
        let d = a - prevFinger.value;
        if (d > 180) d -= 360;
        if (d < -180) d += 360;
        prevFinger.set(a);
        const next = rot.value + d;
        rot.set(next);
        const t = Math.floor(next / 15);
        if (t !== lastTick.value) {
          lastTick.set(t);
          runOnJS(tick)();
        }
        runOnJS(report)(next);
      })
      .onFinalize(() => {
        dragging.set(0);
      });
    const rotate = Gesture.Rotation()
      .enabled(!disabled)
      .onBegin(() => {
        dragging.set(1);
        startRot.set(rot.value);
      })
      .onUpdate((e) => {
        const next = startRot.value + (e.rotation * 180) / Math.PI;
        rot.set(next);
        runOnJS(report)(next);
      })
      .onFinalize(() => {
        dragging.set(0);
      });
    return Gesture.Race(rotate, pan);
  }, [disabled, mid, prevFinger, rot, lastTick, startRot, dragging, report, tick]);

  const needle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  const art = Math.round(size * 0.74);
  const ticks = useMemo(() => Array.from({ length: 36 }, (_, i) => i * 10), []);
  const letterPos = (deg: number) => {
    const r = mid - 16;
    return { left: mid + r * Math.sin((deg * Math.PI) / 180) - 12, top: mid - r * Math.cos((deg * Math.PI) / 180) - 12 };
  };

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={{ width: size, height: size }}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ text: valueText }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          if (disabled) return;
          onChange(angle + (e.nativeEvent.actionName === 'increment' ? 5 : -5), false);
        }}
      >
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Circle cx={mid} cy={mid} r={mid - 2} fill={c.surface} stroke={c.border} strokeWidth={2} />
          {ticks.map((deg) => {
            const long = deg % 90 === 0;
            const r1 = mid - 4;
            const r2 = mid - (long ? 0 : deg % 30 === 0 ? 9 : 7) - 4;
            const a = (deg * Math.PI) / 180;
            return (
              <Path
                key={deg}
                d={`M${mid + r1 * Math.sin(a)} ${mid - r1 * Math.cos(a)}L${mid + r2 * Math.sin(a)} ${mid - r2 * Math.cos(a)}`}
                stroke={long ? c.text : c.textMuted}
                strokeWidth={long ? 0 : 1.2}
                strokeLinecap="round"
              />
            );
          })}
        </Svg>
        {(
          [
            ['n', 0],
            ['e', 90],
            ['s', 180],
            ['w', 270],
          ] as const
        ).map(([key, deg]) => (
          <View key={key} pointerEvents="none" style={[styles.letter, letterPos(deg)]}>
            <AppText variant="bodyBold" color={key === 'n' ? c.error : c.text}>
              {letters[key]}
            </AppText>
          </View>
        ))}
        {hintBearing != null ? (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${normalizeDeg(hintBearing)}deg` }] }]}>
            <View style={[styles.rim, { opacity: 0.5 }]}>
              <Art name="object.qibla-arrow" size={Math.round(size * 0.2)} />
            </View>
          </View>
        ) : null}
        <Animated.View pointerEvents="none" style={[styles.needle, { width: size, height: size }, needle]}>
          <Art name="object.compass" size={art} />
        </Animated.View>
        {answerBearing != null ? (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ rotate: `${normalizeDeg(answerBearing)}deg` }] }]}>
            <View style={styles.rim}>
              <Art name="object.kaaba-icon" size={Math.round(size * 0.17)} />
            </View>
            <View style={[styles.answerLine, { height: mid - size * 0.17, backgroundColor: c.gold }]} />
          </View>
        ) : null}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  letter: { position: 'absolute', width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  needle: { position: 'absolute', left: 0, top: 0, alignItems: 'center', justifyContent: 'center' },
  rim: { position: 'absolute', top: -2, left: 0, right: 0, alignItems: 'center' },
  answerLine: { position: 'absolute', left: '50%', marginLeft: -2, width: 4, borderRadius: 2, bottom: '50%', opacity: 0.8 },
});
