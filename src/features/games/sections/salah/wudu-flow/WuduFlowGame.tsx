import { useMemo } from 'react';

import type { GameApi } from '@/core/games';
import { GameBoard, SequenceBoard, SortBins, type KitItem, type SortItem } from '@/core/games/kit';

import { finishWith } from '../shared/content';
import { PourSteps, type PourPart } from '../shared/PourSteps';
import { FACT_OF, FARZ_PARTS, MIXED_START, PART_ART, PART_FILL, SORT_ITEMS, WUDU_ORDER } from './content';

export interface WuduConfig {
  mode: 'pour' | 'sort' | 'repair';
}

/** Wudu Flow: L1 pour water onto the parts in order (guided), L2 farz vs sunnah, L3 repair a mixed-up wudu. */
export function WuduFlowGame(api: GameApi<WuduConfig>) {
  const { t, config } = api;
  const parts = useMemo<PourPart[]>(
    () =>
      WUDU_ORDER.map((id) => ({
        id,
        art: PART_ART[id],
        label: t(`part.${id}`),
        fill: PART_FILL[id],
        caption: FARZ_PARTS.includes(id) ? t(`cap.${id}`) : undefined,
      })),
    [t],
  );
  const sortItems = useMemo<SortItem[]>(() => SORT_ITEMS.map((i) => ({ id: i.id, bin: i.bin, art: i.art, label: t(`item.${i.id}`) })), [t]);
  const orderItems = useMemo<KitItem[]>(() => parts.map(({ id, art, label }) => ({ id, art, label })), [parts]);

  return (
    <GameBoard api={api}>
      {config.mode === 'pour' ? (
        <PourSteps parts={parts} toolLabel={t('play.tool')} wrongText={t('play.notYet')} prompt={t('play.pour')} onDone={finishWith(api, parts.length, FACT_OF)} />
      ) : config.mode === 'sort' ? (
        <SortBins
          bins={[
            { id: 'farz', label: t('bin.farz'), art: 'salah.basics-ibrik' },
            { id: 'sunnah', label: t('bin.sunnah'), art: 'kit.basket' },
          ]}
          items={sortItems}
          hints={false}
          prompt={t('play.sort')}
          onDone={finishWith(api, sortItems.length, FACT_OF)}
        />
      ) : (
        <SequenceBoard items={orderItems} startOrder={MIXED_START} hints={false} prompt={t('play.repair')} onDone={finishWith(api, orderItems.length, FACT_OF)} />
      )}
    </GameBoard>
  );
}
