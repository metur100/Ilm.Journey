import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeInDown, runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Art, hasArt } from '../../../art';
import { AppText } from '../../../components/ui/AppText';
import { Button } from '../../../components/ui/Button';
import { fonts, radius, spacing } from '../../../theme';
import { ChallengeClock, HintPointer, InlineCaption, ProgressDots } from '../board';
import { useEngineCore } from '../engine';
import { Burst, useShake } from '../fx';
import { useMeasure } from '../layout';
import { FaceView, faceLabel, Tile } from '../primitives';
import { useKitProbe } from '../probe';
import type { EngineProps, KitItem, KitText } from '../types';

const CARD_RADIUS = radius.lg;

export interface TimelineMark {
  id: string;
  label: KitText;
}

export interface TimelineEvent extends KitItem {
  /** Id of the mark it belongs to. */
  mark: string;
}

export interface TimelineSliderProps extends EngineProps {
  /** Ticks in time order (years, eras, steps of a story). */
  marks: TimelineMark[];
  /** Events, placed one after another. */
  events: TimelineEvent[];
}

const HANDLE = 44;

/**
 * TimelineSlider – one event card at a time: slide the marker along the timeline (or tap a tick) and place it. Right:
 * the event is pinned above its tick. Wrong: "earlier" / "later" and a soft shake – try again.
 */
