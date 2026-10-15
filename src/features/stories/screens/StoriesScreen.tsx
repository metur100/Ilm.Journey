import { router, useIsFocused } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { StoryStage } from '@/core/components/scene/StoryStage';
import { AppText } from '@/core/components/ui/AppText';
import { Card } from '@/core/components/ui/Card';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { Icon } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { makeStyles, radius, spacing, topicThemes, useTheme } from '@/core/theme';

import { JourneyPath } from '../components/JourneyPath';
import { ProphetName, prophetLabel } from '../components/ProphetName';
import { getStory, SCENES, STORIES } from '../content';
import { useStoriesI18n } from '../i18n';
import type { Story } from '../models';
import { averageScore, runProgress } from '../services/progress';
import { buildStoryFlow } from '../services/storyFlow';
import { completedStories, nextStory } from '../services/unlocking';
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
  journeyIntro: { gap: 2 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.sm },
  stat: { width: '48.5%', backgroundColor: c.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: c.border },
}));

/** Stories tab: continue / next story, the story map and the journey of the prophets from Adam to Muhammad ﷺ. */
export default function StoriesScreen() {
  const { t, l } = useStoriesI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const progress = useStoriesStore((s) => s.stories);
  const run = useStoriesStore((s) => s.run);
  const learnedLessons = useStoriesStore((s) => s.learnedLessons);
  const completedScenes = useStoriesStore((s) => s.completedScenes);
  const perfectStories = useStoriesStore((s) => s.perfectStories);
  const focused = useIsFocused();

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
            <StoryStage stage={continueStory.coverStage} scene={continueStory.cover} height={150} rounded={false} paused={!focused} camera="slowZoom" />
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

        <View style={styles.journeyIntro}>
          <SectionHeader title={t('journey.title')} />
          <AppText variant="small" color={c.textMuted}>
            {t('journey.subtitle')} {t('journey.count', { done: completed.length, total: STORIES.length })}
          </AppText>
        </View>
        <JourneyPath onOpen={openStory} />
        {STORIES.length < 25 ? (
          <AppText variant="small" color={c.textMuted} align="center">
            {t('journey.more')}
          </AppText>
        ) : null}

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
