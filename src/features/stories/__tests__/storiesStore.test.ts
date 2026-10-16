import AsyncStorage from '@react-native-async-storage/async-storage';

import { getNamespaces } from '@/core/i18n';
import {
  clearRegistryForTests,
  collectFeatureMetrics,
  collectTopicQuestionKeys,
  getContinueItem,
  getDailyCandidates,
  getProfileLinks,
  getQuestCandidates,
  getQuestionByKey,
  getQuestionRenderer,
  getRecentlyCompleted,
  searchAll,
  startFeatureAutoSaves,
} from '@/core/registry';
import { createInitialData } from '@/core/services/engine';
import { XP } from '@/core/services/xp';
import { loadPersisted, savePersisted } from '@/core/storage';
import { useAppStore } from '@/core/store/appStore';
import { getStory, QUESTIONS, STORIES, storiesKey } from '@/features/stories/content';
import { registerStoriesFeature } from '@/features/stories/register';
import { EMPTY_STORIES } from '@/features/stories/services/progress';
import { buildStoryFlow, questionCount } from '@/features/stories/services/storyFlow';
import {
  lessonXpReason,
  sanitizeStoriesData,
  STORIES_PERSIST,
  storyTarget,
  storyXpReason,
  useStoriesStore,
} from '@/features/stories/store/storiesStore';

const adam = getStory('adam')!;
/** The stories in journey order – the counts below come from the content, not from fixed numbers. */
const [first, second, third] = [...STORIES].sort((a, b) => a.order - b.order);
const allCorrect = () => Array(questionCount(adam)).fill(true) as boolean[];

beforeEach(async () => {
  await AsyncStorage.clear();
  clearRegistryForTests();
  registerStoriesFeature();
  useStoriesStore.setState({ ...EMPTY_STORIES, hydrated: true });
  useAppStore.setState({ ...createInitialData('en'), hydrated: true, celebrations: [], celebrationsPaused: false });
});

describe('stories registration', () => {
  it('resolves stories questions by global key with story context', () => {
    const resolved = getQuestionByKey('stories:adam-next');
    expect(resolved?.question.id).toBe('adam-next');
    expect(resolved?.prefix).toBe('stories');
    expect(resolved?.topicArea).toBe('prophets');
    expect(resolved?.context?.title?.en).toBe('Adam: The First Human');
    expect(getQuestionByKey('stories:nope')).toBeUndefined();
    for (const q of QUESTIONS) expect(getQuestionByKey(storiesKey(q.id))?.question).toBe(q);
  });

  it('registers the map renderer, the i18n namespace and the profile link', () => {
    expect(getQuestionRenderer('map')).toBeDefined();
    expect(getNamespaces().map((n) => n.name)).toContain('stories');
    expect(getProfileLinks().map((p) => p.id)).toContain('stories-map');
  });

  it('reports every story question for the prophets knowledge radar', () => {
    const pools = collectTopicQuestionKeys();
    expect(pools.flatMap((p) => p.prophets ?? [])).toHaveLength(QUESTIONS.length);
  });

  it('offers only questions of opened stories to the daily challenge', () => {
    const keys = () => getDailyCandidates().map((c) => c.key);
    expect(keys().every((k) => k.startsWith('stories:adam-'))).toBe(true);
    expect(keys()).toHaveLength(adam.questions.length);
    useStoriesStore.getState().completeStory(first.id, allCorrect());
    expect(keys()).toEqual(expect.arrayContaining(second.questions.map((q) => storiesKey(q.id))));
    expect(keys().some((k) => third.questions.some((q) => storiesKey(q.id) === k))).toBe(false);
  });

  it('suggests the next story (or the running one) as a quest', () => {
    expect(getQuestCandidates({ day: '2026-10-06' })).toEqual([
      expect.objectContaining({ kind: 'story', target: storyTarget(first.id), topicArea: 'prophets' }),
    ]);
    useStoriesStore.getState().completeStory(first.id, allCorrect());
    expect(getQuestCandidates({ day: '2026-10-06' })[0].target).toBe(storyTarget(second.id));
    useStoriesStore.getState().completeStory(second.id, allCorrect());
    useStoriesStore.getState().saveStep(first.id, 2, [], 0);
    expect(getQuestCandidates({ day: '2026-10-06' })[0].target).toBe(storyTarget(third.id));
  });

  it('finds stories and places in search', () => {
    expect(searchAll('Nuh', 'en').some((r) => r.key === 'stories:story:nuh')).toBe(true);
    expect(searchAll('Ark', 'en').some((r) => r.key === 'stories:story:nuh')).toBe(true);
    expect(searchAll('Judi', 'en').some((r) => r.key === 'stories:place:judi')).toBe(true);
    expect(searchAll('Adem', 'bs').some((r) => r.key === 'stories:story:adam')).toBe(true);
  });
});

