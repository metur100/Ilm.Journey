import { defineNamespace } from '@/core/i18n';

const en = {
  title: 'The Night Journey',
  description: 'Lut called his people to good and was led out of the town by night. Learn his call and walk the path to the dawn.',
  howTo: 'Level 1: sort what Lut called to and what he warned against. Level 2: trace the path by night. Level 3: collect the good things.',
  'play.sort': 'What did Lut call to – and what did he warn against?',
  'play.path': 'Leave the town by night – trace the path up to the dawn, and keep going forward.',
  'play.catch': 'Collect the good that Lut called to. Let the wrong things pass by.',
} as const;

type Key = keyof typeof en;

const de: Record<Key, string> = {
  title: 'Die Reise in der Nacht',
  description: 'Lut rief sein Volk zum Guten auf und wurde in der Nacht aus der Stadt geführt. Lerne seinen Aufruf und geh den Weg bis zum Morgen.',
  howTo: 'Stufe 1: Sortiere, wozu Lut aufrief und wovor er warnte. Stufe 2: Fahre den Weg in der Nacht nach. Stufe 3: Sammle das Gute.',
  'play.sort': 'Wozu rief Lut auf – und wovor warnte er?',
  'play.path': 'Verlass die Stadt in der Nacht – fahre den Weg bis zum Morgen nach und geh immer vorwärts.',
  'play.catch': 'Sammle das Gute, zu dem Lut aufrief. Lass das Schlechte vorbeiziehen.',
};

const bs: Record<Key, string> = {
  title: 'Noćno putovanje',
  description: 'Lut je pozivao narod dobru i noću je izveden iz grada. Nauči njegov poziv i pređi put do zore.',
  howTo: 'Nivo 1: razvrstaj čemu je Lut pozivao i od čega je opominjao. Nivo 2: prati put kroz noć. Nivo 3: skupljaj dobro.',
  'play.sort': 'Čemu je Lut pozivao – a od čega je opominjao?',
  'play.path': 'Napusti grad noću – prati put do zore i idi samo naprijed.',
  'play.catch': 'Skupljaj dobro kojem je Lut pozivao. Loše pusti da prođe.',
};

export const lutI18n = defineNamespace('game.lut-night-journey', { en, de, bs });
