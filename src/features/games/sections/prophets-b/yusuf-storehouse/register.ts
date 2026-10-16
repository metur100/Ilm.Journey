import { type ComponentType, createElement } from 'react';

import { type GameApi, type GameDef, registerGame } from '@/core/games';

import { YUSUF_FACTS } from './facts';
import { yusufI18n } from './i18n';
import { LEVEL_1, LEVEL_2, LEVEL_3, type StorehouseConfig } from './logic';

export const YUSUF_GAME_ID = 'yusuf-storehouse';

/**
 * The game component is required on first render, so registering the game (also in tests that call
 * `registerFeatures()`) does not pull UI modules (sound / expo-audio, gesture handler, Reanimated) into the import graph.
 */
const LazyYusufStorehouseGame: ComponentType<GameApi<StorehouseConfig>> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { YusufStorehouseGame } = require('./YusufStorehouseGame') as typeof import('./YusufStorehouseGame');
  return createElement(YusufStorehouseGame, props);
};

export const yusufGame: GameDef<StorehouseConfig> = {
  id: YUSUF_GAME_ID,
  topicId: 'prophets',
  i18n: yusufI18n,
  coverArt: 'prophet.yusuf-granary',
  hintArt: 'object.grain-sack',
  component: LazyYusufStorehouseGame,
  levels: [
    { level: 1, config: LEVEL_1, facts: [YUSUF_FACTS.dream, YUSUF_FACTS.plan] },
    { level: 2, config: LEVEL_2, facts: [YUSUF_FACTS.storehouses, YUSUF_FACTS.honest] },
    { level: 3, config: LEVEL_3, facts: [YUSUF_FACTS.ears, YUSUF_FACTS.hardYears, YUSUF_FACTS.relief] },
  ],
  teaches: { questionKeys: ['stories:yusuf-dream', 'stories:yusuf-cows'] },
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
];

export function registerYusufStorehouseGame(): void {
  registerGame(yusufGame);
}
