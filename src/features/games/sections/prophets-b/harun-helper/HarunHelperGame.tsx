import { useMemo } from 'react';

import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, MemoryPairs, SequenceBoard } from '@/core/games/kit';

import { type HarunConfig, memoryPairs, orderItems } from './content';

/** Speak & Support (Harun, Quran 20:25–36): match Musa's requests with their pictures, then say the dua in order. */
export function HarunHelperGame(api: GameApi<HarunConfig>) {
  const { mode, ids, peekMs, hints } = api.config;
  const fact = api.facts[0]?.id ?? 'musa-dua';
  const pairs = useMemo(() => memoryPairs(ids), [ids]);
  const items = useMemo(() => orderItems(ids), [ids]);
  const done = (moves: number) => ({ mistakes }: { mistakes: number }) => api.onComplete(kitResult({ moves, mistakes, factsMissed: mistakes > 0 ? [fact] : [] }));
  return (
    <GameBoard api={api}>
      {mode === 'memory' ? (
        <MemoryPairs pairs={pairs} peekMs={peekMs} hints={hints} columns={4} prompt={api.t('play.promptMemory')} onDone={done(pairs.length)} />
      ) : (
        <SequenceBoard items={items} variant="list" hints={hints} prompt={api.t('play.promptOrder')} onDone={done(items.length)} />
      )}
    </GameBoard>
  );
}
