import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Water Days',
  description: 'The water of Thamud was shared: a turn for the she-camel, a turn for the people. Keep the turns fairly!',
  howTo: 'Hold to pour water into each jar and let go at the line. On level 2, put every day in the right turn.',
  'play.pour': "It is the people's day. Fill each jar up to its line – no more than your share.",
  'play.days': "Day 1 is the she-camel's day, then the turns change. Sort the days.",
  'play.pourStrict': 'Pour exactly to the line – a fair share for everyone.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Wassertage',
  description: 'Das Wasser der Thamud wurde geteilt: ein Tag für die Kamelstute, ein Tag für die Menschen. Halte die Reihenfolge gerecht ein!',
  howTo: 'Halte gedrückt, um Wasser in jeden Krug zu gießen, und lass an der Linie los. In Stufe 2 ordnest du jeden Tag der richtigen Reihe zu.',
  'play.pour': 'Heute ist der Tag der Menschen. Füll jeden Krug bis zu seiner Linie – nicht mehr als deinen Anteil.',
  'play.days': 'Tag 1 ist der Tag der Kamelstute, dann wechselt die Reihe. Sortiere die Tage.',
  'play.pourStrict': 'Gieß genau bis zur Linie – ein gerechter Anteil für alle.',
};

const bs: Record<Key, string> = {
  title: 'Dani vode',
  description: 'Voda Semuda se dijelila: dan za kamilu, dan za ljude. Pravedno poštuj red!',
  howTo: 'Drži da sipaš vodu u svaki ćup i pusti na crti. U 2. nivou svrstaj svaki dan u pravu smjenu.',
  'play.pour': 'Danas je dan ljudi. Napuni svaki ćup do njegove crte – ne više od svog dijela.',
  'play.days': 'Prvi dan je dan kamile, zatim se smjene mijenjaju. Razvrstaj dane.',
  'play.pourStrict': 'Sipaj tačno do crte – pravedan dio za svakoga.',
};

export const salihI18n = defineNamespace('game.salih-water-days', { en, de, bs });