describe('playing a story', () => {
  it('saves the position for "Continue story", marks scenes and survives a restart', async () => {
    useStoriesStore.getState().saveStep('adam', 3, [true], 10);
    const state = useStoriesStore.getState();
    expect(state.run).toMatchObject({ storyId: 'adam', stepIndex: 3, results: [true], xpEarned: 10 });
    expect(state.completedScenes).toEqual(['adam-s1', 'adam-s2']);

    const item = getContinueItem();
    expect(item).toMatchObject({ key: storyTarget('adam'), href: { pathname: '/story/play/[id]', params: { id: 'adam' } }, topicArea: 'prophets' });
    expect(item?.progress).toBeCloseTo(4 / buildStoryFlow(adam).length);

    await savePersisted(STORIES_PERSIST, {
      stories: state.stories,
      completedScenes: state.completedScenes,
      learnedLessons: state.learnedLessons,
      perfectStories: state.perfectStories,
      run: state.run,
    });
    useStoriesStore.setState({ ...EMPTY_STORIES, hydrated: false });
    await useStoriesStore.getState().hydrate();
    expect(useStoriesStore.getState().run).toMatchObject({ storyId: 'adam', stepIndex: 3, results: [true], xpEarned: 10 });
    expect(useStoriesStore.getState().hydrated).toBe(true);
  });

  it('persists automatically through the registered auto-save', async () => {
    jest.useFakeTimers();
    const stop = startFeatureAutoSaves();
    useStoriesStore.getState().saveStep('adam', 2, [true], 10);
    jest.advanceTimersByTime(400);
    jest.useRealTimers();
    stop();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect((await loadPersisted(STORIES_PERSIST))?.run).toMatchObject({ storyId: 'adam', stepIndex: 2 });
  });

  it('counts lessons learned once and grants their XP once', () => {
    const first = useStoriesStore.getState().learnLessons('adam');
    expect(first).toBe(adam.lessons.length * XP.storyLessonLearned);
    expect(useStoriesStore.getState().learnedLessons).toEqual(adam.lessons.map((l) => l.id));
    expect(useAppStore.getState().xpAwards[lessonXpReason(adam.lessons[0].id)]).toBe(XP.storyLessonLearned);
    expect(useStoriesStore.getState().learnLessons('adam')).toBe(0);
  });

  it('completes a story, clears the run and rewards XP only once (idempotent)', () => {
    useStoriesStore.getState().saveStep('adam', 5, [], 0);
    const first = useStoriesStore.getState().completeStory('adam', allCorrect())!;
    expect(first.firstCompletion).toBe(true);
    expect(first.perfect).toBe(true);
    expect(first.lines.map((l) => l.kind)).toEqual(expect.arrayContaining(['storyComplete', 'perfectBonus']));
    expect(first.xp).toBeGreaterThanOrEqual(XP.storyComplete + XP.perfectStoryBonus);
    const app = useAppStore.getState();
    expect(app.xpAwards).toMatchObject({ [storyXpReason('adam', 'complete')]: XP.storyComplete, [storyXpReason('adam', 'perfect')]: XP.perfectStoryBonus });
    expect(app.streak.current).toBe(1);

    const state = useStoriesStore.getState();
    expect(state.run).toBeNull();
    expect(state.stories.adam).toMatchObject({ completed: true, bestStars: 3, bestScore: 100, attempts: 1 });
    expect(state.completedScenes).toEqual(adam.scenes.map((sc) => sc.id));
    expect(getContinueItem()).toBeNull();
    expect(getRecentlyCompleted().map((i) => i.key)).toContain(storyTarget('adam'));

    const xpBefore = useAppStore.getState().xp;
    const replay = useStoriesStore.getState().completeStory('adam', [false, true])!;
    expect(replay.firstCompletion).toBe(false);
    expect(replay.xp).toBe(0);
    expect(useAppStore.getState().xp).toBe(xpBefore);
    expect(useStoriesStore.getState().stories.adam).toMatchObject({ bestStars: 3, attempts: 2 });
  });

  it('completes the story quest of the day through the reported event', () => {
    useAppStore.getState().refreshQuests(true);
    expect(useAppStore.getState().quests.some((q) => q.goal.type === 'complete' && q.goal.target === storyTarget('adam'))).toBe(true);
    useStoriesStore.getState().completeStory('adam', [true, false]);
    const quest = useAppStore.getState().quests.find((q) => q.goal.type === 'complete' && q.goal.target === storyTarget('adam'));
    expect(quest?.completed).toBe(true);
  });

  it('puts wrong answers into the global review queue under stories: keys', () => {
    const key = storiesKey('adam-next');
    expect(useAppStore.getState().recordAnswer({ key, topic: 'adam', topicArea: 'prophets' }, false, 'quiz')).toBe(0);
    expect(useAppStore.getState().review[key]).toMatchObject({ key, topicArea: 'prophets', incorrectCount: 1 });
    expect(useAppStore.getState().recordAnswer({ key, topic: 'adam', topicArea: 'prophets' }, true, 'quiz')).toBeGreaterThanOrEqual(XP.correctAnswer);
    expect(useAppStore.getState().recordAnswer({ key, topic: 'adam', topicArea: 'prophets' }, true, 'quiz')).toBe(0);
  });
});

