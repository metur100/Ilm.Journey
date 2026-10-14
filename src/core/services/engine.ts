import {
  type AnswerMode,
  type AnswerRef,
  type AppData,
  type BadgeId,
  type BadgeMetrics,
  type Character,
  type DayKey,
  isTopicId,
  type Language,
  LEARNER_GROUPS,
  type QuestEvent,
  type ReviewItem,
} from '../models';
import { withDefaults } from '../storage';
import { toDayKey } from '../utils/date';
import { awardBadges, coreMetrics, mergeMetrics } from './badges';
import { DEFAULT_REMINDER_HOUR } from './notifications.constants';
import { generateQuests, progressQuests, type QuestCandidate } from './quests';
import { isDue, recordMistake, recordSuccess } from './review';
import { EMPTY_STREAK, registerActivity } from './streak';
import { levelFromXp, XP } from './xp';

/**
 * Pure state transitions of the global store (`useAppStore`). Everything here is deterministic
 * (time is passed in) so it can be unit-tested without React.
 */

export const APP_DATA_VERSION = 1;

export const DEFAULT_CHARACTER: Character = {
  skinTone: 2,
  hairStyle: 'short',
  hairColor: 0,
  headwear: 'none',
  outfit: 'jacket',
  outfitColor: 1,
  accessory: 'none',
  headwearColor: 0,
  scarfPattern: 'plain',
  backpackPattern: 'plain',
  lanternStyle: 'classic',
};

export function createInitialData(language: Language = 'en'): AppData {
  return {
    version: APP_DATA_VERSION,
    onboarded: false,
    settings: {
      language,
      themeMode: 'system',
      sound: true,
      haptics: true,
      narration: false,
      reducedMotion: false,
      largeText: false,
      highContrast: false,
      reminderEnabled: false,
      reminderHour: DEFAULT_REMINDER_HOUR,
    },
    profile: { name: '', character: { ...DEFAULT_CHARACTER }, learnerGroup: 'child' },
    xp: 0,
    level: 1,
    xpAwards: {},
    streak: { ...EMPTY_STREAK },
    review: {},
    correctlyAnswered: [],
    badges: {},
    stats: { questionsAnswered: 0, correctAnswers: 0, reviewsCorrect: 0, reviewSessions: 0 },
    dailyCompleted: [],
    questDay: null,
    quests: [],
  };
}

export interface EngineResult {
  data: AppData;
  /** XP granted by this step (including XP of quests it completed). */
  xp: number;
}

function withXp(data: AppData, xp: number): AppData {
  if (xp === 0) return data;
  const total = data.xp + xp;
  return { ...data, xp: total, level: levelFromXp(total) };
}

/** Moves quests forward and adds the XP of newly completed quests. */
export function applyQuestEvent(data: AppData, event: QuestEvent): EngineResult {
  const { quests, xp } = progressQuests(data.quests, event);
  if (xp === 0 && quests.every((q, i) => q === data.quests[i])) return { data, xp: 0 };
  return { data: withXp({ ...data, quests }, xp), xp };
}

/**
 * Records an answer. Practice answers are never scored. XP for a correct answer is granted only once
 * per question key; mistakes go into the spaced-review queue; a scored answer counts for the streak.
 */
export function applyAnswer(data: AppData, ref: AnswerRef, correct: boolean, mode: AnswerMode, now: Date): EngineResult {
  if (mode === 'practice') return { data, xp: 0 };
  const nowIso = now.toISOString();
  const stats = {
    ...data.stats,
    questionsAnswered: data.stats.questionsAnswered + 1,
    correctAnswers: data.stats.correctAnswers + (correct ? 1 : 0),
  };
  const review = { ...data.review };
  const existing = review[ref.key];
  let xp = 0;
  let correctlyAnswered = data.correctlyAnswered;

  if (!correct) {
    review[ref.key] = recordMistake(existing, ref, nowIso);
  } else {
    if (!data.correctlyAnswered.includes(ref.key)) {
      correctlyAnswered = [...data.correctlyAnswered, ref.key];
      if (mode !== 'review') xp += XP.correctAnswer;
    }
    if (existing && isDue(existing, nowIso)) {
      review[ref.key] = recordSuccess(existing, nowIso);
      if (mode === 'review') {
        xp += XP.reviewCorrect;
        stats.reviewsCorrect += 1;
      }
    }
  }

  const base = withXp(
    { ...data, stats, review, correctlyAnswered, streak: registerActivity(data.streak, toDayKey(now)) },
    xp,
  );
  const quest = applyQuestEvent(base, { type: 'answer', topicArea: ref.topicArea, correct, review: mode === 'review' });
  return { data: quest.data, xp: xp + quest.xp };
}

