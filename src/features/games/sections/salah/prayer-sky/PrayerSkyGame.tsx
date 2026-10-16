import { useMemo } from 'react';

import type { GameApi } from '@/core/games';
import { GameBoard, kitShuffle, MemoryPairs, type MemoryPair } from '@/core/games/kit';

import { finishWith } from '../shared/content';
import { PRAYER_BODY, PRAYER_IDS, SKY_FACTS, type PrayerId } from './content';
import { PRAYER_SKY } from './logic';
import { SunDial } from './SunDial';

export interface SkyConfig {
  mode: 'sun' | 'mixed' | 'memory';
}

const FACT_OF: Record<string, string> = { maghrib: SKY_FACTS.maghrib.id, fajr: SKY_FACTS.fixedTimes.id };

/** Prayer Sky: L1 move the sun to each prayer in order (phases described), L2 mixed order without hints, L3 memory. */
export function PrayerSkyGame(api: GameApi<SkyConfig>) {
  const { t, l, config } = api;
  const name = (p: PrayerId) => t(`prayer.${p}`);
  const prayers = useMemo<PrayerId[]>(() => (config.mode === 'mixed' ? kitShuffle([...PRAYER_IDS], `${api.gameId}:mixed`) : [...PRAYER_IDS]), [config.mode, api.gameId]);
  const pairs = useMemo<MemoryPair[]>(() => PRAYER_IDS.map((p) => ({ id: p, a: { label: t(`prayer.${p}`) }, b: { art: PRAYER_SKY[p], a11y: t(`prayer.${p}`) }, caption: l(PRAYER_BODY[p]) })), [t, l]);

  return (
    <GameBoard api={api}>
      {config.mode === 'memory' ? (
        <MemoryPairs pairs={pairs} columns={2} prompt={t('play.memory')} onDone={finishWith(api, pairs.length, FACT_OF)} />
      ) : (
        <SunDial
          prayers={prayers}
          name={name}
          explain={(p) => l(PRAYER_BODY[p])}
          describe={config.mode === 'sun'}
          hints={config.mode === 'sun'}
          prompt={t(config.mode === 'sun' ? 'play.sun' : 'play.mixed')}
          phaseText={(phase) => t(`phase.${phase}`)}
          findText={(prayer) => t('play.find', { prayer })}
          confirmText={(prayer) => t('play.confirm', { prayer })}
          earlierText={t('play.earlier')}
          laterText={t('play.later')}
          skyLabel={(phase) => t('play.sky', { phase })}
          onDone={finishWith(api, prayers.length, FACT_OF)}
        />
      )}
    </GameBoard>
  );
}
