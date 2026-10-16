import { registerSurahScenesGame } from './surah-scenes/register';
import { registerQuranEtiquetteGame } from './quran-etiquette/register';
import { registerAyahBuilderGame } from './ayah-builder/register';
import { registerListenAndOrderGame } from './listen-and-order/register';
import { registerSurahGardenGame } from './surah-garden/register';
import { registerSurahMessagesGame } from './surah-messages/register';

/**
 * Section "quran" (docs/GAMES-V3.md): every game of this section lives in this folder and is registered here.
 * Owned by one author – do not register this section's games anywhere else.
 */
export function registerQuranGames(): void {
  registerAyahBuilderGame();
  registerSurahGardenGame();
  registerSurahMessagesGame();
  registerListenAndOrderGame();
  registerQuranEtiquetteGame();
  registerSurahScenesGame();
}
