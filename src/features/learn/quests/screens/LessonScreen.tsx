import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/core/components/ui/Button';
import { LockedContent } from '@/core/components/ui/LockedContent';
import { Screen } from '@/core/components/ui/Screen';
import { EmptyState } from '@/core/components/ui/States';
import { TopBar } from '@/core/components/ui/TopBar';
import { useStatusBar } from '@/core/hooks/useStatusBar';

import { getQuestLesson, questForLesson } from '../../content/quests';
import { QuestLessonView } from '../components/QuestLessonView';
import { useQuestI18n } from '../i18n';
import { isLessonOpen } from '../services/status';
import { useQuestStore } from '../store/questStore';

/** Re-reading an islam-quest lesson (from a finished quest or search). XP for a lesson is granted only once. */
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, l } = useQuestI18n();
  useStatusBar(false);
  const completedLessons = useQuestStore((s) => s.completedLessons);
  const completeLesson = useQuestStore((s) => s.completeLesson);
  const lesson = getQuestLesson(String(id));
  const [open] = useState(() => (lesson ? isLessonOpen(lesson.id, useQuestStore.getState()) : false));

  if (!lesson) {
    return (
      <Screen header={<TopBar />}>
        <EmptyState icon="book" title={t('lesson.notFound')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </Screen>
    );
  }

  const quest = questForLesson(lesson.id);
  const read = completedLessons.includes(lesson.id);

  return (
    <Screen header={<TopBar title={l(lesson.title)} />}>
      {!open && quest ? (
        <>
          <LockedContent message={t('lesson.locked', { quest: l(quest.title) })} />
          <Button
            label={t('common.open')}
            variant="secondary"
            icon="map"
            onPress={() => router.replace({ pathname: '/topic/[id]', params: { id: lesson.worldId } })}
          />
        </>
      ) : (
        <>
          <QuestLessonView lesson={lesson} />
          <Button
            label={read ? t('common.done') : t('lesson.done')}
            icon="check"
            onPress={() => {
              completeLesson(lesson.id);
              if (router.canGoBack()) router.back();
              else router.replace({ pathname: '/topic/[id]', params: { id: lesson.worldId } });
            }}
          />
        </>
      )}
    </Screen>
  );
}
