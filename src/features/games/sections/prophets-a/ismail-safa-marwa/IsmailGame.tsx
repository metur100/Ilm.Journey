import type { GameApi } from '@/core/games';
import { BuildScene, GameBoard, kitResult, PathTrace, PourFill, type KitDoneInfo } from '@/core/games/kit';

import { factsFor } from '../shared';
import { ITEM_FACT, RUNS, SITE, SKINS } from './content';

export interface IsmailConfig {
  mode: 'runs' | 'pour' | 'site';
}

/** Safa and Marwa: the seven runs (L1 PathTrace), filling waterskins at Zamzam (L2 PourFill), the basin (L3 BuildScene). */
export function IsmailGame(api: GameApi<IsmailConfig>) {
  const { mode } = api.config;
  const finish = (moves: number) => ({ mistakes, missed }: KitDoneInfo) => api.onComplete(kitResult({ moves, mistakes, factsMissed: factsFor(missed, ITEM_FACT) }));
  if (mode === 'runs') {
    return (
      <GameBoard api={api} padding={8}>
        <PathTrace map="prophet.ismail-safa-marwa" stops={RUNS} tolerance={0.1} prompt={api.t('play.runs')} onDone={finish(RUNS.length - 1)} />
      </GameBoard>
    );
  }
  if (mode === 'pour') {
    return (
      <GameBoard api={api}>
        <PourFill vessels={SKINS} liquid="water" prompt={api.t('play.pour')} onDone={finish(SKINS.length)} />
      </GameBoard>
    );
  }
  return (
    <GameBoard api={api}>
      <BuildScene
        scene="prophet.ismail-zamzam-site"
        parts={SITE}
        ordered
        ghosts={false}
        hints={false}
        prompt={api.t('play.site')}
        reveal={{ title: api.t('play.reveal'), caption: api.t('play.revealCaption') }}
        onDone={finish(SITE.length)}
      />
    </GameBoard>
  );
}
