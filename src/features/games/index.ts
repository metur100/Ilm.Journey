import { registerKitDemos } from '@/core/games/kit/demos';

import { registerArkOfNuhGame } from './ark-of-nuh/register';
import { registerAyahBuilderGame } from './ayah-builder/register';
import { registerBuildTheMasjidGame } from './build-the-masjid/register';
import { registerGoodDeedsDayGame } from './good-deeds-day/register';
import { registerRamadanJourneyGame } from './ramadan-journey/register';
import { registerSurahGardenGame } from './surah-garden/register';
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
import { registerYusufStoryPathGame } from './yusuf-story-path/register';

/**
 * The v2 mini-games. Each game lives in `src/features/games/<id>/` and exports a `register<Name>Game()` that calls
 * `registerGame(def)` from `@/core/games`. Add one line per game below – see docs/GAMES-FRAMEWORK.md.
 */
export function registerGames(): void {
  // e.g. registerWuduFlowGame();
  registerArkOfNuhGame();
  registerYusufStoryPathGame();
  registerBuildTheMasjidGame();
  registerGoodDeedsDayGame();
  registerRamadanJourneyGame();
  registerAyahBuilderGame();
  registerSurahGardenGame();
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
