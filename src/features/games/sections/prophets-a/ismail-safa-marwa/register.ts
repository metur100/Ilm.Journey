import { type GameDef, registerGame } from '@/core/games';

import { lazyGame } from '../shared';
import { ISMAIL_FACTS, SITE, SKINS } from './content';
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
    { level: 1, config: { mode: 'runs' }, facts: [ISMAIL_FACTS.seven, ISMAIL_FACTS.symbols] },
    { level: 2, config: { mode: 'pour' }, facts: [ISMAIL_FACTS.zamzam, ISMAIL_FACTS.trust] },
    { level: 3, config: { mode: 'site' }, facts: [ISMAIL_FACTS.basin, ISMAIL_FACTS.valley] },
  ],
  order: 8,
};

export const ISMAIL_ART: string[] = ['prophet.ismail-safa-marwa', 'prophet.ismail-zamzam-site', ...SKINS.map((s) => s.art!), ...SITE.map((s) => s.art!)];

export function registerIsmailGame(): void {
  registerGame(ismailGame);
}
