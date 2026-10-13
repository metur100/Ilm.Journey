import type { AppData, BadgeDefinition, BadgeGroup, BadgeId, BadgeMetric, BadgeMetrics } from '../models';

/** Thresholds of the source apps. */
export const KNOWLEDGE_SEEKER_ANSWERS = 50;
export const REVIEW_CHAMPION_REVIEWS = 10;
export const DAILY_LEARNER_DAYS = 7;
export const HISTORY_LEARNER_STORIES = 4;
export const REFLECTIVE_MIND_COUNT = 5;
export const SEERAH_STUDENT_EPISODES = 5;

/** The merged badge list (see `core/models/badges.ts` for the mapping to the source apps). */
export const BADGES: readonly BadgeDefinition[] = [
  // learning journey
  { id: 'first_lesson', group: 'journey', icon: 'book', color: '#3BA99C', metric: 'lessonsCompleted', min: 1 },
  { id: 'first_quest', group: 'journey', icon: 'flag', color: '#E09A1E', metric: 'learn.questsCompleted', min: 1 },
  { id: 'perfect_score', group: 'journey', icon: 'star', color: '#F2B544', metric: 'perfectRuns', min: 1 },
  { id: 'knowledge_seeker', group: 'journey', icon: 'sparkle', color: '#6E43AE', metric: 'correctlyAnswered', min: KNOWLEDGE_SEEKER_ANSWERS },
  { id: 'review_champion', group: 'journey', icon: 'refresh', color: '#1C7C8C', metric: 'reviewsCorrect', min: REVIEW_CHAMPION_REVIEWS },
  { id: 'daily_learner', group: 'journey', icon: 'sun', color: '#E8A317', metric: 'dailyCompleted', min: DAILY_LEARNER_DAYS },
  { id: 'streak_7', group: 'journey', icon: 'flame', color: '#F28C28', metric: 'streakLongest', min: 7 },
  { id: 'streak_30', group: 'journey', icon: 'flame', color: '#D9480F', metric: 'streakLongest', min: 30 },
  // topics
  { id: 'salah_scholar', group: 'topics', icon: 'mosque', color: '#2F7E8C', metric: 'learn.mastered.salah', min: 1 },
  { id: 'quran_explorer', group: 'topics', icon: 'quran', color: '#2F5AA8', metric: 'learn.mastered.quran', min: 1 },
  { id: 'seerah_explorer', group: 'topics', icon: 'kaaba', color: '#A9572A', metric: 'learn.mastered.seerah', min: 1 },
  { id: 'akhlaq_champion', group: 'topics', icon: 'heart', color: '#E0607E', metric: 'learn.mastered.akhlaq', min: 1 },
  { id: 'ramadan_learner', group: 'topics', icon: 'moon', color: '#6E43AE', metric: 'learn.mastered.ramadan', min: 1 },
  { id: 'arabic_beginner', group: 'topics', icon: 'letter', color: '#D9534F', metric: 'learn.mastered.arabic', min: 1 },
  { id: 'topic_explorer', group: 'topics', icon: 'map', color: '#3F8F6B', metric: 'learn.topicsStarted', min: 8 },
  { id: 'knowledge_master', group: 'topics', icon: 'trophy', color: '#B8860B', metric: 'learn.topicsMastered', min: 8 },
  // prophet stories
  { id: 'story_explorer', group: 'stories', icon: 'scroll', color: '#C8743A', metric: 'stories.completed', min: 1 },
  { id: 'history_learner', group: 'stories', icon: 'map', color: '#2F8A5A', metric: 'stories.completed', min: HISTORY_LEARNER_STORIES },
  { id: 'prophet_explorer', group: 'stories', icon: 'trophy', color: '#B8860B', metric: 'stories.allCompleted', min: 1 },
  { id: 'sabr_champion', group: 'stories', icon: 'shield', color: '#2F5AA8', metric: 'stories.sabrLessonsLearned', min: 1 },
  // seerah
  { id: 'first_journey', group: 'seerah', icon: 'compass', color: '#A9572A', metric: 'seerah.episodesCompleted', min: 1 },
  { id: 'makkah_explorer', group: 'seerah', icon: 'kaaba', color: '#5B4A1E', metric: 'seerah.makkahCompleted', min: 1 },
  { id: 'madinah_explorer', group: 'seerah', icon: 'mosque', color: '#1F6B4C', metric: 'seerah.madinahCompleted', min: 1 },
  { id: 'timeline_explorer', group: 'seerah', icon: 'timeline', color: '#2F5AA8', metric: 'seerah.timelineCompleted', min: 1 },
  { id: 'history_seeker', group: 'seerah', icon: 'people', color: '#7D2A44', metric: 'seerah.peopleCompleted', min: 1 },
  { id: 'reflective_mind', group: 'seerah', icon: 'feather', color: '#6C4280', metric: 'seerah.reflections', min: REFLECTIVE_MIND_COUNT },
  { id: 'seerah_student', group: 'seerah', icon: 'book', color: '#235E7C', metric: 'seerah.episodesPassed', min: SEERAH_STUDENT_EPISODES },
  { id: 'ten_episodes', group: 'seerah', icon: 'star', color: '#C9A24D', metric: 'seerah.allEpisodesCompleted', min: 1 },
];

export const BADGE_GROUPS: readonly BadgeGroup[] = ['journey', 'topics', 'stories', 'seerah'];

export function getBadge(id: BadgeId): BadgeDefinition | undefined {
  return BADGES.find((b) => b.id === id);
}

/** Metrics the core computes itself from the global state. */
export function coreMetrics(data: Pick<AppData, 'correctlyAnswered' | 'stats' | 'dailyCompleted' | 'streak'>): BadgeMetrics {
  return {
    correctlyAnswered: data.correctlyAnswered.length,
    reviewsCorrect: data.stats.reviewsCorrect,
    dailyCompleted: data.dailyCompleted.length,
    streakLongest: data.streak.longest,
  };
}

/** Sums metric maps (features report their own share of shared metrics like `perfectRuns`). */
export function mergeMetrics(...maps: readonly BadgeMetrics[]): BadgeMetrics {
  const result: BadgeMetrics = {};
  for (const map of maps) {
    for (const [key, value] of Object.entries(map) as [BadgeMetric, number | undefined][]) {
      if (typeof value === 'number' && Number.isFinite(value)) result[key] = (result[key] ?? 0) + value;
    }
  }
  return result;
}

export function isBadgeEarned(badge: BadgeDefinition, metrics: BadgeMetrics): boolean {
  return (metrics[badge.metric] ?? 0) >= badge.min;
}

/** Adds newly earned badges (never removes one) and returns their ids. */
export function awardBadges(
  badges: AppData['badges'],
  metrics: BadgeMetrics,
  nowIso: string,
): { badges: AppData['badges']; newBadges: BadgeId[] } {
  const newBadges = BADGES.filter((b) => !badges[b.id] && isBadgeEarned(b, metrics)).map((b) => b.id);
  if (newBadges.length === 0) return { badges, newBadges };
  const next = { ...badges };
  for (const id of newBadges) next[id] = nowIso;
  return { badges: next, newBadges };
}
