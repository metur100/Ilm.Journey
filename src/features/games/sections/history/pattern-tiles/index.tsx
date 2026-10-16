import { type GameApi, registerGame } from '@/core/games';
import { GameBoard } from '@/core/games/kit';

import { PATTERN_FACTS as F } from '../facts';
import { finishWith, historyGame, T } from '../shared';
import { PatternTiles } from './PatternTiles';

/*
 * Star Patterns – complete an Islamic geometric pattern by turning the tiles (custom rotation puzzle).
 *   L1 – 2 × 2 tiles: one star; the finished pattern is shown, hints.
 *   L2 – 4 × 2 tiles: two stars side by side, no hints.
 *   L3 – 4 × 4 tiles: a repair job – most tiles are right, find and turn the wrong ones; no preview, no hints.
 */

export interface PatternConfig {
  rows: number;
  cols: number;
  scramble: 'all' | 'some';
  preview: boolean;
  hints: boolean;
}

const texts = {
  title: T('Star Patterns', 'Sternmuster', 'Zvjezdasti uzorci'),
  description: T(
    'Mosques are decorated with geometric patterns. Turn the tiles until the eight-pointed stars close.',
    'Moscheen sind mit geometrischen Mustern geschmückt. Dreh die Fliesen, bis sich die achtzackigen Sterne schließen.',
    'Džamije su ukrašene geometrijskim uzorcima. Okreći pločice dok se osmokrake zvijezde ne sklope.',
  ),
  howTo: T('Tap a tile to turn it. The stars meet where four tiles touch.', 'Tippe auf eine Fliese, um sie zu drehen. Die Sterne treffen sich dort, wo vier Fliesen zusammenstoßen.', 'Dodirni pločicu da je okreneš. Zvijezde se sastaju gdje se dodiruju četiri pločice.'),
  'play.prompt': T('Turn the tiles so that the big stars close.', 'Dreh die Fliesen so, dass sich die großen Sterne schließen.', 'Okreći pločice tako da se velike zvijezde sklope.'),
  'play.repair': T('Some tiles are turned the wrong way. Find them and fix the pattern.', 'Einige Fliesen sind falsch gedreht. Finde sie und repariere das Muster.', 'Neke pločice su pogrešno okrenute. Pronađi ih i popravi uzorak.'),
  'play.preview': T('Goal', 'Ziel', 'Cilj'),
  'play.tile': T('Tile, row {row}, column {col}. Tap to turn.', 'Fliese, Reihe {row}, Spalte {col}. Tippen zum Drehen.', 'Pločica, red {row}, kolona {col}. Dodirni da okreneš.'),
  'play.wasRight': T('That tile was already right – keep turning it until it fits again.', 'Diese Fliese war schon richtig – dreh weiter, bis sie wieder passt.', 'Ta pločica je već bila tačna – okreći je dok opet ne bude na mjestu.'),
  'play.fits': T('It fits!', 'Sie passt!', 'Pristaje!'),
  'play.done': T('The pattern is complete!', 'Das Muster ist vollständig!', 'Uzorak je potpun!'),
};

export function PatternTilesGame(api: GameApi<PatternConfig>) {
  const { rows, cols, scramble, preview, hints } = api.config;
  return (
    <GameBoard api={api as GameApi<unknown>}>
      <PatternTiles
        rows={rows}
        cols={cols}
        scramble={scramble}
        preview={preview}
        hints={hints}
        prompt={api.t(scramble === 'some' ? 'play.repair' : 'play.prompt')}
        labels={{
          preview: api.t('play.preview'),
          tile: (row, col) => api.t('play.tile', { row, col }),
          wasRight: api.t('play.wasRight'),
          fits: api.t('play.fits'),
          done: api.t('play.done'),
        }}
        onDone={finishWith(api as GameApi<unknown>, rows * cols)}
      />
    </GameBoard>
  );
}

export const patternTilesGame = historyGame<PatternConfig>({
  id: 'star-patterns',
  texts,
  coverArt: 'history.pattern-cover',
  hintArt: 'history.girih-tile',
  component: PatternTilesGame,
  levels: [
    { config: { rows: 2, cols: 2, scramble: 'all', preview: true, hints: true }, facts: [F.ornament] },
    { config: { rows: 2, cols: 4, scramble: 'all', preview: true, hints: false }, facts: [F.compass] },
    { config: { rows: 4, cols: 4, scramble: 'some', preview: false, hints: false }, facts: [F.alhambra] },
  ],
  order: 120,
});

export function registerPatternTilesGame(): void {
  registerGame(patternTilesGame);
}
