import React, { memo, useEffect, useId, useMemo, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, type SharedValue, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Art, catalogue, hasArt } from '@/core/art';
import { useReducedMotion } from '@/core/hooks/useReducedMotion';
import type { SceneSpec } from '@/core/models';

import { SceneView } from './SceneView';
import {
  isForbiddenStageArt,
  normalizeAnim,
  normalizeEffect,
  STAGE_H,
  STAGE_W,
  type StageCamera,
  type StageEffect,
  type StageLayer,
  type StageMood,
  type StageSpec,
} from './stage';
import { EFFECT_Z, type EffectEnv, StageEffectView } from './stageEffects';
import { isDarkSky, sceneEffects, STAGE_SKIES } from './stageFallback';
import { Appear, loopPeriod, STAGE_CYCLE, useStageClock } from './stageMotion';

export interface StoryStageProps {
  /** Illustrated stage (layers + effects). Without it the `scene` is drawn and animated with matching effects. */
  stage?: StageSpec;
  /** Fallback symbolic scene (and default sky). */
  scene?: SceneSpec;
  height: number;
  rounded?: boolean;
  style?: StyleProp<ViewStyle>;
  /** A still picture: no loops, no timeline (thumbnails). Reduced motion does the same automatically. */
  still?: boolean;
  /** Stop the loops while the screen is not visible. */
  paused?: boolean;
  /** Override the stage's camera. */
  camera?: StageCamera;
  /** Accessibility description; without it the picture is decorative (the story text tells the scene). */
  label?: string;
}

const MOODS: Record<Exclude<StageMood, 'none'>, string> = {
  warm: 'rgba(255,160,80,0.10)',
  cool: 'rgba(70,130,220,0.12)',
  night: 'rgba(8,12,48,0.30)',
  golden: 'rgba(255,196,90,0.14)',
  dawn: 'rgba(255,140,140,0.10)',
};

type Item = { kind: 'layer'; z: number; layer: StageLayer; index: number } | { kind: 'effect'; z: number; effect: StageEffect; index: number };

/**
 * The animated illustration of a story scene, story cover or Seerah section (docs/STORIES-V3.md). Art layers from
 * the library on a 400 × 240 canvas, ambient effects, a gentle camera and a cinematic vignette. Never people: `body.*`
 * and `pose.*` layers are skipped. Reduced motion shows the final composition as a still picture.
 */
