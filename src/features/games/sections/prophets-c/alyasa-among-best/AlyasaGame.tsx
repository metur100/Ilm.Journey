import type { GameApi } from '@/core/games';
import { GameBoard, InlineCaption, kitResult, MemoryPairs } from '@/core/games/kit';

import { factsFor } from '../shared';
import { ALYASA_MISSED, type AlyasaConfig } from './register';

/** Among the Best (6:84–90, 38:48) – a memory board of the qualities the Quran gives these prophets. */
export function AlyasaGame(api: GameApi<AlyasaConfig>) {
  const { pairs, peekMs, hints, prompt } = api.config;
  return (
    <GameBoard api={api}>
      <InlineCaption text={api.t(prompt)} tone="hint" />
      <MemoryPairs
        pairs={pairs}
        peekMs={peekMs}
        hints={hints}
        columns={pairs.length > 4 ? 4 : 3}
        onDone={({ mistakes, missed }) => api.onComplete(kitResult({ moves: pairs.length, mistakes, factsMissed: factsFor(missed, ALYASA_MISSED) }))}
      />
    </GameBoard>
  );
}
