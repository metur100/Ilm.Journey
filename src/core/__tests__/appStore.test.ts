import AsyncStorage from '@react-native-async-storage/async-storage';

import type { BadgeMetrics, Question } from '@/core/models';
import { clearRegistryForTests, registerLifecycle, registerProgress, registerQuestions, registerQuestProvider, registerReset } from '@/core/registry';
import { createInitialData } from '@/core/services/engine';
import { XP } from '@/core/services/xp';
import { APP_PERSIST, useAppStore } from '@/core/store/appStore';
import { savePersisted } from '@/core/storage';

const text = { en: 'x', de: 'x', bs: 'x' };
const q = (id: string): Question => ({ id, topic: 'wudu', prompt: text, explanation: text, type: 'trueFalse', correct: true });

let featureMetrics: BadgeMetrics = {};

function freshStore() {
  useAppStore.setState({ ...createInitialData('en'), hydrated: true, celebrations: [], celebrationsPaused: false });
}

beforeEach(async () => {
  await AsyncStorage.clear();
  clearRegistryForTests();
  featureMetrics = {};
  registerQuestions('demo', { get: (id) => q(id) });
  registerProgress('demo', { metrics: () => featureMetrics });
  freshStore();
});

describe('recordAnswer', () => {
  it('grants XP once per question key', () => {
    const app = useAppStore.getState();
    expect(app.recordAnswer({ key: 'learn:q1', topic: 'wudu', topicArea: 'salah' }, true, 'test')).toBe(XP.correctAnswer);
    expect(useAppStore.getState().recordAnswer({ key: 'learn:q1', topic: 'wudu' }, true, 'quiz')).toBe(0);
    // The same id in another feature is a different question.
    expect(useAppStore.getState().recordAnswer({ key: 'stories:q1', topic: 'adam' }, true, 'quiz')).toBe(XP.correctAnswer);
    const state = useAppStore.getState();
    expect(state.correctlyAnswered).toEqual(['learn:q1', 'stories:q1']);
    expect(state.stats).toMatchObject({ questionsAnswered: 3, correctAnswers: 3 });
    expect(state.xp).toBe(2 * XP.correctAnswer);
  });

  it('ignores practice answers', () => {
    expect(useAppStore.getState().recordAnswer({ key: 'learn:q1', topic: 'x' }, false, 'practice')).toBe(0);
    expect(useAppStore.getState().stats.questionsAnswered).toBe(0);
    expect(useAppStore.getState().review).toEqual({});
  });

  it('keeps one review queue keyed by global keys across features and rewards remembering', () => {
    const app = useAppStore.getState();
    app.recordAnswer({ key: 'learn:salah-q1', topic: 'wudu', topicArea: 'salah' }, false, 'test');
    useAppStore.getState().recordAnswer({ key: 'stories:adam-q2', topic: 'adam' }, false, 'quiz');
    useAppStore.getState().recordAnswer({ key: 'seerah:e01-q4', topic: 'hijrah', topicArea: 'seerah' }, false, 'quiz');
    const review = useAppStore.getState().review;
    expect(Object.keys(review).sort()).toEqual(['learn:salah-q1', 'seerah:e01-q4', 'stories:adam-q2']);
    expect(review['learn:salah-q1']).toMatchObject({ key: 'learn:salah-q1', topic: 'wudu', topicArea: 'salah', box: 0 });

    const xp = useAppStore.getState().recordAnswer({ key: 'stories:adam-q2', topic: 'adam' }, true, 'review');
    expect(xp).toBe(XP.reviewCorrect);
    expect(useAppStore.getState().review['stories:adam-q2'].box).toBe(1);
    expect(useAppStore.getState().stats.reviewsCorrect).toBe(1);
  });

  it('counts a scored answer for the streak', () => {
    useAppStore.getState().recordAnswer({ key: 'learn:q1', topic: 'x' }, true, 'test');
    expect(useAppStore.getState().streak.current).toBe(1);
  });
});

describe('awardXp', () => {
  it('is idempotent per reason key', () => {
    expect(useAppStore.getState().awardXp('story:adam:complete', 50)).toBe(50);
    expect(useAppStore.getState().awardXp('story:adam:complete', 50)).toBe(0);
    expect(useAppStore.getState().awardXp('story:nuh:complete', 50)).toBe(50);
    expect(useAppStore.getState().xp).toBe(100);
    expect(useAppStore.getState().xpAwards).toEqual({ 'story:adam:complete': 50, 'story:nuh:complete': 50 });
  });

  it('ignores empty reasons and non-positive amounts', () => {
    expect(useAppStore.getState().awardXp('', 10)).toBe(0);
    expect(useAppStore.getState().awardXp('x', 0)).toBe(0);
    expect(useAppStore.getState().awardXp('y', -5)).toBe(0);
    expect(useAppStore.getState().xp).toBe(0);
  });

  it('queues a level-up celebration', () => {
    useAppStore.getState().awardXp('big', 120);
    expect(useAppStore.getState().level).toBe(2);
    expect(useAppStore.getState().celebrations).toContainEqual({ kind: 'level', level: 2 });
  });
});

