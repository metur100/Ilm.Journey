import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, PathTrace, type KitDoneInfo } from '@/core/games/kit';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import type { EpisodeConfig } from '../../prophets-story/episode';
import { factsFor } from '../shared';
import { RUN_FACT, RUNS } from './content';

export type IsmailConfig = { mode: 'runs' } | EpisodeConfig;

/** Ismail: L1 the seven runs between Safa and Marwa (PathTrace), L2 the dream and the sacrifice (episode: order), L3 what Allah praised in him (episode: memory). */
export function IsmailGame(api: GameApi<IsmailConfig>) {
  const { config } = api;
  if (config.mode === 'episode') return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  const onDone = ({ mistakes, missed }: KitDoneInfo) => api.onComplete(kitResult({ moves: RUNS.length - 1, mistakes, factsMissed: factsFor(missed, RUN_FACT) }));
  return (
    <GameBoard api={api} padding={8}>
      <PathTrace map="prophet.ismail-safa-marwa" stops={RUNS} tolerance={0.1} prompt={api.t('play.runs')} onDone={onDone} />
    </GameBoard>
  );
}
