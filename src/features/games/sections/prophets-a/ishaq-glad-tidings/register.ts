import { type GameDef, registerGame } from '@/core/games';

import { episodeArt } from '../../prophets-story/episode';
import { lazyGame } from '../shared';
import { FAMILY_EPISODE, ISHAQ_FACTS, TIDINGS_EPISODE, WELCOME } from './content';
import { ishaqI18n } from './i18n';
import type { IshaqConfig } from './IshaqGame';

export const ISHAQ_GAME_ID = 'ishaq-glad-tidings';

export const ishaqGame: GameDef<IshaqConfig> = {
  id: ISHAQ_GAME_ID,
  topicId: 'prophets',
  i18n: ishaqI18n,
  coverArt: 'prophet.ishaq-tent',
  hintArt: 'prophet.ishaq-platter',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./IshaqGame') as typeof import('./IshaqGame')).IshaqGame),
  levels: [
    // Three events of Ishaq's story, each with its lesson: the honoured guests, the glad tidings, the family of prophets.
    { level: 1, config: { mode: 'welcome' }, facts: [ISHAQ_FACTS.guests, ISHAQ_FACTS.welcome] },
    { level: 2, config: { mode: 'episode', episode: TIDINGS_EPISODE }, facts: [ISHAQ_FACTS.tidings, ISHAQ_FACTS.hope] },
    { level: 3, config: { mode: 'episode', episode: FAMILY_EPISODE }, facts: [ISHAQ_FACTS.prophet, ISHAQ_FACTS.family, ISHAQ_FACTS.legacy] },
  ],
  order: 9,
};

export const ISHAQ_ART: string[] = ['prophet.ishaq-tent-site', ...WELCOME.map((w) => w.art!), ...episodeArt(TIDINGS_EPISODE), ...episodeArt(FAMILY_EPISODE)];

export function registerIshaqGame(): void {
  registerGame(ishaqGame);
}
