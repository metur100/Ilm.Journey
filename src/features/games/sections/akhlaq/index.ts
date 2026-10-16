import type { GameDef } from '@/core/games';
import { registerGame } from '@/core/games';

import { calmTheStormGame } from './calm-the-storm/register';
import { helpingAtHomeGame } from './helping-at-home/register';
import { waterForTheThirstyGame } from './water-for-the-thirsty/register';
import { salamStreetGame } from './salam-street/register';
import { gratitudeJarGame } from './gratitude-jar/register';
import { returnTheTrustGame } from './return-the-trust/register';
import { tidyUpGame } from './tidy-up/register';

/**
 * Section "akhlaq" (docs/GAMES-V3.md): every game of this section lives in this folder and is registered here.
 * Owned by one author – do not register this section's games anywhere else. (A Day of Good Deeds keeps its v2
 * folder `src/features/games/good-deeds-day` and its own register line.)
 */
export const AKHLAQ_GAMES: GameDef<any>[] = [returnTheTrustGame, tidyUpGame, gratitudeJarGame, calmTheStormGame, helpingAtHomeGame, waterForTheThirstyGame, salamStreetGame];

export function registerAkhlaqGames(): void {
  for (const game of AKHLAQ_GAMES) registerGame(game);
}
