import { useCallback } from 'react';

import type { LocalizedText } from '../models';
import { useAppStore } from '../store/appStore';
import { type CoreKey, localize, type Namespace, type Params, translate, translateNs } from './translate';

/** Core translation helpers bound to the current language. */
export function useI18n() {
  const language = useAppStore((s) => s.settings.language);
  const t = useCallback((key: CoreKey, params?: Params) => translate(language, key, params), [language]);
  const l = useCallback((text: LocalizedText | undefined) => localize(text, language), [language]);
  return { t, l, language };
}

/**
 * Translation helpers for a feature namespace. `t` accepts the feature's keys and all core keys.
 *
 *   export const useStoriesI18n = () => useNamespace(storiesI18n);
 */
export function useNamespace<K extends string>(ns: Namespace<K>) {
  const language = useAppStore((s) => s.settings.language);
  const t = useCallback((key: K | CoreKey, params?: Params) => translateNs(ns, language, key, params), [ns, language]);
  const l = useCallback((text: LocalizedText | undefined) => localize(text, language), [language]);
  return { t, l, language };
}
