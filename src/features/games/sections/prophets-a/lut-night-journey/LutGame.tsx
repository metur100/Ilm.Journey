import type { GameApi } from '@/core/games';
import { CatchGame, GameBoard, kitResult, PathTrace, SortBins, type KitDoneInfo } from '@/core/games/kit';

import { factsFor } from '../shared';
import { CALL_BINS, CALL_ITEMS, CATCH_ITEMS, ITEM_FACT, NIGHT_PATH } from './content';

export interface LutConfig {
  mode: 'sort' | 'path' | 'catch';
}

/** The Night Journey: Lut's call (L1 SortBins), the path by night (L2 PathTrace), collecting the good (L3 CatchGame). */
export function LutGame(api: GameApi<LutConfig>) {
  const { mode } = api.config;
  const finish = (moves: number) => ({ mistakes, missed }: KitDoneInfo) => api.onComplete(kitResult({ moves, mistakes, factsMissed: factsFor(missed, ITEM_FACT) }));
  if (mode === 'sort') {
    return (
      <GameBoard api={api}>
        <SortBins bins={CALL_BINS} items={CALL_ITEMS} prompt={api.t('play.sort')} onDone={finish(CALL_ITEMS.length)} />
      </GameBoard>
    );
  }
  if (mode === 'path') {
    return (
      <GameBoard api={api} padding={8}>
        <PathTrace map="prophet.lut-night-map" stops={NIGHT_PATH} prompt={api.t('play.path')} onDone={finish(NIGHT_PATH.length - 1)} />
      </GameBoard>
    );
  }
  const goal = CATCH_ITEMS.filter((i) => i.good).length;
  return (
    <GameBoard api={api} padding={8}>
      <CatchGame items={CATCH_ITEMS} goal={goal} speed="calm" basketArt="kit.basket" sky="prophet.lut-night-map" hints={false} prompt={api.t('play.catch')} onDone={finish(goal)} />
    </GameBoard>
  );
}
