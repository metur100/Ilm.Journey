import { registerGame } from '@/core/games';

import { RAMADAN_GAMES, REGISTERED_ELSEWHERE } from './games';

/**
 * Section "ramadan" (docs/GAMES-V3.md): every game of this section lives in this folder and is registered here.
 * Owned by one author – do not register this section's games anywhere else.
 */
export function registerRamadanGames(): void {
  for (const game of RAMADAN_GAMES) if (!REGISTERED_ELSEWHERE.has(game.id)) registerGame(game);
}
