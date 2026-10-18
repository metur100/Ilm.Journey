import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, LinearTransition, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming, ZoomIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Art } from '../../../art';
import { smoothOpen } from '../../../art/kit';
import { AppText } from '../../../components/ui/AppText';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { fonts, spacing, TOUCH_TARGET } from '../../../theme';
import { ChallengeClock, HintPointer, InlineCaption } from '../board';
import type { KitEnv } from '../context';
import { DragTile } from '../drag';
import { useEngineCore } from '../engine';
import { Burst, CheckBadge, useShake } from '../fx';
import { FaceView, faceLabel, Slot, Tile, Tray } from '../primitives';
import { useKitProbe } from '../probe';
import { useMeasure } from '../layout';
import { kitShuffle } from '../scoring';
import type { EngineProps, KitItem } from '../types';

export interface SequenceBoardProps extends EngineProps {
  /** Items in the correct order. */
  items: KitItem[];
  /**
   * `list` (default): a vertical list the learner reorders by dragging (or with ↑ ↓), then checks.
   * `path`: numbered stones in reading order (left to right, row by row) joined by a path; drag each tile onto its stone (checked on drop).
   */
  variant?: 'list' | 'path';
  /** path: stones per row (default 3 with pictures, 2 with words). */
  columns?: number;
  /** path: art at the end of the path (default `kit.flag`). */
  endArt?: string;
  /** list: row height (default: fits the board, 48–64). */
  rowHeight?: number;
  /** Start order of the list (ids); default: a seeded shuffle that is never already solved. */
  startOrder?: string[];
}

/** Pure helper: moves the element at `from` to `to`. */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const out = [...items];
  if (from < 0 || from >= out.length || to < 0 || to >= out.length || from === to) return out;
  const [it] = out.splice(from, 1);
  out.splice(to, 0, it);
  return out;
}

/** Ids at the wrong position. */
export function misplacedIds(order: readonly string[], correct: readonly string[]): string[] {
  return order.filter((id, i) => correct[i] !== id);
}

/**
 * SequenceBoard – put things in order. `list`: drag rows into order (UI-thread drag that stays correct on fast drags),
 * then "Check" – right rows turn green, misplaced ones shake. `path`: drop tiles onto numbered stones along a path;
 * each drop is checked at once and the next stone glows.
 */
export function SequenceBoard(props: SequenceBoardProps) {
  return props.variant === 'path' ? <SequencePath {...props} /> : <SequenceList {...props} />;
}

// ---------------------------------------------------------------------------------------------------------------
// List variant

const SPRING = { damping: 16, stiffness: 200, mass: 0.7 };

function SequenceList(props: SequenceBoardProps) {
  const { items } = props;
  const core = useEngineCore(props, items.length);
  const { env, reduced } = core;
  const correct = useMemo(() => items.map((i) => i.id), [items]);
  const [order, setOrder] = useState<string[]>(() => props.startOrder ?? kitShuffle(correct, `${core.seed}:seq`));
  const [checked, setChecked] = useState<Record<string, 'right' | 'wrong'>>({});
  const [wrongTick, setWrongTick] = useState(0);
  const [solved, setSolved] = useState(false);
  const measured = useMeasure();
  const height = measured.h;
  const testID = props.testID ?? 'sequence-board';
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const gap = spacing.sm;
  const rowHeight = props.rowHeight ?? (height > 0 ? Math.max(48, Math.min(66, Math.floor((height - gap * (items.length - 1)) / items.length))) : 58);
  const step = rowHeight + gap;

  const move = useCallback(
    (from: number, to: number) => {
      if (solved) return;
      setOrder((prev) => moveItem(prev, from, to));
      setChecked({});
      core.touch();
    },
    [solved, core],
  );

  const check = () => {
    if (solved) return;
    const wrongIds = misplacedIds(order, correct);
    const marks: Record<string, 'right' | 'wrong'> = {};
    order.forEach((id, i) => (marks[id] = correct[i] === id ? 'right' : 'wrong'));
    setChecked(marks);
    core.progress(order.length - wrongIds.length);
    if (wrongIds.length === 0) {
      setSolved(true);
      core.right({ caption: env.kt('seq.right') });
      core.finish(reduced ? 300 : 1100);
      return;
    }
    core.wrong(wrongIds[0], wrongIds.length === 1 ? env.kt('seq.wrongOne') : env.kt('seq.wrong', { count: wrongIds.length }));
    wrongIds.slice(1).forEach((id) => core.miss(id));
    setWrongTick((t) => t + 1);
  };

  useKitProbe({
    engine: 'SequenceBoard',
    testID,
    step: () => {
      if (solved) return false;
      const i = order.findIndex((id, n) => correct[n] !== id);
      if (i < 0) {
        check();
        return true;
      }
      move(order.indexOf(correct[i]), i);
      return true;
    },
    mistake: () => {
      if (solved || misplacedIds(order, correct).length === 0) return false;
      check();
      return true;
    },
    done: () => solved,
  });

  const onLayout = measured.onLayout;

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.listArea} onLayout={onLayout}>
        <View style={{ height: order.length * step - gap }}>
          {order.map((id, index) => (
            <ReorderRow
              key={id}
              item={byId.get(id)!}
              index={index}
              count={order.length}
              step={step}
              rowHeight={rowHeight}
              reduced={reduced}
              disabled={solved}
              mark={checked[id]}
              wrongTick={checked[id] === 'wrong' ? wrongTick : 0}
              solvedDelay={solved ? index * 90 : -1}
              onMove={move}
              env={env}
            />
          ))}
        </View>
        {core.hintsOn && core.idle && !solved && Object.keys(checked).length === 0 && height > 0 ? (
          <HintPointer from={{ x: 60, y: rowHeight / 2 }} to={{ x: 60, y: rowHeight / 2 + step * Math.min(2, order.length - 1) }} />
        ) : null}
      </View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      <View testID="kit-check">
        <Button label={env.kt('check')} icon="check" variant="gold" onPress={check} disabled={solved} />
      </View>
      <View style={{ position: 'absolute', alignSelf: 'center', top: '40%' }} pointerEvents="none">
        <Burst trigger={solved ? core.burst : 0} distance={90} size={18} />
      </View>
    </View>
  );
}

