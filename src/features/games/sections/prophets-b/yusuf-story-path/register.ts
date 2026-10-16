import { type GameDef, registerGame } from '@/core/games';

import { PATH_FACTS, PATH_LEVELS, type YusufPathConfig } from './content';
import { yusufStoryI18n } from './i18n';
import { YusufStoryPathGame } from './YusufStoryPathGame';

export const yusufStoryPathGame: GameDef<YusufPathConfig> = {
  id: 'yusuf-story-path',
  topicId: 'prophets',
  i18n: yusufStoryI18n,
  coverArt: 'prophet.yusuf-dream',
  hintArt: 'prophet.yusuf-well',
  component: YusufStoryPathGame,
  levels: [
    { level: 1, config: PATH_LEVELS[0], facts: [PATH_FACTS.dream] },
    { level: 2, config: PATH_LEVELS[1], facts: [PATH_FACTS.honest] },
    { level: 3, config: PATH_LEVELS[2], facts: [PATH_FACTS.forgive, PATH_FACTS.plan] },
  ],
  teaches: { questionKeys: ['stories:yusuf-next', 'stories:yusuf-map', 'stories:yusuf-stars', 'stories:yusuf-revenge'] },
  order: 112,
};

export function registerYusufStoryPathGame(): void {
  registerGame(yusufStoryPathGame);
}
