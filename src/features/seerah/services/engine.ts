import { isPerfect, type QuizScore, scoreQuiz } from '@/core/services/quiz';
import { withDefaults } from '@/core/storage';

import type { Bookmark, BookmarkType, DiscoveryType, EpisodeStep, SeerahData } from '../models';

/**
 * Pure state transitions of the Seerah store (ported from sira's engine). Global things – XP,
 * the review queue, badges, streak – are handled by the core store; this only keeps Seerah progress.
 */

export const EPISODE_STEPS: readonly EpisodeStep[] = [
  'introduction',
  'context',
  'timeline',
  'mainEvent',
  'people',
  'locations',
  'explore',
  'challenge',
  'lesson',
  'reflection',
  'sources',
];

export const CHALLENGE_INDEX = EPISODE_STEPS.indexOf('challenge');

/** A quiz counts as passed for the "Seerah Student" badge from 70 %. */
export const GOOD_SCORE_PERCENT = 70;

/** Small, fixed XP rewards for exploring (sira's knowledge points), granted once per item via `awardXp`. */
export const SEERAH_XP = { discovery: 2, reflection: 5 } as const;

export const MAX_REFLECTION_LENGTH = 2000;

export function createEmptySeerah(): SeerahData {
  return {
    episodes: {},
    lastEpisodeId: null,
    quizResults: [],
    perfectEpisodes: [],
    bookmarks: [],
    reflections: {},
    discovered: { event: {}, person: {}, place: {} },
  };
}

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const isString = (v: unknown): v is string => typeof v === 'string';

/** Repairs stored data: wrong shapes fall back to defaults, broken entries are dropped. */
export function sanitizeSeerahData(raw: unknown): SeerahData | null {
  if (!isRecord(raw)) return null;
  const data = withDefaults(createEmptySeerah(), raw);
  const steps = new Set<string>(EPISODE_STEPS);
  data.episodes = Object.fromEntries(
    Object.entries(data.episodes)
      .filter(([, p]) => isRecord(p) && steps.has(p.step as string) && isString(p.startedAt))
      .map(([id, p]) => [
        id,
        {
          step: p.step,
          startedAt: p.startedAt,
          updatedAt: isString(p.updatedAt) ? p.updatedAt : p.startedAt,
          completedAt: isString(p.completedAt) ? p.completedAt : null,
          bestScore: typeof p.bestScore === 'number' && Number.isFinite(p.bestScore) ? p.bestScore : null,
        },
      ]),
  );
  if (data.lastEpisodeId !== null && !isString(data.lastEpisodeId)) data.lastEpisodeId = null;
  data.quizResults = data.quizResults.filter(
    (r) => isRecord(r) && isString(r.episodeId) && typeof r.correct === 'number' && typeof r.total === 'number' && typeof r.percent === 'number' && isString(r.date),
  );
  data.perfectEpisodes = data.perfectEpisodes.filter(isString);
  const types = new Set<string>(['episode', 'event', 'person', 'place', 'source']);
  data.bookmarks = data.bookmarks.filter((b): b is Bookmark => isRecord(b) && types.has(b.type as string) && isString(b.id) && isString(b.createdAt));
  data.reflections = Object.fromEntries(
    Object.entries(data.reflections).filter(
      ([, r]) => isRecord(r) && isString(r.questionId) && isString(r.episodeId) && isString(r.text) && (r.optionIndex === null || typeof r.optionIndex === 'number'),
    ),
  );
  const discovered = createEmptySeerah().discovered;
  for (const type of ['event', 'person', 'place'] as const) {
    const stored = data.discovered[type];
    discovered[type] = isRecord(stored) ? Object.fromEntries(Object.entries(stored).filter(([, at]) => isString(at))) as Record<string, string> : {};
  }
  data.discovered = discovered;
  return data;
}

