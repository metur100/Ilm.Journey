import { type GameDef, registerGame } from '@/core/games';

import { episodeArt } from '../../prophets-story/episode';
import { lazyGame } from '../shared';
import { CALL_EPISODE, GIFT_SPOTS, HUD_FACTS, RESCUE_EPISODE } from './content';
import type { HudConfig } from './HudGame';
import { hudI18n } from './i18n';

export const HUD_GAME_ID = 'hud-valley-of-ad';

export const hudGame: GameDef<HudConfig> = {
  id: HUD_GAME_ID,
  topicId: 'prophets',
  i18n: hudI18n,
  coverArt: 'prophet.hud-iram',
  hintArt: 'prophet.hud-spring',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./HudGame') as typeof import('./HudGame')).HudGame),
  levels: [
    // Three events of Hud's story, each with its lesson: the gifts, the call and the pride, the wind and the rescue.
    { level: 1, config: { mode: 'gifts' }, facts: [HUD_FACTS.gifts, HUD_FACTS.iram, HUD_FACTS.shukr] },
    { level: 2, config: { mode: 'episode', episode: CALL_EPISODE }, facts: [HUD_FACTS.istighfar, HUD_FACTS.pride, HUD_FACTS.humble] },
    { level: 3, config: { mode: 'episode', episode: RESCUE_EPISODE }, facts: [HUD_FACTS.wind, HUD_FACTS.saved, HUD_FACTS.listen] },
  ],
  order: 4,
};

export const HUD_ART: string[] = [
  'prophet.hud-valley',
  ...GIFT_SPOTS.flatMap((s) => [s.spotArt, s.art].filter((a): a is string => !!a)),
  ...episodeArt(CALL_EPISODE),
  ...episodeArt(RESCUE_EPISODE),
];

export function registerHudGame(): void {
  registerGame(hudGame);
}
