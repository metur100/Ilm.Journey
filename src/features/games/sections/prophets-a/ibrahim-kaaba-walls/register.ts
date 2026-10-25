import { type GameDef, registerGame } from '@/core/games';

import { episodeArt } from '../../prophets-story/episode';
import { lazyGame } from '../shared';
import { FIRE_EPISODE, IBRAHIM_FACTS, SKY, WALLS } from './content';
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
    // Three events of Ibrahim's life, each with its lesson: the sky, the statues and the fire, the Kaaba.
    { level: 1, config: { mode: 'sky' }, facts: [IBRAHIM_FACTS.sky, IBRAHIM_FACTS.tawhid] },
    { level: 2, config: { mode: 'episode', episode: FIRE_EPISODE }, facts: [IBRAHIM_FACTS.idols, IBRAHIM_FACTS.fire, IBRAHIM_FACTS.courage] },
    { level: 3, config: { mode: 'walls' }, facts: [IBRAHIM_FACTS.walls, IBRAHIM_FACTS.dua, IBRAHIM_FACTS.together] },
  ],
  order: 6,
};

export const IBRAHIM_ART: string[] = ['prophet.ibrahim-building-site', 'place.kaaba', ...SKY.map((s) => s.art!), ...WALLS.map((w) => w.art!), ...episodeArt(FIRE_EPISODE)];

export function registerIbrahimGame(): void {
  registerGame(ibrahimGame);
}
