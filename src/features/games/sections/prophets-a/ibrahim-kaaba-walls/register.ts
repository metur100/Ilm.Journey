import { type GameDef, registerGame } from '@/core/games';

import { lazyGame } from '../shared';
import { IBRAHIM_FACTS, SKY, WALLS } from './content';
import type { IbrahimConfig } from './IbrahimGame';
import { ibrahimI18n } from './i18n';

export const IBRAHIM_GAME_ID = 'ibrahim-kaaba-walls';

export const ibrahimGame: GameDef<IbrahimConfig> = {
  id: IBRAHIM_GAME_ID,
  topicId: 'prophets',
  i18n: ibrahimI18n,
  coverArt: 'prophet.ibrahim-kaaba-rising',
  hintArt: 'prophet.ibrahim-stone',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./IbrahimGame') as typeof import('./IbrahimGame')).IbrahimGame),
  levels: [
    { level: 1, config: { mode: 'sky' }, facts: [IBRAHIM_FACTS.sky, IBRAHIM_FACTS.fire] },
    { level: 2, config: { mode: 'walls' }, facts: [IBRAHIM_FACTS.walls, IBRAHIM_FACTS.stone] },
    { level: 3, config: { mode: 'dua' }, facts: [IBRAHIM_FACTS.dua, IBRAHIM_FACTS.messenger] },
  ],
  order: 6,
};

export const IBRAHIM_ART: string[] = ['prophet.ibrahim-building-site', 'place.kaaba', ...SKY.map((s) => s.art!), ...WALLS.map((w) => w.art!)];

export function registerIbrahimGame(): void {
  registerGame(ibrahimGame);
}
