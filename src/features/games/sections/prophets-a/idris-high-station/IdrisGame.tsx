import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, PathTrace, SortBins, type KitDoneInfo } from '@/core/games/kit';

import { factsFor } from '../shared';
import { ITEM_FACT, PATH_L1, PATH_L2, QUALITY_BINS, QUALITY_ITEMS, STOP_FACT } from './content';

export interface IdrisConfig {
  mode: 'path' | 'pathFree' | 'sort';
}

/** The High Station: a star path up the mountain (L1 with the route, L2 without), then sorting deeds (L3). */
export function IdrisGame(api: GameApi<IdrisConfig>) {
  const { mode } = api.config;
  const finish = (moves: number, map: Record<string, string>) => ({ mistakes, missed }: KitDoneInfo) =>
    api.onComplete(kitResult({ moves, mistakes, factsMissed: factsFor(missed, map) }));
  if (mode === 'sort') {
    return (
      <GameBoard api={api}>
        <SortBins bins={QUALITY_BINS} items={QUALITY_ITEMS} hints={false} prompt={api.t('play.sort')} onDone={finish(QUALITY_ITEMS.length, ITEM_FACT)} />
      </GameBoard>
    );
  }
  const stops = mode === 'path' ? PATH_L1 : PATH_L2;
  return (
    <GameBoard api={api} padding={8}>
      <PathTrace
        map="prophet.idris-sky-steps"
        stops={stops}
        showRoute={mode === 'path'}
        hints={mode === 'path'}
        prompt={api.t(mode === 'path' ? 'play.path' : 'play.pathFree')}
        onDone={finish(stops.length - 1, STOP_FACT)}
      />
    </GameBoard>
  );
}
