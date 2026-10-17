import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { Art, hasArt } from '@/core/art';
import { SceneView } from '@/core/components/scene/SceneView';
import { AppText } from '@/core/components/ui/AppText';
import { Icon } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { Stars } from '@/core/components/ui/Stars';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useReducedMotion } from '@/core/hooks/useReducedMotion';
import { makeStyles, radius, shadows, spacing, topicThemes, useTheme } from '@/core/theme';

import { STORIES } from '../content';
import { useStoriesI18n } from '../i18n';
import type { Story } from '../models';
import { runProgress } from '../services/progress';
import { storyStatus, unlockingStory, type StoryStatus } from '../services/unlocking';
import { useStoriesStore } from '../store/storiesStore';
import { prophetLabel, ProphetName } from './ProphetName';

const theme = topicThemes.prophets;

/** Parts of the journey by canonical order (GAMES-V3 §3.4): Adam–Salih, Ibrahim–Yusuf, Ayyub–Dhul-Kifl, Dawud–Isa, Muhammad ﷺ. */
export const JOURNEY_PARTS: readonly [number, number][] = [
  [1, 5],
  [6, 11],
  [12, 16],
  [17, 24],
  [25, 25],
];

/** Registered stories grouped into the journey parts (parts without stories are left out). */
export function journeyParts(stories: readonly Story[]): { part: number; stories: Story[] }[] {
  const sorted = [...stories].sort((a, b) => a.order - b.order);
  return JOURNEY_PARTS.map(([from, to], i) => ({ part: i + 1, stories: sorted.filter((s) => s.order >= from && s.order <= to) })).filter((p) => p.stories.length > 0);
}

const ROW = 118;
const MEDAL = 78;
/** Medallion centre as a fraction of the width – alternates by the story's order, so the path winds. */
const sideOf = (story: Story) => (story.order % 2 === 1 ? 0.24 : 0.76);

const useStyles = makeStyles((c) => ({
  part: { gap: spacing.xs },
  partHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  partBadge: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: theme.accent },
  rule: { flex: 1, height: 1, backgroundColor: c.border },
  row: { height: ROW, justifyContent: 'center' },
  medal: {
    position: 'absolute',
    width: MEDAL,
    height: MEDAL,
    borderRadius: MEDAL / 2,
    marginLeft: -MEDAL / 2,
    top: (ROW - MEDAL) / 2,
    backgroundColor: c.surface,
    borderWidth: 3,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows(c.shadow).card,
  },
  medalDone: { borderColor: c.gold },
  medalCurrent: { borderColor: theme.accent, borderWidth: 4 },
  medalLocked: { backgroundColor: c.surfaceAlt },
  halo: {
    position: 'absolute',
    width: MEDAL + 26,
    height: MEDAL + 26,
    borderRadius: (MEDAL + 26) / 2,
    marginLeft: -(MEDAL + 26) / 2,
    top: (ROW - MEDAL - 26) / 2,
    backgroundColor: theme.accent,
  },
  badge: {
    position: 'absolute',
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 5,
    marginLeft: MEDAL / 2 - 22,
    top: (ROW - MEDAL) / 2 - 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accent,
    borderWidth: 2,
    borderColor: c.background,
  },
  badgeDone: { backgroundColor: c.success },
  badgeLocked: { backgroundColor: c.locked },
  text: { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center', gap: 2 },
  hereTag: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: c.goldSoft, borderWidth: 1, borderColor: c.goldBorder },
  dim: { opacity: 0.42 },
  pressed: { opacity: 0.85 },
  sceneClip: { width: MEDAL, height: MEDAL },
}));

/**
 * The Stories tab's journey: a winding path from Adam to Muhammad ﷺ through every registered story, in parts, with
 * each story's symbol in a medallion (never a person), its state (done / you are here / locked) and progress.
 * `paused` stops the halo loop while the screen is hidden.
 */
