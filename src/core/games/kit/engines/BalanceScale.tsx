import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition, useAnimatedStyle, useSharedValue, withSpring, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { radius, spacing } from '../../../theme';
import { ChallengeClock, HintPointer, InlineCaption } from '../board';
import { DragTile, DropZone } from '../drag';
import { useEngineCore } from '../engine';
import { Burst } from '../fx';
import { useMeasure } from '../layout';
import { FaceView, faceLabel, Tile, Tray } from '../primitives';
import { useKitProbe } from '../probe';
import type { EngineProps, KitItem } from '../types';

export interface ScaleWeight extends KitItem {
  /** Weight in any unit (only the sums are compared). */
  weight: number;
}

export interface BalanceScaleProps extends EngineProps {
  /** Fixed load on the left pan. */
  left: ScaleWeight[];
  /** Weights the learner can put on the right pan (tap / drag; tap on the pan to take one off). */
  weights: ScaleWeight[];
}

const MAX_TILT = 14;

/** Pure: the beam's tilt in degrees (positive = right side down), clamped. */
export function tiltFor(leftSum: number, rightSum: number): number {
  const diff = rightSum - leftSum;
  const ref = Math.max(1, leftSum, rightSum);
  return Math.max(-MAX_TILT, Math.min(MAX_TILT, (diff / ref) * MAX_TILT * 1.6));
}

/** Pure: a subset of `weights` (ids) that sums exactly to `target`, or null. */
export function balancingSet(weights: readonly ScaleWeight[], target: number): string[] | null {
  const n = weights.length;
  for (let mask = 1; mask < 1 << n; mask++) {
    let sum = 0;
    const ids: string[] = [];
    for (let i = 0; i < n; i++)
      if (mask & (1 << i)) {
        sum += weights[i].weight;
        ids.push(weights[i].id);
      }
    if (Math.abs(sum - target) < 1e-9) return ids;
  }
  return null;
}

/**
 * BalanceScale – weigh and balance (a fair measure). Put weights on the right pan until the beam is level. The beam
 * tilts with a spring; tipping past the balance is a gentle mistake (take a weight off again).
 */
