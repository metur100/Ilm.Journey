export type Language = 'bs' | 'de' | 'en';

export const LANGUAGES: readonly Language[] = ['bs', 'de', 'en'];

/** Text available in every supported language. */
export type LocalizedText = Record<Language, string>;

/** Reference to the source a religious claim is based on. */
export interface SourceRef {
  sourceName: string;
  sourceReference: string;
}

/** ISO date key in the user's local time zone, e.g. "2026-10-06". */
export type DayKey = string;

/**
 * The eight learning topics of the app (Learn tab, knowledge radar, topic badges).
 * Every feature tags its content with one of these where it fits.
 */
export type TopicId = 'salah' | 'quran' | 'prophets' | 'seerah' | 'akhlaq' | 'ramadan' | 'history' | 'arabic';

/** Display order of the topics (Learn tab, radar). */
export const TOPIC_IDS: readonly TopicId[] = ['salah', 'quran', 'prophets', 'seerah', 'akhlaq', 'ramadan', 'history', 'arabic'];

export function isTopicId(value: unknown): value is TopicId {
  return typeof value === 'string' && (TOPIC_IDS as readonly string[]).includes(value);
}
