import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, PathTrace } from '@/core/games/kit';

import { factsFor } from '../shared';
import { SULAYMAN_MISSED, type SulaymanConfig } from './register';

/** The valley of the ants (27:18) and the hoopoe's way to Saba' (27:28) – a PathTrace board. */
export function SulaymanGame(api: GameApi<SulaymanConfig>) {
  const { map, stops, showRoute, hints, prompt } = api.config;
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
