import { type GameDef, registerGame } from '@/core/games';

import { AyyubGardenGame } from './AyyubGardenGame';
import { AYYUB_FACTS } from './facts';
import { ayyubGardenI18n } from './i18n';
import { type GardenConfig, LEVEL_1, LEVEL_2, LEVEL_3 } from './logic';

export const ayyubGardenGame: GameDef<GardenConfig> = {
  id: 'ayyub-garden',
  topicId: 'prophets',
  i18n: ayyubGardenI18n,
  coverArt: 'prophet.ayyub-spring',
  hintArt: 'garden.watering-can',
  component: AyyubGardenGame,
  levels: [
    { level: 1, config: LEVEL_1, facts: [AYYUB_FACTS.call] },
    { level: 2, config: LEVEL_2, facts: [AYYUB_FACTS.answer] },
    { level: 3, config: LEVEL_3, facts: [AYYUB_FACTS.patient, AYYUB_FACTS.spring] },
  ],
  teaches: { questionKeys: ['stories:ayyub-dua', 'stories:ayyub-spring', 'stories:ayyub-lesson'] },
  order: 113,
};

export const AYYUB_GARDEN_ART = [
  'prophet.ayyub-soil',
  'prophet.ayyub-soil-seed',
  'prophet.ayyub-plant-dry',
  'prophet.ayyub-plant-sprout',
  'prophet.ayyub-plant-bloom',
  'prophet.ayyub-spring',
  'garden.seed',
  'garden.watering-can',
  'story.lamp',
];

export function registerAyyubGardenGame(): void {
  registerGame(ayyubGardenGame);
}
