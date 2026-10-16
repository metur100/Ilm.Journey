import { registerAlyasaGame } from './alyasa-among-best/register';
import { registerIlyasGame } from './ilyas-lanterns/register';
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
  registerSulaymanGame();
  registerIlyasGame();
  registerAlyasaGame();
  registerYunusGame();
  registerZakariyyaGame();
  registerYahyaGame();
}
