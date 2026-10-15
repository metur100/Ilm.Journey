import { localize, localizedFrom, topicName, translate, translateNs } from '@/core/i18n';
import { type Language, TOPIC_IDS, type LocalizedText, type TopicId } from '@/core/models';
import {
  type CompletedItem,
  type ContinueItem,
  registerDailyPool,
  registerLifecycle,
  registerProgress,
  registerQuestions,
  registerQuestProvider,
  registerSearch,
  type SearchResult,
} from '@/core/registry';
import { getGame } from '@/core/games';
import type { QuestCandidate } from '@/core/services/quests';
import { topicThemes } from '@/core/theme';

import { registerLearnCollection } from './collection';
import { getQuestion, getUnit, LEARN_PREFIX, learnKey, testQuestionsOfArea, unitOfQuestion, UNITS } from './content';
import { registerTopicTool, type TopicPathItem } from './extensions';
import { learnI18n } from './i18n';
import { registerLearnQuests } from './quests/register';
import { buildTopicPath, nextPathEntry, pathItemHref, startedTopics } from './path';
import { isMasterPassed } from './services/progression';
import { masterTarget, startLearnAutoSave, unitTarget, useLearnStore } from './store/learnStore';

const topicText = (topic: TopicId): LocalizedText => localizedFrom((lang) => translate(lang, topicName(topic)));
const masterTitle = (topic: TopicId): LocalizedText =>
  localizedFrom((lang) => translateNs(learnI18n, lang, 'master.questTitle', { topic: translate(lang, topicName(topic)) }));

function pathItemTitle(topic: TopicId, item: TopicPathItem): LocalizedText {
  if (item.kind === 'unit') return getUnit(item.id)?.title ?? topicText(topic);
  if (item.kind === 'master') return masterTitle(topic);
  return item.title;
}

/** Topic suggested first: the last visited one, else Salah (the natural start for every learner group). */
function currentTopic(): TopicId {
  return useLearnStore.getState().lastVisited?.topic ?? 'salah';
}

function continueItem(): ContinueItem | null {
  const learn = useLearnStore.getState();
  const last = learn.lastVisited;
  if (!last) return null;
  const entry = buildTopicPath(last.topic, learn).find((e) => e.item.id === last.itemId && e.status !== 'completed') ?? nextPathEntry(last.topic, learn);
  if (!entry) return null;
  return {
    key: `learn:${entry.item.kind}:${entry.item.id}`,
    title: pathItemTitle(last.topic, entry.item),
    subtitle: topicText(last.topic),
    icon: topicThemes[last.topic].icon,
    topicArea: last.topic,
    href: pathItemHref(last.topic, entry.item),
    updatedAt: last.at,
  };
}

function recentlyCompleted(): CompletedItem[] {
  const learn = useLearnStore.getState();
  const units: CompletedItem[] = Object.entries(learn.units).flatMap(([id, progress]) => {
    const unit = getUnit(id);
    if (!unit || !progress.completed || !progress.completedAt) return [];
    return [{ key: `learn:unit:${id}`, title: unit.title, subtitle: topicText(unit.areaId), icon: topicThemes[unit.areaId].icon, topicArea: unit.areaId, href: { pathname: '/unit/[id]', params: { id } }, completedAt: progress.completedAt }];
  });
  const masters: CompletedItem[] = TOPIC_IDS.flatMap((topic) => {
    const master = learn.masters[topic];
    if (!master?.passed || !master.passedAt) return [];
    return [{ key: `learn:master:${topic}`, title: masterTitle(topic), icon: 'trophy', topicArea: topic, href: { pathname: '/topic/[id]', params: { id: topic } }, completedAt: master.passedAt }];
  });
  return [...units, ...masters];
}

function questCandidates(): QuestCandidate[] {
  const learn = useLearnStore.getState();
  const start = currentTopic();
  const order = [start, ...TOPIC_IDS.filter((t) => t !== start)];
  const candidates: QuestCandidate[] = [];
  for (const topic of order) {
    const entry = nextPathEntry(topic, learn);
    if (!entry) continue;
    const target = entry.item.kind === 'unit' ? unitTarget(entry.item.id) : entry.item.kind === 'master' ? masterTarget(topic) : entry.item.target;
    candidates.push({
      id: `learn-${entry.item.kind}-${entry.item.id}`,
      kind: entry.item.kind === 'master' ? 'challenge' : 'learning',
      target,
      title: pathItemTitle(topic, entry.item),
      topicArea: topic,
      priority: topic === start ? 10 : 1,
    });
    if (candidates.length >= 2) break;
  }
  return candidates;
}

function search(query: string, language: Parameters<typeof localize>[1]): SearchResult[] {
  const q = query.toLowerCase();
  const topics: SearchResult[] = TOPIC_IDS.filter((t) => translate(language, topicName(t)).toLowerCase().includes(q)).map((t) => ({
    key: `learn:topic:${t}`,
    feature: 'learn',
    title: translate(language, topicName(t)),
    icon: topicThemes[t].icon,
    href: { pathname: '/topic/[id]', params: { id: t } },
    score: 3,
  }));
  const units: SearchResult[] = UNITS.flatMap((u) => {
    const title = localize(u.title, language);
    const description = localize(u.description, language);
    const inTitle = title.toLowerCase().includes(q);
    if (!inTitle && !description.toLowerCase().includes(q)) return [];
    return [{ key: `learn:unit:${u.id}`, feature: 'learn', title, subtitle: translate(language, topicName(u.areaId)), icon: 'book', href: { pathname: '/unit/[id]', params: { id: u.id } }, score: inTitle ? 2 : 1 }];
  });
  return [...topics, ...units];
}

