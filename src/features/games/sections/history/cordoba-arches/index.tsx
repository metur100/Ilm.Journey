import type { ReactNode } from 'react';

import { CORDOBA_STRIPS } from '@/core/art/pieces/sections/history';
import { type GameApi, registerGame } from '@/core/games';
import { type BuildPart, BuildScene, type ConnectPair, ConnectPairs, GameBoard, type SortBin, SortBins, type SortItem } from '@/core/games/kit';

import { CORDOBA_FACTS as F, WISDOM_FACTS } from '../facts';
import { finishWith, historyGame, T } from '../shared';

/*
 * The Arches of Córdoba (al-Andalus) – build the prayer hall of the Great Mosque, architecture only.
 *   Every level teaches something new (owner feedback: no level repeats the content of another):
 *   L1 – build the hall from the ground up: floor, columns, the two rows of arches, ceiling and lamps (BuildScene, hints).
 *   L2 – Córdoba in al-Andalus: connect the names with what they mean (ConnectPairs).
 *   L3 – two centres of learning: Córdoba or Baghdad? (SortBins).
 */

type PartId = keyof typeof CORDOBA_STRIPS;

const PARTS: Record<PartId, BuildPart> = {
  floor: {
    id: 'floor',
    art: 'object.prayer-mat',
    sceneArt: 'history.cordoba-floor',
    label: T('Floor', 'Boden', 'Pod'),
    slot: CORDOBA_STRIPS.floor,
    caption: T('The floor of the prayer hall.', 'Der Boden des Gebetssaals.', 'Pod molitvene dvorane.'),
  },
  columns: {
    id: 'columns',
    art: 'kit.blocks',
    sceneArt: 'history.cordoba-columns',
    label: T('Columns', 'Säulen', 'Stubovi'),
    slot: CORDOBA_STRIPS.columns,
    caption: T('A forest of columns carries the roof.', 'Ein Wald aus Säulen trägt das Dach.', 'Šuma stubova nosi krov.'),
  },
  'arches-low': {
    id: 'arches-low',
    art: 'history.cordoba-mosque',
    sceneArt: 'history.cordoba-arches-low',
    label: T('Horseshoe arches', 'Hufeisenbögen', 'Potkovičasti lukovi'),
    slot: CORDOBA_STRIPS['arches-low'],
    caption: T('Horseshoe arches of red brick and white stone.', 'Hufeisenbögen aus rotem Ziegel und weißem Stein.', 'Potkovičasti lukovi od crvene cigle i bijelog kamena.'),
  },
  'arches-high': {
    id: 'arches-high',
    art: 'history.cordoba-arches',
    sceneArt: 'history.cordoba-arches-high',
    label: T('Upper arches', 'Obere Bögen', 'Gornji lukovi'),
    slot: CORDOBA_STRIPS['arches-high'],
    caption: T('A second row of arches on top – the famous double arches.', 'Eine zweite Bogenreihe darüber – die berühmten Doppelbögen.', 'Drugi red lukova iznad – poznati dvostruki lukovi.'),
  },
  ceiling: {
    id: 'ceiling',
    art: 'history.book-gold',
    sceneArt: 'history.cordoba-ceiling',
    label: T('Wooden ceiling', 'Holzdecke', 'Drveni strop'),
    slot: CORDOBA_STRIPS.ceiling,
    caption: T('A wooden ceiling closes the hall.', 'Eine Holzdecke schließt den Saal.', 'Drveni strop zatvara dvoranu.'),
  },
  lamps: {
    id: 'lamps',
    art: 'object.lamp',
    sceneArt: 'history.cordoba-lamps',
    label: T('Lamps', 'Lampen', 'Svjetiljke'),
    slot: CORDOBA_STRIPS.lamps,
    caption: T('Lamps light the rows of arches.', 'Lampen erhellen die Bogenreihen.', 'Svjetiljke osvjetljavaju redove lukova.'),
  },
};

