import { useMemo } from 'react';

import type { GameApi } from '@/core/games';
import { GameBoard, SequenceBoard, SortBins, WordTiles, type KitItem, type SortItem } from '@/core/games/kit';

import { finishWith } from '../shared/content';
import { FACT_OF, fatihaAyahs, PLACE_ITEMS, POSITION_ART, rabbenaWords } from './content';

export interface WordsConfig {
  mode: 'places' | 'fatiha' | 'rabbena';
}

/** Words of Salah: L1 each text to its position, L2 the ayahs of Al-Fatiha in order, L3 Rabbena word by word. */
export function WordsGame(api: GameApi<WordsConfig>) {
  const { t, config } = api;
  const places = useMemo<SortItem[]>(() => PLACE_ITEMS.map((i) => ({ id: i.id, bin: i.bin, label: t(`item.${i.id}`), sub: t(`sub.${i.id}`) })), [t]);
  const ayahs = useMemo<KitItem[]>(() => fatihaAyahs().map((a) => ({ ...a, quran: true, a11y: `${t('ayah')}: ${a.arabic}` })), [t]);
  const words = useMemo<KitItem[]>(() => rabbenaWords().map((w) => ({ ...w, quran: true })), []);

  return (
    <GameBoard api={api}>
      {config.mode === 'places' ? (
        <SortBins
          bins={(['qiyam', 'ruku', 'sajda', 'sitting'] as const).map((id) => ({ id, label: t(`bin.${id}`), art: POSITION_ART[id] }))}
          items={places}
          visible={2}
          prompt={t('play.places')}
          onDone={finishWith(api, places.length, FACT_OF)}
        />
      ) : config.mode === 'fatiha' ? (
        <SequenceBoard items={ayahs} hints={false} prompt={t('play.fatiha')} onDone={finishWith(api, ayahs.length, FACT_OF)} />
      ) : (
        <WordTiles target={words} quran rtl prompt={t('play.rabbena')} onDone={finishWith(api, words.length, FACT_OF)} />
      )}
    </GameBoard>
  );
}
