import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, Easing, runOnJS, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Art, hasArt } from '../../../art';
import { AppText } from '../../../components/ui/AppText';
import { Icon } from '../../../components/ui/Icon';
import { fonts, radius, spacing } from '../../../theme';
import { ChallengeClock, InlineCaption, ProgressDots } from '../board';
import { useEngineCore } from '../engine';
import { Burst, CheckBadge, useShake } from '../fx';
import { faceLabel } from '../primitives';
import { useKitProbe } from '../probe';
import type { EngineProps, KitFace } from '../types';

export interface PourVessel extends KitFace {
  id: string;
  /** Fill level to reach (0..1 of the vessel). */
  target: number;
  /** Accepted distance from the target (default 0.06). */
  tolerance?: number;
}

export interface PourFillProps extends EngineProps {
  vessels: PourVessel[];
  liquid?: 'water' | 'milk' | 'grain';
  /** Fill speed while holding, in vessel fractions per second (default 0.28). */
  rate?: number;
}

const TAP_STEP = 0.05;
const VESSEL_W = 150;
const VESSEL_H = 210;

/** Pure: where a pour ended relative to the target band. */
export function pourResult(level: number, target: number, tolerance = 0.06): 'under' | 'right' | 'over' {
  if (level > target + tolerance) return 'over';
  if (level < target - tolerance) return 'under';
  return 'right';
}

/**
 * PourFill – hold to pour (water, milk, grain) and let go at the line. One vessel after another; in the band → right;
 * too much → it overflows gently and empties for another try. A short tap pours a little (the accessible path).
 */
