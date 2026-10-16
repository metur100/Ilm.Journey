import type { GameDef } from '@/core/games';

import { bajramMorningGame } from './bajram-morning/game';
import { fastKeeperGame } from './fast-keeper/game';
import { iftarTableGame } from './iftar-table/game';
import { newCrescentGame } from './new-crescent/game';
import { oddNightsGame } from './odd-nights/game';
import { ramadanJourneyGame } from './ramadan-journey/game';
import { suhoorIftarSkyGame } from './suhoor-iftar-sky/game';
import { taraweehTowerGame } from './taraweeh-tower/game';
import { thirtyLanternsGame } from './thirty-lanterns/game';
import { whoFastsGame } from './who-fasts/game';
import { zakatAlFitrGame } from './zakat-al-fitr/game';

/**
 * All games of the Ramadan section in shelf order. Ramadan Journey keeps its v2 entry point
 * (`../../ramadan-journey/register.ts`, already wired in `src/features/games/index.ts`), so it is listed here but
 * registered there.
 */
export const RAMADAN_GAMES: GameDef<any>[] = [ramadanJourneyGame, suhoorIftarSkyGame, fastKeeperGame, newCrescentGame, thirtyLanternsGame, oddNightsGame, iftarTableGame, zakatAlFitrGame, bajramMorningGame, whoFastsGame, taraweehTowerGame];

export const REGISTERED_ELSEWHERE = new Set([ramadanJourneyGame.id]);
