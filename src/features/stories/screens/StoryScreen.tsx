import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { SceneView } from '@/core/components/scene/SceneView';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Card } from '@/core/components/ui/Card';
import { HeroHeader } from '@/core/components/ui/HeroHeader';
import { Icon } from '@/core/components/ui/Icon';
import { LockedContent } from '@/core/components/ui/LockedContent';
import { Screen } from '@/core/components/ui/Screen';
import { SectionHeader } from '@/core/components/ui/SectionHeader';
import { SourceList } from '@/core/components/ui/SourceList';
import { Stars } from '@/core/components/ui/Stars';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { makeStyles, spacing, topicThemes, useTheme } from '@/core/theme';

import { ProphetName } from '../components/ProphetName';
import { getStory, STORIES } from '../content';
import { useStoriesI18n } from '../i18n';
import { storyStatus, unlockingStory } from '../services/unlocking';
import { useStoriesStore } from '../store/storiesStore';

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
  scroll: { paddingBottom: spacing.xxl },
  topBar: { marginHorizontal: -spacing.lg, marginTop: -spacing.lg },
  body: { padding: spacing.lg, gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 4 },
  flex: { flex: 1 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
}));

/** Story overview: cover, description, place, lessons and sources; start / continue / read again. */
export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, l } = useStoriesI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const progress = useStoriesStore((s) => s.stories);
  const run = useStoriesStore((s) => s.run);
  const learnedLessons = useStoriesStore((s) => s.learnedLessons);
  const story = getStory(String(id));

  if (!story) {
    return (
      <Screen header={<TopBar />}>
        <EmptyState icon="scroll" title={t('story.notFound')} />
      </Screen>
    );
  }

  const status = storyStatus(story, progress, STORIES);
  const previous = unlockingStory(story, STORIES);
  const resumable = run?.storyId === story.id;
  const play = () => router.push({ pathname: '/story/play/[id]', params: { id: story.id } });

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      <HeroHeader gradient={topicThemes.prophets.gradient}>
        <View style={styles.topBar}>
          <TopBar dark />
        </View>
        <SceneView scene={story.cover} height={200} />
        <ProphetName story={story} variant="title" dark />
        <AppText variant="heading" color={c.gold} accessibilityRole="header">
          {l(story.title)}
        </AppText>
        <AppText variant="body" color={c.onAccent}>
          {l(story.description)}
        </AppText>
        {status === 'completed' ? <Stars count={progress[story.id]?.bestStars ?? 0} size={22} dark /> : null}
      </HeroHeader>

      <View style={styles.body}>
        {status === 'locked' && previous ? (
          <LockedContent message={t('map.lockedBecause', { name: l(previous.prophetName) })} />
        ) : (
          <Button
            label={resumable ? t('story.resume') : status === 'completed' ? t('story.replay') : t('story.start')}
            icon="play"
            variant="gold"
            size="lg"
            fullWidth
            onPress={play}
          />
        )}

        <SectionHeader title={t('story.overview')} />
        <Card>
          <View style={styles.row}>
            <Icon name="map" size={20} color={c.primaryText} />
            <AppText variant="body" style={styles.flex}>
              {t('story.place')}: {l(story.place)}
            </AppText>
          </View>
          <View style={styles.row}>
            <Icon name="scroll" size={20} color={c.primaryText} />
            <AppText variant="body" style={styles.flex}>
              {t('story.scenes', { count: story.scenes.length })}
            </AppText>
          </View>
          <View style={styles.row}>
            <Icon name="info" size={20} color={c.textMuted} />
            <AppText variant="small" color={c.textMuted} style={styles.flex}>
              {t('story.symbolNote')}
            </AppText>
          </View>
        </Card>

        <SectionHeader title={t('story.lessons')} />
        {story.lessons.map((lesson) => (
          <Card key={lesson.id} tone="gold">
            <View style={styles.lessonRow}>
              <Icon name={learnedLessons.includes(lesson.id) ? 'check' : 'sparkle'} size={18} color={c.goldText} />
              <AppText variant="bodyBold" style={styles.flex}>
                {l(lesson.title)}
              </AppText>
            </View>
          </Card>
        ))}

        <SourceList sources={story.sources} />
      </View>
    </ScrollView>
  );
}
