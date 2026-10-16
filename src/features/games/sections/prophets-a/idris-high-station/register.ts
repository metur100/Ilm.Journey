import { type GameDef, registerGame } from '@/core/games';

import { lazyGame } from '../shared';
import { IDRIS_FACTS, PATH_L2, QUALITY_BINS, QUALITY_ITEMS } from './content';
import type { IdrisConfig } from './IdrisGame';
import { idrisI18n } from './i18n';

export const IDRIS_GAME_ID = 'idris-high-station';

export const idrisGame: GameDef<IdrisConfig> = {
  id: IDRIS_GAME_ID,
  topicId: 'prophets',
  i18n: idrisI18n,
  coverArt: 'prophet.idris-high-place',
  hintArt: 'prophet.idris-star',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  component: lazyGame(() => (require('./IdrisGame') as typeof import('./IdrisGame')).IdrisGame),
  levels: [
    { level: 1, config: { mode: 'path' }, facts: [IDRIS_FACTS.truthful, IDRIS_FACTS.high] },
    { level: 2, config: { mode: 'pathFree' }, facts: [IDRIS_FACTS.patient, IDRIS_FACTS.mercy] },
    { level: 3, config: { mode: 'sort' }, facts: [IDRIS_FACTS.qualities, IDRIS_FACTS.heaven] },
  ],
  order: 2,
};

export const IDRIS_ART: string[] = [
  'prophet.idris-sky-steps',
  ...PATH_L2.flatMap((s) => (s.art ? [s.art] : [])),
  ...QUALITY_BINS.flatMap((b) => (b.art ? [b.art] : [])),
  ...QUALITY_ITEMS.flatMap((i) => (i.art ? [i.art] : [])),
];

export function registerIdrisGame(): void {
  registerGame(idrisGame);
}
