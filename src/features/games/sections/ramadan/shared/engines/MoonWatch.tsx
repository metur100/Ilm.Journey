import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AppText } from '@/core/components/ui/AppText';
import { Burst, ChallengeClock, type EngineProps, Glow, InlineCaption, type KitText, ProgressDots, useEngineCore, useKitProbe, useMeasure } from '@/core/games/kit';
import { fonts, radius, spacing } from '@/core/theme';

import { ActionButton, RoundButton, STAR_FIELD } from '../ui';

/*
 * MoonWatch – a custom Ramadan engine: slide through the nights of the lunar month and watch the moon change, then
 * stop at the night that is asked for (the new crescent, the full moon …). One round after another. A round may show
 * the shape to find (memory twist) or cover the sky with clouds (complete thirty days – Bukhari 1909).
 */

export const DAYS = 30;

/** SVG path of the lit part of the moon on night `day` (1..30) of the lunar month, waxing on the right. */
export function moonPath(cx: number, cy: number, r: number, day: number): string {
  const p = Math.min(0.985, Math.max(0.02, (day + 0.6) / 30.6));
  const rx = Math.abs(Math.cos(p * 2 * Math.PI)) * r;
  const top = `${cx} ${cy - r}`;
  const bottom = `${cx} ${cy + r}`;
  if (p < 0.5) {
    const sweep = p < 0.25 ? 0 : 1;
    return `M${top}A${r} ${r} 0 0 1 ${bottom}A${rx} ${r} 0 0 ${sweep} ${top}Z`;
  }
  const sweep = p > 0.75 ? 1 : 0;
  return `M${top}A${r} ${r} 0 0 0 ${bottom}A${rx} ${r} 0 0 ${sweep} ${top}Z`;
}

export interface MoonRound {
  id: string;
  prompt: KitText;
  /** Nights that count as right (1..30). */
  days: number[];
  caption?: KitText;
  /** Show the shape to find next to the prompt (no night number given). */
  showShape?: boolean;
  /** Clouds cover the sky from night 29 on – the crescent cannot be seen. */
  clouds?: boolean;
}

export interface MoonWatchProps extends EngineProps {
  rounds: MoonRound[];
  /** Start night of the slider (default 10). */
  start?: number;
  texts: { here: string; night: (n: number) => string; prev: string; next: string; earlier: string; later: string };
}