export function TimelineSlider(props: TimelineSliderProps) {
  const { marks, events } = props;
  const core = useEngineCore(props, events.length);
  const { env, k, reduced } = core;
  const [eventIndex, setEventIndex] = useState(0);
  const [markIndex, setMarkIndex] = useState(Math.floor(marks.length / 2));
  const [pinned, setPinned] = useState<string[]>([]);
  const area = useMeasure();
  const { style: shakeStyle, shake } = useShake(reduced);
  const testID = props.testID ?? 'timeline-slider';
  const done = pinned.length === events.length;
  const event = events[Math.min(eventIndex, events.length - 1)];
  const label = (i: KitItem) => faceLabel(i, env.text);

  const pad = 26;
  const lineW = Math.max(100, (area.w || 320) - pad * 2);
  const stepX = marks.length > 1 ? lineW / (marks.length - 1) : 0;
  const xOf = (i: number) => pad + i * stepX;
  const handleX = useSharedValue(xOf(markIndex));
  useEffect(() => {
    handleX.set(reduced ? xOf(markIndex) : withSpring(xOf(markIndex), { damping: 15, stiffness: 200 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markIndex, stepX, reduced]);

  const place = (at = markIndex) => {
    if (core.finishedRef.current || done) return;
    const right = marks.findIndex((m) => m.id === event.mark);
    if (at !== right) {
      core.wrong(event.id, at > right ? env.kt('timeline.earlier') : env.kt('timeline.later'));
      shake();
      return;
    }
    const next = [...pinned, event.id];
    setPinned(next);
    core.progress(next.length);
    core.right({ caption: env.kt('timeline.placed', { label: label(event), mark: env.text(marks[right].label) }) });
    if (next.length === events.length) core.finish(900);
    else setEventIndex((i) => i + 1);
  };

  const markIndexShared = useSharedValue(markIndex);
  useEffect(() => {
    markIndexShared.set(markIndex);
  }, [markIndex, markIndexShared]);
  const geo = { pad, stepX, n: marks.length };
  const pan = Gesture.Pan()
    .minDistance(2)
    .onUpdate((e) => {
      'worklet';
      const x = Math.max(geo.pad, Math.min(geo.pad + geo.stepX * (geo.n - 1), e.x));
      handleX.set(x);
      const i = geo.stepX > 0 ? Math.round((x - geo.pad) / geo.stepX) : 0;
      runOnJS(setMarkIndex)(i);
    })
    .onEnd(() => {
      'worklet';
      handleX.set(withSpring(geo.pad + markIndexShared.value * geo.stepX, { damping: 15, stiffness: 200 }));
    });
  const handleStyle = useAnimatedStyle(() => ({ transform: [{ translateX: handleX.value - HANDLE / 2 }] }));

  useKitProbe({
    engine: 'TimelineSlider',
    testID,
    step: () => {
      if (done) return false;
      const right = marks.findIndex((m) => m.id === event.mark);
      setMarkIndex(right);
      place(right);
      return true;
    },
    mistake: () => {
      if (done) return false;
      const right = marks.findIndex((m) => m.id === event.mark);
      place(right === 0 ? 1 : 0);
      return true;
    },
    done: () => done,
  });

  return (
    <View style={styles.root} testID={testID}>
      {core.challenge ? <ChallengeClock ms={core.stopwatch.ms} /> : null}
      {events.length > 1 ? <ProgressDots total={events.length} done={pinned.length} /> : null}
      <View style={styles.cardArea}>
        {!done ? (
          <Animated.View key={event.id} entering={reduced ? FadeIn : FadeInDown.springify().damping(14)}>
            {/* The shake lives on an inner view: a layout animation would overwrite its transform. */}
            <Animated.View style={shakeStyle}>
              <Tile state="selected" minHeight={96} padding={spacing.md} style={styles.card}>
                <FaceView face={event} row={!!event.art} artSize={64} variant="bodyBold" numberOfLines={3} align={event.art ? 'left' : 'center'} />
              </Tile>
            </Animated.View>
          </Animated.View>
        ) : (
          <Burst trigger={1} distance={80} size={16} />
        )}
      </View>
      <GestureDetector gesture={pan}>
        <View style={styles.timeline} onLayout={area.onLayout} collapsable={false}>
          {/* pinned events above their ticks */}
          {events
            .filter((e) => pinned.includes(e.id))
            .map((e) => {
              const i = marks.findIndex((m) => m.id === e.mark);
              const stack = events.filter((x) => pinned.includes(x.id) && x.mark === e.mark).indexOf(e);
              return (
                <Animated.View key={e.id} entering={reduced ? FadeIn : FadeInDown.springify()} style={[styles.pin, { left: xOf(i) - 22, top: 6 + stack * 6 }]} pointerEvents="none">
                  {e.art && hasArt(e.art) ? <Art name={e.art} size={34} /> : <Art name="kit.pin" size={26} />}
                </Animated.View>
              );
            })}
          <View style={[styles.line, { left: pad, width: lineW, backgroundColor: k.accentSoft, borderColor: k.accent }]} />
          {marks.map((m, i) => (
            <Pressable
              key={m.id}
              onPress={() => {
                setMarkIndex(i);
                core.touch();
              }}
              accessibilityRole="button"
              accessibilityLabel={env.kt('timeline.handle', { label: env.text(m.label) })}
              accessibilityState={{ selected: i === markIndex }}
              testID={`timeline-mark-${m.id}`}
              style={[styles.tickHit, { left: xOf(i) - Math.max(22, stepX / 2), width: Math.max(44, stepX) }]}
            >
              <View style={[styles.tick, { backgroundColor: i === markIndex ? k.gold : k.accent }]} />
              <AppText variant="tiny" color={i === markIndex ? k.text : k.textMuted} numberOfLines={2} align="center" style={[styles.tickLabel, i % 2 && marks.length > 5 ? { marginTop: 18 } : null, { fontFamily: i === markIndex ? fonts.heavy : fonts.semibold }]}>
                {env.text(m.label)}
              </AppText>
            </Pressable>
          ))}
          <Animated.View style={[styles.handle, { backgroundColor: k.gold, borderColor: k.tileFace, shadowColor: k.shadow }, handleStyle]} pointerEvents="none">
            <View style={[styles.handleDot, { backgroundColor: k.onGold }]} />
          </Animated.View>
          {core.hintsOn && core.idle && !done ? <HintPointer from={{ x: xOf(markIndex), y: 66 }} to={{ x: xOf(Math.min(marks.length - 1, markIndex + 1)), y: 66 }} /> : null}
        </View>
      </GestureDetector>
      <InlineCaption text={core.caption?.text} tone={core.caption?.tone} />
      <View testID="kit-place">
        <Button label={env.kt('timeline.place')} icon="pin" variant="gold" onPress={() => place()} disabled={done} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: spacing.sm },
  cardArea: { flex: 1, justifyContent: 'center', minHeight: 110 },
  card: { alignSelf: 'center', minWidth: 220, maxWidth: '100%', borderRadius: CARD_RADIUS },
  timeline: { height: 130 },
  line: { position: 'absolute', top: 60, height: 12, borderRadius: 6, borderWidth: 2 },
  pin: { position: 'absolute', width: 44, alignItems: 'center' },
  tickHit: { position: 'absolute', top: 50, height: 80, alignItems: 'center' },
  tick: { width: 4, height: 30, borderRadius: 2 },
  tickLabel: { marginTop: 8 },
  handle: { position: 'absolute', top: 44, left: 0, width: HANDLE, height: HANDLE, borderRadius: HANDLE / 2, borderWidth: 4, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.25, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  handleDot: { width: 10, height: 10, borderRadius: 5 },
});

