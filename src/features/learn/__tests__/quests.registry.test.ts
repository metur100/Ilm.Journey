import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clearRegistryForTests,
  collectFeatureMetrics,
  collectTopicQuestionKeys,
  getDailyCandidates,
  getQuestCandidates,
  getQuestionByKey,
  getQuestionRenderer,
  getRecentlyCompleted,
  searchAll,
} from '@/core/registry';
import { TOPIC_IDS } from '@/core/models';
import { createInitialData } from '@/core/services/engine';
import { XP } from '@/core/services/xp';
import { savePersisted } from '@/core/storage';
import { useAppStore } from '@/core/store/appStore';
import { unitsOfArea } from '@/features/learn/content';
import { getQuest, questsOfTopic } from '@/features/learn/content/quests';
import { clearLearnExtensionsForTests, getTopicTools } from '@/features/learn/extensions';
import { buildTopicPath, isUnitTaughtElsewhere, nextPathEntry } from '@/features/learn/path';
import { EMPTY_QUEST_DATA } from '@/features/learn/quests/services/progress';
import { questStatus as statusOfQuest } from '@/features/learn/quests/services/status';
import { lessonXpReason, QUEST_PERSIST, questTarget, questXpReason, useQuestStore } from '@/features/learn/quests/store/questStore';
import { registerLearnFeature } from '@/features/learn/register';
import { EMPTY_LEARN } from '@/features/learn/services/progression';
import { useLearnStore } from '@/features/learn/store/learnStore';
import { surahsTaughtByQuests } from '@/features/learn/tools/paths';

const learn = () => useLearnStore.getState();
const questStatus = (id: string) => statusOfQuest(getQuest(id)!);
const completeAll = (topic: 'salah' | 'quran' | 'akhlaq' | 'ramadan' | 'arabic') => {
  for (const q of questsOfTopic(topic)) useQuestStore.getState().completeQuest(q.id, [true]);
};

beforeEach(async () => {
  await AsyncStorage.clear();
  clearRegistryForTests();
  clearLearnExtensionsForTests();
  registerLearnFeature();
  useLearnStore.setState({ ...EMPTY_LEARN, hydrated: true });
  useQuestStore.setState({ ...EMPTY_QUEST_DATA, hydrated: true });
  useAppStore.setState({ ...createInitialData('en'), hydrated: true, celebrations: [], celebrationsPaused: false });
});

describe('question registry', () => {
  it('resolves quest questions via getQuestionByKey("quest:…") with quest context and topic', () => {
    const resolved = getQuestionByKey('quest:salah-pillar');
    expect(resolved?.question.id).toBe('salah-pillar');
    expect(resolved?.topicArea).toBe('salah');
    expect(resolved?.context?.title).toEqual(getQuest('salah-q1')?.title);
    expect(getQuestionByKey('quest:ikhlas-word-1')?.question.type).toBe('missingWord');
    expect(getQuestionByKey('quest:fatiha-order')?.question.type).toBe('ayahOrder');
    expect(getQuestionByKey('quest:does-not-exist')).toBeUndefined();
  });

  it('resolves fact questions (daily "Did you know?")', () => {
    const fact = getQuestionByKey('quest:fact-prophets-fact-yusuf');
    expect(fact?.question).toMatchObject({ type: 'trueFalse', correct: true, areaId: 'prophets' });
    expect(fact?.question.prompt.en).toContain('Surah Yusuf');
    expect(fact?.question.sources).toEqual([{ sourceName: 'Quran', sourceReference: '12' }]);
    expect(getQuestionByKey('quest:fact-nope')).toBeUndefined();
  });

  it('registers renderers for the Quran question types', () => {
    expect(getQuestionRenderer('missingWord')).toBeDefined();
    expect(getQuestionRenderer('ayahOrder')?.hideCorrectAnswer).toBe(true);
  });

  it('offers questions, scenarios, memory games and facts to the daily challenge and the radar', () => {
    const keys = getDailyCandidates().map((c) => c.key);
    expect(keys).toEqual(expect.arrayContaining(['quest:salah-pillar', 'quest:akhlaq-toy', 'quest:salah-memory', 'quest:fact-salah-fact-qibla']));
    for (const key of keys.filter((k) => k.startsWith('quest:'))) expect(getQuestionByKey(key)).toBeDefined();
    const radar = collectTopicQuestionKeys().find((m) => (m.salah ?? []).includes('quest:salah-pillar'));
    expect(radar?.quran).toContain('quest:ikhlas-word-1');
    expect(radar?.salah?.some((k) => k.includes('fact-'))).toBe(false);
  });

  it('finds quests, lessons, duas and surahs in search', () => {
    const results = searchAll('wudu', 'en').map((r) => r.key);
    expect(results.some((k) => k.startsWith('quest:lesson:'))).toBe(true);
    expect(searchAll('Ikhl', 'en').some((r) => r.key === 'quest:surah:112')).toBe(true);
  });
});

