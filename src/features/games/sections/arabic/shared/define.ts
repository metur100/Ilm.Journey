import { type ComponentType, createElement } from 'react';

import type { GameApi, GameDef, GameFact } from '@/core/games';

/**
 * Builds a game of the Arabic / Sufara section (topic `arabic`). The component is loaded on first render, so
 * registering the games (also in tests that call `registerFeatures()`) keeps UI modules out of the import graph.
 */
export function arabicGame<C>(def: Omit<GameDef<C>, 'topicId' | 'component' | 'levels'> & { load: () => ComponentType<GameApi<C>>; levels: [LevelSpec<C>, LevelSpec<C>, LevelSpec<C>] }): GameDef<C> {
  const { load, levels, ...rest } = def;
  const Lazy: ComponentType<GameApi<C>> = (props) => createElement(load(), props);
  return {
    ...rest,
    topicId: 'arabic',
    component: Lazy,
    levels: levels.map((l, i) => ({ level: (i + 1) as 1 | 2 | 3, config: l.config, facts: l.facts })),
  };
}

export interface LevelSpec<C> {
  config: C;
  facts: GameFact[];
}

/** Maps the ids a kit engine reports as missed to the level's fact ids (all facts when no mapping). */
export function missedFacts(missed: readonly string[], facts: readonly GameFact[], map?: (itemId: string) => string | undefined): string[] {
  if (missed.length === 0) return [];
  if (!map) return [facts[0].id];
  return [...new Set(missed.map(map).filter((x): x is string => !!x && facts.some((f) => f.id === x)))];
}
