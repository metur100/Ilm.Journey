import type { GameApi } from '@/core/games';
import { BuildScene, GameBoard, kitResult } from '@/core/games/kit';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import { isEpisodeConfig } from '../../prophets-story/episode';
import { factsFor } from '../shared';
import { ILYAS_MISSED, type IlyasConfig } from './register';

/** L1 the call of Ilyas (37:123–126) – the path lights up lantern by lantern, in the order of the ayahs; L2 and L3 are episodes. */
export function IlyasGame(api: GameApi<IlyasConfig>) {
  const { config } = api;
  if (isEpisodeConfig(config)) return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  const { parts, ghosts, hints, visible, prompt } = config;
  return (
    <GameBoard api={api}>
      <BuildScene
        scene="prophet.ilyas-hills-map"
        parts={parts}
        ordered
        ghosts={ghosts}
        hints={hints}
        visible={visible}
        prompt={api.t(prompt)}
        reveal={{
          title: api.t('reveal.title'),
          caption: api.t('reveal.caption'),
        }}
        onDone={({ mistakes, missed }) =>
          api.onComplete(
            kitResult({
              moves: parts.length,
              mistakes,
              factsMissed: factsFor(missed, ILYAS_MISSED),
            }),
          )
        }
      />
    </GameBoard>
  );
}
