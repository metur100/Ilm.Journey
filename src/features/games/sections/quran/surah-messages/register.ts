import { type GameDef, registerGame } from '@/core/games';
import type { ConnectPair } from '@/core/games/kit';

import { nsText, quoteFact } from '../shared/facts';
import { lazyComponent } from '../shared/game';
import { ayahMeaning, ayahRef, surahName } from '../shared/quran';
import { surahMessagesI18n } from './i18n';

/*
 * Messages of the Surahs (ConnectPairs). Each message is the plain meaning of the surah's own ayahs (translation in
 * the data) – the facts quote exactly those ayahs. L1: four surahs with pictures and hints; L2: five other surahs,
 * no hints; L3 twist: four more surahs (and two from before) – connect each message to the ayah (its translation)
 * that says it.
 */

export interface SurahMessagesConfig {
  pairs: ConnectPair[];
  hints: boolean;
  mode: 'surah' | 'ayah';
  /** Pair id → fact id (wrong lines send that fact to review). */
  factOf: Record<string, string>;
}

type Msg = 112 | 103 | 114 | 94 | 107 | 99 | 106 | 108 | 93 | 110 | 97 | 109 | 102;

const ART: Record<Msg, string> = {
  112: 'quran.one-star',
  103: 'object.hourglass',
  114: 'object.lantern',
  94: 'sky.dawn',
  107: 'food.bread',
  99: 'object.scales',
  106: 'object.kaaba-icon',
  108: 'object.prayer-mat',
  93: 'sky.morning',
  110: 'ui.heart',
  97: 'ramadan.qadr-sky',
  109: 'object.scroll',
  102: 'object.coins',
};

const message = (n: Msg, art = true) => ({ label: nsText(surahMessagesI18n, `msg.${n}`), art: art ? ART[n] : undefined });
const surahPair = (n: Msg, art: boolean): ConnectPair => ({ id: `s${n}`, left: { label: surahName(n), sub: `${n}` }, right: message(n, art) });
const ayahPair = (n: Msg, a: number): ConnectPair => ({ id: `s${n}`, left: message(n, false), right: { label: ayahMeaning(n, a), sub: ayahRef(n, a) } });

export const MESSAGE_FACTS = {
  ikhlas: quoteFact({ id: 'ikhlas-one', surah: 112, from: 1, to: 4, art: 'quran.one-star' }),
  sharh: quoteFact({ id: 'sharh-ease', surah: 94, from: 5, to: 6, art: 'sky.dawn' }),
  asr: quoteFact({ id: 'asr-time', surah: 103, from: 1, to: 3, art: 'object.hourglass' }),
  maun: quoteFact({ id: 'maun-needy', surah: 107, from: 1, to: 3, art: 'food.bread' }),
  zalzalah: quoteFact({ id: 'zalzalah-atom', surah: 99, from: 7, to: 8, art: 'object.scales' }),
  quraysh: quoteFact({ id: 'quraysh-house', surah: 106, from: 3, to: 4, art: 'object.kaaba-icon' }),
  duha: quoteFact({ id: 'duha-care', surah: 93, from: 6, to: 8, art: 'sky.morning' }),
  nas: quoteFact({ id: 'nas-refuge', surah: 114, from: 1, to: 3, art: 'object.lantern' }),
};

const F = MESSAGE_FACTS;

export const surahMessagesGame: GameDef<SurahMessagesConfig> = {
  id: 'surah-messages',
  topicId: 'quran',
  i18n: surahMessagesI18n,
  coverArt: 'quran.message-scroll',
  hintArt: 'kit.connect',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyComponent(() => (require('./SurahMessagesGame') as typeof import('./SurahMessagesGame')).SurahMessagesGame),
  levels: [
    {
      level: 1,
      config: {
        mode: 'surah',
        hints: true,
        pairs: ([112, 103, 114, 94] as const).map((n) => surahPair(n, true)),
        factOf: { s112: F.ikhlas.id, s94: F.sharh.id, s103: F.asr.id },
      },
      facts: [F.ikhlas, F.sharh, F.asr],
    },
    {
      level: 2,
      config: {
        mode: 'surah',
        hints: false,
        pairs: ([107, 99, 106, 108, 93] as const).map((n) => surahPair(n, false)),
        factOf: { s107: F.maun.id, s99: F.zalzalah.id, s106: F.quraysh.id },
      },
      facts: [F.maun, F.zalzalah, F.quraysh],
    },
    {
      level: 3,
      config: {
        mode: 'ayah',
        hints: false,
        pairs: [ayahPair(110, 3), ayahPair(97, 3), ayahPair(109, 6), ayahPair(102, 1), ayahPair(114, 1), ayahPair(93, 6)],
        factOf: { s93: F.duha.id, s114: F.nas.id },
      },
      facts: [F.duha, F.nas],
    },
  ],
  teaches: { questionKeys: ['learn:quran-etiquette-3'] },
  order: 70,
};

export function registerSurahMessagesGame(): void {
  registerGame(surahMessagesGame);
}
