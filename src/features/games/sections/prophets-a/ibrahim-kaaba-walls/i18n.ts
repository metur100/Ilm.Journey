import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Raising the House',
  description: 'Three events of Ibrahim’s life: the star, moon and sun that set, the statues and the fire made cool, and raising the Kaaba with Ismail – each with its lesson.',
  howTo: 'Level 1: order what set in the sky. Level 2: connect each question or deed with what followed. Level 3: raise the walls of the Kaaba row by row.',
  'play.sky': 'What did Ibrahim see set, one after another? Put the path in order.',
  'play.walls': 'Raise the House row by row – drag each part to its place.',
  'play.reveal': 'The House is raised',
  'play.revealCaption': '"Our Lord, accept this from us. You are the All-Hearing, the All-Knowing." (2:127)',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Das Haus errichten',
  description: 'Drei Ereignisse aus Ibrahims Leben: Stern, Mond und Sonne, die untergehen, die Statuen und das Feuer, das kühl wurde, und der Bau der Kaaba mit Ismail – jedes mit seiner Lehre.',
  howTo: 'Stufe 1: Ordne, was am Himmel unterging. Stufe 2: Verbinde jede Frage oder Tat mit dem, was folgte. Stufe 3: Errichte die Mauern der Kaaba Reihe für Reihe.',
  'play.sky': 'Was sah Ibrahim nacheinander untergehen? Bring den Weg in die richtige Reihenfolge.',
  'play.walls': 'Errichte das Haus Reihe für Reihe – zieh jedes Teil an seinen Platz.',
  'play.reveal': 'Das Haus steht',
  'play.revealCaption': '„Unser Herr, nimm es von uns an. Du bist der Allhörende, der Allwissende.“ (2:127)',
};

const bs: Record<Key, string> = {
  title: 'Podizanje Kuće',
  description: 'Tri događaja iz Ibrahimova života: zvijezda, mjesec i sunce koji zalaze, kipovi i vatra koja je postala hladna, te podizanje Kabe s Ismailom – svaki sa svojom poukom.',
  howTo: 'Nivo 1: poredaj šta je zašlo na nebu. Nivo 2: spoji svako pitanje ili djelo s onim što je uslijedilo. Nivo 3: podiži zidove Kabe red po red.',
  'play.sky': 'Šta je Ibrahim vidio kako zalazi, jedno za drugim? Poredaj stazu.',
  'play.walls': 'Podiži Kuću red po red – prevuci svaki dio na njegovo mjesto.',
  'play.reveal': 'Kuća je podignuta',
  'play.revealCaption': '„Gospodaru naš, primi od nas. Ti si Onaj koji sve čuje i sve zna.“ (2:127)',
};

export const ibrahimI18n = defineNamespace('game.ibrahim-kaaba-walls', { en, de, bs });
