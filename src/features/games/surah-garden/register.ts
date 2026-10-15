import { type ComponentType, createElement } from 'react';

import { type GameApi, type GameDef, registerGame } from '@/core/games';

import { GARDEN_FACTS } from './facts';
import { surahGardenI18n } from './i18n';
import { FLOWERS, type SurahGardenConfig } from './logic';

export const SURAH_GARDEN_ID = 'surah-garden';

/**
 * The component is required on first render, so registering the game (also in tests that call `registerFeatures()`)
 * keeps UI modules (sound / expo-audio, gesture handler, Reanimated) out of the import graph.
 */
const LazySurahGardenGame: ComponentType<GameApi<SurahGardenConfig>> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { SurahGardenGame } = require('./SurahGardenGame') as typeof import('./SurahGardenGame');
  return createElement(SurahGardenGame, props);
};

/** Art names used by the game (tested with `hasArt`). */
export const SURAH_GARDEN_ART = [...FLOWERS, 'scene.garden-lawn', 'ui.seed', 'ui.sparkle', 'garden.butterfly', 'object.quran-stand', 'object.book'] as const;

export const surahGardenGame: GameDef<SurahGardenConfig> = {
  id: SURAH_GARDEN_ID,
  challengeCount: 18,
  topicId: 'quran',
  i18n: surahGardenI18n,
  coverArt: 'garden.flower-rose',
  hintArt: 'garden.flower-tulip',
  component: LazySurahGardenGame,
  levels: [
    {
      level: 1,
      config: {
        mode: 'meaning',
        anchors: [1, 112, 114],
        pairs: 6,
        factSurahs: { [GARDEN_FACTS.fatihaOpening.id]: 1, [GARDEN_FACTS.ikhlasMeaning.id]: 112 },
      },
      facts: [GARDEN_FACTS.fatihaOpening, GARDEN_FACTS.ikhlasMeaning],
    },
    {
      level: 2,
      config: {
        mode: 'ayahCount',
        anchors: [108, 112, 1],
        pairs: 6,
        factSurahs: { [GARDEN_FACTS.kawtharCount.id]: 108, [GARDEN_FACTS.fatihaCount.id]: 1 },
      },
      facts: [GARDEN_FACTS.kawtharCount, GARDEN_FACTS.fatihaCount],
    },
    {
      level: 3,
      config: {
        mode: 'opening',
        anchors: [1, 112, 113],
        pairs: 6,
        maxOrder: 20,
        factSurahs: { [GARDEN_FACTS.ikhlasOpening.id]: 112, [GARDEN_FACTS.fatihaOpeningWords.id]: 1 },
      },
      facts: [GARDEN_FACTS.ikhlasOpening, GARDEN_FACTS.fatihaOpeningWords],
    },
  ],
  teaches: { questionKeys: ['learn:quran-structure-3', 'learn:quran-structure-4'] },
  order: 20,
};

export function registerSurahGardenGame(): void {
  registerGame(surahGardenGame);
}
