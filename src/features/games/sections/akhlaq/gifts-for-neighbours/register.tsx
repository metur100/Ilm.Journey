import { useMemo } from 'react';

import { STREET_HOUSES } from '@/core/art/pieces/sections/akhlaq';
import { type GameApi, type GameDef, registerGame } from '@/core/games';
import { GameBoard, kitResult } from '@/core/games/kit';

import { F } from '../shared/facts';
import { SceneDrop } from '../shared/SceneDrop';
import { everyDoorRule, nearestFirstRule } from './logic';
import { giftsI18n } from './i18n';

/*
 * Gifts for the Neighbours – SceneDrop on a street in perspective (akhlaq.street). L1: one gift for every house, any
 * order, hints. L2: the nearest door first (Bukhari 6020), doors numbered by distance. L3: six houses on both sides,
 * no numbers and no hints – judge the nearest door by yourself. Every level brings other gifts.
 */

const GIFTS: Record<string, string> = {
  box: 'object.gift',
  dates: 'food.dates',
  bread: 'food.bread',
  fruit: 'food.fruit-bowl',
  soup: 'food.soup',
  honey: 'object.honey',
  milk: 'food.milk',
  olives: 'food.olives',
  rice: 'food.rice',
  lamp: 'object.lamp',
};

export interface GiftsConfig {
  prompt: string;
  /** Number of houses (nearest first, from STREET_HOUSES). */
  houses: number;
  gifts: string[];
  nearestFirst: boolean;
  numbers: boolean;
  hints: boolean;
  fact: string;
}

const doorBox = (i: number) => {
  const h = STREET_HOUSES[i];
  return { x: (h.x - 24 * h.s) / 400, y: (h.y - 44 * h.s) / 300, w: (48 * h.s) / 400, h: (48 * h.s) / 300 };
};

const FACTS = { heir: F.neighbourHeir(), nearest: F.nearestDoor(), near: F.goodToNeighbours() };

function GiftsForNeighboursGame(api: GameApi<GiftsConfig>) {
  const { houses, gifts, nearestFirst, numbers, hints, prompt, fact } = api.config;
  const doors = useMemo(() => Array.from({ length: houses }, (_, i) => `door-${i + 1}`), [houses]);
  const t = api.t;
  const rule = useMemo(
    () => (nearestFirst ? nearestFirstRule(gifts, doors, t('nearest'), t('full')) : everyDoorRule(gifts, doors, t('full'))),
    [nearestFirst, gifts, doors, t],
  );
  return (
    <GameBoard api={api}>
      <SceneDrop
        scene="akhlaq.street"
        targets={doors.map((id, i) => ({ id, at: doorBox(i), label: numbers ? api.t('door', { n: i + 1 }) : undefined }))}
        items={gifts.map((g) => ({ id: g, art: GIFTS[g], label: api.t(`gift.${g}`) }))}
        rule={rule}
        ordered
        hints={hints}
        tileWidth={72}
        prompt={api.t(prompt)}
        rightCaption={() => api.t('delivered')}
        onDone={({ mistakes }) => api.onComplete(kitResult({ moves: houses, mistakes, factsMissed: mistakes > 0 ? [fact] : [] }))}
      />
    </GameBoard>
  );
}

export const giftsForNeighboursGame: GameDef<GiftsConfig> = {
  id: 'gifts-for-neighbours',
  topicId: 'akhlaq',
  i18n: giftsI18n,
  coverArt: 'akhlaq.street',
  hintArt: 'object.gift',
  component: GiftsForNeighboursGame,
  levels: [
    { level: 1, config: { prompt: 'play.l1', houses: 3, gifts: ['box', 'dates', 'fruit'], nearestFirst: false, numbers: false, hints: true, fact: FACTS.heir.id }, facts: [FACTS.heir] },
    { level: 2, config: { prompt: 'play.l2', houses: 4, gifts: ['bread', 'milk', 'honey', 'olives'], nearestFirst: true, numbers: true, hints: false, fact: FACTS.nearest.id }, facts: [FACTS.nearest] },
    {
      level: 3,
      config: { prompt: 'play.l3', houses: 6, gifts: ['soup', 'rice', 'box', 'honey', 'lamp', 'bread'], nearestFirst: true, numbers: false, hints: false, fact: FACTS.near.id },
      facts: [FACTS.near],
    },
  ],
  order: 60,
};

export function registerGiftsForNeighboursGame(): void {
  registerGame(giftsForNeighboursGame);
}
