import type { TopicId } from '@/core/models';

import { registerPathSource, type QuestPathItem } from '../extensions';
import { useQuestStore } from '../quests/store/questStore';
import { lessonDescription, lessonTitle } from './copy';
import { SUFARA_LESSONS } from './course';

/** Quest target of a Sufara lesson (reported when it is finished). */
export const sufaraTarget = (lessonId: string) => `sufara:${lessonId}`;

/**
 * The Sufara course as the first part of the Sufara topic path (order 5: before the letter quests at 10, the units at 50
 * and the Master Challenge). A lesson counts as finished once it is in the quest store's read lessons.
 */
export function sufaraPathItems(topic: TopicId, completedLessons: readonly string[]): QuestPathItem[] {
  if (topic !== 'sufara') return [];
  return SUFARA_LESSONS.map((lesson) => ({
    kind: 'quest',
    id: lesson.id,
    title: lessonTitle(lesson),
    description: lessonDescription(lesson),
    icon: lesson.kind === 'letters' || lesson.kind === 'review' ? 'letter' : 'book',
    href: { pathname: '/sufara', params: { lesson: lesson.id } },
    completed: completedLessons.includes(lesson.id),
    target: sufaraTarget(lesson.id),
  }));
}

/** Registers the course in the topic path (called from the Learn feature's register.ts). */
export function registerSufaraCourse(): void {
  registerPathSource({ id: 'sufara', order: 5, items: (topic) => sufaraPathItems(topic, useQuestStore.getState().completedLessons) });
}
