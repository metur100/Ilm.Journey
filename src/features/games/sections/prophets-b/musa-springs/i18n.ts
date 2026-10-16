import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Twelve Springs',
  description: 'In the desert, twelve springs flowed from one rock – and every tribe knew its own. Lead each camp to its spring.',
  howTo: 'Draw a line from each camp to the spring with the same colour and shape (or tap the camp, then its spring).',
  'play.prompt': 'Lead every camp to its own spring – same colour, same shape.',
  'play.promptMore': 'More tribes are thirsty – find each one its spring.',
  'play.promptAll': 'All twelve tribes – every one has its own drinking place.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Zwölf Quellen',
  description: 'In der Wüste flossen zwölf Quellen aus einem Felsen – und jeder Stamm kannte die seine. Führe jedes Lager zu seiner Quelle.',
  howTo: 'Ziehe eine Linie von jedem Lager zur Quelle mit derselben Farbe und Form (oder tippe das Lager und dann seine Quelle an).',
  'play.prompt': 'Führe jedes Lager zu seiner eigenen Quelle – gleiche Farbe, gleiche Form.',
  'play.promptMore': 'Mehr Stämme haben Durst – finde für jeden seine Quelle.',
  'play.promptAll': 'Alle zwölf Stämme – jeder hat seine eigene Trinkstelle.',
};

const bs: Record<Key, string> = {
  title: 'Dvanaest izvora',
  description: 'U pustinji je iz jednog kamena poteklo dvanaest izvora – i svako pleme je znalo svoj. Odvedi svaki tabor do njegovog izvora.',
  howTo: 'Povuci liniju od svakog tabora do izvora iste boje i oblika (ili dodirni tabor, pa njegov izvor).',
  'play.prompt': 'Odvedi svaki tabor do njegovog izvora – ista boja, isti oblik.',
  'play.promptMore': 'Još plemena je žedno – nađi svakom njegov izvor.',
  'play.promptAll': 'Svih dvanaest plemena – svako ima svoje pojilo.',
};

export const musaSpringsI18n = defineNamespace('game.musa-springs', { en, de, bs });
