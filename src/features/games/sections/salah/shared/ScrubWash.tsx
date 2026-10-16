import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Art, hasArt } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Burst, ChallengeClock, CheckBadge, faceLabel, Glow, HintPointer, InlineCaption, kitShuffle, Tile, useKitColors, type EngineProps, type KitItem, type KitText } from '@/core/games/kit';
import { useEngineCore } from '@/core/games/kit/engine';
import { useMeasure } from '@/core/games/kit/layout';
import { useKitProbe } from '@/core/games/kit/probe';
import { fonts, radius, spacing } from '@/core/theme';

/*
 * ScrubWash – a custom engine of the salah section (the kit has no "rub until covered" mechanic): rub your finger over
 * the pictures until each one is fully covered with water (gusul: no dry spot may remain) or with clean earth
 * (tejemmum: wiping). Every card fills up while the finger moves over it; a tap adds a third (the accessible path).
 * `ordered`: only the next card accepts (the others stay dry, a tap on them is a gentle mistake).
 */

export interface ScrubPart extends KitItem {
  caption?: KitText;
}

export interface ScrubWashProps extends EngineProps {
  parts: ScrubPart[];
  ordered?: boolean;
  /** Water (gusul) or clean earth (tejemmum). */
  material?: 'water' | 'earth';
  columns?: number;
  wrongText?: KitText;
  /** Keep the given card order (default: shuffled; ordered games keep the order). */
  keepOrder?: boolean;
}

/** Mutable bookkeeping read synchronously by the rub handler (React state is what renders). */
function createScrubStore() {
  let cover: Record<string, number> = {};
  let done: string[] = [];
  let last: { x: number; y: number } | null = null;
  return {
    cover: () => cover,
    done: () => done,
    last: () => last,
    setCover: (v: Record<string, number>) => {
      cover = v;
    },
    setDone: (v: string[]) => {
      done = v;
    },
    setLast: (v: { x: number; y: number } | null) => {
      last = v;
    },
  };
}

/** Finger travel (in card widths) that covers one card completely. */
const RUB_TO_FULL = 2.2;
const TAP_STEP = 0.34;

/** Pure: new coverage after rubbing `distance` px over a card of width `w`. */
export function rubCoverage(current: number, distance: number, w: number): number {
  return Math.min(1, current + distance / Math.max(1, w * RUB_TO_FULL));
}

export function ScrubWash(props: ScrubWashProps) {
  const { parts, ordered } = props;
  const core = useEngineCore(props, parts.length);
  const { env, reduced } = core;
  const k = useKitColors();
  const grid = useMemo(() => (ordered || props.keepOrder ? [...parts] : kitShuffle(parts, `${core.seed}:scrub`)), [parts, ordered, props.keepOrder, core.seed]);
  const [cover, setCover] = useState<Record<string, number>>({});
  const [doneIds, setDoneIds] = useState<string[]>([]);
  // Mutable bookkeeping read synchronously by the rub handler (state below is what renders).
  const store = useMemo(() => createScrubStore(), []);
  const [shakeTick, setShakeTick] = useState<{ id: string; n: number }>({ id: '', n: 0 });
  const area = useMeasure();
  const testID = props.testID ?? 'scrub-wash';
  const next = parts.find((p) => !doneIds.includes(p.id));
  const label = (p: KitItem) => faceLabel(p, env.text);
  const columns = props.columns ?? (parts.length > 4 ? 3 : 2);
  const earth = props.material === 'earth';

  const gap = spacing.sm;
  const cardW = area.w > 0 ? Math.floor((area.w - gap * (columns - 1)) / columns) : 96;
  const rows = Math.ceil(parts.length / columns);
  const cardH = area.h > 0 ? Math.max(84, Math.min(cardW * 1.1, (area.h - gap * (rows - 1)) / rows)) : 100;

  const complete = (id: string) => {
    if (store.done().includes(id)) return;
    store.setDone([...store.done(), id]);
    setDoneIds(store.done());
    core.progress(store.done().length);
    const part = parts.find((p) => p.id === id)!;
    core.right({ caption: part.caption ? `${label(part)} – ${env.text(part.caption)}` : label(part), tone: part.caption ? 'fact' : 'right' });
    if (store.done().length === parts.length) core.finish(reduced ? 300 : 1100);
  };

  const add = (id: string, amount: number, fromTap: boolean) => {
    if (core.finishedRef.current || store.done().includes(id)) return;
    const nextId = parts.find((p) => !store.done().includes(p.id))?.id;
    if (ordered && id !== nextId) {
      if (fromTap) {
        core.wrong(id, props.wrongText ? env.text(props.wrongText) : undefined);
        setShakeTick((s) => ({ id, n: s.n + 1 }));
      }
      return;
    }
    const value = Math.min(1, (store.cover()[id] ?? 0) + amount);
    store.setCover({ ...store.cover(), [id]: value });
    setCover(store.cover());
    if (fromTap) core.touch();
    if (value >= 0.999) complete(id);
  };

  // Finger rubbing: hit-test the grid on the JS side (positions relative to the grid).
  const rubAt = (x: number, y: number) => {
    const prev = store.last();
    store.setLast({ x, y });
    if (!prev) return;
    const col = Math.floor(x / (cardW + gap));
    const row = Math.floor(y / (cardH + gap));
    if (col < 0 || col >= columns || row < 0) return;
    const inX = x - col * (cardW + gap) <= cardW;
    const inY = y - row * (cardH + gap) <= cardH;
    const part = grid[row * columns + col];
    if (!part || !inX || !inY) return;
    const d = Math.hypot(x - prev.x, y - prev.y);
    add(part.id, rubCoverage(0, d, cardW), false);
  };
  const endRub = () => {
    store.setLast(null);
  };
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(2)
        .onBegin((e) => runOnJS(rubAt)(e.x, e.y))
        .onUpdate((e) => runOnJS(rubAt)(e.x, e.y))
        .onFinalize(() => runOnJS(endRub)()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cardW, cardH, columns, grid, doneIds, ordered],
  );

  useKitProbe({
    engine: 'ScrubWash',
    testID,
    step: () => {
      if (!next) return false;
      add(next.id, 1, false);
      return true;
    },
    mistake: () => {
      if (!ordered) return false;
      const other = parts.find((p) => !store.done().includes(p.id) && p.id !== next?.id);
      if (!other) return false;
      add(other.id, TAP_STEP, true);
      return true;
    },
    done: () => !next,
  });

  const hintIndex = next ? grid.findIndex((p) => p.id === next.id) : -1;

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <GestureDetector gesture={pan}>
        <View style={styles.grid} onLayout={area.onLayout}>
          {grid.map((part, i) => (
            <ScrubCard
              key={part.id}
              part={part}
              label={label(part)}
              coverage={cover[part.id] ?? 0}
              done={doneIds.includes(part.id)}
              isNext={core.hintsOn && ordered === true && next?.id === part.id}
              shake={shakeTick.id === part.id ? shakeTick.n : 0}
              earth={earth}
              reduced={reduced}
              width={cardW}
              height={cardH}
              style={{ marginLeft: i % columns ? gap : 0, marginTop: i >= columns ? gap : 0 }}
              a11y={env.kt('a11y.zone', { label: label(part) })}
              onPress={() => add(part.id, TAP_STEP, true)}
              waterColor={earth ? k.goldSoft : k.waterSoft}
              lineColor={earth ? k.gold : k.water}
            />
          ))}
          {core.hintsOn && core.idle && hintIndex >= 0 ? (
            <HintPointer
              from={{ x: (hintIndex % columns) * (cardW + gap) + cardW * 0.25, y: Math.floor(hintIndex / columns) * (cardH + gap) + cardH * 0.5 }}
              to={{ x: (hintIndex % columns) * (cardW + gap) + cardW * 0.75, y: Math.floor(hintIndex / columns) * (cardH + gap) + cardH * 0.5 }}
            />
          ) : null}
        </View>
      </GestureDetector>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
    </View>
  );
}

