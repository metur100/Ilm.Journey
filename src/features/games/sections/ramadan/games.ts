import type { GameDef } from '@/core/games';

import { bajramMorningGame } from './bajram-morning/game';
import { fastKeeperGame } from './fast-keeper/game';
import { iftarTableGame } from './iftar-table/game';
import { newCrescentGame } from './new-crescent/game';
import { oddNightsGame } from './odd-nights/game';
import { ramadanJourneyGame } from './ramadan-journey/game';
import { ramadanWordsGame } from './ramadan-words/game';
import { suhoorIftarSkyGame } from './suhoor-iftar-sky/game';
import { taraweehTowerGame } from './taraweeh-tower/game';
import { thirtyLanternsGame } from './thirty-lanterns/game';
import { whoFastsGame } from './who-fasts/game';
import { zakatAlFitrGame } from './zakat-al-fitr/game';

/** All games of the Ramadan section in shelf order – all registered by `registerRamadanGames()`. */
export const RAMADAN_GAMES: GameDef<any>[] = [ramadanJourneyGame, suhoorIftarSkyGame, fastKeeperGame, newCrescentGame, thirtyLanternsGame, oddNightsGame, iftarTableGame, zakatAlFitrGame, bajramMorningGame, whoFastsGame, taraweehTowerGame, ramadanWordsGame];

/** Games of this list registered by another entry point (none since the v2 shims were removed). */
export const REGISTERED_ELSEWHERE = new Set<string>();
