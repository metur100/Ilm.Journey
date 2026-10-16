import type { GameApi } from '../../types';
import { GameBoard } from '../board';
import { BalanceScale, type ScaleWeight } from '../engines/BalanceScale';
import { CatchGame, type CatchItem } from '../engines/CatchGame';
import { JigsawReveal } from '../engines/JigsawReveal';
import { LetterJoin, type JoinWord } from '../engines/LetterJoin';
import { PathTrace, type PathStop } from '../engines/PathTrace';
import { PourFill, type PourVessel } from '../engines/PourFill';
import { type SceneSpot, TapScene } from '../engines/TapScene';
import { TimelineSlider, type TimelineEvent, type TimelineMark } from '../engines/TimelineSlider';
import { TraceShape, type TraceShapeDef } from '../engines/TraceShape';
import { WordTiles } from '../engines/WordTiles';
import { kitResult } from '../scoring';
import type { KitItem } from '../types';
import { kitDemo, letterFact, T } from './shared';

/* Demo games of the other ten engines (dev only). */

const finish = (api: GameApi<unknown>, moves: number) => (info: { mistakes: number }) => api.onComplete(kitResult({ moves, mistakes: info.mistakes }));
const desc = (engine: string) => T(`Demo of the ${engine} engine.`, `Demo der ${engine}-Engine.`, `Demo ${engine} mehanike.`);

const LETTER_FACTS = [
  [letterFact('rtl-join', T('Arabic is written from right to left.', 'Arabisch wird von rechts nach links geschrieben.', 'Arapski se piše s desna na lijevo.'))],
  [letterFact('letters-join', T('Most Arabic letters join the letter that follows them.', 'Die meisten arabischen Buchstaben verbinden sich mit dem folgenden Buchstaben.', 'Većina arapskih harfova spaja se sa harfom koji slijedi.'))],
  [letterFact('alif-no-join', T('Alif (ا) does not join the letter after it.', 'Alif (ا) verbindet sich nicht mit dem folgenden Buchstaben.', 'Elif (ا) se ne spaja sa harfom poslije njega.'))],
] as [ReturnType<typeof letterFact>[], ReturnType<typeof letterFact>[], ReturnType<typeof letterFact>[]];

// ---------- CatchGame ----------

interface CatchCfg {
  goal: number;
  lanes: 3 | 4;
  speed: 'calm' | 'normal';
}
const FOODS: CatchItem[] = [
  { id: 'dates', art: 'food.dates', label: T('Dates', 'Datteln', 'Hurme'), good: true },
  { id: 'water', art: 'food.water', label: T('Water', 'Wasser', 'Voda'), good: true },
  { id: 'milk', art: 'food.milk', label: T('Milk', 'Milch', 'Mlijeko'), good: true },
  { id: 'bread', art: 'food.bread', label: T('Bread', 'Brot', 'Hljeb'), good: true },
  { id: 'key', art: 'object.key', label: T('Key', 'Schlüssel', 'Ključ'), good: false },
  { id: 'compass', art: 'object.compass', label: T('Compass', 'Kompass', 'Kompas'), good: false },
];
function CatchDemo(api: GameApi<CatchCfg>) {
  return (
    <GameBoard api={api}>
      <CatchGame items={FOODS} goal={api.config.goal} lanes={api.config.lanes} speed={api.config.speed} sky="sky.sunset" prompt={T('Catch the food for the iftar table.', 'Fang das Essen für den Iftar-Tisch.', 'Uhvati hranu za iftarsku sofru.')} onDone={finish(api, api.config.goal)} />
    </GameBoard>
  );
}
export const catchDemo = kitDemo<CatchCfg>({
  id: 'kit-catch-game',
  topicId: 'ramadan',
  coverArt: 'kit.catch',
  title: T('Kit: Catch', 'Kit: Fangen', 'Kit: Hvatanje'),
  description: desc('CatchGame'),
  howTo: T('Move the basket under the right things.', 'Schieb den Korb unter die richtigen Dinge.', 'Pomjeraj korpu ispod pravih stvari.'),
  configs: [
    { goal: 4, lanes: 3, speed: 'calm' },
    { goal: 6, lanes: 3, speed: 'calm' },
    { goal: 8, lanes: 4, speed: 'normal' },
  ],
  component: CatchDemo,
  order: 6,
});

// ---------- TapScene ----------

