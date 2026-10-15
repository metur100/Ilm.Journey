import type { GameApi } from '../../types';
import { GameBoard } from '../board';
import { BuildScene, type BuildPart } from '../engines/BuildScene';
import { ConnectPairs, type ConnectPair } from '../engines/ConnectPairs';
import { MemoryPairs, type MemoryPair } from '../engines/MemoryPairs';
import { SequenceBoard } from '../engines/SequenceBoard';
import { SortBins, type SortBin, type SortItem } from '../engines/SortBins';
import { kitResult } from '../scoring';
import type { KitItem } from '../types';
import { kitDemo, letterFact, T } from './shared';

/* Demo games of the five core engines (dev only). */

const finish = (api: GameApi<unknown>, moves: number) => (info: { mistakes: number }) => api.onComplete(kitResult({ moves, mistakes: info.mistakes }));

// ---------- SortBins ----------

interface SortCfg {
  bins: SortBin[];
  items: SortItem[];
  hints: boolean;
}

const BIN = {
  animals: { id: 'animals', label: T('Animals', 'Tiere', 'Životinje') },
  plants: { id: 'plants', label: T('Plants', 'Pflanzen', 'Biljke') },
  food: { id: 'food', label: T('Food', 'Essen', 'Hrana'), art: 'kit.crate' },
};
const ANIMALS: SortItem[] = [
  { id: 'camel', art: 'animal.camel', label: T('Camel', 'Kamel', 'Deva'), bin: 'animals' },
  { id: 'sheep', art: 'animal.sheep', label: T('Sheep', 'Schaf', 'Ovca'), bin: 'animals' },
  { id: 'bee', art: 'animal.bee', label: T('Bee', 'Biene', 'Pčela'), bin: 'animals' },
  { id: 'hoopoe', art: 'animal.hoopoe', label: T('Hoopoe', 'Wiedehopf', 'Pupavac'), bin: 'animals' },
];
const PLANTS: SortItem[] = [
  { id: 'palm', art: 'garden.palm', label: T('Palm', 'Palme', 'Palma'), bin: 'plants' },
  { id: 'olive', art: 'garden.olive', label: T('Olive tree', 'Olivenbaum', 'Maslina'), bin: 'plants' },
  { id: 'rose', art: 'garden.flower-rose', label: T('Rose', 'Rose', 'Ruža'), bin: 'plants' },
  { id: 'fig', art: 'garden.fig', label: T('Fig tree', 'Feigenbaum', 'Smokva'), bin: 'plants' },
];
const FOOD: SortItem[] = [
  { id: 'dates', art: 'food.dates', label: T('Dates', 'Datteln', 'Hurme'), bin: 'food' },
  { id: 'bread', art: 'food.bread', label: T('Bread', 'Brot', 'Hljeb'), bin: 'food' },
  { id: 'milk', art: 'food.milk', label: T('Milk', 'Milch', 'Mlijeko'), bin: 'food' },
];

function SortDemo(api: GameApi<SortCfg>) {
  const { bins, items, hints } = api.config;
  return (
    <GameBoard api={api}>
      <SortBins bins={bins} items={items} hints={hints} prompt={T('Drag each picture into its basket.', 'Zieh jedes Bild in seinen Korb.', 'Prevuci svaku sliku u njenu korpu.')} onDone={finish(api, items.length)} />
    </GameBoard>
  );
}

export const sortDemo = kitDemo<SortCfg>({
  id: 'kit-sort-bins',
  topicId: 'akhlaq',
  coverArt: 'kit.basket',
  title: T('Kit: Sort Bins', 'Kit: Sortierkörbe', 'Kit: Korpe za sortiranje'),
  description: T('Demo of the SortBins engine.', 'Demo der SortBins-Engine.', 'Demo SortBins mehanike.'),
  howTo: T('Drag every picture into the right basket.', 'Zieh jedes Bild in den richtigen Korb.', 'Prevuci svaku sliku u pravu korpu.'),
  configs: [
    { bins: [BIN.animals, BIN.plants], items: [...ANIMALS.slice(0, 3), ...PLANTS.slice(0, 3)], hints: true },
    { bins: [BIN.animals, BIN.plants], items: [...ANIMALS, ...PLANTS], hints: false },
    { bins: [BIN.animals, BIN.plants, BIN.food], items: [...ANIMALS.slice(0, 3), ...PLANTS.slice(0, 3), ...FOOD], hints: false },
  ],
  component: SortDemo,
  order: 1,
});

// ---------- SequenceBoard ----------

interface SeqCfg {
  variant: 'list' | 'path';
  items: KitItem[];
}

