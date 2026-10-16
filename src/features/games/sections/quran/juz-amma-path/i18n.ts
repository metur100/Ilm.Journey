import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Juz ʿAmma Path',
  description: 'The last surahs of the Quran shine like stars. Trace the path from star to star in the order of the mushaf.',
  howTo: 'Draw a line with your finger from star to star in the right order – or tap the stars one after another.',
  'play.prompt': 'Trace the surahs in the order of the mushaf, from {first} to {last}.',
  'play.promptBack': 'From memory, backwards: start at {first} and go back to {last}.',
  'fact.juzAmma': 'Juz ʿAmma, the 30th part (juz’) of the Quran, holds {count} surahs: from {first} (surah {from}) to {last} (surah {to}).',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Pfad durch Dschuz ʿAmma',
  description: 'Die letzten Suren des Korans leuchten wie Sterne. Zieh den Pfad von Stern zu Stern in der Reihenfolge des Mushaf.',
  howTo: 'Zieh mit dem Finger eine Linie von Stern zu Stern in der richtigen Reihenfolge – oder tippe die Sterne nacheinander an.',
  'play.prompt': 'Verbinde die Suren in der Reihenfolge des Mushaf, von {first} bis {last}.',
  'play.promptBack': 'Aus dem Gedächtnis, rückwärts: Beginne bei {first} und geh zurück bis {last}.',
  'fact.juzAmma': 'Dschuz ʿAmma, der 30. Teil (Dschuz’) des Korans, enthält {count} Suren: von {first} (Sure {from}) bis {last} (Sure {to}).',
};

const bs: Record<Key, string> = {
  title: 'Staza Džuz Amme',
  description: "Posljednje sure Kur'ana sjaje kao zvijezde. Povuci stazu od zvijezde do zvijezde redom kao u mushafu.",
  howTo: 'Prstom povuci liniju od zvijezde do zvijezde pravilnim redom – ili dodiruj zvijezde jednu za drugom.',
  'play.prompt': 'Poveži sure redom kao u mushafu, od {first} do {last}.',
  'play.promptBack': 'Napamet, unazad: počni od {first} i idi nazad do {last}.',
  'fact.juzAmma': "Džuz Amme, 30. dio (džuz) Kur'ana, sadrži {count} sura: od sure {first} ({from}. sura) do sure {last} ({to}. sura).",
};

export const juzPathI18n = defineNamespace('game.juz-amma-path', { en, de, bs });