/** Adds a question to the review queue as a mistake, without scoring (no stats, XP or streak). */
export function applyQueueReview(data: AppData, ref: AnswerRef, now: Date): AppData {
  const existing = data.review[ref.key];
  if (existing && !existing.mastered && existing.box === 0) return data;
  return { ...data, review: { ...data.review, [ref.key]: recordMistake(existing, ref, now.toISOString()) } };
}

/** Grants XP once per reason key (e.g. `stories:adam:complete`). Repeated calls grant nothing. */
export function applyAwardXp(data: AppData, reason: string, amount: number): EngineResult {
  const value = Math.floor(amount);
  if (!reason || value <= 0 || reason in data.xpAwards) return { data, xp: 0 };
  return { data: withXp({ ...data, xpAwards: { ...data.xpAwards, [reason]: value } }, value), xp: value };
}

export function applyActivity(data: AppData, now: Date): AppData {
  const streak = registerActivity(data.streak, toDayKey(now));
  return streak === data.streak ? data : { ...data, streak };
}

export function applyDailyComplete(data: AppData, day: DayKey, now: Date): EngineResult {
  const active = applyActivity(data, now);
  if (active.dailyCompleted.includes(day)) return { data: active, xp: 0 };
  const base = withXp({ ...active, dailyCompleted: [...active.dailyCompleted, day] }, XP.dailyChallenge);
  const quest = applyQuestEvent(base, { type: 'dailyComplete' });
  return { data: quest.data, xp: XP.dailyChallenge + quest.xp };
}

export function applyReviewSessionComplete(data: AppData, now: Date): AppData {
  const active = applyActivity(data, now);
  return { ...active, stats: { ...active.stats, reviewSessions: active.stats.reviewSessions + 1 } };
}

/** Regenerates the quest log once per calendar day (or when `force` is set). */
export function ensureQuests(data: AppData, day: DayKey, candidates: readonly QuestCandidate[], force = false): AppData {
  if (!force && data.questDay === day && data.quests.length > 0) return data;
  const pending = Object.values(data.review).filter((r) => !r.mastered).length;
  return { ...data, questDay: day, quests: generateQuests(day, candidates, pending) };
}

/** Adds newly earned badges based on core metrics plus the given feature metrics. */
export function finalizeBadges(data: AppData, featureMetrics: BadgeMetrics, now: Date): { data: AppData; newBadges: BadgeId[] } {
  const metrics = mergeMetrics(coreMetrics(data), featureMetrics);
  const { badges, newBadges } = awardBadges(data.badges, metrics, now.toISOString());
  return { data: newBadges.length ? { ...data, badges } : data, newBadges };
}

// ---------- persistence ----------

function isReviewItem(value: unknown): value is ReviewItem {
  const item = value as ReviewItem;
  return (
    !!item &&
    typeof item === 'object' &&
    typeof item.key === 'string' &&
    typeof item.topic === 'string' &&
    typeof item.box === 'number' &&
    typeof item.nextReviewDate === 'string' &&
    typeof item.mastered === 'boolean'
  );
}

/** Repairs stored global data: unknown fields dropped, wrong types replaced by defaults. */
export function sanitizeAppData(raw: unknown): AppData | null {
  if (!raw || typeof raw !== 'object') return null;
  const stored = raw as Partial<AppData>;
  const base = createInitialData(stored.settings?.language ?? 'en');
  const data = withDefaults(base, raw);
  if (!['bs', 'de', 'en'].includes(data.settings.language)) data.settings.language = base.settings.language;
  if (!['system', 'light', 'dark'].includes(data.settings.themeMode)) data.settings.themeMode = 'system';
  if (!LEARNER_GROUPS.includes(data.profile.learnerGroup)) data.profile.learnerGroup = base.profile.learnerGroup;
  data.review = Object.fromEntries(
    Object.entries(data.review).filter(([key, item]) => isReviewItem(item) && item.key === key && (!item.topicArea || isTopicId(item.topicArea))),
  );
  data.correctlyAnswered = data.correctlyAnswered.filter((k) => typeof k === 'string');
  data.dailyCompleted = data.dailyCompleted.filter((d) => typeof d === 'string');
  data.quests = data.quests.filter((q) => q && typeof q === 'object' && typeof q.id === 'string' && q.goal && typeof q.target === 'number');
  data.xpAwards = Object.fromEntries(Object.entries(data.xpAwards).filter(([, v]) => typeof v === 'number'));
  data.version = APP_DATA_VERSION;
  data.level = levelFromXp(data.xp);
  return data;
}
