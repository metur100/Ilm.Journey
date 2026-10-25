import { type GameDef, registerGame } from '@/core/games';

import { episodeArt } from '../../prophets-story/episode';
import { lazyGame } from '../shared';
import { CALL_EPISODE, JARS, RESCUE_EPISODE, SALIH_FACTS } from './content';
import { salihI18n } from './i18n';
import type { SalihConfig } from './SalihGame';

export const SALIH_GAME_ID = 'salih-water-days';

export const salihGame: GameDef<SalihConfig> = {
  id: SALIH_GAME_ID,
  topicId: 'prophets',
  i18n: salihI18n,
  coverArt: 'prophet.salih-camel',
  hintArt: 'prophet.salih-jar',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./SalihGame') as typeof import('./SalihGame')).SalihGame),
  levels: [
    // Three events of Salih's story, each with its lesson: the homes and the call, the she-camel and the water, the rescue.
    { level: 1, config: { mode: 'episode', episode: CALL_EPISODE }, facts: [SALIH_FACTS.homes, SALIH_FACTS.favours] },
    { level: 2, config: { mode: 'pour' }, facts: [SALIH_FACTS.sign, SALIH_FACTS.turns, SALIH_FACTS.fair] },
    { level: 3, config: { mode: 'episode', episode: RESCUE_EPISODE }, facts: [SALIH_FACTS.harmed, SALIH_FACTS.saved, SALIH_FACTS.animals] },
  ],
  order: 5,
};

export const SALIH_ART: string[] = ['prophet.salih-well', ...JARS.map((j) => j.art!), ...episodeArt(CALL_EPISODE), ...episodeArt(RESCUE_EPISODE)];

export function registerSalihGame(): void {
  registerGame(salihGame);
}
