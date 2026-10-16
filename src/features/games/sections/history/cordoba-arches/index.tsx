import { CORDOBA_STRIPS } from '@/core/art/pieces/sections/history';
import { type GameApi, registerGame } from '@/core/games';
import { type BuildPart, BuildScene, GameBoard } from '@/core/games/kit';

import { CORDOBA_FACTS as F } from '../facts';
import { finishWith, historyGame, T } from '../shared';

/*
 * The Arches of Córdoba (al-Andalus) – build the prayer hall of the Great Mosque, architecture only.
 *   L1 – from the ground up: floor, columns, horseshoe arches, upper arches (in order, silhouettes, hints).
 *   L2 – the whole hall with ceiling and lamps (in order, silhouettes, no hints).
 *   L3 – from memory: any order, no silhouettes, no hints.
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

export interface CordobaConfig {
  parts: PartId[];
  ordered: boolean;
  ghosts: boolean;
  hints: boolean;
}

const texts = {
  title: T('The Arches of Córdoba', 'Die Bögen von Córdoba', 'Lukovi Kordobe'),
  description: T(
    'Build the prayer hall of the Great Mosque of Córdoba in al-Andalus, with its famous red-and-white double arches.',
    'Bau den Gebetssaal der Großen Moschee von Córdoba in al-Andalus mit seinen berühmten rot-weißen Doppelbögen.',
    'Sagradi molitvenu dvoranu Velike džamije u Kordobi u el-Andalusu, s poznatim crveno-bijelim dvostrukim lukovima.',
  ),
  howTo: T('Drag each part into the hall – from the ground up.', 'Zieh jedes Teil in den Saal – von unten nach oben.', 'Prevuci svaki dio u dvoranu – odozdo prema gore.'),
  'play.prompt': T('Build the hall from the floor up.', 'Bau den Saal vom Boden aufwärts.', 'Gradi dvoranu od poda prema gore.'),
  'play.memory': T('Build the hall from memory – where does each part go?', 'Bau den Saal aus dem Gedächtnis – wohin gehört jedes Teil?', 'Sagradi dvoranu po sjećanju – gdje ide koji dio?'),
  'reveal.title': T('The hall of Córdoba', 'Der Saal von Córdoba', 'Dvorana Kordobe'),
  'reveal.caption': T('Begun in 785 CE under ʿAbd al-Rahman I.', 'Begonnen 785 n. Chr. unter ʿAbd ar-Rahman I.', 'Započeta 785. godine za vrijeme Abdurrahmana I.'),
};

export function CordobaArchesGame(api: GameApi<CordobaConfig>) {
  const { parts, ordered, ghosts, hints } = api.config;
  const list = parts.map((p) => PARTS[p]);
  return (
    <GameBoard api={api as GameApi<unknown>}>
      <BuildScene
        scene="history.cordoba-hall"
        parts={list}
        ordered={ordered}
        ghosts={ghosts}
        hints={hints}
        prompt={api.t(ordered ? 'play.prompt' : 'play.memory')}
        reveal={{ title: api.t('reveal.title'), caption: api.t('reveal.caption') }}
        onDone={finishWith(api as GameApi<unknown>, list.length, (id) => (id.startsWith('arches') ? api.facts.find((f) => f.id === F.arches.id)?.id : undefined))}
      />
    </GameBoard>
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
    { config: { parts: ALL.slice(0, 4), ordered: true, ghosts: true, hints: true }, facts: [F.begun, F.arches] },
    { config: { parts: ALL, ordered: true, ghosts: true, hints: false }, facts: [F.capital] },
    { config: { parts: ALL, ordered: false, ghosts: false, hints: false }, facts: [F.zahrawi] },
  ],
  order: 100,
});

export function registerCordobaArchesGame(): void {
  registerGame(cordobaArchesGame);
}
