import { registerAdamNamesGame } from './adam-garden-names/register';

/**
 * Section "prophets-a" (docs/GAMES-V3.md): every game of this section lives in this folder and is registered here.
 * Owned by one author – do not register this section's games anywhere else.
 * One game per prophet: Adam, Idris, Nuh, Hud, Salih, Ibrahim, Lut, Ismail, Ishaq.
 */
export function registerProphetsAGames(): void {
  registerAdamNamesGame();
}
