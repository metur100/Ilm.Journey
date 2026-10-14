import { defineNamespace, useNamespace } from '@/core/i18n';

import bs from './bs';
import de from './de';
import en from './en';

export type { StoriesKey } from './en';

/** Stories feature texts – merged into the app's i18n when this module is imported. */
export const storiesI18n = defineNamespace('stories', { en, de, bs });

/** `t` accepts stories keys and core keys. */
export const useStoriesI18n = () => useNamespace(storiesI18n);
