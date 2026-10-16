import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, type SharedValue, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { Art } from '@/core/art';
import { crescentPath, sparklePath } from '@/core/art/kit';
import { AppText } from '@/core/components/ui/AppText';
import { Burst, ChallengeClock, Glow, InlineCaption, ProgressDots, type EngineProps, type KitText } from '@/core/games/kit';
import { useEngineCore } from '@/core/games/kit/engine';
import { useMeasure } from '@/core/games/kit/layout';
import { useKitProbe } from '@/core/games/kit/probe';
import { radius, spacing } from '@/core/theme';

import { STAR_FIELD, ActionButton } from '../ui';

/*
 * SkyDial – a custom Ramadan engine: drag the sun (or the moon at night) along the arc of the day and stop it at the
 * right moment (suhoor, dawn / Fajr, iftar at sunset, the night prayer …). The sky colour follows the sun on the UI
 * thread. Tapping a moment on the arc moves the sun there (the accessible path), then "Here!" checks it.
 */

/** The seven sky moments of the dial, left (late night) to right (night after Isha). */
export const SKY_MOMENTS = ['late-night', 'dawn', 'morning', 'noon', 'afternoon', 'sunset', 'night'] as const;
export type SkyMoment = (typeof SKY_MOMENTS)[number];

const SKY: Record<SkyMoment, [string, string, string]> = {
  'late-night': ['#0B0D24', '#1E2358', '#2C3274'],
  dawn: ['#1B1F4B', '#4B4A8F', '#F2A07B'],
  morning: ['#6FB3E0', '#BFE3F0', '#FCE3B8'],
  noon: ['#4FA6DC', '#9FD4EE', '#CDEBF7'],
  afternoon: ['#5FA9D9', '#CFE6EE', '#F6E2B4'],
  sunset: ['#4B2C6B', '#B7577A', '#FBC07A'],
  night: ['#0B0D24', '#1E2358', '#2C3274'],
};

export interface SkyRound {
  id: string;
  /** What to set (shown in the round card). */
  prompt: KitText;
  /** The moment that is right. */
  moment: SkyMoment;
  /** Inline caption when it is right (a short sourced explanation). */
  caption?: KitText;
}

export interface SkyDialProps extends EngineProps {
  rounds: SkyRound[];
  /** Labels of the moments (shown on the arc when `showLabels`). */
  labels: Record<SkyMoment, KitText>;
  showLabels?: boolean;
  /** Texts: the check button, "earlier" / "later". */
  texts: { here: string; earlier: string; later: string; moment: (label: string) => string };
}

const N = SKY_MOMENTS.length - 1;
const A0 = Math.PI * 1.12;
const SPAN = Math.PI * 1.24;

