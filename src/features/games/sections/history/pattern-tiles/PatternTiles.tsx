import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Svg from 'react-native-svg';

import { makeCtx } from '@/core/art/kit';
import { GirihTile, girihRotation } from '@/core/art/pieces/sections/history';
import { AppText } from '@/core/components/ui/AppText';
import { Burst, ChallengeClock, CheckBadge, type EngineProps, Glow, HintPointer, InlineCaption, useEngineCore, useKitProbe, useMeasure } from '@/core/games/kit';
import { radius, spacing } from '@/core/theme';
import { hashString, seededRandom } from '@/core/utils/random';

/*
 * PatternTiles – a rotation puzzle built for the History section (not a kit engine): every tile carries a quarter of a
 * large 8-pointed star and a quarter rosette. Tap a tile to turn it a quarter turn; when every tile sits right, the
 * stars close and the whole pattern glows. Turning a tile that was already right counts as a (gentle) mistake.
 * Works without gestures (taps only), reports progress, has a probe for `playToEnd`, respects reduced motion.
 */

export interface PatternTilesProps extends EngineProps {
  rows: number;
  cols: number;
  /** `all`: every tile starts turned; `some`: only a few tiles are wrong (repair the pattern). */
  scramble: 'all' | 'some';
  /** Show the small finished pattern above the board. */
  preview: boolean;
  /** Texts (already localized). */
  labels: { preview: string; tile: (row: number, col: number) => string; wasRight: string; fits: string; done: string };
}

const GAP = 4;
const tileId = (r: number, c: number) => `tile-${r}-${c}`;

/** Start rotations (quarter turns): deterministic for a seed, never already solved. */
export function startRotations(rows: number, cols: number, scramble: 'all' | 'some', seed: string): number[] {
  const random = seededRandom(hashString(seed));
  const out: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const target = girihRotation(r, c);
      const turn = scramble === 'all' || random() < 0.4 ? 1 + Math.floor(random() * 3) : 0;
      out.push((target + turn) % 4);
    }
  }
  const target = (i: number) => girihRotation(Math.floor(i / cols), i % cols);
  if (out.every((rot, i) => rot === target(i))) out[0] = (out[0] + 2) % 4;
  // One tile already sits right as a starting point (and turning it away is the mistake the learner can make).
  if (!out.some((rot, i) => rot === target(i))) out[out.length - 1] = target(out.length - 1);
  return out;
}

