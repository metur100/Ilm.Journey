import { applyAnswer, createInitialData } from '@/core/services/engine';
import { MAX_BOX, recordSuccess } from '@/core/services/review';
import { EPISODES, EVENTS, PEOPLE, PLACES, QUESTIONS, seerahKey } from '@/features/seerah/content';
import {
  applyDiscover,
  applyEpisodeComplete,
  applyEpisodeStep,
  applyReflection,
  applyToggleBookmark,
  createEmptySeerah,
  isBookmarked,
  sanitizeSeerahData,
} from '@/features/seerah/services/engine';
import { continueEpisode, episodeProgress, exploration, seerahMetrics } from '@/features/seerah/services/progress';
import { seerahReviewCenter } from '@/features/seerah/services/review';
import { CONTENT_COUNTS } from '@/features/seerah/store/seerahStore';

const NOW = new Date('2026-10-07T10:00:00.000Z');
const ref = (i: number) => ({ key: seerahKey(QUESTIONS[i].id), topic: QUESTIONS[i].topic, topicArea: 'seerah' as const });

describe('Seerah review view (filter of the global review queue)', () => {
  it('builds Needs review / Mastered from seerah keys only', () => {
    let data = createInitialData();
    data = applyAnswer(data, ref(0), false, 'quiz', NOW).data;
    data = applyAnswer(data, ref(1), false, 'quiz', NOW).data;
    data = applyAnswer(data, ref(1), false, 'quiz', NOW).data;
    data = applyAnswer(data, { key: 'learn:x-q1', topic: 'x' }, false, 'test', NOW).data;
    const center = seerahReviewCenter(data.review, NOW.toISOString());
    expect(center.due).toHaveLength(2);
    expect(center.due[0].key).toBe(seerahKey(QUESTIONS[1].id)); // missed twice → first
    expect(center.needsReview.every((i) => i.key.startsWith('seerah:'))).toBe(true);
    expect(center.mastered).toEqual([]);

    const reviewed = applyAnswer(data, ref(0), true, 'review', NOW);
    expect(reviewed.xp).toBe(5);
    expect(seerahReviewCenter(reviewed.data.review, NOW.toISOString()).due).toHaveLength(1);

    let item = reviewed.data.review[seerahKey(QUESTIONS[0].id)];
    for (let i = 0; i <= MAX_BOX; i++) item = recordSuccess(item, '2026-12-01T00:00:00.000Z');
    const mastered = seerahReviewCenter({ [item.key]: item }, NOW.toISOString());
    expect(mastered.mastered).toHaveLength(1);
    expect(mastered.needsReview).toEqual([]);
  });
});

describe('progress', () => {
  it('tracks episodes, discoveries and the explored percentage', () => {
    let data = createEmptySeerah();
    expect(exploration(data, CONTENT_COUNTS).explored).toBe(0);
    data = applyEpisodeComplete(data, 'episode-01', [true], NOW).data;
    data = applyDiscover(data, 'place', 'makkah', NOW).data;
    data = applyDiscover(data, 'person', 'khadijah', NOW).data;
    const e = exploration(data, CONTENT_COUNTS);
    expect(e.episodesCompleted).toBe(1);
    expect(e.placesDiscovered).toBe(1);
    const total = EPISODES.length + EVENTS.length + PEOPLE.length + PLACES.length;
    expect(e.explored).toBe(Math.round((3 / total) * 100));
    expect(applyDiscover(data, 'place', 'makkah', NOW).isNew).toBe(false);
  });

  it('continues the episode in progress (per-step resume), otherwise the next unfinished one', () => {
    let data = createEmptySeerah();
    expect(continueEpisode(data, EPISODES)?.id).toBe('episode-01');
    data = applyEpisodeStep(data, 'episode-04', 'mainEvent', NOW);
    expect(continueEpisode(data, EPISODES)?.id).toBe('episode-04');
    expect(data.episodes['episode-04'].step).toBe('mainEvent');
    expect(episodeProgress(data, 'episode-04')).toBeCloseTo(4 / 11);
    data = applyEpisodeComplete(data, 'episode-04', [true], NOW).data;
    expect(episodeProgress(data, 'episode-04')).toBe(1);
    expect(continueEpisode(data, EPISODES)?.id).toBe('episode-01');
  });

  it('reports the badge metrics of the porting guide', () => {
    let data = createEmptySeerah();
    expect(seerahMetrics(data, CONTENT_COUNTS)).toEqual({
      'seerah.episodesCompleted': 0,
      'seerah.makkahCompleted': 0,
      'seerah.madinahCompleted': 0,
      'seerah.timelineCompleted': 0,
      'seerah.peopleCompleted': 0,
      'seerah.reflections': 0,
      'seerah.episodesPassed': 0,
      'seerah.allEpisodesCompleted': 0,
      perfectRuns: 0,
    });
    data = applyEpisodeComplete(data, 'episode-01', [true, false, false], NOW).data;
    expect(seerahMetrics(data, CONTENT_COUNTS)).toMatchObject({ 'seerah.episodesCompleted': 1, 'seerah.episodesPassed': 0 });
    for (const ep of EPISODES.filter((e) => e.era !== 'madinah')) data = applyEpisodeComplete(data, ep.id, [true, true], NOW).data;
    expect(seerahMetrics(data, CONTENT_COUNTS)).toMatchObject({ 'seerah.makkahCompleted': 1, 'seerah.madinahCompleted': 0 });
    for (const ep of EPISODES) data = applyEpisodeComplete(data, ep.id, [true, true], NOW).data;
    for (const e of EVENTS) data = applyDiscover(data, 'event', e.id, NOW).data;
    for (const p of PEOPLE) data = applyDiscover(data, 'person', p.id, NOW).data;
    for (const ep of EPISODES.slice(0, 5)) data = applyReflection(data, { questionId: ep.reflectionQuestions[0].id, episodeId: ep.id, text: 'x', optionIndex: null }, NOW).data;
    expect(seerahMetrics(data, CONTENT_COUNTS)).toEqual({
      'seerah.episodesCompleted': 10,
      'seerah.makkahCompleted': 1,
      'seerah.madinahCompleted': 1,
      'seerah.timelineCompleted': 1,
      'seerah.peopleCompleted': 1,
      'seerah.reflections': 5,
      'seerah.episodesPassed': 10,
      'seerah.allEpisodesCompleted': 1,
      perfectRuns: 10,
    });
  });
});

