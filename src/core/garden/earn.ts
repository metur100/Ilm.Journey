import type { EarnEvent, EarnResult } from './rules';
import { useGardenStore } from './store';

/**
 * The single entry point for garden rewards. Core calls it wherever learning is recorded today:
 *
 * - `useAppStore.recordAnswer` (scored), `registerActivity`, `completeDaily`, `completeReviewSession` → `activity`
 * - `useAppStore.reportQuestEvent({ type: 'complete', target })` → the milestone of the target
 *   (`milestoneFromTarget`: units, masters, beginner quests, stories, episodes, game levels)
 * - a streak reaching 7, 14, 21 … days → `streak7`
 *
 * Features never call it directly: completing something already reports a quest event. Amounts are defined in
 * `EARN_TABLE` (core/garden/rules.ts).
 */
export function earn(event: EarnEvent, now: Date = new Date()): EarnResult {
  return useGardenStore.getState().applyEvent(event, now);
}
