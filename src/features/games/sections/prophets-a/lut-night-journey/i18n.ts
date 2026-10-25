import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'The Night Journey',
  description: 'Three parts of Lut’s story: his call to his people, protecting his guests, and leaving the town by night – each with its lesson.',
  howTo: 'Level 1: sort what Lut called to and what he warned against. Level 2: put the story of the guests in order. Level 3: find the path by night.',
  'play.sort': 'What did Lut call to – and what did he warn against?',
  'play.path': 'Leave the town by night – find the path up to the dawn, and keep going forward.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Die Reise in der Nacht',
  description: 'Drei Teile von Luts Geschichte: sein Aufruf an sein Volk, der Schutz seiner Gäste und der Aufbruch aus der Stadt in der Nacht – jeder mit seiner Lehre.',
  howTo: 'Stufe 1: Sortiere, wozu Lut aufrief und wovor er warnte. Stufe 2: Bring die Geschichte der Gäste in die richtige Reihenfolge. Stufe 3: Finde den Weg in der Nacht.',
  'play.sort': 'Wozu rief Lut auf – und wovor warnte er?',
  'play.path': 'Verlass die Stadt in der Nacht – finde den Weg bis zum Morgen und geh immer vorwärts.',
};

const bs: Record<Key, string> = {
  title: 'Noćno putovanje',
  description: 'Tri dijela Lutove priče: njegov poziv narodu, zaštita gostiju i odlazak iz grada noću – svaki sa svojom poukom.',
  howTo: 'Nivo 1: razvrstaj čemu je Lut pozivao i od čega je opominjao. Nivo 2: poredaj priču o gostima. Nivo 3: pronađi put kroz noć.',
  'play.sort': 'Čemu je Lut pozivao – a od čega je opominjao?',
  'play.path': 'Napusti grad noću – pronađi put do zore i idi samo naprijed.',
};

export const lutI18n = defineNamespace('game.lut-night-journey', { en, de, bs });
