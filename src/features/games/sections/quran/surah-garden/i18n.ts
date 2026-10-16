import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Surah Garden',
  description: 'Flip the cards and find each surah’s partner: its meaning, its number of ayahs or its first words – every pair plants a flower.',
  howTo: 'Turn over two cards. When a surah and its partner meet, a flower grows in your garden.',
  'play.prompt.meaning': 'Find each surah and the meaning of its name.',
  'play.prompt.ayahCount': 'Find each surah and its number of ayahs.',
  'play.prompt.opening': 'Find each surah and the words it begins with.',
  'play.ayahs': '{count} ayahs',
  'a11y.garden': 'Garden: {count} of {total} flowers',
  'fact.meaningOf': 'What does the name of Surah {name} mean?',
  'fact.countOf': 'How many ayahs does Surah {name} have?',
  'fact.beginsWith': 'How does Surah {name} begin?',
  'fact.opening': 'Surah {name} begins with “{words}” – “{translation}”',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Surengarten',
  description: 'Deck die Karten auf und finde den Partner jeder Sure: ihre Bedeutung, ihre Verszahl oder ihre ersten Worte – jedes Paar pflanzt eine Blume.',
  howTo: 'Dreh zwei Karten um. Wenn eine Sure und ihr Partner zusammenkommen, wächst eine Blume in deinem Garten.',
  'play.prompt.meaning': 'Finde jede Sure und die Bedeutung ihres Namens.',
  'play.prompt.ayahCount': 'Finde jede Sure und ihre Anzahl an Versen.',
  'play.prompt.opening': 'Finde jede Sure und die Worte, mit denen sie beginnt.',
  'play.ayahs': '{count} Verse',
  'a11y.garden': 'Garten: {count} von {total} Blumen',
  'fact.meaningOf': 'Was bedeutet der Name der Sure {name}?',
  'fact.countOf': 'Wie viele Verse hat die Sure {name}?',
  'fact.beginsWith': 'Wie beginnt die Sure {name}?',
  'fact.opening': 'Die Sure {name} beginnt mit „{words}“ – „{translation}“',
};

const bs: Record<Key, string> = {
  title: 'Bašča sura',
  description: 'Okreći kartice i nađi par svake sure: značenje njenog imena, broj ajeta ili prve riječi – svaki par posadi cvijet.',
  howTo: 'Okreni dvije kartice. Kad se sura i njen par sretnu, u tvojoj bašči izraste cvijet.',
  'play.prompt.meaning': 'Nađi svaku suru i značenje njenog imena.',
  'play.prompt.ayahCount': 'Nađi svaku suru i broj njenih ajeta.',
  'play.prompt.opening': 'Nađi svaku suru i riječi kojima počinje.',
  'play.ayahs': '{count} ajeta',
  'a11y.garden': 'Bašča: {count} od {total} cvjetova',
  'fact.meaningOf': 'Šta znači ime sure {name}?',
  'fact.countOf': 'Koliko ajeta ima sura {name}?',
  'fact.beginsWith': 'Kako počinje sura {name}?',
  'fact.opening': 'Sura {name} počinje riječima „{words}“ – „{translation}“',
};

export const surahGardenI18n = defineNamespace('game.surah-garden', { en, de, bs });
