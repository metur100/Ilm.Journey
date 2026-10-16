import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, SequenceBoard } from '@/core/games/kit';

import type { YusufPathConfig } from './content';

/** Yusuf's Story Trail: lay the stops of the story along a path (L1–L2), then order the whole story from memory (L3). */
export function YusufStoryPathGame(api: GameApi<YusufPathConfig>) {
  const { events, variant, hints, missedFactId } = api.config;
  return (
    <GameBoard api={api}>
      <SequenceBoard
        items={events}
        variant={variant}
        columns={variant === 'path' ? 3 : undefined}
        endArt="prophet.yaqub-home"
        hints={hints}
        prompt={api.t(variant === 'path' ? 'play.prompt' : 'play.promptList')}
        onDone={({ mistakes }) => api.onComplete(kitResult({ moves: events.length, mistakes, factsMissed: mistakes > 0 ? [missedFactId] : [] }))}
      />
    </GameBoard>
  );
}
