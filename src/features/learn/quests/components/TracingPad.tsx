import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { speakArabic } from '@/core/services/speech';
import { fonts, makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { useQuestI18n } from '../i18n';
import { BOX, CANVAS_SIZE, checkTrace, guideOfLetter, inkPath, MIN_COVERAGE, MIN_SEGMENT, type Point, type TraceResult } from '../services/tracing';

const useStyles = makeStyles((c) => ({
  root: { gap: spacing.md },
  canvas: {
    alignSelf: 'center',
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    borderRadius: radius.xl,
    backgroundColor: c.surface,
    borderWidth: 2,
    borderColor: c.border,
    overflow: 'hidden',
  },
  canvasDone: { borderColor: c.success },
  // The real letter (font) as a small model in the corner; the guide itself is drawn from the letter's strokes.
  model: { position: 'absolute', top: spacing.xs, left: spacing.sm },
  modelText: { fontFamily: fonts.arabic, fontSize: 34, lineHeight: 56, color: c.textMuted },
  row: { flexDirection: 'row', gap: spacing.sm },
  cell: { flex: 1 },
}));

interface TracingPadProps {
  letter: string;
  /** Called once when the letter counts as traced. */
  onTraced?: () => void;
  /** Reports whether the current letter is traced (enables "next"). */
  onChange?: (traced: boolean) => void;
}

/** True while a screen reader is running – tracing is then optional (it cannot be done by touch exploration). */
export function useScreenReader(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isScreenReaderEnabled()
      .then((v) => mounted && setEnabled(v))
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setEnabled);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return enabled;
}

const SCALE = CANVAS_SIZE / BOX;
const EMPTY: Point[][] = [];

/**
 * Tracing canvas: the letter's strokes are drawn as a grey guide with a green start dot; the learner follows each stroke
 * with a finger and taps the dots. The trace is checked by shape (services/tracing.ts checkTrace) when the finger is
 * lifted – scribbling or filling the canvas does not count. No animations are used, so it behaves the same with reduced
 * motion. Screen-reader users can double-tap the canvas.
 */
