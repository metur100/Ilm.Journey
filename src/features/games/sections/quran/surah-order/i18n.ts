import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Surah Ruler',
  description: 'Where does each surah sit in the mushaf, and how many ayahs does it have? Slide it to its place on the ruler.',
  howTo: 'Slide the marker along the ruler and tap "Place it here". The ruler tells you if it goes earlier or later.',
  'play.promptOrder': 'Slide each surah to its number in the mushaf.',
  'play.promptCount': 'Now count: slide each surah to its number of ayahs.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Suren-Lineal',
  description: 'Wo steht jede Sure im Mushaf, und wie viele Verse hat sie? Schieb sie an ihren Platz auf dem Lineal.',
  howTo: 'Schieb die Markierung am Lineal entlang und tippe auf „Hier einordnen“. Das Lineal sagt dir, ob es früher oder später ist.',
  'play.promptOrder': 'Schieb jede Sure zu ihrer Nummer im Mushaf.',
  'play.promptCount': 'Jetzt zählen: Schieb jede Sure zu ihrer Anzahl an Versen.',
};

const bs: Record<Key, string> = {
  title: 'Lenjir sura',
  description: 'Gdje se svaka sura nalazi u mushafu i koliko ajeta ima? Pomjeri je na njeno mjesto na lenjiru.',
  howTo: 'Pomjeraj oznaku duž lenjira i dodirni „Postavi ovdje“. Lenjir ti kaže da li ide ranije ili kasnije.',
  'play.promptOrder': 'Pomjeri svaku suru do njenog broja u mushafu.',
  'play.promptCount': 'Sad broji: pomjeri svaku suru do broja njenih ajeta.',
};

export const surahOrderI18n = defineNamespace('game.surah-order', { en, de, bs });
