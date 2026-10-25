import { type GameDef, registerGame } from '@/core/games';

import { lazyGame } from '../shared';
import type { ArkConfig } from './ArkOfNuhGame';
import { episodeArt } from '../../prophets-story/episode';
import { ARK_PARTS, CALL_EPISODE, VOYAGE } from './content';
import { ARK_FACTS } from './facts';
import { arkI18n } from './i18n';

/** The id is kept from v2 (progress is stored by id). */
export const ARK_GAME_ID = 'ark-of-nuh';

export const arkGame: GameDef<ArkConfig> = {
  id: ARK_GAME_ID,
  topicId: 'prophets',
  i18n: arkI18n,
  coverArt: 'prophet.nuh-ark',
  hintArt: 'prophet.nuh-planks',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./ArkOfNuhGame') as typeof import('./ArkOfNuhGame')).ArkOfNuhGame),
  levels: [
    // Three events of Nuh's life, each with its lesson: the long call, building the ark, the flood and the rescue.
    { level: 1, config: { mode: 'episode', episode: CALL_EPISODE }, facts: [ARK_FACTS.years, ARK_FACTS.sabr] },
    { level: 2, config: { mode: 'build' }, facts: [ARK_FACTS.mocked, ARK_FACTS.planks, ARK_FACTS.obey] },
    { level: 3, config: { mode: 'voyage' }, facts: [ARK_FACTS.eachKind, ARK_FACTS.judi, ARK_FACTS.trust] },
  ],
  order: 3,
};

/** Every art name the game draws. */
export const ARK_ART: string[] = ['prophet.nuh-shipyard', 'prophet.nuh-judi', ...ARK_PARTS.map((p) => p.art!), ...VOYAGE.map((v) => v.art!), ...episodeArt(CALL_EPISODE)];

export function registerArkOfNuhGame(): void {
  registerGame(arkGame);
}
