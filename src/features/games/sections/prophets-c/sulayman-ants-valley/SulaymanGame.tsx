import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, PathTrace } from '@/core/games/kit';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import { isEpisodeConfig } from '../../prophets-story/episode';
import { factsFor } from '../shared';
import { SULAYMAN_MISSED, type SulaymanConfig } from './register';

/** L1 the valley of the ants (27:18) on a PathTrace board; L2 and L3 are episodes (the hoopoe, the queen of Saba'). */
export function SulaymanGame(api: GameApi<SulaymanConfig>) {
  const { config } = api;
  if (isEpisodeConfig(config)) return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  const { map, stops, showRoute, hints, prompt } = config;
  return (
    <GameBoard api={api}>
      <PathTrace
        map={map}
        stops={stops}
        showRoute={showRoute}
        hints={hints}
        tolerance={0.09}
        prompt={api.t(prompt)}
        onDone={({ mistakes, missed }) =>
          api.onComplete(
            kitResult({
              moves: stops.length - 1,
              mistakes,
              factsMissed: factsFor(missed, SULAYMAN_MISSED),
            }),
          )
        }
      />
    </GameBoard>
  );
}
