import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'Ark of Nuh',
  description: 'Three events of Nuh’s life: his long call, building the ark and the rescue in the flood – each with its lesson.',
  howTo: 'Level 1: sort what Nuh and his people did. Level 2: build the ark part by part. Level 3: put the flood and the rescue in order.',
  'play.build': 'Drag each part of the ark to its glowing place.',
  'play.reveal': 'The ark is ready!',
  'play.revealCaption': 'Built of planks and nails, as Allah commanded (11:37, 54:13).',
  'play.voyage': 'Put the voyage of the ark in order, from the building to al-Judi.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Die Arche Nuhs',
  description: 'Drei Ereignisse aus Nuhs Leben: sein langer Aufruf, der Bau der Arche und die Rettung in der Flut – jedes mit seiner Lehre.',
  howTo: 'Stufe 1: Sortiere, was Nuh und sein Volk taten. Stufe 2: Baue die Arche Teil für Teil. Stufe 3: Bring die Flut und die Rettung in die richtige Reihenfolge.',
  'play.build': 'Zieh jedes Teil der Arche an seinen leuchtenden Platz.',
  'play.reveal': 'Die Arche ist fertig!',
  'play.revealCaption': 'Aus Planken und Nägeln, wie Allah es befahl (11:37, 54:13).',
  'play.voyage': 'Bring die Fahrt der Arche in die richtige Reihenfolge – vom Bau bis zum Dschudi.',
};

const bs: Record<Key, string> = {
  title: 'Nuhova lađa',
  description: 'Tri događaja iz Nuhova života: dugo pozivanje, gradnja lađe i spas u potopu – svaki sa svojom poukom.',
  howTo: 'Nivo 1: razvrstaj šta su činili Nuh i njegov narod. Nivo 2: gradi lađu dio po dio. Nivo 3: poredaj potop i spas.',
  'play.build': 'Prevuci svaki dio lađe na njegovo svijetleće mjesto.',
  'play.reveal': 'Lađa je gotova!',
  'play.revealCaption': 'Od dasaka i klinova, kako je Allah naredio (11:37, 54:13).',
  'play.voyage': 'Poredaj plovidbu lađe – od gradnje do Džudija.',
};

export const arkI18n = defineNamespace('game.ark-of-nuh', { en, de, bs });
