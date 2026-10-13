import { useMemo, useSyncExternalStore } from 'react';

import {
  collectTopicQuestionKeys,
  getContinueItem,
  getProgressVersion,
  getRecentlyCompleted,
  subscribeProgress,
} from '../registry';
import { dueItems, pendingKeys } from '../services/review';
import { displayedStreak, isActiveToday } from '../services/streak';
import { topicKnowledge } from '../services/knowledge';
import { levelInfo } from '../services/xp';
import { useAppStore } from '../store/appStore';
import { toDayKey } from '../utils/date';

/**
 * Re-renders when any registered feature store changes (via `registerProgress({ subscribe })`).
 * Returns a version number to use as a memo dependency.
 */
export function useProgressVersion(): number {
  return useSyncExternalStore(subscribeProgress, getProgressVersion, getProgressVersion);
}

/** Derived global progress values shared by Home and Profile. */
export function useSummary() {
  const xp = useAppStore((s) => s.xp);
  const streak = useAppStore((s) => s.streak);
  const review = useAppStore((s) => s.review);
  const correctlyAnswered = useAppStore((s) => s.correctlyAnswered);
  const dailyCompleted = useAppStore((s) => s.dailyCompleted);
  const version = useProgressVersion();

  return useMemo(() => {
    const today = toDayKey(new Date());
    return {
      today,
      level: levelInfo(xp),
      streak: displayedStreak(streak, today),
      activeToday: isActiveToday(streak, today),
      dueCount: dueItems(review, new Date().toISOString()).length,
      pendingReviewKeys: pendingKeys(review),
      dailyDone: dailyCompleted.includes(today),
      topics: topicKnowledge(collectTopicQuestionKeys(), { correctlyAnswered, review }),
      continueItem: getContinueItem(),
      recentlyCompleted: getRecentlyCompleted(5),
      version,
    };
  }, [xp, streak, review, correctlyAnswered, dailyCompleted, version]);
}
