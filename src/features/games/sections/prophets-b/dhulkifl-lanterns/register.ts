import { type GameDef, registerGame } from '@/core/games';

import { DHULKIFL_FACTS, LEVEL_1, LEVEL_2, LEVEL_3, type LampsConfig } from './content';
import { DhulkiflLampsGame } from './DhulkiflLampsGame';
import { dhulkiflLampsI18n } from './i18n';

export const dhulkiflLampsGame: GameDef<LampsConfig> = {
  id: 'dhulkifl-lanterns',
  topicId: 'prophets',
  i18n: dhulkiflLampsI18n,
  coverArt: 'prophet.dhulkifl-lamp',
  hintArt: 'prophet.dhulkifl-lamp-unlit',
  component: DhulkiflLampsGame,
  levels: [
    { level: 1, config: LEVEL_1, facts: [DHULKIFL_FACTS.patient] },
    { level: 2, config: LEVEL_2, facts: [DHULKIFL_FACTS.righteous, DHULKIFL_FACTS.withPatient] },
    { level: 3, config: LEVEL_3, facts: [DHULKIFL_FACTS.best] },
  ],
  teaches: { questionKeys: ['stories:dhulkifl-patient', 'stories:dhulkifl-mercy', 'stories:dhulkifl-best'] },
  order: 117,
};

export function registerDhulkiflLampsGame(): void {
  registerGame(dhulkiflLampsGame);
}
