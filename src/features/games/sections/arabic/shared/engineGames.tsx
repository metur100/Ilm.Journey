import type { GameApi } from '@/core/games';
import { ConnectPairs, type ConnectPair, GameBoard, kitResult, MemoryPairs, type MemoryPair, SequenceBoard, type KitItem, SortBins, type SortBin, type SortItem } from '@/core/games/kit';

import { missedFacts } from './define';

/*
 * Thin game components over the kit engines, configured per level (bins / pairs / items + hints). Each reports the
 * level result with the missed item ids mapped to the level's facts through `factOf` (item id → fact id).
 */

interface Common {
  hints: boolean;
  /** Game i18n key of the inline prompt. */
  prompt: string;
  /** Item id → fact id (default: the level's first fact for any mistake). */
  factOf?: Record<string, string>;
}

const finish = <C extends Common>(api: GameApi<C>, moves: number) => (info: { mistakes: number; missed: string[] }) =>
  api.onComplete(kitResult({ moves, mistakes: info.mistakes, factsMissed: missedFacts(info.missed, api.facts, api.config.factOf ? (id) => api.config.factOf![id] ?? api.facts[0].id : undefined) }));

export interface SortConfig extends Common {
  bins: SortBin[];
  items: SortItem[];
}

export function SortGame(api: GameApi<SortConfig>) {
  const { bins, items, hints, prompt } = api.config;
  return (
    <GameBoard api={api}>
      <SortBins bins={bins} items={items} hints={hints} visible={hints ? 3 : 4} prompt={api.t(prompt)} onDone={finish(api, items.length)} />
    </GameBoard>
  );
}

export interface ConnectConfig extends Common {
  pairs: ConnectPair[];
}

export function ConnectGame(api: GameApi<ConnectConfig>) {
  const { pairs, hints, prompt } = api.config;
  return (
    <GameBoard api={api}>
      <ConnectPairs pairs={pairs} hints={hints} prompt={api.t(prompt)} onDone={finish(api, pairs.length)} />
    </GameBoard>
  );
}

export interface MemoryConfig extends Common {
  pairs: MemoryPair[];
  peekMs?: number;
  columns?: number;
}

export function MemoryGame(api: GameApi<MemoryConfig>) {
  const { pairs, hints, prompt, peekMs, columns } = api.config;
  return (
    <GameBoard api={api}>
      <MemoryPairs pairs={pairs} hints={hints} peekMs={peekMs} columns={columns} prompt={api.t(prompt)} onDone={finish(api, pairs.length)} />
    </GameBoard>
  );
}

export interface SequenceConfig extends Common {
  items: KitItem[];
  variant: 'list' | 'path';
  columns?: number;
}

export function SequenceGame(api: GameApi<SequenceConfig>) {
  const { items, hints, prompt, variant, columns } = api.config;
  return (
    <GameBoard api={api}>
      <SequenceBoard items={items} variant={variant} columns={columns} hints={hints} endArt="object.scroll" prompt={api.t(prompt)} onDone={finish(api, items.length)} />
    </GameBoard>
  );
}
