import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, SortBins } from '@/core/games/kit';

import { factsFor } from '../shared';
import { YAHYA_MISSED, type YahyaConfig } from './register';

/** What Yahya Was (19:12–15, 3:39) – sort the qualities of the ayahs into their baskets. */
export function YahyaGame(api: GameApi<YahyaConfig>) {
  const { bins, items, hints, prompt } = api.config;
  return (
    <GameBoard api={api}>
      <SortBins
        bins={bins}
        items={items}
        hints={hints}
        prompt={api.t(prompt)}
        onDone={({ mistakes, missed }) => api.onComplete(kitResult({ moves: items.length, mistakes, factsMissed: factsFor(missed, YAHYA_MISSED) }))}
      />
    </GameBoard>
  );
}
