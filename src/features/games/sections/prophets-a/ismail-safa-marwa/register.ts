import { type GameDef, registerGame } from '@/core/games';

import { episodeArt } from '../../prophets-story/episode';
import { lazyGame } from '../shared';
import { ISMAIL_FACTS, PROMISE_EPISODE, SACRIFICE_EPISODE } from './content';
import { ismailI18n } from './i18n';
import type { IsmailConfig } from './IsmailGame';

export const ISMAIL_GAME_ID = 'ismail-safa-marwa';

export const ismailGame: GameDef<IsmailConfig> = {
  id: ISMAIL_GAME_ID,
  topicId: 'prophets',
  i18n: ismailI18n,
  coverArt: 'prophet.ismail-zamzam',
  hintArt: 'prophet.ismail-hill',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./IsmailGame') as typeof import('./IsmailGame')).IsmailGame),
  levels: [
    // Three events of Ismail's life, each with its lesson: Safa, Marwa and Zamzam, the great sacrifice, true to his promise.
    { level: 1, config: { mode: 'runs' }, facts: [ISMAIL_FACTS.seven, ISMAIL_FACTS.zamzam, ISMAIL_FACTS.tawakkul] },
    { level: 2, config: { mode: 'episode', episode: SACRIFICE_EPISODE }, facts: [ISMAIL_FACTS.sacrifice, ISMAIL_FACTS.patience] },
    { level: 3, config: { mode: 'episode', episode: PROMISE_EPISODE }, facts: [ISMAIL_FACTS.promise, ISMAIL_FACTS.word] },
  ],
  order: 8,
};

export const ISMAIL_ART: string[] = ['prophet.ismail-safa-marwa', ...episodeArt(SACRIFICE_EPISODE), ...episodeArt(PROMISE_EPISODE)];

export function registerIsmailGame(): void {
  registerGame(ismailGame);
}