const GROWTH: KitItem[] = [
  { id: 'seed', art: 'garden.seed', label: T('Seed', 'Samen', 'Sjeme') },
  { id: 'sprout', art: 'garden.sprout', label: T('Sprout', 'Keimling', 'Klica') },
  { id: 'sapling', art: 'garden.sapling', label: T('Sapling', 'Setzling', 'Sadnica') },
  { id: 'young', art: 'garden.date-palm-young', label: T('Young palm', 'Junge Palme', 'Mlada palma') },
  { id: 'palm', art: 'garden.palm', label: T('Palm tree', 'Palme', 'Palma') },
];
const NUMBERS: KitItem[] = ['١', '٢', '٣', '٤', '٥', '٦'].map((arabic, i) => ({ id: `n${i + 1}`, arabic, sub: String(i + 1) }));
const DAY: KitItem[] = [
  { id: 'dawn', art: 'sky.dawn', label: T('Dawn', 'Morgendämmerung', 'Zora') },
  { id: 'noon', art: 'sky.noon', label: T('Noon', 'Mittag', 'Podne') },
  { id: 'afternoon', art: 'sky.afternoon', label: T('Afternoon', 'Nachmittag', 'Popodne') },
  { id: 'sunset', art: 'sky.sunset', label: T('Sunset', 'Sonnenuntergang', 'Zalazak sunca') },
  { id: 'night', art: 'sky.night', label: T('Night', 'Nacht', 'Noć') },
];

function SeqDemo(api: GameApi<SeqCfg>) {
  const { variant, items } = api.config;
  return (
    <GameBoard api={api}>
      <SequenceBoard variant={variant} items={items} prompt={T('Put them in order.', 'Bring sie in die richtige Reihenfolge.', 'Poredaj ih pravilnim redom.')} onDone={finish(api, items.length)} />
    </GameBoard>
  );
}

export const sequenceDemo = kitDemo<SeqCfg>({
  id: 'kit-sequence-board',
  topicId: 'salah',
  coverArt: 'kit.steps',
  title: T('Kit: Sequence Board', 'Kit: Reihenfolge', 'Kit: Redoslijed'),
  description: T('Demo of the SequenceBoard engine (list and path).', 'Demo der SequenceBoard-Engine (Liste und Pfad).', 'Demo SequenceBoard mehanike (lista i staza).'),
  howTo: T('Drag the cards into the right order.', 'Zieh die Karten in die richtige Reihenfolge.', 'Prevuci kartice pravilnim redom.'),
  configs: [
    { variant: 'list', items: DAY },
    { variant: 'path', items: GROWTH },
    { variant: 'list', items: NUMBERS },
  ],
  component: SeqDemo,
  order: 2,
});

// ---------- MemoryPairs ----------

interface MemoryCfg {
  pairs: MemoryPair[];
  peekMs?: number;
}

const LETTERS = [
  { id: 'alif', arabic: 'ا', name: T('Alif', 'Alif', 'Elif') },
  { id: 'ba', arabic: 'ب', name: T('Ba', 'Ba', 'Ba') },
  { id: 'ta', arabic: 'ت', name: T('Ta', 'Ta', 'Ta') },
  { id: 'tha', arabic: 'ث', name: T('Tha', 'Tha', 'Sa') },
  { id: 'jim', arabic: 'ج', name: T('Jim', 'Dschim', 'Džim') },
  { id: 'ha', arabic: 'ح', name: T('Ha', 'Ha', 'Ha') },
];

function MemoryDemo(api: GameApi<MemoryCfg>) {
  const { pairs, peekMs } = api.config;
  return (
    <GameBoard api={api}>
      <MemoryPairs pairs={pairs} peekMs={peekMs} onDone={finish(api, pairs.length)} />
    </GameBoard>
  );
}

const ALPHABET_FACTS = [
  [letterFact('alif-first', T('Alif (ا) is the first letter of the Arabic alphabet.', 'Alif (ا) ist der erste Buchstabe des arabischen Alphabets.', 'Elif (ا) je prvi harf arapskog pisma.'))],
  [letterFact('ba-dot', T('Ba (ب) has one dot below.', 'Ba (ب) hat einen Punkt unten.', 'Ba (ب) ima jednu tačku ispod.'))],
  [letterFact('rtl', T('Arabic is written from right to left.', 'Arabisch wird von rechts nach links geschrieben.', 'Arapski se piše s desna na lijevo.'))],
] as [ReturnType<typeof letterFact>[], ReturnType<typeof letterFact>[], ReturnType<typeof letterFact>[]];

export const memoryDemo = kitDemo<MemoryCfg>({
  id: 'kit-memory-pairs',
  topicId: 'arabic',
  coverArt: 'kit.cards',
  title: T('Kit: Memory Pairs', 'Kit: Memory', 'Kit: Memorija'),
  description: T('Demo of the MemoryPairs engine.', 'Demo der MemoryPairs-Engine.', 'Demo MemoryPairs mehanike.'),
  howTo: T('Flip two cards. Find the pairs.', 'Dreh zwei Karten um. Finde die Paare.', 'Okreni dvije karte. Pronađi parove.'),
  configs: [
    { pairs: ['animal.camel', 'animal.dove', 'garden.palm'].map((art, i) => ({ id: `p${i}`, a: { art } })), peekMs: 1800 },
    { pairs: LETTERS.slice(0, 4).map((x) => ({ id: x.id, a: { arabic: x.arabic }, b: { label: x.name } })) },
    { pairs: LETTERS.map((x) => ({ id: x.id, a: { arabic: x.arabic }, b: { label: x.name } })) },
  ],
  component: MemoryDemo,
  facts: ALPHABET_FACTS,
  order: 3,
});

