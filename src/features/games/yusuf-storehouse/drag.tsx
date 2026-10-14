import { type ReactNode, useCallback, useMemo, useRef } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

/*
 * Small drag & drop kit of the game: drop zones measured in window coordinates and a draggable token that springs
 * back when it is not accepted. Gestures run on the JS thread (`runOnJS(true)`) – the game rules are plain JS.
 */

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DropZones {
  /** Ref callback for a zone's view. */
  ref: (id: string) => (node: View | null) => void;
  /** Re-measures every zone (called when a drag starts, so scrolling never leaves stale rects). */
  measure: () => void;
  /** The zone under a window point (with a forgiving margin), or null. */
  hit: (x: number, y: number) => string | null;
}

const MARGIN = 16;

export function useDropZones(): DropZones {
  const nodes = useRef(new Map<string, View | null>());
  const rects = useRef(new Map<string, Rect>());
  const callbacks = useRef(new Map<string, (node: View | null) => void>());

  const ref = useCallback((id: string) => {
    let callback = callbacks.current.get(id);
    if (!callback) {
      callback = (node: View | null) => {
        nodes.current.set(id, node);
        if (!node) rects.current.delete(id);
      };
      callbacks.current.set(id, callback);
    }
    return callback;
  }, []);

  const measure = useCallback(() => {
    nodes.current.forEach((node, id) => {
      node?.measureInWindow?.((x, y, width, height) => {
        if (width > 0 && height > 0) rects.current.set(id, { x, y, width, height });
      });
    });
  }, []);

  const hit = useCallback((x: number, y: number) => {
    let best: string | null = null;
    let bestDistance = Infinity;
    rects.current.forEach((r, id) => {
      if (x < r.x - MARGIN || x > r.x + r.width + MARGIN || y < r.y - MARGIN || y > r.y + r.height + MARGIN) return;
      const distance = Math.hypot(x - (r.x + r.width / 2), y - (r.y + r.height / 2));
      if (distance < bestDistance) {
        best = id;
        bestDistance = distance;
      }
    });
    return best;
  }, []);

  return useMemo(() => ({ ref, measure, hit }), [ref, measure, hit]);
}

const SPRING = { damping: 14, stiffness: 180, mass: 0.7 };

export interface DragTokenProps {
  zones: DropZones;
  /** Called with the zone under the finger (or null); return true when the drop is accepted. */
  onDrop: (zone: string | null) => boolean;
  onPickUp?: () => void;
  /** Called when the drag ends either way (e.g. to clear zone highlights). */
  onRelease?: () => void;
  disabled?: boolean;
  reducedMotion: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/** A view that can be dragged onto drop zones; it lifts while dragged and springs back when not accepted. */
export function DragToken({ zones, onDrop, onPickUp, onRelease, disabled, reducedMotion, style, children }: DragTokenProps) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const lift = useSharedValue(1);
  const z = useSharedValue(0);

  const settle = (accepted: boolean) => {
    if (accepted || reducedMotion) {
      x.value = 0;
      y.value = 0;
      lift.value = 1;
    } else {
      x.value = withSpring(0, SPRING);
      y.value = withSpring(0, SPRING);
      lift.value = withSpring(1, SPRING);
    }
    z.value = 0;
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(!disabled)
    .minDistance(6)
    .onStart(() => {
      zones.measure();
      z.value = 10;
      lift.value = reducedMotion ? 1.05 : withSpring(1.12, SPRING);
      onPickUp?.();
    })
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY;
    })
    .onEnd((e) => {
      const accepted = onDrop(zones.hit(e.absoluteX, e.absoluteY));
      settle(accepted);
    })
    .onFinalize(() => {
      if (z.value !== 0) settle(false);
      onRelease?.();
    });

  const animated = useAnimatedStyle(() => ({
    zIndex: z.value,
    elevation: z.value,
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: lift.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[style, animated]}>{children}</Animated.View>
    </GestureDetector>
  );
}
