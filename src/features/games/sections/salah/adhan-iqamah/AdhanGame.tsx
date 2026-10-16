import { useMemo } from 'react';

import type { GameApi } from '@/core/games';
import { GameBoard, SequenceBoard, SortBins, type KitItem, type SortItem } from '@/core/games/kit';

import { finishWith } from '../shared/content';
import { EZAN, EZAN_SABAH, FACT_OF, WHICH_ITEMS, type Phrase } from './content';

export interface AdhanConfig {
  mode: 'path' | 'sabah' | 'which';
}

/** Ezan & ikamet: L1 phrases on the path up the minaret, L2 the ezan of Sabah from memory, L3 ezan / ikamet / both. */
export function AdhanGame(api: GameApi<AdhanConfig>) {
  const { t, config } = api;
  const phrase = useMemo(() => (p: Phrase, withMeaning: boolean): KitItem => ({ id: p.id, label: t(`phrase.${p.id}`), sub: withMeaning ? `${t('times', { n: p.times })} · ${t(`mean.${p.id}`)}` : t('times', { n: p.times }) }), [t]);
  const ezan = useMemo(() => EZAN.map((p) => phrase(p, true)), [phrase]);
  const sabah = useMemo(() => EZAN_SABAH.map((p) => phrase(p, false)), [phrase]);
  const which = useMemo<SortItem[]>(
    () => WHICH_ITEMS.map((i) => ({ id: i.id, bin: i.bin, art: i.art, label: i.art ? t(`item.${i.id}`) : t(`phrase.${i.id}`), sub: i.art ? undefined : t(`mean.${i.id}`) })),
    [t],
  );

  return (
    <GameBoard api={api}>
      {config.mode === 'path' ? (
        <SequenceBoard variant="path" columns={2} items={ezan} endArt="salah.basics-minaret" prompt={t('play.path')} onDone={finishWith(api, ezan.length, FACT_OF)} />
      ) : config.mode === 'sabah' ? (
        <SequenceBoard items={sabah} hints={false} prompt={t('play.sabah')} onDone={finishWith(api, sabah.length, FACT_OF)} />
      ) : (
        <SortBins
          bins={[
            { id: 'ezan', label: t('bin.ezan'), art: 'salah.basics-minaret' },
            { id: 'ikamet', label: t('bin.ikamet'), art: 'salah.prayer-qiyam' },
            { id: 'both', label: t('bin.both'), art: 'kit.basket' },
          ]}
          items={which}
          hints={false}
          prompt={t('play.which')}
          onDone={finishWith(api, which.length, FACT_OF)}
        />
      )}
    </GameBoard>
  );
}
