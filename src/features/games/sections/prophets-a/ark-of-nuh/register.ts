import { type GameDef, registerGame } from '@/core/games';

import { lazyGame } from '../shared';
import type { ArkConfig } from './ArkOfNuhGame';
import { ANIMAL_ART, ARK_PARTS, VOYAGE } from './content';
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
    { level: 1, config: { mode: 'build' }, facts: [ARK_FACTS.command, ARK_FACTS.planks, ARK_FACTS.mocked] },
    { level: 2, config: { mode: 'pairs' }, facts: [ARK_FACTS.eachKind, ARK_FACTS.bismillah] },
    { level: 3, config: { mode: 'voyage' }, facts: [ARK_FACTS.judi, ARK_FACTS.years, ARK_FACTS.sabr] },
  ],
  order: 3,
};

/** Every art name the game draws. */
export const ARK_ART: string[] = ['prophet.nuh-shipyard', 'prophet.nuh-judi', ...ARK_PARTS.map((p) => p.art!), ...ANIMAL_ART, ...VOYAGE.map((v) => v.art!)];

export function registerArkOfNuhGame(): void {
  registerGame(arkGame);
}
