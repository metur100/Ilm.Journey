import type { BadgeMetrics } from '@/core/models';

import type { Episode, Era, SeerahData } from '../models';
import { EPISODE_STEPS, GOOD_SCORE_PERCENT } from './engine';

export interface ContentCounts {
  episodes: readonly Episode[];
  events: number;
  people: number;
  places: number;
}

export interface Exploration {
  episodesCompleted: number;
  episodesTotal: number;
  eventsDiscovered: number;
  peopleDiscovered: number;
  placesDiscovered: number;
  /** 0..100 – share of all episodes, events, people and places explored. */
  explored: number;
  bookmarks: number;
  reflections: number;
}

export function completedEpisodes(data: SeerahData): string[] {
  return Object.entries(data.episodes)
    .filter(([, p]) => p.completedAt)
    .map(([id]) => id);
}

export function exploration(data: SeerahData, content: ContentCounts): Exploration {
  const episodesCompleted = completedEpisodes(data).filter((id) => content.episodes.some((e) => e.id === id)).length;
  const eventsDiscovered = Object.keys(data.discovered.event).length;
  const peopleDiscovered = Object.keys(data.discovered.person).length;
  const placesDiscovered = Object.keys(data.discovered.place).length;
  const total = content.episodes.length + content.events + content.people + content.places;
  const done =
    episodesCompleted +
    Math.min(eventsDiscovered, content.events) +
    Math.min(peopleDiscovered, content.people) +
    Math.min(placesDiscovered, content.places);
  return {
    episodesCompleted,
    episodesTotal: content.episodes.length,
    eventsDiscovered,
    peopleDiscovered,
    placesDiscovered,
    explored: total === 0 ? 0 : Math.round((done / total) * 100),
    bookmarks: data.bookmarks.length,
    reflections: Object.keys(data.reflections).length,
  };
}

/** The next episode to continue: the one in progress, otherwise the first not completed. */
export function continueEpisode(data: SeerahData, episodes: readonly Episode[]): Episode | null {
  const last = data.lastEpisodeId ? episodes.find((e) => e.id === data.lastEpisodeId) : undefined;
  if (last && !data.episodes[last.id]?.completedAt) return last;
  return episodes.find((e) => !data.episodes[e.id]?.completedAt) ?? null;
}

/** 0..1 progress through an episode's steps (1 when completed). */
export function episodeProgress(data: SeerahData, episodeId: string): number {
  const p = data.episodes[episodeId];
  if (!p) return 0;
  if (p.completedAt) return 1;
  return (EPISODE_STEPS.indexOf(p.step) + 1) / EPISODE_STEPS.length;
}

/**
 * Badge metrics for the core badge rules (sira's explorer badges, see FEATURE-PORTING.md §5):
 * first_journey, makkah_explorer, madinah_explorer, timeline_explorer, history_seeker,
 * reflective_mind, seerah_student, ten_episodes – plus this feature's share of `perfectRuns`.
 */
export function seerahMetrics(data: SeerahData, content: ContentCounts): BadgeMetrics {
  const done = new Set(completedEpisodes(data).filter((id) => content.episodes.some((e) => e.id === id)));
  const eraDone = (eras: Era[]) => {
    const list = content.episodes.filter((e) => eras.includes(e.era));
    return list.length > 0 && list.every((e) => done.has(e.id)) ? 1 : 0;
  };
  const passed = Object.entries(data.episodes).filter(
    ([id, p]) => done.has(id) && (p.bestScore ?? 0) >= GOOD_SCORE_PERCENT,
  ).length;
  return {
    'seerah.episodesCompleted': done.size,
    'seerah.makkahCompleted': eraDone(['before', 'makkah']),
    'seerah.madinahCompleted': eraDone(['madinah']),
    'seerah.timelineCompleted': content.events > 0 && Object.keys(data.discovered.event).length >= content.events ? 1 : 0,
    'seerah.peopleCompleted': content.people > 0 && Object.keys(data.discovered.person).length >= content.people ? 1 : 0,
    'seerah.reflections': Object.keys(data.reflections).length,
    'seerah.episodesPassed': passed,
    'seerah.allEpisodesCompleted': content.episodes.length > 0 && content.episodes.every((e) => done.has(e.id)) ? 1 : 0,
    perfectRuns: data.perfectEpisodes.filter((id) => done.has(id)).length,
  };
}
