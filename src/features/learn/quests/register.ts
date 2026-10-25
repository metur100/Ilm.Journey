/**
 * islam-quest port – beginner quests and topic tools of the Learn feature (called by `features/learn/register.ts`).
 *
 * Keep this import chain free of expo-audio (no screens, no AnswerOption/useFeedback): jest tests call
 * `registerFeatures()`. Question renderers are therefore loaded lazily (see components/lazyRenderers).
 */
import { localize, localizedFrom, topicName, translate, translateNs } from '@/core/i18n';
import type { Language, TopicId } from '@/core/models';
import {
  type CompletedItem,
  registerDailyPool,
  registerLifecycle,
  registerMemorizationReader,
  registerProgress,
  registerQuestionRenderer,
  registerQuestions,
  registerSearch,
  type SearchResult,
} from '@/core/registry';
import { topicThemes } from '@/core/theme';
import { listDuas, listSurahs } from '@/features/quran';

import { getQuest, LESSONS, QUESTS, questionsOfTopic, questOfQuestionId } from '../content/quests';
import { getSufaraLesson } from '../sufara/course';
import { registerPathSource, registerTopicTool } from '../extensions';
import { LazyAyahOrderQuestion, LazyMissingWordQuestion } from './components/lazyRenderers';
import { questI18n } from './i18n';
import { QUEST_WORLDS } from './models';
import { dailyCandidates, getAnyQuestQuestion, QUEST_PREFIX, questQuestionKey } from './services/questions';
import { questPathItems } from './services/status';
import { questTarget, startQuestAutoSave, useQuestStore } from './store/questStore';

const topicLabel = (lang: Language, topic: TopicId) => translate(lang, topicName(topic));

function recentlyCompleted(): CompletedItem[] {
  const { quests } = useQuestStore.getState();
  return QUESTS.flatMap((quest) => {
    const progress = quests[quest.id];
    if (!progress?.completed || !progress.completedAt) return [];
    return [
      {
        key: questTarget(quest.id),
        title: quest.title,
        subtitle: localizedFrom((lang) => topicLabel(lang, quest.worldId)),
        icon: topicThemes[quest.worldId].icon,
        topicArea: quest.worldId,
        href: { pathname: '/quest/[id]', params: { id: quest.id } },
        completedAt: progress.completedAt,
      },
    ];
  });
}

function search(query: string, language: Language): SearchResult[] {
  const q = query.toLowerCase();
  const has = (text: string) => text.toLowerCase().includes(q);
  const quests: SearchResult[] = QUESTS.flatMap((quest) => {
    const title = localize(quest.title, language);
    if (!has(title) && !has(localize(quest.description, language))) return [];
    return [
      {
        key: `quest:quest:${quest.id}`,
        feature: QUEST_PREFIX,
        title,
        subtitle: translateNs(questI18n, language, 'search.quest', { topic: topicLabel(language, quest.worldId) }),
        icon: 'flag',
        href: { pathname: '/quest/[id]', params: { id: quest.id } },
        score: has(title) ? 2 : 1,
      },
    ];
  });
  const lessons: SearchResult[] = LESSONS.flatMap((lesson) => {
    const title = localize(lesson.title, language);
    if (!has(title) && !has(localize(lesson.summary, language))) return [];
    return [
      {
        key: `quest:lesson:${lesson.id}`,
        feature: QUEST_PREFIX,
        title,
        subtitle: translateNs(questI18n, language, 'search.lesson', { topic: topicLabel(language, lesson.worldId) }),
        icon: 'book',
        href: { pathname: '/lesson/[id]', params: { id: lesson.id } },
        score: has(title) ? 2 : 1,
      },
    ];
  });
  const duas: SearchResult[] = listDuas().flatMap((dua) => {
    const title = localize(dua.title, language);
    if (!has(title) && !has(dua.surah.nameTransliterated)) return [];
    return [
      {
        key: `quest:dua:${dua.id}`,
        feature: QUEST_PREFIX,
        title,
        subtitle: `${translateNs(questI18n, language, 'search.dua')} · ${dua.ref}`,
        icon: 'quran',
        href: { pathname: '/tools/duas/[id]', params: { id: dua.id } },
        score: 1,
      },
    ];
  });
  const surahs: SearchResult[] = listSurahs().flatMap((s) => {
    const meaning = s.nameMeaningLocalized?.[language] ?? s.nameMeaning;
    if (!has(s.nameTransliterated) && !has(meaning)) return [];
    return [
      {
        key: `quest:surah:${s.number}`,
        feature: QUEST_PREFIX,
        title: `${s.nameTransliterated} – ${meaning}`,
        subtitle: translateNs(questI18n, language, 'search.surah', { number: s.number }),
        icon: 'quran',
        href: { pathname: '/tools/quran/[surah]', params: { surah: String(s.number) } },
        score: 1,
      },
    ];
  });
  return [...quests, ...lessons, ...duas, ...surahs];
}

