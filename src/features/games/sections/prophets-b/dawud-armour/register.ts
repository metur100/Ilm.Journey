import { type GameDef, registerGame } from '@/core/games';

import { type ArmourConfig, DAWUD_FACTS, LEVEL_1, LEVEL_2, LEVEL_3 } from './content';
import { DawudArmourGame } from './DawudArmourGame';
import { dawudArmourI18n } from './i18n';

export const dawudArmourGame: GameDef<ArmourConfig> = {
  id: 'dawud-armour',
  topicId: 'prophets',
  i18n: dawudArmourI18n,
  coverArt: 'prophet.dawud-armour',
  hintArt: 'prophet.dawud-ring',
  component: DawudArmourGame,
  levels: [
    { level: 1, config: LEVEL_1, facts: [DAWUD_FACTS.iron] },
    { level: 2, config: LEVEL_2, facts: [DAWUD_FACTS.links] },
    { level: 3, config: LEVEL_3, facts: [DAWUD_FACTS.protect, DAWUD_FACTS.mountains] },
  ],
  teaches: { questionKeys: ['stories:dawud-iron', 'stories:dawud-praise'] },
  order: 118,
};

export function registerDawudArmourGame(): void {
  registerGame(dawudArmourGame);
}