describe('badges and metrics', () => {
  it('reports metrics and earns Story Explorer, Perfect Score, History Learner, Prophet Explorer', () => {
    useStoriesStore.getState().completeStory('adam', allCorrect());
    let app = useAppStore.getState();
    expect(collectFeatureMetrics()).toMatchObject({ 'stories.completed': 1, perfectRuns: 1, 'stories.allCompleted': 0 });
    expect(app.badges.story_explorer).toBeDefined();
    expect(app.badges.perfect_score).toBeDefined();
    expect(app.badges.history_learner).toBeUndefined();

    for (const story of STORIES.slice(1)) useStoriesStore.getState().completeStory(story.id, [true, false]);
    app = useAppStore.getState();
    expect(collectFeatureMetrics()).toMatchObject({ 'stories.completed': STORIES.length, 'stories.allCompleted': 1, perfectRuns: 1 });
    expect(app.badges.history_learner).toBeDefined();
    expect(app.badges.prophet_explorer).toBeDefined();
  });

  it('earns Sabr Champion after every sabr lesson is learned', () => {
    const sabrStories = STORIES.filter((s) => s.lessons.some((l) => l.value === 'sabr'));
    for (const story of sabrStories.slice(0, -1)) useStoriesStore.getState().learnLessons(story.id);
    expect(useAppStore.getState().badges.sabr_champion).toBeUndefined();
    useStoriesStore.getState().learnLessons(sabrStories[sabrStories.length - 1].id);
    expect(collectFeatureMetrics()['stories.sabrLessonsLearned']).toBe(1);
    expect(useAppStore.getState().badges.sabr_champion).toBeDefined();
  });
});

describe('stories persistence', () => {
  it('sanitizes corrupt or unknown data', () => {
    expect(sanitizeStoriesData('broken')).toBeNull();
    expect(sanitizeStoriesData([])).toBeNull();
    const data = sanitizeStoriesData({
      stories: { adam: { completed: true, bestStars: 9, bestScore: 80, attempts: 1, completedAt: '2026-10-06' }, mars: { completed: true } },
      completedScenes: ['adam-s1', 'x', 4, 'adam-s1'],
      learnedLessons: ['adam-l1', 'nope'],
      perfectStories: ['adam', 'mars'],
      run: { storyId: 'adam', stepIndex: 99, results: [], xpEarned: 0 },
    });
    expect(data).toEqual({
      stories: { adam: { completed: true, bestStars: 3, bestScore: 80, attempts: 1, completedAt: '2026-10-06' } },
      completedScenes: ['adam-s1'],
      learnedLessons: ['adam-l1'],
      perfectStories: ['adam'],
      run: null,
    });
    expect(sanitizeStoriesData({ run: { storyId: 'nuh', stepIndex: 2, results: [true, 'x'], xpEarned: 5 } })?.run).toMatchObject({
      storyId: 'nuh',
      stepIndex: 2,
      results: [true],
      xpEarned: 5,
    });
  });

  it('reset clears the store and its storage', async () => {
    useStoriesStore.getState().completeStory('adam', allCorrect());
    useStoriesStore.getState().saveStep('nuh', 2, [true], 10);
    await savePersisted(STORIES_PERSIST, { ...EMPTY_STORIES, perfectStories: ['adam'] });
    await useStoriesStore.getState().reset();
    const state = useStoriesStore.getState();
    expect(state.stories).toEqual({});
    expect(state.run).toBeNull();
    expect(state.learnedLessons).toEqual([]);
    expect(await AsyncStorage.getItem(STORIES_PERSIST.key)).toBeNull();
  });

  it('is reset by the global resetProgress', async () => {
    useStoriesStore.getState().completeStory('adam', allCorrect());
    await useAppStore.getState().resetProgress();
    expect(useStoriesStore.getState().stories).toEqual({});
    expect(useAppStore.getState().xp).toBe(0);
    expect(useAppStore.getState().xpAwards).toEqual({});
  });
});
