import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { cancelAnimation, Easing, FadeIn, FadeOut, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { Art, hasArt } from '../../../art';
import { AppText } from '../../../components/ui/AppText';
import { radius, spacing } from '../../../theme';
import { ChallengeClock, InlineCaption } from '../board';
import { useEngineCore } from '../engine';
import { Burst, Pop, useShake } from '../fx';
import { useMeasure } from '../layout';
import { FaceView, faceLabel } from '../primitives';
import { useKitProbe } from '../probe';
import { kitShuffle } from '../scoring';
import type { EngineProps, KitItem } from '../types';

export interface CatchItem extends KitItem {
  /** Belongs in the basket. */
  good: boolean;
}

export interface CatchGameProps extends EngineProps {
  items: CatchItem[];
  /** Right items to collect (default: the number of good items). */
  goal?: number;
  lanes?: 3 | 4;
  speed?: 'calm' | 'normal';
  basketArt?: string;
  /** Background art of the sky (drawn `cover`). */
  sky?: string;
}

interface Falling {
  key: number;
  item: CatchItem;
  lane: number;
}

const ITEM = 60;
const BASKET_H = 86;

/**
 * CatchGame – things float down gently in lanes; move the basket under the right ones. Calm by design: no lives, a
 * missed right item simply comes again, a wrong one in the basket is a gentle "not this". Tap a falling item to catch
 * it directly. Reduced motion: items appear in place and fade, and are tapped.
 */
export function CatchGame(props: CatchGameProps) {
  const { items } = props;
  const goal = props.goal ?? items.filter((i) => i.good).length;
  const core = useEngineCore(props, goal);
  const { env, k, reduced } = core;
  const lanes = props.lanes ?? 3;
  const area = useMeasure();
  const [falling, setFalling] = useState<Falling[]>([]);
  const [caught, setCaught] = useState(0);
  const [lane, setLane] = useState(Math.floor(lanes / 2));
  const [pop, setPop] = useState(0);
  const laneRef = useRef(lane);
  const fallingRef = useRef<Falling[]>([]);
  useLayoutEffect(() => {
    fallingRef.current = falling;
  }, [falling]);
  const caughtRef = useRef(0);
  const keyRef = useRef(0);
  const queue = useRef<CatchItem[]>([]);
  const { style: shakeStyle, shake } = useShake(reduced);
  const testID = props.testID ?? 'catch-game';
  const fallMs = props.speed === 'normal' ? 3200 : 4600;
  const everyMs = props.speed === 'normal' ? 1100 : 1500;

  const laneW = area.w > 0 ? area.w / lanes : 100;
  const basketX = useSharedValue(0);
  useEffect(() => {
    laneRef.current = lane;
    basketX.set(reduced ? lane * laneW : withSpring(lane * laneW, { damping: 15, stiffness: 170 }));
  }, [lane, laneW, reduced, basketX]);

  const nextItem = useCallback((): CatchItem => {
    if (queue.current.length === 0) queue.current = kitShuffle(items, `${core.seed}:${keyRef.current}`);
    return queue.current.shift()!;
  }, [items, core.seed]);

  const spawn = useCallback(
    (forced?: CatchItem): Falling => {
      keyRef.current += 1;
      const item = forced ?? nextItem();
      const f: Falling = { key: keyRef.current, item, lane: (keyRef.current * 7 + item.id.length) % lanes };
      setFalling((list) => [...list.slice(-6), f]);
      return f;
    },
    [nextItem, lanes],
  );

  useEffect(() => {
    if (core.finished) return;
    spawn();
    const id = setInterval(() => spawn(), everyMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [core.finished]);

  const collect = (f: Falling) => {
    setFalling((list) => list.filter((x) => x.key !== f.key));
    if (core.finishedRef.current) return;
    if (!f.item.good) {
      core.wrong(f.item.id, env.kt('fb.tryAgain'));
      shake();
      return;
    }
    caughtRef.current += 1;
    setCaught(caughtRef.current);
    setPop((p) => p + 1);
    core.progress(caughtRef.current);
    core.right({ caption: faceLabel(f.item, env.text) });
    if (caughtRef.current >= goal) core.finish();
  };

  const land = (key: number, expired?: boolean) => {
    const f = fallingRef.current.find((x) => x.key === key);
    if (!f) return;
    if (!expired && f.lane === laneRef.current) collect(f);
    else setFalling((list) => list.filter((x) => x.key !== key));
  };

  useKitProbe({
    engine: 'CatchGame',
    testID,
    step: () => {
      if (caughtRef.current >= goal) return false;
      const good = fallingRef.current.find((f) => f.item.good) ?? spawn(items.find((i) => i.good));
      collect(good);
      return true;
    },
    mistake: () => {
      const bad = items.find((i) => !i.good);
      if (!bad) return false;
      collect(fallingRef.current.find((f) => !f.item.good) ?? spawn(bad));
      return true;
    },
    done: () => caughtRef.current >= goal,
  });

  const pan = Gesture.Pan()
    .minDistance(4)
    .onUpdate((e) => {
      'worklet';
      const target = Math.max(0, Math.min(lanes - 1, Math.floor(e.x / laneW)));
      runOnJS(setLane)(target);
    });
  const basketStyle = useAnimatedStyle(() => ({ transform: [{ translateX: basketX.value }] }));
  const basketTop = area.h - BASKET_H;

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <GestureDetector gesture={pan}>
        <View style={[styles.area, { borderColor: k.boardBorder }]} onLayout={area.onLayout} collapsable={false}>
          {props.sky && hasArt(props.sky) && area.w > 0 ? (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Art name={props.sky} size={area.w} height={area.h} fit="cover" />
            </View>
          ) : null}
          {Array.from({ length: lanes }, (_, i) => (
            <Pressable
              key={i}
              onPress={() => setLane(i)}
              accessibilityRole="button"
              accessibilityLabel={i < lane ? env.kt('catch.left') : env.kt('catch.right')}
              testID={`catch-lane-${i}`}
              style={[styles.lane, { left: i * laneW, width: laneW, borderColor: k.slotBorder }, i === lanes - 1 && { borderRightWidth: 0 }]}
            />
          ))}
          {area.w > 0
            ? falling.map((f) => (
                <FallingItem
                  key={f.key}
                  falling={f}
                  x={f.lane * laneW + (laneW - ITEM) / 2}
                  to={basketTop + 10}
                  ms={fallMs}
                  reduced={reduced}
                  label={env.kt('catch.item', { label: faceLabel(f.item, env.text) })}
                  face={k.tileFace}
                  border={k.tileBorder}
                  onLand={land}
                  onPress={() => collect(f)}
                />
              ))
            : null}
          {area.w > 0 ? (
            <Animated.View style={[styles.basket, { top: basketTop, width: laneW, height: BASKET_H }, basketStyle]} pointerEvents="none" accessible accessibilityLabel={env.kt('catch.basket', { count: caught, total: goal })} testID="catch-basket">
              <Animated.View style={shakeStyle}>
                <Pop trigger={pop}>
                  <Art name={props.basketArt ?? 'kit.basket'} size={Math.min(laneW - 8, 120)} />
                </Pop>
              </Animated.View>
              <Burst trigger={pop} distance={50} />
              <View style={[styles.count, { backgroundColor: k.accent }]}>
                <AppText variant="tiny" color={k.onAccent}>{`${caught}/${goal}`}</AppText>
              </View>
            </Animated.View>
          ) : null}
        </View>
      </GestureDetector>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
    </View>
  );
}

function FallingItem({
  falling,
  x,
  to,
  ms,
  reduced,
  label,
  face,
  border,
  onLand,
  onPress,
}: {
  falling: Falling;
  x: number;
  to: number;
  ms: number;
  reduced: boolean;
  label: string;
  face: string;
  border: string;
  onLand: (key: number, expired?: boolean) => void;
  onPress: () => void;
}) {
  const y = useSharedValue(reduced ? to * (0.2 + ((falling.key * 37) % 50) / 100) : -ITEM);
  const sway = useSharedValue(0);
  useEffect(() => {
    if (reduced) {
      const id = setTimeout(() => onLand(falling.key, true), ms);
      return () => clearTimeout(id);
    }
    y.set(
      withTiming(to, { duration: ms, easing: Easing.linear }, (finished) => {
        if (finished) runOnJS(onLand)(falling.key);
      }),
    );
    sway.set(withTiming(1, { duration: ms, easing: Easing.inOut(Easing.sin) }));
    return () => {
      cancelAnimation(y);
      cancelAnimation(sway);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }, { translateX: Math.sin(sway.value * Math.PI * 3) * 6 }, { rotate: `${Math.sin(sway.value * Math.PI * 2) * 8}deg` }] }));
  return (
    <Animated.View entering={reduced ? FadeIn.duration(300) : undefined} exiting={FadeOut.duration(150)} style={[styles.item, { left: x }]}>
      <Animated.View style={style}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} testID={`catch-item-${falling.item.id}`} style={[styles.bubble, { backgroundColor: face, borderColor: border }]}>
        <FaceView face={{ ...falling.item, label: falling.item.art ? undefined : falling.item.label }} artSize={40} arabicSize={26} variant="tiny" numberOfLines={2} />
      </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  area: { flex: 1, borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden', minHeight: 260 },
  lane: { position: 'absolute', top: 0, bottom: 0, borderRightWidth: 1, borderStyle: 'dashed' },
  item: { position: 'absolute', top: 0, width: ITEM, height: ITEM },
  bubble: { width: ITEM, height: ITEM, borderRadius: ITEM / 2, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  basket: { position: 'absolute', left: 0, alignItems: 'center', justifyContent: 'flex-end' },
  count: { position: 'absolute', top: -6, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 1 },
});
