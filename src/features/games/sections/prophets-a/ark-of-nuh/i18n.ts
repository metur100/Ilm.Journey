import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Ark of Nuh',
  description: 'Build the ark, bring the animals aboard two by two and sail with Nuh to al-Judi.',
  howTo: 'Level 1: build the ark part by part. Level 2: find the animal pairs. Level 3: put the voyage in order.',
  'play.build': 'Drag each part of the ark to its glowing place.',
  'play.reveal': 'The ark is ready!',
  'play.revealCaption': 'Built of planks and nails, as Allah commanded (11:37, 54:13).',
  'play.pairs': 'Flip two cards: a pair of every kind goes aboard (11:40).',
  'play.voyage': 'Put the voyage of the ark in order, from the building to al-Judi.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Die Arche Nuhs',
  description: 'Baue die Arche, bring die Tiere paarweise an Bord und fahre mit Nuh bis zum Dschudi.',
  howTo: 'Stufe 1: Baue die Arche Teil für Teil. Stufe 2: Finde die Tierpaare. Stufe 3: Bring die Fahrt in die richtige Reihenfolge.',
  'play.build': 'Zieh jedes Teil der Arche an seinen leuchtenden Platz.',
  'play.reveal': 'Die Arche ist fertig!',
  'play.revealCaption': 'Aus Planken und Nägeln, wie Allah es befahl (11:37, 54:13).',
  'play.pairs': 'Dreh zwei Karten um: Ein Paar jeder Art geht an Bord (11:40).',
  'play.voyage': 'Bring die Fahrt der Arche in die richtige Reihenfolge – vom Bau bis zum Dschudi.',
};

const bs: Record<Key, string> = {
  title: 'Nuhova lađa',
  description: 'Sagradi lađu, ukrcaj životinje u parovima i plovi s Nuhom do Džudija.',
  howTo: 'Nivo 1: gradi lađu dio po dio. Nivo 2: pronađi parove životinja. Nivo 3: poredaj plovidbu.',
  'play.build': 'Prevuci svaki dio lađe na njegovo svijetleće mjesto.',
  'play.reveal': 'Lađa je gotova!',
  'play.revealCaption': 'Od dasaka i klinova, kako je Allah naredio (11:37, 54:13).',
  'play.pairs': 'Okreni dvije karte: po par od svake vrste ulazi u lađu (11:40).',
  'play.voyage': 'Poredaj plovidbu lađe – od gradnje do Džudija.',
};

export const arkI18n = defineNamespace('game.ark-of-nuh', { en, de, bs });
