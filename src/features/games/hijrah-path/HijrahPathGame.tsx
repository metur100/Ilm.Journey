import { useEffect, useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { Art } from '@/core/art';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import type { GameApi } from '@/core/games';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { CheckpointCard } from './CheckpointCard';
import { CHECKPOINTS } from './content';
import { OrderBoard } from './OrderBoard';
import {
  CHECKPOINT_ARCS,
  CHECKPOINT_POINTS,
  HIJRAH_ROUTE,
  hijrahResult,
  INITIAL_TRACE,
  jumpToNext,
  pointAt,
  routeUntil,
  toPath,
  type TraceState,
  traceStep,
} from './logic';

export interface HijrahConfig {
  /** Level 1: the approximate route is drawn as a dotted, glowing corridor. */
  showRoute: boolean;
  /** Path tolerance in map units (viewBox 300 × 400). */
  tolerance: number;
  /** Level 3: order the event cards after tracing. */
  ordering: boolean;
  /** Show the full Seerah blocks at each stop (levels 1–2) or only title and date (level 3). */
  fullCards: boolean;
}

/** The part of `scene.map-hijaz` shown (map units): Makkah in the south to Madinah in the north, with the coast. */
const CROP = { x: 70, y: 50, w: 180, h: 320 };
const MAX_JUMP = 30;
const TRAVELLER = 38;

const useStyles = makeStyles((c) => ({
  root: { flex: 1, gap: spacing.sm },
  top: { minHeight: 52, justifyContent: 'center', gap: 2 },
  stage: { flex: 1 },
  map: { alignSelf: 'center', borderRadius: radius.lg, overflow: 'hidden', backgroundColor: c.surfaceAlt },
  chip: { position: 'absolute', left: spacing.sm, top: spacing.sm, backgroundColor: c.surface, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1, borderColor: c.goldBorder },
  north: { position: 'absolute', right: spacing.sm, top: spacing.sm, width: 30, height: 30, borderRadius: 15, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.border },
  traveller: { position: 'absolute', width: TRAVELLER, height: TRAVELLER, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: TRAVELLER, height: TRAVELLER, borderRadius: TRAVELLER / 2, borderWidth: 3, borderColor: c.gold },
  pulse: { position: 'absolute', width: 34, height: 34, borderRadius: 17, borderWidth: 3, borderColor: c.primary },
  overlay: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 48 },
  flex: { flex: 1 },
}));

/**
 * Hijrah Path: trace the Hijrah on the Hijaz map with a finger (Makkah → Cave of Thawr → along the approximate route →
 * Quba → Madinah). Checkpoints light up in order and reveal Seerah cards with their labels and sources; level 3 then
 * orders the cards on a timeline. The Prophet ﷺ and his companions are never drawn – a camel marks the journey.
 */
