import type { GameApi } from '@/core/games';
import { GameBoard, SequenceBoard, SortBins, type SortItem } from '@/core/games/kit';

import { finishWith } from '../shared/game';
import type { EtiquetteConfig } from './register';

export function EtiquetteGame(api: GameApi<EtiquetteConfig>) {
  const { mode, bins, items, hints, factOf } = api.config;
  const done = finishWith(api, items.length, (id) => factOf[id] ?? api.facts[0]?.id);
  return (
    <GameBoard api={api}>
      {mode === 'order' ? (
        <SequenceBoard items={items} hints={hints} prompt={api.t('play.promptOrder')} onDone={done} />
      ) : (
        <SortBins bins={bins} items={items as SortItem[]} hints={hints} prompt={api.t(bins.length > 2 ? 'play.promptMoment' : 'play.promptSort')} onDone={done} />
      )}
    </GameBoard>
  );
}
