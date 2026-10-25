import { type GameDef, registerGame } from '@/core/games';

import { episodeArt } from '../../prophets-story/episode';
import { AyyubGardenGame } from './AyyubGardenGame';
import { DUA_EPISODE, TEST_EPISODE } from './content';
import { AYYUB_FACTS } from './facts';
import { ayyubGardenI18n } from './i18n';
import { type AyyubConfig, GARDEN } from './logic';

export const ayyubGardenGame: GameDef<AyyubConfig> = {
  id: 'ayyub-garden',
  topicId: 'prophets',
  i18n: ayyubGardenI18n,
  coverArt: 'prophet.ayyub-spring',
  hintArt: 'garden.watering-can',
  component: AyyubGardenGame,
  levels: [
    // Three events of Ayyub's life, each with its lesson: the long test, his dua, healed by the spring.
    { level: 1, config: { mode: 'episode', episode: TEST_EPISODE }, facts: [AYYUB_FACTS.tested, AYYUB_FACTS.patient, AYYUB_FACTS.lessonPatience] },
    { level: 2, config: { mode: 'episode', episode: DUA_EPISODE }, facts: [AYYUB_FACTS.call, AYYUB_FACTS.lessonAsk] },
    { level: 3, config: GARDEN, facts: [AYYUB_FACTS.answer, AYYUB_FACTS.spring, AYYUB_FACTS.lessonEase] },
  ],
  teaches: { questionKeys: ['stories:ayyub-test', 'stories:ayyub-dua', 'stories:ayyub-spring', 'stories:ayyub-lesson'] },
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
  ...episodeArt(TEST_EPISODE),
  ...episodeArt(DUA_EPISODE),
];

export function registerAyyubGardenGame(): void {
  registerGame(ayyubGardenGame);
}