describe('bookmarks and reflections', () => {
  it('toggles bookmarks of every type', () => {
    let data = createEmptySeerah();
    for (const type of ['episode', 'event', 'person', 'place', 'source'] as const) {
      data = applyToggleBookmark(data, type, 'x', NOW);
      expect(isBookmarked(data.bookmarks, type, 'x')).toBe(true);
    }
    data = applyToggleBookmark(data, 'person', 'x', NOW);
    expect(isBookmarked(data.bookmarks, 'person', 'x')).toBe(false);
    expect(data.bookmarks).toHaveLength(4);
  });

  it('saves, updates and removes reflections without judging them', () => {
    let r = applyReflection(createEmptySeerah(), { questionId: 'e01-r1', episodeId: 'episode-01', text: '  My thought  ', optionIndex: null }, NOW);
    expect(r.data.reflections['e01-r1'].text).toBe('My thought');
    expect(r.isNew).toBe(true);
    r = applyReflection(r.data, { questionId: 'e01-r1', episodeId: 'episode-01', text: '', optionIndex: 2 }, NOW);
    expect(r.isNew).toBe(false);
    expect(r.data.reflections['e01-r1'].optionIndex).toBe(2);
    r = applyReflection(r.data, { questionId: 'e01-r1', episodeId: 'episode-01', text: '', optionIndex: null }, NOW);
    expect(r.data.reflections['e01-r1']).toBeUndefined();
  });
});

describe('sanitizing stored data', () => {
  it('survives corrupt data and fills defaults', () => {
    expect(sanitizeSeerahData('oops')).toBeNull();
    expect(sanitizeSeerahData(null)).toBeNull();
    const data = sanitizeSeerahData({
      episodes: { 'episode-01': { step: 'lesson', startedAt: 'a' }, bad: { step: 'nope', startedAt: 'a' }, worse: 5 },
      bookmarks: [{ type: 'place', id: 'badr', createdAt: 'a' }, { type: 'alien', id: 1 }],
      reflections: { r: { questionId: 'r', episodeId: 'e', text: 'x', optionIndex: null }, s: { text: 3 } },
      discovered: { event: { hijrah: 'a', x: 5 }, person: 'nope' },
      quizResults: 'nope',
    })!;
    expect(Object.keys(data.episodes)).toEqual(['episode-01']);
    expect(data.episodes['episode-01']).toMatchObject({ step: 'lesson', updatedAt: 'a', completedAt: null, bestScore: null });
    expect(data.bookmarks).toHaveLength(1);
    expect(Object.keys(data.reflections)).toEqual(['r']);
    expect(data.discovered).toEqual({ event: { hijrah: 'a' }, person: {}, place: {} });
    expect(data.quizResults).toEqual([]);
    expect(data.perfectEpisodes).toEqual([]);
  });
});
