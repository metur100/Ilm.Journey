import { type ComponentType, createElement } from 'react';

import { type GameApi, type GameDef, registerGame } from '@/core/games';
import { translateNs } from '@/core/i18n';

import { DEEDS_FACTS } from '../good-deeds-day/register';
import type { DeedsConfig } from '../good-deeds-day/GoodDeedsDayGame';
import { deedsI18n } from '../good-deeds-day/i18n';
import { RAMADAN_DAY } from '../good-deeds-day/content';
import { ramadanJourneyI18n } from './i18n';

export const RAMADAN_JOURNEY_ID = 'ramadan-journey';

const LazyRamadanJourney: ComponentType<GameApi<DeedsConfig>> = (props) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { GoodDeedsDayGame } = require('../good-deeds-day/GoodDeedsDayGame') as typeof import('../good-deeds-day/GoodDeedsDayGame');
  // The shared Ramadan scene renderer keeps its scene/action translations; the new game has its own shelf identity.
  const sharedApi = { ...props, t: (key: string, params?: Record<string, string | number>) => translateNs(deedsI18n, props.language, key as never, params) };
  return createElement(GoodDeedsDayGame, sharedApi);
};

export const ramadanJourneyGame: GameDef<DeedsConfig> = {
  id: RAMADAN_JOURNEY_ID,
  challengeCount: RAMADAN_DAY.length,
  topicId: 'ramadan',
  i18n: ramadanJourneyI18n,
  coverArt: 'object.lantern-ramadan',
  hintArt: 'food.dates',
  component: LazyRamadanJourney,
  levels: [{ level: 1, config: { day: 'ramadan' }, facts: [DEEDS_FACTS.suhoor, DEEDS_FACTS.iftar, DEEDS_FACTS.safe] }],
  teaches: { questionKeys: ['quest:ramadan-dizzy', 'quest:ramadan-iftar-dates', 'quest:ramadan-suhoor-blessing', 'quest:ramadan-charity-scenario'] },
  order: 10,
};

export function registerRamadanJourneyGame(): void {
  registerGame(ramadanJourneyGame);
}