// ---------- ConnectPairs ----------

interface ConnectCfg {
  pairs: ConnectPair[];
}

function ConnectDemo(api: GameApi<ConnectCfg>) {
  const { pairs } = api.config;
  return (
    <GameBoard api={api}>
      <ConnectPairs pairs={pairs} prompt={T('Draw a line from each item to its partner.', 'Zieh eine Linie von jedem Teil zu seinem Partner.', 'Povuci liniju od svake stavke do njenog para.')} onDone={finish(api, pairs.length)} />
    </GameBoard>
  );
}

export const connectDemo = kitDemo<ConnectCfg>({
  id: 'kit-connect-pairs',
  topicId: 'quran',
  coverArt: 'kit.connect',
  title: T('Kit: Connect Pairs', 'Kit: Verbinden', 'Kit: Spajanje'),
  description: T('Demo of the ConnectPairs engine.', 'Demo der ConnectPairs-Engine.', 'Demo ConnectPairs mehanike.'),
  howTo: T('Draw a line between the things that belong together.', 'Verbinde, was zusammengehört.', 'Spoji ono što pripada jedno drugom.'),
  configs: [
    { pairs: ANIMALS.map((a) => ({ id: a.id, left: { art: a.art }, right: { label: a.label } })) },
    { pairs: LETTERS.slice(0, 5).map((x) => ({ id: x.id, left: { arabic: x.arabic }, right: { label: x.name } })) },
    { pairs: [...PLANTS.slice(0, 3), ...FOOD.slice(0, 3)].map((a) => ({ id: a.id, left: { label: a.label }, right: { art: a.art } })) },
  ],
  component: ConnectDemo,
  order: 4,
});

// ---------- BuildScene ----------

interface BuildCfg {
  ordered: boolean;
  ghosts: boolean;
}

const OASIS: BuildPart[] = [
  { id: 'masjid', art: 'garden.masjid-small', label: T('Masjid', 'Moschee', 'Džamija'), slot: { x: 0.3, y: 0.3, w: 0.4, h: 0.45 }, caption: T('The masjid stands in the middle.', 'Die Moschee steht in der Mitte.', 'Džamija stoji u sredini.') },
  { id: 'minaret', art: 'garden.minaret', label: T('Minaret', 'Minarett', 'Munara'), slot: { x: 0.7, y: 0.12, w: 0.1, h: 0.63 } },
  { id: 'palm-left', art: 'garden.palm', label: T('Palm', 'Palme', 'Palma'), slot: { x: 0.04, y: 0.25, w: 0.24, h: 0.5 } },
  { id: 'fountain', art: 'garden.fountain', label: T('Fountain', 'Brunnen', 'Šadrvan'), slot: { x: 0.38, y: 0.72, w: 0.24, h: 0.26 } },
  { id: 'olive', art: 'garden.olive', label: T('Olive tree', 'Olivenbaum', 'Maslina'), slot: { x: 0.8, y: 0.45, w: 0.18, h: 0.38 } },
];

function BuildDemo(api: GameApi<BuildCfg>) {
  const { ordered, ghosts } = api.config;
  return (
    <GameBoard api={api}>
      <BuildScene
        scene="scene.desert"
        parts={OASIS}
        ordered={ordered}
        ghosts={ghosts}
        prompt={T('Drag the parts into the picture.', 'Zieh die Teile ins Bild.', 'Prevuci dijelove u sliku.')}
        reveal={{ title: T('The oasis is ready!', 'Die Oase ist fertig!', 'Oaza je gotova!') }}
        onDone={finish(api, OASIS.length)}
      />
    </GameBoard>
  );
}

export const buildDemo = kitDemo<BuildCfg>({
  id: 'kit-build-scene',
  topicId: 'seerah',
  coverArt: 'kit.blocks',
  title: T('Kit: Build Scene', 'Kit: Bauszene', 'Kit: Gradnja scene'),
  description: T('Demo of the BuildScene engine.', 'Demo der BuildScene-Engine.', 'Demo BuildScene mehanike.'),
  howTo: T('Drag each part onto its place – the picture grows.', 'Zieh jedes Teil an seinen Platz – das Bild wächst.', 'Prevuci svaki dio na njegovo mjesto – slika raste.'),
  configs: [
    { ordered: false, ghosts: true },
    { ordered: true, ghosts: true },
    { ordered: false, ghosts: false },
  ],
  component: BuildDemo,
  order: 5,
});
