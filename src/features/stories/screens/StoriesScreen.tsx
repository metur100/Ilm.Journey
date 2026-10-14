import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { SceneView } from '@/core/components/scene/SceneView';
import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { Icon } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { Stars } from '@/core/components/ui/Stars';
import { useFeedback } from '@/core/hooks/useFeedback';
import { makeStyles, radius, shadows, spacing, topicThemes, useTheme } from '@/core/theme';

import { ProphetName, prophetLabel } from '../components/ProphetName';
import { getStory, SCENES, STORIES } from '../content';
import { useStoriesI18n } from '../i18n';
import type { Story } from '../models';
import { averageScore, runProgress } from '../services/progress';
import { buildStoryFlow } from '../services/storyFlow';
import { completedStories, nextStory, storyStatus, unlockingStory } from '../services/unlocking';
import { useStoriesStore } from '../store/storiesStore';

const theme = topicThemes.prophets;

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: spacing.xxl },
  body: { padding: spacing.lg, gap: spacing.lg },
  flex: { flex: 1, gap: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroStats: { flexDirection: 'row', gap: spacing.sm },
  heroStat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  play: { width: 52, height: 52, borderRadius: 26, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' },
  mapIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: c.gold, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md },
  tile: {
    width: '48.5%',
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: c.border,
    ...shadows(c.shadow).card,
  },
  tileLocked: { backgroundColor: c.surfaceAlt },
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  dim: { opacity: 0.4 },
  tileBody: { padding: spacing.md, gap: 4, flexGrow: 1 },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accent,
  },
  badgeDone: { backgroundColor: c.success },
  badgeLocked: { backgroundColor: c.locked },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.sm },
  stat: { width: '48.5%', backgroundColor: c.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: c.border },
}));

/** Stories tab: continue / next story, the eight stories with progress and lock state, the story map. */
export default function StoriesScreen() {
  const { t, l } = useStoriesI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const progress = useStoriesStore((s) => s.stories);
  const run = useStoriesStore((s) => s.run);
  const learnedLessons = useStoriesStore((s) => s.learnedLessons);
  const completedScenes = useStoriesStore((s) => s.completedScenes);
  const perfectStories = useStoriesStore((s) => s.perfectStories);

  const runStory = run ? getStory(run.storyId) : undefined;
  const continueStory = runStory ?? nextStory(progress, STORIES);
  const completed = completedStories(progress, STORIES);
  const avg = averageScore({ stories: progress, completedScenes, learnedLessons, perfectStories, run }, STORIES);

  const openStory = (story: Story) => router.push({ pathname: '/story/[id]', params: { id: story.id } });

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <HeroHeader gradient={theme.gradient}>
        <AppText variant="display" color={c.onAccent} accessibilityRole="header">
          {t('tab.title')}
        </AppText>
        <AppText variant="body" color={c.onAccent}>
          {t('tab.subtitle')}
        </AppText>
        <View style={styles.heroStats}>
          <View style={styles.heroStat} accessible accessibilityLabel={`${t('progress.stories')}: ${completed.length}/${STORIES.length}`}>
            <AppText variant="title" color={c.onAccent}>
              {completed.length}/{STORIES.length}
            </AppText>
            <AppText variant="tiny" color={c.onAccent}>
              {t('progress.stories')}
            </AppText>
          </View>
          <View style={styles.heroStat} accessible accessibilityLabel={`${t('progress.lessons')}: ${learnedLessons.length}`}>
            <AppText variant="title" color={c.onAccent}>
              {learnedLessons.length}
            </AppText>
            <AppText variant="tiny" color={c.onAccent}>
              {t('progress.lessons')}
            </AppText>
          </View>
        </View>
      </HeroHeader>

      <View style={styles.body}>
        <SectionHeader title={runStory ? t('tab.continue') : t('tab.startNext')} />
        {continueStory ? (
          <Card
            padded={false}
            onPress={() =>
              runStory ? router.push({ pathname: '/story/play/[id]', params: { id: runStory.id } }) : openStory(continueStory)
            }
            accessibilityLabel={`${runStory ? t('tab.continue') : t('tab.startNext')}: ${prophetLabel(continueStory, l, t)}, ${l(continueStory.title)}`}
          >
            <SceneView scene={continueStory.cover} height={140} rounded={false} />
            <View style={styles.cardBody}>
              <View style={styles.flex}>
                <ProphetName story={continueStory} />
                <AppText variant="bodyBold" color={c.goldText}>
                  {l(continueStory.title)}
                </AppText>
                {runStory && run ? (
                  <>
                    <AppText variant="small" color={c.textMuted}>
                      {t('tab.continueStep', { current: run.stepIndex + 1, total: buildStoryFlow(runStory).length })}
                    </AppText>
                    <ProgressBar progress={runProgress(runStory, run.stepIndex)} color={theme.accent} height={8} />
                  </>
                ) : (
                  <AppText variant="small" color={c.textMuted}>
                    {l(continueStory.description)}
                  </AppText>
                )}
              </View>
              <View style={styles.play}>
                <Icon name="play" size={22} color={c.onAccent} />
              </View>
            </View>
          </Card>
        ) : (
          <Card tone="primary">
            <View style={styles.row}>
              <Icon name="trophy" size={26} color={c.primaryText} />
              <AppText variant="bodyBold" style={styles.flex}>
                {t('tab.allDone')}
              </AppText>
            </View>
          </Card>
        )}

        <Card tone="gold" onPress={() => router.push('/story/map')} accessibilityLabel={`${t('tab.mapCard')}. ${t('tab.mapCardBody')}`}>
          <View style={styles.row}>
            <View style={styles.mapIcon}>
              <Icon name="map" size={24} color={c.onGold} />
            </View>
            <View style={styles.flex}>
              <AppText variant="heading">{t('tab.mapCard')}</AppText>
              <AppText variant="small" color={c.textMuted}>
                {t('tab.mapCardBody')}
              </AppText>
            </View>
            <Icon name="chevron" size={20} color={c.textMuted} />
          </View>
        </Card>

        <SectionHeader title={t('tab.all')} />
        <View style={styles.grid}>
          {STORIES.map((story, index) => (
            <StoryTile key={story.id} story={story} number={index + 1} onPress={() => openStory(story)} />
          ))}
        </View>

        <SectionHeader title={t('tab.progress')} />
        <View style={styles.stats}>
          <Stat label={t('progress.stories')} value={`${completed.length}/${STORIES.length}`} />
          <Stat label={t('progress.scenes')} value={`${completedScenes.length}/${SCENES.length}`} />
          <Stat label={t('progress.lessons')} value={String(learnedLessons.length)} />
          <Stat label={t('progress.quiz')} value={`${avg}%`} />
        </View>
      </View>
    </ScrollView>
  );
}

