import { useMemo } from 'react';

import type { GameApi } from '@/core/games';
import { ConnectPairs, GameBoard, kitResult } from '@/core/games/kit';

import { springPairs, type SpringsConfig } from './logic';

/** Twelve Springs (Musa, Quran 2:60, 7:160): connect each tribe's camp to its own spring. */
export function MusaSpringsGame(api: GameApi<SpringsConfig>) {
  const { tribes, hints, shuffleLeft } = api.config;
  const pairs = useMemo(() => springPairs(tribes), [tribes]);
  const fact = api.facts[0]?.id ?? 'twelve-springs';
  const prompt = tribes <= 4 ? 'play.prompt' : tribes < 12 ? 'play.promptMore' : 'play.promptAll';
  return (
    <GameBoard api={api}>
      <ConnectPairs
        pairs={pairs}
        hints={hints}
        shuffleLeft={shuffleLeft}
        prompt={api.t(prompt)}
        onDone={({ mistakes }) => api.onComplete(kitResult({ moves: pairs.length, mistakes, factsMissed: mistakes > 0 ? [fact] : [] }))}
      />
    </GameBoard>
  );
}
