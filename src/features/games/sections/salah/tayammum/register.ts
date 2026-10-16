import { registerGame, type GameDef } from '@/core/games';

import { TAYAMMUM_FACTS } from './content';
import { tayammumI18n } from './i18n';
import { TayammumGame, type TayammumConfig } from './TayammumGame';

/** Tejemmum (tayammum): find clean earth in a yard, strike and wipe in order, when it is allowed. */
export const tayammumGame: GameDef<TayammumConfig> = {
  id: 'tayammum',
  topicId: 'salah',
  i18n: tayammumI18n,
  coverArt: 'salah.basics-earth-yard',
  hintArt: 'salah.basics-palms-sand',
  component: TayammumGame,
  levels: [
    { level: 1, config: { mode: 'find' }, facts: [TAYAMMUM_FACTS.quran, TAYAMMUM_FACTS.earth] },
    { level: 2, config: { mode: 'wipe' }, facts: [TAYAMMUM_FACTS.steps, TAYAMMUM_FACTS.schools] },
    { level: 3, config: { mode: 'when' }, facts: [TAYAMMUM_FACTS.when, TAYAMMUM_FACTS.ease] },
  ],
  order: 16,
};

export function registerTayammumGame(): void {
  registerGame(tayammumGame);
}
