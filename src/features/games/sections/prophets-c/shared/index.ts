import { type ComponentType, createElement } from 'react';

import type { GameApi, GameFact } from '@/core/games';
import { defineNamespace } from '@/core/i18n';
import type { LocalizedText, SourceRef } from '@/core/models';

/* Shared helpers of the prophets-c games (Sulayman … Muhammad ﷺ). */

export const T = (en: string, de: string, bs: string): LocalizedText => ({ en, de, bs });

export const quran = (ref: string): SourceRef => ({ sourceName: 'Quran', sourceReference: ref });
export const bukhari = (num: string): SourceRef => ({ sourceName: 'Sahih al-Bukhari', sourceReference: num });
export const ibnKathir = (ref: string): SourceRef => ({ sourceName: 'Ibn Kathir, Tafsir', sourceReference: ref });

export type Facts = Record<string, GameFact>;

/**
 * The namespace `game.<id>` from one table of localized texts (keys stay identical in en / de / bs by construction).
 */
export function gameTexts<K extends string>(id: string, texts: Record<K, LocalizedText>) {
  const pick = (lang: 'en' | 'de' | 'bs') => Object.fromEntries(Object.entries(texts).map(([k, v]) => [k, (v as LocalizedText)[lang]])) as Record<K, string>;
  return defineNamespace(`game.${id}`, { en: pick('en'), de: pick('de'), bs: pick('bs') });
}

/**
 * A game component that is required on first render, so registering the games (also in tests that call
 * `registerFeatures()`) does not pull the UI modules into the import graph.
 */
export function lazyGame<C>(load: () => ComponentType<GameApi<C>>): ComponentType<GameApi<C>> {
  const Lazy: ComponentType<GameApi<C>> = (props) => createElement(load(), props);
  return Lazy;
}

/** Maps the ids of the items the learner got wrong to the fact ids they teach (unknown ids are dropped). */
export function factsFor(missed: readonly string[], map: Record<string, string | undefined>): string[] {
  return [...new Set(missed.map((id) => map[id]).filter((x): x is string => !!x))];
}
