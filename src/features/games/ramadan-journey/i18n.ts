import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Ramadan Journey',
  description: 'Ten short scenes follow a safe Ramadan day from suhoor to iftar and the night prayer.',
  howTo: 'Move through the day, make choices, and learn from Quran and hadith sources. Children practise fasting only with their family’s guidance.',
} as const;

const de = {
  title: 'Ramadan-Reise',
  description: 'Zehn kurze Szenen begleiten einen sicheren Ramadantag vom Suhur bis zum Iftar und Nachtgebet.',
  howTo: 'Erlebe den Tagesablauf, triff Entscheidungen und lerne aus Koran- und Hadithquellen. Kinder üben das Fasten nur mit Anleitung ihrer Familie.',
} as const;

const bs = {
  title: 'Ramazansko putovanje',
  description: 'Deset kratkih scena prati siguran ramazanski dan od sehura do iftara i noćnog namaza.',
  howTo: 'Prođi kroz dan, donosi odluke i uči iz kur’anskih i hadiskih izvora. Djeca vježbaju post samo uz vodstvo porodice.',
} as const;

export const ramadanJourneyI18n = defineNamespace('game.ramadan-journey', { en, de, bs });