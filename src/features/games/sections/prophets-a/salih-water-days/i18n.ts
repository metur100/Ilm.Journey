import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Water Days',
  description: 'Three parts of Salih’s story: the homes in the mountains and his call, the she-camel and the shared water, and the rescue of the believers – each with its lesson.',
  howTo: 'Level 1: sort Allah’s gifts and Salih’s call. Level 2: hold to pour each jar up to its line. Level 3: put the end of the story in order.',
  'play.pour': 'The she-camel had her day, and today is the people’s day (26:155). Fill each jar up to its line – no more than your share.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Wassertage',
  description: 'Drei Teile von Salihs Geschichte: die Häuser in den Bergen und sein Aufruf, die Kamelstute und das geteilte Wasser, und die Rettung der Gläubigen – jeder mit seiner Lehre.',
  howTo: 'Stufe 1: Sortiere Allahs Gaben und Salihs Aufruf. Stufe 2: Halte gedrückt und füll jeden Krug bis zur Linie. Stufe 3: Bring das Ende der Geschichte in die richtige Reihenfolge.',
  'play.pour': 'Die Kamelstute hatte ihren Tag, heute ist der Tag der Menschen (26:155). Füll jeden Krug bis zu seiner Linie – nicht mehr als deinen Anteil.',
};

const bs: Record<Key, string> = {
  title: 'Dani vode',
  description: 'Tri dijela Salihove priče: kuće u planinama i njegov poziv, kamila i podijeljena voda, te spas vjernika – svaki sa svojom poukom.',
  howTo: 'Nivo 1: razvrstaj Allahove blagodati i Salihov poziv. Nivo 2: drži i napuni svaki ćup do crte. Nivo 3: poredaj kraj priče.',
  'play.pour': 'Kamila je imala svoj dan, a danas je dan ljudi (26:155). Napuni svaki ćup do njegove crte – ne više od svog dijela.',
};

export const salihI18n = defineNamespace('game.salih-water-days', { en, de, bs });