export function TracingPad({ letter, onTraced, onChange }: TracingPadProps) {
  const { t } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const guide = guideOfLetter(letter);
  const [ink, setInk] = useState<Point[][]>(EMPTY);
  const [result, setResult] = useState<TraceResult | null>(null);
  const [assisted, setAssisted] = useState(false);
  const notified = useRef(false);

  // Gesture handlers are created once; they keep the strokes in a local mutable buffer and mirror them into React state.
  const [controller] = useState(() => {
    const buffer: { ink: Point[][] } = { ink: [] };
    const at = (x: number, y: number): Point => ({ x: x / SCALE, y: y / SCALE });
    const publish = () => setInk(buffer.ink.map((s) => s));
    return {
      responder: PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          buffer.ink = [...buffer.ink, [at(e.nativeEvent.locationX, e.nativeEvent.locationY)]];
          publish();
        },
        onPanResponderMove: (e) => {
          const stroke = buffer.ink[buffer.ink.length - 1];
          if (!stroke) return;
          const p = at(e.nativeEvent.locationX, e.nativeEvent.locationY);
          const last = stroke[stroke.length - 1];
          if (Math.hypot(p.x - last.x, p.y - last.y) < MIN_SEGMENT) return;
          buffer.ink = [...buffer.ink.slice(0, -1), [...stroke, p]];
          publish();
        },
        onPanResponderRelease: () => {
          publish();
          setResult(guide ? checkTrace(guide, buffer.ink) : null);
        },
      }),
      clear: () => {
        buffer.ink = [];
        publish();
        setResult(null);
        setAssisted(false);
      },
    };
  });

  // Without stroke data (should not happen) any trace counts, so the learner is never stuck.
  const traced = assisted || (guide ? result?.verdict === 'traced' : ink.length > 0);

  // Report progress to the parent; onTraced fires once per letter (again after clearing).
  useEffect(() => {
    onChange?.(traced);
    if (!traced) notified.current = false;
    else if (!notified.current) {
      notified.current = true;
      onTraced?.();
    }
  }, [traced, onChange, onTraced]);

  const progress = traced ? 1 : (result?.progress ?? 0);
  const percent = Math.round(progress * 100);
  const message = traced ? t('tracing.great') : result?.verdict === 'offTrack' ? t('tracing.offTrack') : t('tracing.keepGoing');
  const next = guide?.checkpoints.findIndex((_, i) => (result?.coverage[i] ?? 0) < MIN_COVERAGE) ?? -1;

  return (
    <View style={styles.root}>
      <View
        style={[styles.canvas, traced && styles.canvasDone]}
        {...controller.responder.panHandlers}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={t('tracing.canvas', { letter })}
        accessibilityValue={{ min: 0, max: 100, now: percent }}
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'activate') setAssisted(true);
        }}
      >
        {/* Not touchable: touch coordinates (locationX/Y) must be relative to the canvas, not to its children. */}
        <View style={styles.model} pointerEvents="none">
          <AppText style={styles.modelText} accessibilityElementsHidden importantForAccessibility="no">
            {letter}
          </AppText>
        </View>
        <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} style={StyleSheet.absoluteFill} viewBox={`0 0 ${BOX} ${BOX}`} pointerEvents="none">
          {guide?.strokes.map((_, i) => {
            const done = traced || (result?.coverage[i] ?? 0) >= MIN_COVERAGE;
            const d = guideStroke(guide.strokes[i]);
            return (
              <Path key={`g${i}`} d={d} stroke={done ? c.successSoft : c.border} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            );
          })}
          {guide?.strokes.map((s, i) => (
            <Path key={`c${i}`} d={guideStroke(s)} stroke={c.textMuted} strokeWidth={0.6} strokeDasharray="2 2.5" fill="none" />
          ))}
          {guide?.dots.map((d, i) => (
            <Circle key={`d${i}`} cx={d.x} cy={d.y} r={4} fill={traced || result?.dotsHit[i] ? c.success : c.border} />
          ))}
          {!traced && guide && next >= 0 ? <StartMarker points={guide.strokes[next]} color={c.success} /> : null}
          {ink.map((stroke, i) => (
            <Path key={`i${i}`} d={inkPath(stroke)} stroke={c.primary} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.85} />
          ))}
        </Svg>
      </View>

      <ProgressBar progress={progress} color={traced ? c.success : c.primary} accessibilityLabel={t('a11y.progress', { percent })} />
      <AppText variant="bodyBold" align="center" color={traced ? c.success : c.textMuted} accessibilityLiveRegion="polite">
        {message}
      </AppText>

      <View style={styles.row}>
        <View style={styles.cell}>
          <Button label={t('tracing.listen')} icon="speaker" variant="secondary" onPress={() => speakArabic(letter)} />
        </View>
        <View style={styles.cell}>
          <Button label={t('tracing.clear')} icon="refresh" variant="secondary" onPress={controller.clear} />
        </View>
      </View>
    </View>
  );
}

/** SVG path through the sampled points of a guide stroke. */
function guideStroke(points: readonly Point[]): string {
  return inkPath(points.filter((_, i) => i % 2 === 0 || i === points.length - 1));
}

/** Green start dot with an arrow in the writing direction. */
function StartMarker({ points, color }: { points: readonly Point[]; color: string }) {
  const start = points[0];
  const ahead = points[Math.min(points.length - 1, 6)];
  if (!start || !ahead) return null;
  const angle = Math.atan2(ahead.y - start.y, ahead.x - start.x);
  const tip = { x: start.x + Math.cos(angle) * 9, y: start.y + Math.sin(angle) * 9 };
  const wing = (turn: number) => `M${tip.x.toFixed(1)} ${tip.y.toFixed(1)} l${(Math.cos(angle + turn) * 4).toFixed(1)} ${(Math.sin(angle + turn) * 4).toFixed(1)}`;
  return (
    <>
      <Circle cx={start.x} cy={start.y} r={4.5} fill={color} />
      <Path d={`${wing(2.5)} ${wing(-2.5)}`} stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
    </>
  );
}
