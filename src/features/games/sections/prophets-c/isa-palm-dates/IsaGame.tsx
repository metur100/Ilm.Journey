import type { GameApi } from '@/core/games';
import { CatchGame, GameBoard, kitResult } from '@/core/games/kit';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import { isEpisodeConfig } from '../../prophets-story/episode';
import { factsFor } from '../shared';
import { ISA_MISSED, type IsaConfig } from './register';

/** L1 the palm tree and the stream (19:23–26) – gather the falling dates in the basket; L2 and L3 are episodes. */
export function IsaGame(api: GameApi<IsaConfig>) {
  const { config } = api;
  if (isEpisodeConfig(config)) return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  const { items, goal, lanes, speed, hints, prompt } = config;
  return (
    <GameBoard api={api}>
      <CatchGame
        items={items}
        goal={goal}
        lanes={lanes}
        speed={speed}
        hints={hints}
        sky="prophet.isa-palm-stream"
        basketArt="prophet.isa-date-basket"
        prompt={api.t(prompt)}
        onDone={({ mistakes, missed }) => api.onComplete(kitResult({ moves: goal, mistakes, factsMissed: factsFor(missed, ISA_MISSED) }))}
      />
    </GameBoard>
  );
}
