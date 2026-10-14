import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { speakArabic } from '@/core/services/speech';
import { fonts, makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { useQuestI18n } from '../i18n';
import { CANVAS_SIZE, EMPTY_TRACE, endStroke, extendStroke, isTraced, REQUIRED_LENGTH, startStroke, type TraceState, traceProgress } from '../services/tracing';

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
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  canvasDone: { borderColor: c.success },
  guideLayer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  guide: { fontFamily: fonts.arabic, fontSize: 170, lineHeight: 250, color: c.border, textAlign: 'center' },
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

/**
 * Tracing canvas (islam-quest TracingView): the letter is a large guide and the learner draws over it with a finger.
 * No animations are used, so it behaves the same with reduced motion. Screen-reader users can double-tap the canvas.
 */
export function TracingPad({ letter, onTraced, onChange }: TracingPadProps) {
  const { t } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const [trace, setTrace] = useState<TraceState>(EMPTY_TRACE);
  const notified = useRef(false);

  // Gesture handlers and actions are created once; they keep the current stroke in a local mutable buffer and
  // mirror it into React state for rendering.
  const [controller] = useState(() => {
    const buffer = { trace: EMPTY_TRACE };
    const apply = (next: TraceState) => {
      buffer.trace = next;
      setTrace(next);
    };
    return {
      responder: PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => apply(startStroke(buffer.trace, { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY })),
        onPanResponderMove: (e) => apply(extendStroke(buffer.trace, { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY })),
        onPanResponderRelease: () => apply(endStroke(buffer.trace)),
      }),
      clear: () => apply(EMPTY_TRACE),
      /** Screen readers: double-tap counts as traced (touch exploration cannot draw). */
      markTraced: () => apply({ ...buffer.trace, length: Math.max(buffer.trace.length, REQUIRED_LENGTH) }),
    };
  });

  // Report progress to the parent; onTraced fires once per letter (again after clearing).
  useEffect(() => {
    const done = isTraced(trace);
    onChange?.(done);
    if (!done) notified.current = false;
    else if (!notified.current) {
      notified.current = true;
      onTraced?.();
    }
  }, [trace, onChange, onTraced]);

  const traced = isTraced(trace);
  const percent = Math.round(traceProgress(trace) * 100);

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
          if (event.nativeEvent.actionName === 'activate') controller.markTraced();
        }}
      >
        {/* Not touchable: touch coordinates (locationX/Y) must be relative to the canvas, not to the guide letter. */}
        <View style={styles.guideLayer} pointerEvents="none">
          <AppText style={styles.guide} accessibilityElementsHidden importantForAccessibility="no">
            {letter}
          </AppText>
        </View>
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          {trace.paths.map((d, i) => (
            <Path key={i} d={d} stroke={c.primary} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.85} />
          ))}
        </Svg>
      </View>

      <ProgressBar progress={traceProgress(trace)} color={traced ? c.success : c.primary} accessibilityLabel={t('a11y.progress', { percent })} />
      <AppText variant="bodyBold" align="center" color={traced ? c.success : c.textMuted} accessibilityLiveRegion="polite">
        {traced ? t('tracing.great') : t('tracing.keepGoing')}
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
