import { type GameDef, registerGame } from '@/core/games';

import { episodeArt } from '../../prophets-story/episode';
import { lazyGame } from '../shared';
import type { AdamNamesConfig } from './AdamNamesGame';
import { ADAM_FACTS, IBLIS_EPISODE, THINGS, TREE_EPISODE } from './content';
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
    // Three events of Adam's life, each with its lesson: the names, Iblis refuses, the tree and the repentance.
    { level: 1, config: { mode: 'names' }, facts: [ADAM_FACTS.names, ADAM_FACTS.angels, ADAM_FACTS.knowledge] },
    { level: 2, config: { mode: 'episode', episode: IBLIS_EPISODE }, facts: [ADAM_FACTS.iblis, ADAM_FACTS.humility] },
    { level: 3, config: { mode: 'episode', episode: TREE_EPISODE }, facts: [ADAM_FACTS.repent, ADAM_FACTS.tawbah] },
  ],
  order: 1,
};

/** Every art name the game draws. */
export const ADAM_NAMES_ART: string[] = ['prophet.adam-names', 'prophet.adam-tree', ...THINGS.map((t) => t.art), ...episodeArt(IBLIS_EPISODE), ...episodeArt(TREE_EPISODE)];

export function registerAdamNamesGame(): void {
  registerGame(adamNamesGame);
}
