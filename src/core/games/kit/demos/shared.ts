import type { ComponentType } from 'react';

import { defineNamespace } from '../../../i18n';
import { LANGUAGE_SOURCES, type LocalizedText, type TopicId } from '../../../models';
import { demoGame } from '../../demo/register';
import { registerGame } from '../../registry';
import type { GameApi, GameDef, GameFact } from '../../types';

/*
 * Kit demo games: one development fixture per engine (`dev: true` → hidden in production builds). They show authors
 * and QA every engine with three levels. Their facts are copied from the Star Path demo (Quran 6:74–79) or are
 * language facts about the Arabic alphabet – demos never add new religious claims.
 */

export const T = (en: string, de: string, bs: string): LocalizedText => ({ en, de, bs });

/** Facts of the Star Path demo (sourced, copied from the Ibrahim story) for levels 1–3. */
export const DEMO_FACTS: GameFact[][] = demoGame.levels.map((l) => l.facts);

/** A language fact (neutral alphabet source). */
export const letterFact = (id: string, text: LocalizedText): GameFact => ({ id, text, kind: 'language', sources: [LANGUAGE_SOURCES.alphabet] });

export interface KitDemoSpec<C> {
  id: string;
  topicId: TopicId;
  coverArt: string;
  title: LocalizedText;
  description: LocalizedText;
  howTo: LocalizedText;
  configs: [C, C, C];
  component: ComponentType<GameApi<C>>;
  /** Facts per level (default: the Star Path facts). */
  facts?: [GameFact[], GameFact[], GameFact[]];
  order: number;
}

export function kitDemo<C>(spec: KitDemoSpec<C>): GameDef<C> {
  const ns = (lang: 'en' | 'de' | 'bs') => ({ title: spec.title[lang], description: spec.description[lang], howTo: spec.howTo[lang] });
  const i18n = defineNamespace(`game.${spec.id}`, { en: ns('en'), de: ns('de'), bs: ns('bs') });
  const facts = spec.facts ?? (DEMO_FACTS as [GameFact[], GameFact[], GameFact[]]);
  return {
    id: spec.id,
    topicId: spec.topicId,
    i18n,
    coverArt: spec.coverArt,
    component: spec.component,
    levels: [
      { level: 1, config: spec.configs[0], facts: facts[0] },
      { level: 2, config: spec.configs[1], facts: facts[1] },
      { level: 3, config: spec.configs[2], facts: facts[2] },
    ],
    order: 1000 + spec.order,
    dev: true,
  };
}

export function registerAll(defs: GameDef<any>[]): void {
  for (const def of defs) registerGame(def);
}
