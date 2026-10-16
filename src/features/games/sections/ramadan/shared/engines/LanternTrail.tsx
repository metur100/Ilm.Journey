import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Art } from '@/core/art';
import { smoothOpen } from '@/core/art/kit';
import { AppText } from '@/core/components/ui/AppText';
import { Burst, ChallengeClock, type EngineProps, Glow, HintPointer, InlineCaption, type KitPoint, type KitText, useEngineCore, useKitProbe, useMeasure } from '@/core/games/kit';
import { fonts, radius, spacing } from '@/core/theme';

/*
 * LanternTrail – a custom Ramadan engine: trace a line with the finger from lantern to lantern, one day after another,
 * and each lantern lights up with the good deed of that day. Tapping the next lantern works too (accessible path);
 * tapping a lantern out of turn is a gentle mistake. Layout `path` winds up the hill; `scatter` hides the order.
 */

export interface TrailLantern {
  id: string;
  day: number;
  /** The good deed of the day (inline caption when lit). */
  deed: KitText;
}

export interface LanternTrailProps extends EngineProps {
  lanterns: TrailLantern[];
  layout?: 'path' | 'scatter';
  /** Dashed guide between the lanterns (default true). */
  showRoute?: boolean;
  /** Background art (default `ramadan.lantern-night`). */
  map?: string;
  texts: { lit: (day: number, deed: string) => string; lantern: (day: number) => string };
}

const LW = 30;
const LH = 47;

