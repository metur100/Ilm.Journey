import { View } from 'react-native';

import type { StageSpec } from '@/core/components/scene/stage';
import { StoryStage } from '@/core/components/scene/StoryStage';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { SourceList } from '@/core/components/ui/SourceList';
import type { LocalizedText, SceneSpec, SourceRef } from '@/core/models';
import { useReadAloud } from '@/core/hooks/useReadAloud';
import { makeStyles, radius, spacing, topicThemes, useTheme } from '@/core/theme';

import { useStoriesI18n } from '../i18n';
import type { StoryLesson } from '../models';

const useStyles = makeStyles((c) => ({
  root: { gap: spacing.lg },
  page: { backgroundColor: c.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: c.goldBorder },
  lesson: { backgroundColor: c.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: c.border },
  lessonHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  number: { width: 34, height: 34, borderRadius: 17, backgroundColor: topicThemes.prophets.accent, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  example: { backgroundColor: c.primarySoft, borderRadius: radius.md, padding: spacing.md, gap: 2 },
  reflection: { flexDirection: 'row', gap: spacing.sm, backgroundColor: c.goldSoft, borderRadius: radius.md, padding: spacing.md },
}));

interface StoryPageProps {
  label: string;
  title?: LocalizedText;
  body: LocalizedText;
  scene: SceneSpec;
  /** Animated illustration (falls back to an animated `scene`). */
  stage?: StageSpec;
  sources?: SourceRef[];
  large?: boolean;
}

/** A story page: animated illustration (never a depiction of a prophet), narration text and Listen (device voice). */
export function StoryPage({ label, title, body, scene, stage, sources, large }: StoryPageProps) {
  const { t, l, language } = useStoriesI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const listen = useReadAloud(language);
  const text = [title ? l(title) : '', l(body)].filter(Boolean).join('. ');
  return (
    <View style={styles.root}>
      <StoryStage stage={stage} scene={scene} height={large ? 250 : 220} />
      <View style={styles.page}>
        <AppText variant="label" color={c.goldText}>
          {label.toUpperCase()}
        </AppText>
        {title ? (
          <AppText variant="title" accessibilityRole="header">
            {l(title)}
          </AppText>
        ) : null}
        <Button
          label={t(listen.state === 'preparing' ? 'player.listenPreparing' : listen.state === 'speaking' ? 'player.listenStop' : 'player.listen')}
          icon={listen.speaking ? 'stop' : 'speaker'}
          variant={listen.speaking ? 'secondary' : 'ghost'}
          onPress={() => listen.toggle(text)}
        />
        <AppText variant="reading">{l(body)}</AppText>
      </View>
      <SourceList sources={sources} />
    </View>
  );
}

/** "What did we learn?" – each lesson with explanation, practical example and reflection question. */
export function LessonsView({ lessons, sources }: { lessons: StoryLesson[]; sources?: SourceRef[] }) {
  const { t, l } = useStoriesI18n();
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.root}>
      <AppText variant="title" accessibilityRole="header">
        {t('player.lessonsTitle')}
      </AppText>
      {lessons.map((lesson, index) => (
        <View key={lesson.id} style={styles.lesson}>
          <View style={styles.lessonHeader}>
            <View style={styles.number}>
              <AppText variant="bodyBold" color={c.onAccent}>
                {index + 1}
              </AppText>
            </View>
            <AppText variant="heading" style={styles.flex} accessibilityRole="header">
              {l(lesson.title)}
            </AppText>
          </View>
          <AppText variant="body">{l(lesson.explanation)}</AppText>
          <View style={styles.example}>
            <AppText variant="label" color={c.primaryText}>
              {t('player.example').toUpperCase()}
            </AppText>
            <AppText variant="body">{l(lesson.example)}</AppText>
          </View>
          <View style={styles.reflection}>
            <Icon name="sparkle" size={18} color={c.goldText} />
            <View style={styles.flex}>
              <AppText variant="label" color={c.goldText}>
                {t('player.reflection').toUpperCase()}
              </AppText>
              <AppText variant="bodyBold">{l(lesson.reflection)}</AppText>
            </View>
          </View>
        </View>
      ))}
      <SourceList sources={sources} />
    </View>
  );
}