describe('badges', () => {
  it('evaluates feature metrics after awardXp / refreshBadges and celebrates once', () => {
    featureMetrics = { lessonsCompleted: 1 };
    useAppStore.getState().awardXp('learn:unit:a:complete', 30);
    expect(useAppStore.getState().badges.first_lesson).toBeDefined();
    expect(useAppStore.getState().celebrations).toContainEqual({ kind: 'badge', id: 'first_lesson' });

    featureMetrics = { lessonsCompleted: 1, 'stories.completed': 4, perfectRuns: 1 };
    useAppStore.getState().refreshBadges();
    const badges = useAppStore.getState().badges;
    expect(badges.story_explorer).toBeDefined();
    expect(badges.history_learner).toBeDefined();
    expect(badges.perfect_score).toBeDefined();
    const count = useAppStore.getState().celebrations.filter((c) => c.kind === 'badge' && c.id === 'first_lesson').length;
    useAppStore.getState().refreshBadges();
    expect(useAppStore.getState().celebrations.filter((c) => c.kind === 'badge' && c.id === 'first_lesson').length).toBe(count);
  });

  it('sums shared metrics across features', () => {
    registerProgress('other', { metrics: () => ({ 'stories.completed': 2 }) });
    featureMetrics = { 'stories.completed': 2 };
    useAppStore.getState().refreshBadges();
    expect(useAppStore.getState().badges.history_learner).toBeDefined();
  });

  it('never removes an earned badge', () => {
    featureMetrics = { lessonsCompleted: 1 };
    useAppStore.getState().refreshBadges();
    featureMetrics = {};
    useAppStore.getState().refreshBadges();
    expect(useAppStore.getState().badges.first_lesson).toBeDefined();
  });
});

describe('daily, quests and activity', () => {
  it('rewards the daily challenge once per day', () => {
    useAppStore.getState().refreshQuests(true);
    const first = useAppStore.getState().completeDaily('2026-10-06');
    expect(first).toBeGreaterThanOrEqual(XP.dailyChallenge);
    expect(useAppStore.getState().completeDaily('2026-10-06')).toBe(0);
    expect(useAppStore.getState().dailyCompleted).toEqual(['2026-10-06']);
  });

  it('builds quests from feature candidates and completes them through reported events', () => {
    registerQuestProvider('demo', () => [{ id: 'demo-story-adam', kind: 'story', target: 'stories:story:adam', title: text, priority: 5 }]);
    useAppStore.getState().refreshQuests(true);
    const quest = useAppStore.getState().quests.find((x) => x.kind === 'story');
    expect(quest).toBeDefined();
    const xp = useAppStore.getState().reportQuestEvent({ type: 'complete', target: 'stories:story:adam' });
    expect(xp).toBe(quest!.xp);
    expect(useAppStore.getState().quests.find((x) => x.kind === 'story')?.completed).toBe(true);
    expect(useAppStore.getState().reportQuestEvent({ type: 'complete', target: 'stories:story:adam' })).toBe(0);
  });

  it('registers activity once per day', () => {
    useAppStore.getState().registerActivity();
    useAppStore.getState().registerActivity();
    expect(useAppStore.getState().streak.current).toBe(1);
  });
});

describe('profile, settings and onboarding', () => {
  it('completes onboarding with the learner group', () => {
    useAppStore.getState().completeOnboarding({
      name: '  Amina ',
      character: createInitialData().profile.character,
      language: 'bs',
      learnerGroup: 'teen',
    });
    const state = useAppStore.getState();
    expect(state.onboarded).toBe(true);
    expect(state.profile).toMatchObject({ name: 'Amina', learnerGroup: 'teen' });
    expect(state.settings.language).toBe('bs');
  });

  it('updates settings including theme mode and reminders', () => {
    useAppStore.getState().updateSettings({ themeMode: 'dark', reminderEnabled: true, reminderHour: 9 });
    expect(useAppStore.getState().settings).toMatchObject({ themeMode: 'dark', reminderEnabled: true, reminderHour: 9, sound: true });
  });
});

describe('hydrate and reset', () => {
  it('hydrates stored data and every registered feature', async () => {
    const hydrateFeature = jest.fn(async () => undefined);
    registerLifecycle('demo', { hydrate: hydrateFeature });
    await savePersisted(APP_PERSIST, { ...createInitialData('de'), onboarded: true, xp: 40 });
    useAppStore.setState({ hydrated: false });
    await useAppStore.getState().hydrate('en');
    expect(hydrateFeature).toHaveBeenCalledTimes(1);
    const state = useAppStore.getState();
    expect(state.hydrated).toBe(true);
    expect(state.onboarded).toBe(true);
    expect(state.settings.language).toBe('de');
    expect(state.xp).toBe(40);
    expect(state.quests.length).toBeGreaterThan(0);
  });

  it('uses the device language without stored data', async () => {
    useAppStore.setState({ hydrated: false });
    await useAppStore.getState().hydrate('bs');
    expect(useAppStore.getState().settings.language).toBe('bs');
    expect(useAppStore.getState().onboarded).toBe(false);
  });

  it('resetProgress clears global progress, keeps settings and calls every feature reset', async () => {
    const resetA = jest.fn();
    const resetB = jest.fn(async () => undefined);
    const failing = jest.fn(() => {
      throw new Error('boom');
    });
    registerReset('stories', resetA);
    registerReset('seerah', resetB);
    registerReset('broken', failing);
    useAppStore.getState().updateSettings({ language: 'de', themeMode: 'dark' });
    useAppStore.getState().awardXp('x', 50);
    useAppStore.getState().recordAnswer({ key: 'learn:q1', topic: 't' }, false, 'test');
    await savePersisted(APP_PERSIST, { ...createInitialData('de'), xp: 50 });

    await useAppStore.getState().resetProgress();

    expect(resetA).toHaveBeenCalledTimes(1);
    expect(resetB).toHaveBeenCalledTimes(1);
    expect(failing).toHaveBeenCalledTimes(1);
    const state = useAppStore.getState();
    expect(state.xp).toBe(0);
    expect(state.review).toEqual({});
    expect(state.xpAwards).toEqual({});
    expect(state.onboarded).toBe(false);
    expect(state.celebrations).toEqual([]);
    expect(state.settings).toMatchObject({ language: 'de', themeMode: 'dark' });
    expect(await AsyncStorage.getItem(APP_PERSIST.key)).toBeNull();
  });
});
