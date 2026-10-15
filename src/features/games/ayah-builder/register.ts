import { type ComponentType, createElement } from 'react';

import { type GameApi, type GameDef, registerGame } from '@/core/games';

import { AYAH_FACTS } from './facts';
import { ayahBuilderI18n } from './i18n';
import type { AyahBuilderConfig } from './logic';

export const AYAH_BUILDER_ID = 'ayah-builder';

/**
 * The component is required on first render, so registering the game (also in tests that call `registerFeatures()`)
 * keeps UI modules (sound / expo-audio, gesture handler, Reanimated) out of the import graph.
 */
const LazyAyahBuilderGame: ComponentType<GameApi<AyahBuilderConfig>> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { AyahBuilderGame } = require('./AyahBuilderGame') as typeof import('./AyahBuilderGame');
  return createElement(AyahBuilderGame, props);
};

/** Surahs per level (memorisation order decides which comes first; surahs the learner is memorising lead). */
export const AYAH_POOLS = {
  /** Short: Al-Ikhlas, Al-Kawthar, An-Nas, Al-Falaq, Al-Asr – the whole surah is built. */
  short: [112, 108, 114, 113, 103],
  /** Medium: Al-Fatiha, Al-Fil, Quraysh, Al-Maʿun, An-Nasr, Al-Masad, Al-Kafirun – four ayahs per play. */
  medium: [1, 105, 106, 107, 110, 111, 109],
  /** Longer ayahs from the rest of Juz ʿAmma (78–102, 104), 5–11 words each. */
  long: [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 104],
} as const;

/** Art names used by the game (tested with `hasArt`). */
export const AYAH_BUILDER_ART = ['object.quran-stand', 'object.book', 'ui.sparkle', 'garden.moon', 'object.prayer-mat', 'place.madinah-city', 'place.cave-hira'] as const;

export const ayahBuilderGame: GameDef<AyahBuilderConfig> = {
  id: AYAH_BUILDER_ID,
  challengeCount: 13,
  topicId: 'quran',
  i18n: ayahBuilderI18n,
  coverArt: 'object.quran-stand',
  hintArt: 'object.book',
  component: LazyAyahBuilderGame,
  levels: [
    { level: 1, config: { pool: AYAH_POOLS.short, maxAyahs: 6 }, facts: [AYAH_FACTS.falaqNas, AYAH_FACTS.ikhlas] },
    { level: 2, config: { pool: AYAH_POOLS.medium, maxAyahs: 4 }, facts: [AYAH_FACTS.fatiha, AYAH_FACTS.nasr] },
    { level: 3, config: { pool: AYAH_POOLS.long, maxAyahs: 3, minTiles: 5, maxTiles: 11 }, facts: [AYAH_FACTS.iqra, AYAH_FACTS.juzAmma] },
  ],
  teaches: { questionKeys: ['learn:quran-etiquette-4', 'learn:quran-structure-3'] },
  order: 10,
};

export function registerAyahBuilderGame(): void {
  registerGame(ayahBuilderGame);
}
