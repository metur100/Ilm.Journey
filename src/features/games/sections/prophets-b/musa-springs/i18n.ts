import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Musa – River, Sea and Springs',
  description: 'Three events of Musa’s life: the baby on the river, the way through the sea and the twelve springs from the rock – each with its lesson.',
  howTo: 'Level 1: put the story of the baby on the river in order. Level 2: lay the path through the sea. Level 3: draw a line from each camp to the spring with the same colour and shape.',
  'play.prompt': 'Lead every camp to its own spring – same colour, same shape.',
  'play.promptMore': 'More tribes are thirsty – find each one its spring.',
  'play.promptAll': 'All twelve tribes – every one has its own drinking place.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Musa – Fluss, Meer und Quellen',
  description: 'Drei Ereignisse aus Musas Leben: das Baby auf dem Fluss, der Weg durch das Meer und die zwölf Quellen aus dem Felsen – jedes mit seiner Lehre.',
  howTo: 'Stufe 1: Bring die Geschichte vom Baby auf dem Fluss in die richtige Reihenfolge. Stufe 2: Lege den Weg durch das Meer. Stufe 3: Ziehe eine Linie von jedem Lager zur Quelle mit derselben Farbe und Form.',
  'play.prompt': 'Führe jedes Lager zu seiner eigenen Quelle – gleiche Farbe, gleiche Form.',
  'play.promptMore': 'Mehr Stämme haben Durst – finde für jeden seine Quelle.',
  'play.promptAll': 'Alle zwölf Stämme – jeder hat seine eigene Trinkstelle.',
};

const bs: Record<Key, string> = {
  title: 'Musa – rijeka, more i izvori',
  description: 'Tri događaja iz Musaova života: dijete na rijeci, put kroz more i dvanaest izvora iz kamena – svaki sa svojom poukom.',
  howTo: 'Nivo 1: poredaj priču o djetetu na rijeci. Nivo 2: složi put kroz more. Nivo 3: povuci liniju od svakog tabora do izvora iste boje i oblika.',
  'play.prompt': 'Odvedi svaki tabor do njegovog izvora – ista boja, isti oblik.',
  'play.promptMore': 'Još plemena je žedno – nađi svakom njegov izvor.',
  'play.promptAll': 'Svih dvanaest plemena – svako ima svoje pojilo.',
};

export const musaSpringsI18n = defineNamespace('game.musa-springs', { en, de, bs });
