import { type GameApi, type GameDef, registerGame } from '@/core/games';
import { GameBoard, kitResult, SortBins } from '@/core/games/kit';

import { F } from '../shared/facts';
import { tidyUpI18n } from './i18n';

/*
 * Clean and Tidy – SortBins. L1: a messy room, two boxes, hints. L2: more things and the rubbish bin, no hints.
 * L3 (twist): the masjid – shoes on the rack, books on the shelf, rubbish in the bin.
 */

type Bin = 'toys' | 'laundry' | 'rubbish' | 'shelf' | 'shoes' | 'food' | 'dishes';

interface TidyItem {
  id: string;
  art: string;
  key: string;
  bin: Bin;
}

export interface TidyConfig {
  prompt: string;
  bins: Bin[];
  items: TidyItem[];
  hints: boolean;
  /** Fact id reported for review when the learner puts something in the wrong place. */
  fact: string;
}

const BIN_ART: Record<Bin, string> = {
  toys: 'akhlaq.toy-box',
  laundry: 'akhlaq.laundry-basket',
  rubbish: 'akhlaq.rubbish-bin',
  shelf: 'akhlaq.bookshelf',
  shoes: 'akhlaq.shoe-rack',
  food: 'food.dates',
  dishes: 'akhlaq.dishes',
};

const I = (id: string, art: string, key: string, bin: Bin): TidyItem => ({ id, art, key, bin });

const ROOM = [I('ball', 'akhlaq.ball', 'item.ball', 'toys'), I('blocks', 'akhlaq.blocks', 'item.blocks', 'toys'), I('car', 'akhlaq.toy-car', 'item.car', 'toys'), I('shirt', 'akhlaq.shirt', 'item.shirt', 'laundry'), I('socks', 'akhlaq.socks', 'item.socks', 'laundry')];
const KITCHEN = [
  I('bread', 'object.bread', 'item.bread', 'food'),
  I('milk', 'object.milk', 'item.milk', 'food'),
  I('dates', 'object.dates', 'item.dates', 'food'),
  I('plate', 'akhlaq.dishes', 'item.plate', 'dishes'),
  I('cup', 'object.cup', 'item.cup', 'dishes'),
  I('peel', 'akhlaq.apple-core', 'item.peel', 'rubbish'),
  I('wrapper', 'akhlaq.paper-ball', 'item.wrapper', 'rubbish'),
];
const RUBBISH = [I('paper', 'akhlaq.paper-ball', 'item.paper', 'rubbish'), I('apple', 'akhlaq.apple-core', 'item.apple', 'rubbish')];
const MASJID = [
  I('shoes', 'akhlaq.shoes', 'item.shoes', 'shoes'),
  I('book', 'object.book', 'item.book', 'shelf'),
  I('beads', 'object.prayer-beads', 'item.beads', 'shelf'),
  I('mushaf-stand', 'object.quran-stand', 'item.mushaf', 'shelf'),
  ...RUBBISH,
];

const FACTS = { purity: F.purityHalf(), loves: F.lovesPure(), harm: F.removeHarm() };

function TidyUpGame(api: GameApi<TidyConfig>) {
  const { bins, items, hints, prompt, fact } = api.config;
  return (
    <GameBoard api={api}>
      <SortBins
        bins={bins.map((b) => ({ id: b, label: api.t(`bin.${b}`), art: BIN_ART[b] }))}
        items={items.map((i) => ({ id: i.id, art: i.art, label: api.t(i.key), bin: i.bin }))}
        hints={hints}
        prompt={api.t(prompt)}
        onDone={({ mistakes }) => api.onComplete(kitResult({ moves: items.length, mistakes, factsMissed: mistakes > 0 ? [fact] : [] }))}
      />
    </GameBoard>
  );
}

export const tidyUpGame: GameDef<TidyConfig> = {
  id: 'tidy-up',
  topicId: 'akhlaq',
  i18n: tidyUpI18n,
  coverArt: 'akhlaq.toy-box',
  hintArt: 'akhlaq.ball',
  component: TidyUpGame,
  levels: [
    { level: 1, config: { prompt: 'play.room', bins: ['toys', 'laundry'], items: ROOM, hints: true, fact: FACTS.purity.id }, facts: [FACTS.purity] },
    { level: 2, config: { prompt: 'play.kitchen', bins: ['food', 'dishes', 'rubbish'], items: KITCHEN, hints: false, fact: FACTS.loves.id }, facts: [FACTS.loves] },
    { level: 3, config: { prompt: 'play.masjid', bins: ['shoes', 'shelf', 'rubbish'], items: MASJID, hints: false, fact: FACTS.harm.id }, facts: [FACTS.harm] },
  ],
  order: 100,
};

export function registerTidyUpGame(): void {
  registerGame(tidyUpGame);
}
