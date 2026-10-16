import { registerYaqubRoadGame } from './yaqub-shirt-road/register';
import { registerYusufStorehouseGame } from './yusuf-storehouse/register';
import { registerYusufStoryPathGame } from './yusuf-story-path/register';

/**
 * Section "prophets-b" (docs/GAMES-V3.md): every game of this section lives in this folder and is registered here.
 * Owned by one author – do not register this section's games anywhere else.
 * Yaqub, Yusuf, Ayyub, Shuayb, Musa, Harun, Dhul-Kifl and Dawud (peace be upon them).
 */
export function registerProphetsBGames(): void {
  registerYaqubRoadGame();
  registerYusufStorehouseGame();
  registerYusufStoryPathGame();
}
