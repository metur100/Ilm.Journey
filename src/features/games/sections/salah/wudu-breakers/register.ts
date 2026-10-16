import { registerGame, type GameDef } from '@/core/games';

import { BreakersGame, type BreakersConfig } from './BreakersGame';
import { BREAKER_FACTS } from './content';
import { breakersI18n } from './i18n';

/** What breaks it? Catch what breaks wudu, sort what breaks the prayer, then both mixed (Hanafi). */
export const breakersGame: GameDef<BreakersConfig> = {
  id: 'wudu-breakers',
  topicId: 'salah',
  i18n: breakersI18n,
  coverArt: 'salah.basics-ibrik',
  hintArt: 'kit.basket',
  component: BreakersGame,
  levels: [
    { level: 1, config: { mode: 'catch' }, facts: [BREAKER_FACTS.wudu, BREAKER_FACTS.doubt] },
    { level: 2, config: { mode: 'prayer' }, facts: [BREAKER_FACTS.prayer, BREAKER_FACTS.khushu] },
    { level: 3, config: { mode: 'mixed' }, facts: [BREAKER_FACTS.schools, BREAKER_FACTS.accept] },
  ],
  order: 45,
};

export function registerBreakersGame(): void {
  registerGame(breakersGame);
}
