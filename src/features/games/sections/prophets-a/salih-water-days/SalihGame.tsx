import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, PourFill, type KitDoneInfo } from '@/core/games/kit';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import type { EpisodeConfig } from '../../prophets-story/episode';
import { factsFor } from '../shared';
import { JAR_FACT, JARS } from './content';

export type SalihConfig = { mode: 'pour' } | EpisodeConfig;

/** Water Days: L1 gifts and call (episode: sort), L2 the people's day at the water (PourFill), L3 the warning and the rescue (episode: order). */
export function SalihGame(api: GameApi<SalihConfig>) {
  const { config } = api;
  if (config.mode === 'episode') return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  const onDone = ({ mistakes, missed }: KitDoneInfo) => api.onComplete(kitResult({ moves: JARS.length, mistakes, factsMissed: factsFor(missed, JAR_FACT) }));
  return (
    <GameBoard api={api}>
      <PourFill vessels={JARS} liquid="water" hints={false} prompt={api.t('play.pour')} onDone={onDone} />
    </GameBoard>
  );
}
