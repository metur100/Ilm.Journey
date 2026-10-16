import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Ayah Builder',
  description: 'Rebuild the ayahs of short surahs word by word – calmly, from right to left.',
  howTo: 'Drag each word into the line in the right order, starting on the right. You can also tap a word to place it.',
  'play.prompt': 'Build the ayah word by word, starting on the right.',
  'play.promptExtra': 'Some words do not belong to this ayah – leave them out.',
  'play.promptMemory': 'From memory: build the ayah that has this meaning.',
  'fact.juzAmma': 'Juz ʿAmma, the 30th part (juz’) of the Quran, holds {count} surahs: from {first} (surah {from}) to {last} (surah {to}).',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Vers-Baumeister',
  description: 'Setze die Verse kurzer Suren Wort für Wort wieder zusammen – in Ruhe, von rechts nach links.',
  howTo: 'Ziehe jedes Wort in der richtigen Reihenfolge in die Zeile, rechts beginnend. Du kannst ein Wort auch antippen.',
  'play.prompt': 'Baue den Vers Wort für Wort, rechts beginnend.',
  'play.promptExtra': 'Einige Wörter gehören nicht zu diesem Vers – lass sie liegen.',
  'play.promptMemory': 'Aus dem Gedächtnis: Baue den Vers mit dieser Bedeutung.',
  'fact.juzAmma': 'Dschuz ʿAmma, der 30. Teil (Dschuz’) des Korans, enthält {count} Suren: von {first} (Sure {from}) bis {last} (Sure {to}).',
};

const bs: Record<Key, string> = {
  title: 'Graditelj ajeta',
  description: 'Složi ajete kratkih sura riječ po riječ – polahko, zdesna nalijevo.',
  howTo: 'Prevuci svaku riječ u red pravilnim redoslijedom, počevši zdesna. Riječ možeš i dodirnuti.',
  'play.prompt': 'Složi ajet riječ po riječ, počevši zdesna.',
  'play.promptExtra': 'Neke riječi ne pripadaju ovom ajetu – ostavi ih.',
  'play.promptMemory': 'Napamet: složi ajet koji ima ovo značenje.',
  'fact.juzAmma': "Džuz Amme, 30. dio (džuz) Kur'ana, sadrži {count} sura: od sure {first} ({from}. sura) do sure {last} ({to}. sura).",
};

export const ayahBuilderI18n = defineNamespace('game.ayah-builder', { en, de, bs });
