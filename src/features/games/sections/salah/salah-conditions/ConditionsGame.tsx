import { useMemo } from 'react';

import type { GameApi } from '@/core/games';
import { GameBoard, SortBins, TapScene, type SceneSpot, type SortItem } from '@/core/games/kit';

import { finishWith } from '../shared/content';
import { FACT_OF, FARZ_ITEMS, ROOM_SPOTS } from './content';

export interface ConditionsConfig {
  mode: 'find' | 'sort' | 'all';
}

/** Ready for Salah: L1 find the conditions one by one (TapScene, ordered), L2 šarti vs erkan, L3 all six among distractions. */
export function ConditionsGame(api: GameApi<ConditionsConfig>) {
  const { t, config } = api;
  const ordered = config.mode === 'find';
  const spots = useMemo<SceneSpot[]>(
    () =>
      ROOM_SPOTS.filter((s) => !ordered || s.target).map((s) => ({
        id: s.id,
        at: s.at,
        target: s.target,
        spotArt: s.spotArt,
        label: t(`spot.${s.id}`),
        caption: s.target ? t(`cap.${s.id}`) : undefined,
      })),
    [t, ordered],
  );
  const items = useMemo<SortItem[]>(() => FARZ_ITEMS.map((i) => ({ id: i.id, bin: i.bin, art: i.art, label: t(`item.${i.id}`) })), [t]);
  const targets = ROOM_SPOTS.filter((s) => s.target).length;

  return (
    <GameBoard api={api}>
      {config.mode === 'sort' ? (
        <SortBins
          bins={[
            { id: 'sart', label: t('bin.sart'), art: 'salah.basics-mat' },
            { id: 'rukn', label: t('bin.rukn'), art: 'salah.prayer-ruku' },
          ]}
          items={items}
          hints={false}
          prompt={t('play.sort')}
          onDone={finishWith(api, items.length, FACT_OF)}
        />
      ) : (
        <TapScene
          scene="salah.basics-prayer-room"
          spots={spots}
          ordered={ordered}
          hints={ordered}
          prompt={ordered ? undefined : t('play.all')}
          onDone={finishWith(api, targets, FACT_OF)}
        />
      )}
    </GameBoard>
  );
}