describe('topic path', () => {
  it('puts the beginner quests first; they unlock one after another, then the units', () => {
    const path = buildTopicPath('salah', learn());
    const quests = questsOfTopic('salah');
    expect(path.slice(0, quests.length).map((e) => e.item.id)).toEqual(quests.map((q) => q.id));
    expect(path[0].status).toBe('available');
    expect(path[1].status).toBe('locked');
    expect(path.find((e) => e.item.kind === 'unit')?.status).toBe('locked');
    expect(path[0].item).toMatchObject({ kind: 'quest', target: 'quest:salah-q1' });

    useQuestStore.getState().completeQuest('salah-q1', [true]);
    expect(questStatus('salah-q1')).toBe('completed');
    expect(questStatus('salah-q2')).toBe('available');
    expect(questStatus('salah-q3')).toBe('locked');

    completeAll('salah');
    expect(buildTopicPath('salah', learn()).find((e) => e.item.kind === 'unit')?.status).toBe('available');
    expect(nextPathEntry('salah', learn())?.item.id).toBe(unitsOfArea('salah').find((u) => !isUnitTaughtElsewhere(u.id))?.id);
  });

  it('adds all 25 prophet stories and all 38 surahs as steps – each surah once', () => {
    expect(buildTopicPath('history', learn()).some((e) => e.item.kind === 'quest')).toBe(false);
    expect(buildTopicPath('prophets', learn()).filter((e) => e.item.kind === 'quest')).toHaveLength(25);
    const surahSteps = buildTopicPath('quran', learn()).filter((e) => e.item.kind === 'quest' && e.item.id.startsWith('surah-'));
    const taught = surahsTaughtByQuests();
    expect([...taught].sort((a, b) => a - b)).toEqual([1, 103, 108, 112, 113, 114]);
    expect(surahSteps).toHaveLength(38 - taught.size);
    for (const n of taught) expect(surahSteps.some((e) => e.item.id === `surah-${n}`)).toBe(false);
  });

  it('suggests the next quest as today’s learning quest and completes it', () => {
    const [first] = getQuestCandidates({ day: '2026-10-06' });
    expect(first).toMatchObject({ kind: 'learning', target: questTarget('salah-q1') });
    useAppStore.getState().refreshQuests(true);
    useQuestStore.getState().completeQuest('salah-q1', [true]);
    expect(useAppStore.getState().quests.find((q) => q.kind === 'learning')?.completed).toBe(true);
  });

  it('registers the topic tools for quran, sufara, ramadan and salah – no games, no list of the path steps', () => {
    expect(getTopicTools('quran').map((t) => t.href)).toEqual(['/tools/duas']);
    expect(getTopicTools('sufara').map((t) => t.href)).toEqual(['/tools/arabic']);
    expect(getTopicTools('arabic')).toEqual([]);
    expect(getTopicTools('ramadan').map((t) => t.href)).toEqual(['/tools/ramadan']);
    expect(getTopicTools('salah').map((t) => t.href)).toEqual(['/tools/salah']);
    expect(getTopicTools('prophets')).toEqual([]);
    for (const topic of TOPIC_IDS) for (const tool of getTopicTools(topic)) expect(JSON.stringify(tool.href)).not.toContain('/game/');
    for (const topic of TOPIC_IDS) {
      for (const tool of getTopicTools(topic)) {
        for (const lang of ['en', 'de', 'bs'] as const) expect(tool.label(lang).length).toBeGreaterThan(0);
      }
    }
  });
});

