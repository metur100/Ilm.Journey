import type { GameApi } from '@/core/games';
import { BuildScene, GameBoard, kitResult, SequenceBoard, type KitDoneInfo } from '@/core/games/kit';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import type { EpisodeConfig } from '../../prophets-story/episode';
import { factsFor } from '../shared';
import { ARK_PARTS, PART_FACT, VOYAGE, VOYAGE_FACT } from './content';

export type ArkConfig = { mode: 'build' | 'voyage' } | EpisodeConfig;

/** Ark of Nuh: L1 the long call (episode: sort), L2 build the ark (BuildScene), L3 the flood and the rescue in order (SequenceBoard path). */
export function ArkOfNuhGame(api: GameApi<ArkConfig>) {
  const { config } = api;
  if (config.mode === 'episode') return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  const finish = (moves: number, map: Record<string, string>) => ({ mistakes, missed }: KitDoneInfo) =>
    api.onComplete(kitResult({ moves, mistakes, factsMissed: factsFor(missed, map) }));
  return (
    <GameBoard api={api}>
      {config.mode === 'build' ? (
        <BuildScene
          scene="prophet.nuh-shipyard"
          parts={ARK_PARTS}
          ordered
          prompt={api.t('play.build')}
          reveal={{ title: api.t('play.reveal'), caption: api.t('play.revealCaption') }}
          onDone={finish(ARK_PARTS.length, PART_FACT)}
        />
      ) : (
        <SequenceBoard variant="path" items={VOYAGE} hints={false} endArt="prophet.nuh-judi" prompt={api.t('play.voyage')} onDone={finish(VOYAGE.length, VOYAGE_FACT)} />
      )}
    </GameBoard>
  );
}