interface TapCfg {
  ordered: boolean;
  distractors: boolean;
}
const SPOTS: SceneSpot[] = [
  { id: 'camel', spotArt: 'animal.camel', label: T('Camel', 'Kamel', 'Deva'), at: { x: 0.06, y: 0.5, w: 0.26, h: 0.36 } },
  { id: 'dove', spotArt: 'animal.dove', label: T('Dove', 'Taube', 'Golub'), at: { x: 0.62, y: 0.08, w: 0.14, h: 0.2 } },
  { id: 'palm', spotArt: 'garden.palm', label: T('Palm', 'Palme', 'Palma'), at: { x: 0.78, y: 0.3, w: 0.2, h: 0.5 } },
  { id: 'well', spotArt: 'object.well', label: T('Well', 'Brunnen', 'Bunar'), at: { x: 0.42, y: 0.6, w: 0.18, h: 0.3 } },
];
const DISTRACTORS: SceneSpot[] = [
  { id: 'rock', spotArt: 'garden.rock', label: T('Rock', 'Stein', 'Kamen'), at: { x: 0.3, y: 0.72, w: 0.12, h: 0.18 }, target: false },
  { id: 'tent', spotArt: 'object.tent', label: T('Tent', 'Zelt', 'Šator'), at: { x: 0.6, y: 0.48, w: 0.18, h: 0.24 }, target: false },
];
function TapDemo(api: GameApi<TapCfg>) {
  const spots = api.config.distractors ? [...SPOTS, ...DISTRACTORS] : SPOTS;
  return (
    <GameBoard api={api}>
      <TapScene scene="scene.desert" spots={spots} ordered={api.config.ordered} prompt={api.config.ordered ? undefined : T('Find everything in the picture.', 'Finde alles im Bild.', 'Pronađi sve na slici.')} onDone={finish(api, SPOTS.length)} />
    </GameBoard>
  );
}
export const tapDemo = kitDemo<TapCfg>({
  id: 'kit-tap-scene',
  topicId: 'prophets',
  coverArt: 'kit.magnifier',
  title: T('Kit: Find in the Scene', 'Kit: Im Bild finden', 'Kit: Pronađi na slici'),
  description: desc('TapScene'),
  howTo: T('Tap the things you are asked to find.', 'Tippe auf die gesuchten Dinge.', 'Dodirni stvari koje tražiš.'),
  configs: [
    { ordered: false, distractors: false },
    { ordered: true, distractors: false },
    { ordered: true, distractors: true },
  ],
  component: TapDemo,
  order: 7,
});

// ---------- JigsawReveal ----------

interface JigsawCfg {
  art: string;
  rows: number;
  cols: number;
  mode: 'place' | 'swap';
}
function JigsawDemo(api: GameApi<JigsawCfg>) {
  const { art, rows, cols, mode } = api.config;
  return (
    <GameBoard api={api}>
      <JigsawReveal art={art} rows={rows} cols={cols} mode={mode} reveal={{ title: T('The picture is complete!', 'Das Bild ist fertig!', 'Slika je gotova!') }} onDone={finish(api, rows * cols)} />
    </GameBoard>
  );
}
export const jigsawDemo = kitDemo<JigsawCfg>({
  id: 'kit-jigsaw-reveal',
  topicId: 'history',
  coverArt: 'kit.puzzle',
  title: T('Kit: Picture Puzzle', 'Kit: Bilderpuzzle', 'Kit: Slagalica'),
  description: desc('JigsawReveal'),
  howTo: T('Put the pieces together to see the picture.', 'Setz die Teile zusammen, um das Bild zu sehen.', 'Složi dijelove da vidiš sliku.'),
  configs: [
    { art: 'place.masjid-nabawi', rows: 2, cols: 2, mode: 'place' },
    { art: 'scene.desert', rows: 3, cols: 3, mode: 'place' },
    { art: 'place.masjid-aqsa', rows: 3, cols: 3, mode: 'swap' },
  ],
  component: JigsawDemo,
  order: 8,
});

// ---------- PathTrace ----------

