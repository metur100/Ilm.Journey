import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useReducedMotion } from '@/core/hooks/useReducedMotion';
import { makeStyles, shadows } from '@/core/theme';

/**
 * Shared motion for the question components (v2 visual upgrade, docs/GAMES.md):
 * - `Reactive`: correct → small spring pop + gentle glow, incorrect → soft horizontal shake, and an optional card flip
 *   whenever `face` changes (the new face swings in around the X or Y axis).
 * - `LiftPressable`: a pressed / picked item lifts (scale 1.04 + raised shadow) like a card held in the hand.
 * Everything runs on the native driver and is skipped under reduced motion (state changes become instant).
 */

export type Reaction = 'idle' | 'correct' | 'incorrect';

const POP_SCALE = 1.06;
const SHAKE = [7, -6, 4, -3, 1.5, 0];
const FLIP_MS = 280;
const LIFT_SCALE = 1.04;

interface ReactiveProps {
  reaction: Reaction;
  /** Replays the reaction when it changes although `reaction` stays the same (e.g. a second wrong tap). */
  nonce?: number;
  /** When this value changes, the content flips in like a turned card. */
  face?: string | number | boolean;
  flipAxis?: 'x' | 'y';
  /** Corner radius of the glow ring (match the wrapped tile). */
  radius?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

const useStyles = makeStyles((c) => ({
  glow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderWidth: 3,
    borderColor: c.success,
    backgroundColor: 'transparent',
  },
  lifted: { ...shadows(c.shadow).raised },
}));

export function Reactive({ reaction, nonce = 0, face, flipAxis = 'y', radius = 16, style, children }: ReactiveProps) {
  const reduced = useReducedMotion();
  const styles = useStyles();
  const [scale] = useState(() => new Animated.Value(1));
  const [shift] = useState(() => new Animated.Value(0));
  const [turn] = useState(() => new Animated.Value(0));
  const [glow] = useState(() => new Animated.Value(0));
  const lastReaction = useRef(`${reaction}:${nonce}`);
  const lastFace = useRef(face);

  // Layout effect: the flip's start angle is set before the new face is painted.
  useLayoutEffect(() => {
    const key = `${reaction}:${nonce}`;
    const reactionChanged = key !== lastReaction.current;
    const faceChanged = face !== lastFace.current;
    lastReaction.current = key;
    lastFace.current = face;
    if (reduced || (!reactionChanged && !faceChanged)) return;

    const animations: Animated.CompositeAnimation[] = [];
    if (faceChanged) {
      turn.setValue(1);
      animations.push(Animated.timing(turn, { toValue: 0, duration: FLIP_MS, easing: Easing.out(Easing.cubic), useNativeDriver: true }));
    }
    if (reactionChanged && reaction === 'correct') {
      animations.push(
        Animated.sequence([
          Animated.timing(scale, { toValue: POP_SCALE, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 180, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0, duration: 900, delay: 250, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]),
      );
    }
    if (reactionChanged && reaction === 'incorrect') {
      shift.setValue(0);
      animations.push(
        Animated.sequence(
          SHAKE.map((toValue) => Animated.timing(shift, { toValue, duration: 55, easing: Easing.inOut(Easing.quad), useNativeDriver: true })),
        ),
      );
    }
    if (animations.length > 0) Animated.parallel(animations).start();
  }, [face, glow, nonce, reaction, reduced, scale, shift, turn]);

  const angle = turn.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });
  const transform = [
    { perspective: 900 },
    { translateX: shift },
    { scale },
    flipAxis === 'x' ? { rotateX: angle } : { rotateY: angle },
  ];

  return (
    <Animated.View style={[style, { transform }]}>
      {children}
      <Animated.View pointerEvents="none" style={[styles.glow, { borderRadius: radius + 4, opacity: glow }]} />
    </Animated.View>
  );
}

interface LiftPressableProps extends Omit<PressableProps, 'style'> {
  /** Picked / selected: stays lifted until released. */
  lifted?: boolean;
  /** Style of the pressable tile itself. */
  style?: StyleProp<ViewStyle>;
  /** Style of the animated wrapper (sizing in grids / rows: width, flex …). */
  wrapperStyle?: StyleProp<ViewStyle>;
}

/** Pressable that lifts (scale 1.04 + raised shadow) while pressed or while `lifted`. */
export function LiftPressable({ lifted = false, style, wrapperStyle, onPressIn, onPressOut, disabled, children, ...rest }: LiftPressableProps) {
  const reduced = useReducedMotion();
  const styles = useStyles();
  const [pressed, setPressed] = useState(false);
  const [scale] = useState(() => new Animated.Value(1));
  const up = (lifted || pressed) && !disabled;
  const wasUp = useRef(up);

  useLayoutEffect(() => {
    if (wasUp.current === up) return;
    wasUp.current = up;
    if (reduced) {
      scale.setValue(1);
      return;
    }
    Animated.spring(scale, { toValue: up ? LIFT_SCALE : 1, friction: 6, tension: 160, useNativeDriver: true }).start();
  }, [reduced, scale, up]);

  return (
    <Animated.View style={[wrapperStyle, { transform: [{ scale }], zIndex: up ? 2 : 0 }]}>
      <Pressable
        {...rest}
        disabled={disabled}
        onPressIn={(e) => {
          setPressed(true);
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          setPressed(false);
          onPressOut?.(e);
        }}
        style={[style, up && styles.lifted]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
