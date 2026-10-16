import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Glad Tidings',
  description: 'Welcome Ibrahim\'s honoured guests, hear the glad tidings of Ishaq and Yaqub, and get to know the family of Ibrahim.',
  howTo: 'Level 1: prepare the welcome. Level 2: put the story of the guests in order. Level 3: connect each prophet with his parents.',
  'play.welcome': 'Guests are coming! Prepare the welcome in front of the tent.',
  'play.reveal': 'Welcome, honoured guests!',
  'play.revealCaption': 'Salam – and salam in return (11:69).',
  'play.story': 'What happened when the guests came? Put it in order.',
  'play.family': 'Connect each prophet with his place in the family of Ibrahim.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Frohe Botschaft',
  description: 'Empfange Ibrahims geehrte Gäste, höre die frohe Botschaft von Ishaq und Yaqub und lerne die Familie Ibrahims kennen.',
  howTo: 'Stufe 1: Bereite den Empfang vor. Stufe 2: Bring die Geschichte der Gäste in die richtige Reihenfolge. Stufe 3: Verbinde jeden Propheten mit seinen Eltern.',
  'play.welcome': 'Gäste kommen! Bereite den Empfang vor dem Zelt vor.',
  'play.reveal': 'Willkommen, geehrte Gäste!',
  'play.revealCaption': 'Salam – und Salam als Antwort (11:69).',
  'play.story': 'Was geschah, als die Gäste kamen? Bring es in die richtige Reihenfolge.',
  'play.family': 'Verbinde jeden Propheten mit seinem Platz in der Familie Ibrahims.',
};

const bs: Record<Key, string> = {
  title: 'Radosna vijest',
  description: 'Dočekaj Ibrahimove ugledne goste, čuj radosnu vijest o Ishaku i Jakubu i upoznaj Ibrahimovu porodicu.',
  howTo: 'Nivo 1: pripremi doček. Nivo 2: poredaj kazivanje o gostima. Nivo 3: spoji svakog poslanika s njegovim roditeljima.',
  'play.welcome': 'Dolaze gosti! Pripremi doček ispred šatora.',
  'play.reveal': 'Dobro došli, ugledni gosti!',
  'play.revealCaption': 'Selam – i selam kao odgovor (11:69).',
  'play.story': 'Šta se desilo kad su došli gosti? Poredaj.',
  'play.family': 'Spoji svakog poslanika s njegovim mjestom u Ibrahimovoj porodici.',
};

export const ishaqI18n = defineNamespace('game.ishaq-glad-tidings', { en, de, bs });
