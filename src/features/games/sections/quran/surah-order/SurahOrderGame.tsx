import type { GameApi } from '@/core/games';
import { GameBoard, TimelineSlider } from '@/core/games/kit';

import { finishWith } from '../shared/game';
import type { SurahOrderConfig } from './register';

export function SurahOrderGame(api: GameApi<SurahOrderConfig>) {
  const { marks, events, mode, hints, factOf } = api.config;
  return (
    <GameBoard api={api}>
      <TimelineSlider
        marks={marks}
        events={events}
        hints={hints}
        prompt={api.t(mode === 'count' ? 'play.promptCount' : 'play.promptOrder')}
        onDone={finishWith(api, events.length, (id) => factOf[id] ?? api.facts[0]?.id)}
      />
    </GameBoard>
  );
}
