import { useEffect, useMemo } from 'react';
import { View } from 'react-native';

import { buildLessonCards, TOPIC_FALLBACK_ART } from '@/core/components/lesson/cards';
import { LessonCards } from '@/core/components/lesson/LessonCards';
import { SceneView } from '@/core/components/scene/SceneView';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { DifferenceNote, SourceList } from '@/core/components/ui/SourceList';
import { deviceNarration, stopSpeaking } from '@/core/services/speech';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, spacing, topicThemes, useTheme } from '@/core/theme';

import { questCardSources } from '../../content/artMap';
import { useQuestI18n } from '../i18n';
import type { QuestLesson } from '../models';

const useStyles = makeStyles(() => ({
  root: { gap: spacing.lg },
  titleBlock: { gap: spacing.xs },
}));

/** Reader for a short islam-quest lesson: lesson cards (with Arabic pronunciation where present), notes and sources. */
export function QuestLessonView({ lesson }: { lesson: QuestLesson }) {
  const { t, l, language } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const narration = useAppStore((s) => s.settings.narration);
  const theme = topicThemes[lesson.worldId];
  const cards = useMemo(
    () => buildLessonCards(questCardSources(lesson), { fallbackArt: TOPIC_FALLBACK_ART[lesson.worldId], language }),
    [lesson, language],
  );

  useEffect(() => () => stopSpeaking(), []);

  const readAloud = () =>
    deviceNarration.speak(
      [l(lesson.title), l(lesson.summary), ...lesson.sections.map((s) => `${s.heading ? `${l(s.heading)}. ` : ''}${l(s.body)}`)].join('. '),
      language,
    );

  return (
    <View style={styles.root}>
      <SceneView scene={lesson.scene ?? theme.scene} height={140} />
      <View style={styles.titleBlock}>
        <AppText variant="label" color={c.goldText}>
          {t('lesson.label').toUpperCase()}
        </AppText>
        <AppText variant="title" accessibilityRole="header">
          {l(lesson.title)}
        </AppText>
        <AppText variant="body" color={c.textMuted}>
          {l(lesson.summary)}
        </AppText>
      </View>
      {narration ? <Button label={t('lesson.readAloud')} icon="speaker" variant="secondary" onPress={readAloud} /> : null}

      <LessonCards cards={cards} accent={theme.accent} fallbackScene={lesson.scene ?? theme.scene} />

      <DifferenceNote note={lesson.differenceNote} />
      <SourceList sources={lesson.sources} />
    </View>
  );
}
