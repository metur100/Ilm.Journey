import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Signs Allah Swears By',
  description: 'Many surahs of Juz ʿAmma begin with an oath: by the sun, by the fig and the olive, by the night. Find these signs in the pictures.',
  howTo: 'Tap the sign in the picture that the ayah names. Each one you find shows its ayah.',
  'play.promptShams': 'Surah Ash-Shams: find each sign in the order of the ayahs.',
  'play.promptTin': 'Surah At-Tin: find the four things Allah swears by.',
  'play.promptMixed': 'Signs from several surahs: find each one in turn.',
  'spot.sun': 'The sun',
  'spot.moon': 'The moon',
  'spot.day': 'The day',
  'spot.night': 'The night',
  'spot.sky': 'The sky',
  'spot.earth': 'The earth',
  'spot.fig': 'The fig',
  'spot.olive': 'The olive',
  'spot.sinai': 'Mount Sinai',
  'spot.city': 'The secure city',
  'spot.brightness': 'The morning brightness',
  'spot.star': 'The piercing star',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Zeichen, bei denen Allah schwört',
  description: 'Viele Suren aus Dschuz ʿAmma beginnen mit einem Schwur: bei der Sonne, bei der Feige und der Olive, bei der Nacht. Finde diese Zeichen in den Bildern.',
  howTo: 'Tippe im Bild auf das Zeichen, das der Vers nennt. Jedes gefundene Zeichen zeigt seinen Vers.',
  'play.promptShams': 'Sure Asch-Schams: Finde jedes Zeichen in der Reihenfolge der Verse.',
  'play.promptTin': 'Sure At-Tin: Finde die vier Dinge, bei denen Allah schwört.',
  'play.promptMixed': 'Zeichen aus mehreren Suren: Finde eines nach dem anderen.',
  'spot.sun': 'Die Sonne',
  'spot.moon': 'Der Mond',
  'spot.day': 'Der Tag',
  'spot.night': 'Die Nacht',
  'spot.sky': 'Der Himmel',
  'spot.earth': 'Die Erde',
  'spot.fig': 'Die Feige',
  'spot.olive': 'Die Olive',
  'spot.sinai': 'Der Berg Sinai',
  'spot.city': 'Die sichere Ortschaft',
  'spot.brightness': 'Die Morgenhelle',
  'spot.star': 'Der durchbohrend helle Stern',
};

const bs: Record<Key, string> = {
  title: 'Znakovi kojima se Allah kune',
  description: 'Mnoge sure Džuz Amme počinju zakletvom: Suncem, smokvom i maslinom, noći. Pronađi te znakove na slikama.',
  howTo: 'Dodirni na slici znak koji ajet spominje. Svaki pronađeni znak pokazuje svoj ajet.',
  'play.promptShams': 'Sura Eš-Šems: pronađi svaki znak redom ajeta.',
  'play.promptTin': 'Sura Et-Tin: pronađi četiri stvari kojima se Allah kune.',
  'play.promptMixed': 'Znakovi iz više sura: pronađi jedan po jedan.',
  'spot.sun': 'Sunce',
  'spot.moon': 'Mjesec',
  'spot.day': 'Dan',
  'spot.night': 'Noć',
  'spot.sky': 'Nebo',
  'spot.earth': 'Zemlja',
  'spot.fig': 'Smokva',
  'spot.olive': 'Maslina',
  'spot.sinai': 'Sinajska gora',
  'spot.city': 'Sigurni grad',
  'spot.brightness': 'Jutro',
  'spot.star': 'Zvijezda blistava',
};

export const signsI18n = defineNamespace('game.signs-in-the-sky', { en, de, bs });
export type SignsKey = Key;
