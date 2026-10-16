import type { GameFact } from '@/core/games';
import type { PourVessel, SortBin, SortItem } from '@/core/games/kit';

import { ibnKathir, quran, T } from '../shared';

/* Salih – Water Days: "She has a turn to drink, and you have a turn to drink, each on a known day" (26:155). */

export const SALIH_FACTS = {
  turns: {
    id: 'salih-water-turns',
    text: T(
      'Salih said: "She has a turn to drink, and you have a turn to drink, each on a known day."',
      'Salih sagte: „Sie hat einen Tag zum Trinken, und ihr habt einen Tag zum Trinken, jeder an einem bestimmten Tag.“',
      'Salih je rekao: „Ona ima svoj dan pojenja, a vi imate svoj dan pojenja, svako u određeni dan.“',
    ),
    sources: [quran('26:155')],
    art: 'prophet.salih-well',
    reviewKey: 'stories:salih-share',
  },
  shared: {
    id: 'salih-water-shared',
    text: T('The water was shared between them, and each turn was kept.', 'Das Wasser wurde zwischen ihnen geteilt, und jede Reihe wurde eingehalten.', 'Voda je bila podijeljena između njih i svaki se red poštivao.'),
    sources: [quran('54:28')],
    art: 'prophet.salih-jar',
  },
  alternate: {
    id: 'salih-day-by-day',
    text: T(
      'The scholars of tafsir explain: the she-camel drank on one day and the people on the next, day after day.',
      'Die Gelehrten der Koranauslegung erklären: Die Kamelstute trank an einem Tag und die Menschen am nächsten, Tag für Tag.',
      'Učenjaci tefsira objašnjavaju: kamila je pila jedan dan, a ljudi drugi, dan za danom.',
    ),
    sources: [ibnKathir('Salih; Tafsir Ibn Kathir 26:155')],
    art: 'prophet.salih-camel',
  },
  sign: {
    id: 'salih-camel-sign',
    text: T(
      'Salih said: "This is the she-camel of Allah, a sign for you. Let her eat on Allah\'s earth and do not touch her with harm."',
      'Salih sagte: „Dies ist die Kamelstute Allahs, ein Zeichen für euch. Lasst sie auf Allahs Erde weiden und tut ihr nichts Böses an.“',
      'Salih je rekao: „Ovo je Allahova kamila, znak vama. Pustite je neka pase po Allahovoj zemlji i ne dirajte je zlom.“',
    ),
    sources: [quran('7:73')],
    art: 'prophet.salih-camel',
    check: {
      type: 'trueFalse',
      statement: T('Salih allowed the people to harm the she-camel.', 'Salih erlaubte den Leuten, der Kamelstute zu schaden.', 'Salih je dozvolio ljudima da naude kamili.'),
      correct: false,
    },
  },
  saved: {
    id: 'salih-saved-by-mercy',
    text: T('Allah saved Salih and those who believed with him, by His mercy.', 'Allah rettete Salih und die, die mit ihm glaubten, durch Seine Barmherzigkeit.', 'Allah je Svojom milošću spasio Saliha i one koji su s njim vjerovali.'),
    sources: [quran('11:66')],
    art: 'story.sun',
    reviewKey: 'stories:salih-saved',
  },
} satisfies Record<string, GameFact>;

const JAR = 'prophet.salih-jar';

export const JARS_L1: PourVessel[] = [
  { id: 'jar-1', art: JAR, label: T('Jar 1', 'Krug 1', 'Ćup 1'), target: 0.6, tolerance: 0.08 },
  { id: 'jar-2', art: JAR, label: T('Jar 2', 'Krug 2', 'Ćup 2'), target: 0.45, tolerance: 0.08 },
  { id: 'jar-3', art: JAR, label: T('Jar 3', 'Krug 3', 'Ćup 3'), target: 0.75, tolerance: 0.08 },
];

export const JARS_L3: PourVessel[] = [
  { id: 'jar-a', art: JAR, label: T('Your share', 'Dein Anteil', 'Tvoj dio'), target: 0.5, tolerance: 0.05 },
  { id: 'jar-b', art: JAR, label: T('Neighbour', 'Nachbar', 'Komšija'), target: 0.7, tolerance: 0.05 },
  { id: 'jar-c', art: JAR, label: T('Garden', 'Garten', 'Bašča'), target: 0.35, tolerance: 0.05 },
  { id: 'jar-d', art: JAR, label: T('Family', 'Familie', 'Porodica'), target: 0.8, tolerance: 0.05 },
];

export const DAY_BINS: SortBin[] = [
  { id: 'camel', label: T("The she-camel's day", 'Tag der Kamelstute', 'Dan kamile'), art: 'prophet.salih-camel' },
  { id: 'people', label: T("The people's day", 'Tag der Menschen', 'Dan ljudi'), art: JAR },
];

const DAY = T('Day', 'Tag', 'Dan');
/** Day 1 is the she-camel's, then the turns alternate (the game's start; the rule of turns is from 26:155). */
export const DAYS: SortItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: `day-${i + 1}`,
  bin: i % 2 === 0 ? 'camel' : 'people',
  label: { en: `${DAY.en} ${i + 1}`, de: `${DAY.de} ${i + 1}`, bs: `${DAY.bs} ${i + 1}` },
  art: 'object.clock',
}));

export const ITEM_FACT: Record<string, string> = {
  ...Object.fromEntries(DAYS.map((d) => [d.id, SALIH_FACTS.turns.id])),
  ...Object.fromEntries([...JARS_L1, ...JARS_L3].map((j) => [j.id, SALIH_FACTS.shared.id])),
};
