import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { spacing } from '../../../theme';
import { ChallengeClock, HintPointer, InlineCaption } from '../board';
import { useEngineCore } from '../engine';
import { Burst, CheckBadge, useShake } from '../fx';
import { FaceView, faceLabel, Tile } from '../primitives';
import { useKitProbe } from '../probe';
import { useMeasure } from '../layout';
import { kitShuffle } from '../scoring';
import type { EngineProps, KitFace } from '../types';

export interface ConnectPair {
  id: string;
  left: KitFace;
  right: KitFace;
}

export interface ConnectPairsProps extends EngineProps {
  pairs: ConnectPair[];
  /** Also shuffle the left column (default: keep the given order). */
  shuffleLeft?: boolean;
  /** Width share of the left column (default 0.5). */
  leftShare?: number;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const GAP = spacing.sm;
const MIDDLE = 44;

/**
 * ConnectPairs – draw a line from an item on the left to its partner on the right (either direction works). A
 * right pair keeps its coloured line and both cards turn green; a wrong line fades and both cards shake. Tap one
 * item, then its partner, works too.
 */
export function ConnectPairs(props: ConnectPairsProps) {
  const { pairs } = props;
  const core = useEngineCore(props, pairs.length);
  const { env, k, reduced } = core;
  const left = useMemo(() => (props.shuffleLeft ? kitShuffle(pairs, `${core.seed}:left`) : pairs), [pairs, props.shuffleLeft, core.seed]);
  const right = useMemo(() => kitShuffle(pairs, `${core.seed}:right`), [pairs, core.seed]);
  const [joined, setJoined] = useState<string[]>([]);
  const [selected, setSelected] = useState<{ side: 'L' | 'R'; id: string } | null>(null);
  const [shakeIds, setShakeIds] = useState<{ L: string; R: string; tick: number }>({ L: '', R: '', tick: 0 });
  const size = useMeasure();
  const onLayout = size.onLayout;
  const testID = props.testID ?? 'connect-pairs';
  const label = (f: KitFace) => faceLabel(f, env.text);
  // Every matched pair keeps its own colour (line, end dots, card borders), so crossing lines stay readable.
  const pairIndex = (id: string) => joined.indexOf(id);
  const pairColor = (id: string) => k.pairColors[pairIndex(id) % k.pairColors.length];
  const pairSoft = (id: string) => k.pairSoft[pairIndex(id) % k.pairSoft.length];

  const n = pairs.length;
  const colW = size.w > 0 ? Math.floor((size.w - MIDDLE) * (props.leftShare ?? 0.5)) : 120;
  const rightX = colW + MIDDLE;
  const rightW = size.w > 0 ? size.w - rightX : 120;
  const rowH = size.h > 0 ? Math.max(48, Math.min(84, Math.floor((size.h - GAP * (n - 1)) / n))) : 60;
  const top = size.h > 0 ? Math.max(0, (size.h - (n * rowH + (n - 1) * GAP)) / 2) : 0;
  const cy = (i: number) => top + i * (rowH + GAP) + rowH / 2;
  const anchorL = (i: number) => ({ x: colW + 4, y: cy(i) });
  const anchorR = (i: number) => ({ x: rightX - 4, y: cy(i) });

  const connect = (leftId: string, rightId: string): boolean => {
    if (core.finishedRef.current || joined.includes(leftId) || joined.includes(rightId)) return false;
    setSelected(null);
    if (leftId !== rightId) {
      core.wrong(leftId);
      setShakeIds((s) => ({ L: leftId, R: rightId, tick: s.tick + 1 }));
      return false;
    }
    const next = [...joined, leftId];
    setJoined(next);
    core.progress(next.length);
    core.right();
    if (next.length === n) core.finish();
    return true;
  };

  // Live line (UI thread).
  const active = useSharedValue(0);
  const x0 = useSharedValue(0);
  const y0 = useSharedValue(0);
  const x1 = useSharedValue(0);
  const y1 = useSharedValue(0);
  const startSide = useSharedValue(0); // 1 left, 2 right
  const startIndex = useSharedValue(-1);
  const joinedFlags = useSharedValue<number[]>([]);
  useEffect(() => {
    joinedFlags.set(left.map((p) => (joined.includes(p.id) ? 1 : 0)).concat(right.map((p) => (joined.includes(p.id) ? 1 : 0))));
  }, [joined, left, right, joinedFlags]);

  const endDrag = (side: number, from: number, to: number) => {
    if (from < 0 || to < 0) return;
    if (side === 1) connect(left[from].id, right[to].id);
    else connect(left[to].id, right[from].id);
  };

  const geometry = { colW, rightX, rowH, top, n, gap: GAP };
  const pan = Gesture.Pan()
    .minDistance(2)
    .onStart((e) => {
      'worklet';
      const g = geometry;
      const row = Math.floor((e.y - g.top) / (g.rowH + g.gap));
      if (row < 0 || row >= g.n) return;
      const flags = joinedFlags.value;
      if (e.x <= g.colW + 10) {
        if (flags[row]) return;
        startSide.set(1);
        x0.set(g.colW + 4);
      } else if (e.x >= g.rightX - 10) {
        if (flags[g.n + row]) return;
        startSide.set(2);
        x0.set(g.rightX - 4);
      } else return;
      startIndex.set(row);
      y0.set(g.top + row * (g.rowH + g.gap) + g.rowH / 2);
      x1.set(e.x);
      y1.set(e.y);
      active.set(1);
    })
    .onUpdate((e) => {
      'worklet';
      if (!active.value) return;
      x1.set(e.x);
      y1.set(e.y);
    })
    .onEnd((e) => {
      'worklet';
      if (!active.value) return;
      const g = geometry;
      const row = Math.floor((e.y - g.top) / (g.rowH + g.gap));
      const onOther = startSide.value === 1 ? e.x >= g.rightX - 16 : e.x <= g.colW + 16;
      const to = onOther && row >= 0 && row < g.n ? row : -1;
      runOnJS(endDrag)(startSide.value, startIndex.value, to);
    })
    .onFinalize(() => {
      'worklet';
      active.set(withTiming(0, { duration: 160 }));
      startIndex.set(-1);
    });

  const liveLine = useAnimatedProps(() => {
    const mx = (x0.value + x1.value) / 2;
    return { d: `M${x0.value} ${y0.value}C${mx} ${y0.value} ${mx} ${y1.value} ${x1.value} ${y1.value}`, strokeOpacity: active.value };
  });
  const liveDot = useAnimatedProps(() => ({ cx: x1.value, cy: y1.value, fillOpacity: active.value }));

  useKitProbe({
    engine: 'ConnectPairs',
    testID,
    step: () => {
      const next = pairs.find((p) => !joined.includes(p.id));
      if (!next) return false;
      connect(next.id, next.id);
      return true;
    },
    mistake: () => {
      const open = pairs.filter((p) => !joined.includes(p.id));
      if (open.length < 2) return false;
      connect(open[0].id, open[1].id);
      return true;
    },
    done: () => joined.length === n,
  });


  const tap = (side: 'L' | 'R', id: string) => {
    if (joined.includes(id)) return;
    if (!selected || selected.side === side) {
      setSelected(selected?.id === id && selected.side === side ? null : { side, id });
      core.touch();
      return;
    }
    if (side === 'R') connect(selected.id, id);
    else connect(id, selected.id);
  };

  const firstOpen = left.findIndex((p) => !joined.includes(p.id));
  const hintTo = firstOpen >= 0 ? right.findIndex((p) => p.id === left[firstOpen].id) : -1;

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <GestureDetector gesture={pan}>
        <View style={styles.area} onLayout={onLayout} collapsable={false}>
          {size.w > 0 ? (
            <>
              <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill} pointerEvents="none">
                {joined.map((id) => {
                  const a = anchorL(left.findIndex((p) => p.id === id));
                  const b = anchorR(right.findIndex((p) => p.id === id));
                  const mx = (a.x + b.x) / 2;
                  const d = `M${a.x} ${a.y}C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
                  return (
                    <G key={id}>
                      {/* A halo in the board colour keeps crossing lines apart. */}
                      <Path d={d} stroke={k.board[1]} strokeWidth={10} strokeLinecap="round" fill="none" />
                      <Path d={d} stroke={pairColor(id)} strokeWidth={5} strokeLinecap="round" fill="none" />
                    </G>
                  );
                })}
                <AnimatedPath animatedProps={liveLine} stroke={k.gold} strokeWidth={5} strokeDasharray="1 9" strokeLinecap="round" fill="none" />
                <AnimatedCircle animatedProps={liveDot} r={9} fill={k.gold} />
              </Svg>
              {left.map((p, i) => (
                <Item
                  key={`L-${p.id}`}
                  face={p.left}
                  x={0}
                  y={cy(i) - rowH / 2}
                  w={colW}
                  h={rowH}
                  side="L"
                  done={joined.includes(p.id)}
                  selected={selected?.side === 'L' && selected.id === p.id}
                  shakeTick={shakeIds.L === p.id ? shakeIds.tick : 0}
                  reduced={reduced}
                  testID={`left-${p.id}`}
                  label={joined.includes(p.id) ? env.kt('connect.done', { label: label(p.left) }) : env.kt('connect.item', { label: label(p.left) })}
                  onPress={() => tap('L', p.id)}
                  dotColor={joined.includes(p.id) ? pairColor(p.id) : k.accent}
                  doneSoft={joined.includes(p.id) ? pairSoft(p.id) : undefined}
                />
              ))}
              {right.map((p, i) => (
                <Item
                  key={`R-${p.id}`}
                  face={p.right}
                  x={rightX}
                  y={cy(i) - rowH / 2}
                  w={rightW}
                  h={rowH}
                  side="R"
                  done={joined.includes(p.id)}
                  selected={selected?.side === 'R' && selected.id === p.id}
                  shakeTick={shakeIds.R === p.id ? shakeIds.tick : 0}
                  reduced={reduced}
                  testID={`right-${p.id}`}
                  label={joined.includes(p.id) ? env.kt('connect.done', { label: label(p.right) }) : env.kt('connect.item', { label: label(p.right) })}
                  onPress={() => tap('R', p.id)}
                  dotColor={joined.includes(p.id) ? pairColor(p.id) : k.accent}
                  doneSoft={joined.includes(p.id) ? pairSoft(p.id) : undefined}
                />
              ))}
              {core.hintsOn && core.idle && !selected && firstOpen >= 0 && hintTo >= 0 ? <HintPointer from={anchorL(firstOpen)} to={anchorR(hintTo)} /> : null}
            </>
          ) : null}
        </View>
      </GestureDetector>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
    </View>
  );
}

function Item({
  face,
  x,
  y,
  w,
  h,
  side,
  done,
  selected,
  shakeTick,
  reduced,
  testID,
  label,
  onPress,
  dotColor,
  doneSoft,
}: {
  face: KitFace;
  x: number;
  y: number;
  w: number;
  h: number;
  side: 'L' | 'R';
  done: boolean;
  selected: boolean;
  shakeTick: number;
  reduced: boolean;
  testID: string;
  label: string;
  onPress: () => void;
  dotColor: string;
  doneSoft?: string;
}) {
  const { style, shake } = useShake(reduced);
  useEffect(() => {
    if (shakeTick > 0) shake();
  }, [shakeTick, shake]);
  const hasArt = !!face.art;
  return (
    <Animated.View style={[{ position: 'absolute', left: x, top: y, width: w, height: h }, style]}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected, disabled: done }} testID={testID} style={{ flex: 1 }}>
        <Tile
          state={done ? 'right' : selected ? 'selected' : 'idle'}
          height={h}
          padding={4}
          faceStyle={[{ paddingHorizontal: spacing.sm }, done ? { borderColor: dotColor, borderWidth: 2.5, backgroundColor: doneSoft } : null]}
        >
          <FaceView face={face} row={hasArt && w > 130} artSize={Math.min(64, h - 16)} arabicSize={Math.min(28, h * 0.42)} variant="small" numberOfLines={2} />
        </Tile>
        <View style={[styles.dot, side === 'L' ? { right: -7 } : { left: -7 }, { top: h / 2 - 9, backgroundColor: done ? dotColor : 'transparent', borderColor: dotColor }]} pointerEvents="none" />
        <CheckBadge show={done} size={18} style={side === 'L' ? { left: -6, right: undefined, top: -6 } : undefined} />
        {done ? <Burst trigger={1} distance={36} size={10} /> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  area: { flex: 1 },
  dot: { position: 'absolute', width: 18, height: 18, borderRadius: 9, borderWidth: 3 },
});