export function HijrahPathGame({ gameId, level, config, onComplete, playSound, haptic, reducedMotion, t, l }: GameApi<HijrahConfig>) {
  const { c } = useTheme();
  const styles = useStyles();
  const [stage, setStage] = useState<{ w: number; h: number } | null>(null);
  const [trace, setTrace] = useState<TraceState>(INITIAL_TRACE);
  const [openCard, setOpenCard] = useState<number | null>(null);
  const [phase, setPhase] = useState<'trace' | 'order'>('trace');
  const shown = useRef(0);
  const finished = useRef(false);
  const opts = useMemo(() => ({ tolerance: config.tolerance, maxJump: MAX_JUMP }), [config.tolerance]);
  const total = CHECKPOINTS.length;
  const allReached = trace.reached >= total;

  // Reaching a checkpoint opens its card (one at a time – close checkpoints are revealed one after another).
  useEffect(() => {
    if (trace.reached > shown.current) {
      shown.current = trace.reached;
      setOpenCard(trace.reached - 1);
      playSound(trace.reached === total ? 'reward' : 'success');
      haptic('success');
    }
  }, [trace.reached, total, playSound, haptic]);

  // Leaving the path: a gentle tick, the corridor lights up (no sound, nothing lost).
  const lastOff = useRef(0);
  useEffect(() => {
    if (trace.offEpisodes > lastOff.current) {
      lastOff.current = trace.offEpisodes;
      haptic('selection');
    }
  }, [trace.offEpisodes, haptic]);

  const finish = (ordering?: { mistakes: number; cardsWithMistakes: number }) => {
    if (finished.current) return;
    finished.current = true;
    onComplete(hijrahResult({ trace, ordering }));
  };

  const closeCard = () => {
    setOpenCard(null);
    haptic('tap');
    if (trace.reached >= total) {
      if (config.ordering) setPhase('order');
      else finish();
    }
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!stage || Math.abs(stage.w - width) > 1 || Math.abs(stage.h - height) > 1) setStage({ w: width, h: height });
  };

  const scale = stage ? Math.min(stage.w / CROP.w, stage.h / CROP.h) : 1;
  const mapW = CROP.w * scale;
  const mapH = CROP.h * scale;
  const toScreen = (p: { x: number; y: number }) => ({ x: (p.x - CROP.x) * scale, y: (p.y - CROP.y) * scale });

  const sample = (x: number, y: number) => {
    const p = { x: CROP.x + x / scale, y: CROP.y + y / scale };
    setTrace((prev) => traceStep(HIJRAH_ROUTE, CHECKPOINT_ARCS, prev, p, opts));
  };

  const tracing = phase === 'trace' && openCard === null && !allReached;
  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(tracing)
    .minDistance(0)
    .maxPointers(1)
    .onBegin((e) => sample(e.x, e.y))
    .onUpdate((e) => sample(e.x, e.y));

  const nextStop = () => {
    if (!tracing) return;
    setTrace((prev) => jumpToNext(CHECKPOINT_ARCS, prev));
  };

  // A soft pulse around the next pin (static under reduced motion).
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (reducedMotion) return;
    pulse.value = withRepeat(withTiming(1, { duration: 1100 }), -1, false);
  }, [pulse, reducedMotion]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: 1 - pulse.value, transform: [{ scale: 0.8 + pulse.value * 0.9 }] }));

  if (phase === 'order') {
    return (
      <OrderBoard
        seed={`${gameId}:${level}`}
        reducedMotion={reducedMotion}
        playSound={playSound}
        haptic={haptic}
        t={t}
        l={l}
        onDone={(ordering) => finish(ordering)}
      />
    );
  }

  const next = CHECKPOINTS[Math.min(trace.reached, total - 1)];
  const traveller = toScreen(pointAt(HIJRAH_ROUTE, trace.progress));
  const travelled = trace.reached > 0 ? toPath(routeUntil(HIJRAH_ROUTE, trace.progress)) : '';
  const routePath = toPath(HIJRAH_ROUTE.points);
  const nextHead = (() => {
    const i = Math.min(trace.reached, total - 1);
    const p = CHECKPOINT_POINTS[i];
    return toScreen({ x: p.x + CHECKPOINTS[i].pinOffset.dx, y: p.y + CHECKPOINTS[i].pinOffset.dy });
  })();
  const showCorridor = config.showRoute || trace.off;
  const instruction = allReached ? t('play.arrived') : trace.reached === 0 ? t('play.start') : t('play.next', { place: l(next.place) });
  const status = trace.off ? t('play.off') : trace.ahead ? t('play.ahead') : t('play.stop', { number: Math.min(trace.reached + 1, total), total });

  return (
    <View style={styles.root}>
      <View style={styles.top} accessibilityLiveRegion="polite">
        <AppText variant="heading">{instruction}</AppText>
      </View>

      <View style={styles.stage} onLayout={onLayout}>
        {stage ? (
          <GestureDetector gesture={pan}>
            <View style={[styles.map, { width: mapW, height: mapH }]} accessible accessibilityRole="image" accessibilityLabel={t('a11y.map')}>
              <View style={{ position: 'absolute', left: -CROP.x * scale, top: -CROP.y * scale }} pointerEvents="none">
                <Art name="scene.map-hijaz" size={300 * scale} />
              </View>
              <Svg width={mapW} height={mapH} viewBox={`${CROP.x} ${CROP.y} ${CROP.w} ${CROP.h}`} style={StyleSheet.absoluteFill} pointerEvents="none">
                <SvgText x={86} y={250} fontSize={8} fontStyle="italic" fill={c.info} opacity={0.8} transform="rotate(-62 86 250)">
                  {t('play.redSea')}
                </SvgText>
                {showCorridor ? (
                  <Path d={routePath} stroke={c.primary} strokeOpacity={config.showRoute ? 0.16 : 0.12} strokeWidth={config.tolerance * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                ) : null}
                {config.showRoute ? <Path d={routePath} stroke={c.primaryText} strokeWidth={1.6} strokeDasharray="3 4" strokeLinecap="round" fill="none" /> : null}
                {travelled ? (
                  <>
                    <Path d={travelled} stroke={c.goldText} strokeWidth={4.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <Path d={travelled} stroke={c.gold} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </>
                ) : null}
                {CHECKPOINTS.map((cp, i) => {
                  const p = CHECKPOINT_POINTS[i];
                  const hx = p.x + cp.pinOffset.dx;
                  const hy = p.y + cp.pinOffset.dy;
                  const reached = i < trace.reached;
                  const isNext = i === trace.reached;
                  const right = hx + 11;
                  return (
                    <G key={cp.id}>
                      {cp.pinOffset.dx !== 0 || cp.pinOffset.dy !== 0 ? <Line x1={p.x} y1={p.y} x2={hx} y2={hy} stroke={c.text} strokeOpacity={0.45} strokeWidth={0.8} /> : null}
                      <Circle cx={p.x} cy={p.y} r={2.2} fill={c.text} />
                      <Circle cx={hx} cy={hy} r={8.5} fill={reached ? c.gold : isNext ? c.primary : c.surface} stroke={reached ? c.goldText : isNext ? c.primaryText : c.border} strokeWidth={1.2} strokeDasharray={cp.approximate ? '2 1.5' : undefined} />
                      <SvgText x={hx} y={hy + 3.2} fontSize={9} fontWeight="bold" textAnchor="middle" fill={reached ? c.onGold : isNext ? c.onPrimary : c.text}>
                        {String(i + 1)}
                      </SvgText>
                      <SvgText x={right > CROP.x + CROP.w - 40 ? hx - 11 : right} y={hy + 3} fontSize={7.5} fontWeight="bold" textAnchor={right > CROP.x + CROP.w - 40 ? 'end' : 'start'} stroke={c.surface} strokeWidth={2.4} fill={c.surface}>
                        {l(cp.place)}
                      </SvgText>
                      <SvgText x={right > CROP.x + CROP.w - 40 ? hx - 11 : right} y={hy + 3} fontSize={7.5} fontWeight="bold" textAnchor={right > CROP.x + CROP.w - 40 ? 'end' : 'start'} fill={c.text}>
                        {l(cp.place)}
                      </SvgText>
                    </G>
                  );
                })}
              </Svg>

              {!allReached ? <Animated.View pointerEvents="none" style={[styles.pulse, { left: nextHead.x - 17, top: nextHead.y - 17 }, reducedMotion ? { opacity: 0.6 } : pulseStyle]} /> : null}

              <View pointerEvents="none" style={[styles.traveller, { left: traveller.x - TRAVELLER / 2, top: traveller.y - TRAVELLER / 2 }]}>
                {trace.off ? <View style={styles.ring} /> : null}
                <Art name="animal.camel" size={TRAVELLER - 6} />
              </View>

              <View style={styles.chip} pointerEvents="none">
                <AppText variant="tiny" color={c.goldText}>
                  {t('play.approxRoute')}
                </AppText>
              </View>
              <View style={styles.north} pointerEvents="none">
                <AppText variant="tiny">{`↑${t('play.north')}`}</AppText>
              </View>
            </View>
          </GestureDetector>
        ) : null}

        {openCard !== null && stage ? (
          <Animated.View style={styles.overlay} entering={reducedMotion ? undefined : FadeInDown.duration(280)}>
            <CheckpointCard
              checkpoint={CHECKPOINTS[openCard]}
              number={openCard + 1}
              full={config.fullCards}
              maxHeight={stage.h * 0.72}
              onContinue={closeCard}
              t={t}
              l={l}
            />
          </Animated.View>
        ) : null}
      </View>

      <View style={styles.bottom}>
        <AppText variant="small" color={trace.off ? c.goldText : c.textMuted} style={styles.flex}>
          {status}
        </AppText>
        <Button label={t('play.nextStop')} variant="secondary" size="md" icon="pin" disabled={!tracing} onPress={nextStop} />
      </View>
    </View>
  );
}
