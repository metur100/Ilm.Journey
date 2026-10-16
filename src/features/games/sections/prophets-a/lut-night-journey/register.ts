import { type GameDef, registerGame } from '@/core/games';

import { lazyGame } from '../shared';
import { CALL_BINS, CALL_ITEMS, CATCH_ITEMS, LUT_FACTS, NIGHT_PATH } from './content';
import { lutI18n } from './i18n';
import type { LutConfig } from './LutGame';

export const LUT_GAME_ID = 'lut-night-journey';

export const lutGame: GameDef<LutConfig> = {
  id: LUT_GAME_ID,
  topicId: 'prophets',
  i18n: lutI18n,
  coverArt: 'prophet.lut-lantern',
  hintArt: 'prophet.lut-night-map',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./LutGame') as typeof import('./LutGame')).LutGame),
  levels: [
    { level: 1, config: { mode: 'sort' }, facts: [LUT_FACTS.messenger, LUT_FACTS.warned, LUT_FACTS.guests] },
    { level: 2, config: { mode: 'path' }, facts: [LUT_FACTS.night, LUT_FACTS.morning] },
    { level: 3, config: { mode: 'catch' }, facts: [LUT_FACTS.pure] },
  ],
  order: 7,
};

export const LUT_ART: string[] = [
  'prophet.lut-night-map',
  'kit.basket',
  ...[...CALL_BINS, ...CALL_ITEMS, ...NIGHT_PATH, ...CATCH_ITEMS].flatMap((x) => (x.art ? [x.art] : [])),
];

export function registerLutGame(): void {
  registerGame(lutGame);
}
