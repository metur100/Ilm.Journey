import { registerAdhanGame } from './adhan-iqamah/register';
import { registerFindQiblaGame } from './find-qibla/register';
import { registerGhuslGame } from './ghusl/register';
import { registerConditionsGame } from './salah-conditions/register';
import { registerTayammumGame } from './tayammum/register';
import { registerPrayerSkyGame } from './prayer-sky/register';
import { registerWuduFlowGame } from './wudu-flow/register';

/**
 * Section "salah" (docs/GAMES-V3.md): every game of this section lives in this folder and is registered here.
 * Owned by one author – do not register this section's games anywhere else. The prayers themselves (Sabah … Džuma)
 * are in the sibling section "salah-prayers".
 */
export function registerSalahGames(): void {
  registerWuduFlowGame();
  registerGhuslGame();
  registerTayammumGame();
  registerAdhanGame();
  registerConditionsGame();
  registerPrayerSkyGame();
  registerFindQiblaGame();
}
