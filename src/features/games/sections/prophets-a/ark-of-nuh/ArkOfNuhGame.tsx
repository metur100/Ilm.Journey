import type { GameApi } from '@/core/games';
import { BuildScene, GameBoard, kitResult, MemoryPairs, SequenceBoard, type KitDoneInfo } from '@/core/games/kit';

import { factsFor } from '../shared';
import { ANIMAL_PAIRS, ARK_PARTS, PART_FACT, VOYAGE, VOYAGE_FACT } from './content';
import { ARK_FACTS } from './facts';

export interface ArkConfig {
  mode: 'build' | 'pairs' | 'voyage';
}

/** Ark of Nuh: L1 build the ark (BuildScene), L2 animal pairs (MemoryPairs), L3 the voyage in order (SequenceBoard path). */
export function ArkOfNuhGame(api: GameApi<ArkConfig>) {
  const { mode } = api.config;
  const finish = (moves: number, map: Record<string, string>) => ({ mistakes, missed }: KitDoneInfo) =>
    api.onComplete(kitResult({ moves, mistakes, factsMissed: factsFor(missed, map) }));
  return (
    <GameBoard api={api}>
      {mode === 'build' ? (
        <BuildScene
          scene="prophet.nuh-shipyard"
          parts={ARK_PARTS}
          ordered
          prompt={api.t('play.build')}
          reveal={{ title: api.t('play.reveal'), caption: api.t('play.revealCaption') }}
          onDone={finish(ARK_PARTS.length, PART_FACT)}
        />
      ) : mode === 'pairs' ? (
        <MemoryPairs
          pairs={ANIMAL_PAIRS}
          peekMs={2500}
          prompt={api.t('play.pairs')}
          onDone={finish(ANIMAL_PAIRS.length, Object.fromEntries(ANIMAL_PAIRS.map((p) => [p.id, ARK_FACTS.eachKind.id])))}
        />
      ) : (
        <SequenceBoard variant="path" items={VOYAGE} hints={false} endArt="prophet.nuh-judi" prompt={api.t('play.voyage')} onDone={finish(VOYAGE.length, VOYAGE_FACT)} />
      )}
    </GameBoard>
  );
}