/** Positions (fractions) of n lanterns: a winding path up the hill, or a calm scatter over the night. */
export function trailPoints(n: number, layout: 'path' | 'scatter'): KitPoint[] {
  const cols = 5;
  const rows = Math.ceil(n / cols);
  if (layout === 'scatter') {
    return Array.from({ length: n }, (_, i) => {
      const slot = (i * 7 + 3) % n;
      const col = slot % cols;
      const row = Math.floor(slot / cols);
      return { x: 0.1 + col * 0.2 + (((i * 31) % 7) - 3) * 0.006, y: 0.2 + (row / Math.max(1, rows - 1)) * 0.62 + (((i * 17) % 5) - 2) * 0.012 };
    });
  }
  return Array.from({ length: n }, (_, i) => {
    const row = Math.floor(i / cols);
    const k = i % cols;
    const col = row % 2 === 0 ? k : cols - 1 - k;
    return { x: 0.1 + col * 0.2, y: 0.84 - (row / Math.max(1, rows - 1)) * 0.56 - Math.sin((col / (cols - 1)) * Math.PI) * 0.05 };
  });
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function LanternTrail(props: LanternTrailProps) {
  const { lanterns, texts } = props;
  const core = useEngineCore(props, lanterns.length);
  const { env, k } = core;
  const area = useMeasure();
  const [lit, setLit] = useState(0);
  const testID = props.testID ?? 'lantern-trail';
  const done = lit >= lanterns.length;
  const layout = props.layout ?? 'path';
  const map = props.map ?? 'ramadan.lantern-night';

  const w = area.w > 0 ? Math.min(area.w, area.h * (4 / 3)) : 0;
  const h = (w * 3) / 4;
  const rel = useMemo(() => trailPoints(lanterns.length, layout), [lanterns.length, layout]);
  const pts = rel.map((p) => [p.x * w, p.y * h] as [number, number]);
  const tol = Math.max(26, Math.min(w, h) * 0.075);

  const light = (index: number) => {
    if (core.finishedRef.current || index !== lit) return;
    const next = index + 1;
    setLit(next);
    core.progress(next);
    const l = lanterns[index];
    core.right({ caption: texts.lit(l.day, env.text(l.deed)), tone: 'fact' });
    if (next >= lanterns.length) core.finish(1000);
  };

  const tap = (index: number) => {
    if (index < lit) return;
    if (index !== lit) {
      core.wrong(lanterns[index].id);
      return;
    }
    light(index);
  };

  useKitProbe({
    engine: 'LanternTrail',
    testID,
    step: () => {
      if (done) return false;
      light(lit);
      return true;
    },
    mistake: () => {
      if (done || lit + 1 >= lanterns.length) return false;
      tap(lit + 1);
      return true;
    },
    done: () => done,
  });

  const trail = useSharedValue('');
  const trailOpacity = useSharedValue(0);
  const nextIndex = useSharedValue(0);
  useEffect(() => {
    nextIndex.set(lit);
  }, [lit, nextIndex]);
  const geo = { pts, tol, n: lanterns.length };

  const pan = Gesture.Pan()
    .minDistance(2)
    .onStart((e) => {
      'worklet';
      trailOpacity.set(1);
      const i = nextIndex.value;
      const from = i > 0 ? geo.pts[i - 1] : null;
      trail.set(from && Math.hypot(e.x - from[0], e.y - from[1]) < geo.tol * 2 ? `M${from[0]} ${from[1]}L${e.x} ${e.y}` : `M${e.x} ${e.y}`);
    })
    .onUpdate((e) => {
      'worklet';
      const i = nextIndex.value;
      if (i >= geo.n) return;
      if (trail.value.length < 6000) trail.set(`${trail.value}L${Math.round(e.x)} ${Math.round(e.y)}`);
      const target = geo.pts[i];
      if (Math.hypot(e.x - target[0], e.y - target[1]) < geo.tol) {
        nextIndex.set(i + 1);
        trail.set(`M${target[0]} ${target[1]}`);
        runOnJS(light)(i);
      }
    })
    .onFinalize(() => {
      'worklet';
      trailOpacity.set(withTiming(0, { duration: 350 }));
    });
  const trailProps = useAnimatedProps(() => ({ d: trail.value || 'M0 0', strokeOpacity: trailOpacity.value }));

  const route = pts.length > 1 && w > 0 ? smoothOpen(pts, 0.5) : '';
  const walked = pts.slice(0, lit);
  const walkedD = walked.length > 1 ? smoothOpen(walked, 0.5) : '';
  const showRoute = props.showRoute !== false;

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.area} onLayout={area.onLayout}>
        {w > 0 ? (
          <GestureDetector gesture={pan}>
            <View style={[styles.map, { width: w, height: h, borderColor: k.boardBorder }]} collapsable={false}>
              <Art name={map} size={w} height={h} fit="cover" />
              <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
                {showRoute && route ? <Path d={route} stroke="#FFE9A8" strokeOpacity={0.55} strokeWidth={5} strokeDasharray="2 10" strokeLinecap="round" fill="none" /> : null}
                {walkedD ? <Path d={walkedD} stroke="#F2B544" strokeOpacity={0.9} strokeWidth={5} strokeLinecap="round" fill="none" /> : null}
                <AnimatedPath animatedProps={trailProps} stroke="#F7D774" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
              {lanterns.map((l, i) => {
                const isLit = i < lit;
                const isNext = i === lit;
                return (
                  <View key={l.id} style={[styles.lantern, { left: pts[i][0] - 24, top: pts[i][1] - LH / 2 - 6 }]}>
                    {isNext && core.hintsOn ? <Glow active radius={24} spread={2} /> : null}
                    <Pressable
                      onPress={() => tap(i)}
                      accessibilityRole="button"
                      accessibilityLabel={texts.lantern(l.day)}
                      accessibilityState={{ selected: isLit }}
                      testID={`lantern-${l.id}`}
                      style={styles.press}
                    >
                      <Art name={isLit ? 'ramadan.lantern-lit' : 'ramadan.lantern-unlit'} size={LW} />
                      <View style={[styles.day, { backgroundColor: isLit ? k.gold : k.tileFace, borderColor: isLit ? k.goldEdge : k.tileBorder }]}>
                        <AppText variant="tiny" color={isLit ? k.onGold : k.text} style={{ fontFamily: fonts.heavy }}>
                          {String(l.day)}
                        </AppText>
                      </View>
                    </Pressable>
                    {isLit ? <Burst trigger={1} distance={30} size={10} /> : null}
                  </View>
                );
              })}
              {core.hintsOn && core.idle && !done ? (
                <HintPointer from={{ x: lit > 0 ? pts[lit - 1][0] : pts[lit][0], y: lit > 0 ? pts[lit - 1][1] : pts[lit][1] + 30 }} to={{ x: pts[lit][0], y: pts[lit][1] }} />
              ) : null}
            </View>
          </GestureDetector>
        ) : null}
      </View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  area: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 220 },
  map: { borderRadius: radius.lg, borderWidth: 2, overflow: 'hidden' },
  lantern: { position: 'absolute', width: 48, height: LH + 18, alignItems: 'center' },
  press: { width: 48, minHeight: 48, alignItems: 'center' },
  day: { marginTop: -4, minWidth: 22, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 4, alignItems: 'center' },
});
