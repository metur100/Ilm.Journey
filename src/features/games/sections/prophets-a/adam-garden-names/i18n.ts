import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Names in the Garden',
  description: 'Three events of Adam’s life: Allah teaches him the names, Iblis refuses out of pride, and the tree and the repentance – each with its lesson.',
  howTo: 'Level 1: connect every picture with its name. Level 2: sort what the angels and Iblis did. Level 3: put the events in the Garden in order.',
  'play.connect': 'Allah taught Adam the names (2:31). Draw a line from each picture to its name.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Namen im Garten',
  description: 'Drei Ereignisse aus Adams Leben: Allah lehrt ihn die Namen, Iblis weigert sich aus Hochmut, und der Baum und die Reue – jedes mit seiner Lehre.',
  howTo: 'Stufe 1: Verbinde jedes Bild mit seinem Namen. Stufe 2: Sortiere, was die Engel und Iblis taten. Stufe 3: Bring die Ereignisse im Garten in die richtige Reihenfolge.',
  'play.connect': 'Allah lehrte Adam die Namen (2:31). Zieh eine Linie von jedem Bild zu seinem Namen.',
};

const bs: Record<Key, string> = {
  title: 'Imena u bašči',
  description: 'Tri događaja iz Ademova života: Allah ga poučava imenima, Iblis iz oholosti odbija, te drvo i pokajanje – svaki sa svojom poukom.',
  howTo: 'Nivo 1: spoji svaku sliku s njenim imenom. Nivo 2: razvrstaj šta su učinili meleki, a šta Iblis. Nivo 3: poredaj događaje u Džennetu.',
  'play.connect': 'Allah je poučio Adema imenima (2:31). Povuci liniju od svake slike do njenog imena.',
};

export const adamNamesI18n = defineNamespace('game.adam-garden-names', { en, de, bs });
