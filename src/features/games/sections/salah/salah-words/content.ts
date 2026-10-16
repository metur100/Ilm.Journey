import type { GameFact } from '@/core/games';
import { ayahWords, getDua, getSurah } from '@/features/quran';

import { BUKHARI, fact, ILMIHAL, L, MUSLIM, Q } from '../shared/content';

/*
 * The words of salah. Arabic only from the generated Quran data (Al-Fatiha, Rabbena = 2:201); the other formulas
 * (Subhaneke, the tasbihs of ruku‘ and sajda, Ettehijjatu, Salavat) are given by name / transliteration and meaning.
 */

/** L1: where in the prayer each text is said (bins = positions of the prayer figure). */
export const PLACE_ITEMS: { id: string; bin: 'qiyam' | 'ruku' | 'sajda' | 'sitting' }[] = [
  { id: 'subhaneke', bin: 'qiyam' },
  { id: 'fatiha', bin: 'qiyam' },
  { id: 'surah', bin: 'qiyam' },
  { id: 'ruku-tasbih', bin: 'ruku' },
  { id: 'sajda-tasbih', bin: 'sajda' },
  { id: 'ettehijjatu', bin: 'sitting' },
  { id: 'salavat', bin: 'sitting' },
  { id: 'rabbena', bin: 'sitting' },
];

export const POSITION_ART: Record<'qiyam' | 'ruku' | 'sajda' | 'sitting', string> = {
  qiyam: 'salah.prayer-folded',
  ruku: 'salah.prayer-ruku',
  sajda: 'salah.prayer-sajda',
  sitting: 'salah.prayer-tashahhud',
};

/** L2: the seven ayahs of Al-Fatiha (generated data). */
export function fatihaAyahs(): { id: string; arabic: string }[] {
  const surah = getSurah(1);
  if (!surah) throw new Error('salah-words: Al-Fatiha missing in the Quran data');
  return surah.ayahs.map((a) => ({ id: `fatiha-${a.numberInSurah}`, arabic: a.arabic }));
}

/** L3: the words of Rabbena (Quran 2:201 from "رَبَّنَآ" on, generated data). */
export function rabbenaWords(): { id: string; arabic: string }[] {
  const dua = getDua('good-in-both-worlds');
  if (!dua) throw new Error('salah-words: dua 2:201 missing in the Quran data');
  const words = ayahWords(dua.ayahs[0].arabic);
  const bare = (w: string) => w.replace(/[ً-ٰٟۖ-ۭ]/g, '');
  const start = words.findIndex((w) => bare(w).startsWith('ربن'));
  if (start < 0) throw new Error('salah-words: Rabbena not found in 2:201');
  return words.slice(start).map((arabic, i) => ({ id: `w${i + 1}`, arabic }));
}

export const WORDS_FACTS = {
  places: fact(
    'salah-words-places',
    L(
      'Standing we recite Subhaneke (in the first rakat), Al-Fatiha and a surah; in ruku‘ “Subhane rabbijel-azim” and in sajda “Subhane rabbijel-a‘la”; in the sitting the Ettehijjatu, and in the last sitting also the Salavat and Rabbena.',
      'Im Stehen rezitieren wir das Subhaneke (in der ersten Rak‘a), Al-Fatiha und eine Sure; im Ruku‘ „Subhana rabbiyal-azim“ und in der Sadschda „Subhana rabbiyal-a‘la“; im Sitzen das Ettehijjatu und im letzten Sitzen auch die Salavat und Rabbena.',
      'Na kijamu učimo Subhaneke (u prvom rekatu), Fatihu i suru; na ruku‘u „Subhane rabbijel-azim“, a na sedždi „Subhane rabbijel-a‘la“; na sjedenju Ettehijjatu, a na posljednjem sjedenju i salavate i Rabbena.',
    ),
    [MUSLIM('772'), ILMIHAL('Namaz')],
    'salah.prayer-ruku',
  ),
  fatiha: fact(
    'fatiha-every-prayer',
    L(
      'The Prophet ﷺ said: there is no prayer for the one who does not recite the Opening of the Book (Al-Fatiha).',
      'Der Prophet ﷺ sagte: Es gibt kein Gebet für den, der nicht die Eröffnende (Al-Fatiha) rezitiert.',
      'Poslanik ﷺ je rekao: nema namaza onaj ko ne prouči Fatihu.',
    ),
    [BUKHARI('756'), MUSLIM('394')],
    'object.quran-stand',
  ),
  seven: fact(
    'fatiha-seven-ayahs',
    L('Al-Fatiha has seven ayahs – the “seven often repeated” ones, recited in every rakat.', 'Al-Fatiha hat sieben Verse – die „sieben oft Wiederholten“, die in jeder Rak‘a rezitiert werden.', 'Fatiha ima sedam ajeta – „sedam koji se ponavljaju“, a uči se u svakom rekatu.'),
    [Q('15:87'), Q('1:1-7')],
    'object.book',
  ),
  rabbena: fact(
    'rabbena-last-sitting',
    L(
      'Rabbena (2:201) means: “Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.” It is recited in the last sitting before the selam.',
      'Rabbena (2:201) bedeutet: „Unser Herr, gib uns im Diesseits Gutes und im Jenseits Gutes und bewahre uns vor der Strafe des Feuers.“ Es wird im letzten Sitzen vor dem Salam rezitiert.',
      'Rabbena (2:201) znači: „Gospodaru naš, podaj nam dobro i na ovome i na onome svijetu, i sačuvaj nas patnje u ognju!“ Uči se na posljednjem sjedenju prije selama.',
    ),
    [Q('2:201'), ILMIHAL('Namaz')],
    'salah.prayer-tashahhud',
  ),
} satisfies Record<string, GameFact>;

export const FACT_OF: Record<string, string> = Object.fromEntries([
  ...PLACE_ITEMS.map((i) => [i.id, WORDS_FACTS.places.id]),
  ...Array.from({ length: 7 }, (_, i) => [`fatiha-${i + 1}`, WORDS_FACTS.fatiha.id]),
]);

export const WORDS_ART = [...Object.values(POSITION_ART), 'object.quran-stand', 'object.book', 'salah.prayer-tashahhud'];