function ScrubCard({
  part,
  label,
  coverage,
  done,
  isNext,
  shake,
  earth,
  reduced,
  width,
  height,
  style,
  a11y,
  onPress,
  waterColor,
  lineColor,
}: {
  part: ScrubPart;
  label: string;
  coverage: number;
  done: boolean;
  isNext: boolean;
  shake: number;
  earth: boolean;
  reduced: boolean;
  width: number;
  height: number;
  style: object;
  a11y: string;
  onPress: () => void;
  waterColor: string;
  lineColor: string;
}) {
  const level = useSharedValue(coverage);
  const x = useSharedValue(0);
  useEffect(() => {
    level.set(reduced ? coverage : withTiming(coverage, { duration: 220, easing: Easing.out(Easing.quad) }));
  }, [coverage, reduced, level]);
  useEffect(() => {
    if (shake <= 0 || reduced) return;
    x.set(0);
    x.set(withTiming(1, { duration: 360 }));
  }, [shake, reduced, x]);
  const fill = useAnimatedStyle(() => ({ height: `${level.value * 100}%` }));
  const move = useAnimatedStyle(() => ({ transform: [{ translateX: Math.sin(x.value * Math.PI * 4) * 6 * (1 - x.value) }] }));
  const artSize = Math.min(width - 24, height - 40);
  return (
    <Animated.View style={[{ width, height }, style, move]}>
      {isNext ? <Glow active radius={radius.md} /> : null}
      <Pressable style={styles.fill} accessibilityRole="button" accessibilityLabel={`${a11y} ${Math.round(coverage * 100)}%`} testID={`scrub-${part.id}`} onPress={onPress}>
        <Tile state={done ? 'right' : 'idle'} style={styles.fill} faceStyle={styles.face} padding={0}>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Animated.View style={[styles.water, { backgroundColor: waterColor, borderTopColor: lineColor }, fill]}>
              {earth ? <View style={[styles.grain, { backgroundColor: lineColor }]} /> : null}
            </Animated.View>
          </View>
          <View style={styles.content} pointerEvents="none">
            {part.art && hasArt(part.art) ? <Art name={part.art} size={artSize} /> : null}
            <AppText variant="tiny" align="center" numberOfLines={2} style={{ fontFamily: fonts.bold }}>
              {label}
            </AppText>
          </View>
        </Tile>
        <CheckBadge show={done} />
        {done ? <Burst trigger={1} distance={artSize * 0.6} /> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'center' },
  fill: { flex: 1 },
  face: { flex: 1, overflow: 'hidden' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, padding: 4 },
  water: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 2, opacity: 0.85 },
  grain: { position: 'absolute', left: 8, right: 8, top: 6, height: 2, opacity: 0.4, borderRadius: 1 },
});