describe('XP, badges and streak', () => {
  it('awards quest completion XP once, the perfect bonus once, and counts the streak', () => {
    const first = useQuestStore.getState().completeQuest('salah-q1', [true, true, true]);
    expect(first.firstCompletion).toBe(true);
    expect(first.xp).toBeGreaterThanOrEqual(XP.questComplete + XP.perfectQuestBonus);
    const app = useAppStore.getState();
    expect(app.xpAwards).toMatchObject({ [questXpReason('salah-q1', 'complete')]: XP.questComplete, [questXpReason('salah-q1', 'perfect')]: XP.perfectQuestBonus });
    expect(app.streak.current).toBe(1);
    expect(app.badges.first_quest).toBeDefined();
    expect(app.badges.perfect_score).toBeDefined();

    const xpBefore = useAppStore.getState().xp;
    const again = useQuestStore.getState().completeQuest('salah-q1', [true, true, true]);
    expect(again).toMatchObject({ firstCompletion: false, xp: 0, lines: [] });
    expect(useAppStore.getState().xp).toBe(xpBefore);
    expect(useQuestStore.getState().quests['salah-q1'].attempts).toBe(2);
  });

  it('awards lesson XP once and earns first_lesson', () => {
    expect(useQuestStore.getState().completeLesson('salah-what')).toBe(XP.questLesson);
    expect(useQuestStore.getState().completeLesson('salah-what')).toBe(0);
    expect(useAppStore.getState().xpAwards[lessonXpReason('salah-what')]).toBe(XP.questLesson);
    expect(useAppStore.getState().badges.first_lesson).toBeDefined();
  });

  it('records answers under quest: keys (XP once, mistakes to review)', () => {
    const app = useAppStore.getState();
    expect(app.recordAnswer({ key: 'quest:salah-pillar', topic: 'salah', topicArea: 'salah' }, true, 'quiz')).toBe(XP.correctAnswer);
    expect(useAppStore.getState().recordAnswer({ key: 'quest:salah-pillar', topic: 'salah', topicArea: 'salah' }, true, 'quiz')).toBe(0);
    useAppStore.getState().recordAnswer({ key: 'quest:salah-order', topic: 'salah', topicArea: 'salah' }, false, 'quiz');
    expect(useAppStore.getState().review['quest:salah-order']).toBeDefined();
  });

  it('reports only its own badge metrics', () => {
    useQuestStore.getState().completeLesson('salah-what');
    useQuestStore.getState().completeQuest('salah-q1', [true]);
    useQuestStore.getState().completeQuest('salah-q2', [true, false]);
    const metrics = collectFeatureMetrics();
    expect(metrics['learn.questsCompleted']).toBe(2);
    expect(metrics.lessonsCompleted).toBe(1);
    expect(metrics.perfectRuns).toBe(1);
    expect(getRecentlyCompleted().map((i) => i.key)).toEqual(expect.arrayContaining(['quest:salah-q1', 'quest:salah-q2']));
  });
});

describe('persistence', () => {
  it('hydrates and sanitizes ilmjourney:quest', async () => {
    expect(QUEST_PERSIST.key).toBe('ilmjourney:quest');
    await savePersisted(QUEST_PERSIST, { ...EMPTY_QUEST_DATA, completedLessons: ['salah-what'], duasFavourite: ['x'] });
    useQuestStore.setState({ ...EMPTY_QUEST_DATA, hydrated: false });
    await useQuestStore.getState().hydrate();
    expect(useQuestStore.getState()).toMatchObject({ hydrated: true, completedLessons: ['salah-what'], duasFavourite: ['x'] });
  });

  it('is cleared by the global "Reset progress"', async () => {
    useQuestStore.getState().completeQuest('salah-q1', [true]);
    useQuestStore.getState().toggleRamadanDeed(1, 'quran');
    useQuestStore.getState().setAyahLearned(112, 1, true);
    await savePersisted(QUEST_PERSIST, { ...EMPTY_QUEST_DATA, completedLessons: ['salah-what'] });
    await useAppStore.getState().resetProgress();
    expect(useQuestStore.getState()).toMatchObject({ quests: {}, ramadanDeeds: {}, memorization: {}, completedLessons: [] });
    expect(await AsyncStorage.getItem(QUEST_PERSIST.key)).toBeNull();
    expect(useAppStore.getState().xp).toBe(0);
  });
});
