import { type ReactNode, useCallback, useEffect, useMemo } from 'react';
import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { type DragArena, useKitMaybe, type ZoneRect } from './context';

/*
 * Drag & drop of the kit. A `DragTile` follows the finger on the UI thread (Reanimated 4 + gesture handler) and, on
 * release, asks its engine whether the zone under the finger accepts it. Accepted tiles shrink into the zone (the
 * engine renders the placed version there); rejected tiles spring home with a soft shake. Every tile is also a
 * button (tap → select, then tap a zone), which is the screen-reader path and the path tests use.
 *
 * Zones (`DropZone`) register with the board's arena and are measured in window coordinates when a drag starts.
 */

export const SPRING = { damping: 16, stiffness: 190, mass: 0.7 } as const;
export const SNAP = { damping: 13, stiffness: 220, mass: 0.6 } as const;

/** Zone id containing (x, y) with `slop` extra margin – the nearest centre wins on overlap. Runs on both threads. */
export function zoneAt(rects: readonly ZoneRect[], x: number, y: number, slop = 12): string {
  'worklet';
  let best = '';
  let bestD = Number.POSITIVE_INFINITY;
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (x >= r.x - slop && x <= r.x + r.w + slop && y >= r.y - slop && y <= r.y + r.h + slop) {
      const dx = x - (r.x + r.w / 2);
      const dy = y - (r.y + r.h / 2);
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = r.id;
      }
    }
  }
  return best;
}

function useArena(arena?: DragArena): DragArena | null {
  const env = useKitMaybe();
  return arena ?? env?.arena ?? null;
}

export interface DropZoneProps {
  /** Unique on the board; the test id is `zone-<id>` unless `testID` is given. */
  id: string;
  /** Tap alternative (put the selected tile here). */
  onPress?: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Style applied (animated) while a tile hovers over the zone. */
  hoverStyle?: ViewStyle;
  testID?: string;
  arena?: DragArena;
  children?: ReactNode;
}

