import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

/** Where a dropped item should go: the top-left corner (board coordinates) it springs to. */
export interface DropTarget {
  x: number;
  y: number;
}

interface DraggableProps {
  /** Home position (top-left) and size inside the board. */
  x: number;
  y: number;
  width: number;
  height: number;
  reducedMotion: boolean;
  disabled?: boolean;
  /** Called on release with the item's centre in board coordinates; return a target to snap to, or null to go home. */
  onDrop: (cx: number, cy: number) => DropTarget | null;
  /** After the item reached its target (spring finished). */
  onSnapped: () => void;
  /** Tap alternative (also used by screen readers). */
  onTap: () => void;
  onLift?: () => void;
  label: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

const SPRING = { damping: 16, stiffness: 180, mass: 0.7 };
const SNAP = { duration: 230, easing: Easing.out(Easing.cubic) };

/**
 * A card / object the learner drags with a finger: it lifts while held, springs to its target when dropped in the
 * right place and springs home (with a soft shake) otherwise. Tapping is the accessible alternative.
 * Under reduced motion every movement is immediate.
 */
export function Draggable({ x, y, width, height, reducedMotion, disabled, onDrop, onSnapped, onTap, onLift, label, style, children }: DraggableProps) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const lift = useSharedValue(0);

  const goHome = () => {
    if (reducedMotion) {
      tx.value = 0;
      ty.value = 0;
      return;
    }
    tx.value = withSequence(withSpring(0, SPRING), withTiming(-5, { duration: 50 }), withTiming(5, { duration: 50 }), withTiming(0, { duration: 50 }));
    ty.value = withSpring(0, SPRING);
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(!disabled)
    .onStart(() => {
      lift.value = reducedMotion ? 1 : withSpring(1, SPRING);
      onLift?.();
    })
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY;
    })
    .onEnd((e) => {
      const target = onDrop(x + width / 2 + e.translationX, y + height / 2 + e.translationY);
      if (!target) {
        goHome();
        return;
      }
      if (reducedMotion) {
        tx.value = target.x - x;
        ty.value = target.y - y;
        onSnapped();
        return;
      }
      // A quick, decisive glide into the slot (a spring takes too long to come to rest).
      ty.value = withTiming(target.y - y, SNAP);
      tx.value = withTiming(target.x - x, SNAP, (finished) => {
        if (finished) runOnJS(onSnapped)();
      });
    })
    .onFinalize(() => {
      lift.value = reducedMotion ? 0 : withSpring(0, SPRING);
    });

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: 1 + lift.value * 0.06 }],
    zIndex: lift.value > 0.01 ? 20 : 2,
    elevation: lift.value > 0.01 ? 8 : 2,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ position: 'absolute', left: x, top: y, width, height }, animated]}>
        <Pressable onPress={onTap} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} style={[{ flex: 1 }, style]}>
          {children}
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}
