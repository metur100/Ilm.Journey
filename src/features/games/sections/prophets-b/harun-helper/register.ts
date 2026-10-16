import { type GameDef, registerGame } from '@/core/games';

import { HARUN_FACTS, type HarunConfig, LEVEL_1, LEVEL_2, LEVEL_3 } from './content';
import { HarunHelperGame } from './HarunHelperGame';
import { harunHelperI18n } from './i18n';

export const harunHelperGame: GameDef<HarunConfig> = {
  id: 'harun-helper',
  topicId: 'prophets',
  i18n: harunHelperI18n,
  coverArt: 'prophet.harun-lanterns',
  hintArt: 'prophet.harun-bloom',
  component: HarunHelperGame,
  levels: [
    { level: 1, config: LEVEL_1, facts: [HARUN_FACTS.dua] },
    { level: 2, config: LEVEL_2, facts: [HARUN_FACTS.helper, HARUN_FACTS.eloquent] },
    { level: 3, config: LEVEL_3, facts: [HARUN_FACTS.remember] },
  ],
  teaches: { questionKeys: ['stories:harun-dua', 'stories:harun-memory', 'stories:harun-eloquent'] },
  order: 116,
};

export function registerHarunHelperGame(): void {
  registerGame(harunHelperGame);
}
