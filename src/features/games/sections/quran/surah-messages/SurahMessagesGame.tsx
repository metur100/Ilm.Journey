import type { GameApi } from '@/core/games';
import { ConnectPairs, GameBoard } from '@/core/games/kit';

import { finishWith } from '../shared/game';
import type { SurahMessagesConfig } from './register';

export function SurahMessagesGame(api: GameApi<SurahMessagesConfig>) {
  const { pairs, hints, mode, factOf } = api.config;
  return (
    <GameBoard api={api}>
      <ConnectPairs
        pairs={pairs}
        hints={hints}
        shuffleLeft={mode === 'ayah'}
        leftShare={mode === 'ayah' ? 0.4 : 0.42}
        prompt={api.t(mode === 'ayah' ? 'play.promptAyah' : 'play.prompt')}
        onDone={finishWith(api, pairs.length, (id) => factOf[id] ?? api.facts[0]?.id)}
      />
    </GameBoard>
  );
}