export function JourneyPath({ onOpen, paused = false }: { onOpen: (story: Story) => void; paused?: boolean }) {
  const { t, l } = useStoriesI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const [width, setWidth] = useState(0);
  const parts = journeyParts(STORIES);

  return (
    <View onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))} style={styles.part}>
      {parts.map(({ part, stories }) => (
        <View key={part}>
          <View style={styles.partHeader}>
            <View style={styles.partBadge}>
              <AppText variant="tiny" color={c.onAccent}>
                {t('journey.part', { number: part }).toUpperCase()}
              </AppText>
            </View>
            <AppText variant="bodyBold" color={c.textMuted}>
              {stories.length > 1
                ? t('journey.range', { first: l(stories[0].prophetName), last: l(stories[stories.length - 1].prophetName) })
                : l(stories[0].prophetName)}
            </AppText>
            <View style={styles.rule} />
          </View>
          <View>
            {width > 0 ? <PartPath stories={stories} width={width} /> : null}
            {stories.map((story) => (
              <Stop key={story.id} story={story} width={width} paused={paused} onPress={() => onOpen(story)} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/** Stroke of the path (dp) and the distance between its dots. */
const STROKE = 5;
const DOT_STEP = 12;
const LINE_STEP = 16;

type PathPoint = { x: number; y: number; angle: number };

/**
 * Points every `step` dp along a gentle S-curve between two medallions (cubic Bézier with vertical tangents), with the
 * direction of the curve at each point.
 */
export function curvePoints(from: [number, number], to: [number, number], step: number): PathPoint[] {
  const [x0, y0] = from;
  const [x1, y1] = to;
  const my = (y0 + y1) / 2;
  const at = (t: number) => {
    const u = 1 - t;
    return [u * u * u * x0 + 3 * u * u * t * x0 + 3 * u * t * t * x1 + t * t * t * x1, u * u * u * y0 + 3 * u * u * t * my + 3 * u * t * t * my + t * t * t * y1];
  };
  const fine = Array.from({ length: 65 }, (_, i) => at(i / 64));
  const points: PathPoint[] = [];
  let walked = 0;
  let next = 0;
  for (let i = 1; i < fine.length; i++) {
    const [ax, ay] = fine[i - 1];
    const [bx, by] = fine[i];
    const len = Math.hypot(bx - ax, by - ay);
    const angle = Math.atan2(by - ay, bx - ax);
    while (next <= walked + len) {
      const k = len > 0 ? (next - walked) / len : 0;
      points.push({ x: ax + (bx - ax) * k, y: ay + (by - ay) * k, angle });
      next += step;
    }
    walked += len;
  }
  return points;
}

/**
 * The winding path between the medallions: a dotted line, gold where the stories are done. Drawn with plain views, not
 * an SVG: react-native-svg rasterises every canvas into a bitmap (again each time the tab is shown), and a canvas as
 * tall as the whole journey cost hundreds of milliseconds per visit of the Stories tab.
 */
function PartPath({ stories, width }: { stories: Story[]; width: number }) {
  const { c } = useTheme();
  const progress = useStoriesStore((s) => s.stories);
  let done = -1;
  stories.forEach((s, i) => {
    if (progress[s.id]?.completed && done === i - 1) done = i;
  });

  const { dots, line } = useMemo(() => {
    const pts = stories.map((s, i) => [sideOf(s) * width, i * ROW + ROW / 2] as [number, number]);
    const segments = pts.slice(1).map((to, i) => [pts[i], to] as const);
    return {
      dots: segments.flatMap(([from, to]) => curvePoints(from, to, DOT_STEP)),
      // Short straight pieces along the done part; their round ends join into one smooth line.
      line: segments.slice(0, Math.max(0, done)).flatMap(([from, to]) => {
        const p = curvePoints(from, to, LINE_STEP);
        const last = p[p.length - 1];
        if (Math.hypot(to[0] - last.x, to[1] - last.y) > 0.5) p.push({ x: to[0], y: to[1], angle: last.angle });
        return p.slice(1).map((b, i) => ({ a: p[i], b }));
      }),
    };
  }, [stories, width, done]);

  if (stories.length < 2) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width, height: stories.length * ROW }}>
      {dots.map((p, i) => (
        <View
          key={`d${i}`}
          style={{
            position: 'absolute',
            left: p.x - (STROKE + 2) / 2,
            top: p.y - STROKE / 2,
            width: STROKE + 2,
            height: STROKE,
            borderRadius: STROKE / 2,
            backgroundColor: c.border,
            transform: [{ rotate: `${p.angle}rad` }],
          }}
        />
      ))}
      {line.map(({ a, b }, i) => {
        const len = Math.hypot(b.x - a.x, b.y - a.y) + STROKE;
        return (
          <View
            key={`l${i}`}
            style={{
              position: 'absolute',
              left: (a.x + b.x) / 2 - len / 2,
              top: (a.y + b.y) / 2 - STROKE / 2,
              width: len,
              height: STROKE,
              borderRadius: STROKE / 2,
              backgroundColor: c.gold,
              transform: [{ rotate: `${Math.atan2(b.y - a.y, b.x - a.x)}rad` }],
            }}
          />
        );
      })}
    </View>
  );
}

function Stop({ story, width, paused, onPress }: { story: Story; width: number; paused: boolean; onPress: () => void }) {
  const { t, l } = useStoriesI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const progress = useStoriesStore((s) => s.stories);
  const run = useStoriesStore((s) => s.run);
  const status: StoryStatus = storyStatus(story, progress, STORIES);
  const previous = unlockingStory(story, STORIES);
  const locked = status === 'locked';
  const done = status === 'completed';
  const current = status === 'available';
  const inProgress = run?.storyId === story.id;
  const side = sideOf(story);
  const cx = side * width;
  const textStyle = side < 0.5 ? { left: cx + MEDAL / 2 + spacing.md, right: 0 } : { left: 0, right: width - cx + MEDAL / 2 + spacing.md, alignItems: 'flex-end' as const };
  const statusText = locked && previous ? t('map.lockedBecause', { name: l(previous.prophetName) }) : inProgress ? t('map.inProgress') : done ? t('map.completed') : current ? t('journey.here') : '';

  return (
    <Pressable
      onPress={() => {
        feedback.tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={[t('tab.storyNumber', { number: story.order }), prophetLabel(story, l, t), l(story.title), statusText].filter(Boolean).join('. ')}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {width > 0 ? (
        <>
          {current ? <Halo left={cx} paused={paused} /> : null}
          <View style={[styles.medal, { left: cx }, done && styles.medalDone, current && styles.medalCurrent, locked && styles.medalLocked]}>
            <Symbol story={story} dim={locked} />
          </View>
          <View style={[styles.badge, { left: cx }, done && styles.badgeDone, locked && styles.badgeLocked]}>
            {done ? (
              <Icon name="check" size={14} color={c.onStatus} strokeWidth={3} />
            ) : locked ? (
              <Icon name="lock" size={12} color={c.onAccent} />
            ) : (
              <AppText variant="tiny" color={c.onAccent}>
                {story.order}
              </AppText>
            )}
          </View>
          <View style={[styles.text, textStyle]}>
            <ProphetName story={story} variant="bodyBold" />
            <AppText variant="small" color={locked ? c.textMuted : c.goldText} numberOfLines={2} align={side < 0.5 ? 'left' : 'right'}>
              {l(story.title)}
            </AppText>
            {done ? <Stars count={progress[story.id]?.bestStars ?? 0} size={14} /> : null}
            {inProgress && run ? (
              <View style={{ width: '80%' }}>
                <ProgressBar progress={runProgress(story, run.stepIndex)} color={theme.accent} height={6} />
              </View>
            ) : current ? (
              <View style={styles.hereTag}>
                <AppText variant="tiny" color={c.goldText}>
                  {t('journey.here')}
                </AppText>
              </View>
            ) : null}
          </View>
        </>
      ) : null}
    </Pressable>
  );
}

function Symbol({ story, dim }: { story: Story; dim: boolean }) {
  const styles = useStyles();
  if (story.symbolArt && hasArt(story.symbolArt)) {
    return (
      <View style={dim ? styles.dim : undefined}>
        <Art name={story.symbolArt} size={MEDAL - 22} height={MEDAL - 22} />
      </View>
    );
  }
  return (
    <View style={[styles.sceneClip, dim && styles.dim]}>
      <SceneView scene={{ sky: story.cover.sky, elements: [story.symbol] }} height={MEDAL} rounded={false} />
    </View>
  );
}

/** Soft breathing halo behind the story you are at (still under reduced motion and while paused). */
function Halo({ left, paused }: { left: number; paused: boolean }) {
  const styles = useStyles();
  const reduced = useReducedMotion();
  const v = useSharedValue(0.5);
  useEffect(() => {
    if (reduced || paused) {
      v.value = 0.5;
      return undefined;
    }
    v.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }), -1, true);
    return () => cancelAnimation(v);
  }, [reduced, paused, v]);
  const style = useAnimatedStyle(() => ({ opacity: 0.12 + 0.18 * v.value, transform: [{ scale: 0.9 + 0.12 * v.value }] }));
  return <Animated.View pointerEvents="none" style={[styles.halo, { left }, style]} />;
}
