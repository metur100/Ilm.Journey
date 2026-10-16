import type { GameApi } from '@/core/games';
import { BuildScene, GameBoard } from '@/core/games/kit';

import { finishWith } from '../shared/game';
import type { ScenesConfig } from './register';

export function SurahScenesGame(api: GameApi<ScenesConfig>) {
  const { scene, parts, ordered, ghosts, hints, prompt, reveal } = api.config;
  return (
    <GameBoard api={api}>
      <BuildScene scene={scene} parts={parts} ordered={ordered} ghosts={ghosts} hints={hints} reveal={reveal} prompt={api.t(prompt)} onDone={finishWith(api, parts.length)} />
    </GameBoard>
  );
}
