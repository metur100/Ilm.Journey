import { questionKey, type Question } from '@/core/models';

import type { Story, StoryLesson, StoryScene } from '../models';
import adam from './prophets/adam.json';
import ibrahim from './prophets/ibrahim.json';
import isa from './prophets/isa.json';
import muhammad from './prophets/muhammad.json';
import musa from './prophets/musa.json';
import nuh from './prophets/nuh.json';
import yunus from './prophets/yunus.json';
import yusuf from './prophets/yusuf.json';

/** Question key prefix of the stories feature (`stories:<questionId>`). */
export const STORIES_PREFIX = 'stories';
export const storiesKey = (questionId: string) => questionKey(STORIES_PREFIX, questionId);

/**
 * The JSON files are copied unchanged from story-of-the-prophets. At load time every question is
 * tagged with the learning topic (`areaId: 'prophets'`); questions without their own references
 * (values-based lesson choices, memory games) show the story's Quran references.
 */
function prepare(raw: unknown): Story {
  const story = raw as Story;
  return {
    ...story,
    questions: story.questions.map((q) => ({
      ...q,
      storyId: story.id,
      areaId: 'prophets',
      sources: q.sources && q.sources.length > 0 ? q.sources : story.sources,
    })) as Question[],
  };
}

// JSON imports are widened by TypeScript; the content test suite verifies the shape.
export const STORIES: readonly Story[] = [adam, nuh, ibrahim, musa, yusuf, yunus, isa, muhammad].map(prepare).sort((a, b) => a.order - b.order);

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
