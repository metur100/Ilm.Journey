import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Harun – the Helper',
  description: 'Three events of Harun’s life: Musa’s dua for his brother as helper, the two brothers sent to Fir’awn, and Harun among the people at the time of the calf – each with its lesson.',
  howTo: 'Level 1: flip two cards to find a picture and its request. Level 2: connect what was said with how it goes on. Level 3: put the events in order.',
  'play.promptMemory': 'Find each request of Musa’s dua and its picture.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Harun – der Helfer',
  description: 'Drei Ereignisse aus Haruns Leben: Musas Bittgebet um seinen Bruder als Helfer, die beiden Brüder bei Pharao und Harun beim Volk zur Zeit des Kalbes – jedes mit seiner Lehre.',
  howTo: 'Stufe 1: Decke zwei Karten auf, um ein Bild und seine Bitte zu finden. Stufe 2: Verbinde das Gesagte mit seiner Fortsetzung. Stufe 3: Bring die Ereignisse in die richtige Reihenfolge.',
  'play.promptMemory': 'Finde jede Bitte aus Musas Bittgebet und ihr Bild.',
};

const bs: Record<Key, string> = {
  title: 'Harun – pomagač',
  description: 'Tri događaja iz Harunova života: Musaova dova da mu brat bude pomagač, dva brata poslana faraonu i Harun u narodu u vrijeme teleta – svaki sa svojom poukom.',
  howTo: 'Nivo 1: okreni dvije karte da nađeš sliku i njenu molbu. Nivo 2: spoji ono što je rečeno s njegovim nastavkom. Nivo 3: poredaj događaje.',
  'play.promptMemory': 'Nađi svaku molbu iz Musaove dove i njenu sliku.',
};

export const harunHelperI18n = defineNamespace('game.harun-helper', { en, de, bs });
