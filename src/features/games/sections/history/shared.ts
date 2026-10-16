import type { ComponentType } from 'react';

import { type GameApi, type GameDef, type GameFact } from '@/core/games';
import { kitResult, type KitDoneInfo } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';
import type { LocalizedText, SourceRef } from '@/core/models';

/*
 * Shared helpers of the History section (docs/GAMES-V3.md §3.6): localized text, the sources used by the facts, a
 * small game factory (namespace `game.<id>` + 3 levels) and the result helper for kit engines.
 */

export const T = (en: string, de: string, bs: string): LocalizedText => ({ en, de, bs });

/** Sources of the history facts. Names follow the app's existing content (history units, Seerah sources). */
export const SRC = {
  bukhari: (ref: string): SourceRef => ({ sourceName: 'Sahih al-Bukhari', sourceReference: ref }),
  muslim: (ref: string): SourceRef => ({ sourceName: 'Sahih Muslim', sourceReference: ref }),
  quran: (ref: string): SourceRef => ({ sourceName: 'Quran', sourceReference: ref }),
  tabari: { sourceName: 'Al-Tabari, Tarikh al-Rusul wa al-Muluk', sourceReference: '—' } as SourceRef,
  ibnKathir: (ref: string): SourceRef => ({ sourceName: 'Ibn Kathir, Al-Bidayah wa al-Nihayah', sourceReference: ref }),
  ibnHisham: { sourceName: 'Ibn Hisham, Al-Sirah al-Nabawiyyah', sourceReference: '—' } as SourceRef,
  dhahabi: { sourceName: "Al-Dhahabi, Siyar A'lam al-Nubala'", sourceReference: '—' } as SourceRef,
  khwarizmi: { sourceName: 'Al-Khwarizmi, Al-Kitab al-Mukhtasar fi Hisab al-Jabr wal-Muqabala', sourceReference: '—' } as SourceRef,
  ibnSina: { sourceName: 'Ibn Sina, Al-Qanun fi al-Tibb', sourceReference: '—' } as SourceRef,
  haytham: { sourceName: 'Ibn al-Haytham, Kitab al-Manazir', sourceReference: '—' } as SourceRef,
  zahrawi: { sourceName: 'Al-Zahrawi, Kitab al-Tasrif', sourceReference: '—' } as SourceRef,
  ibnBattuta: { sourceName: 'Ibn Battuta, Tuhfat al-Nuzzar (the Rihla), as written down by Ibn Juzayy', sourceReference: '—' } as SourceRef,
  ei2: (article: string): SourceRef => ({ sourceName: 'Encyclopaedia of Islam, 2nd edition', sourceReference: `art. "${article}"` }),
  unesco: (site: string): SourceRef => ({ sourceName: 'UNESCO World Heritage List', sourceReference: site }),
  vakufnama: (ref: string): SourceRef => ({ sourceName: 'Endowment charter (vakufnama)', sourceReference: ref }),
  kons: (ref: string): SourceRef => ({ sourceName: 'Commission to Preserve National Monuments of Bosnia and Herzegovina', sourceReference: ref }),
  britannica: (article: string): SourceRef => ({ sourceName: 'Encyclopaedia Britannica', sourceReference: `art. "${article}"` }),
};

export type Texts = Record<string, LocalizedText> & { title: LocalizedText; description: LocalizedText; howTo: LocalizedText };

/** Builds the namespace `game.<id>` from localized texts (en / de / bs always have the same keys). */
export function historyNamespace(id: string, texts: Texts) {
  const pick = (lang: 'en' | 'de' | 'bs') => Object.fromEntries(Object.entries(texts).map(([k, v]) => [k, v[lang]])) as Record<string, string>;
  return defineNamespace(`game.${id}`, { en: pick('en'), de: pick('de'), bs: pick('bs') });
}

export interface HistoryGameSpec<C> {
  id: string;
  texts: Texts;
  coverArt: string;
  hintArt?: string;
  component: ComponentType<GameApi<C>>;
  levels: [{ config: C; facts: GameFact[] }, { config: C; facts: GameFact[] }, { config: C; facts: GameFact[] }];
  order: number;
  teaches?: string[];
}

export function historyGame<C>(spec: HistoryGameSpec<C>): GameDef<C> {
  return {
    id: spec.id,
    topicId: 'history',
    i18n: historyNamespace(spec.id, spec.texts),
    coverArt: spec.coverArt,
    hintArt: spec.hintArt,
    component: spec.component,
    levels: spec.levels.map((l, i) => ({ level: (i + 1) as 1 | 2 | 3, config: l.config, facts: l.facts })),
    order: spec.order,
    teaches: spec.teaches ? { questionKeys: spec.teaches } : undefined,
  };
}

/**
 * Turns an engine's done info into the level result. `factOf` maps a missed item id to the fact id it practises
 * (unknown items fall back to the level's first fact).
 */
export function finishWith(api: GameApi<unknown>, moves: number, factOf?: (itemId: string) => string | undefined) {
  return ({ mistakes, missed }: KitDoneInfo) => {
    const fallback = api.facts[0]?.id;
    const factsMissed = missed.map((id) => factOf?.(id) ?? fallback).filter((x): x is string => !!x);
    api.onComplete(kitResult({ moves, mistakes, factsMissed }));
  };
}
