import type { GameApi } from '@/core/games';
import { BuildScene, GameBoard, kitResult, SequenceBoard, type KitDoneInfo } from '@/core/games/kit';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import type { EpisodeConfig } from '../../prophets-story/episode';
import { factsFor } from '../shared';
import { ITEM_FACT, SKY, WALLS } from './content';

export type IbrahimConfig = { mode: 'sky' | 'walls' } | EpisodeConfig;

/** Ibrahim: L1 the sky path (SequenceBoard), L2 the statues and the fire (episode: connect), L3 the walls of the Kaaba (BuildScene). */
export function IbrahimGame(api: GameApi<IbrahimConfig>) {
  const { config } = api;
  if (config.mode === 'episode') return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  const finish = (moves: number) => ({ mistakes, missed }: KitDoneInfo) => api.onComplete(kitResult({ moves, mistakes, factsMissed: factsFor(missed, ITEM_FACT) }));
  return (
    <GameBoard api={api}>
      {config.mode === 'sky' ? (
        <SequenceBoard variant="path" items={SKY} endArt="place.kaaba" prompt={api.t('play.sky')} onDone={finish(SKY.length)} />
      ) : (
        <BuildScene
          scene="prophet.ibrahim-building-site"
          parts={WALLS}
          ordered
          hints={false}
          prompt={api.t('play.walls')}
          reveal={{ title: api.t('play.reveal'), caption: api.t('play.revealCaption') }}
          onDone={finish(WALLS.length)}
        />
      )}
    </GameBoard>
  );
}
