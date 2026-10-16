import { useMemo } from 'react';

import type { GameApi } from '@/core/games';
import { CatchGame, GameBoard, SortBins, type CatchItem, type SortItem } from '@/core/games/kit';

import { finishWith } from '../shared/content';
import { CATCH_ITEMS, FACT_OF, MIXED_ITEMS, PRAYER_ITEMS } from './content';

export interface BreakersConfig {
  mode: 'catch' | 'prayer' | 'mixed';
}

/** What breaks it: L1 catch what breaks wudu (CatchGame), L2 breaks the prayer?, L3 wudu / prayer / neither. */
export function BreakersGame(api: GameApi<BreakersConfig>) {
  const { t, config } = api;
  const catchItems = useMemo<CatchItem[]>(() => CATCH_ITEMS.map((i) => ({ id: i.id, good: i.good, art: i.art, label: t(`item.${i.id}`) })), [t]);
  const items = useMemo<SortItem[]>(() => (config.mode === 'prayer' ? PRAYER_ITEMS : MIXED_ITEMS).map((i) => ({ id: i.id, bin: i.bin, art: i.art, label: t(`item.${i.id}`) })), [t, config.mode]);
  const goal = CATCH_ITEMS.filter((i) => i.good).length;

  return (
    <GameBoard api={api}>
      {config.mode === 'catch' ? (
        <CatchGame items={catchItems} goal={goal} lanes={3} speed="calm" basketArt="kit.basket" sky="sky.morning" prompt={t('play.catch')} onDone={finishWith(api, goal, FACT_OF)} />
      ) : (
        <SortBins
          bins={
            config.mode === 'prayer'
              ? [
                  { id: 'breaks', label: t('bin.breaks'), art: 'salah.basics-turn-away' },
                  { id: 'fine', label: t('bin.fine'), art: 'salah.prayer-qiyam' },
                ]
              : [
                  { id: 'wudu', label: t('bin.wudu'), art: 'salah.basics-ibrik' },
                  { id: 'prayer', label: t('bin.prayer'), art: 'salah.prayer-qiyam' },
                  { id: 'neither', label: t('bin.neither'), art: 'kit.basket' },
                ]
          }
          items={items}
          hints={false}
          prompt={t(config.mode === 'prayer' ? 'play.prayer' : 'play.mixed')}
          onDone={finishWith(api, items.length, FACT_OF)}
        />
      )}
    </GameBoard>
  );
}
