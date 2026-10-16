import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Names in the Garden',
  description: 'Allah taught Adam the names of all things. Learn the names of things in the garden!',
  howTo: 'Connect every picture with its name. On level 2 flip the cards, on level 3 find the Arabic names.',
  'play.connect': 'Draw a line from each picture to its name.',
  'play.memory': 'Flip two cards: find each picture and its name.',
  'play.arabic': 'Connect each picture with its Arabic name.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Namen im Garten',
  description: 'Allah lehrte Adam die Namen aller Dinge. Lerne die Namen der Dinge im Garten!',
  howTo: 'Verbinde jedes Bild mit seinem Namen. In Stufe 2 deckst du Karten auf, in Stufe 3 findest du die arabischen Namen.',
  'play.connect': 'Zieh eine Linie von jedem Bild zu seinem Namen.',
  'play.memory': 'Dreh zwei Karten um: Finde jedes Bild und seinen Namen.',
  'play.arabic': 'Verbinde jedes Bild mit seinem arabischen Namen.',
};

const bs: Record<Key, string> = {
  title: 'Imena u bašči',
  description: 'Allah je poučio Adema imenima svih stvari. Nauči imena stvari u bašči!',
  howTo: 'Spoji svaku sliku s njenim imenom. U 2. nivou okreći karte, u 3. nivou pronađi arapska imena.',
  'play.connect': 'Povuci liniju od svake slike do njenog imena.',
  'play.memory': 'Okreni dvije karte: pronađi svaku sliku i njeno ime.',
  'play.arabic': 'Spoji svaku sliku s njenim arapskim imenom.',
};

export const adamNamesI18n = defineNamespace('game.adam-garden-names', { en, de, bs });