interface PathCfg {
  stops: PathStop[];
  showRoute: boolean;
}
const ROUTE: PathStop[] = [
  { id: 'tent', art: 'object.tent', label: T('Tent', 'Zelt', 'Šator'), at: { x: 0.12, y: 0.78 } },
  { id: 'well', art: 'object.well', label: T('Well', 'Brunnen', 'Bunar'), at: { x: 0.38, y: 0.55 }, caption: T('Water for the journey.', 'Wasser für die Reise.', 'Voda za put.') },
  { id: 'palm', art: 'garden.palm', label: T('Palms', 'Palmen', 'Palme'), at: { x: 0.62, y: 0.72 } },
  { id: 'oasis', art: 'place.oasis', label: T('Oasis', 'Oase', 'Oaza'), at: { x: 0.86, y: 0.35 } },
];
function PathDemo(api: GameApi<PathCfg>) {
  return (
    <GameBoard api={api}>
      <PathTrace map="scene.desert" stops={api.config.stops} showRoute={api.config.showRoute} prompt={T('Trace the way from stop to stop.', 'Fahr den Weg von Station zu Station nach.', 'Prati put od stanice do stanice.')} onDone={finish(api, api.config.stops.length - 1)} />
    </GameBoard>
  );
}
export const pathDemo = kitDemo<PathCfg>({
  id: 'kit-path-trace',
  topicId: 'seerah',
  coverArt: 'kit.route',
  title: T('Kit: Trace the Route', 'Kit: Route nachfahren', 'Kit: Prati put'),
  description: desc('PathTrace'),
  howTo: T('Draw the route with your finger.', 'Zeichne die Route mit dem Finger.', 'Nacrtaj put prstom.'),
  configs: [
    { stops: ROUTE.slice(0, 3), showRoute: true },
    { stops: ROUTE, showRoute: true },
    { stops: ROUTE, showRoute: false },
  ],
  component: PathDemo,
  order: 9,
});

// ---------- WordTiles ----------

interface WordCfg {
  target: KitItem[];
  distractors: KitItem[];
  joiner: string;
}
const letters = (s: string[], prefix: string): KitItem[] => s.map((arabic, i) => ({ id: `${prefix}${i}`, arabic }));
function WordDemo(api: GameApi<WordCfg>) {
  const { target, distractors, joiner } = api.config;
  return (
    <GameBoard api={api}>
      <WordTiles target={target} distractors={distractors} joiner={joiner} prompt={T('Build it from right to left.', 'Bau es von rechts nach links.', 'Složi s desna na lijevo.')} onDone={finish(api, target.length)} />
    </GameBoard>
  );
}
export const wordDemo = kitDemo<WordCfg>({
  id: 'kit-word-tiles',
  topicId: 'arabic',
  coverArt: 'kit.tiles',
  title: T('Kit: Word Tiles', 'Kit: Wortkacheln', 'Kit: Pločice riječi'),
  description: desc('WordTiles'),
  howTo: T('Tap or drag the tiles into the right places.', 'Tippe oder zieh die Kacheln an die richtigen Plätze.', 'Dodirni ili prevuci pločice na prava mjesta.'),
  configs: [
    { target: letters(['ك', 'ت', 'ب'], 'k'), distractors: [], joiner: '' },
    { target: letters(['ق', 'ل', 'م'], 'q'), distractors: letters(['ف', 'ن'], 'x'), joiner: '' },
    { target: [{ id: 'sabah', arabic: 'صَبَاحُ' }, { id: 'khayr', arabic: 'الْخَيْرِ' }], distractors: [{ id: 'masa', arabic: 'مَسَاءُ' }], joiner: ' ' },
  ],
  component: WordDemo,
  facts: LETTER_FACTS,
  order: 10,
});

// ---------- LetterJoin ----------

interface JoinCfg {
  words: JoinWord[];
  extra: string[];
}
const WORDS: JoinWord[] = [
  { id: 'bab', letters: ['ب', 'ا', 'ب'], meaning: T('bāb – door', 'bāb – Tür', 'bab – vrata') },
  { id: 'qalam', letters: ['ق', 'ل', 'م'], meaning: T('qalam – pen', 'qalam – Stift', 'kalem – pero') },
  { id: 'kitab', letters: ['ك', 'ت', 'ا', 'ب'], meaning: T('kitāb – book', 'kitāb – Buch', 'kitab – knjiga') },
  { id: 'bayt', letters: ['ب', 'ي', 'ت'], meaning: T('bayt – house', 'bayt – Haus', 'bejt – kuća') },
];
function JoinDemo(api: GameApi<JoinCfg>) {
  const n = api.config.words.reduce((s, w) => s + w.letters.length, 0);
  return (
    <GameBoard api={api}>
      <LetterJoin words={api.config.words} extraLetters={api.config.extra} prompt={T('Join the letters from right to left.', 'Verbinde die Buchstaben von rechts nach links.', 'Spoji harfove s desna na lijevo.')} onDone={finish(api, n)} />
    </GameBoard>
  );
}
export const joinDemo = kitDemo<JoinCfg>({
  id: 'kit-letter-join',
  topicId: 'arabic',
  coverArt: 'kit.join',
  title: T('Kit: Join the Letters', 'Kit: Buchstaben verbinden', 'Kit: Spajanje harfova'),
  description: desc('LetterJoin'),
  howTo: T('Put the letters in place and watch the word join.', 'Leg die Buchstaben an ihren Platz und sieh, wie sich das Wort verbindet.', 'Postavi harfove i gledaj kako se riječ spaja.'),
  configs: [
    { words: WORDS.slice(0, 1), extra: [] },
    { words: WORDS.slice(1, 3), extra: [] },
    { words: WORDS.slice(2), extra: ['ج'] },
  ],
  component: JoinDemo,
  facts: LETTER_FACTS,
  order: 11,
});

