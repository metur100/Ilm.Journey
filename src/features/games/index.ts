import { registerKitDemos } from '@/core/games/kit/demos';

import { registerBuildTheMasjidGame } from './build-the-masjid/register';
import { registerGoodDeedsDayGame } from './good-deeds-day/register';
import { registerSalahPrayersGames } from './sections/salah-prayers';
import { registerSalahGames } from './sections/salah';
import { registerQuranGames } from './sections/quran';
import { registerArabicGames } from './sections/arabic';
import { registerProphetsAGames } from './sections/prophets-a';
import { registerProphetsBGames } from './sections/prophets-b';
import { registerProphetsCGames } from './sections/prophets-c';
import { registerSeerahGames } from './sections/seerah';
import { registerAkhlaqGames } from './sections/akhlaq';
import { registerRamadanGames } from './sections/ramadan';
import { registerHistoryGames } from './sections/history';

/**
 * Registers every game exactly once: the two remaining v2 games with their own folder, the kit demos and the v3
 * sections (each section registers the games of its folder) – see docs/GAMES-FRAMEWORK.md and docs/GAMES-V3.md.
 */
export function registerGames(): void {
  registerBuildTheMasjidGame();
  registerGoodDeedsDayGame();
  // Kit demo games (development fixtures, one per engine – hidden in production builds)
  registerKitDemos();
  // v3 sections (docs/GAMES-V3.md)
  registerSalahPrayersGames();
  registerSalahGames();
  registerQuranGames();
  registerArabicGames();
  registerProphetsAGames();
  registerProphetsBGames();
  registerProphetsCGames();
  registerSeerahGames();
  registerAkhlaqGames();
  registerRamadanGames();
  registerHistoryGames();
}
