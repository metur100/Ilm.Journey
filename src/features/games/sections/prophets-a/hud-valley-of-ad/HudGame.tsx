import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, SortBins, TapScene, type KitDoneInfo } from '@/core/games/kit';

import { factsFor } from '../shared';
import { BINS, ITEM_FACT, SORT_ITEMS, SPOTS_L1, SPOTS_L2 } from './content';

export interface HudConfig {
  mode: 'find' | 'findOrdered' | 'sort';
}

/** The Valley of ʿAd: find the gifts (L1), one after another with a distractor (L2), sort gift / call / pride (L3). */
export function HudGame(api: GameApi<HudConfig>) {
  const { mode } = api.config;
  const finish = (moves: number) => ({ mistakes, missed }: KitDoneInfo) => api.onComplete(kitResult({ moves, mistakes, factsMissed: factsFor(missed, ITEM_FACT) }));
  if (mode === 'sort') {
    return (
      <GameBoard api={api}>
        <SortBins bins={BINS} items={SORT_ITEMS} hints={false} prompt={api.t('play.sort')} onDone={finish(SORT_ITEMS.length)} />
      </GameBoard>
    );
  }
  const spots = mode === 'find' ? SPOTS_L1 : SPOTS_L2;
  return (
    <GameBoard api={api} padding={8}>
      <TapScene
        scene="prophet.hud-valley"
        spots={spots}
        ordered={mode === 'findOrdered'}
        hints={mode === 'find'}
        prompt={api.t(mode === 'find' ? 'play.find' : 'play.findOrdered')}
        onDone={finish(spots.filter((s) => s.target !== false).length)}
      />
    </GameBoard>
  );
}
