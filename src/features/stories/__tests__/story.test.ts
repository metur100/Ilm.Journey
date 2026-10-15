import type { Question } from '@/core/models';
import { evaluateAnswer, scoreQuiz } from '@/core/services/quiz';
import { getStory, STORIES } from '@/features/stories/content';
import { EMPTY_STORIES, featuredStoryFor, runProgress, storiesByPlace, storiesMetrics } from '@/features/stories/services/progress';
import { buildStoryFlow, questionCount, scenesReached } from '@/features/stories/services/storyFlow';
import { completedStories, nextStory, openStories, storyStatus, unlockingStory } from '@/features/stories/services/unlocking';

const done = (...ids: string[]) => Object.fromEntries(ids.map((id) => [id, { completed: true, bestStars: 3, bestScore: 100, attempts: 1 }]));

describe('story progression', () => {
  const adam = getStory('adam')!;

  it('follows INTRO → STORY → INTERACTION → STORY → QUESTION → STORY → MINI GAME → LESSON → QUIZ', () => {
    const kinds = buildStoryFlow(adam).map((s) => (s.kind === 'question' ? s.role : s.kind));
    expect(kinds).toEqual(['intro', 'scene', 'interaction', 'scene', 'question', 'scene', 'miniGame', 'lessons', 'quiz', 'quiz', 'quiz']);
  });

  it('counts the scored questions', () => {
    expect(questionCount(adam)).toBe(6);
  });

  it('tracks which scenes have been reached', () => {
    expect(scenesReached(adam, 0)).toEqual([]);
    expect(scenesReached(adam, 1)).toEqual(['adam-s1']);
    expect(scenesReached(adam, 5)).toEqual(['adam-s1', 'adam-s2', 'adam-s3']);
  });

  it('every story uses the same interactive structure', () => {
    for (const story of STORIES) {
      const flow = buildStoryFlow(story);
      expect(flow[0].kind).toBe('intro');
      expect(flow.filter((s) => s.kind === 'scene')).toHaveLength(3);
      expect(flow.some((s) => s.kind === 'question' && s.role === 'miniGame')).toBe(true);
      expect(flow.filter((s) => s.kind === 'question' && s.role === 'quiz')).toHaveLength(3);
      // The child interacts regularly: never more than one story page in a row.
      for (let i = 1; i < flow.length; i++) {
        expect(flow[i].kind === 'scene' && flow[i - 1].kind === 'scene').toBe(false);
      }
    }
  });

  it('reports run progress between 0 and 1', () => {
    const total = buildStoryFlow(adam).length;
    expect(runProgress(adam, 0)).toBeCloseTo(1 / total);
    expect(runProgress(adam, total - 1)).toBe(1);
  });
});

describe('unlock system', () => {
  it('opens only the first story at the start', () => {
    expect(STORIES.map((s) => storyStatus(s, {}, STORIES))).toEqual(['available', 'locked', 'locked', 'locked', 'locked', 'locked', 'locked', 'locked']);
    expect(nextStory({}, STORIES)?.id).toBe('adam');
    expect(openStories({}, STORIES).map((s) => s.id)).toEqual(['adam']);
  });

  it('unlocks stories in chronological order and explains why one is locked', () => {
    const progress = done('adam');
    expect(storyStatus(getStory('nuh')!, progress, STORIES)).toBe('available');
    expect(storyStatus(getStory('ibrahim')!, progress, STORIES)).toBe('locked');
    expect(unlockingStory(getStory('ibrahim')!, STORIES)?.id).toBe('nuh');
    expect(unlockingStory(getStory('adam')!, STORIES)).toBeNull();
    expect(completedStories(progress, STORIES).map((s) => s.id)).toEqual(['adam']);
    expect(openStories(progress, STORIES).map((s) => s.id)).toEqual(['adam', 'nuh']);
  });

  it('has nothing left when every story is complete', () => {
    expect(nextStory(done(...STORIES.map((s) => s.id)), STORIES)).toBeNull();
  });
});