/** Remembers how far the reader got so the journey can be continued. */
export function applyEpisodeStep(data: SeerahData, episodeId: string, step: EpisodeStep, now: Date): SeerahData {
  const current = data.episodes[episodeId];
  if (current?.step === step && data.lastEpisodeId === episodeId) return data;
  const nowIso = now.toISOString();
  return {
    ...data,
    lastEpisodeId: episodeId,
    episodes: {
      ...data.episodes,
      [episodeId]: {
        step,
        startedAt: current?.startedAt ?? nowIso,
        updatedAt: nowIso,
        completedAt: current?.completedAt ?? null,
        bestScore: current?.bestScore ?? null,
      },
    },
  };
}

export interface EpisodeCompletion {
  data: SeerahData;
  score: QuizScore;
  firstCompletion: boolean;
  /** The knowledge challenge of this run was answered without a mistake. */
  perfect: boolean;
}

export function applyEpisodeComplete(data: SeerahData, episodeId: string, results: readonly boolean[], now: Date): EpisodeCompletion {
  const score = scoreQuiz(results);
  const current = data.episodes[episodeId];
  const firstCompletion = !current?.completedAt;
  const perfect = isPerfect(results);
  const nowIso = now.toISOString();
  return {
    score,
    firstCompletion,
    perfect,
    data: {
      ...data,
      lastEpisodeId: episodeId,
      episodes: {
        ...data.episodes,
        [episodeId]: {
          step: 'sources',
          startedAt: current?.startedAt ?? nowIso,
          updatedAt: nowIso,
          completedAt: current?.completedAt ?? nowIso,
          bestScore: results.length ? Math.max(current?.bestScore ?? 0, score.percent) : (current?.bestScore ?? null),
        },
      },
      perfectEpisodes: perfect && !data.perfectEpisodes.includes(episodeId) ? [...data.perfectEpisodes, episodeId] : data.perfectEpisodes,
      // A completion without answered questions (e.g. resumed after the challenge) adds no quiz result.
      quizResults: results.length
        ? [{ episodeId, correct: score.correct, total: score.total, percent: score.percent, date: nowIso }, ...data.quizResults].slice(0, 100)
        : data.quizResults,
    },
  };
}

/** Marks an event, person or place as discovered (first time only). */
export function applyDiscover(data: SeerahData, type: DiscoveryType, id: string, now: Date): { data: SeerahData; isNew: boolean } {
  if (data.discovered[type][id]) return { data, isNew: false };
  return {
    isNew: true,
    data: { ...data, discovered: { ...data.discovered, [type]: { ...data.discovered[type], [id]: now.toISOString() } } },
  };
}

export function isBookmarked(bookmarks: readonly Bookmark[], type: BookmarkType, id: string): boolean {
  return bookmarks.some((b) => b.type === type && b.id === id);
}

export function applyToggleBookmark(data: SeerahData, type: BookmarkType, id: string, now: Date): SeerahData {
  const bookmarks = isBookmarked(data.bookmarks, type, id)
    ? data.bookmarks.filter((b) => !(b.type === type && b.id === id))
    : [{ type, id, createdAt: now.toISOString() }, ...data.bookmarks];
  return { ...data, bookmarks };
}

export interface ReflectionInput {
  questionId: string;
  episodeId: string;
  text: string;
  optionIndex: number | null;
}

/** Saves a personal reflection locally. Reflections are never evaluated; an empty one is removed. */
export function applyReflection(data: SeerahData, input: ReflectionInput, now: Date): { data: SeerahData; isNew: boolean } {
  const text = input.text.trim().slice(0, MAX_REFLECTION_LENGTH);
  if (!text && input.optionIndex === null) {
    const reflections = { ...data.reflections };
    delete reflections[input.questionId];
    return { data: { ...data, reflections }, isNew: false };
  }
  const isNew = !data.reflections[input.questionId];
  return {
    isNew,
    data: {
      ...data,
      reflections: {
        ...data.reflections,
        [input.questionId]: { questionId: input.questionId, episodeId: input.episodeId, text, optionIndex: input.optionIndex, updatedAt: now.toISOString() },
      },
    },
  };
}