export function MoonWatch(props: MoonWatchProps) {
  const { rounds, texts } = props;
  const core = useEngineCore(props, rounds.length);
  const { env, k, reduced } = core;
  const area = useMeasure();
  const track = useMeasure();
  const [day, setDay] = useState(props.start ?? 10);
  const [round, setRound] = useState(0);
  const [solved, setSolved] = useState<string[]>([]);
  const [burst, setBurst] = useState(0);
  const testID = props.testID ?? 'moon-watch';
  const current = rounds[Math.min(round, rounds.length - 1)];
  const done = solved.length >= rounds.length;
  const target = current.days[0];

  const pick = (d: number) => {
    setDay(Math.max(1, Math.min(DAYS, d)));
    core.touch();
  };

  const check = (d: number) => {
    if (core.finishedRef.current || done || solved.includes(current.id)) return;
    if (!current.days.includes(d)) {
      core.wrong(current.id, d > target ? texts.earlier : texts.later);
      return;
    }
    const next = [...solved, current.id];
    setSolved(next);
    setBurst((b) => b + 1);
    core.progress(next.length);
    core.right({ caption: current.caption ? env.text(current.caption) : undefined, tone: current.caption ? 'fact' : 'right' });
    if (next.length >= rounds.length) core.finish(1100);
    else setTimeout(() => setRound((r) => Math.max(r, next.length)), reduced ? 300 : 1000);
  };

  useKitProbe({
    engine: 'MoonWatch',
    testID,
    step: () => {
      if (done) return false;
      if (solved.includes(current.id)) {
        setRound(solved.length);
        return true;
      }
      setDay(target);
      check(target);
      return true;
    },
    mistake: () => {
      if (done || solved.includes(current.id)) return false;
      const wrongDay = target > 15 ? 3 : 20;
      setDay(wrongDay);
      check(wrongDay);
      return true;
    },
    done: () => done,
  });

  const tw = track.w;
  const pan = Gesture.Pan()
    .minDistance(1)
    .onUpdate((e) => {
      'worklet';
      if (tw <= 0) return;
      const d = Math.round((e.x / tw) * (DAYS - 1)) + 1;
      runOnJS(setDay)(Math.max(1, Math.min(DAYS, d)));
    });

  const w = area.w;
  const h = w > 0 ? Math.min(area.h, w * 0.7) : 0;
  const r = Math.min(w, h) * 0.2;
  const cx = w * 0.56;
  const cy = h * 0.4;
  const cloudy = !!current.clouds && day >= 29;

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      {rounds.length > 1 ? <ProgressDots total={rounds.length} done={solved.length} /> : null}
      <View style={[styles.card, { backgroundColor: k.goldSoft, borderColor: k.goldEdge }]} accessibilityLiveRegion="polite">
        {current.showShape ? (
          <Svg width={44} height={44} viewBox="0 0 44 44" accessibilityElementsHidden>
            <Circle cx={22} cy={22} r={21} fill="#1E2358" />
            <Circle cx={22} cy={22} r={15} fill="#3B3F7A" />
            <Path d={moonPath(22, 22, 15, target)} fill="#F7D774" />
          </Svg>
        ) : null}
        <AppText variant="bodyBold" color={k.text} style={{ flex: 1 }} align={current.showShape ? 'left' : 'center'}>
          {env.text(current.prompt)}
        </AppText>
      </View>
      <View style={styles.area} onLayout={area.onLayout}>
        {w > 0 && h > 0 ? (
          <View style={[styles.sky, { width: w, height: h, borderColor: k.boardBorder }]} accessible accessibilityLabel={texts.night(day)}>
            <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="moonwatch-sky" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#14173A" />
                  <Stop offset="0.6" stopColor="#3A3480" />
                  <Stop offset="0.9" stopColor="#B7577A" />
                  <Stop offset="1" stopColor="#F28C5B" />
                </LinearGradient>
                <RadialGradient id="moonwatch-glow" cx="0.5" cy="0.5" r="0.5">
                  <Stop offset="0" stopColor="#FFE9A8" stopOpacity={0.45} />
                  <Stop offset="1" stopColor="#FFE9A8" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Rect width={w} height={h} fill="url(#moonwatch-sky)" />
              {STAR_FIELD.map(([x, y, s], i) => (
                <Circle key={i} cx={x * w} cy={y * h * 0.75} r={s} fill="#FFFFFF" opacity={i % 3 ? 0.5 : 0.85} />
              ))}
              <Circle cx={cx} cy={cy} r={r * 1.9} fill="url(#moonwatch-glow)" opacity={Math.min(1, 0.25 + Math.sin(((day + 0.6) / 30.6) * Math.PI))} />
              <Circle cx={cx} cy={cy} r={r} fill="#2C3274" opacity={0.7} />
              <Path d={moonPath(cx, cy, r, day)} fill="#F7D774" />
              <Circle cx={cx + r * 0.3} cy={cy - r * 0.2} r={r * 0.12} fill="#E0B850" opacity={0.35} />
              <Path d={`M0 ${h * 0.86}Q${w * 0.3} ${h * 0.76} ${w * 0.6} ${h * 0.84}T${w} ${h * 0.8}V${h}H0Z`} fill="#2A2750" />
              <Path d={`M0 ${h * 0.94}Q${w * 0.4} ${h * 0.86} ${w} ${h * 0.92}V${h}H0Z`} fill="#1A1E47" />
              {cloudy ? (
                <>
                  <Ellipse cx={cx - r * 0.6} cy={cy + r * 0.2} rx={r * 1.6} ry={r * 0.8} fill="#6B6F99" opacity={0.95} />
                  <Ellipse cx={cx + r * 0.9} cy={cy - r * 0.1} rx={r * 1.4} ry={r * 0.85} fill="#7D81A8" opacity={0.95} />
                  <Ellipse cx={cx} cy={cy - r * 0.6} rx={r * 1.2} ry={r * 0.7} fill="#8A8EB3" opacity={0.95} />
                </>
              ) : null}
            </Svg>
            <View style={[styles.nightBadge, { backgroundColor: k.tileFace, borderColor: k.tileBorder }]}>
              <AppText variant="bodyBold" color={k.text} style={{ fontFamily: fonts.heavy }}>
                {texts.night(day)}
              </AppText>
            </View>
            <View style={{ position: 'absolute', left: cx, top: cy }}>
              <Burst trigger={burst} distance={r * 1.4} />
            </View>
          </View>
        ) : null}
      </View>
      <GestureDetector gesture={pan}>
        <View style={styles.trackRow} onLayout={track.onLayout} collapsable={false}>
          {Array.from({ length: DAYS }, (_, i) => {
            const d = i + 1;
            const on = d === day;
            return (
              <Pressable key={d} onPress={() => pick(d)} accessibilityRole="button" accessibilityLabel={texts.night(d)} testID={`moon-day-${d}`} style={styles.dotHit} hitSlop={{ top: 14, bottom: 14 }}>
                {core.hintsOn && d === target && !done ? <Glow active radius={8} spread={3} /> : null}
                <View style={[styles.dot, { backgroundColor: on ? k.gold : d <= 15 ? k.accentSoft : k.slotFill, borderColor: on ? k.goldEdge : k.slotBorder, transform: [{ scale: on ? 1.5 : 1 }] }]} />
              </Pressable>
            );
          })}
        </View>
      </GestureDetector>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      <View style={styles.controls}>
        <RoundButton icon="minus" label={texts.prev} onPress={() => pick(day - 1)} testID="moon-prev" disabled={day <= 1} />
        <ActionButton label={texts.here} onPress={() => check(day)} disabled={done} icon="moon" testID="moon-here" style={{ flex: 1 }} />
        <RoundButton icon="plus" label={texts.next} onPress={() => pick(day + 1)} testID="moon-next" disabled={day >= DAYS} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.md, borderWidth: 1.5, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 48 },
  area: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 170 },
  sky: { borderRadius: radius.lg, borderWidth: 2, overflow: 'hidden' },
  nightBadge: { position: 'absolute', left: spacing.sm, top: spacing.sm, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: 2 },
  trackRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 32, paddingHorizontal: 2 },
  dotHit: { flex: 1, height: 28, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
