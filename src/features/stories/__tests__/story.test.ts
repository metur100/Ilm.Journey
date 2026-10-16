import type { Question } from '@/core/models';
import { evaluateAnswer, scoreQuiz } from '@/core/services/quiz';
import { getStory, STORIES } from '@/features/stories/content';
import { EMPTY_STORIES, featuredStoryFor, runProgress, storiesByPlace, storiesMetrics } from '@/features/stories/services/progress';
import { buildStoryFlow, questionCount, scenesReached } from '@/features/stories/services/storyFlow';
import { completedStories, nextStory, openStories, storyStatus, unlockingStory } from '@/features/stories/services/unlocking';

/** The stories in journey order (Adam … Muhammad) – every count below is derived from the content. */
const ORDERED = [...STORIES].sort((a, b) => a.order - b.order);

const done = (...ids: string[]) => Object.fromEntries(ids.map((id) => [id, { completed: true, bestStars: 3, bestScore: 100, attempts: 1 }]));

describe('story progression', () => {
  const adam = getStory('adam')!;

  it('follows INTRO → (STORY → INTERACTION / QUESTION)… → MINI GAME → LESSON → QUIZ', () => {
    for (const story of STORIES) {
      const expected = [
        'intro',
        ...story.scenes.flatMap((sc, i) => (sc.interactionId ? ['scene', i === 0 ? 'interaction' : 'question'] : ['scene'])),
        'miniGame',
        'lessons',
        ...story.quizIds.map(() => 'quiz'),
      ];
      const kinds = buildStoryFlow(story).map((s) => (s.kind === 'question' ? s.role : s.kind));
      expect({ id: story.id, kinds }).toEqual({ id: story.id, kinds: expected });
    }
  });

  it('counts the scored questions', () => {
    for (const story of STORIES) {
      const interactions = story.scenes.filter((sc) => sc.interactionId).length;
      expect(questionCount(story)).toBe(interactions + 1 + story.quizIds.length);
    }
  });

  it('tracks which scenes have been reached', () => {
    const flow = buildStoryFlow(adam);
    expect(scenesReached(adam, 0)).toEqual([]);
    expect(scenesReached(adam, 1)).toEqual([adam.scenes[0].id]);
    expect(scenesReached(adam, flow.length - 1)).toEqual(adam.scenes.map((sc) => sc.id));
  });

  it('every story uses the same interactive structure', () => {
    for (const story of STORIES) {
      const flow = buildStoryFlow(story);
      expect(flow[0].kind).toBe('intro');
      const scenes = flow.filter((s) => s.kind === 'scene');
      expect(scenes.length).toBe(story.scenes.length);
      expect(scenes.length).toBeGreaterThanOrEqual(3);
      expect(scenes.length).toBeLessThanOrEqual(6);
      expect(flow.filter((s) => s.kind === 'question' && s.role === 'miniGame')).toHaveLength(1);
      expect(flow.filter((s) => s.kind === 'question' && s.role === 'quiz').length).toBeGreaterThanOrEqual(3);
      // The child interacts regularly: never more than one story page in a row.
      for (let i = 1; i < flow.length; i++) {
        const twoPages = flow[i].kind === 'scene' && flow[i - 1].kind === 'scene';
        expect({ id: story.id, i, twoPages }).toEqual({ id: story.id, i, twoPages: false });
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
    expect(ORDERED[0].id).toBe('adam');
    expect(ORDERED.map((s) => storyStatus(s, {}, STORIES))).toEqual(ORDERED.map((_, i) => (i === 0 ? 'available' : 'locked')));
    expect(nextStory({}, STORIES)?.id).toBe('adam');
    expect(openStories({}, STORIES).map((s) => s.id)).toEqual(['adam']);
  });

  it('unlocks stories in chronological order and explains why one is locked', () => {
    const [first, second, third] = ORDERED;
    const progress = done(first.id);
    expect(storyStatus(second, progress, STORIES)).toBe('available');
    expect(storyStatus(third, progress, STORIES)).toBe('locked');
    expect(unlockingStory(third, STORIES)?.id).toBe(second.id);
    expect(unlockingStory(first, STORIES)).toBeNull();
    expect(completedStories(progress, STORIES).map((s) => s.id)).toEqual([first.id]);
    expect(openStories(progress, STORIES).map((s) => s.id)).toEqual([first.id, second.id]);
    // Every story is opened by the one before it.
    ORDERED.slice(1).forEach((story, i) => expect(unlockingStory(story, STORIES)?.id).toBe(ORDERED[i].id));
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
    const all = { ...EMPTY_STORIES, stories: done(...STORIES.map((s) => s.id)), learnedLessons: sabr, perfectStories: [ORDERED[0].id, ORDERED[1].id] };
    expect(storiesMetrics(all, STORIES)).toEqual({
      'stories.completed': STORIES.length,
      'stories.allCompleted': 1,
      'stories.sabrLessonsLearned': 1,
      perfectRuns: 2,
    });
    expect(storiesMetrics({ ...EMPTY_STORIES, learnedLessons: sabr.slice(0, 1) }, STORIES)['stories.sabrLessonsLearned']).toBe(0);
  });

  it('places the stories on the map by their map places and map questions, in story order', () => {
    const byPlace = storiesByPlace(STORIES);
    for (const story of STORIES) {
      const places = new Set([...(story.mapPlaces ?? []), ...story.questions.flatMap((q) => (q.type === 'map' ? [q.correctPlace] : []))]);
      for (const place of places) {
        const listed = !!byPlace[place as keyof typeof byPlace]?.includes(story);
        expect({ story: story.id, place, listed }).toEqual({ story: story.id, place, listed: true });
      }
    }
    for (const list of Object.values(byPlace)) {
      const orders = (list ?? []).map((s) => s.order);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
    }
    expect(byPlace.judi?.map((s) => s.id)).toContain('nuh');
  });

  it('rotates the featured story', () => {
    expect(featuredStoryFor('2026-10-06', STORIES)).not.toBe(featuredStoryFor('2026-10-07', STORIES));
    expect(featuredStoryFor('2026-10-06', [])).toBeNull();
  });
});
