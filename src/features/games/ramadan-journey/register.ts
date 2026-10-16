import { registerGame } from '@/core/games';

import { RAMADAN_JOURNEY_ID, ramadanJourneyGame } from '../sections/ramadan/ramadan-journey/game';

/*
 * Ramadan Journey moved into the Ramadan section (sections/ramadan/ramadan-journey) and was rebuilt on the kit.
 * The id and this entry point stay, so existing progress and the line in ../index.ts keep working.
 */
export { RAMADAN_JOURNEY_ID, ramadanJourneyGame };

export function registerRamadanJourneyGame(): void {
  registerGame(ramadanJourneyGame);
}
