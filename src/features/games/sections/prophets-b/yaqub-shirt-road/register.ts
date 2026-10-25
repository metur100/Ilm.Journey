import { type GameDef, registerGame } from '@/core/games';

import { episodeArt } from '../../prophets-story/episode';
import { GRIEF_EPISODE, TAKEN_EPISODE } from './content';
import { YAQUB_FACTS } from './facts';
import { yaqubRoadI18n } from './i18n';
import { ROAD, type YaqubConfig } from './logic';
import { YaqubRoadGame } from './YaqubRoadGame';

export const yaqubRoadGame: GameDef<YaqubConfig> = {
  id: 'yaqub-shirt-road',
  topicId: 'prophets',
  i18n: yaqubRoadI18n,
  coverArt: 'prophet.yaqub-shirt',
  hintArt: 'animal.camel',
  component: YaqubRoadGame,
  levels: [
    // Three events of Yaqub's life, each with its lesson: Yusuf taken, the years of grief, the shirt from Egypt.
    { level: 1, config: { mode: 'episode', episode: TAKEN_EPISODE }, facts: [YAQUB_FACTS.patience, YAQUB_FACTS.lessonPatience] },
    { level: 2, config: { mode: 'episode', episode: GRIEF_EPISODE }, facts: [YAQUB_FACTS.complain, YAQUB_FACTS.hope, YAQUB_FACTS.lessonHope] },
    { level: 3, config: ROAD, facts: [YAQUB_FACTS.shirt, YAQUB_FACTS.scent, YAQUB_FACTS.lessonJoy] },
  ],
  teaches: { questionKeys: ['stories:yaqub-next', 'stories:yaqub-patience', 'stories:yaqub-decision', 'stories:yaqub-lesson'] },
  order: 110,
};

/** Art the game draws (checked with `hasArt` in the tests). */
export const YAQUB_ROAD_ART = [
  'prophet.yaqub-shirt',
  'prophet.yaqub-home',
  'prophet.yusuf-granary',
  'animal.camel',
  'garden.rock',
  'object.well',
  'story.lamp',
  ...episodeArt(TAKEN_EPISODE),
  ...episodeArt(GRIEF_EPISODE),
];

export function registerYaqubRoadGame(): void {
  registerGame(yaqubRoadGame);
}
