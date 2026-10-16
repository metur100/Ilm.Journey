import type { GameDef } from '@/core/games';
import { registerGame } from '@/core/games';

import { fourCaliphsGame } from './four-caliphs';
import { hijriCalendarGame } from './hijri-calendar';
import { mushafGame } from './mushaf';

/**
 * Section "history" (docs/GAMES-V3.md §3.6): every game of this section lives in this folder and is registered here.
 * Owned by one author – do not register this section's games anywhere else.
 */
export const HISTORY_GAMES: GameDef<any>[] = [fourCaliphsGame, mushafGame, hijriCalendarGame];

export function registerHistoryGames(): void {
  for (const game of HISTORY_GAMES) registerGame(game);
}
