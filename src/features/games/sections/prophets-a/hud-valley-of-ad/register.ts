import { type GameDef, registerGame } from '@/core/games';

import { lazyGame } from '../shared';
import { BINS, HUD_FACTS, SORT_ITEMS, SPOTS_L2 } from './content';
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
    { level: 1, config: { mode: 'find' }, facts: [HUD_FACTS.gifts, HUD_FACTS.iram] },
    { level: 2, config: { mode: 'findOrdered' }, facts: [HUD_FACTS.istighfar, HUD_FACTS.pride] },
    { level: 3, config: { mode: 'sort' }, facts: [HUD_FACTS.saved] },
  ],
  order: 4,
};

export const HUD_ART: string[] = [
  'prophet.hud-valley',
  ...SPOTS_L2.flatMap((s) => [s.spotArt, s.art].filter((a): a is string => !!a)),
  ...BINS.flatMap((b) => (b.art ? [b.art] : [])),
  ...SORT_ITEMS.flatMap((i) => (i.art ? [i.art] : [])),
];

export function registerHudGame(): void {
  registerGame(hudGame);
}
