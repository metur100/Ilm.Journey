import type { BadgeMetrics, DayKey } from '@/core/models';
import { dayNumber } from '@/core/utils/date';

import { isMapPlace } from '../content/places';
import type { MapPlaceId, StoriesData, Story } from '../models';
import { buildStoryFlow } from './storyFlow';
import { completedStories } from './unlocking';

export const EMPTY_STORIES: StoriesData = {
  stories: {},
  completedScenes: [],
  learnedLessons: [],
  perfectStories: [],
  run: null,
};

/** Badge metrics of the stories feature (see docs/FEATURE-PORTING.md §5). */
export function storiesMetrics(data: StoriesData, stories: readonly Story[]): BadgeMetrics {
  const completed = completedStories(data.stories, stories).length;
  const sabrLessons = stories.flatMap((s) => s.lessons).filter((l) => l.value === 'sabr');
  const sabrDone = sabrLessons.length > 0 && sabrLessons.every((l) => data.learnedLessons.includes(l.id));
  return {
    'stories.completed': completed,
    'stories.allCompleted': stories.length > 0 && completed === stories.length ? 1 : 0,
    'stories.sabrLessonsLearned': sabrDone ? 1 : 0,
    perfectRuns: data.perfectStories.filter((id) => stories.some((s) => s.id === id)).length,
  };
}

/** Progress (0..1) of a resumable run. */
export function runProgress(story: Story, stepIndex: number): number {
  const total = buildStoryFlow(story).length;
  return total === 0 ? 0 : Math.min(1, (stepIndex + 1) / total);
}

/** Average best score (0..100) of the completed stories. */
export function averageScore(data: StoriesData, stories: readonly Story[]): number {
  const scores = completedStories(data.stories, stories).map((s) => data.stories[s.id].bestScore);
  return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
}

/** Featured story of the day (rotates through all stories). */
export function featuredStoryFor(day: DayKey, stories: readonly Story[]): Story | null {
  if (stories.length === 0) return null;
  const n = dayNumber(day);
  return stories[((n % stories.length) + stories.length) % stories.length];
}

/** Stories whose map question points at a place (used to label the story map). */
export function storiesByPlace(stories: readonly Story[]): Partial<Record<MapPlaceId, Story[]>> {
  const result: Partial<Record<MapPlaceId, Story[]>> = {};
  for (const story of stories) {
    for (const q of story.questions) {
      if (q.type !== 'map' || !isMapPlace(q.correctPlace)) continue;
      const list = (result[q.correctPlace] ??= []);
      if (!list.includes(story)) list.push(story);
    }
  }
  return result;
}
