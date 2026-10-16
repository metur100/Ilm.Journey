import type { BuildPart, KitItem, MemoryPair } from '@/core/games/kit';

import { T } from '../shared';
import { ARK_FACTS } from './facts';

/* Ark of Nuh – build the ark (11:37, 54:13), the pairs of every kind (11:40), the voyage to al-Judi (11:41–48). */

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

/** Clearly different land animals and birds of the art library (no dove: the Quran's account has none). */
const ANIMALS: [string, ReturnType<typeof T>][] = [
  ['camel', T('Camels', 'Kamele', 'Deve')],
  ['sheep', T('Sheep', 'Schafe', 'Ovce')],
  ['horse', T('Horses', 'Pferde', 'Konji')],
  ['cow', T('Cows', 'Kühe', 'Krave')],
  ['lion', T('Lions', 'Löwen', 'Lavovi')],
  ['elephant', T('Elephants', 'Elefanten', 'Slonovi')],
  ['goat', T('Goats', 'Ziegen', 'Koze')],
  ['hoopoe', T('Hoopoes', 'Wiedehopfe', 'Pupavci')],
];

export const ANIMAL_PAIRS: MemoryPair[] = ANIMALS.slice(0, 6).map(([id, name]) => ({
  id,
  a: { art: `animal.${id}`, a11y: name },
  caption: T(`Two of a kind: ${name.en} – aboard!`, `Ein Paar: ${name.de} – an Bord!`, `Par: ${name.bs} – u lađu!`),
}));

export const ANIMAL_ART = ANIMALS.map(([id]) => `animal.${id}`);

/** The voyage in order (L3). */
export const VOYAGE: KitItem[] = [
  { id: 'build', art: 'prophet.nuh-planks', label: T('Build the ark', 'Die Arche bauen', 'Graditi lađu'), sub: '11:37' },
  { id: 'pairs', art: 'animal.camel', label: T('Pairs board', 'Paare steigen ein', 'Parovi ulaze'), sub: '11:40' },
  { id: 'bismillah', art: 'prophet.nuh-ark', label: T('"In the name of Allah"', '„Im Namen Allahs“', '„U ime Allaha“'), sub: '11:41' },
  { id: 'waves', art: 'prophet.nuh-flood', label: T('Waves like mountains', 'Wellen wie Berge', 'Valovi kao brda'), sub: '11:42' },
  { id: 'judi', art: 'prophet.nuh-judi', label: T('Rest on al-Judi', 'Ruhe auf dem Dschudi', 'Na Džudiju'), sub: '11:44' },
  { id: 'peace', art: 'garden.sapling', label: T('Go down in peace', 'Hinab in Frieden', 'Siđi u miru'), sub: '11:48' },
];

export const VOYAGE_FACT: Record<string, string> = {
  build: ARK_FACTS.command.id,
  pairs: ARK_FACTS.eachKind.id,
  bismillah: ARK_FACTS.bismillah.id,
  waves: ARK_FACTS.judi.id,
  judi: ARK_FACTS.judi.id,
  peace: ARK_FACTS.judi.id,
};

export const PART_FACT: Record<string, string> = {
  hull: ARK_FACTS.planks.id,
  deck: ARK_FACTS.command.id,
  cabin: ARK_FACTS.mocked.id,
  roof: ARK_FACTS.mocked.id,
  ramp: ARK_FACTS.command.id,
};