// ---------- TraceShape ----------

interface TraceCfg {
  shapes: TraceShapeDef[];
}
const SHAPES: TraceShapeDef[] = [
  { id: 'line', label: T('A straight line', 'Eine gerade Linie', 'Ravna linija'), strokes: ['M20 50 L80 50'] },
  { id: 'wave', label: T('A wave', 'Eine Welle', 'Talas'), strokes: ['M14 56 C30 30 40 30 50 50 C60 70 70 70 86 44'] },
  { id: 'ba', label: T('The letter Ba', 'Der Buchstabe Ba', 'Harf ba'), glyph: 'ب', strokes: ['M84 40 C86 62 72 66 50 66 C30 66 16 64 16 44', 'M46 82 L54 82'] },
  { id: 'alif', label: T('The letter Alif', 'Der Buchstabe Alif', 'Harf elif'), glyph: 'ا', strokes: ['M52 14 L50 84'] },
  { id: 'lam', label: T('The letter Lam', 'Der Buchstabe Lam', 'Harf lam'), glyph: 'ل' },
];
function TraceDemo(api: GameApi<TraceCfg>) {
  return (
    <GameBoard api={api}>
      <TraceShape shapes={api.config.shapes} prompt={T('Start at the green dot and follow the arrow.', 'Beginne am grünen Punkt und folge dem Pfeil.', 'Počni na zelenoj tački i prati strelicu.')} onDone={finish(api, api.config.shapes.length)} />
    </GameBoard>
  );
}
export const traceDemo = kitDemo<TraceCfg>({
  id: 'kit-trace-shape',
  topicId: 'arabic',
  coverArt: 'kit.trace',
  title: T('Kit: Trace', 'Kit: Nachfahren', 'Kit: Pisanje'),
  description: desc('TraceShape'),
  howTo: T('Trace the shape with your finger.', 'Fahr die Form mit dem Finger nach.', 'Prati oblik prstom.'),
  configs: [{ shapes: SHAPES.slice(0, 2) }, { shapes: SHAPES.slice(2, 4) }, { shapes: SHAPES.slice(3) }],
  component: TraceDemo,
  facts: LETTER_FACTS,
  order: 12,
});

// ---------- BalanceScale ----------

interface ScaleCfg {
  left: ScaleWeight[];
  weights: ScaleWeight[];
}
const kg = (n: number, id: string): ScaleWeight => ({ id, weight: n, art: 'object.coins', label: `${n} kg` });
const sack = (n: number, id = 'sack'): ScaleWeight => ({ id, weight: n, art: 'object.grain-sack', label: `${n} kg` });
function ScaleDemo(api: GameApi<ScaleCfg>) {
  return (
    <GameBoard api={api}>
      <BalanceScale left={api.config.left} weights={api.config.weights} prompt={T('Make both sides equal.', 'Mach beide Seiten gleich schwer.', 'Izjednači obje strane.')} onDone={finish(api, 1)} />
    </GameBoard>
  );
}
export const scaleDemo = kitDemo<ScaleCfg>({
  id: 'kit-balance-scale',
  topicId: 'prophets',
  coverArt: 'kit.balance',
  title: T('Kit: Balance', 'Kit: Waage', 'Kit: Vaga'),
  description: desc('BalanceScale'),
  howTo: T('Put weights on the right pan until the beam is level.', 'Leg Gewichte auf die rechte Schale, bis der Balken gerade ist.', 'Stavljaj tegove na desni tas dok greda ne bude ravna.'),
  configs: [
    { left: [sack(3)], weights: [kg(1, 'a'), kg(2, 'b'), kg(4, 'c')] },
    { left: [sack(7)], weights: [kg(1, 'a'), kg(2, 'b'), kg(3, 'c'), kg(5, 'd')] },
    { left: [sack(6), sack(3, 'sack2')], weights: [kg(1, 'a'), kg(2, 'b'), kg(4, 'c'), kg(5, 'd'), kg(7, 'e')] },
  ],
  component: ScaleDemo,
  order: 13,
});

// ---------- TimelineSlider ----------

