import type { GameApi } from '@/core/games';
import { GameBoard, kitResult, TapScene, type KitDoneInfo } from '@/core/games/kit';

import { EpisodeBoard } from '../../prophets-story/EpisodeBoard';
import type { EpisodeConfig } from '../../prophets-story/episode';
import { factsFor } from '../shared';
import { GIFT_SPOTS, SPOT_FACT } from './content';

export type HudConfig = { mode: 'gifts' } | EpisodeConfig;

/** The Valley of ʿAd: L1 find the gifts (TapScene), L2 Hud's call or their pride (episode: sort), L3 the end of ʿAd and the rescue (episode: order). */
export function HudGame(api: GameApi<HudConfig>) {
  const { config } = api;
  if (config.mode === 'episode') return <EpisodeBoard api={api as GameApi<unknown>} episode={config.episode} />;
  const onDone = ({ mistakes, missed }: KitDoneInfo) => api.onComplete(kitResult({ moves: GIFT_SPOTS.length, mistakes, factsMissed: factsFor(missed, SPOT_FACT) }));
  return (
    <GameBoard api={api} padding={8}>
      <TapScene scene="prophet.hud-valley" spots={GIFT_SPOTS} hints prompt={api.t('play.find')} onDone={onDone} />
    </GameBoard>
  );
}
