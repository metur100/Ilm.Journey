import { type GameDef, registerGame } from '@/core/games';
import type { LocalizedText } from '@/core/models';

import { quoteFact } from '../shared/facts';
import { lazyComponent } from '../shared/game';
import { ayahMeaning, ayahRef, surahName } from '../shared/quran';
import { surahPuzzleI18n } from './i18n';

/*
 * Surah Puzzle (JigsawReveal). The Arabic ayah (data) stands above the frame; the learner rebuilds the picture the
 * ayah describes, and the finished picture reveals the ayah's translation. L1: 2 × 2 pieces (Ad-Duha 93:1–2);
 * L2: 3 × 3 pieces (At-Tin 95:1–3); L3 twist: 3 × 3 swap mode – the frame is full and mixed up (Al-Fil 105:3).
 */

export interface SurahPuzzleConfig {
  art: string;
  surah: number;
  ayah: number;
  rows: number;
  cols: number;
  mode: 'place' | 'swap';
  hints: boolean;
  reveal: { title: LocalizedText; caption: LocalizedText };
}

const reveal = (s: number, a: number) => {
  const title = `${surahName(s)} ${ayahRef(s, a)}`;
  return { title: { en: title, de: title, bs: title }, caption: ayahMeaning(s, a) };
};

const FACTS = {
  duha: quoteFact({ id: 'duha-morning', surah: 93, from: 1, to: 3, art: 'quran.puzzle-duha' }),
  tin: quoteFact({ id: 'tin-fig-olive', surah: 95, from: 1, to: 3, art: 'quran.puzzle-tin' }),
  fil: quoteFact({ id: 'fil-birds', surah: 105, from: 1, to: 3, art: 'quran.puzzle-fil' }),
};

export const surahPuzzleGame: GameDef<SurahPuzzleConfig> = {
  id: 'surah-puzzle',
  topicId: 'quran',
  i18n: surahPuzzleI18n,
  coverArt: 'quran.puzzle-tin',
  hintArt: 'kit.puzzle',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyComponent(() => (require('./SurahPuzzleGame') as typeof import('./SurahPuzzleGame')).SurahPuzzleGame),
  levels: [
    { level: 1, config: { art: 'quran.puzzle-duha', surah: 93, ayah: 1, rows: 2, cols: 2, mode: 'place', hints: true, reveal: reveal(93, 1) }, facts: [FACTS.duha] },
    { level: 2, config: { art: 'quran.puzzle-tin', surah: 95, ayah: 1, rows: 3, cols: 3, mode: 'place', hints: false, reveal: reveal(95, 1) }, facts: [FACTS.tin] },
    { level: 3, config: { art: 'quran.puzzle-fil', surah: 105, ayah: 3, rows: 3, cols: 3, mode: 'swap', hints: false, reveal: reveal(105, 3) }, facts: [FACTS.fil] },
  ],
  order: 50,
};

export function registerSurahPuzzleGame(): void {
  registerGame(surahPuzzleGame);
}
