import type { Href } from 'expo-router';
import { type ComponentType, createElement } from 'react';

import { localize, translateNs } from '@/core/i18n';
import type { Language } from '@/core/models';
import {
  type CompletedItem,
  type ContinueItem,
  registerDailyPool,
  registerHomeSection,
  registerLifecycle,
  registerProfileLink,
  registerProgress,
  registerQuestions,
  registerQuestProvider,
  registerSearch,
  registerSourceResolver,
  type SearchResult,
} from '@/core/registry';
import type { QuestCandidate } from '@/core/services/quests';

import { registerSeerahCollection } from './collection';
import {
  EPISODES,
  episodeOfQuestion,
  getEpisode,
  getEvent,
  getPerson,
  getPlace,
  getQuestion,
  getSource,
  getTheme,
  QUESTIONS,
  resolve,
  SEERAH_CONTENT,
  SEERAH_PREFIX,
  seerahKey,
} from './content';
import { seerahI18n } from './i18n';
import { continueEpisode, episodeProgress, seerahMetrics } from './services/progress';
import { search as searchSeerah, type SearchType } from './services/search';
import { toSourceRef } from './services/sources';
import { CONTENT_COUNTS, episodeTarget, pickSeerah, startSeerahAutoSave, useSeerahStore } from './store/seerahStore';

const ICON: Record<SearchType, string> = { episode: 'book', event: 'calendar', person: 'feather', place: 'pin', theme: 'tag' };

function nodeHref(type: SearchType, id: string): Href {
  switch (type) {
    case 'episode':
      return { pathname: '/seerah/episode/[id]', params: { id } };
    case 'event':
      return { pathname: '/seerah/event/[id]', params: { id } };
    case 'person':
      return { pathname: '/seerah/person/[id]', params: { id } };
    case 'place':
      return { pathname: '/seerah/place/[id]', params: { id } };
    case 'theme':
      return { pathname: '/seerah/theme/[id]', params: { id } };
  }
}

function nodeTitle(type: SearchType, id: string, language: Language): string {
  const text =
    type === 'episode'
      ? getEpisode(id)?.title
      : type === 'event'
        ? getEvent(id)?.title
        : type === 'person'
          ? getPerson(id)?.name
          : type === 'place'
            ? getPlace(id)?.name
            : getTheme(id)?.name;
  return localize(text, language);
}

/** Seerah search provider for `searchAll` (the global search across every feature). */
export function searchProvider(query: string, language: Language): SearchResult[] {
  return searchSeerah(query, language, SEERAH_CONTENT).map((hit) => ({
    key: `seerah:${hit.type}:${hit.id}`,
    feature: 'seerah',
    title: nodeTitle(hit.type, hit.id, language),
    subtitle: `${translateNs(seerahI18n, language, 'tab.title')} · ${translateNs(seerahI18n, language, `type.${hit.type}`)}`,
    icon: ICON[hit.type],
    href: nodeHref(hit.type, hit.id),
    score: hit.score,
  }));
}

function continueItem(): ContinueItem | null {
  const data = pickSeerah(useSeerahStore.getState());
  const last = data.lastEpisodeId ? getEpisode(data.lastEpisodeId) : undefined;
  const progress = last ? data.episodes[last.id] : undefined;
  if (!last || !progress || progress.completedAt) return null;
  return {
    key: `seerah:episode:${last.id}`,
    title: last.title,
    subtitle: last.subtitle,
    icon: 'kaaba',
    topicArea: 'seerah',
    href: { pathname: '/seerah/episode/[id]', params: { id: last.id } },
    updatedAt: progress.updatedAt,
    progress: episodeProgress(data, last.id),
  };
}

function recentlyCompleted(): CompletedItem[] {
  const data = useSeerahStore.getState();
  return EPISODES.flatMap((e) => {
    const completedAt = data.episodes[e.id]?.completedAt;
    return completedAt
      ? [{ key: `seerah:episode:${e.id}`, title: e.title, subtitle: e.period, icon: 'kaaba', topicArea: 'seerah' as const, href: { pathname: '/seerah/episode/[id]', params: { id: e.id } } as Href, completedAt }]
      : [];
  });
}

function questCandidates(): QuestCandidate[] {
  const next = continueEpisode(pickSeerah(useSeerahStore.getState()), EPISODES);
  return next ? [{ id: `seerah-${next.id}`, kind: 'episode', target: episodeTarget(next.id), title: next.title, topicArea: 'seerah', priority: 5 }] : [];
}

/**
 * "Today's Seerah" home card. The component module is loaded on first render, so registering the
 * feature (also in tests) does not pull UI modules (sound / expo-audio) into the import graph.
 */
const TodaysSeerahSection: ComponentType = () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { default: Section } = require('./components/TodaysSeerah') as typeof import('./components/TodaysSeerah');
  return createElement(Section);
};

/** Registers the Seerah feature (sira port) with the core registry. Called once from `src/features/index.ts`. */
export function registerSeerahFeature(): void {
  // Questions for the global review centre and the daily challenge (key `seerah:<questionId>`).
  registerQuestions(SEERAH_PREFIX, {
    get: getQuestion,
    context: (id) => {
      const episode = episodeOfQuestion(id);
      return episode ? { title: episode.title, topicArea: 'seerah', icon: 'kaaba' } : undefined;
    },
  });

  // Sira questions cite structured sources by id; the feedback panel shows sira's short labels.
  registerSourceResolver('seerah', (ids, question) => (question.episodeId && getQuestion(question.id)?.episodeId === question.episodeId ? resolve(ids, getSource).map(toSourceRef) : []));

  registerProgress('seerah', {
    subscribe: (listener) => useSeerahStore.subscribe(listener),
    metrics: () => seerahMetrics(pickSeerah(useSeerahStore.getState()), CONTENT_COUNTS),
    topicQuestionKeys: () => ({ seerah: QUESTIONS.map((q) => seerahKey(q.id)) }),
    continueItem,
    recentlyCompleted,
  });

  // Sira's daily question joins the app-wide daily challenge.
  registerDailyPool('seerah', () => QUESTIONS.map((q) => ({ key: seerahKey(q.id), question: q })));

  registerQuestProvider('seerah', questCandidates);

  registerSearch('seerah', searchProvider);

  registerHomeSection({ id: 'todays-seerah', order: 50, Component: TodaysSeerahSection });

  registerProfileLink({ id: 'seerah-bookmarks', order: 50, icon: 'bookmark', label: (lang) => translateNs(seerahI18n, lang, 'link.bookmarks'), href: '/seerah/bookmarks' });
  registerProfileLink({ id: 'seerah-reflections', order: 51, icon: 'feather', label: (lang) => translateNs(seerahI18n, lang, 'link.reflections'), href: '/seerah/reflections' });

  registerLifecycle('seerah', {
    hydrate: () => useSeerahStore.getState().hydrate(),
    reset: () => useSeerahStore.getState().reset(),
    autoSave: startSeerahAutoSave,
  });
  registerSeerahCollection();
}
