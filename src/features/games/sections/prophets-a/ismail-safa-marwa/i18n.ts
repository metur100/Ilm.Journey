import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Safa and Marwa',
  description: 'Three events of Ismail’s life: Hajar’s search and the spring of Zamzam, the dream and the great sacrifice, and raising the Kaaba – true to his promise. Each with its lesson.',
  howTo: 'Level 1: trace the seven runs between Safa and Marwa. Level 2: put the story of the sacrifice in order. Level 3: flip the cards and find the pairs.',
  'play.runs': 'Start on Safa. Trace to Marwa and back – seven runs in all.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Safa und Marwa',
  description: 'Drei Ereignisse aus Ismails Leben: Hadschars Suche und die Quelle Zamzam, der Traum und das große Opfer, und der Bau der Kaaba – treu seinem Versprechen. Jedes mit seiner Lehre.',
  howTo: 'Stufe 1: Fahre die sieben Läufe zwischen Safa und Marwa nach. Stufe 2: Bring die Geschichte des Opfers in die richtige Reihenfolge. Stufe 3: Dreh die Karten um und finde die Paare.',
  'play.runs': 'Beginne auf Safa. Fahre nach Marwa und zurück – insgesamt sieben Läufe.',
};

const bs: Record<Key, string> = {
  title: 'Safa i Merva',
  description: 'Tri događaja iz Ismailova života: Hadžerina potraga i izvor Zemzem, san i velika žrtva, te podizanje Kabe – dosljedan u obećanju. Svaki sa svojom poukom.',
  howTo: 'Nivo 1: prati sedam trčanja između Safe i Merve. Nivo 2: poredaj priču o žrtvi. Nivo 3: okreći karte i pronađi parove.',
  'play.runs': 'Počni na Safi. Prati do Merve i nazad – ukupno sedam trčanja.',
};

export const ismailI18n = defineNamespace('game.ismail-safa-marwa', { en, de, bs });
