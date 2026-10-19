import { registerArabicBodyGame } from './body';
import { registerArabicColorsGame } from './colors';
import { registerArabicFamilyGame } from './family';
import { registerArabicFoodGame } from './food';
import { registerArabicGreetingsGame } from './greetings';
import { registerArabicNumbersGame } from './numbers';
import { registerArabicOppositesGame } from './opposites';
import { registerArabicPhrasesGame } from './phrases';
import { registerArabicPrayerWordsGame } from './prayer-words';
import { registerArabicTimesGame } from './times';

/**
 * The ten "Arabic basics" games of the Play section "Arabic" (topic `arabic`), registered by
 * `registerArabicGames()` in the parent folder. Data lives in `data.ts`, one file per game holds its i18n and
 * levels.
 */
export function registerArabicBasicsGames(): void {
  registerArabicGreetingsGame();
  registerArabicNumbersGame();
  registerArabicColorsGame();
  registerArabicFamilyGame();
  registerArabicBodyGame();
  registerArabicFoodGame();
  registerArabicTimesGame();
  registerArabicOppositesGame();
  registerArabicPrayerWordsGame();
  registerArabicPhrasesGame();
}
