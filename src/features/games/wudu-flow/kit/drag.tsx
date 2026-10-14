import { useCallback, useMemo, useRef, type ReactNode } from 'react';
import { Pressable, type StyleProp, type View, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';

/*
 * Drag & drop for the Salah games: a draggable item follows the finger (Reanimated, UI thread) and springs back when
 * the drop is not accepted. Drop zones are measured in window coordinates when a drag begins; the zone under the
 * finger is highlighted while dragging (`zones.hover`). Every draggable is also a button (tap to select / act), so
 * screen-reader users and tests can play without gestures.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Index of the rect containing (x, y) – with `slop` extra margin – or −1. Runs on both threads. */
export function hitTest(rects: readonly (Rect | null | undefined)[], x: number, y: number, slop = 0): number {
  'worklet';
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (r && x >= r.x - slop && x <= r.x + r.w + slop && y >= r.y - slop && y <= r.y + r.h + slop) return i;
  }
  return -1;
}

export interface DropZones {
  /** Ref callback for zone `index` (attach to a native View). */
  ref: (index: number) => (node: View | null) => void;
  /** Re-measures all zones (called automatically when a drag begins). */
  measure: () => void;
  rects: SharedValue<(Rect | null)[]>;
  /** Zone under the finger while dragging (−1 none). */
  hover: SharedValue<number>;
}

export function useDropZones(): DropZones {
  const nodes = useRef(new Map<number, View>());
  const refs = useRef(new Map<number, (node: View | null) => void>());
  const rects = useSharedValue<(Rect | null)[]>([]);
  const hover = useSharedValue(-1);

  const ref = useCallback((index: number) => {
    let cb = refs.current.get(index);
    if (!cb) {
      cb = (node: View | null) => {
        if (node) nodes.current.set(index, node);
        else nodes.current.delete(index);
      };
      refs.current.set(index, cb);
    }
    return cb;
  }, []);

  const measure = useCallback(() => {
    const entries = [...nodes.current.entries()];
    const out: (Rect | null)[] = [];
    let pending = entries.length;
    for (const [index, node] of entries) {
      if (typeof node?.measureInWindow !== 'function') {
        pending--;
        continue;
      }
      node.measureInWindow((x, y, w, h) => {
        out[index] = { x, y, w, h };
        pending--;
        if (pending <= 0) rects.set(out.slice());
      });
    }
  }, [rects]);

  return useMemo(() => ({ ref, measure, rects, hover }), [ref, measure, rects, hover]);
}

export interface DraggableProps {
  zones: DropZones;
  /** Zone index under the finger (−1: none). Return true when the drop is accepted (no spring back). */
  onDrop: (zone: number) => boolean;
  /** Tap / screen-reader activation. */
  onPress: () => void;
  onPickUp?: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  selected?: boolean;
  disabled?: boolean;
  reducedMotion: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

const SPRING = { damping: 14, stiffness: 180, mass: 0.7 };

export function Draggable({ zones, onDrop, onPress, onPickUp, accessibilityLabel, accessibilityHint, selected, disabled, reducedMotion, style, children }: DraggableProps) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const lifted = useSharedValue(0);

  const settle = useCallback(
    (accepted: boolean) => {
      zones.hover.set(-1);
      if (accepted || reducedMotion) {
        tx.set(0);
        ty.set(0);
      } else {
        tx.set(withSpring(0, SPRING));
        ty.set(withSpring(0, SPRING));
      }
      lifted.set(reducedMotion ? 0 : withTiming(0, { duration: 160 }));
    },
    [zones.hover, reducedMotion, tx, ty, lifted],
  );

  const end = useCallback((zone: number) => settle(onDrop(zone)), [settle, onDrop]);
  const begin = useCallback(() => {
    zones.measure();
    onPickUp?.();
  }, [zones, onPickUp]);

  const rects = zones.rects;
  const hover = zones.hover;
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!disabled)
        .minDistance(6)
        .onStart(() => {
          runOnJS(begin)();
          lifted.set(reducedMotion ? 1 : withSpring(1, SPRING));
        })
        .onUpdate((e) => {
          tx.set(e.translationX);
          ty.set(e.translationY);
          hover.set(hitTest(rects.value, e.absoluteX, e.absoluteY, 10));
        })
        .onEnd((e) => {
          runOnJS(end)(hitTest(rects.value, e.absoluteX, e.absoluteY, 10));
        })
        .onFinalize((_e, success) => {
          if (!success) runOnJS(settle)(false);
        }),
    [disabled, begin, end, settle, reducedMotion, tx, ty, lifted, rects, hover],
  );

  const animated = useAnimatedStyle(() => ({
    zIndex: lifted.value > 0 ? 50 : 0,
    elevation: lifted.value > 0 ? 8 : 0,
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: 1 + lifted.value * 0.1 }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[style, animated]}>
        <Pressable
          onPress={onPress}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ selected: !!selected, disabled: !!disabled }}
        >
          {children}
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

/** Animated highlight of a drop zone while an item hovers over it. */
export function useZoneHover(zones: DropZones, index: number) {
  const hover = zones.hover;
  return useAnimatedStyle(() => {
    const on = hover.value === index;
    return { opacity: on ? 1 : 0, transform: [{ scale: on ? 1.03 : 1 }] };
  });
}
