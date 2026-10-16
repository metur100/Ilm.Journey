import type { GameApi } from '@/core/games';
import { CatchGame, GameBoard, kitResult } from '@/core/games/kit';

import { factsFor } from '../shared';
import { ISA_MISSED, type IsaConfig } from './register';

/** The Palm Tree and the Stream (19:23–26) – gather the falling dates in the basket. */
export function IsaGame(api: GameApi<IsaConfig>) {
  const { items, goal, lanes, speed, hints, prompt } = api.config;
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
