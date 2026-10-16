import { registerSalahPrayerGameDefs } from './register';

/**
 * Section "salah-prayers" (docs/GAMES-V3.md): every game of this section lives in this folder and is registered here.
 * Owned by one author – do not register this section's games anywhere else.
 *
 * Games: salah-guide (step by step, keeps the v2 id), salah-sabah, salah-podne, salah-ikindija, salah-aksam,
 * salah-jacija, salah-vitr, salah-dzuma – all built on the PrayerGame component and the animated prayer figure.
 */
export function registerSalahPrayersGames(): void {
  registerSalahPrayerGameDefs();
}
