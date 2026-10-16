import { type GameDef, registerGame } from '@/core/games';

import { lazyGame } from '../shared';
import type { AdamNamesConfig } from './AdamNamesGame';
import { ADAM_FACTS, LEVEL_THINGS, THINGS } from './content';
import { adamNamesI18n } from './i18n';

export const ADAM_NAMES_ID = 'adam-garden-names';

export const adamNamesGame: GameDef<AdamNamesConfig> = {
  id: ADAM_NAMES_ID,
  topicId: 'prophets',
  i18n: adamNamesI18n,
  coverArt: 'prophet.adam-names',
  hintArt: 'prophet.adam-tree',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./AdamNamesGame') as typeof import('./AdamNamesGame')).AdamNamesGame),
  levels: [
    { level: 1, config: { mode: 'connect', things: LEVEL_THINGS[1], hints: true }, facts: [ADAM_FACTS.names] },
    { level: 2, config: { mode: 'memory', things: LEVEL_THINGS[2], hints: false }, facts: [ADAM_FACTS.angels, ADAM_FACTS.told] },
    { level: 3, config: { mode: 'arabic', things: LEVEL_THINGS[3], hints: false }, facts: [ADAM_FACTS.arabicWords, ADAM_FACTS.honour] },
  ],
  order: 1,
};

/** Every art name the game draws. */
export const ADAM_NAMES_ART: string[] = ['prophet.adam-names', 'prophet.adam-tree', ...Object.values(THINGS).map((t) => t.art)];

export function registerAdamNamesGame(): void {
  registerGame(adamNamesGame);
}
