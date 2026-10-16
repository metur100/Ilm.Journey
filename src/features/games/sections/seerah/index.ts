import { registerCaveHiraGame } from './cave-hira/register';
import { registerJourneysMapGame } from './journeys-map/register';
import { registerYearOfTheElephantGame } from './year-of-the-elephant/register';

/**
 * Section "seerah" (docs/GAMES-V3.md): every game of this section lives in this folder and is registered here.
 * Owned by one author – do not register this section's games anywhere else. (Build the Masjid is registered from
 * its own folder `src/features/games/build-the-masjid`.)
 */
export function registerSeerahGames(): void {
  registerYearOfTheElephantGame();
  registerCaveHiraGame();
  registerJourneysMapGame();
}