export type CordobaConfig = { mode: 'build'; parts: PartId[]; ordered: boolean; ghosts: boolean; hints: boolean } | { mode: 'andalus' } | { mode: 'cities' };

/** L2 – Córdoba in al-Andalus (facts: cordoba-begun, andalus-capital). */
const ANDALUS: ConnectPair[] = [
  { id: 'andalus', left: { label: T('Al-Andalus', 'Al-Andalus', 'El-Andalus') }, right: { label: T('The Muslim lands of the Iberian Peninsula', 'Die muslimischen Gebiete der Iberischen Halbinsel', 'Muslimanske zemlje Pirinejskog poluostrva') } },
  { id: 'capital', left: { label: T('Córdoba', 'Córdoba', 'Kordoba') }, right: { label: T('The capital of al-Andalus', 'Die Hauptstadt von al-Andalus', 'Glavni grad el-Andalusa') } },
  { id: 'founder', left: { label: T('ʿAbd al-Rahman I', 'ʿAbd ar-Rahman I.', 'Abdurrahman I.') }, right: { label: T('Began the Great Mosque in 785 CE', 'Begann die Große Moschee 785 n. Chr.', 'Započeo Veliku džamiju 785. godine') } },
  { id: 'enlarged', left: { label: T('The next two centuries', 'Die nächsten zwei Jahrhunderte', 'Naredna dva stoljeća') }, right: { label: T('The mosque was enlarged several times', 'Die Moschee wurde mehrmals erweitert', 'Džamija je više puta proširivana') } },
];
const ANDALUS_FACT: Record<string, string> = { andalus: F.capital.id, capital: F.capital.id, founder: F.begun.id, enlarged: F.begun.id };

/** L3 – Córdoba or Baghdad? (facts: zahrawi-surgery, khwarizmi-baghdad). */
const CITY_BINS: SortBin[] = [
  { id: 'cordoba', label: T('Córdoba', 'Córdoba', 'Kordoba'), art: 'history.cordoba-mosque' },
  { id: 'baghdad', label: T('Baghdad', 'Bagdad', 'Bagdad'), art: 'history.house-of-wisdom' },
];
const CITY_ITEMS: SortItem[] = [
  { id: 'double-arches', bin: 'cordoba', art: 'history.cordoba-arches', label: T('Red-and-white double arches', 'Rot-weiße Doppelbögen', 'Crveno-bijeli dvostruki lukovi') },
  { id: 'tasrif', bin: 'cordoba', art: 'history.surgical-tools', label: T('Al-Zahrawi writes al-Tasrif', 'Al-Zahrawi schreibt at-Tasrif', 'Ez-Zehravi piše et-Tasrif') },
  { id: 'house', bin: 'baghdad', art: 'history.house-of-wisdom', label: T('The House of Wisdom', 'Das Haus der Weisheit', 'Kuća mudrosti') },
  { id: 'jabr', bin: 'baghdad', art: 'history.book-blue', label: T('Al-Khwarizmi and al-jabr', 'Al-Chwarizmi und al-dschabr', 'El-Havarizmi i el-džebr') },
];
const CITY_FACT: Record<string, string> = { 'double-arches': F.zahrawi.id, tasrif: F.zahrawi.id, house: WISDOM_FACTS.khwarizmi.id, jabr: WISDOM_FACTS.khwarizmi.id };

