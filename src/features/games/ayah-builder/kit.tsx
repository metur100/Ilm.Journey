import { type ReactNode, useEffect, useState } from 'react';
import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
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

import { Art } from '@/core/art';
import {
  arabicVoiceStatus,
  detectArabicVoice,
  onArabicVoiceStatus,
  resetArabicVoiceForTests,
  speakArabic,
  stopSpeaking,
} from '@/core/services/speech';

/*
 * Small play kit shared by the Quran & Arabic games (Ayah Builder, Surah Garden, Letter Lanterns, Word Builder):
 * a draggable tile with spring snap-back and a tap alternative, a sparkle burst, a soft glow and the Arabic voice.
 * Everything respects `reducedMotion` (no movement – instant changes and fades only).
 */

export const SPRING = { damping: 16, stiffness: 180, mass: 0.7 } as const;

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** True when the point lies inside the rect grown by `slop` on every side. */
export function inside(point: Point, rect: Rect, slop = 0): boolean {
  return point.x >= rect.x - slop && point.x <= rect.x + rect.width + slop && point.y >= rect.y - slop && point.y <= rect.y + rect.height + slop;
}

/** Measures a view in window coordinates (drop targets are measured when a drag starts). */
export function measure(view: View | null, onRect: (rect: Rect) => void): void {
  if (!view || typeof view.measureInWindow !== 'function') return;
  view.measureInWindow((x, y, width, height) => onRect({ x, y, width, height }));
}

export interface DraggableTileProps {
  children: ReactNode;
  /** Accessibility label (the tile's text); the tile is a button – tapping is the accessible alternative to dragging. */
  label: string;
  hint?: string;
  reducedMotion: boolean;
  disabled?: boolean;
  /** Tap alternative to dragging. */
  onTap: () => void;
  onDragStart?: () => void;
  /** Called with the finger position (window coordinates) on release; return true when the drop was accepted. */
  onDrop: (center: Point) => boolean;
  /** Increment to play a gentle "not here" shake. */
  nudge?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * A tile the learner can drag (spring follows the finger, springs home when the drop is not accepted) or tap.
 * The parent decides what a drop means (`onDrop`) – accepted tiles are usually removed from the tray by the parent.
 */
export function DraggableTile({ children, label, hint, reducedMotion, disabled, onTap, onDragStart, onDrop, nudge = 0, style }: DraggableTileProps) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const lift = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (nudge === 0 || reducedMotion) return;
    shake.set(withSequence(withTiming(-7, { duration: 60 }), withTiming(7, { duration: 80 }), withTiming(-4, { duration: 70 }), withTiming(0, { duration: 60 })));
  }, [nudge, reducedMotion, shake]);

  // Built every render (cheap) so the callbacks always see the latest props; they run on the JS thread.
  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(!disabled)
    .minDistance(6)
    .onStart(() => {
      lift.set(reducedMotion ? 1 : withSpring(1, SPRING));
      onDragStart?.();
    })
    .onUpdate((e) => {
      tx.set(e.translationX);
      ty.set(e.translationY);
    })
    .onEnd((e) => {
      // The finger position (window coordinates) decides where the tile was dropped.
      const accepted = onDrop({ x: e.absoluteX, y: e.absoluteY });
      if (accepted || reducedMotion) {
        tx.set(0);
        ty.set(0);
      } else {
        tx.set(withSpring(0, SPRING));
        ty.set(withSpring(0, SPRING));
      }
    })
    .onFinalize(() => {
      lift.set(reducedMotion ? 0 : withSpring(0, SPRING));
    });

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value + shake.value }, { translateY: ty.value }, { scale: 1 + lift.value * 0.08 }],
    zIndex: lift.value > 0.01 ? 20 : 1,
    elevation: lift.value * 10,
    shadowOpacity: lift.value * 0.25,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[style, animated]}>
        <Pressable
          onPress={disabled ? undefined : onTap}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityHint={hint}
          accessibilityState={{ disabled: !!disabled }}
          hitSlop={4}
        >
          {children}
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

