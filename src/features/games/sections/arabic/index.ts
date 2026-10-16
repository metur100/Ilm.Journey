import { registerHarakatSoundsGame } from './harakat-sounds/register';
import { registerJoinLettersGame } from './join-letters/register';
import { registerLetterTraceGame } from './letter-trace/register';
import { registerLetterDotsGame } from './letter-dots/register';
import { registerAlphabetPathGame } from './alphabet-path/register';
import { registerLetterLanternsGame } from './letter-lanterns/register';
import { registerLetterFormsGame } from './letter-forms/register';
import { registerTwinLettersGame } from './twin-letters/register';
import { registerWordBuilderGame } from './word-builder/register';
import { registerWordMemoryGame } from './word-memory/register';

/**
 * Section "arabic" – Arabic / Sufara (docs/GAMES-V3.md §3.3): every game of this section lives in this folder and is
 * registered here, in the order of the sufara path (letters → forms → harakat → joining → reading).
 * Owned by one author – do not register this section's games anywhere else.
 */
export function registerArabicGames(): void {
  registerLetterTraceGame();
  registerLetterLanternsGame();
  registerAlphabetPathGame();
  registerLetterDotsGame();
  registerTwinLettersGame();
  registerLetterFormsGame();
  registerJoinLettersGame();
  registerHarakatSoundsGame();
  registerWordBuilderGame();
  registerWordMemoryGame();
}

/** Game ids of the section in sufara-path order (the Sufara screen links to them). */
export const ARABIC_GAME_IDS = ['letter-trace', 'letter-lanterns', 'alphabet-path', 'letter-dots', 'twin-letters', 'letter-forms', 'join-letters', 'harakat-sounds', 'word-builder', 'word-memory'] as const;
