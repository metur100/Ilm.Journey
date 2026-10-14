import { defineNamespace, useNamespace } from '@/core/i18n';

import bs from './bs';
import de from './de';
import en from './en';

export type { QuestKey } from './en';

/** islam-quest port texts (namespace "quest") – registered when this module is imported. */
export const questI18n = defineNamespace('quest', { en, de, bs });

/** `t` accepts quest keys and core keys. */
export const useQuestI18n = () => useNamespace(questI18n);
