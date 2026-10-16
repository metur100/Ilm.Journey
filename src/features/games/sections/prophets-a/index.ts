import { registerAdamNamesGame } from './adam-garden-names/register';
import { registerArkOfNuhGame } from './ark-of-nuh/register';
import { registerHudGame } from './hud-valley-of-ad/register';
import { registerIbrahimGame } from './ibrahim-kaaba-walls/register';
import { registerIdrisGame } from './idris-high-station/register';
import { registerLutGame } from './lut-night-journey/register';
import { registerSalihGame } from './salih-water-days/register';

/**
 * Section "prophets-a" (docs/GAMES-V3.md): every game of this section lives in this folder and is registered here.
 * Owned by one author – do not register this section's games anywhere else.
 * One game per prophet: Adam, Idris, Nuh, Hud, Salih, Ibrahim, Lut, Ismail, Ishaq.
 */
export function registerProphetsAGames(): void {
  registerAdamNamesGame();
  registerIdrisGame();
  registerArkOfNuhGame();
  registerHudGame();
  registerSalihGame();
  registerIbrahimGame();
  registerLutGame();
}
