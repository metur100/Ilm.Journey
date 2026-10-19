import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Surah Puzzle',
  description: 'Put a whole surah in order – every ayah, from the first to the last.',
  howTo: 'Drag the ayahs into the order of the mushaf. Every level is one complete surah; no ayah is skipped.',
  'play.prompt': 'Put the ayahs of {name} in order – the whole surah.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Suren-Puzzle',
  description: 'Bringe eine ganze Sure in die richtige Reihenfolge – jeder Vers, vom ersten bis zum letzten.',
  howTo: 'Zieh die Verse in die Reihenfolge des Mushafs. Jede Stufe ist eine vollständige Sure; kein Vers fehlt.',
  'play.prompt': 'Bringe die Verse von {name} in die richtige Reihenfolge – die ganze Sure.',
};

const bs: Record<Key, string> = {
  title: 'Slagalica sure',
  description: 'Poredaj cijelu suru – svaki ajet, od prvog do posljednjeg.',
  howTo: 'Prevuci ajete u redoslijed mushafa. Svaki nivo je jedna cijela sura; nijedan ajet nije izostavljen.',
  'play.prompt': 'Poredaj ajete sure {name} – cijelu suru.',
};

export const surahPuzzleI18n = defineNamespace('game.surah-puzzle', { en, de, bs });
