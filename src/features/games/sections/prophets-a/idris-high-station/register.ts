import { type GameDef, registerGame } from '@/core/games';

import { episodeArt } from '../../prophets-story/episode';
import { lazyGame } from '../shared';
import { HIGH_PATH, IDRIS_FACTS, PATIENCE_EPISODE, TRUTH_EPISODE } from './content';
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
    // What the Quran says about Idris, one facet per level, each with its lesson.
    { level: 1, config: { mode: 'episode', episode: TRUTH_EPISODE }, facts: [IDRIS_FACTS.truthful, IDRIS_FACTS.truth] },
    { level: 2, config: { mode: 'episode', episode: PATIENCE_EPISODE }, facts: [IDRIS_FACTS.patient, IDRIS_FACTS.patience] },
    { level: 3, config: { mode: 'climb' }, facts: [IDRIS_FACTS.high, IDRIS_FACTS.heaven, IDRIS_FACTS.raised] },
  ],
  order: 2,
};

export const IDRIS_ART: string[] = ['prophet.idris-sky-steps', ...HIGH_PATH.flatMap((s) => (s.art ? [s.art] : [])), ...episodeArt(TRUTH_EPISODE), ...episodeArt(PATIENCE_EPISODE)];

export function registerIdrisGame(): void {
  registerGame(idrisGame);
}
