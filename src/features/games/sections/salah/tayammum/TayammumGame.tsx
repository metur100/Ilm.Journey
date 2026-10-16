import { useMemo } from 'react';

import type { GameApi } from '@/core/games';
import { GameBoard, SortBins, TapScene, type SceneSpot, type SortItem } from '@/core/games/kit';

import { finishWith } from '../shared/content';
import { ScrubWash, type ScrubPart } from '../shared/ScrubWash';
import { FACT_OF, STEPS, WHEN_ITEMS, YARD_SPOTS } from './content';

export interface TayammumConfig {
  mode: 'find' | 'wipe' | 'when';
}

const CAPTIONED = ['sand', 'stones', 'brick', 'face', 'left-arm'];

/** Tejemmum: L1 find the earth in the yard (TapScene), L2 strike and wipe in order (ScrubWash, earth), L3 when. */
export function TayammumGame(api: GameApi<TayammumConfig>) {
  const { t, config } = api;
  const spots = useMemo<SceneSpot[]>(
    () => YARD_SPOTS.map((s) => ({ id: s.id, at: s.at, target: s.target, label: t(`spot.${s.id}`), caption: CAPTIONED.includes(s.id) ? `${t(`spot.${s.id}`)} – ${t(`cap.${s.id}`)}` : undefined })),
    [t],
  );
  const steps = useMemo<ScrubPart[]>(() => STEPS.map((s) => ({ id: s.id, art: s.art, label: t(`step.${s.id}`), caption: CAPTIONED.includes(s.id) ? t(`cap.${s.id}`) : undefined })), [t]);
  const items = useMemo<SortItem[]>(() => WHEN_ITEMS.map((i) => ({ id: i.id, bin: i.bin, art: i.art, label: t(`item.${i.id}`) })), [t]);
  const targets = YARD_SPOTS.filter((s) => s.target).length;

  return (
    <GameBoard api={api}>
      {config.mode === 'find' ? (
        <TapScene scene="salah.basics-earth-yard" spots={spots} prompt={t('play.find')} onDone={finishWith(api, targets, FACT_OF)} />
      ) : config.mode === 'wipe' ? (
        <ScrubWash parts={steps} ordered material="earth" columns={3} wrongText={t('play.notYet')} prompt={t('play.wipe')} onDone={finishWith(api, steps.length, FACT_OF)} />
      ) : (
        <SortBins
          bins={[
            { id: 'tayammum', label: t('bin.tayammum'), art: 'salah.basics-palms-sand' },
            { id: 'wudu', label: t('bin.wudu'), art: 'salah.basics-ibrik' },
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
