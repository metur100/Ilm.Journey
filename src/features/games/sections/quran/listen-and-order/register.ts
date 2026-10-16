import { type GameDef, registerGame } from '@/core/games';
import type { KitItem } from '@/core/games/kit';

import { quoteFact } from '../shared/facts';
import { lazyComponent } from '../shared/game';
import { ayahMeaning, surah } from '../shared/quran';
import { listenAndOrderI18n } from './i18n';

/*
 * Listen and Order (SequenceBoard + the streamed recitation). L1: Al-Ikhlas, each ayah with its meaning and
 * hints. L2: An-Nas, Arabic only, six ayahs. L3 twist: Al-Fil on a path – each ayah is laid on the next stone and
 * checked at once, without hints. Offline the recitation is simply not available; the game stays playable.
 */

export interface ListenOrderConfig {
  surah: number;
  items: KitItem[];
  variant: 'list' | 'path';
  hints: boolean;
}

function items(n: number, meaning: boolean): KitItem[] {
  return surah(n).ayahs.map((a) => ({ id: `a${a.numberInSurah}`, arabic: a.arabic, quran: true, sub: meaning ? ayahMeaning(n, a.numberInSurah) : undefined }));
}

const FACTS = {
  ikhlas: quoteFact({ id: 'ikhlas-order', surah: 112, from: 1, to: 4, art: 'quran.one-star' }),
  nas: quoteFact({ id: 'nas-order', surah: 114, from: 1, to: 6, art: 'object.lantern' }),
  fil: quoteFact({ id: 'fil-order', surah: 105, from: 1, to: 5, art: 'quran.puzzle-fil' }),
};

export const listenAndOrderGame: GameDef<ListenOrderConfig> = {
  id: 'listen-and-order',
  topicId: 'quran',
  i18n: listenAndOrderI18n,
  coverArt: 'quran.mushaf-rahle',
  hintArt: 'kit.steps',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyComponent(() => (require('./ListenOrderGame') as typeof import('./ListenOrderGame')).ListenOrderGame),
  levels: [
    { level: 1, config: { surah: 112, items: items(112, true), variant: 'list', hints: true }, facts: [FACTS.ikhlas] },
    { level: 2, config: { surah: 114, items: items(114, false), variant: 'list', hints: false }, facts: [FACTS.nas] },
    { level: 3, config: { surah: 105, items: items(105, false), variant: 'path', hints: false }, facts: [FACTS.fil] },
  ],
  order: 60,
};

export function registerListenAndOrderGame(): void {
  registerGame(listenAndOrderGame);
}
