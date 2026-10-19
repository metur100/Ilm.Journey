import { type GameDef, registerGame } from '@/core/games';

import { quoteFact } from '../shared/facts';
import { lazyComponent } from '../shared/game';
import { surahPuzzleI18n } from './i18n';

/*
 * Surah Puzzle (now a full-surah ayah sequence). Every level is one complete surah of Juz ʿAmma, with every ayah:
 * L1 Al-Ikhlas – put the meanings of its four ayahs in order; L2 Al-Falaq – the five ayahs in Arabic, with the
 * meanings; L3 An-Nas – six ayahs from memory. No ayah is left out.
 */

export interface SurahPuzzleConfig {
  surah: number;
  mode: 'meaning' | 'arabic';
  hints: boolean;
}

const FACTS = {
  ikhlas: quoteFact({ id: 'ikhlas-full', surah: 112, from: 1, to: 4, art: 'quran.one-star' }),
  falaq: quoteFact({ id: 'falaq-full', surah: 113, from: 1, to: 5, art: 'quran.puzzle-duha' }),
  nas: quoteFact({ id: 'nas-full', surah: 114, from: 1, to: 6, art: 'object.lantern' }),
};

export const surahPuzzleGame: GameDef<SurahPuzzleConfig> = {
  id: 'surah-puzzle',
  topicId: 'quran',
  i18n: surahPuzzleI18n,
  coverArt: 'quran.puzzle-tin',
  hintArt: 'kit.tiles',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyComponent(() => (require('./SurahPuzzleGame') as typeof import('./SurahPuzzleGame')).SurahPuzzleGame),
  levels: [
    { level: 1, config: { surah: 112, mode: 'meaning', hints: true }, facts: [FACTS.ikhlas] },
    { level: 2, config: { surah: 113, mode: 'arabic', hints: true }, facts: [FACTS.falaq] },
    { level: 3, config: { surah: 114, mode: 'arabic', hints: false }, facts: [FACTS.nas] },
  ],
  order: 50,
};

export function registerSurahPuzzleGame(): void {
  registerGame(surahPuzzleGame);
}
