import { questionKey, type Question } from '@/core/models';

import type { Story, StoryLesson, StoryScene } from '../models';
import { GROUP_A } from './prophets/groupA';
import { GROUP_B } from './prophets/groupB';
import { GROUP_C } from './prophets/groupC';
import { PROPHET_ORDER } from './order';
import { STORY_STAGES } from './stages';

/** Question key prefix of the stories feature (`stories:<questionId>`). */
export const STORIES_PREFIX = 'stories';
export const storiesKey = (questionId: string) => questionKey(STORIES_PREFIX, questionId);

/**
 * The JSON files are copied unchanged from story-of-the-prophets. At load time every question is
 * tagged with the learning topic (`areaId: 'prophets'`); questions without their own references
 * (values-based lesson choices, memory games) show the story's Quran references. Stages, symbol art and map
 * places missing in the JSON come from the overlay `stages.ts` (docs/STORIES-V3.md §5); the order comes from the
 * canonical table `order.ts`.
 */
function prepare(raw: unknown): Story {
  const story = raw as Story;
  const overlay = STORY_STAGES[story.id];
  return {
    ...story,
    order: PROPHET_ORDER[story.id] ?? story.order,
    coverStage: story.coverStage ?? overlay?.cover,
    symbolArt: story.symbolArt ?? overlay?.symbolArt,
    mapPlaces: story.mapPlaces ?? overlay?.mapPlaces,
    scenes: story.scenes.map((scene) => ({ ...scene, stage: scene.stage ?? overlay?.scenes?.[scene.id] })),
    questions: story.questions.map((q) => ({
      ...q,
      storyId: story.id,
      areaId: 'prophets',
      sources: q.sources && q.sources.length > 0 ? q.sources : story.sources,
    })) as Question[],
  };
}

// JSON imports are widened by TypeScript; the content test suite verifies the shape.
export const STORIES: readonly Story[] = [...GROUP_A, ...GROUP_B, ...GROUP_C].map(prepare).sort((a, b) => a.order - b.order);

export const QUESTIONS: readonly Question[] = STORIES.flatMap((s) => s.questions);
export const LESSONS: readonly StoryLesson[] = STORIES.flatMap((s) => s.lessons);
export const SCENES: readonly StoryScene[] = STORIES.flatMap((s) => s.scenes);

const storyMap = new Map(STORIES.map((s) => [s.id, s] as const));
const questionMap = new Map(QUESTIONS.map((q) => [q.id, q] as const));
const sceneMap = new Map(SCENES.map((s) => [s.id, s] as const));

export const getStory = (id: string): Story | undefined => storyMap.get(id);
export const getQuestion = (id: string): Question | undefined => questionMap.get(id);
export const getScene = (id: string): StoryScene | undefined => sceneMap.get(id);

/** The story a question belongs to. */
export function storyOfQuestion(questionId: string): Story | undefined {
  const q = questionMap.get(questionId);
  return q?.storyId ? storyMap.get(q.storyId) : undefined;
}