export const StoryStage = memo(function StoryStage({ stage, scene, height, rounded = true, style, still, paused, camera, label }: StoryStageProps) {
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const animate = !still && !reduced;
  const clock = useStageClock(animate && !paused && width > 0);
  const sky = stage?.sky ?? scene?.sky ?? 'day';
  const dark = isDarkSky(sky);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const s = width > 0 ? Math.max(width / STAGE_W, height / STAGE_H) : 0;
  const cw = STAGE_W * s;
  const ch = STAGE_H * s;
  const ox = (width - cw) / 2;
  const oy = (height - ch) * 0.8;

  const items = useMemo<Item[]>(() => {
    const layers = (stage?.layers ?? []).filter((l) => !isForbiddenStageArt(l.art));
    const effects = stage ? (stage.effects ?? []).map(normalizeEffect) : scene ? sceneEffects(scene) : [];
    const list: Item[] = [
      ...layers.map((layer, index) => ({ kind: 'layer' as const, z: layer.z ?? index * 10 + 10, layer, index })),
      ...effects.map((effect, index) => ({ kind: 'effect' as const, z: effect.z ?? EFFECT_Z[effect.type] ?? 100, effect, index })),
    ];
    return list.sort((a, b) => a.z - b.z || (a.kind === b.kind ? a.index - b.index : a.kind === 'layer' ? -1 : 1));
  }, [stage, scene]);

  const cam: StageCamera = !animate ? 'still' : camera ?? stage?.camera ?? (height >= 180 ? 'slowZoom' : 'still');
  const [top, mid, bottom] = STAGE_SKIES[sky];
  const env: EffectEnv = { clock, s, dark };
  const mood = stage?.mood && stage.mood !== 'none' ? MOODS[stage.mood] : undefined;
  const vignette = stage?.vignette ?? true;

  return (
    <View
      onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}
      style={[styles.root, { height, borderRadius: rounded ? 22 : 0 }, style]}
      accessible={!!label}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
      accessibilityElementsHidden={!label}
    >
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" viewBox="0 0 10 10" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={top} />
            <Stop offset="0.6" stopColor={mid} />
            <Stop offset="1" stopColor={bottom} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={10} height={10} fill={`url(#sky${uid})`} />
      </Svg>
      {s > 0 ? (
        <Camera clock={clock} mode={cam} s={s} style={{ left: ox, top: oy, width: cw, height: ch }}>
          {!stage && scene ? <SceneView scene={scene} height={ch} rounded={false} style={{ position: 'absolute', left: 0, top: 0, width: cw }} /> : null}
          {items.map((item) =>
            item.kind === 'layer' ? (
              <LayerView key={`l${item.index}`} layer={item.layer} s={s} clock={clock} animate={animate} dark={item.layer.dark ?? dark} />
            ) : (
              <Appear key={`e${item.index}`} at={item.effect.at} until={item.effect.until} animate={animate}>
                <StageEffectView effect={item.effect} env={env} />
              </Appear>
            ),
          )}
        </Camera>
      ) : null}
      {mood ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: mood }]} /> : null}
      {vignette ? (
        <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            <RadialGradient id={`vig${uid}`} cx="0.5" cy="0.45" r="0.72" fx="0.5" fy="0.45">
              <Stop offset="0.62" stopColor="#000000" stopOpacity={0} />
              <Stop offset="1" stopColor="#05061A" stopOpacity={dark ? 0.42 : 0.24} />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={100} height={100} fill={`url(#vig${uid})`} />
        </Svg>
      ) : null}
    </View>
  );
});

function Camera({ clock, mode, s, style, children }: { clock: SharedValue<number>; mode: StageCamera; s: number; style: ViewStyle; children: React.ReactNode }) {
  const animated = useAnimatedStyle(() => {
    if (mode === 'still') return { transform: [{ scale: 1 }] };
    const p = (clock.value * 2) % 1; // 30 s loop
    const ease = 0.5 - 0.5 * Math.cos(p * Math.PI * 2);
    if (mode === 'slowZoom') return { transform: [{ scale: 1 + 0.06 * ease }] };
    if (mode === 'panLeft') return { transform: [{ scale: 1.08 }, { translateX: (8 - 16 * ease) * s }] };
    if (mode === 'panRight') return { transform: [{ scale: 1.08 }, { translateX: (-8 + 16 * ease) * s }] };
    const a = p * Math.PI * 2;
    return { transform: [{ scale: 1.05 }, { translateX: Math.sin(a) * 4 * s }, { translateY: Math.cos(a) * 2.5 * s }] };
  });
  return <Animated.View style={[styles.abs, style, animated]}>{children}</Animated.View>;
}

const ENTER_DISTANCE = 26;