/** Registers the Learn feature with the core registry. Called once from `src/features/index.ts`. */
export function registerLearnFeature(): void {
  registerQuestions(LEARN_PREFIX, {
    get: getQuestion,
    context: (id) => {
      const unit = unitOfQuestion(id);
      return unit ? { title: unit.title, topicArea: unit.areaId, icon: topicThemes[unit.areaId].icon } : undefined;
    },
  });

  registerProgress('learn', {
    subscribe: (listener) => useLearnStore.subscribe(listener),
    metrics: () => {
      const learn = useLearnStore.getState();
      const mastered = (topic: TopicId) => (isMasterPassed(topic, learn.masters) ? 1 : 0);
      return {
        lessonsCompleted: Object.values(learn.units).filter((u) => u.completed).length,
        perfectRuns: learn.perfectUnits.length,
        'learn.mastered.salah': mastered('salah'),
        'learn.mastered.quran': mastered('quran'),
        'learn.mastered.seerah': mastered('seerah'),
        'learn.mastered.akhlaq': mastered('akhlaq'),
        'learn.mastered.ramadan': mastered('ramadan'),
        'learn.mastered.arabic': mastered('arabic'),
        'learn.topicsMastered': TOPIC_IDS.filter((t) => isMasterPassed(t, learn.masters)).length,
        'learn.topicsStarted': startedTopics(learn).length,
      };
    },
    topicQuestionKeys: () => Object.fromEntries(TOPIC_IDS.map((t) => [t, testQuestionsOfArea(t).map((q) => learnKey(q.id))])),
    continueItem,
    recentlyCompleted,
  });

  registerDailyPool('learn', () => UNITS.flatMap((u) => u.testIds.map((id) => getQuestion(id)).filter((q) => q !== undefined).map((q) => ({ key: learnKey(q.id), question: q }))));

  registerQuestProvider('learn', questCandidates);

  registerSearch('learn', search);

  registerLifecycle('learn', {
    hydrate: () => useLearnStore.getState().hydrate(),
    reset: () => useLearnStore.getState().reset(),
    autoSave: startLearnAutoSave,
  });

  // Topic tools that link to the other tabs. The islam-quest port adds Quran memorization,
  // Arabic tracing and the Ramadan calendar with `registerTopicTool` from its own files.
  registerTopicTool({
    id: 'prophets-stories',
    topic: 'prophets',
    order: 10,
    icon: 'scroll',
    label: (lang) => translateNs(learnI18n, lang, 'tool.stories'),
    description: (lang) => translateNs(learnI18n, lang, 'tool.storiesDesc'),
    href: '/(tabs)/stories',
  });
  registerTopicTool({
    id: 'seerah-journey',
    topic: 'seerah',
    order: 10,
    icon: 'kaaba',
    label: (lang) => translateNs(learnI18n, lang, 'tool.seerah'),
    description: (lang) => translateNs(learnI18n, lang, 'tool.seerahDesc'),
    href: { pathname: '/(tabs)/stories', params: { segment: 'seerah' } },
  });
  registerTopicTool({
    id: 'arabic-sufara',
    topic: 'arabic',
    order: 30,
    icon: 'letter',
    label: () => 'Sufara',
    description: (lang) => ({
      bs: 'Vježbaj svaki harf, njegove oblike i kratke vokale.',
      de: 'Übe jeden Buchstaben, seine Formen und kurze Vokale.',
      en: 'Practise every letter, its word forms and short vowels.',
    })[lang],
    href: '/sufara',
  });

  // v2 game linked from topic pages ("A Day of Good Deeds" – its level 3 is a Ramadan day). Texts come from the game.
  const gameText = (id: string, lang: Language, key: 'title' | 'description') => {
    const game = getGame(id);
    // Until the game registers (games register after the features), the label falls back to the core "Play".
    return game ? translateNs(game.i18n, lang, key) : key === 'title' ? translate(lang, 'play.title') : '';
  };
  registerTopicTool({
    id: 'game-good-deeds-day-akhlaq',
    topic: 'akhlaq',
    order: 40,
    icon: 'play',
    label: (lang) => gameText('good-deeds-day', lang, 'title'),
    description: (lang) => gameText('good-deeds-day', lang, 'description'),
    href: { pathname: '/game/[id]', params: { id: 'good-deeds-day' } },
  });
  registerTopicTool({
    id: 'game-salah-guide',
    topic: 'salah',
    order: 40,
    icon: 'play',
    label: (lang) => gameText('salah-guide', lang, 'title'),
    description: (lang) => gameText('salah-guide', lang, 'description'),
    href: { pathname: '/game/[id]', params: { id: 'salah-guide' } },
  });
  registerTopicTool({
    id: 'game-ramadan-journey',
    topic: 'ramadan',
    order: 40,
    icon: 'play',
    label: (lang) => gameText('ramadan-journey', lang, 'title'),
    description: (lang) => gameText('ramadan-journey', lang, 'description'),
    href: { pathname: '/game/[id]', params: { id: 'ramadan-journey' } },
  });

  // islam-quest beginner quests and topic tools (owned by the islam-quest port).
  registerLearnQuests();
  registerLearnCollection();
}
