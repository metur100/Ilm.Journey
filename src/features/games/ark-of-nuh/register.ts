import { type ComponentType, createElement } from 'react';

import { type GameApi, type GameDef, registerGame } from '@/core/games';

import { ARK_FACTS } from './facts';
import { arkI18n } from './i18n';
import { ANIMAL_KINDS, animalArt, type ArkConfig } from './logic';

export const ARK_GAME_ID = 'ark-of-nuh';

/**
 * The game component is required on first render, so registering the game (also in tests that call
 * `registerFeatures()`) does not pull UI modules (sound / expo-audio, gesture handler, Reanimated) into the import graph.
 */
const LazyArkOfNuhGame: ComponentType<GameApi<ArkConfig>> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ArkOfNuhGame } = require('./ArkOfNuhGame') as typeof import('./ArkOfNuhGame');
  return createElement(ArkOfNuhGame, props);
};

export const arkGame: GameDef<ArkConfig> = {
  id: ARK_GAME_ID,
  challengeCount: 18,
  topicId: 'prophets',
  i18n: arkI18n,
  coverArt: 'object.ark',
  hintArt: 'animal.camel',
  component: LazyArkOfNuhGame,
  levels: [
    { level: 1, config: { pairs: 4, sortPairs: 0 }, facts: [ARK_FACTS.eachKind, ARK_FACTS.command] },
    { level: 2, config: { pairs: 6, sortPairs: 0 }, facts: [ARK_FACTS.years, ARK_FACTS.mocked] },
    // 8 pairs: 4 found in the grid, then 4 led to the ark gate two by two (the "pair of each kind" twist).
    { level: 3, config: { pairs: 4, sortPairs: 4 }, facts: [ARK_FACTS.judi, ARK_FACTS.sabr] },
  ],
  order: 10,
};

/** Every art name the game draws (checked with `hasArt` in the tests). */
export const ARK_ART: string[] = ['object.ark', 'object.hourglass', 'place.mount-judi', 'pattern.star', ...ANIMAL_KINDS.map(animalArt)];

export function registerArkOfNuhGame(): void {
  registerGame(arkGame);
}
