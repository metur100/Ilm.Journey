import { registerAlyasaGame } from './alyasa-among-best/register';
import { registerIlyasGame } from './ilyas-lanterns/register';
import { registerIsaGame } from './isa-palm-dates/register';
import { registerMuhammadGame } from './muhammad-messengers-chain/register';
import { registerSulaymanGame } from './sulayman-ants-valley/register';
import { registerYahyaGame } from './yahya-qualities/register';
import { registerYunusGame } from './yunus-darkness-light/register';
import { registerZakariyyaGame } from './zakariyya-mihrab/register';

/**
 * Section "prophets-c" (docs/GAMES-V3.md): every game of this section lives in this folder and is registered here.
 * Owned by one author – do not register this section's games anywhere else.
 * One game per prophet: Sulayman, Ilyas, Al-Yasa, Yunus, Zakariyya, Yahya, Isa, Muhammad ﷺ.
 */
export function registerProphetsCGames(): void {
  registerSulaymanGame(); // 18 – The Valley of the Ants (PathTrace)
  registerIlyasGame(); // 19 – Lanterns of the Call (BuildScene)
  registerAlyasaGame(); // 20 – Among the Best (MemoryPairs)
  registerYunusGame(); // 21 – Light in the Darknesses (WordTiles)
  registerZakariyyaGame(); // 22 – The Mihrab (TapScene)
  registerYahyaGame(); // 23 – What Yahya Was (SortBins)
  registerIsaGame(); // 24 – The Palm Tree and the Stream (CatchGame)
  registerMuhammadGame(); // 25 – The Chain of the Messengers (TimelineSlider + SequenceBoard path)
}
