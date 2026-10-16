import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, SequenceBoard, TimelineSlider } from '@/core/games/kit';

import { factsFor } from '../shared';
import { MUHAMMAD_MISSED, type MuhammadConfig } from './register';

/** The Chain of the Messengers (33:40, 4:163) – a timeline of the messengers (L1, L3) and the chain as a path (L2). */
export function MuhammadGame(api: GameApi<MuhammadConfig>) {
  const config = api.config;
  const finish =
    (moves: number) =>
    ({ mistakes, missed }: { mistakes: number; missed: string[] }) =>
      api.onComplete(kitResult({ moves, mistakes, factsMissed: factsFor(missed, MUHAMMAD_MISSED) }));
  return (
    <GameBoard api={api}>
      {config.mode === 'timeline' ? (
        <TimelineSlider marks={config.marks} events={config.events} hints={config.hints} prompt={api.t(config.prompt)} onDone={finish(config.events.length)} />
      ) : (
        <SequenceBoard
          variant="path"
          items={config.items}
          endArt="prophet.muhammad-star-chain"
          hints={config.hints}
          prompt={api.t(config.prompt)}
          onDone={finish(config.items.length)}
        />
      )}
    </GameBoard>
  );
}
