import { registerGame, type GameDef } from '@/core/games';

import { ConditionsGame, type ConditionsConfig } from './ConditionsGame';
import { CONDITION_FACTS } from './content';
import { conditionsI18n } from './i18n';

/** Ready for Salah (šarti namaza): find the six conditions in a room, sort the 12 farz, find all six among distractions. */
export const conditionsGame: GameDef<ConditionsConfig> = {
  id: 'salah-conditions',
  topicId: 'salah',
  i18n: conditionsI18n,
  coverArt: 'salah.basics-prayer-room',
  hintArt: 'salah.basics-mat',
  component: ConditionsGame,
  levels: [
    { level: 1, config: { mode: 'find' }, facts: [CONDITION_FACTS.six, CONDITION_FACTS.intention] },
    { level: 2, config: { mode: 'sort' }, facts: [CONDITION_FACTS.twelve] },
    { level: 3, config: { mode: 'all' }, facts: [CONDITION_FACTS.awrah, CONDITION_FACTS.clean] },
  ],
  order: 40,
};

export function registerConditionsGame(): void {
  registerGame(conditionsGame);
}