function LayerView({ layer, s, clock, animate, dark }: { layer: StageLayer; s: number; clock: SharedValue<number>; animate: boolean; dark: boolean }) {
  const entry = hasArt(layer.art) ? catalogue[layer.art] : undefined;
  const natW = entry?.def.w ?? 120;
  const aspect = entry?.aspect ?? 1;
  const fill = !!layer.fill;
  const w = fill ? STAGE_W : layer.w ?? Math.min(natW, STAGE_W);
  const h = fill ? STAGE_H : w / aspect;
  const anchor = layer.anchor ?? 'bottom';
  const x = layer.x ?? STAGE_W / 2;
  const y = layer.y ?? (anchor === 'bottom' ? STAGE_H : STAGE_H / 2);
  const left = fill ? 0 : x - w / 2;
  const top = fill ? 0 : anchor === 'bottom' ? y - h : y - h / 2;

  const at = layer.at ?? 0;
  const enter = layer.enter ?? (at > 0 ? 'fade' : 'none');
  const duration = layer.duration ?? 900;
  const anim = normalizeAnim(layer.anim);
  const hiddenAtEnd = layer.exitAt !== undefined;

  const enterV = useSharedValue(animate && enter !== 'none' ? 0 : 1);
  const exitV = useSharedValue(!animate && hiddenAtEnd ? 0 : 1);
  useEffect(() => {
    if (!animate) return;
    if (enter !== 'none') enterV.value = withDelay(at, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    if (layer.exitAt !== undefined) exitV.value = withDelay(layer.exitAt, withTiming(0, { duration: 1100 }));
  }, [animate, at, duration, enter, enterV, exitV, layer.exitAt]);

  const period = anim ? loopPeriod(anim.period ?? (anim.type === 'spin' ? 60000 : anim.type === 'drift' ? 12000 : anim.type === 'glow' ? 4000 : 6000)) : 6000;
  const amp = anim?.amp;
  const type = anim?.type ?? 'none';
  const baseOpacity = layer.opacity ?? 1;
  const baseRot = layer.rotate ?? 0;
  const offset = ((x * 7 + y * 3) % 100) / 100;
  const style = useAnimatedStyle(() => {
    const e = enterV.value;
    let tx = 0;
    let ty = 0;
    let sc = 1;
    let rot = baseRot;
    let op = baseOpacity * exitV.value;
    if (enter === 'fade') op *= e;
    else if (enter === 'rise') {
      ty += (1 - e) * ENTER_DISTANCE * s;
      op *= e;
    } else if (enter === 'fall') {
      ty -= (1 - e) * ENTER_DISTANCE * s;
      op *= e;
    } else if (enter === 'slideLeft') {
      tx += (1 - e) * ENTER_DISTANCE * 2 * s;
      op *= e;
    } else if (enter === 'slideRight') {
      tx -= (1 - e) * ENTER_DISTANCE * 2 * s;
      op *= e;
    } else if (enter === 'zoom') {
      sc *= 0.82 + 0.18 * e;
      op *= e;
    }
    let pivot = 0;
    if (type !== 'none') {
      const p = (clock.value * Math.max(1, Math.round(STAGE_CYCLE / period)) + offset) % 1;
      const sn = Math.sin(p * Math.PI * 2);
      if (type === 'float') ty += sn * (amp ?? 4) * s;
      else if (type === 'bob') {
        ty += sn * (amp ?? 3) * s;
        rot += Math.sin(p * Math.PI * 2 + 1.2) * 1.6;
        pivot = 1;
      } else if (type === 'sway') {
        rot += sn * (amp ?? 2);
        pivot = 1;
      } else if (type === 'drift') tx += sn * (amp ?? 10) * s;
      else if (type === 'pulse') sc *= 1 + sn * (amp ?? 0.04);
      else if (type === 'glow') op *= 1 - (amp ?? 0.3) * (0.5 + 0.5 * sn);
      else if (type === 'spin') rot += p * 360;
      else if (type === 'breathe') {
        sc *= 1 + sn * (amp ?? 0.02);
        op *= 0.92 + 0.08 * (0.5 + 0.5 * sn);
      }
    }
    // Sway and bob turn around the foot of the layer, not its centre.
    const half = pivot * (h / 2) * s;
    return {
      opacity: op,
      transform: [{ translateX: tx }, { translateY: ty + half }, { rotate: `${rot}deg` }, { translateY: -half }, { scale: sc }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      renderToHardwareTextureAndroid
      style={[styles.abs, { left: left * s, top: top * s, width: w * s, height: h * s }, style]}
    >
      <View style={layer.flip ? styles.flip : undefined}>
        <Art name={layer.art} size={w * s} height={h * s} dark={dark} fit={fill ? 'cover' : undefined} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%', overflow: 'hidden' },
  abs: { position: 'absolute' },
  flip: { transform: [{ scaleX: -1 }] },
});
