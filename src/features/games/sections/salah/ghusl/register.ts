import { registerGame, type GameDef } from '@/core/games';

import { GHUSL_FACTS } from './content';
import { GhuslGame, type GhuslConfig } from './GhuslGame';
import { ghuslI18n } from './i18n';

/** Gusul (ghusl): rub water over every part (no dry spot), the Prophet's way of gusul, when it is needed. */
export const ghuslGame: GameDef<GhuslConfig> = {
  id: 'ghusl',
  topicId: 'salah',
  i18n: ghuslI18n,
  coverArt: 'salah.basics-shower',
  hintArt: 'body.arms',
  component: GhuslGame,
  levels: [
    { level: 1, config: { mode: 'rub' }, facts: [GHUSL_FACTS.farz, GHUSL_FACTS.schools] },
    { level: 2, config: { mode: 'steps' }, facts: [GHUSL_FACTS.prophet, GHUSL_FACTS.right] },
    { level: 3, config: { mode: 'when' }, facts: [GHUSL_FACTS.when, GHUSL_FACTS.friday] },
  ],
  order: 15,
};

export function registerGhuslGame(): void {
  registerGame(ghuslGame);
}
