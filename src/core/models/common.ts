export type Language = 'bs' | 'de' | 'en';

export const LANGUAGES: readonly Language[] = ['bs', 'de', 'en'];

/** Text available in every supported language. */
export type LocalizedText = Record<Language, string>;

/** Reference to the source a religious claim is based on. */
export interface SourceRef {
  sourceName: string;
  sourceReference: string;
}

/**
 * What a fact (game fact, collection card) is about. `religious` (the default) facts cite the Quran, hadith or
 * scholarly works. `language` facts – Arabic letters, letter forms, harakat, basic vocabulary – are not religious
 * claims: they cite a neutral language reference (`LANGUAGE_SOURCES`) instead of a Quran verse.
 */
export type FactKind = 'religious' | 'language';

/** Neutral references for `language` facts (the facts themselves are copied from the app's Arabic lessons). */
export const LANGUAGE_SOURCES = {
  alphabet: { sourceName: 'Arabic alphabet (standard Arabic script)', sourceReference: '' },
  vocabulary: { sourceName: 'Basic Arabic vocabulary (Ilm Journey Arabic lessons)', sourceReference: '' },
} as const satisfies Record<string, SourceRef>;

const LANGUAGE_SOURCE_NAMES: readonly string[] = Object.values(LANGUAGE_SOURCES).map((s) => s.sourceName);

export function isLanguageSource(source: SourceRef): boolean {
  return LANGUAGE_SOURCE_NAMES.includes(source.sourceName);
}

/**
 * Source rule of a fact, or null when it is fine: every fact needs ≥ 1 named source; a `language` fact cites a
 * language reference and never a Quran verse (a verse does not support a pronunciation fact); a religious fact
 * (default) needs at least one source that is not a language reference.
 */
export function factSourceProblem(kind: FactKind | undefined, sources: readonly SourceRef[]): string | null {
  if (sources.length === 0 || sources.some((s) => !s.sourceName.trim())) return 'needs sources';
  if (kind === 'language') {
    if (!sources.some(isLanguageSource)) return 'language facts cite a language reference (LANGUAGE_SOURCES)';
    if (sources.some((s) => s.sourceName.trim().toLowerCase() === 'quran')) return 'language facts must not cite a Quran verse';
    return null;
  }
  if (sources.every(isLanguageSource)) return 'religious facts need a religious source, not only a language reference';
  return null;
}

/** ISO date key in the user's local time zone, e.g. "2026-10-06". */
export type DayKey = string;

/**
 * The nine learning topics of the app (Learn tab, knowledge radar, topic badges).
 * Every feature tags its content with one of these where it fits.
 */
export type TopicId = 'salah' | 'quran' | 'prophets' | 'seerah' | 'akhlaq' | 'ramadan' | 'history' | 'sufara' | 'arabic';

/** Display order of the topics (Learn tab, radar). */
export const TOPIC_IDS: readonly TopicId[] = ['salah', 'quran', 'prophets', 'seerah', 'akhlaq', 'ramadan', 'history', 'sufara', 'arabic'];

export function isTopicId(value: unknown): value is TopicId {
  return typeof value === 'string' && (TOPIC_IDS as readonly string[]).includes(value);
}
