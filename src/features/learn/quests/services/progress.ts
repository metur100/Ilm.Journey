import { isPerfect, type QuizScore, scoreQuiz } from '@/core/services/quiz';
import { withDefaults } from '@/core/storage';

import type { QuestData, QuestProgress, SurahMemorization } from '../models';

export const EMPTY_QUEST_DATA: QuestData = {
  quests: {},
  completedLessons: [],
  perfectQuests: [],
  recitePractice: {},
  memorization: {},
  duasLearned: [],
  duasFavourite: [],
  tracedLetters: [],
  ramadanDeeds: {},
};

const isString = (v: unknown): v is string => typeof v === 'string';
const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const uniqueStrings = (list: unknown[]): string[] => [...new Set(list.filter(isString))];

function sanitizeQuestProgress(raw: unknown): QuestProgress | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;
  if (typeof p.completed !== 'boolean') return null;
  return {
    completed: p.completed,
    bestStars: isCount(p.bestStars) ? Math.min(3, Math.round(p.bestStars)) : 0,
    bestScore: isCount(p.bestScore) ? Math.min(100, p.bestScore) : 0,
    attempts: isCount(p.attempts) ? Math.round(p.attempts) : 0,
    ...(isString(p.completedAt) ? { completedAt: p.completedAt } : {}),
  };
}

function sanitizeMemorization(raw: unknown): SurahMemorization | null {
  if (!raw || typeof raw !== 'object') return null;
  const m = raw as Record<string, unknown>;
  const learned = Array.isArray(m.learned) ? m.learned.filter((n): n is number => Number.isInteger(n) && (n as number) > 0) : [];
  return {
    learned: [...new Set(learned)].sort((a, b) => a - b),
    tests: isCount(m.tests) ? Math.round(m.tests) : 0,
    bestTest: isCount(m.bestTest) ? Math.min(100, m.bestTest) : 0,
    ...(isString(m.updatedAt) ? { updatedAt: m.updatedAt } : {}),
  };
}

function sanitizeRecord<T>(raw: Record<string, unknown>, item: (value: unknown) => T | null): Record<string, T> {
  const result: Record<string, T> = {};
  for (const [key, value] of Object.entries(raw)) {
    const clean = item(value);
    if (clean !== null) result[key] = clean;
  }
  return result;
}

/** Repairs stored quest progress (`ilmjourney:quest`); wrong shapes fall back to defaults, never crash. */
export function sanitizeQuestData(raw: unknown): QuestData | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const data = withDefaults(EMPTY_QUEST_DATA, raw);
  return {
    quests: sanitizeRecord(data.quests as Record<string, unknown>, sanitizeQuestProgress),
    completedLessons: uniqueStrings(data.completedLessons),
    perfectQuests: uniqueStrings(data.perfectQuests),
    recitePractice: sanitizeRecord(data.recitePractice as Record<string, unknown>, (v) => (isCount(v) ? Math.round(v) : null)),
    memorization: sanitizeRecord(data.memorization as Record<string, unknown>, sanitizeMemorization),
    duasLearned: uniqueStrings(data.duasLearned),
    duasFavourite: uniqueStrings(data.duasFavourite),
    tracedLetters: uniqueStrings(data.tracedLetters),
    ramadanDeeds: sanitizeRecord(data.ramadanDeeds as Record<string, unknown>, (v) => {
      if (!Array.isArray(v)) return null;
      return uniqueStrings(v);
    }),
  };
}

export interface QuestCompletion {
  data: QuestData;
  score: QuizScore;
  firstCompletion: boolean;
  perfect: boolean;
}

/** Records a finished quest run (pure). Best stars/score are kept; the first completion date never changes. */
export function applyQuestComplete(data: QuestData, questId: string, results: readonly boolean[], nowIso: string): QuestCompletion {
  const score = scoreQuiz(results);
  const before = data.quests[questId];
  const perfect = isPerfect(results);
  const progress: QuestProgress = {
    completed: true,
    attempts: (before?.attempts ?? 0) + 1,
    bestStars: Math.max(before?.bestStars ?? 0, score.stars),
    bestScore: Math.max(before?.bestScore ?? 0, score.percent),
    completedAt: before?.completedAt ?? nowIso,
  };
  return {
    data: {
      ...data,
      quests: { ...data.quests, [questId]: progress },
      perfectQuests: perfect && !data.perfectQuests.includes(questId) ? [...data.perfectQuests, questId] : data.perfectQuests,
    },
    score,
    firstCompletion: !before?.completed,
    perfect,
  };
}

export function toggleInList(list: readonly string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

/** Ramadan good-deed tracker: toggles one deed on one day (1–30). */
export function toggleRamadanDeed(deeds: QuestData['ramadanDeeds'], day: number, deedId: string): QuestData['ramadanDeeds'] {
  if (!Number.isInteger(day) || day < 1 || day > 30) return deeds;
  const key = String(day);
  return { ...deeds, [key]: toggleInList(deeds[key] ?? [], deedId) };
}

export function totalRamadanDeeds(deeds: QuestData['ramadanDeeds']): number {
  return Object.values(deeds).reduce((sum, list) => sum + list.length, 0);
}

export const isQuestDone = (data: Pick<QuestData, 'quests'>, questId: string) => data.quests[questId]?.completed === true;