export function BalanceScale(props: BalanceScaleProps) {
  const { left, weights } = props;
  const core = useEngineCore(props, 1);
  const { env, k, reduced } = core;
  const [onPan, setOnPan] = useState<string[]>([]);
  const [balanced, setBalanced] = useState(false);
  const area = useMeasure();
  const testID = props.testID ?? 'balance-scale';
  const leftSum = left.reduce((s, w) => s + w.weight, 0);
  const rightSum = weights.filter((w) => onPan.includes(w.id)).reduce((s, w) => s + w.weight, 0);
  const label = (i: KitItem) => faceLabel(i, env.text);

  const tilt = useSharedValue(tiltFor(leftSum, 0));
  useEffect(() => {
    const t = tiltFor(leftSum, rightSum);
    tilt.set(reduced ? t : withSpring(t, { damping: 9, stiffness: 70, mass: 1.2 }));
  }, [leftSum, rightSum, reduced, tilt]);

  const toggle = (id: string): boolean => {
    if (core.finishedRef.current || balanced) return false;
    const adding = !onPan.includes(id);
    const next = adding ? [...onPan, id] : onPan.filter((x) => x !== id);
    setOnPan(next);
    const sum = weights.filter((w) => next.includes(w.id)).reduce((s, w) => s + w.weight, 0);
    if (Math.abs(sum - leftSum) < 1e-9) {
      setBalanced(true);
      core.progress(1);
      core.right({ caption: env.kt('scale.balanced') });
      core.finish(reduced ? 400 : 1400);
    } else if (sum > leftSum) {
      if (adding) core.wrong(id, env.kt('scale.heavyRight'));
      else core.setCaption({ text: env.kt('scale.heavyRight'), tone: 'info' });
    } else {
      core.touch();
      core.setCaption({ text: env.kt('scale.heavyLeft'), tone: 'info' });
    }
    return true;
  };

  const solution = balancingSet(weights, leftSum) ?? [];
  useKitProbe({
    engine: 'BalanceScale',
    testID,
    step: () => {
      if (balanced) return false;
      const extra = onPan.find((id) => !solution.includes(id));
      if (extra) return toggle(extra);
      const missing = solution.find((id) => !onPan.includes(id));
      return missing ? toggle(missing) : false;
    },
    mistake: () => {
      if (balanced) return false;
      const heavy = [...weights].sort((a, b) => b.weight - a.weight).filter((w) => !onPan.includes(w.id));
      // Adds the heaviest weight left; repeated calls tip the scale past the balance.
      const over = heavy.find((w) => rightSum + w.weight > leftSum) ?? heavy[0];
      if (!over) return false;
      toggle(over.id);
      return true;
    },
    done: () => balanced,
  });

  const W = area.w > 0 ? area.w : 320;
  const beamW = Math.min(W - 24, 340);
  const panW = Math.min(132, beamW * 0.4);
  const half = beamW / 2 - panW / 2 - 4;
  const beamStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${tilt.value}deg` }] }));
  const leftPan = useAnimatedStyle(() => ({ transform: [{ translateY: -Math.sin((tilt.value * Math.PI) / 180) * half }] }));
  const rightPan = useAnimatedStyle(() => ({ transform: [{ translateY: Math.sin((tilt.value * Math.PI) / 180) * half }] }));

  const pile = (items: ScaleWeight[], removable: boolean) => (
    <View style={styles.pile}>
      {items.map((w) => (
        <Animated.View key={w.id} entering={reduced ? FadeIn : ZoomIn.springify().damping(12)}>
          <Pressable
            disabled={!removable || balanced}
            onPress={() => toggle(w.id)}
            accessibilityRole={removable ? 'button' : undefined}
            accessibilityLabel={removable ? env.kt('scale.remove', { label: label(w) }) : label(w)}
            testID={removable ? `pan-${w.id}` : undefined}
            style={[styles.pileItem, { backgroundColor: k.tileFace, borderColor: k.tileBorder }]}
          >
            <FaceView face={w} artSize={26} arabicSize={18} variant="tiny" numberOfLines={1} />
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.stage} onLayout={area.onLayout}>
        <View style={{ width: beamW, height: 250 }}>
          {/* stand */}
          <Svg width={beamW} height={250} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Path d={`M${beamW / 2 - 46} 246Q${beamW / 2} 214 ${beamW / 2 + 46} 246Z`} fill={k.tileEdge} />
            <Rect x={beamW / 2 - 5} y={44} width={10} height={190} rx={5} fill={k.accent} />
            <Circle cx={beamW / 2} cy={44} r={11} fill={k.gold} />
          </Svg>
          {/* beam */}
          <Animated.View style={[styles.beam, { left: beamW / 2 - half - 12, width: 2 * half + 24, top: 38, backgroundColor: k.accent }, beamStyle]} />
          {/* pans */}
          <Animated.View style={[styles.panWrap, { left: beamW / 2 - half - panW / 2, width: panW }, leftPan]} accessible accessibilityLabel={env.kt('scale.pan.left', { label: left.map(label).join(', ') })}>
            <Svg width={panW} height={70} style={styles.strings} pointerEvents="none">
              <Path d={`M${panW / 2} 0L8 66M${panW / 2} 0L${panW - 8} 66`} stroke={k.textMuted} strokeWidth={1.5} />
            </Svg>
            <View style={[styles.pan, { backgroundColor: k.goldSoft, borderColor: k.gold }]}>{pile(left, false)}</View>
          </Animated.View>
          <Animated.View style={[styles.panWrap, { left: beamW / 2 + half - panW / 2, width: panW }, rightPan]}>
            <Svg width={panW} height={70} style={styles.strings} pointerEvents="none">
              <Path d={`M${panW / 2} 0L8 66M${panW / 2} 0L${panW - 8} 66`} stroke={k.textMuted} strokeWidth={1.5} />
            </Svg>
            <DropZone
              id="right-pan"
              testID="zone-right-pan"
              accessibilityLabel={env.kt('scale.pan.right', { label: weights.filter((w) => onPan.includes(w.id)).map(label).join(', ') || '–' })}
              style={[styles.pan, { backgroundColor: balanced ? k.rightSoft : k.goldSoft, borderColor: balanced ? k.right : k.gold }]}
              hoverStyle={{ borderRadius: radius.md, borderWidth: 3, borderColor: k.gold, backgroundColor: k.slotHover }}
            >
              {pile(
                weights.filter((w) => onPan.includes(w.id)),
                true,
              )}
              {balanced ? <Burst trigger={1} distance={60} size={14} /> : null}
            </DropZone>
          </Animated.View>
        </View>
        {core.hintsOn && core.idle && !balanced ? <HintPointer from={{ x: W / 2, y: 330 }} to={{ x: W / 2 + half * 0.8, y: 120 }} /> : null}
      </View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      <Tray label={env.kt('tray')} style={styles.tray}>
        {weights
          .filter((w) => !onPan.includes(w.id))
          .map((w) => (
            <Animated.View key={w.id} layout={reduced ? undefined : LinearTransition.springify().damping(16)}>
              <DragTile id={w.id} accessibilityLabel={env.kt('a11y.tile', { label: label(w) })} onLift={core.touch} onPress={() => toggle(w.id)} onDrop={(zone) => (zone === 'right-pan' ? toggle(w.id) : false)} disabled={balanced}>
                <Tile minHeight={60} style={{ minWidth: 64 }}>
                  <FaceView face={w} artSize={32} variant="tiny" numberOfLines={2} />
                </Tile>
              </DragTile>
            </Animated.View>
          ))}
      </Tray>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 260 },
  beam: { position: 'absolute', height: 10, borderRadius: 5 },
  panWrap: { position: 'absolute', top: 43, alignItems: 'center' },
  strings: { position: 'absolute', top: 0 },
  pan: { marginTop: 64, alignSelf: 'stretch', minHeight: 64, borderRadius: radius.md, borderWidth: 2, borderTopWidth: 5, padding: 4, justifyContent: 'flex-end' },
  pile: { flexDirection: 'row', flexWrap: 'wrap-reverse', justifyContent: 'center', gap: 3 },
  pileItem: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 3, paddingVertical: 2, minWidth: 30, minHeight: 30, alignItems: 'center', justifyContent: 'center' },
  tray: { minHeight: 64 },
});
