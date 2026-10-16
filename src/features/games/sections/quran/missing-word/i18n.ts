import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Missing Word',
  description: 'A word has slipped out of the ayah. Find it and put it back in its place.',
  howTo: 'Drag the right word into the gap of the ayah. You can also tap a word to place it in the next gap.',
  'play.prompt': 'Which word is missing? Drag it into the gap.',
  'play.promptTwo': 'Two words are missing – put each one in its place.',
  'play.promptMemory': 'From memory: fill every gap, no meaning shown.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Fehlendes Wort',
  description: 'Ein Wort ist aus dem Vers gerutscht. Finde es und setz es wieder an seinen Platz.',
  howTo: 'Zieh das richtige Wort in die Lücke des Verses. Du kannst ein Wort auch antippen – es kommt in die nächste Lücke.',
  'play.prompt': 'Welches Wort fehlt? Zieh es in die Lücke.',
  'play.promptTwo': 'Zwei Wörter fehlen – setz jedes an seinen Platz.',
  'play.promptMemory': 'Aus dem Gedächtnis: Fülle jede Lücke, ohne Bedeutung.',
};

const bs: Record<Key, string> = {
  title: 'Riječ koja nedostaje',
  description: 'Jedna riječ je ispala iz ajeta. Pronađi je i vrati na njeno mjesto.',
  howTo: 'Prevuci pravu riječ u prazninu ajeta. Riječ možeš i dodirnuti – ide u sljedeću prazninu.',
  'play.prompt': 'Koja riječ nedostaje? Prevuci je u prazninu.',
  'play.promptTwo': 'Nedostaju dvije riječi – vrati svaku na njeno mjesto.',
  'play.promptMemory': 'Napamet: popuni svaku prazninu, bez značenja.',
};

export const missingWordI18n = defineNamespace('game.missing-word', { en, de, bs });
