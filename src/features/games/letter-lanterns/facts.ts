import type { GameFact } from '@/core/games';
import { LANGUAGE_SOURCES } from '@/core/models';

/*
 * Language facts (`kind: 'language'`) of Letter Lanterns, copied from the Arabic lessons and quest questions
 * (src/features/learn/content/quests/arabic.json, src/features/learn/content/arabic/arabic-harakat.json). They are
 * about the script, not religious claims, so they cite the neutral alphabet reference – never a Quran verse.
 */

const ALPHABET = [LANGUAGE_SOURCES.alphabet];

export const LANTERN_FACTS = {
  // Quest question `arabic-dots-ba` (explanation).
  dots: {
    id: 'letter-dots',
    kind: 'language',
    text: {
      en: 'ب (Ba) has one dot below. ت has two dots above and ث three dots above.',
      de: 'ب (Ba) hat einen Punkt unten. ت hat zwei Punkte oben und ث drei Punkte oben.',
      bs: 'ب (Be) ima jednu tačku ispod. ت ima dvije tačke iznad, a ث tri tačke iznad.',
    },
    sources: ALPHABET,
    art: 'object.lantern-ramadan',
    reviewKey: 'quest:arabic-dots-ba',
  },
  // Quest question `arabic-28` (explanation).
  alphabet: {
    id: 'alphabet-28-letters',
    kind: 'language',
    text: {
      en: 'The Arabic alphabet has 28 letters.',
      de: 'Das arabische Alphabet hat 28 Buchstaben.',
      bs: 'Arapsko pismo ima 28 harfova.',
    },
    sources: ALPHABET,
    art: 'object.scroll',
    reviewKey: 'quest:arabic-28',
  },
  // Quest fact `arabic-fact-rtl`.
  joining: {
    id: 'letters-join',
    kind: 'language',
    text: {
      en: 'Arabic is written from right to left, and most letters join to the next letter.',
      de: 'Arabisch wird von rechts nach links geschrieben, und die meisten Buchstaben werden mit dem nächsten verbunden.',
      bs: 'Arapski se piše zdesna nalijevo, a većina harfova se spaja sa sljedećim.',
    },
    sources: ALPHABET,
    art: 'object.pen',
    reviewKey: 'quest:arabic-rtl',
  },
  // Unit `arabic-harakat`, first sentence of the lesson.
  harakat: {
    id: 'harakat-short-vowels',
    kind: 'language',
    text: {
      en: 'Small marks above or below a letter show how to pronounce it: fatha (a line above) gives a short "a" – بَ ba; kasra (a line below) gives "i" – بِ bi; damma (a small waw above) gives "u" – بُ bu.',
      de: 'Kleine Zeichen über oder unter einem Buchstaben zeigen die Aussprache: Fatha (Strich oben) ergibt ein kurzes „a“ – بَ ba; Kasra (Strich unten) „i“ – بِ bi; Damma (kleines Waw oben) „u“ – بُ bu.',
      bs: 'Mali znakovi iznad ili ispod harfa pokazuju izgovor: fetha (crtica iznad) daje kratko „e/a“ – بَ be; kesra (crtica ispod) „i“ – بِ bi; damma (mali vav iznad) „u“ – بُ bu.',
    },
    sources: ALPHABET,
    art: 'object.inkwell',
    reviewKey: 'quest:arabic-fatha',
  },
} satisfies Record<string, GameFact>;
