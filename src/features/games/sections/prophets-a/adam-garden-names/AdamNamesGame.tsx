import type { GameApi } from '@/core/games';
import { ConnectPairs, GameBoard, kitResult, type KitDoneInfo } from '@/core/games/kit';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import type { EpisodeConfig } from '../../prophets-story/episode';
import { ADAM_FACTS, THINGS } from './content';

export type AdamNamesConfig = { mode: 'names' } | EpisodeConfig;

/** Adam: L1 the names (ConnectPairs picture ↔ name), L2 Iblis refuses (episode: sort), L3 the tree and the repentance (episode: order). */
export function AdamNamesGame(api: GameApi<AdamNamesConfig>) {
  const { config } = api;
  if (config.mode === 'episode') return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  const done = ({ mistakes, missed }: KitDoneInfo) =>
    api.onComplete(kitResult({ moves: THINGS.length, mistakes, factsMissed: missed.length === 0 ? [] : [ADAM_FACTS.names.id] }));
  return (
    <GameBoard api={api}>
      <ConnectPairs
        pairs={THINGS.map((t) => ({ id: t.id, left: { art: t.art, a11y: t.name }, right: { label: t.name } }))}
        shuffleLeft
        prompt={api.t('play.connect')}
        onDone={done}
      />
    </GameBoard>
  );
}
