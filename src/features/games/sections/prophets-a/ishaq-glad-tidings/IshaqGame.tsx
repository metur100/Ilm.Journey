import type { GameApi } from '@/core/games';
import { BuildScene, GameBoard, kitResult, type KitDoneInfo } from '@/core/games/kit';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import type { EpisodeConfig } from '../../prophets-story/episode';
import { factsFor } from '../shared';
import { WELCOME, WELCOME_FACT } from './content';

export type IshaqConfig = { mode: 'welcome' } | EpisodeConfig;

/** Glad Tidings: L1 prepare the welcome (BuildScene), L2 the glad tidings (episode: order), L3 the family of prophets (episode: connect). */
export function IshaqGame(api: GameApi<IshaqConfig>) {
  const { config } = api;
  if (config.mode === 'episode') return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  const onDone = ({ mistakes, missed }: KitDoneInfo) => api.onComplete(kitResult({ moves: WELCOME.length, mistakes, factsMissed: factsFor(missed, WELCOME_FACT) }));
  return (
    <GameBoard api={api}>
      <BuildScene
        scene="prophet.ishaq-tent-site"
        parts={WELCOME}
        ordered
        prompt={api.t('play.welcome')}
        reveal={{ title: api.t('play.reveal'), caption: api.t('play.revealCaption') }}
        onDone={onDone}
      />
    </GameBoard>
  );
}