export function registerLearnQuests(): void {
  // 1. Beginner quests at the start of the topic paths (order 10 → before the units at 50).
  registerPathSource({ id: 'quests', order: 10, items: (topic) => questPathItems(topic, useQuestStore.getState()) });

  // 2. Questions (`quest:<questionId>`, facts as `quest:fact-<factId>`) for review, daily challenge and radar.
  registerQuestions(QUEST_PREFIX, {
    get: getAnyQuestQuestion,
    context: (id) => {
      const quest = questOfQuestionId(id);
      if (quest) return { title: quest.title, topicArea: quest.worldId, icon: topicThemes[quest.worldId].icon };
      const question = getAnyQuestQuestion(id);
      if (!question?.areaId) return undefined;
      return { title: localizedFrom((lang) => translateNs(questI18n, lang, 'fact.label')), topicArea: question.areaId, icon: 'sparkle' };
    },
  });
  registerQuestionRenderer('missingWord', { Component: LazyMissingWordQuestion, hideCorrectAnswer: false });
  registerQuestionRenderer('ayahOrder', { Component: LazyAyahOrderQuestion, hideCorrectAnswer: true });

  // 3. Progress: badge metrics, knowledge radar, recently completed. (Continue is handled by learn's path.)
  registerProgress(QUEST_PREFIX, {
    subscribe: (listener) => useQuestStore.subscribe(listener),
    metrics: () => {
      const s = useQuestStore.getState();
      return {
        lessonsCompleted: s.completedLessons.filter((id) => LESSONS.some((l) => l.id === id) || getSufaraLesson(id) !== undefined).length,
        'learn.questsCompleted': QUESTS.filter((q) => s.quests[q.id]?.completed).length,
        perfectRuns: s.perfectQuests.filter((id) => getQuest(id) !== undefined).length,
      };
    },
    topicQuestionKeys: () => Object.fromEntries(QUEST_WORLDS.map((topic) => [topic, questionsOfTopic(topic).map((q) => questQuestionKey(q.id))])),
    recentlyCompleted,
  });

  // 4. Daily challenge candidates (islam-quest kinds: question, scenario, mini quiz, memory, fact).
  registerDailyPool(QUEST_PREFIX, dailyCandidates);

  // 5. Search.
  registerSearch(QUEST_PREFIX, search);

  // 6. Lifecycle.
  registerLifecycle(QUEST_PREFIX, {
    hydrate: () => useQuestStore.getState().hydrate(),
    reset: () => useQuestStore.getState().reset(),
    autoSave: startQuestAutoSave,
  });
  // Read-only memorisation signal for games (e.g. Ayah Builder prefers surahs the learner is memorising).
  registerMemorizationReader(() =>
    Object.fromEntries(Object.entries(useQuestStore.getState().memorization).map(([surah, memo]) => [Number(surah), memo.learned])),
  );

  // 7. Topic tools. (The Juz ʿAmma surahs have no list card: every surah is already a step of the Quran path.)
  registerTopicTool({
    id: 'quran-duas',
    topic: 'quran',
    order: 30,
    icon: 'heart',
    label: (lang) => translateNs(questI18n, lang, 'tool.duas'),
    description: (lang) => translateNs(questI18n, lang, 'tool.duasDesc'),
    href: '/tools/duas',
  });
  registerTopicTool({
    id: 'arabic-alphabet',
    topic: 'sufara',
    order: 20,
    icon: 'letter',
    label: (lang) => translateNs(questI18n, lang, 'tool.arabic'),
    description: (lang) => translateNs(questI18n, lang, 'tool.arabicDesc'),
    href: '/tools/arabic',
  });
  registerTopicTool({
    id: 'ramadan-calendar',
    topic: 'ramadan',
    order: 20,
    icon: 'calendar',
    label: (lang) => translateNs(questI18n, lang, 'tool.ramadan'),
    description: (lang) => translateNs(questI18n, lang, 'tool.ramadanDesc'),
    href: '/tools/ramadan',
  });
}
