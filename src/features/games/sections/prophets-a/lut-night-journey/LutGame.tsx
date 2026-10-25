import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, PathTrace, SortBins, type KitDoneInfo } from '@/core/games/kit';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import type { EpisodeConfig } from '../../prophets-story/episode';
import { factsFor } from '../shared';
import { CALL_BINS, CALL_FACT, CALL_ITEMS, NIGHT_PATH, STOP_FACT } from './content';

export type LutConfig = { mode: 'sort' | 'path' } | EpisodeConfig;

/** The Night Journey: L1 Lut's call (SortBins), L2 the guests (episode: order), L3 the path by night (PathTrace). */
export function LutGame(api: GameApi<LutConfig>) {
  const { config } = api;
  if (config.mode === 'episode') return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  const finish = (moves: number, map: Record<string, string>) => ({ mistakes, missed }: KitDoneInfo) =>
    api.onComplete(kitResult({ moves, mistakes, factsMissed: factsFor(missed, map) }));
  if (config.mode === 'sort') {
    return (
      <GameBoard api={api}>
        <SortBins bins={CALL_BINS} items={CALL_ITEMS} prompt={api.t('play.sort')} onDone={finish(CALL_ITEMS.length, CALL_FACT)} />
      </GameBoard>
    );
  }
  return (
    <GameBoard api={api} padding={8}>
      <PathTrace map="prophet.lut-night-map" stops={NIGHT_PATH} hints={false} prompt={api.t('play.path')} onDone={finish(NIGHT_PATH.length - 1, STOP_FACT)} />
    </GameBoard>
  );
}
