import type { LearnData } from '../models';
import type { QuestData } from '../quests/models';

/**
 * Sufara lesson ids used to be positional: 1 elif, 2 be, 3 te/se … 16 lam-elif/ya, 17 review,
 * 18 fatha, 19 kasra, 20 damma, 21–27 the later marks. The course now teaches elif, fatha, kesra and
 * damma first, so the old ids have to be moved to the lesson that teaches the same thing.
 *
 * Old 2–16 (be … lam-elif/ya) become 5–19; old review 17 becomes 20; old fatha/kasra/damma 18–20
 * become 2–4. Everything else keeps its number.
 */
export function migrateSufaraLessonId(id: string): string {
  const match = /^sufara-(\d{2})$/.exec(id);
  if (!match) return id;
  const n = Number(match[1]);
  let next = n;
  if (n >= 2 && n <= 16) next = n + 3;
  else if (n === 17) next = 20;
  else if (n >= 18 && n <= 20) next = n - 16;
  return `sufara-${String(next).padStart(2, '0')}`;
}

const unique = <T>(items: readonly T[]): T[] => [...new Set(items)];

/** Quest data v1 → v2: remap the completed Sufara lessons (other lesson ids are untouched). */
export function migrateQuestDataV1(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const data = raw as Partial<QuestData>;
  if (!Array.isArray(data.completedLessons)) return raw;
  return { ...data, completedLessons: unique(data.completedLessons.map((id) => (typeof id === 'string' ? migrateSufaraLessonId(id) : id))) };
}

/** Learn data v1 → v2: remap the remembered Sufara lesson of the "Continue" card. */
export function migrateLearnDataV1(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const data = raw as Partial<LearnData>;
  if (data.lastVisited?.topic !== 'sufara' || typeof data.lastVisited.itemId !== 'string') return raw;
  return { ...data, lastVisited: { ...data.lastVisited, itemId: migrateSufaraLessonId(data.lastVisited.itemId) } };
}