/** A place a DragTile can be dropped on. Lights up while a tile hovers over it. */
export function DropZone({ id, onPress, accessibilityLabel, disabled, style, hoverStyle, testID, arena: arenaProp, children }: DropZoneProps) {
  const arena = useArena(arenaProp);
  const register = arena?.register;
  const ref = useCallback((node: View | null) => register?.(id, disabled ? null : node), [register, id, disabled]);
  useEffect(() => () => register?.(id, null), [register, id]);
  const hover = arena?.hover;
  const scaleTo = hoverStyle ? 1.04 : 1;
  const animated = useAnimatedStyle(() => {
    const on = !!hover && hover.value === id;
    return { transform: [{ scale: withSpring(on ? scaleTo : 1, SPRING) }] };
  });
  const hoverLayer = useAnimatedStyle(() => ({ opacity: withTiming(!!hover && hover.value === id ? 1 : 0, { duration: 120 }) }));
  return (
    <Animated.View style={[style, animated]}>
      {/* Measured box (a plain native view filling the zone). */}
      <View ref={ref} collapsable={false} pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
      {hoverStyle ?<Animated.View pointerEvents="none" style={[{ position: 'absolute', left: -3, right: -3, top: -3, bottom: -3 }, hoverStyle, hoverLayer]} /> : null}
      <Pressable
        onPress={onPress}
        disabled={disabled || !onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        testID={testID ?? `zone-${id}`}
        style={{ flex: 1, alignSelf: 'stretch' }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export interface DragTileProps {
  /** Item id; test id `tile-<id>` unless `testID` is given. */
  id: string;
  /** Called on release with the zone under the finger ('' = none). Return true when the drop is accepted. */
  onDrop: (zoneId: string) => boolean;
  /** Tap: select the tile (then a zone tap places it) or act directly. */
  onPress?: () => void;
  onLift?: () => void;
  disabled?: boolean;
  reducedMotion?: boolean;
  /** Increment to play the gentle "not here" shake (e.g. after a wrong tap-placement). */
  nudge?: number;
  accessibilityLabel: string;
  accessibilityHint?: string;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  arena?: DragArena;
  /** Lift scale while held (default 1.08). */
  liftScale?: number;
  children: ReactNode;
}

export function DragTile({
  id,
  onDrop,
  onPress,
  onLift,
  disabled,
  reducedMotion: reducedProp,
  nudge = 0,
  accessibilityLabel,
  accessibilityHint,
  selected,
  style,
  testID,
  arena: arenaProp,
  liftScale = 1.08,
  children,
}: DragTileProps) {
  const env = useKitMaybe();
  const arena = useArena(arenaProp);
  const reduced = reducedProp ?? env?.reducedMotion ?? false;
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const lift = useSharedValue(0);
  const gone = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (nudge <= 0 || reduced) return;
    shake.set(withSequence(withTiming(-8, { duration: 55 }), withTiming(8, { duration: 70 }), withTiming(-5, { duration: 60 }), withTiming(0, { duration: 55 })));
  }, [nudge, reduced, shake]);

  const settle = useCallback(
    (accepted: boolean) => {
      if (arena) {
        arena.hover.set('');
        arena.dragging.set('');
      }
      if (accepted) {
        // Absorbed into the zone: shrink + fade where it was dropped, then reset in case the tile stays mounted.
        gone.set(reduced ? 1 : withTiming(1, { duration: 140 }));
        setTimeout(() => {
          tx.set(0);
          ty.set(0);
          gone.set(0);
        }, 220);
      } else if (reduced) {
        tx.set(0);
        ty.set(0);
      } else {
        tx.set(withSequence(withSpring(0, SPRING), withTiming(-5, { duration: 50 }), withTiming(5, { duration: 50 }), withTiming(0, { duration: 50 })));
        ty.set(withSpring(0, SPRING));
      }
      lift.set(reduced ? 0 : withSpring(0, SPRING));
    },
    [arena, gone, lift, reduced, tx, ty],
  );

  const end = useCallback((zone: string) => settle(onDrop(zone)), [settle, onDrop]);
  const begin = useCallback(() => {
    arena?.measure();
    onLift?.();
  }, [arena, onLift]);

  const rects = arena?.rects;
  const hover = arena?.hover;
  const dragging = arena?.dragging;
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!disabled)
        .minDistance(4)
        .shouldCancelWhenOutside(false)
        .onStart(() => {
          if (dragging) dragging.set(id);
          lift.set(reduced ? 1 : withSpring(1, SPRING));
          runOnJS(begin)();
        })
        .onUpdate((e) => {
          tx.set(e.translationX);
          ty.set(e.translationY);
          if (rects && hover) hover.set(zoneAt(rects.value, e.absoluteX, e.absoluteY));
        })
        .onEnd((e) => {
          runOnJS(end)(rects ? zoneAt(rects.value, e.absoluteX, e.absoluteY) : '');
        })
        .onFinalize((_e, success) => {
          if (!success) runOnJS(settle)(false);
        }),
    [disabled, id, begin, end, settle, reduced, tx, ty, lift, rects, hover, dragging],
  );

  const animated = useAnimatedStyle(() => {
    const l = lift.value;
    const g = gone.value;
    return {
      zIndex: l > 0.01 ? 100 : 1,
      elevation: l > 0.01 ? 12 : 0,
      opacity: 1 - g,
      transform: [{ translateX: tx.value + shake.value }, { translateY: ty.value }, { scale: (1 + l * (liftScale - 1)) * (1 - g * 0.35) }, { rotate: `${l * -2}deg` }],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[style, animated]}>
        <Pressable
          onPress={disabled ? undefined : onPress}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ selected: !!selected, disabled: !!disabled }}
          testID={testID ?? `tile-${id}`}
        >
          {children}
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}
