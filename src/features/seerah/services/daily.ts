import type { DayKey } from '@/core/models';
import { dayNumber } from '@/core/utils/date';

import type { SeerahEvent } from '../models';

/**
 * Today's Seerah: one event per calendar day, chosen deterministically so it is the same all day,
 * and walks through the whole timeline before repeating.
 *
 * (Sira's separate "daily question" is not ported as such: Seerah questions join the app-wide daily
 * challenge through `registerDailyPool`, so there is one daily question for the whole app.)
 */
export function todaysEvent(day: DayKey, events: readonly SeerahEvent[]): SeerahEvent | null {
  if (events.length === 0) return null;
  const n = dayNumber(day);
  return events[((n % events.length) + events.length) % events.length];
}
