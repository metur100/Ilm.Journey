import type { GameApi } from '@/core/games';
import { GameBoard, TapScene } from '@/core/games/kit';

import { finishWith } from '../shared/game';
import type { SignsConfig } from './register';

export function SignsGame(api: GameApi<SignsConfig>) {
  const { scene, spots, ordered, hints, prompt, factOf } = api.config;
  const targets = spots.filter((s) => s.target !== false).length;
  return (
    <GameBoard api={api}>
      <TapScene scene={scene} spots={spots} ordered={ordered} hints={hints} prompt={api.t(prompt)} onDone={finishWith(api, targets, (id) => factOf[id] ?? api.facts[0]?.id)} />
    </GameBoard>
  );
}
