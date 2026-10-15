import { registerArkOfNuhGame } from './ark-of-nuh/register';
import { registerAyahBuilderGame } from './ayah-builder/register';
import { registerFindQiblaGame } from './find-qibla/register';
import { registerBuildTheMasjidGame } from './build-the-masjid/register';
import { registerGoodDeedsDayGame } from './good-deeds-day/register';
import { registerHijrahPathGame } from './hijrah-path/register';
import { registerLetterLanternsGame } from './letter-lanterns/register';
import { registerPrayerSkyGame } from './prayer-sky/register';
import { registerRamadanJourneyGame } from './ramadan-journey/register';
import { registerSurahGardenGame } from './surah-garden/register';
import { registerSalahGuideGame } from './salah-guide/register';
import { registerTopicArcadeGames } from './topic-arcade';
import { registerWordBuilderGame } from './word-builder/register';
import { registerWuduFlowGame } from './wudu-flow/register';
import { registerYusufStoryPathGame } from './yusuf-story-path/register';

/**
 * The v2 mini-games. Each game lives in `src/features/games/<id>/` and exports a `register<Name>Game()` that calls
 * `registerGame(def)` from `@/core/games`. Add one line per game below – see docs/GAMES-FRAMEWORK.md.
 */
export function registerGames(): void {
  // e.g. registerWuduFlowGame();
  registerArkOfNuhGame();
  registerYusufStoryPathGame();
  registerHijrahPathGame();
  registerBuildTheMasjidGame();
  registerGoodDeedsDayGame();
  registerRamadanJourneyGame();
  registerWuduFlowGame();
  registerPrayerSkyGame();
  registerSalahGuideGame();
  registerFindQiblaGame();
  registerAyahBuilderGame();
  registerSurahGardenGame();
  registerLetterLanternsGame();
  registerWordBuilderGame();
  registerTopicArcadeGames();
}
