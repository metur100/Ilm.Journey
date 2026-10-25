import type { BuildPart, KitItem } from '@/core/games/kit';

import type { Episode } from '../../prophets-story/episode';

import { T } from '../shared';
import { ARK_FACTS } from './facts';

/* Ark of Nuh – L1 the long call (71:5–10, 29:14), L2 building the ark (11:37–38, 54:13), L3 the flood and the rescue (11:40–48). */

/** Parts at their places in `prophet.nuh-shipyard` (same boxes as the composed `prophet.nuh-ark`). */
export const ARK_PARTS: BuildPart[] = [
  {
    id: 'hull',
    art: 'prophet.nuh-hull',
    label: T('Hull', 'Rumpf', 'Trup'),
    slot: { x: 0.2, y: 0.479, w: 0.6, h: 0.279 },
    caption: T('Planks and nails – the ark takes shape (54:13).', 'Planken und Nägel – die Arche nimmt Gestalt an (54:13).', 'Daske i klinovi – lađa dobiva oblik (54:13).'),
  },
  {
    id: 'deck',
    art: 'prophet.nuh-deck',
    label: T('Deck', 'Deck', 'Paluba'),
    slot: { x: 0.18, y: 0.442, w: 0.64, h: 0.058 },
    caption: T('Nuh built it under Allah\'s eyes and inspiration (11:37).', 'Nuh baute sie unter Allahs Augen und nach Seiner Eingebung (11:37).', 'Nuh ju je gradio pred Allahovim očima i po Njegovom nadahnuću (11:37).'),
  },
  {
    id: 'cabin',
    art: 'prophet.nuh-cabin',
    label: T('Cabin', 'Kajüte', 'Kabina'),
    slot: { x: 0.32, y: 0.3, w: 0.36, h: 0.2 },
    caption: T('The leaders passed by and mocked – Nuh kept building (11:38).', 'Die Anführer kamen vorbei und spotteten – Nuh baute weiter (11:38).', 'Glavešine su prolazile i rugale se – Nuh je gradio dalje (11:38).'),
  },
  {
    id: 'roof',
    art: 'prophet.nuh-roof',
    label: T('Roof', 'Dach', 'Krov'),
    slot: { x: 0.28, y: 0.158, w: 0.44, h: 0.158 },
    caption: T('Obeying Allah matters more than what others say.', 'Allah zu gehorchen ist wichtiger als das Gerede anderer.', 'Pokornost Allahu važnija je od onoga što drugi govore.'),
  },
  {
    id: 'ramp',
    art: 'prophet.nuh-ramp',
    label: T('Ramp', 'Rampe', 'Rampa'),
    slot: { x: 0.72, y: 0.6, w: 0.2, h: 0.221 },
    caption: T('Ready for a pair of every kind (11:40).', 'Bereit für ein Paar jeder Art (11:40).', 'Spremna za po par od svake vrste (11:40).'),
  },
];

/** L1 – the long call (71:5–10, 11:27, 29:14): what Nuh did and what his people did. */
export const CALL_EPISODE: Episode = {
  kind: 'sort',
  prompt: T(
    'Nuh called his people for 950 years. Sort: what did Nuh do – and what did his people do?',
    'Nuh rief sein Volk 950 Jahre lang. Sortiere: Was tat Nuh – und was tat sein Volk?',
    'Nuh je svoj narod pozivao 950 godina. Razvrstaj: šta je činio Nuh – a šta njegov narod?',
  ),
  hints: true,
  bins: [
    { id: 'nuh', art: 'object.hourglass', label: T('Nuh', 'Nuh', 'Nuh') },
    { id: 'people', art: 'scene.city', label: T('His people', 'Sein Volk', 'Njegov narod') },
  ],
  items: [
    { id: 'night-day', bin: 'nuh', label: T('Called them by night and by day', 'Rief sie bei Nacht und bei Tag', 'Pozivao ih noću i danju'), sub: '71:5' },
    { id: 'openly', bin: 'nuh', label: T('Called openly and in private', 'Rief offen und im Stillen', 'Pozivao javno i u četiri oka'), sub: '71:8–9' },
    { id: 'forgiveness', bin: 'nuh', label: T('"Ask your Lord for forgiveness"', '„Bittet euren Herrn um Vergebung“', '„Tražite oprost od svog Gospodara“'), sub: '71:10' },
    { id: 'fingers', bin: 'people', label: T('Put their fingers in their ears', 'Steckten die Finger in die Ohren', 'Stavljali prste u uši'), sub: '71:7' },
    { id: 'garments', bin: 'people', label: T('Covered themselves with their clothes', 'Verhüllten sich mit ihren Gewändern', 'Pokrivali se odjećom'), sub: '71:7' },
    { id: 'like-us', bin: 'people', label: T('"You are only a man like us"', '„Du bist nur ein Mensch wie wir“', '„Ti si samo čovjek kao mi“'), sub: '11:27' },
  ],
  factMap: { 'night-day': 'nuh-950-years', openly: 'nuh-950-years', forgiveness: 'nuh-950-years', fingers: 'lesson-sabr', garments: 'lesson-sabr', 'like-us': 'lesson-sabr' },
};

/** The flood and the rescue in order (L3). */
export const VOYAGE: KitItem[] = [
  { id: 'build', art: 'prophet.nuh-planks', label: T('Build the ark', 'Die Arche bauen', 'Graditi lađu'), sub: '11:37' },
  { id: 'pairs', art: 'animal.camel', label: T('Pairs board', 'Paare steigen ein', 'Parovi ulaze'), sub: '11:40' },
  { id: 'bismillah', art: 'prophet.nuh-ark', label: T('"In the name of Allah"', '„Im Namen Allahs“', '„U ime Allaha“'), sub: '11:41' },
  { id: 'waves', art: 'prophet.nuh-flood', label: T('Waves like mountains', 'Wellen wie Berge', 'Valovi kao brda'), sub: '11:42' },
  { id: 'judi', art: 'prophet.nuh-judi', label: T('Rest on al-Judi', 'Ruhe auf dem Dschudi', 'Na Džudiju'), sub: '11:44' },
  { id: 'peace', art: 'garden.sapling', label: T('Go down in peace', 'Hinab in Frieden', 'Siđi u miru'), sub: '11:48' },
];

export const VOYAGE_FACT: Record<string, string> = {
  build: ARK_FACTS.eachKind.id,
  pairs: ARK_FACTS.eachKind.id,
  bismillah: ARK_FACTS.eachKind.id,
  waves: ARK_FACTS.judi.id,
  judi: ARK_FACTS.judi.id,
  peace: ARK_FACTS.trust.id,
};

export const PART_FACT: Record<string, string> = {
  hull: ARK_FACTS.planks.id,
  deck: ARK_FACTS.mocked.id,
  cabin: ARK_FACTS.mocked.id,
  roof: ARK_FACTS.obey.id,
  ramp: ARK_FACTS.obey.id,
};