/** Soft pulsing glow behind a child (hint or "locked in" highlight). Static in reduced motion. */
export function Glow({ color, active, reducedMotion, radius = 18, style }: { color: string; active: boolean; reducedMotion: boolean; radius?: number; style?: StyleProp<ViewStyle> }) {
  const opacity = useSharedValue(0);
  useEffect(() => {
    if (!active) {
      opacity.set(reducedMotion ? 0 : withTiming(0, { duration: 250 }));
      return;
    }
    opacity.set(reducedMotion
      ? 0.55
      : withRepeat(withSequence(withTiming(0.75, { duration: 700, easing: Easing.inOut(Easing.quad) }), withTiming(0.3, { duration: 700, easing: Easing.inOut(Easing.quad) })), -1, true));
  }, [active, opacity, reducedMotion]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, backgroundColor: color, margin: -6 }, style, animated]} />;
}

const BURST = 7;

function Sparkle({ index, progress, size, distance }: { index: number; progress: { value: number }; size: number; distance: number }) {
  const angle = (index / BURST) * Math.PI * 2 + 0.4;
  const animated = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: p <= 0 || p >= 1 ? 0 : 1 - p * p,
      transform: [{ translateX: Math.cos(angle) * distance * p }, { translateY: Math.sin(angle) * distance * p }, { scale: 0.4 + (1 - p) * 0.8 }],
    };
  });
  return (
    <Animated.View style={[styles.sparkle, { marginLeft: -size / 2, marginTop: -size / 2 }, animated]}>
      <Art name="ui.sparkle" size={size} />
    </Animated.View>
  );
}

/**
 * Sparkle burst (`ui.sparkle`) centred in its parent; plays whenever `trigger` changes to a value > 0.
 * Reduced motion: one sparkle fades in and out in place.
 */
export function SparkleBurst({ trigger, reducedMotion, size = 22, distance = 48 }: { trigger: number; reducedMotion: boolean; size?: number; distance?: number }) {
  const progress = useSharedValue(0);
  const fade = useSharedValue(0);
  useEffect(() => {
    if (trigger <= 0) return;
    if (reducedMotion) {
      fade.set(withSequence(withTiming(1, { duration: 150 }), withDelay(350, withTiming(0, { duration: 250 }))));
      return;
    }
    progress.set(0);
    progress.set(withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) }));
  }, [fade, progress, reducedMotion, trigger]);
  const still = useAnimatedStyle(() => ({ opacity: fade.value }));
  if (trigger <= 0) return null;
  return (
    <View pointerEvents="none" style={styles.burst}>
      {reducedMotion ? (
        <Animated.View style={[styles.sparkle, { marginLeft: -size, marginTop: -size }, still]}>
          <Art name="ui.sparkle" size={size * 2} />
        </Animated.View>
      ) : (
        Array.from({ length: BURST }, (_, i) => <Sparkle key={`${trigger}-${i}`} index={i} progress={progress} size={size} distance={distance} />)
      )}
    </View>
  );
}

/** Grows a child in (spring scale) when it mounts; fades in for reduced motion. */
export function GrowIn({ children, reducedMotion, delay = 0, style }: { children: ReactNode; reducedMotion: boolean; delay?: number; style?: StyleProp<ViewStyle> }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.set(reducedMotion ? withTiming(1, { duration: 200 }) : withDelay(delay, withSpring(1, { damping: 11, stiffness: 140 })));
  }, [delay, p, reducedMotion]);
  const animated = useAnimatedStyle(() => (reducedMotion ? { opacity: p.value } : { opacity: Math.min(1, p.value * 2), transform: [{ scale: p.value }] }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

// ---------- Arabic voice (device TTS, see docs/AUDIO.md) ----------

/**
 * Whether the device has an Arabic text-to-speech voice (detected once by the core speech service). Without one, games
 * show the target visually instead of saying it, and the app-wide hint explains how to install a voice.
 */
export function useArabicVoice() {
  const [available, setAvailable] = useState<boolean>(arabicVoiceStatus() === 'available');
  useEffect(() => {
    let alive = true;
    const off = onArabicVoiceStatus((s) => {
      if (alive) setAvailable(s === 'available');
    });
    void detectArabicVoice().then((s) => {
      if (alive) setAvailable(s === 'available');
    });
    return () => {
      alive = false;
      off();
      stopSpeaking();
    };
  }, []);
  return { available, speak: speakArabic };
}

/** Tests: pretend a voice is (or is not) installed; `null` forgets the answer. */
export function setArabicVoiceForTests(value: boolean | null): void {
  resetArabicVoiceForTests(value === null ? 'unknown' : value ? 'available' : 'missing');
}

const styles = StyleSheet.create({
  burst: { position: 'absolute', left: '50%', top: '50%', width: 0, height: 0 },
  sparkle: { position: 'absolute', left: 0, top: 0 },
});
