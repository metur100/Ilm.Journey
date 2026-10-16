import type { GameApi } from '@/core/games';
import { GameBoard, PathTrace } from '@/core/games/kit';

import { finishWith } from '../shared/game';
import type { JuzPathConfig } from './register';

export function JuzPathGame(api: GameApi<JuzPathConfig>) {
  const { stops, showRoute, hints, backwards } = api.config;
  const first = String(stops[0].label);
  const last = String(stops[stops.length - 1].label);
  return (
    <GameBoard api={api} padding={8}>
      <PathTrace
        map="quran.juz-sky"
        stops={stops}
        showRoute={showRoute}
        hints={hints}
        prompt={api.t(backwards ? 'play.promptBack' : 'play.prompt', { first, last })}
        onDone={finishWith(api, stops.length - 1)}
      />
    </GameBoard>
  );
}
