import type { GameApi } from '@/core/games';
import { ConnectPairs, GameBoard, kitResult, MemoryPairs, type KitDoneInfo } from '@/core/games/kit';

import { ADAM_FACTS, THINGS } from './content';

export interface AdamNamesConfig {
  mode: 'connect' | 'memory' | 'arabic';
  things: readonly string[];
  hints: boolean;
}

/** Names in the Garden: picture ↔ name (L1 connect, L2 memory), picture ↔ Arabic name (L3). */
export function AdamNamesGame(api: GameApi<AdamNamesConfig>) {
  const { mode, things, hints } = api.config;
  const items = things.map((id) => THINGS[id]);
  const done = ({ mistakes, missed }: KitDoneInfo) =>
    api.onComplete(
      kitResult({
        moves: items.length,
        mistakes,
        factsMissed: missed.length === 0 ? [] : [mode === 'arabic' ? ADAM_FACTS.arabicWords.id : ADAM_FACTS.names.id],
      }),
    );
  return (
    <GameBoard api={api}>
      {mode === 'memory' ? (
        <MemoryPairs
          pairs={items.map((t) => ({ id: t.id, a: { art: t.art, a11y: t.name }, b: { label: t.name }, caption: t.name }))}
          hints={hints}
          prompt={api.t('play.memory')}
          onDone={done}
        />
      ) : (
        <ConnectPairs
          pairs={items.map((t) => ({
            id: t.id,
            left: { art: t.art, a11y: t.name },
            right: mode === 'arabic' ? { arabic: t.arabic, sub: t.translit, a11y: t.translit } : { label: t.name },
          }))}
          shuffleLeft
          hints={hints}
          prompt={api.t(mode === 'arabic' ? 'play.arabic' : 'play.connect')}
          onDone={done}
        />
      )}
    </GameBoard>
  );
}
