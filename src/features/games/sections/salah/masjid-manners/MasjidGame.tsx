import { useMemo } from 'react';

import type { GameApi } from '@/core/games';
import { ConnectPairs, GameBoard, SequenceBoard, SortBins, type ConnectPair, type KitItem, type SortItem } from '@/core/games/kit';

import { finishWith } from '../shared/content';
import { DO_ITEMS, FACT_OF, PAIRS, VISIT } from './content';

export interface MasjidConfig {
  mode: 'connect' | 'sort' | 'visit';
}

/** Manners of the masjid: L1 moment ↔ manner (ConnectPairs), L2 good or not, L3 a whole visit on the path (no hints). */
export function MasjidGame(api: GameApi<MasjidConfig>) {
  const { t, config } = api;
  const pairs = useMemo<ConnectPair[]>(() => PAIRS.map((p) => ({ id: p.id, left: { label: t(`left.${p.id}`), art: p.leftArt }, right: { label: t(`right.${p.id}`) } })), [t]);
  const items = useMemo<SortItem[]>(() => DO_ITEMS.map((i) => ({ id: i.id, bin: i.bin, art: i.art, label: t(`item.${i.id}`) })), [t]);
  const visit = useMemo<KitItem[]>(() => VISIT.map((v) => ({ id: v.id, art: v.art, label: t(`visit.${v.id}`) })), [t]);

  return (
    <GameBoard api={api}>
      {config.mode === 'connect' ? (
        <ConnectPairs pairs={pairs} leftShare={0.42} prompt={t('play.connect')} onDone={finishWith(api, pairs.length, FACT_OF)} />
      ) : config.mode === 'sort' ? (
        <SortBins
          bins={[
            { id: 'do', label: t('bin.do'), art: 'salah.basics-masjid-door' },
            { id: 'dont', label: t('bin.dont'), art: 'kit.crate' },
          ]}
          items={items}
          hints={false}
          prompt={t('play.sort')}
          onDone={finishWith(api, items.length, FACT_OF)}
        />
      ) : (
        <SequenceBoard variant="path" items={visit} hints={false} endArt="salah.basics-masjid-door" prompt={t('play.visit')} onDone={finishWith(api, visit.length, FACT_OF)} />
      )}
    </GameBoard>
  );
}
