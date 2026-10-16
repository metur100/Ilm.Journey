import { type GameDef, registerGame } from '@/core/games';

import { YAQUB_FACTS } from './facts';
import { yaqubRoadI18n } from './i18n';
import { LEVEL_1, LEVEL_2, LEVEL_3, type RoadConfig } from './logic';
import { YaqubRoadGame } from './YaqubRoadGame';

export const yaqubRoadGame: GameDef<RoadConfig> = {
  id: 'yaqub-shirt-road',
  topicId: 'prophets',
  i18n: yaqubRoadI18n,
  coverArt: 'prophet.yaqub-shirt',
  hintArt: 'animal.camel',
  component: YaqubRoadGame,
  levels: [
    { level: 1, config: LEVEL_1, facts: [YAQUB_FACTS.shirt] },
    { level: 2, config: LEVEL_2, facts: [YAQUB_FACTS.patience, YAQUB_FACTS.scent] },
    { level: 3, config: LEVEL_3, facts: [YAQUB_FACTS.hope, YAQUB_FACTS.complain] },
  ],
  teaches: { questionKeys: ['stories:yaqub-next', 'stories:yaqub-patience', 'stories:yaqub-decision'] },
  order: 110,
};

/** Art the game draws (checked with `hasArt` in the tests). */
export const YAQUB_ROAD_ART = ['prophet.yaqub-shirt', 'prophet.yaqub-home', 'prophet.yusuf-granary', 'animal.camel', 'garden.rock', 'object.well', 'story.lamp'];

export function registerYaqubRoadGame(): void {
  registerGame(yaqubRoadGame);
}
