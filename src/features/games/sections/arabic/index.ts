import { registerTwinLettersGame } from './twin-letters/register';

/**
 * Section "arabic" – Arabic / Sufara (docs/GAMES-V3.md §3.3): every game of this section lives in this folder and is
 * registered here, in the order of the sufara path (letters → forms → harakat → joining → reading).
 * Owned by one author – do not register this section's games anywhere else.
 */
export function registerArabicGames(): void {
  registerTwinLettersGame();
}

/** Game ids of the section in sufara-path order (the Sufara screen links to them). */
export const ARABIC_GAME_IDS = ['twin-letters'] as const;