interface TimelineCfg {
  marks: TimelineMark[];
  events: TimelineEvent[];
}
const TIMES: TimelineMark[] = [
  { id: 'dawn', label: T('Dawn', 'Morgen', 'Zora') },
  { id: 'noon', label: T('Noon', 'Mittag', 'Podne') },
  { id: 'afternoon', label: T('Afternoon', 'Nachmittag', 'Popodne') },
  { id: 'sunset', label: T('Sunset', 'Abend', 'Zalazak') },
  { id: 'night', label: T('Night', 'Nacht', 'Noć') },
];
const SKIES: TimelineEvent[] = TIMES.map((m) => ({ id: `sky-${m.id}`, art: `sky.${m.id}`, label: T('When is this sky?', 'Wann ist dieser Himmel?', 'Kada je ovo nebo?'), mark: m.id }));
const GROW_MARKS: TimelineMark[] = ['1', '2', '3', '4', '5'].map((n) => ({ id: `g${n}`, label: n }));
const GROW_EVENTS: TimelineEvent[] = [
  { id: 'seed', art: 'garden.seed', label: T('Seed', 'Samen', 'Sjeme'), mark: 'g1' },
  { id: 'sprout', art: 'garden.sprout', label: T('Sprout', 'Keimling', 'Klica'), mark: 'g2' },
  { id: 'sapling', art: 'garden.sapling', label: T('Sapling', 'Setzling', 'Sadnica'), mark: 'g3' },
  { id: 'palm', art: 'garden.palm', label: T('Palm tree', 'Palme', 'Palma'), mark: 'g5' },
];
function TimelineDemo(api: GameApi<TimelineCfg>) {
  return (
    <GameBoard api={api}>
      <TimelineSlider marks={api.config.marks} events={api.config.events} onDone={finish(api, api.config.events.length)} />
    </GameBoard>
  );
}
export const timelineDemo = kitDemo<TimelineCfg>({
  id: 'kit-timeline-slider',
  topicId: 'history',
  coverArt: 'kit.timeline',
  title: T('Kit: Timeline', 'Kit: Zeitleiste', 'Kit: Vremenska linija'),
  description: desc('TimelineSlider'),
  howTo: T('Slide the marker to the right time and place the card.', 'Schieb die Markierung zur richtigen Zeit und leg die Karte ab.', 'Pomjeri oznaku na pravo vrijeme i postavi karticu.'),
  configs: [
    { marks: TIMES, events: [SKIES[0], SKIES[3]] },
    { marks: TIMES, events: [SKIES[1], SKIES[4], SKIES[2]] },
    { marks: GROW_MARKS, events: GROW_EVENTS },
  ],
  component: TimelineDemo,
  order: 14,
});

// ---------- PourFill ----------

interface PourCfg {
  vessels: PourVessel[];
  liquid: 'water' | 'milk' | 'grain';
}
const HALF = T('Half full', 'Halb voll', 'Do pola');
function PourDemo(api: GameApi<PourCfg>) {
  return (
    <GameBoard api={api}>
      <PourFill vessels={api.config.vessels} liquid={api.config.liquid} prompt={T('Hold the button and let go at the golden line.', 'Halte den Knopf und lass an der goldenen Linie los.', 'Drži dugme i pusti na zlatnoj liniji.')} onDone={finish(api, api.config.vessels.length)} />
    </GameBoard>
  );
}
export const pourDemo = kitDemo<PourCfg>({
  id: 'kit-pour-fill',
  topicId: 'salah',
  coverArt: 'kit.pour',
  title: T('Kit: Pour and Fill', 'Kit: Gießen', 'Kit: Sipanje'),
  description: desc('PourFill'),
  howTo: T('Hold to pour; let go at the line.', 'Halten zum Gießen, an der Linie loslassen.', 'Drži za sipanje, pusti na liniji.'),
  configs: [
    { vessels: [{ id: 'cup', label: HALF, target: 0.5, tolerance: 0.08 }], liquid: 'water' },
    { vessels: [{ id: 'jar', label: T('Three quarters', 'Drei Viertel', 'Tri četvrtine'), target: 0.75 }, { id: 'bowl', label: T('A quarter', 'Ein Viertel', 'Četvrtina'), target: 0.25 }], liquid: 'milk' },
    { vessels: [{ id: 'sack', label: HALF, target: 0.5, tolerance: 0.04 }, { id: 'sack2', label: T('Almost full', 'Fast voll', 'Skoro puno'), target: 0.85, tolerance: 0.04 }], liquid: 'grain' },
  ],
  component: PourDemo,
  order: 15,
});
