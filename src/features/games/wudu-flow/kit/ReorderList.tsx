import { useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { Icon } from '@/core/components/ui/Icon';
import { makeStyles, radius, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';

/*
 * Vertical drag-to-reorder list with fixed row height. The dragged row follows the finger; the others spring into
 * their new slots as it passes them. Every row also has "move up" / "move down" buttons (screen readers, tests,
 * anyone who prefers tapping).
 */

export interface ReorderListProps<T> {
  items: readonly T[];
  keyOf: (item: T) => string;
  /** Row content (left of the move buttons). */
  renderItem: (item: T, index: number) => ReactNode;
  onMove: (from: number, to: number) => void;
  /** Accessible label of a row, e.g. "Wash the face, position 3 of 7". */
  labelOf: (item: T, index: number) => string;
  moveUpLabel: (item: T) => string;
  moveDownLabel: (item: T) => string;
  rowHeight?: number;
  gap?: number;
  disabled?: boolean;
  reducedMotion: boolean;
  /** Row style per item (e.g. green when it is confirmed in place). */
  tone?: (item: T, index: number) => 'normal' | 'correct' | 'wrong';
  onPickUp?: () => void;
}

const SPRING = { damping: 16, stiffness: 200, mass: 0.7 };

const useStyles = makeStyles((c) => ({
  list: { width: '100%' },
  row: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: c.border,
    paddingLeft: spacing.sm,
    shadowColor: c.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  correct: { borderColor: c.success, backgroundColor: c.successSoft },
  wrong: { borderColor: c.goldBorder, backgroundColor: c.goldSoft },
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  move: { width: 40, height: TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' },
  grip: { width: 18, alignItems: 'center', gap: 3 },
  gripDot: { width: 14, height: 2, borderRadius: 1, backgroundColor: c.border },
}));

export function ReorderList<T>(props: ReorderListProps<T>) {
  const { items, rowHeight = 56, gap = spacing.sm } = props;
  const styles = useStyles();
  const step = rowHeight + gap;
  return (
    <View style={[styles.list, { height: items.length * step - gap }]}>
      {items.map((item, index) => (
        <ReorderRow key={props.keyOf(item)} {...props} item={item} index={index} step={step} rowHeight={rowHeight} count={items.length} />
      ))}
    </View>
  );
}

function ReorderRow<T>({
  item,
  index,
  count,
  step,
  rowHeight,
  renderItem,
  onMove,
  labelOf,
  moveUpLabel,
  moveDownLabel,
  disabled,
  reducedMotion,
  tone,
  onPickUp,
}: ReorderListProps<T> & { item: T; index: number; count: number; step: number; rowHeight: number }) {
  const { c } = useTheme();
  const styles = useStyles();
  const y = useSharedValue(index * step);
  const dragging = useSharedValue(0);
  const startY = useSharedValue(0);
  const slot = useSharedValue(index);

  useEffect(() => {
    // While this row is dragged the UI thread owns its slot: re-renders from the moves it reported arrive late and
    // must not reset it (that re-sent moves and scrambled the order on fast drags).
    if (dragging.get() !== 0) return;
    slot.set(index);
    y.set(reducedMotion ? index * step : withSpring(index * step, SPRING));
  }, [index, step, reducedMotion, y, slot, dragging]);

  const move = useCallback((from: number, to: number) => onMove(from, to), [onMove]);
  const pickUp = useCallback(() => onPickUp?.(), [onPickUp]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!disabled)
        .activeOffsetY([-6, 6])
        .onStart(() => {
          dragging.set(1);
          startY.set(y.value);
          runOnJS(pickUp)();
        })
        .onUpdate((e) => {
          const next = Math.max(-step * 0.4, Math.min((count - 1) * step + step * 0.4, startY.value + e.translationY));
          y.set(next);
          const target = Math.max(0, Math.min(count - 1, Math.round(next / step)));
          if (target !== slot.value) {
            const from = slot.value;
            slot.set(target);
            runOnJS(move)(from, target);
          }
        })
        .onFinalize(() => {
          dragging.set(0);
          y.set(reducedMotion ? slot.value * step : withSpring(slot.value * step, SPRING));
        }),
    [disabled, count, step, reducedMotion, y, dragging, startY, slot, move, pickUp],
  );

  const animated = useAnimatedStyle(() => ({
    top: y.value,
    zIndex: dragging.value ? 50 : 1,
    elevation: dragging.value ? 10 : 2,
    transform: [{ scale: dragging.value ? withTiming(1.04, { duration: 120 }) : withTiming(1, { duration: 120 }) }],
  }));

  const state = tone?.(item, index) ?? 'normal';
  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.row, { height: rowHeight }, state === 'correct' && styles.correct, state === 'wrong' && styles.wrong, animated]}
        accessible={false}
      >
        <View style={styles.grip} importantForAccessibility="no-hide-descendants">
          <View style={styles.gripDot} />
          <View style={styles.gripDot} />
          <View style={styles.gripDot} />
        </View>
        <View style={styles.content} accessible accessibilityLabel={labelOf(item, index)}>
          {renderItem(item, index)}
        </View>
        <Pressable
          style={styles.move}
          onPress={() => index > 0 && onMove(index, index - 1)}
          disabled={disabled || index === 0}
          accessibilityRole="button"
          accessibilityLabel={moveUpLabel(item)}
          accessibilityState={{ disabled: disabled || index === 0 }}
        >
          <View style={{ transform: [{ rotate: '-90deg' }], opacity: index === 0 ? 0.3 : 1 }}>
            <Icon name="chevron" size={22} color={c.primaryText} />
          </View>
        </Pressable>
        <Pressable
          style={styles.move}
          onPress={() => index < count - 1 && onMove(index, index + 1)}
          disabled={disabled || index === count - 1}
          accessibilityRole="button"
          accessibilityLabel={moveDownLabel(item)}
          accessibilityState={{ disabled: disabled || index === count - 1 }}
        >
          <View style={{ transform: [{ rotate: '90deg' }], opacity: index === count - 1 ? 0.3 : 1 }}>
            <Icon name="chevron" size={22} color={c.primaryText} />
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

/** Pure helper: moves the element at `from` to `to`. */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const out = [...items];
  if (from < 0 || from >= out.length || to < 0 || to >= out.length || from === to) return out;
  const [it] = out.splice(from, 1);
  out.splice(to, 0, it);
  return out;
}
