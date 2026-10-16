import type { GameApi } from '@/core/games';
import { CatchGame, GameBoard } from '@/core/games/kit';

import { finishWith } from '../shared/game';
import type { GoodDeedsConfig } from './register';

export function GoodDeedsGame(api: GameApi<GoodDeedsConfig>) {
  const { items, goal, lanes, speed, hints, factOf } = api.config;
  return (
    <GameBoard api={api}>
      <CatchGame
        items={items}
        goal={goal}
        lanes={lanes}
        speed={speed}
        hints={hints}
        sky="quran.night-hills"
        basketArt="kit.basket"
        prompt={api.t('play.prompt')}
        onDone={finishWith(api, goal, (id) => factOf[id] ?? api.facts[0]?.id)}
      />
    </GameBoard>
  );
}
