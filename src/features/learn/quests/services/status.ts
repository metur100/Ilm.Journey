import type { TopicId } from '@/core/models';

import { getQuest, questForLesson, questsOfTopic } from '../../content/quests';
import type { QuestPathItem } from '../../extensions';
import { buildTopicPath, nextPathEntry, type PathItemStatus } from '../../path';
import { useLearnStore } from '../../store/learnStore';
import type { BeginnerQuest, QuestData } from '../models';
import { isQuestDone } from './progress';

/** The beginner quests of a topic as path items (order 10, before the units). */
export function questPathItems(topic: TopicId, data: Pick<QuestData, 'quests'>): QuestPathItem[] {
  return questsOfTopic(topic).map((q) => ({
    kind: 'quest',
    id: q.id,
    title: q.title,
    description: q.description,
    icon: q.kind === 'memorization' ? 'quran' : q.kind === 'game' ? 'sparkle' : q.kind === 'story' ? 'scroll' : 'flag',
    href: { pathname: '/quest/[id]', params: { id: q.id } },
    completed: isQuestDone(data, q.id),
    target: `quest:${q.id}`,
  }));
}

/** Status of a quest inside its topic path (items unlock in order). */
export function questStatus(quest: BeginnerQuest): PathItemStatus {
  const learn = useLearnStore.getState();
  return buildTopicPath(quest.worldId, learn).find((e) => e.item.kind === 'quest' && e.item.id === quest.id)?.status ?? 'locked';
}

/** A lesson can be (re)read once read, or when its quest is open. */
export function isLessonOpen(lessonId: string, data: Pick<QuestData, 'completedLessons'>): boolean {
  if (data.completedLessons.includes(lessonId)) return true;
  const quest = questForLesson(lessonId);
  return quest !== undefined && questStatus(quest) !== 'locked';
}

/** The next open quest in the same topic after finishing one (or null). */
export function nextQuestAfter(questId: string): BeginnerQuest | null {
  const quest = getQuest(questId);
  if (!quest) return null;
  const entry = nextPathEntry(quest.worldId, useLearnStore.getState());
  return entry?.item.kind === 'quest' ? (getQuest(entry.item.id) ?? null) : null;
}
