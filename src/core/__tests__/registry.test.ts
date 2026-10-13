import type { Question } from '@/core/models';
import {
  clearRegistryForTests,
  collectFeatureMetrics,
  collectTopicQuestionKeys,
  getContinueItem,
  getDailyCandidates,
  getHomeSections,
  getProfileLinks,
  getProgressVersion,
  getQuestCandidates,
  getQuestionByKey,
  getQuestionRenderer,
  getRecentlyCompleted,
  hydrateFeatures,
  registerDailyPool,
  registerHomeSection,
  registerLifecycle,
  registerProfileLink,
  registerProgress,
  registerQuestionRenderer,
  registerQuestions,
  registerQuestProvider,
  registerSearch,
  registerSourceResolver,
  resetFeatures,
  resolveSources,
  searchAll,
  startFeatureAutoSaves,
} from '@/core/registry';
import { dailyChallengeFor } from '@/core/services/daily';
import { topicKnowledge } from '@/core/services/knowledge';

const text = { en: 'x', de: 'x', bs: 'x' };
const tf = (id: string, extra: Partial<Question> = {}): Question =>
  ({ id, topic: 't', prompt: text, explanation: text, type: 'trueFalse', correct: true, ...extra }) as Question;

beforeEach(() => clearRegistryForTests());

describe('question lookups', () => {
  it('resolves global keys to questions of any feature with context', () => {
    registerQuestions('learn', { get: (id) => (id === 'q1' ? tf('q1', { areaId: 'salah' }) : undefined), context: () => ({ title: text, topicArea: 'salah' }) });
    registerQuestions('stories', { get: (id) => (id === 'adam-q2' ? tf('adam-q2', { storyId: 'adam' }) : undefined) });

    expect(getQuestionByKey('learn:q1')).toMatchObject({ key: 'learn:q1', prefix: 'learn', topicArea: 'salah', context: { title: text } });
    expect(getQuestionByKey('stories:adam-q2')?.question.storyId).toBe('adam');
    expect(getQuestionByKey('stories:missing')).toBeUndefined();
    expect(getQuestionByKey('seerah:e01-q1')).toBeUndefined();
    expect(getQuestionByKey('garbage')).toBeUndefined();
    expect(() => registerQuestions('a:b', { get: () => undefined })).toThrow();
  });

  it('registers extension renderers for feature-specific question types', () => {
    const Component = () => null;
    expect(getQuestionRenderer('map')).toBeUndefined();
    registerQuestionRenderer('map', { Component, hideCorrectAnswer: false });
    expect(getQuestionRenderer('map')?.Component).toBe(Component);
  });

  it('resolves Seerah source ids through registered resolvers', () => {
    const withSources = tf('a', { sources: [{ sourceName: 'Quran', sourceReference: '2:255' }] });
    expect(resolveSources(withSources)).toEqual([{ sourceName: 'Quran', sourceReference: '2:255' }]);
    const withIds = tf('b', { sourceIds: ['ibn-hisham'] });
    expect(resolveSources(withIds)).toEqual([]);
    registerSourceResolver('seerah', (ids) => ids.map((id) => ({ sourceName: id.toUpperCase(), sourceReference: '' })));
    expect(resolveSources(withIds)).toEqual([{ sourceName: 'IBN-HISHAM', sourceReference: '' }]);
  });
});

describe('progress reporters', () => {
  it('merges metrics and topic question pools of all features', () => {
    registerProgress('learn', { metrics: () => ({ perfectRuns: 2, lessonsCompleted: 3 }), topicQuestionKeys: () => ({ salah: ['learn:a', 'learn:b'] }) });
    registerProgress('stories', { metrics: () => ({ perfectRuns: 1, 'stories.completed': 2 }), topicQuestionKeys: () => ({ prophets: ['stories:x'] }) });
    expect(collectFeatureMetrics()).toEqual({ perfectRuns: 3, lessonsCompleted: 3, 'stories.completed': 2 });

    const knowledge = topicKnowledge(collectTopicQuestionKeys(), { correctlyAnswered: ['learn:a', 'stories:x'], review: {} });
    expect(knowledge.find((k) => k.id === 'salah')).toMatchObject({ knowledge: 50, total: 2 });
    expect(knowledge.find((k) => k.id === 'prophets')).toMatchObject({ knowledge: 100, total: 1 });
    expect(knowledge.find((k) => k.id === 'arabic')).toMatchObject({ knowledge: 0, total: 0 });
  });

  it('a crashing reporter never breaks the others', () => {
    registerProgress('bad', { metrics: () => { throw new Error('x'); }, continueItem: () => { throw new Error('x'); } });
    registerProgress('good', { metrics: () => ({ lessonsCompleted: 1 }) });
    expect(collectFeatureMetrics()).toEqual({ lessonsCompleted: 1 });
    expect(getContinueItem()).toBeNull();
  });

  it('picks the most recent continue item and sorts recently completed items', () => {
    registerProgress('learn', {
      continueItem: () => ({ key: 'learn:unit:a', title: text, icon: 'book', href: '/', updatedAt: '2026-10-01T10:00:00.000Z' }),
      recentlyCompleted: () => [{ key: 'l1', title: text, icon: 'book', completedAt: '2026-10-01T09:00:00.000Z' }],
    });
    registerProgress('stories', {
      continueItem: () => ({ key: 'stories:adam', title: text, icon: 'scroll', href: '/', updatedAt: '2026-10-02T10:00:00.000Z' }),
      recentlyCompleted: () => [{ key: 's1', title: text, icon: 'scroll', completedAt: '2026-10-03T09:00:00.000Z' }],
    });
    expect(getContinueItem()?.key).toBe('stories:adam');
    expect(getRecentlyCompleted().map((i) => i.key)).toEqual(['s1', 'l1']);
    expect(getRecentlyCompleted(1)).toHaveLength(1);
  });

  it('bumps the progress version when a feature store notifies', () => {
    let notify = () => undefined as void;
    registerProgress('demo', { subscribe: (listener) => ((notify = listener), () => undefined) });
    const before = getProgressVersion();
    notify();
    expect(getProgressVersion()).toBe(before + 1);
  });
});

