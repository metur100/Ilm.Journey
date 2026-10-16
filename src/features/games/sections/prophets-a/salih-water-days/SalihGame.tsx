import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, PourFill, SortBins, type KitDoneInfo } from '@/core/games/kit';

import { factsFor } from '../shared';
import { DAY_BINS, DAYS, ITEM_FACT, JARS_L1, JARS_L3 } from './content';

export interface SalihConfig {
  mode: 'pour' | 'days' | 'pourStrict';
}

/** Water Days: pour the people's share (L1), sort the days into turns (L2), pour exact shares (L3). */
export function SalihGame(api: GameApi<SalihConfig>) {
  const { mode } = api.config;
  const finish = (moves: number) => ({ mistakes, missed }: KitDoneInfo) => api.onComplete(kitResult({ moves, mistakes, factsMissed: factsFor(missed, ITEM_FACT) }));
  if (mode === 'days') {
    return (
      <GameBoard api={api}>
        <SortBins bins={DAY_BINS} items={DAYS} ordered hints={false} prompt={api.t('play.days')} onDone={finish(DAYS.length)} />
      </GameBoard>
    );
  }
  const jars = mode === 'pour' ? JARS_L1 : JARS_L3;
  return (
    <GameBoard api={api}>
      <PourFill vessels={jars} liquid="water" hints={mode === 'pour'} prompt={api.t(mode === 'pour' ? 'play.pour' : 'play.pourStrict')} onDone={finish(jars.length)} />
    </GameBoard>
  );
}