function ReorderRow({
  item,
  index,
  count,
  step,
  rowHeight,
  reduced,
  disabled,
  mark,
  wrongTick,
  solvedDelay,
  onMove,
  env,
}: {
  item: KitItem;
  index: number;
  count: number;
  step: number;
  rowHeight: number;
  reduced: boolean;
  disabled: boolean;
  mark?: 'right' | 'wrong';
  wrongTick: number;
  solvedDelay: number;
  onMove: (from: number, to: number) => void;
  env: KitEnv;
}) {
  const k = env.colors;
  const y = useSharedValue(index * step);
  const dragging = useSharedValue(0);
  const startY = useSharedValue(0);
  const slot = useSharedValue(index);
  const pop = useSharedValue(1);
  const { style: shakeStyle, shake } = useShake(reduced);
  const label = faceLabel(item, env.text);

  useEffect(() => {
    // While this row is dragged the UI thread owns its slot: late re-renders from the moves it reported must not
    // reset it (that re-sent moves and scrambled the order on fast drags).
    if (dragging.get() !== 0) return;
    slot.set(index);
    y.set(reduced ? index * step : withSpring(index * step, SPRING));
  }, [index, step, reduced, y, slot, dragging]);

  useEffect(() => {
    if (wrongTick > 0) shake();
  }, [wrongTick, shake]);

  useEffect(() => {
    if (solvedDelay < 0 || reduced) return;
    pop.set(withDelay(solvedDelay, withSpring(1.05, { damping: 8, stiffness: 300 })));
    const id = setTimeout(() => pop.set(withSpring(1, SPRING)), solvedDelay + 160);
    return () => clearTimeout(id);
  }, [solvedDelay, reduced, pop]);

  const move = useCallback((from: number, to: number) => onMove(from, to), [onMove]);
  const lift = useCallback(() => env.haptic('selection'), [env]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!disabled)
        .activeOffsetY([-6, 6])
        .onStart(() => {
          dragging.set(1);
          startY.set(y.value);
          runOnJS(lift)();
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
          y.set(reduced ? slot.value * step : withSpring(slot.value * step, SPRING));
        }),
    [disabled, count, step, reduced, y, dragging, startY, slot, move, lift],
  );

  const animated = useAnimatedStyle(() => ({
    top: y.value,
    zIndex: dragging.value ? 50 : 1,
    elevation: dragging.value ? 10 : 2,
    transform: [{ scale: dragging.value ? withTiming(1.04, { duration: 120 }) : withTiming(1, { duration: 120 }) }, { rotate: dragging.value ? '-1deg' : '0deg' }],
  }));
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const state = mark === 'right' ? 'right' : mark === 'wrong' ? 'wrong' : 'idle';
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.row, { height: rowHeight }, animated]} testID={`row-${item.id}`}>
        <Animated.View style={[{ flex: 1 }, shakeStyle, popStyle]}>
          <Tile state={state} height={rowHeight} padding={0} faceStyle={styles.rowFace}>
            <View style={[styles.number, { backgroundColor: mark === 'right' ? k.right : k.accent }]}>
              <AppText variant="small" color={k.onAccent} style={{ fontFamily: fonts.heavy }}>
                {String(index + 1)}
              </AppText>
            </View>
            <View style={styles.rowContent} accessible accessibilityLabel={env.kt('seq.position', { label, number: index + 1, total: count })}>
              <FaceView face={item} row artSize={Math.min(40, rowHeight - 14)} arabicSize={24} variant="bodyBold" numberOfLines={2} align="left" />
            </View>
            {!disabled ? (
              <>
                <Pressable style={styles.move} onPress={() => index > 0 && onMove(index, index - 1)} disabled={index === 0} accessibilityRole="button" accessibilityLabel={env.kt('seq.moveUp', { label })} testID={`up-${item.id}`}>
                  <View style={{ transform: [{ rotate: '-90deg' }], opacity: index === 0 ? 0.25 : 1 }}>
                    <Icon name="chevron" size={20} color={k.accentText} />
                  </View>
                </Pressable>
                <Pressable style={styles.move} onPress={() => index < count - 1 && onMove(index, index + 1)} disabled={index === count - 1} accessibilityRole="button" accessibilityLabel={env.kt('seq.moveDown', { label })} testID={`down-${item.id}`}>
                  <View style={{ transform: [{ rotate: '90deg' }], opacity: index === count - 1 ? 0.25 : 1 }}>
                    <Icon name="chevron" size={20} color={k.accentText} />
                  </View>
                </Pressable>
              </>
            ) : null}
            <CheckBadge show={mark === 'right'} size={20} style={{ top: -7, right: -7 }} />
          </Tile>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Path variant

