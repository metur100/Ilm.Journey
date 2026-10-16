import type { GameApi } from '@/core/games';
import { BuildScene, GameBoard, kitResult, SequenceBoard, type KitDoneInfo } from '@/core/games/kit';

import { factsFor } from '../shared';
import { DUA, ITEM_FACT, SKY, WALLS } from './content';

export interface IbrahimConfig {
  mode: 'sky' | 'walls' | 'dua';
}

/** Raising the House: the sky path (L1), the walls of the Kaaba (L2, BuildScene), the dua in order (L3). */
export function IbrahimGame(api: GameApi<IbrahimConfig>) {
  const { mode } = api.config;
  const finish = (moves: number) => ({ mistakes, missed }: KitDoneInfo) => api.onComplete(kitResult({ moves, mistakes, factsMissed: factsFor(missed, ITEM_FACT) }));
  return (
    <GameBoard api={api}>
      {mode === 'sky' ? (
        <SequenceBoard variant="path" items={SKY} endArt="place.kaaba" prompt={api.t('play.sky')} onDone={finish(SKY.length)} />
      ) : mode === 'walls' ? (
        <BuildScene
          scene="prophet.ibrahim-building-site"
          parts={WALLS}
          ordered
          prompt={api.t('play.walls')}
          reveal={{ title: api.t('play.reveal'), caption: api.t('play.revealCaption') }}
          onDone={finish(WALLS.length)}
        />
      ) : (
        <SequenceBoard variant="list" items={DUA} hints={false} prompt={api.t('play.dua')} onDone={finish(DUA.length)} />
      )}
    </GameBoard>
  );
}
