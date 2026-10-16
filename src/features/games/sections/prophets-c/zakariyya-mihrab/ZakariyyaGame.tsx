import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, TapScene } from '@/core/games/kit';

import { factsFor } from '../shared';
import { ZAKARIYYA_MISSED, type ZakariyyaConfig } from './register';

/** The Mihrab (3:37–41) – a TapScene in the room of the mihrab. */
export function ZakariyyaGame(api: GameApi<ZakariyyaConfig>) {
  const { spots, ordered, hints, prompt } = api.config;
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
