import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, PathTrace, type KitDoneInfo } from '@/core/games/kit';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import type { EpisodeConfig } from '../../prophets-story/episode';
import { factsFor } from '../shared';
import { HIGH_PATH, STOP_FACT } from './content';

export type IdrisConfig = { mode: 'climb' } | EpisodeConfig;

/** The High Station: L1 truthful (episode: sort), L2 patient (episode: connect), L3 the star path to the high station (PathTrace). */
export function IdrisGame(api: GameApi<IdrisConfig>) {
  const { config } = api;
  if (config.mode === 'episode') return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  const onDone = ({ mistakes, missed }: KitDoneInfo) =>
    api.onComplete(kitResult({ moves: HIGH_PATH.length - 1, mistakes, factsMissed: factsFor(missed, STOP_FACT) }));
  return (
    <GameBoard api={api} padding={8}>
      <PathTrace map="prophet.idris-sky-steps" stops={HIGH_PATH} showRoute={false} hints={false} prompt={api.t('play.climb')} onDone={onDone} />
    </GameBoard>
  );
}