export function SkyDial(props: SkyDialProps) {
  const { rounds, labels, texts } = props;
  const core = useEngineCore(props, rounds.length);
  const { env, k, reduced } = core;
  const area = useMeasure();
  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(3);
  const [solved, setSolved] = useState<string[]>([]);
  const [burst, setBurst] = useState(0);
  const t = useSharedValue(3 / N);
  const testID = props.testID ?? 'sky-dial';
  const current = rounds[Math.min(round, rounds.length - 1)];
  const done = solved.length >= rounds.length;

  const w = area.w;
  const h = w > 0 ? Math.min(area.h - 8, w * 0.82) : 0;
  const cx = w / 2;
  const cy = h * 0.74;
  const R = Math.min(w * 0.42, h * 0.62);

  const moveTo = (i: number) => {
    setIndex(i);
    t.set(reduced ? i / N : withSpring(i / N, { damping: 15, stiffness: 140 }));
    core.touch();
  };

  const check = (i: number) => {
    if (core.finishedRef.current || done || solved.includes(current.id)) return;
    const target = SKY_MOMENTS.indexOf(current.moment);
    if (i !== target) {
      core.wrong(current.id, i > target ? texts.earlier : texts.later);
      return;
    }
    const nextSolved = [...solved, current.id];
    setSolved(nextSolved);
    setBurst((b) => b + 1);
    core.progress(nextSolved.length);
    core.right({ caption: current.caption ? env.text(current.caption) : undefined, tone: current.caption ? 'fact' : 'right' });
    if (nextSolved.length >= rounds.length) core.finish(1100);
    else setTimeout(() => setRound((r) => Math.max(r, nextSolved.length)), reduced ? 300 : 900);
  };

  useKitProbe({
    engine: 'SkyDial',
    testID,
    step: () => {
      if (done) return false;
      if (solved.includes(current.id)) {
        setRound(solved.length);
        return true;
      }
      const target = SKY_MOMENTS.indexOf(current.moment);
      setIndex(target);
      t.set(target / N);
      check(target);
      return true;
    },
    mistake: () => {
      if (done || solved.includes(current.id)) return false;
      const target = SKY_MOMENTS.indexOf(current.moment);
      check(target === 0 ? 1 : target - 1);
      return true;
    },
    done: () => done,
  });

  const geo = { cx, cy, R };
  const pan = Gesture.Pan()
    .minDistance(2)
    .onUpdate((e) => {
      'worklet';
      let a = Math.atan2(geo.cy - e.y, e.x - geo.cx);
      if (a < -Math.PI / 2) a += Math.PI * 2;
      const v = Math.max(0, Math.min(1, (A0 - a) / SPAN));
      t.set(v);
    })
    .onEnd(() => {
      'worklet';
      const i = Math.round(t.value * N);
      t.set(withSpring(i / N, { damping: 15, stiffness: 160 }));
      runOnJS(setIndex)(i);
    });

  const bodyStyle = useAnimatedStyle(() => {
    const a = A0 - t.value * SPAN;
    return { transform: [{ translateX: geo.cx + Math.cos(a) * geo.R - 26 }, { translateY: geo.cy - Math.sin(a) * geo.R - 26 }] };
  });
  const sunStyle = useAnimatedStyle(() => ({ opacity: Math.max(0, Math.min(1, (Math.min(t.value, 1 - t.value) - 0.07) * 14)) }));
  const moonStyle = useAnimatedStyle(() => ({ opacity: 1 - Math.max(0, Math.min(1, (Math.min(t.value, 1 - t.value) - 0.07) * 14)) }));

  const ticks = useMemo(
    () =>
      SKY_MOMENTS.map((m, i) => {
        const a = A0 - (i / N) * SPAN;
        return { m, i, x: cx + Math.cos(a) * R, y: cy - Math.sin(a) * R };
      }),
    [cx, cy, R],
  );
  const arcPath = useMemo(() => {
    const pts = Array.from({ length: 41 }, (_, j) => {
      const a = A0 - (j / 40) * SPAN;
      return `${j ? 'L' : 'M'}${(cx + Math.cos(a) * R).toFixed(1)} ${(cy - Math.sin(a) * R).toFixed(1)}`;
    });
    return pts.join('');
  }, [cx, cy, R]);
  const targetIndex = SKY_MOMENTS.indexOf(current.moment);

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      {rounds.length > 1 ? <ProgressDots total={rounds.length} done={solved.length} /> : null}
      <View style={[styles.card, { backgroundColor: k.goldSoft, borderColor: k.goldEdge }]} accessibilityLiveRegion="polite">
        <AppText variant="bodyBold" color={k.text} align="center">
          {env.text(current.prompt)}
        </AppText>
      </View>
      <View style={styles.area} onLayout={area.onLayout}>
        {w > 0 && h > 0 ? (
          <GestureDetector gesture={pan}>
            <View style={[styles.sky, { width: w, height: h, borderColor: k.boardBorder }]} collapsable={false}>
              {SKY_MOMENTS.map((m, i) => (
                <SkyLayer key={m} moment={m} i={i} t={t} w={w} h={h} />
              ))}
              <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
                <Path d={arcPath} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={3} strokeDasharray="3 9" strokeLinecap="round" fill="none" />
              </Svg>
              <View style={[styles.skyline, { top: cy - w * 0.16 }]} pointerEvents="none">
                <Art name="ramadan.mosque-skyline" size={w} />
              </View>
              {ticks.map(({ m, i, x, y }) => (
                <View key={m} style={[styles.tick, { left: x - 24, top: y - 24 }]}>
                  {core.hintsOn && i === targetIndex && !done ? <Glow active radius={24} spread={2} /> : null}
                  <Pressable
                    onPress={() => moveTo(i)}
                    accessibilityRole="button"
                    accessibilityLabel={texts.moment(env.text(labels[m]))}
                    accessibilityState={{ selected: index === i }}
                    testID={`sky-${m}`}
                    style={styles.tickPress}
                  >
                    <View style={[styles.tickDot, { backgroundColor: index === i ? k.gold : '#FFFFFF', borderColor: k.goldEdge }]} />
                  </Pressable>
                  {props.showLabels ? (
                    <View style={[styles.tickLabel, { backgroundColor: k.tileFace, borderColor: k.tileBorder }, y > cy ? { top: -18 } : { top: 40 }]} pointerEvents="none">
                      <AppText variant="tiny" color={k.text} numberOfLines={1}>
                        {env.text(labels[m])}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              ))}
              <Animated.View style={[styles.body, bodyStyle]} pointerEvents="none">
                <Animated.View style={[StyleSheet.absoluteFill, sunStyle]}>
                  <Svg width={52} height={52} viewBox="0 0 52 52">
                    {Array.from({ length: 10 }, (_, j) => {
                      const a = (j / 10) * Math.PI * 2;
                      return <Path key={j} d={`M${26 + Math.cos(a) * 17} ${26 + Math.sin(a) * 17}L${26 + Math.cos(a + 0.16) * 25} ${26 + Math.sin(a + 0.16) * 25}L${26 + Math.cos(a - 0.16) * 25} ${26 + Math.sin(a - 0.16) * 25}Z`} fill="#F7D774" />;
                    })}
                    <Circle cx={26} cy={26} r={15} fill="#F2B544" />
                    <Circle cx={22} cy={22} r={6} fill="#FFE9A8" opacity={0.7} />
                  </Svg>
                </Animated.View>
                <Animated.View style={[StyleSheet.absoluteFill, moonStyle]}>
                  <Svg width={52} height={52} viewBox="0 0 52 52">
                    <Circle cx={26} cy={26} r={22} fill="#FFE9A8" opacity={0.18} />
                    <Path d={crescentPath(24, 27, 17, 8, -5, 14)} fill="#F7D774" />
                    <Path d={sparklePath(40, 12, 5)} fill="#FFE9A8" />
                  </Svg>
                </Animated.View>
                <Burst trigger={burst} distance={44} />
              </Animated.View>
            </View>
          </GestureDetector>
        ) : null}
      </View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      <ActionButton label={texts.here} onPress={() => check(index)} disabled={done} icon="sun" testID="sky-here" />
    </View>
  );
}

function SkyLayer({ moment, i, t, w, h }: { moment: SkyMoment; i: number; t: SharedValue<number>; w: number; h: number }) {
  const style = useAnimatedStyle(() => ({ opacity: Math.max(0, 1 - Math.abs(t.value * N - i)) }));
  const [top, mid, bottom] = SKY[moment];
  const night = moment === 'night' || moment === 'late-night';
  const id = `skydial-${moment}`;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width={w} height={h}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={top} />
            <Stop offset="0.6" stopColor={mid} />
            <Stop offset="1" stopColor={bottom} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={w} height={h} fill={`url(#${id})`} />
        {night || moment === 'dawn'
          ? STAR_FIELD.slice(0, moment === 'dawn' ? 10 : undefined).map(([x, y, r], j) => <Circle key={j} cx={x * w} cy={y * h * 0.8} r={r} fill="#FFFFFF" opacity={j % 3 ? 0.55 : 0.9} />)
          : null}
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  card: { borderRadius: radius.md, borderWidth: 1.5, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 48, justifyContent: 'center' },
  area: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 220 },
  sky: { borderRadius: radius.lg, borderWidth: 2, overflow: 'hidden' },
  skyline: { position: 'absolute', left: 0, right: 0 },
  tick: { position: 'absolute', width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  tickPress: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  tickDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  tickLabel: { position: 'absolute', borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 1, maxWidth: 96, alignSelf: 'center' },
  body: { position: 'absolute', left: 0, top: 0, width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
});
