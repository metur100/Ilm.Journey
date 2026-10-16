import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Surah Puzzle',
  description: 'Put the picture of a surah back together – and its ayah reveals what it means.',
  howTo: 'Drag the pieces into the frame. In level 3 the frame is full: swap two pieces until the picture is right.',
  'play.promptPlace': 'Rebuild the picture of this ayah, piece by piece.',
  'play.promptSwap': 'The pieces are mixed up – swap two at a time until the picture is right.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Suren-Puzzle',
  description: 'Setz das Bild einer Sure wieder zusammen – dann zeigt ihr Vers, was er bedeutet.',
  howTo: 'Zieh die Teile in den Rahmen. In Level 3 ist der Rahmen voll: Tausche zwei Teile, bis das Bild stimmt.',
  'play.promptPlace': 'Setz das Bild dieses Verses Teil für Teil zusammen.',
  'play.promptSwap': 'Die Teile sind vertauscht – tausche je zwei, bis das Bild stimmt.',
};

const bs: Record<Key, string> = {
  title: 'Slagalica sura',
  description: 'Složi sliku jedne sure – a njen ajet otkrije šta znači.',
  howTo: 'Prevuci dijelove u okvir. U 3. nivou okvir je pun: zamijeni po dva dijela dok slika ne bude tačna.',
  'play.promptPlace': 'Složi sliku ovog ajeta, dio po dio.',
  'play.promptSwap': 'Dijelovi su izmiješani – mijenjaj po dva dok slika ne bude tačna.',
};

export const surahPuzzleI18n = defineNamespace('game.surah-puzzle', { en, de, bs });
