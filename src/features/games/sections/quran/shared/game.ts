import { type ComponentType, createElement } from 'react';

import type { GameApi, GameFact } from '@/core/games';
import { kitResult } from '@/core/games/kit';
import type { KitDoneInfo } from '@/core/games/kit';

/**
 * The game component is required on first render, so registering the games (also in tests that only call
 * `registerFeatures()`) keeps UI modules (Reanimated, gesture handler, expo-audio) out of the import graph.
 */
export function lazyComponent<C>(load: () => ComponentType<GameApi<C>>): ComponentType<GameApi<C>> {
  let Loaded: ComponentType<GameApi<C>> | null = null;
  function LazyGame(props: GameApi<C>) {
    Loaded ??= load();
    return createElement(Loaded, props);
  }
  return LazyGame;
}

/**
 * Turns an engine's done info into the level result. `factFor` maps a missed item id to the fact it is about
 * (default: every missed item reports the level's first fact).
 */
export function finishWith<C>(api: GameApi<C>, moves: number, factFor?: (itemId: string) => string | undefined) {
  return (info: KitDoneInfo) => {
    const first = api.facts[0]?.id;
    const missed = info.missed.map((id) => (factFor ? factFor(id) : first)).filter((id): id is string => !!id);
    api.onComplete(kitResult({ moves, mistakes: info.mistakes, factsMissed: missed }));
  };
}

/** Ids of facts of a level (for the review mapping). */
export const factIds = (facts: readonly GameFact[]) => facts.map((f) => f.id);
