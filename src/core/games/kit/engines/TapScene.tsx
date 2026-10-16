import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { Art, catalogue, hasArt } from '../../../art';
import { AppText } from '../../../components/ui/AppText';
import { Icon } from '../../../components/ui/Icon';
import { radius, spacing } from '../../../theme';
import { ChallengeClock, HintPointer, InlineCaption } from '../board';
import { useEngineCore } from '../engine';
import { Burst, useShake } from '../fx';
import { useMeasure } from '../layout';
import { faceLabel } from '../primitives';
import { useKitProbe } from '../probe';
import type { EngineProps, KitBox, KitItem, KitText } from '../types';

export interface SceneSpot extends KitItem {
  /** Area of the spot in the scene (fractions 0..1). */
  at: KitBox;
  /** Something to find (default true). Non-targets are distractors: tapping them is a mistake. */
  target?: boolean;
  /** Short caption shown when found. */
  caption?: KitText;
  /** Draw this art in the spot (otherwise the spot is part of the background picture). */
  spotArt?: string;
}

export interface TapSceneProps extends EngineProps {
  /** Background art of the scene. */
  scene?: string;
  aspect?: number;
  spots: SceneSpot[];
  /** Ask for one target after another ("Find: …"); default false = find all targets in any order. */
  ordered?: boolean;
}

/**
 * TapScene – find things in an illustrated scene. Found targets get a glowing ring, a check and a sparkle burst; the
 * "still to find" chips under the scene fill up. Distractor spots shake (a mistake); tapping empty space does nothing.
 */