describe('daily challenge across features', () => {
  it('draws from every registered pool deterministically', () => {
    registerDailyPool('learn', () => [{ key: 'learn:a', question: tf('a') }]);
    registerDailyPool('stories', () => [{ key: 'stories:b', question: tf('b') }]);
    const candidates = getDailyCandidates();
    expect(candidates.map((c) => c.key).sort()).toEqual(['learn:a', 'stories:b']);
    const a = dailyChallengeFor('2026-10-06', candidates, []);
    expect(dailyChallengeFor('2026-10-06', [...candidates].reverse(), [])).toEqual(a);
    expect(a.keys.every((k) => ['learn:a', 'stories:b'].includes(k))).toBe(true);
  });

  it('uses pending review keys on review days and handles an empty pool', () => {
    registerDailyPool('learn', () => Array.from({ length: 6 }, (_, i) => ({ key: `learn:q${i}`, question: tf(`q${i}`) })));
    const reviewDay = Array.from({ length: 10 }, (_, i) => `2026-11-${String(i + 1).padStart(2, '0')}`).find(
      (d) => dailyChallengeFor(d, getDailyCandidates(), ['learn:q3']).kind === 'review',
    )!;
    expect(dailyChallengeFor(reviewDay, getDailyCandidates(), ['learn:q3', 'seerah:unknown']).keys).toEqual(['learn:q3']);
    expect(dailyChallengeFor('2026-10-06', [], []).keys).toEqual([]);
  });
});

describe('quests, search, lifecycle and UI extension points', () => {
  it('collects quest candidates', () => {
    registerQuestProvider('learn', ({ day }) => [{ id: `learn-${day}`, kind: 'learning', target: 'learn:unit:a', title: text }]);
    expect(getQuestCandidates({ day: '2026-10-06' })).toEqual([{ id: 'learn-2026-10-06', kind: 'learning', target: 'learn:unit:a', title: text }]);
  });

  it('searches all registered providers, best matches first', () => {
    registerSearch('learn', (q) => (q === 'wudu' ? [{ key: 'l', feature: 'learn', title: 'Wudu', icon: 'book', href: '/', score: 1 }] : []));
    registerSearch('seerah', (q) => (q === 'wudu' ? [{ key: 's', feature: 'seerah', title: 'Ablution in Madinah', icon: 'kaaba', href: '/', score: 2 }] : []));
    expect(searchAll('wudu', 'en').map((r) => r.key)).toEqual(['s', 'l']);
    expect(searchAll('   ', 'en')).toEqual([]);
  });

  it('hydrates, auto-saves and resets every feature', async () => {
    const hydrate = jest.fn(async () => undefined);
    const reset = jest.fn();
    const stop = jest.fn();
    registerLifecycle('a', { hydrate, reset, autoSave: () => stop });
    registerLifecycle('b', { hydrate: async () => Promise.reject(new Error('corrupt')) });
    await expect(hydrateFeatures()).resolves.toBeUndefined();
    await resetFeatures();
    expect(hydrate).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledTimes(1);
    startFeatureAutoSaves()();
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it('orders home sections and profile links', () => {
    registerHomeSection({ id: 'b', order: 50, Component: () => null });
    registerHomeSection({ id: 'a', order: 15, Component: () => null });
    registerProfileLink({ id: 'reflections', order: 20, icon: 'feather', label: () => 'R', href: '/' });
    registerProfileLink({ id: 'bookmarks', order: 10, icon: 'bookmark', label: () => 'B', href: '/' });
    expect(getHomeSections().map((s) => s.id)).toEqual(['a', 'b']);
    expect(getProfileLinks().map((l) => l.id)).toEqual(['bookmarks', 'reflections']);
  });
});
