import { type GameDef, registerGame } from '@/core/games';
import type { KitItem } from '@/core/games/kit';

import { quoteFact } from '../shared/facts';
import { lazyComponent } from '../shared/game';
import { ayahTiles, ayah, wordItems } from '../shared/quran';
import { missingWordI18n } from './i18n';

/*
 * Missing Word (local engine GapLine, built from kit primitives). One ayah after another with words missing –
 * every level is a complete surah. L1: Al-Ikhlas, one gap, the meaning shown, hints. L2: An-Nas, two gaps,
 * look-alike words from Al-Falaq. L3 twist: Al-Masad from memory – no meaning, no hints, more gaps.
 */

export interface GapRound {
  surah: number;
  ayah: number;
  words: KitItem[];
  gaps: number[];
  distractors: KitItem[];
}

export interface MissingWordConfig {
  rounds: GapRound[];
  hints: boolean;
  mode: 'one' | 'two' | 'memory';
}

/** Words of another ayah that differ from every word of the target (verified data text). */
function others(words: KitItem[], from: [number, number], count: number): KitItem[] {
  const own = new Set(words.map((w) => w.arabic));
  return ayahTiles(ayah(from[0], from[1]).arabic)
    .filter((w) => !own.has(w))
    .slice(0, count)
    .map((w, i) => ({ id: `x${from[0]}-${from[1]}-${i}`, arabic: w, quran: true }));
}

function round(s: number, a: number, gaps: number[], from: [number, number], count: number): GapRound {
  const words = wordItems(s, a);
  return { surah: s, ayah: a, words, gaps: gaps.filter((g) => g < words.length), distractors: others(words, from, count) };
}

const FACTS = {
  ikhlas: quoteFact({ id: 'ikhlas-words', surah: 112, from: 1, to: 4, art: 'quran.one-star' }),
  nas: quoteFact({ id: 'nas-words', surah: 114, from: 1, to: 6, art: 'object.lantern' }),
  masad: quoteFact({ id: 'masad-words', surah: 111, from: 1, to: 5, art: 'quran.puzzle-fil' }),
};

export const missingWordGame: GameDef<MissingWordConfig> = {
  id: 'missing-word',
  topicId: 'quran',
  i18n: missingWordI18n,
  coverArt: 'quran.message-scroll',
  hintArt: 'kit.tiles',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyComponent(() => (require('./MissingWordGame') as typeof import('./MissingWordGame')).MissingWordGame),
  levels: [
    // Every level is a complete surah: all ayahs, from the first to the last.
    {
      level: 1,
      config: {
        mode: 'one',
        hints: true,
        rounds: [1, 2, 3, 4].map((a) => round(112, a, [a % 2], [113, ((a + 1) % 5) + 1], 2)),
      },
      facts: [FACTS.ikhlas],
    },
    {
      level: 2,
      config: {
        mode: 'two',
        hints: false,
        rounds: [1, 2, 3, 4, 5, 6].map((a) => round(114, a, a % 2 ? [0, 2] : [1, 3], [113, ((a + 1) % 5) + 1], 2)),
      },
      facts: [FACTS.nas],
    },
    {
      level: 3,
      config: {
        mode: 'memory',
        hints: false,
        rounds: [1, 2, 3, 4, 5].map((a) => round(111, a, a % 2 ? [0, 2] : [1, 3], [112, ((a + 1) % 4) + 1], 2)),
      },
      facts: [FACTS.masad],
    },
  ],
  order: 40,
};

export function registerMissingWordGame(): void {
  registerGame(missingWordGame);
}