function TileView({ rot, size, right, done, dark, reduced, label, onPress, testID, uid }: { rot: number; size: number; right: boolean; done: boolean; dark: boolean; reduced: boolean; label: string; onPress: () => void; testID: string; uid: string }) {
  const angle = useSharedValue(rot * 90);
  const turns = useRef(rot);
  useEffect(() => {
    // Always turn forwards (clockwise), keep the accumulated angle.
    const next = turns.current + ((rot - (turns.current % 4) + 4) % 4);
    turns.current = next;
    angle.set(reduced ? next * 90 : withSpring(next * 90, { damping: 14, stiffness: 160 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rot]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}deg` }] }));
  const ctx = useMemo(() => makeCtx(uid, { dark }), [uid, dark]);
  return (
    <Pressable onPress={onPress} disabled={done} accessibilityRole="button" accessibilityLabel={label} testID={testID} style={{ width: size, height: size }}>
      <Animated.View style={[{ width: size, height: size, borderRadius: 4, overflow: 'hidden' }, style]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <GirihTile c={ctx} />
        </Svg>
      </Animated.View>
      {right && !done ? (
        <View style={styles.check} pointerEvents="none">
          <CheckBadge show size={16} />
        </View>
      ) : null}
    </Pressable>
  );
}

export function PatternTiles(props: PatternTilesProps) {
  const { rows, cols, scramble, preview, labels } = props;
  const total = rows * cols;
  const core = useEngineCore(props, total);
  const { env, k, reduced } = core;
  const targets = useMemo(() => Array.from({ length: total }, (_, i) => girihRotation(Math.floor(i / cols), i % cols)), [total, cols]);
  const [rots, setRots] = useState(() => startRotations(rows, cols, scramble, `${core.seed}:tiles`));
  const area = useMeasure();
  const glow = useSharedValue(0);
  const testID = props.testID ?? 'pattern-tiles';
  const rightCount = rots.filter((r, i) => r === targets[i]).length;
  const solved = rightCount === total;

  useEffect(() => {
    core.progress(rightCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const turn = (i: number) => {
    if (core.finishedRef.current || solved) return;
    const wasRight = rots[i] === targets[i];
    const next = [...rots];
    next[i] = (next[i] + 1) % 4;
    setRots(next);
    const nowRight = next[i] === targets[i];
    const count = next.filter((r, j) => r === targets[j]).length;
    core.progress(count);
    if (wasRight) {
      core.wrong(tileId(Math.floor(i / cols), i % cols), labels.wasRight);
    } else if (nowRight) {
      core.right({ caption: count === total ? labels.done : labels.fits });
    } else {
      core.touch();
    }
    if (count === total) {
      glow.set(reduced ? withTiming(1, { duration: 200 }) : withSpring(1));
      core.finish(reduced ? 300 : 1200);
    }
  };

  useKitProbe({
    engine: 'PatternTiles',
    testID,
    step: () => {
      const i = rots.findIndex((r, j) => r !== targets[j]);
      if (i < 0 || core.finishedRef.current) return false;
      turn(i);
      return true;
    },
    mistake: () => {
      const i = rots.findIndex((r, j) => r === targets[j]);
      if (i < 0 || solved) return false;
      turn(i);
      return true;
    },
    done: () => solved || core.finishedRef.current,
  });

  const previewSize = preview ? Math.min(84, Math.max(56, area.h * 0.16)) : 0;
  const boardH = Math.max(120, area.h - previewSize - spacing.md);
  const size = Math.floor(Math.min((area.w - GAP * (cols - 1)) / cols, (boardH - GAP * (rows - 1)) / rows, 120));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  const hintIndex = rots.findIndex((r, j) => r !== targets[j]);
  const dark = env.dark;

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.area} onLayout={area.onLayout}>
        {preview && area.w > 0 ? (
          <View style={[styles.preview, { borderColor: k.goldEdge, backgroundColor: k.tileFace }]} accessible accessibilityLabel={labels.preview}>
            <View style={{ width: previewSize, height: (previewSize / cols) * rows, flexDirection: 'row', flexWrap: 'wrap' }}>
              {targets.map((t, i) => (
                <View key={i} style={{ width: previewSize / cols, height: previewSize / cols, transform: [{ rotate: `${t * 90}deg` }] }}>
                  <Svg width={previewSize / cols} height={previewSize / cols} viewBox="0 0 100 100">
                    <GirihTile c={makeCtx(`pv${i}`, { dark })} />
                  </Svg>
                </View>
              ))}
            </View>
            <AppText variant="tiny" color={k.textMuted}>
              {labels.preview}
            </AppText>
          </View>
        ) : null}
        {size > 0 ? (
          <View style={[styles.grid, { width: size * cols + GAP * (cols - 1), gap: GAP }]}>
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { margin: -8, borderRadius: radius.lg, borderWidth: 3, borderColor: k.gold }, glowStyle]} />
            {rots.map((rot, i) => {
              const r = Math.floor(i / cols);
              const c = i % cols;
              return (
                <View key={i}>
                  <TileView
                    uid={`pt${r}${c}`}
                    rot={rot}
                    size={size}
                    right={rot === targets[i]}
                    done={solved}
                    dark={dark}
                    reduced={reduced}
                    label={labels.tile(r + 1, c + 1)}
                    onPress={() => turn(i)}
                    testID={tileId(r, c)}
                  />
                  {core.hintsOn && core.idle && i === hintIndex ? (
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                      <Glow active radius={size / 2} spread={4} />
                      <HintPointer from={{ x: size / 2, y: size / 2 }} />
                    </View>
                  ) : null}
                </View>
              );
            })}
            {solved ? <Burst trigger={1} distance={size * cols * 0.5} size={16} /> : null}
          </View>
        ) : null}
      </View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  area: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, minHeight: 200 },
  preview: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1.5, borderRadius: radius.md, padding: spacing.xs, paddingRight: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  check: { position: 'absolute', top: 2, right: 2 },
});