const texts = {
  title: T('The Arches of Córdoba', 'Die Bögen von Córdoba', 'Lukovi Kordobe'),
  description: T(
    'Build the prayer hall of the Great Mosque of Córdoba in al-Andalus, with its famous red-and-white double arches, and get to know the city.',
    'Bau den Gebetssaal der Großen Moschee von Córdoba in al-Andalus mit seinen berühmten rot-weißen Doppelbögen und lerne die Stadt kennen.',
    'Sagradi molitvenu dvoranu Velike džamije u Kordobi u el-Andalusu, s poznatim crveno-bijelim dvostrukim lukovima, i upoznaj grad.',
  ),
  howTo: T(
    'Build the hall from the ground up, then connect the names of al-Andalus and sort what belongs to Córdoba or Baghdad.',
    'Bau den Saal von unten nach oben, verbinde dann die Namen von al-Andalus und sortiere, was zu Córdoba oder Bagdad gehört.',
    'Sagradi dvoranu odozdo prema gore, zatim spoji imena el-Andalusa i razvrstaj šta pripada Kordobi, a šta Bagdadu.',
  ),
  'play.prompt': T('Build the hall from the floor up.', 'Bau den Saal vom Boden aufwärts.', 'Gradi dvoranu od poda prema gore.'),
  'play.andalus': T('Córdoba in al-Andalus: connect each name with what it means.', 'Córdoba in al-Andalus: Verbinde jeden Namen mit seiner Bedeutung.', 'Kordoba u el-Andalusu: spoji svako ime s njegovim značenjem.'),
  'play.cities': T('Two centres of learning: Córdoba or Baghdad?', 'Zwei Zentren des Wissens: Córdoba oder Bagdad?', 'Dva središta znanja: Kordoba ili Bagdad?'),
  'reveal.title': T('The hall of Córdoba', 'Der Saal von Córdoba', 'Dvorana Kordobe'),
  'reveal.caption': T('Begun in 785 CE under ʿAbd al-Rahman I.', 'Begonnen 785 n. Chr. unter ʿAbd ar-Rahman I.', 'Započeta 785. godine za vrijeme Abdurrahmana I.'),
};

export function CordobaArchesGame(api: GameApi<CordobaConfig>) {
  const { config } = api;
  const board = (child: ReactNode) => <GameBoard api={api as GameApi<unknown>}>{child}</GameBoard>;
  const fact = (map: Record<string, string>) => (id: string) => (api.facts.some((f) => f.id === map[id]) ? map[id] : undefined);
  if (config.mode === 'andalus') {
    return board(<ConnectPairs pairs={ANDALUS} hints={false} prompt={api.t('play.andalus')} onDone={finishWith(api as GameApi<unknown>, ANDALUS.length, fact(ANDALUS_FACT))} />);
  }
  if (config.mode === 'cities') {
    return board(<SortBins bins={CITY_BINS} items={CITY_ITEMS} hints={false} prompt={api.t('play.cities')} onDone={finishWith(api as GameApi<unknown>, CITY_ITEMS.length, fact(CITY_FACT))} />);
  }
  const list = config.parts.map((p) => PARTS[p]);
  return board(
    <BuildScene
      scene="history.cordoba-hall"
      parts={list}
      ordered={config.ordered}
      ghosts={config.ghosts}
      hints={config.hints}
      prompt={api.t('play.prompt')}
      reveal={{ title: api.t('reveal.title'), caption: api.t('reveal.caption') }}
      onDone={finishWith(api as GameApi<unknown>, list.length, (id) => (id.startsWith('arches') ? api.facts.find((f) => f.id === F.arches.id)?.id : undefined))}
    />,
  );
}

const ALL: PartId[] = ['floor', 'columns', 'arches-low', 'arches-high', 'ceiling', 'lamps'];

export const cordobaArchesGame = historyGame<CordobaConfig>({
  id: 'cordoba-arches',
  texts,
  coverArt: 'history.cordoba-arches',
  hintArt: 'history.cordoba-mosque',
  component: CordobaArchesGame,
  levels: [
    { config: { mode: 'build', parts: ALL, ordered: true, ghosts: true, hints: true }, facts: [F.arches] },
    { config: { mode: 'andalus' }, facts: [F.begun, F.capital] },
    { config: { mode: 'cities' }, facts: [F.zahrawi, WISDOM_FACTS.khwarizmi] },
  ],
  order: 100,
});

export function registerCordobaArchesGame(): void {
  registerGame(cordobaArchesGame);
}