function SequencePath(props: SequenceBoardProps) {
  const { items } = props;
  const core = useEngineCore(props, items.length);
  const { env, k, reduced } = core;
  const pictures = items.every((i) => !!i.art);
  const cols = props.columns ?? (pictures ? 3 : 2);
  const [filled, setFilled] = useState<(string | null)[]>(() => items.map(() => null));
  const [selected, setSelected] = useState<string | null>(null);
  const [nudge, setNudge] = useState<Record<string, number>>({});
  const size = useMeasure();
  const onLayout = size.onLayout;
  const tray = useMemo(() => kitShuffle(items, `${core.seed}:path`), [items, core.seed]);
  const testID = props.testID ?? 'sequence-path';
  const label = (i: KitItem) => faceLabel(i, env.text);
  const next = filled.findIndex((f) => f === null);
  const done = next < 0;

  const place = (itemId: string, slotIndex: number): boolean => {
    if (core.finishedRef.current || slotIndex < 0 || filled[slotIndex]) return false;
    if (items[slotIndex].id !== itemId) {
      core.wrong(itemId);
      setNudge((n) => ({ ...n, [itemId]: (n[itemId] ?? 0) + 1 }));
      setSelected(null);
      return false;
    }
    const nextFilled = filled.map((f, i) => (i === slotIndex ? itemId : f));
    setFilled(nextFilled);
    setSelected(null);
    const count = nextFilled.filter(Boolean).length;
    core.progress(count);
    core.right();
    if (count === items.length) core.finish(reduced ? 300 : 900);
    return true;
  };

  useKitProbe({
    engine: 'SequenceBoard',
    testID,
    step: () => {
      if (done) return false;
      place(items[next].id, next);
      return true;
    },
    mistake: () => {
      if (done) return false;
      const other = items.find((it, i) => i !== next && !filled.includes(it.id));
      if (!other) return false;
      place(other.id, next);
      return true;
    },
    done: () => done,
  });

  // Stones in reading order: left to right, then the next row (1 2 / 3 4 – never a snake that reads 1 2 / 4 3).
  const rows = Math.ceil(items.length / cols);
  const gapX = spacing.md;
  const stoneW = size.w > 0 ? Math.floor((size.w - gapX * (cols - 1)) / cols) : 90;
  // A short board (long word tiles in the tray) packs the rows tighter, so the last stones never hide under the caption.
  const tight = size.h > 0 && size.h < rows * 72 + (rows - 1) * spacing.lg + 12;
  const gapY = tight ? spacing.sm : spacing.lg;
  const stoneH = Math.max(40, Math.min(pictures ? stoneW : 72, size.h > 0 ? Math.floor((size.h - gapY * (rows - 1) - 12) / rows) : 72));
  const pos = items.map((_, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    return { x: c * (stoneW + gapX), y: r * (stoneH + gapY) + 12 };
  });
  const centers = pos.map((p) => [p.x + stoneW / 2, p.y + stoneH / 2] as [number, number]);
  const pathD = centers.length > 1 ? smoothOpen(centers, 0.6) : '';
  const tileW = Math.min(stoneW, pictures ? 96 : 150);
  // Word tiles share one width: 2 per row, 3 when there are many.
  const wordCols = items.length > 4 ? 3 : 2;
  const wordW = size.w > 0 ? Math.floor((size.w - spacing.sm * (wordCols - 1)) / wordCols) : 120;

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.pathArea} onLayout={onLayout}>
        {size.w > 0 ? (
          <>
            <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill} pointerEvents="none">
              <Path d={pathD} stroke={k.slotBorder} strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.35} />
              <Path d={pathD} stroke={k.gold} strokeWidth={3} strokeDasharray="2 9" strokeLinecap="round" fill="none" />
            </Svg>
            {items.map((item, i) => {
              const placed = filled[i];
              return (
                <View key={item.id} style={{ position: 'absolute', left: pos[i].x, top: pos[i].y, width: stoneW, height: stoneH }}>
                  <Slot
                    id={`step-${i}`}
                    testID={`zone-step-${i}`}
                    number={i + 1}
                    state={placed ? 'filled' : core.hintsOn && i === next ? 'next' : 'empty'}
                    accessibilityLabel={placed ? env.kt('a11y.slotFilled', { number: i + 1, label: label(item) }) : env.kt('a11y.slotEmpty', { number: i + 1 })}
                    onPress={selected ? () => place(selected, i) : undefined}
                    style={{ flex: 1 }}
                  >
                    {placed ? (
                      <Animated.View entering={reduced ? FadeIn.duration(150) : ZoomIn.springify().damping(16)} style={{ flex: 1, alignSelf: 'stretch' }}>
                        <Tile state="placed" height={stoneH} padding={4}>
                          <FaceView face={item} artSize={Math.min(44, stoneH - 26)} arabicSize={22} variant="tiny" numberOfLines={2} />
                        </Tile>
                        <Burst trigger={1} distance={40} size={12} />
                      </Animated.View>
                    ) : null}
                  </Slot>
                </View>
              );
            })}
            {items.length > 0 ? (
              <View pointerEvents="none" style={{ position: 'absolute', left: pos[items.length - 1].x + stoneW - 22, top: pos[items.length - 1].y - 30 }}>
                <Art name={props.endArt ?? 'kit.flag'} size={34} />
              </View>
            ) : null}
            {core.hintsOn && core.idle && !selected && !done ? (
              <HintPointer from={{ x: size.w / 2, y: size.h + 40 }} to={{ x: centers[next][0], y: centers[next][1] }} />
            ) : null}
          </>
        ) : null}
      </View>
      <InlineCaption text={selected ? env.kt('fb.selected', { label: label(items.find((i) => i.id === selected)!) }) : core.caption?.text} tone={selected ? 'hint' : core.caption?.tone} />
      <Tray label={env.kt('tray')} style={styles.pathTray}>
        {tray
          .filter((item) => !filled.includes(item.id))
          .map((item) => (
            <Animated.View key={item.id} layout={reduced ? undefined : LinearTransition.duration(220)}>
              <DragTile
                id={item.id}
                selected={selected === item.id}
                nudge={nudge[item.id] ?? 0}
                accessibilityLabel={env.kt('a11y.tile', { label: label(item) })}
                onLift={() => {
                  setSelected(null);
                  core.touch();
                }}
                onPress={() => {
                  setSelected((s) => (s === item.id ? null : item.id));
                  core.touch();
                }}
                onDrop={(zone) => (zone.startsWith('step-') ? place(item.id, Number(zone.slice(5))) : false)}
              >
                <Tile state={selected === item.id ? 'selected' : 'idle'} width={pictures ? tileW : wordW} minHeight={52}>
                  <FaceView face={item} artSize={40} arabicSize={22} variant={pictures ? 'tiny' : 'small'} numberOfLines={2} />
                </Tile>
              </DragTile>
            </Animated.View>
          ))}
      </Tray>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  listArea: { flex: 1, justifyContent: 'center' },
  row: { position: 'absolute', left: 0, right: 0 },
  rowFace: { flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.sm, gap: spacing.sm },
  rowContent: { flex: 1, justifyContent: 'center' },
  number: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  move: { width: 44, height: TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' },
  pathArea: { flex: 1, minHeight: 160 },
  pathTray: { minHeight: 60, paddingTop: spacing.xs },
});
