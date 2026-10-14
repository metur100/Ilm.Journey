import { registerGame, type GameDef } from '@/core/games';

import { QIBLA_FACTS } from './content';
import { FindQiblaGame } from './FindQiblaGame';
import { qiblaI18n } from './i18n';
import type { QiblaConfig } from './logic';

/*
 * Find the Qibla (Salah game 3, docs/GAMES.md): turn the compass towards the Kaaba from cities in Europe (L1, with a
 * hint arrow), around the world (L2, with hint) and mixed without hint (L3). The real initial great-circle bearing is
 * computed in ./logic.ts; after each city the shortest path on the globe is drawn on the map.
 */
export const findQiblaGame: GameDef<QiblaConfig> = {
  id: 'find-qibla',
  topicId: 'salah',
  i18n: qiblaI18n,
  coverArt: 'object.compass',
  hintArt: 'object.compass',
  component: FindQiblaGame,
  levels: [
    { level: 1, config: { mode: 'europe', cities: ['duesseldorf', 'sarajevo', 'vienna', 'london'], hint: true }, facts: [QIBLA_FACTS.kaaba] },
    {
      level: 2,
      config: { mode: 'world', cities: ['new-york', 'istanbul', 'cairo', 'jakarta', 'cape-town'], hint: true },
      facts: [QIBLA_FACTS.everywhere, QIBLA_FACTS.shortestPath],
    },
    {
      level: 3,
      config: { mode: 'free', cities: ['tokyo', 'new-york', 'cape-town', 'jakarta', 'duesseldorf'], hint: false, shuffle: true },
      facts: [QIBLA_FACTS.firstQibla],
    },
  ],
  teaches: { questionKeys: ['quest:salah-qibla-mc', 'quest:salah-first-qibla', 'learn:salah-wudu-3', 'learn:salah-wudu-4'] },
  order: 30,
};

export function registerFindQiblaGame(): void {
  registerGame(findQiblaGame);
}
