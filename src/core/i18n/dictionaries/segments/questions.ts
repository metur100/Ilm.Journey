/**
 * Core dictionary segment "questions" (spread into the core dictionaries en/de/bs). Keys stay in the core namespace,
 * so `t('…')` from `useI18n()` translates them. German and Bosnian (ijekavian Latin) must have exactly the keys of English.
 */
const en = {} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {};

const bs: Record<Key, string> = {};

const segment = { en, de, bs };
export default segment;
