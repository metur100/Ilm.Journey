import { type ComponentType, createElement } from 'react';

import { type GameApi, type GameDef, registerGame } from '@/core/games';

import { episodeArt } from '../../prophets-story/episode';
import { DREAM_EPISODE, GUARDIAN_EPISODE } from './content';
import { YUSUF_FACTS } from './facts';
import { yusufI18n } from './i18n';
import { STOREHOUSE, type YusufStoreConfig } from './logic';

export const YUSUF_GAME_ID = 'yusuf-storehouse';

/**
 * The game component is required on first render, so registering the game (also in tests that call
 * `registerFeatures()`) does not pull UI modules (sound / expo-audio, gesture handler, Reanimated) into the import graph.
 */
const LazyYusufStorehouseGame: ComponentType<GameApi<YusufStoreConfig>> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { YusufStorehouseGame } = require('./YusufStorehouseGame') as typeof import('./YusufStorehouseGame');
  return createElement(YusufStorehouseGame, props);
};

export const yusufGame: GameDef<YusufStoreConfig> = {
  id: YUSUF_GAME_ID,
  topicId: 'prophets',
  i18n: yusufI18n,
  coverArt: 'prophet.yusuf-granary',
  hintArt: 'object.grain-sack',
  component: LazyYusufStorehouseGame,
  levels: [
    // Three events of Yusuf in Egypt, each with its lesson: the king's dream, storing in the ears, the trusted guardian.
    { level: 1, config: { mode: 'episode', episode: DREAM_EPISODE }, facts: [YUSUF_FACTS.dream, YUSUF_FACTS.lessonHelp] },
    { level: 2, config: STOREHOUSE, facts: [YUSUF_FACTS.plan, YUSUF_FACTS.ears, YUSUF_FACTS.lessonPlan] },
    { level: 3, config: { mode: 'episode', episode: GUARDIAN_EPISODE }, facts: [YUSUF_FACTS.storehouses, YUSUF_FACTS.relief, YUSUF_FACTS.lessonTrust] },
  ],
  teaches: { questionKeys: ['stories:yusuf-dream', 'stories:yusuf-cows', 'stories:yusuf-lesson'] },
  order: 111,
};

/** Every art name the game draws (checked with `hasArt` in the tests). */
export const YUSUF_ART: string[] = [
  'object.grain-sack',
  'object.storehouse',
  'prophet.yusuf-granary',
  'prophet.yusuf-sheaf-green',
  'object.basket',
  'object.scales',
  'place.house',
  'garden.olive',
  'garden.palm',
  'sky.morning',
  'sky.afternoon',
  ...episodeArt(DREAM_EPISODE),
  ...episodeArt(GUARDIAN_EPISODE),
];

export function registerYusufStorehouseGame(): void {
  registerGame(yusufGame);
}
