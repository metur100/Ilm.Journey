import type { GameApi, GameDef, GameFact } from '@/core/games';
import { type KitDoneInfo, kitResult } from '@/core/games/kit';

/** Every Ramadan game sits in the `ramadan` topic. */
export function ramadanGame<C>(def: Omit<GameDef<C>, 'topicId'>): GameDef<C> {
  return { ...def, topicId: 'ramadan' };
}

/**
 * Turns an engine's done info into the level result: missed item ids are mapped to fact ids of the level (through
 * `factOf`, a fact outside the level counts against the level's first fact).
 */
export function finishWith<C>(api: GameApi<C>, moves: number, factOf?: (itemId: string) => string | undefined) {
  return (info: KitDoneInfo) => {
    const fallback = api.facts[0]?.id;
    const inLevel = (id?: string) => !!id && api.facts.some((f: GameFact) => f.id === id);
    const missed = info.missed.map((id) => factOf?.(id)).map((id) => (inLevel(id) ? id : fallback)).filter((id): id is string => !!id);
    api.onComplete(kitResult({ moves, mistakes: info.mistakes, factsMissed: missed }));
  };
}