describe('question scoring', () => {
  const text = (s: string) => ({ en: s, de: s, bs: s });
  const base = { storyId: 's', topic: 't', prompt: text('p'), explanation: text('e') };

  it('scores find questions only when exactly the right objects are chosen', () => {
    const q: Question = { ...base, id: 'f', type: 'find', items: [], correctIds: ['ark', 'rain'] };
    expect(evaluateAnswer(q, { type: 'selection', ids: ['rain', 'ark'] })).toBe(true);
    expect(evaluateAnswer(q, { type: 'selection', ids: ['ark'] })).toBe(false);
    expect(evaluateAnswer(q, { type: 'selection', ids: ['ark', 'rain', 'well'] })).toBe(false);
  });

  it('scores map questions by place', () => {
    const q: Question = { ...base, id: 'm', type: 'map', places: ['makkah', 'egypt'], correctPlace: 'egypt' };
    expect(evaluateAnswer(q, { type: 'place', place: 'egypt' })).toBe(true);
    expect(evaluateAnswer(q, { type: 'place', place: 'makkah' })).toBe(false);
  });

  it('scores lesson choices, timelines and true/false', () => {
    const lesson: Question = { ...base, id: 'l', type: 'lessonChoice', options: [{ id: 'a', text: text('a') }], correctOptionId: 'a' };
    expect(evaluateAnswer(lesson, { type: 'option', optionId: 'a' })).toBe(true);
    const timeline: Question = { ...base, id: 'o', type: 'ordering', timeline: true, items: ['x', 'y', 'z'].map((id) => ({ id, text: text(id) })) };
    expect(evaluateAnswer(timeline, { type: 'order', ids: ['x', 'y', 'z'] })).toBe(true);
    expect(evaluateAnswer(timeline, { type: 'order', ids: ['y', 'x', 'z'] })).toBe(false);
    const tf: Question = { ...base, id: 'tf', type: 'trueFalse', correct: true };
    expect(evaluateAnswer(tf, { type: 'boolean', value: true })).toBe(true);
  });

  it('turns results into stars', () => {
    expect(scoreQuiz([true, true, true, true, true, true]).stars).toBe(3);
    expect(scoreQuiz([true, true, true, true, true, false]).stars).toBe(2);
    expect(scoreQuiz([true, false, false, false, false, false]).stars).toBe(1);
  });
});

describe('metrics and map data', () => {
  it('reports the badge metrics of the stories', () => {
    expect(storiesMetrics(EMPTY_STORIES, STORIES)).toEqual({
      'stories.completed': 0,
      'stories.allCompleted': 0,
      'stories.sabrLessonsLearned': 0,
      perfectRuns: 0,
    });
    const sabr = STORIES.flatMap((s) => s.lessons).filter((l) => l.value === 'sabr').map((l) => l.id);
    expect(sabr.length).toBeGreaterThan(1);
    const all = { ...EMPTY_STORIES, stories: done(...STORIES.map((s) => s.id)), learnedLessons: sabr, perfectStories: ['adam', 'nuh'] };
    expect(storiesMetrics(all, STORIES)).toEqual({
      'stories.completed': 8,
      'stories.allCompleted': 1,
      'stories.sabrLessonsLearned': 1,
      perfectRuns: 2,
    });
    expect(storiesMetrics({ ...EMPTY_STORIES, learnedLessons: sabr.slice(0, 1) }, STORIES)['stories.sabrLessonsLearned']).toBe(0);
  });

  it('places the stories on the map by their map places and map questions, in story order', () => {
    const byPlace = storiesByPlace(STORIES);
    expect(byPlace.judi?.map((s) => s.id)).toEqual(['nuh']);
    expect(byPlace.egypt?.map((s) => s.id)).toEqual(['yusuf', 'musa']);
    expect(byPlace.makkah?.map((s) => s.id)).toEqual(['ibrahim', 'muhammad']);
    expect(byPlace.madinah?.map((s) => s.id)).toEqual(['muhammad']);
    expect(byPlace.nineveh?.map((s) => s.id)).toEqual(['yunus']);
  });

  it('rotates the featured story', () => {
    expect(featuredStoryFor('2026-10-06', STORIES)).not.toBe(featuredStoryFor('2026-10-07', STORIES));
    expect(featuredStoryFor('2026-10-06', [])).toBeNull();
  });
});