export function PourFill(props: PourFillProps) {
  const { vessels } = props;
  const core = useEngineCore(props, vessels.length);
  const { env, k, reduced } = core;
  const [index, setIndex] = useState(0);
  const [filled, setFilled] = useState(0);
  const [pouring, setPouring] = useState(false);
  const [shown, setShown] = useState(0);
  const [right, setRight] = useState(false);
  const level = useSharedValue(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holding = useRef(false);
  const { style: shakeStyle, shake } = useShake(reduced);
  const testID = props.testID ?? 'pour-fill';
  const vessel = vessels[Math.min(index, vessels.length - 1)];
  const tol = vessel.tolerance ?? 0.06;
  const rate = props.rate ?? 0.28;
  const allDone = filled >= vessels.length;
  const liquid = props.liquid === 'milk' ? k.tileFace : props.liquid === 'grain' ? k.gold : k.water;
  const liquidTop = props.liquid === 'milk' ? k.tileBorder : props.liquid === 'grain' ? k.goldEdge : k.waterSoft;

  useEffect(() => {
    level.set(0);
    setShown(0);
    setRight(false);
  }, [index, level]);

  const evaluate = (value: number) => {
    setShown(value);
    if (core.finishedRef.current || right) return;
    const r = pourResult(value, vessel.target, tol);
    if (r === 'under') {
      core.setCaption({ text: env.kt('pour.under'), tone: 'info' });
      return;
    }
    if (r === 'over') {
      core.wrong(vessel.id, env.kt('pour.over'));
      shake();
      level.set(withTiming(0, { duration: reduced ? 0 : 900, easing: Easing.out(Easing.quad) }));
      setShown(0);
      return;
    }
    setRight(true);
    const count = filled + 1;
    setFilled(count);
    core.progress(count);
    core.right();
    if (count >= vessels.length) core.finish(1000);
    else setTimeout(() => setIndex((i) => i + 1), reduced ? 500 : 1200);
  };

  const startPour = () => {
    holding.current = true;
    setPouring(true);
    const remaining = 1 - level.value;
    level.set(withTiming(1, { duration: Math.max(1, (remaining / rate) * 1000), easing: Easing.linear }));
  };

  const pressIn = () => {
    if (right || allDone) return;
    holdTimer.current = setTimeout(startPour, 160);
  };
  const pressOut = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    if (right || allDone) return;
    if (holding.current) {
      holding.current = false;
      setPouring(false);
      cancelAnimation(level);
      // Let the cancelled value settle, then evaluate it.
      setTimeout(() => evaluate(level.value), 30);
      return;
    }
    const next = Math.min(1, level.value + TAP_STEP);
    level.set(reduced ? next : withTiming(next, { duration: 260 }, (f) => f && runOnJS(evaluate)(next)));
    if (reduced) evaluate(next);
    core.touch();
  };

  useKitProbe({
    engine: 'PourFill',
    testID,
    step: () => {
      if (allDone) return false;
      if (right) {
        setIndex((i) => i + 1);
        return true;
      }
      level.set(vessel.target);
      evaluate(vessel.target);
      return true;
    },
    mistake: () => {
      if (allDone || right) return false;
      level.set(1);
      evaluate(1);
      return true;
    },
    done: () => allDone,
  });

  const fillStyle = useAnimatedStyle(() => ({ height: `${Math.max(0, Math.min(1, level.value)) * 100}%` }));
  const tilt = useSharedValue(0);
  useEffect(() => {
    tilt.set(withTiming(pouring ? 1 : 0, { duration: reduced ? 0 : 220 }));
  }, [pouring, reduced, tilt]);
  const jugStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${tilt.value * -38}deg` }, { translateX: tilt.value * -8 }] }));
  const wave = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    wave.set(withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true));
    return () => cancelAnimation(wave);
  }, [reduced, wave]);
  const waveStyle = useAnimatedStyle(() => ({ transform: [{ translateX: (wave.value - 0.5) * 16 }] }));

  const bandTop = (1 - Math.min(1, vessel.target + tol)) * VESSEL_H;
  const bandH = (Math.min(1, vessel.target + tol) - Math.max(0, vessel.target - tol)) * VESSEL_H;
  const label = faceLabel(vessel, env.text);

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      {vessels.length > 1 ? <ProgressDots total={vessels.length} done={filled} /> : null}
      <View style={styles.stage}>
        <Animated.View style={[styles.jug, jugStyle]} pointerEvents="none">
          <Art name="kit.jar" size={64} />
        </Animated.View>
        {pouring ? <View style={[styles.stream, { backgroundColor: liquid, borderColor: liquidTop }]} pointerEvents="none" /> : null}
        <Animated.View style={shakeStyle}>
          <View style={[styles.vessel, { borderColor: right ? k.right : k.tileBorder, backgroundColor: k.slotFill }]} accessible accessibilityLabel={env.kt('pour.vessel', { label, percent: Math.round(shown * 100) })} testID={`vessel-${vessel.id}`}>
            <Animated.View style={[styles.liquid, { backgroundColor: liquid }, fillStyle]}>
              <Animated.View style={[styles.surface, { backgroundColor: liquidTop }, waveStyle]} />
            </Animated.View>
            <View style={[styles.band, { top: bandTop, height: Math.max(6, bandH), borderColor: k.gold, backgroundColor: k.goldSoft }]} pointerEvents="none" />
            <Svg width={22} height={22} style={[styles.bandArrow, { top: (1 - vessel.target) * VESSEL_H - 11 }]} pointerEvents="none">
              <Path d="M2 2L20 11L2 20Z" fill={k.gold} />
            </Svg>
            <CheckBadge show={right} size={30} style={{ top: 8, right: 8 }} />
            {right ? <Burst trigger={filled} distance={90} size={16} /> : null}
          </View>
        </Animated.View>
        <View style={styles.vesselLabel}>
          {vessel.art && hasArt(vessel.art) ? <Art name={vessel.art} size={26} /> : null}
          <AppText variant="bodyBold" color={k.text}>
            {label}
          </AppText>
        </View>
      </View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={right || allDone}
        accessibilityRole="button"
        accessibilityLabel={env.kt('pour.more')}
        accessibilityHint={env.kt('pour.hold')}
        testID={`pour-${vessel.id}`}
        style={({ pressed }) => [styles.pourButton, { backgroundColor: pressed || pouring ? k.goldEdge : k.gold, opacity: right || allDone ? 0.5 : 1 }]}
      >
        <Icon name="sparkle" size={20} color={k.onGold} />
        <AppText variant="bodyBold" color={k.onGold} style={{ fontFamily: fonts.heavy }}>
          {env.kt('pour.hold')}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', minHeight: 300, paddingBottom: spacing.sm },
  jug: { marginBottom: -6, marginLeft: 70, zIndex: 2 },
  stream: { position: 'absolute', bottom: VESSEL_H + 40, width: 8, height: 70, borderRadius: 4, borderWidth: 1, marginLeft: 20 },
  vessel: { width: VESSEL_W, height: VESSEL_H, borderWidth: 3, borderTopWidth: 0, borderBottomLeftRadius: 38, borderBottomRightRadius: 38, borderTopLeftRadius: 8, borderTopRightRadius: 8, overflow: 'hidden', justifyContent: 'flex-end' },
  liquid: { width: '100%' },
  surface: { position: 'absolute', top: -4, left: -10, right: -10, height: 8, borderRadius: 4 },
  band: { position: 'absolute', left: 0, right: 0, borderTopWidth: 2, borderBottomWidth: 2, borderStyle: 'dashed', opacity: 0.75 },
  bandArrow: { position: 'absolute', left: -2 },
  vesselLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  pourButton: { minHeight: 56, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
});
