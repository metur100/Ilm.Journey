import { parseQuestionKey, type ReviewItem } from '@/core/models';
import { dueItems, isDue } from '@/core/services/review';

/**
 * Sira's Review Center (Needs review · Mastered · Recently learned) as a filter view over the
 * app-wide spaced-review queue: only `seerah:` keys. Scheduling (Leitner boxes) is core's.
 */
export interface SeerahReviewCenter {
  /** Missed Seerah questions not yet mastered (due ones first). */
  needsReview: ReviewItem[];
  mastered: ReviewItem[];
  /** Due now, in core's priority order. */
  due: ReviewItem[];
}

export const isSeerahKey = (key: string) => parseQuestionKey(key)?.feature === 'seerah';

export function seerahReviewCenter(items: Record<string, ReviewItem>, nowIso: string): SeerahReviewCenter {
  const own = Object.fromEntries(Object.entries(items).filter(([key]) => isSeerahKey(key)));
  const all = Object.values(own);
  const due = dueItems(own, nowIso);
  const waiting = all.filter((i) => !i.mastered && !isDue(i, nowIso)).sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
  return {
    needsReview: [...due, ...waiting],
    mastered: all.filter((i) => i.mastered).sort((a, b) => b.lastSeen.localeCompare(a.lastSeen)),
    due,
  };
}