function StoryTile({ story, number, onPress }: { story: Story; number: number; onPress: () => void }) {
  const { t, l } = useStoriesI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const progress = useStoriesStore((s) => s.stories);
  const run = useStoriesStore((s) => s.run);
  const status = storyStatus(story, progress, STORIES);
  const previous = unlockingStory(story, STORIES);
  const locked = status === 'locked';
  const inProgress = run?.storyId === story.id;
  const statusText =
    locked && previous
      ? t('map.lockedBecause', { name: l(previous.prophetName) })
      : inProgress
        ? t('map.inProgress')
        : status === 'completed'
          ? t('map.completed')
          : '';

  return (
    <Pressable
      onPress={() => {
        feedback.tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={[t('tab.storyNumber', { number }), prophetLabel(story, l, t), l(story.title), statusText].filter(Boolean).join('. ')}
      style={({ pressed }) => [styles.tile, locked && styles.tileLocked, pressed && styles.pressed]}
    >
      <View>
        <SceneView scene={{ sky: story.cover.sky, elements: [story.symbol] }} height={92} rounded={false} style={locked ? styles.dim : undefined} />
        <View style={[styles.badge, status === 'completed' && styles.badgeDone, locked && styles.badgeLocked]}>
          {status === 'completed' ? (
            <Icon name="check" size={16} color={c.onStatus} strokeWidth={3} />
          ) : locked ? (
            <Icon name="lock" size={14} color={c.onAccent} />
          ) : (
            <AppText variant="tiny" color={c.onAccent}>
              {number}
            </AppText>
          )}
        </View>
      </View>
      <View style={styles.tileBody}>
        <ProphetName story={story} variant="bodyBold" />
        <AppText variant="small" color={c.goldText} numberOfLines={2}>
          {l(story.title)}
        </AppText>
        {status === 'completed' ? <Stars count={progress[story.id]?.bestStars ?? 0} size={14} /> : null}
        {inProgress && run ? <ProgressBar progress={runProgress(story, run.stepIndex)} color={theme.accent} height={6} /> : null}
        {locked ? (
          <View style={styles.statusRow}>
            <Icon name="lock" size={12} color={c.textMuted} />
            <AppText variant="tiny" color={c.textMuted}>
              {t('common.locked')}
            </AppText>
          </View>
        ) : inProgress ? (
          <AppText variant="tiny" color={c.primaryText}>
            {t('map.inProgress')}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <AppText variant="title" color={c.primaryText}>
        {value}
      </AppText>
      <AppText variant="tiny" color={c.textMuted}>
        {label}
      </AppText>
    </View>
  );
}
