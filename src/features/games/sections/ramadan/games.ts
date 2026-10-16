import type { GameDef } from '@/core/games';

import { fastKeeperGame } from './fast-keeper/game';
import { iftarTableGame } from './iftar-table/game';
import { newCrescentGame } from './new-crescent/game';
import { oddNightsGame } from './odd-nights/game';
import { ramadanJourneyGame } from './ramadan-journey/game';
import { suhoorIftarSkyGame } from './suhoor-iftar-sky/game';
import { thirtyLanternsGame } from './thirty-lanterns/game';

/**
 * All games of the Ramadan section in shelf order. Ramadan Journey keeps its v2 entry point
 * (`../../ramadan-journey/register.ts`, already wired in `src/features/games/index.ts`), so it is listed here but
 * registered there.
 */
export const RAMADAN_GAMES: GameDef<any>[] = [ramadanJourneyGame, suhoorIftarSkyGame, fastKeeperGame, newCrescentGame, thirtyLanternsGame, oddNightsGame, iftarTableGame];

export const REGISTERED_ELSEWHERE = new Set([ramadanJourneyGame.id]);
