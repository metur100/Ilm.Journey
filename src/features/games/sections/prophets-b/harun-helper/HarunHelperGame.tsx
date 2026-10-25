import { useMemo } from 'react';

import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, MemoryPairs } from '@/core/games/kit';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import { isEpisodeConfig } from '../../prophets-story/episode';
import { type HarunConfig, type HarunGameConfig, memoryPairs } from './content';

/** Harun: L1 matches the requests of Musa's dua (Quran 20:25–36) with their pictures; L2 and L3 are episodes of his life. */
export function HarunHelperGame(api: GameApi<HarunGameConfig>) {
  const { config } = api;
  if (isEpisodeConfig(config)) return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  return <DuaPairs api={{ ...api, config }} />;
}

function DuaPairs({ api }: { api: GameApi<HarunConfig> }) {
  const { ids, peekMs, hints } = api.config;
  const fact = api.facts[0]?.id ?? 'musa-dua';
  const pairs = useMemo(() => memoryPairs(ids), [ids]);
  return (
    <GameBoard api={api}>
      <MemoryPairs
        pairs={pairs}
        peekMs={peekMs}
        hints={hints}
        columns={4}
        prompt={api.t('play.promptMemory')}
        onDone={({ mistakes }) => api.onComplete(kitResult({ moves: pairs.length, mistakes, factsMissed: mistakes > 0 ? [fact] : [] }))}
      />
    </GameBoard>
  );
}
