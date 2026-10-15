import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

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
 */
export function JourneyPath({ onOpen }: { onOpen: (story: Story) => void }) {
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
              <Stop key={story.id} story={story} width={width} onPress={() => onOpen(story)} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function PartPath({ stories, width }: { stories: Story[]; width: number }) {
  const { c } = useTheme();
  const progress = useStoriesStore((s) => s.stories);
  const top = 0;
  const pts = stories.map((s, i) => [sideOf(s) * width, top + i * ROW + ROW / 2] as [number, number]);
  if (pts.length < 2) return null;
  // Gentle S-curves between the medallions.
  const curve = (from: number, to: number) => {
    const list = pts.slice(from, to + 1);
    let d = `M${list[0][0]} ${list[0][1]}`;
    for (let i = 1; i < list.length; i++) {
      const [x0, y0] = list[i - 1];
      const [x1, y1] = list[i];
      const my = (y0 + y1) / 2;
      d += `C${x0} ${my} ${x1} ${my} ${x1} ${y1}`;
    }
    return d;
  };
  let done = -1;
  stories.forEach((s, i) => {
    if (progress[s.id]?.completed && done === i - 1) done = i;
  });
  const height = top + stories.length * ROW;
  return (
    <Svg pointerEvents="none" width={width} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
      <Path d={curve(0, pts.length - 1)} stroke={c.border} strokeWidth={5} strokeDasharray="2 10" strokeLinecap="round" fill="none" />
      {done >= 1 ? <Path d={curve(0, done)} stroke={c.gold} strokeWidth={5} strokeLinecap="round" fill="none" /> : null}
    </Svg>
  );
}

function Stop({ story, width, onPress }: { story: Story; width: number; onPress: () => void }) {
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
          {current ? <Halo left={cx} /> : null}
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

/** Soft breathing halo behind the story you are at (still under reduced motion). */
function Halo({ left }: { left: number }) {
  const styles = useStyles();
  const reduced = useReducedMotion();
  const v = useSharedValue(0.5);
  useEffect(() => {
    if (reduced) {
      v.value = 0.5;
      return undefined;
    }
    v.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }), -1, true);
    return () => cancelAnimation(v);
  }, [reduced, v]);
  const style = useAnimatedStyle(() => ({ opacity: 0.12 + 0.18 * v.value, transform: [{ scale: 0.9 + 0.12 * v.value }] }));
  return <Animated.View pointerEvents="none" style={[styles.halo, { left }, style]} />;
}
