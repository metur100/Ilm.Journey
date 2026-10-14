import type { LocalizedText } from '@/core/models';

/*
 * Words of Word Builder, each with a fitting picture from the art library.
 *
 * - `origin: 'content'` – copied from the Arabic word lesson (`arabic-words` in
 *   src/features/learn/content/quests/arabic.json): vowelled Arabic, transliteration and meaning are identical to the
 *   lesson (the test checks this). Only words with a fitting picture are used (no picture is drawn for jannah,
 *   rahmah, sabr …).
 * - `origin: 'basic'` – NOT in the app's lessons: standard basic Arabic vocabulary (concrete things everyone can
 *   picture), added for this game. Each carries `note: BASIC_NOTE`. Their facts are language facts with the neutral
 *   vocabulary reference, never religious claims.
 */

export type WordOrigin = 'content' | 'basic';

export interface GameWord {
  id: string;
  /** Vowelled Arabic (Noto Naskh, never Quran text). */
  arabic: string;
  translit: string;
  meaning: LocalizedText;
  art: string;
  origin: WordOrigin;
  note?: string;
}

export const BASIC_NOTE = 'Added for Word Builder: standard basic Arabic vocabulary, not part of the Arabic word lesson.';

const basic = (id: string, arabic: string, translit: string, meaning: LocalizedText, art: string): GameWord => ({
  id,
  arabic,
  translit,
  meaning,
  art,
  origin: 'basic',
  note: BASIC_NOTE,
});

export const WORDS: readonly GameWord[] = [
  // From the Arabic word lesson.
  { id: 'nur', arabic: 'نُور', translit: 'nūr', meaning: { en: 'Light', de: 'Licht', bs: 'Svjetlo' }, art: 'object.lamp', origin: 'content' },
  { id: 'kitab', arabic: 'كِتَاب', translit: 'kitāb', meaning: { en: 'Book', de: 'Buch', bs: 'Knjiga' }, art: 'object.book', origin: 'content' },
  {
    id: 'masjid',
    arabic: 'مَسْجِد',
    translit: 'masjid',
    meaning: { en: 'Mosque – place of prostration', de: 'Moschee – Ort der Niederwerfung', bs: 'Džamija – mjesto sedžde' },
    art: 'garden.masjid-small',
    origin: 'content',
  },

  // Basic vocabulary – three letters.
  basic('bab', 'بَاب', 'bāb', { en: 'Door, gate', de: 'Tür, Tor', bs: 'Vrata, kapija' }, 'garden.gate'),
  basic('shams', 'شَمْس', 'shams', { en: 'Sun', de: 'Sonne', bs: 'Sunce' }, 'garden.sun'),
  basic('qamar', 'قَمَر', 'qamar', { en: 'Moon', de: 'Mond', bs: 'Mjesec' }, 'garden.moon'),
  basic('qalam', 'قَلَم', 'qalam', { en: 'Pen', de: 'Stift', bs: 'Pero (kalem)' }, 'object.pen'),
  basic('jamal', 'جَمَل', 'jamal', { en: 'Camel', de: 'Kamel', bs: 'Deva' }, 'animal.camel'),
  basic('bayt', 'بَيْت', 'bayt', { en: 'House', de: 'Haus', bs: 'Kuća' }, 'place.house'),
  basic('tamr', 'تَمْر', 'tamr', { en: 'Dates', de: 'Datteln', bs: 'Hurme' }, 'food.dates'),
  basic('ma', 'مَاء', 'māʾ', { en: 'Water', de: 'Wasser', bs: 'Voda' }, 'food.water'),
  basic('fil', 'فِيل', 'fīl', { en: 'Elephant', de: 'Elefant', bs: 'Slon' }, 'animal.elephant'),
  basic('asad', 'أَسَد', 'asad', { en: 'Lion', de: 'Löwe', bs: 'Lav' }, 'animal.lion'),
  basic('nar', 'نَار', 'nār', { en: 'Fire', de: 'Feuer', bs: 'Vatra' }, 'object.fire'),
  basic('asal', 'عَسَل', 'ʿasal', { en: 'Honey', de: 'Honig', bs: 'Med' }, 'object.honey'),
  basic('khubz', 'خُبْز', 'khubz', { en: 'Bread', de: 'Brot', bs: 'Hljeb' }, 'food.bread'),

  // Basic vocabulary – four and five letters.
  basic('nakhla', 'نَخْلَة', 'nakhla', { en: 'Palm tree', de: 'Palme', bs: 'Palma' }, 'garden.palm'),
  basic('saa', 'سَاعَة', 'sāʿa', { en: 'Clock; hour', de: 'Uhr; Stunde', bs: 'Sat' }, 'object.clock'),
  basic('khayma', 'خَيْمَة', 'khayma', { en: 'Tent', de: 'Zelt', bs: 'Šator' }, 'object.tent'),
  basic('halib', 'حَلِيب', 'ḥalīb', { en: 'Milk', de: 'Milch', bs: 'Mlijeko' }, 'food.milk'),
  basic('baqara', 'بَقَرَة', 'baqara', { en: 'Cow', de: 'Kuh', bs: 'Krava' }, 'animal.cow'),
  basic('namla', 'نَمْلَة', 'namla', { en: 'Ant', de: 'Ameise', bs: 'Mrav' }, 'animal.ant'),
  basic('samaka', 'سَمَكَة', 'samaka', { en: 'Fish', de: 'Fisch', bs: 'Riba' }, 'animal.fish'),
  basic('hudhud', 'هُدْهُد', 'hudhud', { en: 'Hoopoe', de: 'Wiedehopf', bs: 'Pupavac' }, 'animal.hoopoe'),
  basic('miftah', 'مِفْتَاح', 'miftāḥ', { en: 'Key', de: 'Schlüssel', bs: 'Ključ' }, 'object.key'),
  basic('mizan', 'مِيزَان', 'mīzān', { en: 'Scales', de: 'Waage', bs: 'Vaga' }, 'object.scales'),
  basic('zaytun', 'زَيْتُون', 'zaytūn', { en: 'Olives', de: 'Oliven', bs: 'Masline' }, 'food.olives'),
  basic('qindil', 'قِنْدِيل', 'qindīl', { en: 'Lantern', de: 'Laterne', bs: 'Fenjer' }, 'object.lantern'),
  basic('hamama', 'حَمَامَة', 'ḥamāma', { en: 'Dove', de: 'Taube', bs: 'Golub' }, 'animal.dove'),
  basic('safina', 'سَفِينَة', 'safīna', { en: 'Ship', de: 'Schiff', bs: 'Brod' }, 'object.boat'),
];

export const getWord = (id: string): GameWord | undefined => WORDS.find((w) => w.id === id);
