import type { LocalizedText } from '@/core/models';

import { splitLetters } from './script';

/*
 * Words of the Arabic / Sufara games.
 *
 * - `origin: 'lesson'` – copied from the Arabic word lesson (`arabic-words` in src/features/learn/content/quests/arabic.json):
 *   vowelled Arabic, transliteration and meaning are identical to the lesson (the content test checks this).
 * - `origin: 'basic'` – the basic vocabulary of the v2 Word Builder game (concrete things everyone can picture, each with
 *   a fitting picture). Their facts are language facts with the neutral vocabulary reference, never religious claims.
 *
 * Vowelled Arabic in Noto Naskh – never Quran text.
 */

export type WordOrigin = 'lesson' | 'basic';

export interface GameWord {
  id: string;
  arabic: string;
  translit: string;
  meaning: LocalizedText;
  /** A fitting picture (only concrete words have one). */
  art?: string;
  origin: WordOrigin;
}

const lesson = (id: string, arabic: string, translit: string, meaning: [string, string, string], art?: string): GameWord => ({
  id,
  arabic,
  translit,
  meaning: { en: meaning[0], de: meaning[1], bs: meaning[2] },
  art,
  origin: 'lesson',
});

const basic = (id: string, arabic: string, translit: string, meaning: [string, string, string], art: string): GameWord => ({
  id,
  arabic,
  translit,
  meaning: { en: meaning[0], de: meaning[1], bs: meaning[2] },
  art,
  origin: 'basic',
});

export const WORDS: readonly GameWord[] = [
  // The Arabic word lesson.
  lesson('salam', 'سَلَام', 'salām', ['Peace', 'Frieden', 'Mir']),
  lesson('kitab', 'كِتَاب', 'kitāb', ['Book', 'Buch', 'Knjiga'], 'object.book'),
  lesson('masjid', 'مَسْجِد', 'masjid', ['Mosque – place of prostration', 'Moschee – Ort der Niederwerfung', 'Džamija – mjesto sedžde'], 'garden.masjid-small'),
  lesson('nur', 'نُور', 'nūr', ['Light', 'Licht', 'Svjetlo'], 'object.lamp'),
  lesson('ilm', 'عِلْم', 'ʿilm', ['Knowledge', 'Wissen', 'Znanje']),
  lesson('jannah', 'جَنَّة', 'jannah', ['Garden; Paradise', 'Garten; Paradies', 'Bašča; Džennet']),
  lesson('rahmah', 'رَحْمَة', 'raḥmah', ['Mercy', 'Barmherzigkeit', 'Milost']),
  lesson('sabr', 'صَبْر', 'ṣabr', ['Patience', 'Geduld', 'Strpljenje']),

  // Basic vocabulary (Word Builder) – three letters.
  basic('bab', 'بَاب', 'bāb', ['Door, gate', 'Tür, Tor', 'Vrata, kapija'], 'garden.gate'),
  basic('shams', 'شَمْس', 'shams', ['Sun', 'Sonne', 'Sunce'], 'garden.sun'),
  basic('qamar', 'قَمَر', 'qamar', ['Moon', 'Mond', 'Mjesec'], 'garden.moon'),
  basic('qalam', 'قَلَم', 'qalam', ['Pen', 'Stift', 'Pero (kalem)'], 'object.pen'),
  basic('jamal', 'جَمَل', 'jamal', ['Camel', 'Kamel', 'Deva'], 'animal.camel'),
  basic('bayt', 'بَيْت', 'bayt', ['House', 'Haus', 'Kuća'], 'place.house'),
  basic('tamr', 'تَمْر', 'tamr', ['Dates', 'Datteln', 'Hurme'], 'food.dates'),
  basic('ma', 'مَاء', 'māʾ', ['Water', 'Wasser', 'Voda'], 'food.water'),
  basic('fil', 'فِيل', 'fīl', ['Elephant', 'Elefant', 'Slon'], 'animal.elephant'),
  basic('asad', 'أَسَد', 'asad', ['Lion', 'Löwe', 'Lav'], 'animal.lion'),
  basic('nar', 'نَار', 'nār', ['Fire', 'Feuer', 'Vatra'], 'object.fire'),
  basic('asal', 'عَسَل', 'ʿasal', ['Honey', 'Honig', 'Med'], 'object.honey'),
  basic('khubz', 'خُبْز', 'khubz', ['Bread', 'Brot', 'Hljeb'], 'food.bread'),

  // Basic vocabulary – four and five letters.
  basic('nakhla', 'نَخْلَة', 'nakhla', ['Palm tree', 'Palme', 'Palma'], 'garden.palm'),
  basic('saa', 'سَاعَة', 'sāʿa', ['Clock; hour', 'Uhr; Stunde', 'Sat'], 'object.clock'),
  basic('khayma', 'خَيْمَة', 'khayma', ['Tent', 'Zelt', 'Šator'], 'object.tent'),
  basic('halib', 'حَلِيب', 'ḥalīb', ['Milk', 'Milch', 'Mlijeko'], 'food.milk'),
  basic('baqara', 'بَقَرَة', 'baqara', ['Cow', 'Kuh', 'Krava'], 'animal.cow'),
  basic('namla', 'نَمْلَة', 'namla', ['Ant', 'Ameise', 'Mrav'], 'animal.ant'),
  basic('samaka', 'سَمَكَة', 'samaka', ['Fish', 'Fisch', 'Riba'], 'animal.fish'),
  basic('hudhud', 'هُدْهُد', 'hudhud', ['Hoopoe', 'Wiedehopf', 'Pupavac'], 'animal.hoopoe'),
  basic('miftah', 'مِفْتَاح', 'miftāḥ', ['Key', 'Schlüssel', 'Ključ'], 'object.key'),
  basic('mizan', 'مِيزَان', 'mīzān', ['Scales', 'Waage', 'Vaga'], 'object.scales'),
  basic('zaytun', 'زَيْتُون', 'zaytūn', ['Olives', 'Oliven', 'Masline'], 'food.olives'),
  basic('qindil', 'قِنْدِيل', 'qindīl', ['Lantern', 'Laterne', 'Fenjer'], 'object.lantern'),
  basic('hamama', 'حَمَامَة', 'ḥamāma', ['Dove', 'Taube', 'Golub'], 'animal.dove'),
  basic('safina', 'سَفِينَة', 'safīna', ['Ship', 'Schiff', 'Brod'], 'object.boat'),
];

export function getWord(id: string): GameWord {
  const word = WORDS.find((w) => w.id === id);
  if (!word) throw new Error(`Word ${id} missing`);
  return word;
}

export const words = (ids: readonly string[]): GameWord[] => ids.map(getWord);

/** The written letters of a word without its marks (ك ت ا ب for كِتَاب). */
export const bareLetters = (word: GameWord | string): string[] => splitLetters(typeof word === 'string' ? word : word.arabic).map((l) => l.base);

/** Letters with their marks (كِ تَ ا ب). */
export const markedLetters = (word: GameWord | string): string[] => splitLetters(typeof word === 'string' ? word : word.arabic).map((l) => l.text);

/** Lesson line "كِتَاب (kitāb) – Book". */
export const wordLine = (word: GameWord, language: keyof LocalizedText): string => `${word.arabic} (${word.translit}) – ${word.meaning[language]}`;
