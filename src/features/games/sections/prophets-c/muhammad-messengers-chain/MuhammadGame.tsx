import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, TimelineSlider } from '@/core/games/kit';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import { isEpisodeConfig } from '../../prophets-story/episode';
import { factsFor } from '../shared';
import { MUHAMMAD_MISSED, type MuhammadConfig } from './register';

/** L1 the first revelation and L2 the Hijrah are episodes; L3 places the scriptures on the line of the messengers (33:40, 4:163). */
export function MuhammadGame(api: GameApi<MuhammadConfig>) {
  const { config } = api;
  if (isEpisodeConfig(config)) return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  return (
    <GameBoard api={api}>
      <TimelineSlider
        marks={config.marks}
        events={config.events}
        hints={config.hints}
        prompt={api.t(config.prompt)}
        onDone={({ mistakes, missed }) => api.onComplete(kitResult({ moves: config.events.length, mistakes, factsMissed: factsFor(missed, MUHAMMAD_MISSED) }))}
      />
    </GameBoard>
  );
}
