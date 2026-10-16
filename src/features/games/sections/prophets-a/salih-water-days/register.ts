import { type GameDef, registerGame } from '@/core/games';

import { lazyGame } from '../shared';
import { DAY_BINS, DAYS, SALIH_FACTS } from './content';
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
    { level: 1, config: { mode: 'pour' }, facts: [SALIH_FACTS.turns, SALIH_FACTS.shared] },
    { level: 2, config: { mode: 'days' }, facts: [SALIH_FACTS.alternate, SALIH_FACTS.sign] },
    { level: 3, config: { mode: 'pourStrict' }, facts: [SALIH_FACTS.saved] },
  ],
  order: 5,
};

export const SALIH_ART: string[] = ['prophet.salih-jar', 'prophet.salih-well', ...DAY_BINS.map((b) => b.art!), ...DAYS.map((d) => d.art!)];

export function registerSalihGame(): void {
  registerGame(salihGame);
}
