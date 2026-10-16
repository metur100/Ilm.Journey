import { useMemo } from 'react';

import type { GameApi } from '@/core/games';
import { GameBoard, SequenceBoard, SortBins, type KitItem, type SortItem } from '@/core/games/kit';

import { finishWith } from '../shared/content';
import { ScrubWash, type ScrubPart } from '../shared/ScrubWash';
import { BODY_PARTS, FACT_OF, STEPS, WHEN_ITEMS } from './content';

export interface GhuslConfig {
  mode: 'rub' | 'steps' | 'when';
}

/** Gusul: L1 rub water over every part (ScrubWash), L2 the Prophet's gusul on a path, L3 wudu / gusul / sunnah. */
export function GhuslGame(api: GameApi<GhuslConfig>) {
  const { t, config } = api;
  const parts = useMemo<ScrubPart[]>(() => BODY_PARTS.map((p) => ({ id: p.id, art: p.art, label: t(`part.${p.id}`), caption: p.caption ? t(`cap.${p.id}`) : undefined })), [t]);
  const steps = useMemo<KitItem[]>(() => STEPS.map((s) => ({ id: s.id, art: s.art, label: t(`step.${s.id}`) })), [t]);
  const items = useMemo<SortItem[]>(() => WHEN_ITEMS.map((i) => ({ id: i.id, bin: i.bin, art: i.art, label: t(`item.${i.id}`) })), [t]);

  return (
    <GameBoard api={api}>
      {config.mode === 'rub' ? (
        <ScrubWash parts={parts} columns={3} prompt={t('play.rub')} onDone={finishWith(api, parts.length, FACT_OF)} />
      ) : config.mode === 'steps' ? (
        <SequenceBoard variant="path" items={steps} endArt="salah.basics-shower" prompt={t('play.steps')} onDone={finishWith(api, steps.length, FACT_OF)} />
      ) : (
        <SortBins
          bins={[
            { id: 'wudu', label: t('bin.wudu'), art: 'salah.basics-ibrik' },
            { id: 'gusul', label: t('bin.gusul'), art: 'salah.basics-shower' },
            { id: 'sunnah', label: t('bin.sunnah'), art: 'kit.basket' },
          ]}
          items={items}
          hints={false}
          prompt={t('play.when')}
          onDone={finishWith(api, items.length, FACT_OF)}
        />
      )}
    </GameBoard>
  );
}
