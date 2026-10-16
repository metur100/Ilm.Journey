import type { GameDef } from '@/core/games';
import { registerGame } from '@/core/games';

import { bosniaLandmarksGame } from './bosnia-landmarks';
import { cordobaArchesGame } from './cordoba-arches';
import { fourCaliphsGame } from './four-caliphs';
import { goldenAgeGame } from './golden-age';
import { greatMosquesGame } from './great-mosques';
import { hijriCalendarGame } from './hijri-calendar';
import { houseOfWisdomGame } from './house-of-wisdom';
import { ibnBattutaGame } from './ibn-battuta';
import { islamicTimelineGame } from './islamic-timeline';
import { mushafGame } from './mushaf';
import { patternTilesGame } from './pattern-tiles';
import { scholarsBooksGame } from './scholars-books';

/**
 * Section "history" (docs/GAMES-V3.md §3.6): every game of this section lives in this folder and is registered here.
 * Owned by one author – do not register this section's games anywhere else.
 */
export const HISTORY_GAMES: GameDef<any>[] = [
  fourCaliphsGame,
  mushafGame,
  hijriCalendarGame,
  houseOfWisdomGame,
  goldenAgeGame,
  scholarsBooksGame,
  islamicTimelineGame,
  greatMosquesGame,
  bosniaLandmarksGame,
  cordobaArchesGame,
  ibnBattutaGame,
  patternTilesGame,
];

export function registerHistoryGames(): void {
  for (const game of HISTORY_GAMES) registerGame(game);
}
