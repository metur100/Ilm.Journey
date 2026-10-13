import { LANGUAGES, type Language, type LocalizedText } from '../models';
import { interpolate } from '../utils/text';
import bs from './dictionaries/bs';
import de from './dictionaries/de';
import en, { type CoreKey } from './dictionaries/en';

export type { CoreKey };

export type Params = Record<string, string | number>;

const CORE: Record<Language, Record<string, string>> = { en, de, bs };

export const LANGUAGE_NAMES: Record<Language, string> = {
  bs: 'Bosanski',
  de: 'Deutsch',
  en: 'English',
};

/** BCP-47 tags used for dates and text-to-speech. */
export const LOCALE_TAGS: Record<Language, string> = { bs: 'bs-BA', de: 'de-DE', en: 'en-GB' };

/** Translates a core key; falls back to English, then to the key itself. */
export function translate(language: Language, key: CoreKey, params?: Params): string {
  const template = CORE[language][key] ?? CORE.en[key] ?? key;
  return interpolate(template, params);
}

/** Picks the text for the current language, falling back to English. */
export function localize(text: LocalizedText | undefined, language: Language): string {
  if (!text) return '';
  return text[language] || text.en;
}

/** Builds a LocalizedText by evaluating a function for every language (e.g. composed quest titles). */
export function localizedFrom(build: (language: Language) => string): LocalizedText {
  return Object.fromEntries(LANGUAGES.map((l) => [l, build(l)])) as LocalizedText;
}

/** Maps the device locale to a supported language (Bosnian also covers Croatian/Serbian/Montenegrin). */
export function languageFromLocale(code: string | null | undefined): Language {
  const lower = (code ?? '').toLowerCase();
  if (['bs', 'hr', 'sr', 'cnr', 'sh'].includes(lower)) return 'bs';
  if (lower === 'de') return 'de';
  return 'en';
}

// ---------- Feature namespaces ----------

/**
 * A feature dictionary. Keys are plain (e.g. `'player.title'`); the namespace keeps them apart from
 * core keys and other features. German and Bosnian must have exactly the keys of English
 * (enforced by the type and by the i18n completeness test).
 */
export interface Namespace<K extends string> {
  name: string;
  dictionaries: Record<Language, Record<K, string>>;
}

const NAMESPACES = new Map<string, Namespace<string>>();

/**
 * Registers a feature dictionary ("merged at startup": the feature's i18n module calls this when
 * it is imported by the feature's `register.ts`).
 *
 *   const en = { 'title': 'Stories' } as const;
 *   export const storiesI18n = defineNamespace('stories', { en, de, bs });
 */
export function defineNamespace<const E extends Record<string, string>>(
  name: string,
  dictionaries: { en: E; de: Record<keyof E, string>; bs: Record<keyof E, string> },
): Namespace<Extract<keyof E, string>> {
  if (name === 'core') throw new Error('The "core" namespace is reserved.');
  const ns = { name, dictionaries } as unknown as Namespace<Extract<keyof E, string>>;
  NAMESPACES.set(name, ns as unknown as Namespace<string>);
  return ns;
}

/** All registered feature namespaces (used by tests and dynamic lookups). */
export function getNamespaces(): Namespace<string>[] {
  return [...NAMESPACES.values()];
}

/** The core dictionaries (used by the completeness test). */
export function getCoreDictionaries(): Record<Language, Record<string, string>> {
  return CORE;
}

/** Translates a key of a feature namespace, falling back to core keys and English. */
export function translateNs<K extends string>(ns: Namespace<K>, language: Language, key: K | CoreKey, params?: Params): string {
  const own = ns.dictionaries[language][key as K] ?? ns.dictionaries.en[key as K];
  if (own !== undefined) return interpolate(own, params);
  return translate(language, key as CoreKey, params);
}

/**
 * Resolves `"<namespace>:<key>"` or a plain core key at runtime – for data that stores a text key
 * (e.g. registry items). Unknown keys are returned unchanged.
 */
export function translateAny(language: Language, fullKey: string, params?: Params): string {
  const index = fullKey.indexOf(':');
  if (index > 0) {
    const ns = NAMESPACES.get(fullKey.slice(0, index));
    const key = fullKey.slice(index + 1);
    const text = ns?.dictionaries[language][key] ?? ns?.dictionaries.en[key];
    if (text !== undefined) return interpolate(text, params);
  }
  return translate(language, fullKey as CoreKey, params);
}
