import { defineNamespace, useNamespace } from '@/core/i18n';

import bs from './bs';
import de from './de';
import en from './en';

export type { SeerahKey } from './en';

/** Seerah feature texts – merged into the app's i18n when this module is imported. */
export const seerahI18n = defineNamespace('seerah', { en, de, bs });

/** `t` accepts Seerah keys and core keys. */
export const useSeerahI18n = () => useNamespace(seerahI18n);
