import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, TapScene } from '@/core/games/kit';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import { isEpisodeConfig } from '../../prophets-story/episode';
import { factsFor } from '../shared';
import { ZAKARIYYA_MISSED, type ZakariyyaConfig } from './register';

/** L1 the provision in the mihrab (3:37) – a TapScene in the room; L2 and L3 are episodes (the dua, the glad tidings). */
export function ZakariyyaGame(api: GameApi<ZakariyyaConfig>) {
  const { config } = api;
  if (isEpisodeConfig(config)) return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  const { spots, ordered, hints, prompt } = config;
  const targets = spots.filter((s) => s.target !== false).length;
  return (
    <GameBoard api={api}>
      <TapScene
        scene="prophet.zakariyya-room"
        spots={spots}
        ordered={ordered}
        hints={hints}
        prompt={api.t(prompt)}
        onDone={({ mistakes, missed }) => api.onComplete(kitResult({ moves: targets, mistakes, factsMissed: factsFor(missed, ZAKARIYYA_MISSED) }))}
      />
    </GameBoard>
  );
}
