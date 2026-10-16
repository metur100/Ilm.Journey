import { type GameDef, registerGame } from '@/core/games';

import { MUSA_FACTS } from './facts';
import { musaSpringsI18n } from './i18n';
import { LEVEL_1, LEVEL_2, LEVEL_3, type SpringsConfig } from './logic';
import { MusaSpringsGame } from './MusaSpringsGame';

export const musaSpringsGame: GameDef<SpringsConfig> = {
  id: 'musa-springs',
  topicId: 'prophets',
  i18n: musaSpringsI18n,
  coverArt: 'prophet.musa-springs',
  hintArt: 'prophet.musa-spring-1',
  component: MusaSpringsGame,
  levels: [
    { level: 1, config: LEVEL_1, facts: [MUSA_FACTS.springs] },
    { level: 2, config: LEVEL_2, facts: [MUSA_FACTS.provision] },
    { level: 3, config: LEVEL_3, facts: [MUSA_FACTS.withMe] },
  ],
  teaches: { questionKeys: ['stories:musa-sea', 'stories:musa-memory'] },
  order: 115,
};

export function registerMusaSpringsGame(): void {
  registerGame(musaSpringsGame);
}
