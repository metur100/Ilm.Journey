import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedProps, useSharedValue } from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { AppText } from '../../../components/ui/AppText';
import { Button } from '../../../components/ui/Button';
import { fonts, radius, spacing } from '../../../theme';
import { ChallengeClock, InlineCaption, ProgressDots } from '../board';
import { useEngineCore } from '../engine';
import { Burst, CheckBadge } from '../fx';
import { useMeasure } from '../layout';
import { samplePath } from '../pathSample';
import { useKitProbe } from '../probe';
import type { EngineProps, KitText } from '../types';

export interface TraceShapeDef {
  id: string;
  label?: KitText;
  /** Big faint guide glyph (e.g. an Arabic letter) drawn behind the strokes. */
  glyph?: string;
  /** Strokes to trace in order: SVG paths in a 100 × 100 box (absolute M, L, H, V, Q, C, Z). */
  strokes?: string[];
}

export interface TraceShapeProps extends EngineProps {
  shapes: TraceShapeDef[];
  /** Tolerance in units of the 100 × 100 box (default 9). */
  tolerance?: number;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
/** Length (box units) a glyph-only shape must be covered with. */
const GLYPH_LENGTH = 220;

/**
 * TraceShape – trace a letter or shape with the finger. With `strokes`, each stroke is followed from its start dot in
 * the arrow's direction (the ink only advances along the stroke); with only a `glyph`, the learner covers the big
 * guide letter. Straying far from the stroke is a gentle mistake. Screen readers get "Trace for me".
 */
export function TraceShape(props: TraceShapeProps) {
  const { shapes } = props;
  const core = useEngineCore(props, shapes.length);
  const { env, k } = core;
  const [shapeIndex, setShapeIndex] = useState(0);
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [doneShapes, setDoneShapes] = useState(0);
  const [shapeDone, setShapeDone] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const area = useMeasure();
  const testID = props.testID ?? 'trace-shape';
  const shape = shapes[Math.min(shapeIndex, shapes.length - 1)];
  const tol = props.tolerance ?? 9;
  const sampled = useMemo(() => (shape.strokes ?? []).map((d) => samplePath(d, 2)), [shape]);
  const glyphOnly = sampled.length === 0;
  const allDone = doneShapes >= shapes.length;

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled()
      .then(setScreenReader)
      .catch(() => undefined);
  }, []);

  const size = area.w > 0 ? Math.min(area.w, area.h - 8, 340) : 0;
  const scale = size / 100;

  // UI-thread progress of the current stroke.
  const prog = useSharedValue(0);
  const covered = useSharedValue(0);
  const live = useSharedValue('');
  const strayed = useSharedValue(0);
  const lastX = useSharedValue(0);
  const lastY = useSharedValue(0);
  useEffect(() => {
    prog.set(0);
    covered.set(0);
    live.set('');
  }, [shapeIndex, strokeIndex, prog, covered, live]);

  const finishShape = () => {
    if (shapeDone || core.finishedRef.current) return;
    setShapeDone(true);
    const count = doneShapes + 1;
    setDoneShapes(count);
    core.progress(count);
    core.right({ caption: env.kt('trace.done') });
    if (count >= shapes.length) core.finish(900);
    else
      setTimeout(() => {
        setShapeIndex((i) => i + 1);
        setStrokeIndex(0);
        setShapeDone(false);
      }, core.reduced ? 500 : 1100);
  };

  const strokeDone = (index: number) => {
    if (index !== strokeIndex) return;
    if (index + 1 >= sampled.length) finishShape();
    else {
      setStrokeIndex(index + 1);
      core.right({ caption: false });
    }
  };

  const stray = () => core.wrong(shape.id, env.kt('trace.keep'));

  const pts = sampled[strokeIndex] ?? [];
  const geo = { pts, scale, tol, glyphOnly, stroke: strokeIndex };
  const pan = Gesture.Pan()
    .minDistance(1)
    .onStart((e) => {
      'worklet';
      strayed.set(0);
      lastX.set(e.x / geo.scale);
      lastY.set(e.y / geo.scale);
      if (geo.glyphOnly) live.set(`${live.value}M${e.x / geo.scale} ${e.y / geo.scale}`);
    })
    .onUpdate((e) => {
      'worklet';
      const x = e.x / geo.scale;
      const y = e.y / geo.scale;
      if (geo.glyphOnly) {
        if (live.value.length < 9000) live.set(`${live.value}L${x.toFixed(1)} ${y.toFixed(1)}`);
        const before = covered.value;
        covered.set(before + Math.hypot(x - lastX.value, y - lastY.value));
        lastX.set(x);
        lastY.set(y);
        if (before < GLYPH_LENGTH && covered.value >= GLYPH_LENGTH) runOnJS(finishShape)();
        return;
      }
      const p = geo.pts;
      const from = Math.floor(prog.value);
      let best = -1;
      let nearest = 1e9;
      for (let i = from; i < Math.min(p.length, from + 10); i++) {
        const d = Math.hypot(x - p[i][0], y - p[i][1]);
        if (d < nearest) nearest = d;
        if (d < geo.tol) best = i;
      }
      if (best > prog.value) {
        prog.set(best);
        let d = `M${p[0][0]} ${p[0][1]}`;
        for (let i = 1; i <= best; i++) d += `L${p[i][0]} ${p[i][1]}`;
        live.set(d);
        if (best >= p.length - 2) {
          prog.set(p.length);
          runOnJS(strokeDone)(geo.stroke);
        }
      } else if (nearest > geo.tol * 2.6 && !strayed.value && prog.value > 0) {
        strayed.set(1);
        runOnJS(stray)();
      }
    });

  const liveProps = useAnimatedProps(() => ({ d: live.value || 'M0 0' }));

  const autoTrace = () => {
    if (glyphOnly) finishShape();
    else strokeDone(strokeIndex);
  };

  useKitProbe({
    engine: 'TraceShape',
    testID,
    step: () => {
      if (allDone || shapeDone) {
        if (shapeDone && !allDone) {
          setShapeIndex((i) => i + 1);
          setStrokeIndex(0);
          setShapeDone(false);
          return true;
        }
        return false;
      }
      autoTrace();
      return true;
    },
    mistake: () => {
      if (allDone) return false;
      stray();
      return true;
    },
    done: () => allDone,
  });

  const label = env.text(shape.label) || shape.glyph || '';
  const start = pts[0];
  const dir = pts[3] ?? pts[1];
  const angle = start && dir ? Math.atan2(dir[1] - start[1], dir[0] - start[0]) : 0;

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      {shapes.length > 1 ? <ProgressDots total={shapes.length} done={doneShapes} /> : null}
      <View style={styles.area} onLayout={area.onLayout}>
        {size > 0 ? (
          <GestureDetector gesture={pan}>
            <View
              style={[styles.canvas, { width: size, height: size, backgroundColor: k.tileFace, borderColor: shapeDone ? k.right : k.tileBorder }]}
              collapsable={false}
              accessible
              accessibilityLabel={env.kt('trace.canvas', { label })}
              testID={`trace-${shape.id}`}
            >
              <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill} pointerEvents="none">
                {[25, 50, 75].map((v) => (
                  <Line key={`h${v}`} x1={0} y1={v} x2={100} y2={v} stroke={k.slotBorder} strokeOpacity={0.35} strokeWidth={0.4} />
                ))}
                {sampled.map((_s, i) => (
                  <Path key={i} d={shape.strokes![i]} stroke={i < strokeIndex || shapeDone ? k.accent : k.slotFill} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                ))}
                {sampled.map((_s, i) => (i >= strokeIndex && !shapeDone ? <Path key={`c${i}`} d={shape.strokes![i]} stroke={k.slotBorder} strokeWidth={1.2} strokeDasharray="2 3" fill="none" /> : null))}
                {!shapeDone ? <AnimatedPath animatedProps={liveProps} stroke={k.accent} strokeWidth={glyphOnly ? 9 : 11} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
                {start && !shapeDone ? (
                  <>
                    <Circle cx={start[0]} cy={start[1]} r={5.5} fill={k.right} />
                    <Path d={`M${start[0] + Math.cos(angle) * 9} ${start[1] + Math.sin(angle) * 9}l${Math.cos(angle + 2.5) * 5} ${Math.sin(angle + 2.5) * 5}M${start[0] + Math.cos(angle) * 9} ${start[1] + Math.sin(angle) * 9}l${Math.cos(angle - 2.5) * 5} ${Math.sin(angle - 2.5) * 5}`} stroke={k.right} strokeWidth={2.2} strokeLinecap="round" />
                  </>
                ) : null}
              </Svg>
              {shape.glyph ? (
                <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
                  <AppText script="arabic" style={{ fontFamily: fonts.arabicBold, fontSize: size * 0.6, lineHeight: size * 0.95, opacity: glyphOnly ? 0.22 : 0.08 }} color={k.text}>
                    {shape.glyph}
                  </AppText>
                </View>
              ) : null}
              <CheckBadge show={shapeDone} size={30} style={{ top: 8, right: 8 }} />
              {shapeDone ? <Burst trigger={doneShapes} distance={size * 0.35} size={16} /> : null}
            </View>
          </GestureDetector>
        ) : null}
      </View>
      <InlineCaption text={core.caption?.text ?? label} tone={core.caption?.tone ?? 'info'} />
      {screenReader ? (
        <View testID="kit-trace-auto">
          <Button label={env.kt('trace.auto')} variant="secondary" onPress={autoTrace} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  area: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 220 },
  canvas: { borderRadius: radius.xl, borderWidth: 2, overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
