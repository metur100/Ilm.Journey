import { defineNamespace, useNamespace } from '@/core/i18n';

import bs from './bs';
import de from './de';
import en from './en';

/** Learn feature texts – merged into the app's i18n when this module is imported. */
export const learnI18n = defineNamespace('learn', { en, de, bs });

/** `t` accepts learn keys and core keys. */
export const useLearnI18n = () => useNamespace(learnI18n);
