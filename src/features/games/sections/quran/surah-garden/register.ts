import { type GameDef, type GameFact, registerGame } from '@/core/games';
import type { MemoryPair } from '@/core/games/kit';
import type { LocalizedText } from '@/core/models';
import { QURAN_SOURCE } from '@/features/quran';

import { nsText, same, surahFactText, surahSources } from '../shared/facts';
import { lazyComponent } from '../shared/game';
import { ayahTiles, LANGS, surah, surahMeaning, surahName } from '../shared/quran';
import { surahGardenI18n } from './i18n';

/*
 * Surah Garden (MemoryPairs; rework of the v2 game – same id and fact ids). Every found pair plants a flower in the
 * garden row above the cards. L1: surah ↔ meaning of its name, all cards shown first; L2: surah ↔ number of ayahs,
 * a short look; L3: surah ↔ the Arabic words it begins with (Quran text from the data), from memory. Each level
 * mostly uses other surahs, so the levels do not repeat the same cards.
 */

export type GardenMode = 'meaning' | 'ayahCount' | 'opening';

export interface SurahGardenConfig {
  mode: GardenMode;
  pairs: MemoryPair[];
  peekMs?: number;
  hints: boolean;
  /** Pair id → fact id. */
  factOf: Record<string, string>;
}

const nameCard = (n: number) => ({ label: surahName(n), sub: String(n) });

/** First `words` word tiles of ayah 1 (verified text). */
export function openingWords(n: number, words = 2): { text: string; more: boolean } {
  const tiles = ayahTiles(surah(n).ayahs[0].arabic);
  return { text: tiles.slice(0, words).join(' '), more: tiles.length > words };
}

function pair(n: number, mode: GardenMode): MemoryPair {
  if (mode === 'meaning') return { id: `s${n}`, a: nameCard(n), b: { label: surahMeaning(n) } };
  if (mode === 'ayahCount') return { id: `s${n}`, a: nameCard(n), b: { label: nsText(surahGardenI18n, 'play.ayahs', { count: surah(n).ayahCount }) } };
  const open = openingWords(n);
  return { id: `s${n}`, a: nameCard(n), b: { arabic: open.text, quran: true, sub: open.more ? '…' : undefined } };
}

const quranSources = (ref: string) => [
  { sourceName: 'Quran', sourceReference: ref },
  { sourceName: QURAN_SOURCE.text, sourceReference: '' },
];

/** "Surah X begins with “<transliteration>” – “<translation>”" from ayah 1 of the data. */
function openingText(n: number): LocalizedText {
  const first = surah(n).ayahs[0];
  const out = {} as Record<(typeof LANGS)[number], string>;
  for (const lang of LANGS) out[lang] = nsText(surahGardenI18n, 'fact.opening', { name: surahName(n), words: first.transliteration, translation: first.translation[lang] })[lang];
  return out;
}

export const GARDEN_FACTS = {
  // Unit question `quran-structure-3` (explanation + sources).
  fatihaOpening: {
    id: 'fatiha-the-opening',
    text: {
      en: 'Al-Fatiha, "The Opening", is the first surah and is recited in every rak\'ah.',
      de: 'Al-Fatiha, „Die Eröffnende“, ist die erste Sure und wird in jeder Rak\'a rezitiert.',
      bs: 'El-Fatiha, „Pristupnica“, prva je sura i uči se u svakom rekatu.',
    },
    sources: [{ sourceName: 'Sahih al-Bukhari', sourceReference: '756' }],
    art: 'object.quran-stand',
    reviewKey: 'learn:quran-structure-3',
  },
  ikhlasMeaning: {
    id: 'ikhlas-meaning',
    text: surahFactText(112),
    sources: surahSources(112),
    art: 'garden.flower-lily',
    check: {
      type: 'choice',
      prompt: nsText(surahGardenI18n, 'fact.meaningOf', { name: surahName(112) }),
      options: [surahMeaning(112), surahMeaning(114), surahMeaning(108)],
      correctIndex: 0,
    },
  },
  kawtharCount: { id: 'kawthar-three-ayahs', text: surahFactText(108), sources: surahSources(108), art: 'garden.flower-rose', reviewKey: 'learn:quran-structure-4' },
  fatihaCount: {
    id: 'fatiha-seven-ayahs',
    text: surahFactText(1),
    sources: surahSources(1),
    art: 'garden.flower-tulip',
    check: {
      type: 'choice',
      prompt: nsText(surahGardenI18n, 'fact.countOf', { name: surahName(1) }),
      options: [same('5'), same(String(surah(1).ayahCount)), same('4')],
      correctIndex: 1,
    },
  },
  ikhlasOpening: {
    id: 'ikhlas-opening',
    text: openingText(112),
    sources: quranSources('112:1'),
    art: 'object.book',
    check: {
      type: 'choice',
      prompt: nsText(surahGardenI18n, 'fact.beginsWith', { name: surahName(112) }),
      options: [same(surah(112).ayahs[0].transliteration), same(surah(113).ayahs[0].transliteration), same(surah(109).ayahs[0].transliteration)],
      correctIndex: 0,
    },
  },
  fatihaOpeningWords: { id: 'fatiha-opening-words', text: openingText(1), sources: quranSources('1:1'), art: 'object.quran-stand' },
} satisfies Record<string, GameFact>;

const F = GARDEN_FACTS;

export const surahGardenGame: GameDef<SurahGardenConfig> = {
  id: 'surah-garden',
  topicId: 'quran',
  i18n: surahGardenI18n,
  coverArt: 'quran.surah-garden',
  hintArt: 'garden.flower-tulip',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyComponent(() => (require('./SurahGardenGame') as typeof import('./SurahGardenGame')).SurahGardenGame),
  levels: [
    {
      level: 1,
      config: { mode: 'meaning', peekMs: 3500, hints: true, pairs: [1, 112, 114, 108, 103, 105].map((n) => pair(n, 'meaning')), factOf: { s1: F.fatihaOpening.id, s112: F.ikhlasMeaning.id } },
      facts: [F.fatihaOpening, F.ikhlasMeaning],
    },
    {
      level: 2,
      config: { mode: 'ayahCount', peekMs: 1500, hints: false, pairs: [108, 106, 1, 111, 109, 104].map((n) => pair(n, 'ayahCount')), factOf: { s108: F.kawtharCount.id, s1: F.fatihaCount.id } },
      facts: [F.kawtharCount, F.fatihaCount],
    },
    {
      level: 3,
      config: { mode: 'opening', hints: false, pairs: [1, 112, 113, 107, 110, 109].map((n) => pair(n, 'opening')), factOf: { s112: F.ikhlasOpening.id, s1: F.fatihaOpeningWords.id } },
      facts: [F.ikhlasOpening, F.fatihaOpeningWords],
    },
  ],
  teaches: { questionKeys: ['learn:quran-structure-3', 'learn:quran-structure-4'] },
  order: 20,
};

export function registerSurahGardenGame(): void {
  registerGame(surahGardenGame);
}
