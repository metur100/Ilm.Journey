import { useMemo } from 'react';

import { type GameApi, type GameDef, registerGame } from '@/core/games';
import { GameBoard, type KitBox, kitResult } from '@/core/games/kit';

import { F } from '../shared/facts';
import { SceneDrop } from '../shared/SceneDrop';
import { type FoodPiece, pieces, shareRule } from './logic';
import { shareI18n } from './i18n';

/*
 * Share the Plate – SceneDrop on a table seen from above. Every level is a different meal:
 * L1: a friend visits – dates and bread on two plates, hints (giving food).
 * L2: a guest comes to dinner – rice and fruit on three plates (Bukhari 5392: the food of two is enough for three).
 * L3: soup for the neighbours – soup, olives and milk on four plates (Muslim 2625).
 */

type Plate = 'you' | 'friend' | 'guest' | 'neighbour';

export interface ShareConfig {
  prompt: string;
  plates: Plate[];
  food: FoodPiece[];
  hints: boolean;
  fact: string;
}

const FOOD_ART: Record<string, string> = {
  dates: 'food.dates',
  bread: 'food.bread',
  fruit: 'food.fruit-bowl',
  rice: 'food.rice',
  soup: 'food.soup',
  olives: 'food.olives',
  milk: 'food.milk',
};

/** Plate places on the table (akhlaq.table) for 2, 3 or 4 plates. */
const LAYOUT: Record<number, KitBox[]> = {
  2: [{ x: 0.2, y: 0.32, w: 0.26, h: 0.36 }, { x: 0.54, y: 0.32, w: 0.26, h: 0.36 }],
  3: [{ x: 0.08, y: 0.32, w: 0.26, h: 0.36 }, { x: 0.37, y: 0.32, w: 0.26, h: 0.36 }, { x: 0.66, y: 0.32, w: 0.26, h: 0.36 }],
  4: [{ x: 0.16, y: 0.1, w: 0.28, h: 0.36 }, { x: 0.56, y: 0.1, w: 0.28, h: 0.36 }, { x: 0.16, y: 0.54, w: 0.28, h: 0.36 }, { x: 0.56, y: 0.54, w: 0.28, h: 0.36 }],
};

const FACTS = { give: F.giveFood(), two: F.foodOfTwo(), soup: F.soupForNeighbours() };

function ShareThePlateGame(api: GameApi<ShareConfig>) {
  const { plates, food, hints, prompt, fact } = api.config;
  const t = api.t;
  const rule = useMemo(() => shareRule(food, plates, t('waiting')), [food, plates, t]);
  return (
    <GameBoard api={api}>
      <SceneDrop
        scene="akhlaq.table"
        targets={plates.map((p, i) => ({ id: p, at: LAYOUT[plates.length][i], art: 'object.plate', label: api.t(`plate.${p}`) }))}
        items={food.map((f) => ({ id: f.id, art: FOOD_ART[f.kind], label: api.t(`food.${f.kind}`) }))}
        rule={rule}
        hints={hints}
        ordered
        tileWidth={70}
        prompt={api.t(prompt)}
        onDone={({ mistakes }) => api.onComplete(kitResult({ moves: food.length, mistakes, factsMissed: mistakes > 0 ? [fact] : [] }))}
      />
    </GameBoard>
  );
}

/** Dates and bread mixed, so the tray shows both kinds. */
const mix = (...lists: FoodPiece[][]) => {
  const out: FoodPiece[] = [];
  for (let i = 0; i < Math.max(...lists.map((l) => l.length)); i++) for (const l of lists) if (l[i]) out.push(l[i]);
  return out;
};

export const shareThePlateGame: GameDef<ShareConfig> = {
  id: 'share-the-plate',
  topicId: 'akhlaq',
  i18n: shareI18n,
  coverArt: 'food.dates',
  hintArt: 'object.plate',
  component: ShareThePlateGame,
  levels: [
    { level: 1, config: { prompt: 'play.l1', plates: ['you', 'friend'], food: mix(pieces('dates', 4), pieces('bread', 2)), hints: true, fact: FACTS.give.id }, facts: [FACTS.give] },
    { level: 2, config: { prompt: 'play.l2', plates: ['you', 'friend', 'guest'], food: mix(pieces('rice', 3), pieces('fruit', 6)), hints: false, fact: FACTS.two.id }, facts: [FACTS.two] },
    {
      level: 3,
      config: { prompt: 'play.l3', plates: ['you', 'friend', 'neighbour', 'guest'], food: mix(pieces('soup', 4), pieces('olives', 4), pieces('milk', 4)), hints: false, fact: FACTS.soup.id },
      facts: [FACTS.soup],
    },
  ],
  order: 50,
};

export function registerShareThePlateGame(): void {
  registerGame(shareThePlateGame);
}
