import { type GameDef, registerGame } from '@/core/games';

import { episodeArt } from '../../prophets-story/episode';
import { lazyGame } from '../shared';
import { CALL_BINS, CALL_ITEMS, GUESTS_EPISODE, LUT_FACTS, NIGHT_PATH } from './content';
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
    // Three events of Lut's story, each with its lesson: his call, the guests, leaving by night.
    { level: 1, config: { mode: 'sort' }, facts: [LUT_FACTS.messenger, LUT_FACTS.warned, LUT_FACTS.standUp] },
    { level: 2, config: { mode: 'episode', episode: GUESTS_EPISODE }, facts: [LUT_FACTS.guests, LUT_FACTS.protect] },
    { level: 3, config: { mode: 'path' }, facts: [LUT_FACTS.night, LUT_FACTS.pure, LUT_FACTS.company] },
  ],
  order: 7,
};

export const LUT_ART: string[] = ['prophet.lut-night-map', ...[...CALL_BINS, ...CALL_ITEMS, ...NIGHT_PATH].flatMap((x) => (x.art ? [x.art] : [])), ...episodeArt(GUESTS_EPISODE)];

export function registerLutGame(): void {
  registerGame(lutGame);
}
