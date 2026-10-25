import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Glad Tidings',
  description: 'Three parts of Ishaq’s story: Ibrahim’s honoured guests, the glad tidings of Ishaq and Yaqub, and the family of prophets – each with its lesson.',
  howTo: 'Level 1: prepare the welcome. Level 2: put the glad tidings in order. Level 3: connect each prophet with his place in the family.',
  'play.welcome': 'Guests are coming! Prepare the welcome in front of the tent.',
  'play.reveal': 'Welcome, honoured guests!',
  'play.revealCaption': 'Salam – and salam in return (11:69).',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Frohe Botschaft',
  description: 'Drei Teile von Ishaqs Geschichte: Ibrahims geehrte Gäste, die frohe Botschaft von Ishaq und Yaqub und die Familie der Propheten – jeder mit seiner Lehre.',
  howTo: 'Stufe 1: Bereite den Empfang vor. Stufe 2: Bring die frohe Botschaft in die richtige Reihenfolge. Stufe 3: Verbinde jeden Propheten mit seinem Platz in der Familie.',
  'play.welcome': 'Gäste kommen! Bereite den Empfang vor dem Zelt vor.',
  'play.reveal': 'Willkommen, geehrte Gäste!',
  'play.revealCaption': 'Salam – und Salam als Antwort (11:69).',
};

const bs: Record<Key, string> = {
  title: 'Radosna vijest',
  description: 'Tri dijela Ishakove priče: Ibrahimovi ugledni gosti, radosna vijest o Ishaku i Jakubu, te porodica poslanika – svaki sa svojom poukom.',
  howTo: 'Nivo 1: pripremi doček. Nivo 2: poredaj radosnu vijest. Nivo 3: spoji svakog poslanika s njegovim mjestom u porodici.',
  'play.welcome': 'Dolaze gosti! Pripremi doček ispred šatora.',
  'play.reveal': 'Dobro došli, ugledni gosti!',
  'play.revealCaption': 'Selam – i selam kao odgovor (11:69).',
};

export const ishaqI18n = defineNamespace('game.ishaq-glad-tidings', { en, de, bs });