export function TapScene(props: TapSceneProps) {
  const { spots, ordered } = props;
  const targets = useMemo(() => spots.filter((s) => s.target !== false), [spots]);
  const core = useEngineCore(props, targets.length);
  const { env, k } = core;
  const [found, setFound] = useState<string[]>([]);
  const [shakeSpot, setShakeSpot] = useState({ id: '', tick: 0 });
  const area = useMeasure();
  const testID = props.testID ?? 'tap-scene';
  const label = (s: KitItem) => faceLabel(s, env.text);
  const next = targets.find((t) => !found.includes(t.id));

  useEffect(() => {
    if (ordered && next && !core.caption) core.setCaption({ text: env.kt('scene.find', { label: label(next) }), tone: 'hint' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = (spot: SceneSpot) => {
    if (core.finishedRef.current || found.includes(spot.id)) return;
    const isTarget = spot.target !== false && (!ordered || next?.id === spot.id);
    if (!isTarget) {
      core.wrong(spot.id, ordered && next ? env.kt('scene.find', { label: label(next) }) : env.kt('fb.tryAgain'));
      setShakeSpot((s) => ({ id: spot.id, tick: s.tick + 1 }));
      return;
    }
    const nextFound = [...found, spot.id];
    setFound(nextFound);
    core.progress(nextFound.length);
    const after = targets.find((t) => !nextFound.includes(t.id));
    const caption = spot.caption ? env.text(spot.caption) : env.kt('scene.found', { label: label(spot) });
    core.right({ caption: ordered && after ? `${caption} ${env.kt('scene.find', { label: label(after) })}` : caption, tone: spot.caption ? 'fact' : 'right' });
    if (nextFound.length === targets.length) core.finish(900);
  };

  useKitProbe({
    engine: 'TapScene',
    testID,
    step: () => {
      if (!next) return false;
      tap(next);
      return true;
    },
    mistake: () => {
      const distractor = spots.find((s) => s.target === false) ?? (ordered ? targets.find((t) => t.id !== next?.id && !found.includes(t.id)) : undefined);
      if (!distractor) return false;
      tap(distractor);
      return true;
    },
    done: () => !next,
  });

  const bgAspect = props.scene && catalogue[props.scene] ? catalogue[props.scene].aspect : 4 / 3;
  const aspect = props.aspect ?? bgAspect;
  const w = area.w > 0 ? Math.min(area.w, area.h * aspect) : 0;
  const h = w / aspect;
  const hint = core.hintsOn && core.idle && next;

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      <View style={styles.sceneArea} onLayout={area.onLayout}>
        {w > 0 ? (
          <View style={[styles.frame, { width: w, height: h, borderColor: k.boardBorder }]}>
            {props.scene && hasArt(props.scene) ? <Art name={props.scene} size={w} height={h} fit="cover" /> : <LinearGradient colors={[k.accentSoft, k.board[1]]} style={StyleSheet.absoluteFill} />}
            {spots.map((spot) => (
              <Spot
                key={spot.id}
                spot={spot}
                box={{ left: spot.at.x * w, top: spot.at.y * h, width: spot.at.w * w, height: spot.at.h * h }}
                found={found.includes(spot.id)}
                shakeTick={shakeSpot.id === spot.id ? shakeSpot.tick : 0}
                reduced={core.reduced}
                ringColor={k.gold}
                checkColor={k.right}
                onColor={k.tileFace}
                label={found.includes(spot.id) ? env.kt('scene.found', { label: label(spot) }) : env.kt('scene.spot')}
                onPress={() => tap(spot)}
              />
            ))}
            {hint ? <HintPointer from={{ x: (next.at.x + next.at.w / 2) * w, y: (next.at.y + next.at.h / 2) * h }} /> : null}
          </View>
        ) : null}
      </View>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      {!ordered ? (
        <View style={styles.chips}>
          {targets.map((t) => {
            const isFound = found.includes(t.id);
            return (
              <View key={t.id} style={[styles.chip, { backgroundColor: isFound ? k.rightSoft : k.tileFace, borderColor: isFound ? k.right : k.tileBorder }]}>
                {t.art && hasArt(t.art) ? <Art name={t.art} size={22} /> : null}
                <AppText variant="tiny" color={isFound ? k.right : k.text}>
                  {label(t)}
                </AppText>
                {isFound ? <Icon name="check" size={14} color={k.right} /> : null}
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function Spot({
  spot,
  box,
  found,
  shakeTick,
  reduced,
  ringColor,
  checkColor,
  onColor,
  label,
  onPress,
}: {
  spot: SceneSpot;
  box: { left: number; top: number; width: number; height: number };
  found: boolean;
  shakeTick: number;
  reduced: boolean;
  ringColor: string;
  checkColor: string;
  onColor: string;
  label: string;
  onPress: () => void;
}) {
  const { style, shake } = useShake(reduced);
  const ring = useSharedValue(found ? 1 : 0);
  useEffect(() => {
    if (shakeTick > 0) shake();
  }, [shakeTick, shake]);
  useEffect(() => {
    if (found) ring.set(reduced ? 1 : withSequence(withTiming(1.25, { duration: 180 }), withTiming(1, { duration: 200 })));
  }, [found, reduced, ring]);
  const ringStyle = useAnimatedStyle(() => ({ opacity: ring.value > 0 ? 1 : 0, transform: [{ scale: ring.value || 1 }] }));
  const size = Math.max(48, Math.min(box.width, box.height));
  return (
    <Animated.View style={[styles.spot, box, style]}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} testID={`spot-${spot.id}`} style={styles.spotPress} hitSlop={Math.max(0, (48 - Math.min(box.width, box.height)) / 2)}>
        {spot.spotArt && hasArt(spot.spotArt) ? <Art name={spot.spotArt} size={Math.min(box.width, box.height * (catalogue[spot.spotArt]?.aspect ?? 1))} /> : null}
        <Animated.View pointerEvents="none" style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderColor: ringColor }, ringStyle]} />
        {found ? (
          <View pointerEvents="none" style={[styles.check, { backgroundColor: checkColor, borderColor: onColor }]}>
            <Icon name="check" size={14} color={onColor} strokeWidth={3} />
          </View>
        ) : null}
        {found ? <Burst trigger={1} distance={size * 0.7} size={12} /> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  sceneArea: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 160 },
  frame: { borderRadius: radius.lg, borderWidth: 2, overflow: 'hidden' },
  spot: { position: 'absolute' },
  spotPress: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 4 },
  check: { position: 'absolute', top: 0, right: 0, width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.xs },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: radius.pill, borderWidth: 1.5, paddingHorizontal: spacing.sm, paddingVertical: 3, minHeight: 32 },
});

