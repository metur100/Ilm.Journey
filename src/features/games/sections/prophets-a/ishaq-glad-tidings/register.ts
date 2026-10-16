import { type GameDef, registerGame } from '@/core/games';

import { lazyGame } from '../shared';
import { GUEST_STORY, ISHAQ_FACTS, WELCOME } from './content';
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
    { level: 1, config: { mode: 'welcome' }, facts: [ISHAQ_FACTS.guests] },
    { level: 2, config: { mode: 'story' }, facts: [ISHAQ_FACTS.tidings, ISHAQ_FACTS.mercy] },
    { level: 3, config: { mode: 'family' }, facts: [ISHAQ_FACTS.family, ISHAQ_FACTS.prophet] },
  ],
  order: 9,
};

export const ISHAQ_ART: string[] = ['prophet.ishaq-tent-site', ...WELCOME.map((w) => w.art!), ...GUEST_STORY.flatMap((g) => (g.art ? [g.art] : []))];

export function registerIshaqGame(): void {
  registerGame(ishaqGame);
}
