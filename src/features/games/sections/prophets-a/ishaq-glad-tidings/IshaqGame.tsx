import type { GameApi } from '@/core/games';
import { BuildScene, ConnectPairs, GameBoard, kitResult, SequenceBoard, type KitDoneInfo } from '@/core/games/kit';

import { factsFor } from '../shared';
import { FAMILY, GUEST_STORY, ITEM_FACT, WELCOME } from './content';

export interface IshaqConfig {
  mode: 'welcome' | 'story' | 'family';
}

/** Glad Tidings: prepare the welcome (L1 BuildScene), the guests' story (L2 SequenceBoard), the family (L3 ConnectPairs). */
export function IshaqGame(api: GameApi<IshaqConfig>) {
  const { mode } = api.config;
  const finish = (moves: number) => ({ mistakes, missed }: KitDoneInfo) => api.onComplete(kitResult({ moves, mistakes, factsMissed: factsFor(missed, ITEM_FACT) }));
  return (
    <GameBoard api={api}>
      {mode === 'welcome' ? (
        <BuildScene
          scene="prophet.ishaq-tent-site"
          parts={WELCOME}
          ordered
          prompt={api.t('play.welcome')}
          reveal={{ title: api.t('play.reveal'), caption: api.t('play.revealCaption') }}
          onDone={finish(WELCOME.length)}
        />
      ) : mode === 'story' ? (
        <SequenceBoard variant="list" items={GUEST_STORY} prompt={api.t('play.story')} onDone={finish(GUEST_STORY.length)} />
      ) : (
        <ConnectPairs pairs={FAMILY} shuffleLeft hints={false} leftShare={0.38} prompt={api.t('play.family')} onDone={finish(FAMILY.length)} />
      )}
    </GameBoard>
  );
}
