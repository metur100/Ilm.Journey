import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Art, catalogue, hasArt } from '../../../art';
import { smoothOpen } from '../../../art/kit';
import { AppText } from '../../../components/ui/AppText';
import { fonts, radius, spacing } from '../../../theme';
import { ChallengeClock, HintPointer, InlineCaption } from '../board';
import { useEngineCore } from '../engine';
import { Burst, Glow } from '../fx';
import { useMeasure } from '../layout';
import { faceLabel } from '../primitives';
import { useKitProbe } from '../probe';
import type { EngineProps, KitItem, KitPoint, KitText } from '../types';

export interface PathStop extends KitItem {
  /** Position in the map (fractions 0..1). */
  at: KitPoint;
  /** Caption shown when the stop is reached. */
  caption?: KitText;
}

export interface PathTraceProps extends EngineProps {
  /** Background art of the map / scene. */
  map?: string;
  aspect?: number;
  /** Stops in order; the first one is the start. */
  stops: PathStop[];
  /** Reach radius as a fraction of the map's shorter side (default 0.08). */
  tolerance?: number;
  /** Dashed guide along the route (default true; turn off for a harder level). */
  showRoute?: boolean;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
const DOT = 30;

/**
 * PathTrace – trace a route with the finger from stop to stop (journeys, the hijrah, a wudu order on a body map).
 * The trail follows the finger on the UI thread; reaching the next stop lights it and shows its caption. Leaving the
 * route far behind is a gentle mistake. Tapping the stops in order works too.
 */
export function PathTrace(props: PathTraceProps) {
  const { stops } = props;
  const legs = Math.max(1, stops.length - 1);
  const core = useEngineCore(props, legs);
  const { env, k } = core;
  const [reached, setReached] = useState(1); // the start counts as reached
  const area = useMeasure();
  const testID = props.testID ?? 'path-trace';
  const done = reached >= stops.length;
  const label = (s: KitItem) => faceLabel(s, env.text);

  const bgAspect = props.map && catalogue[props.map] ? catalogue[props.map].aspect : 4 / 3;
  const aspect = props.aspect ?? bgAspect;
  const w = area.w > 0 ? Math.min(area.w, area.h * aspect) : 0;
  const h = w / aspect;
  const pts = stops.map((s) => [s.at.x * w, s.at.y * h] as [number, number]);
  const tol = (props.tolerance ?? 0.08) * Math.min(w, h);

  const reach = (index: number) => {
    if (core.finishedRef.current || index !== reached) return;
    const next = index + 1;
    setReached(next);
    core.progress(next - 1);
    const stop = stops[index];
    core.right({ caption: stop.caption ? env.text(stop.caption) : env.kt('path.point', { number: index + 1, label: label(stop) }), tone: stop.caption ? 'fact' : 'right' });
    if (next >= stops.length) core.finish(900);
  };

  const strayed = () => {
    if (core.finishedRef.current) return;
    core.wrong(stops[reached]?.id ?? '', env.kt('fb.tryAgain'));
  };

  const tapStop = (index: number) => {
    if (index < reached) return;
    if (index !== reached) {
      core.wrong(stops[index].id);
      return;
    }
    reach(index);
  };

  // Live trail (UI thread).
  const trail = useSharedValue('');
  const trailOpacity = useSharedValue(0);
  const nextIndex = useSharedValue(1);
  const strayedOnce = useSharedValue(0);
  useEffect(() => {
    nextIndex.set(reached);
  }, [reached, nextIndex]);
  const geo = { pts, tol, n: stops.length };

  const pan = Gesture.Pan()
    .minDistance(2)
    .onStart((e) => {
      'worklet';
      const i = nextIndex.value;
      if (i >= geo.n) return;
      const from = geo.pts[i - 1];
      const d = Math.hypot(e.x - from[0], e.y - from[1]);
      strayedOnce.set(0);
      trailOpacity.set(1);
      trail.set(d < geo.tol * 2.2 ? `M${from[0]} ${from[1]}L${e.x} ${e.y}` : `M${e.x} ${e.y}`);
    })
    .onUpdate((e) => {
      'worklet';
      const i = nextIndex.value;
      if (i >= geo.n) return;
      if (trail.value.length < 6000) trail.set(`${trail.value}L${Math.round(e.x)} ${Math.round(e.y)}`);
      const target = geo.pts[i];
      if (Math.hypot(e.x - target[0], e.y - target[1]) < geo.tol) {
        nextIndex.set(i + 1);
        runOnJS(reach)(i);
        trail.set(`M${target[0]} ${target[1]}`);
        return;
      }
      // Distance from the current leg (segment from the last reached stop to the next one).
      const a = geo.pts[i - 1];
      const dx = target[0] - a[0];
      const dy = target[1] - a[1];
      const len2 = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((e.x - a[0]) * dx + (e.y - a[1]) * dy) / len2));
      const off = Math.hypot(e.x - (a[0] + t * dx), e.y - (a[1] + t * dy));
      if (off > geo.tol * 3.2 && !strayedOnce.value) {
        strayedOnce.set(1);
        runOnJS(strayed)();
      }
    })
    .onFinalize(() => {
      'worklet';
      trailOpacity.set(withTiming(0, { duration: 350 }));
    });

  const trailProps = useAnimatedProps(() => ({ d: trail.value || 'M0 0', strokeOpacity: trailOpacity.value }));

  useKitProbe({
    engine: 'PathTrace',
    testID,
    step: () => {
      if (done) return false;
      reach(reached);
      return true;
    },
    mistake: () => {
      if (done) return false;
      strayed();
      return true;
    },
    done: () => done,
  });

  const route = pts.length > 1 ? smoothOpen(pts, 0.5) : '';
  const walked = pts.slice(0, reached);
  const walkedD = walked.length > 1 ? smoothOpen(walked, 0.5) : '';

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.area} onLayout={area.onLayout}>
        {w > 0 ? (
          <GestureDetector gesture={pan}>
            <View style={[styles.map, { width: w, height: h, borderColor: k.boardBorder }]} collapsable={false} accessibilityLabel={env.kt('path.board')}>
              {props.map && hasArt(props.map) ? <Art name={props.map} size={w} height={h} fit="cover" /> : <LinearGradient colors={[k.accentSoft, k.board[1]]} style={StyleSheet.absoluteFill} />}
              <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
                {props.showRoute !== false ? <Path d={route} stroke={k.tileFace} strokeOpacity={0.85} strokeWidth={8} strokeDasharray="2 12" strokeLinecap="round" fill="none" /> : null}
                {walkedD ? <Path d={walkedD} stroke={k.gold} strokeWidth={7} strokeLinecap="round" fill="none" /> : null}
                <AnimatedPath animatedProps={trailProps} stroke={k.accent} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
              {stops.map((s, i) => {
                const isReached = i < reached;
                const isNext = i === reached;
                return (
                  <View key={s.id} style={[styles.stop, { left: pts[i][0] - DOT / 2, top: pts[i][1] - DOT / 2 }]}>
                    {isNext && core.hintsOn ? <Glow active radius={DOT / 2} spread={5} /> : null}
                    <Pressable
                      onPress={() => tapStop(i)}
                      accessibilityRole="button"
                      accessibilityLabel={i === 0 ? env.kt('path.start', { label: label(s) }) : env.kt('path.point', { number: i + 1, label: label(s) })}
                      accessibilityState={{ selected: isReached }}
                      testID={`stop-${s.id}`}
                      hitSlop={10}
                      style={[styles.dot, { backgroundColor: isReached ? k.gold : k.tileFace, borderColor: isReached ? k.goldEdge : k.accent }]}
                    >
                      <AppText variant="tiny" color={isReached ? k.onGold : k.accentText} style={{ fontFamily: fonts.heavy }}>
                        {String(i + 1)}
                      </AppText>
                    </Pressable>
                    {isReached && i > 0 ? <Burst trigger={1} distance={32} size={10} /> : null}
                    <View pointerEvents="none" style={[styles.chip, { backgroundColor: k.tileFace, borderColor: isReached ? k.gold : k.tileBorder }, pts[i][1] > h - 50 ? { bottom: DOT + 2 } : { top: DOT + 2 }]}>
                      {s.art && hasArt(s.art) ? <Art name={s.art} size={18} /> : null}
                      <AppText variant="tiny" color={k.text} numberOfLines={1}>
                        {label(s)}
                      </AppText>
                    </View>
                  </View>
                );
              })}
              {core.hintsOn && core.idle && !done ? <HintPointer from={{ x: pts[reached - 1][0], y: pts[reached - 1][1] }} to={{ x: pts[reached][0], y: pts[reached][1] }} /> : null}
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
  area: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  map: { borderRadius: radius.lg, borderWidth: 2, overflow: 'hidden' },
  stop: { position: 'absolute', width: DOT, height: DOT, alignItems: 'center' },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  chip: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 1, maxWidth: 120 },
});
