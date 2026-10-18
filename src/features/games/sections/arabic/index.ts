import { registerHarakatSoundsGame } from './harakat-sounds/register';
import { registerJoinLettersGame } from './join-letters/register';
import { registerLetterTraceGame } from './letter-trace/register';
import { registerLetterDotsGame } from './letter-dots/register';
import { registerMarksWorkshopGame } from './marks-workshop/register';
import { registerMaddStretchGame } from './madd-stretch/register';
import { registerNonJoinersGame } from './non-joiners/register';
import { registerSyllableReadingGame } from './syllable-reading/register';
import { registerAlphabetPathGame } from './alphabet-path/register';
import { registerLetterLanternsGame } from './letter-lanterns/register';
import { registerLetterFormsGame } from './letter-forms/register';
import { registerTwinLettersGame } from './twin-letters/register';
import { registerWordBuilderGame } from './word-builder/register';
import { registerWordMemoryGame } from './word-memory/register';

/**
 * Sections "sufara" and "arabic" (docs/GAMES-V3.md §3.3): every game of these sections lives in this folder and is
 * registered here, in sufara order (letters → forms → joining → harakat → reading, then the word games of "arabic").
 * Which section a game belongs to is set in shared/define.ts (SUFARA_GAME_IDS).
 * Owned by one author – do not register this section's games anywhere else.
 */
export function registerArabicGames(): void {
  registerLetterTraceGame();
  registerLetterLanternsGame();
  registerAlphabetPathGame();
  registerLetterDotsGame();
  registerTwinLettersGame();
  registerLetterFormsGame();
  registerNonJoinersGame();
  registerJoinLettersGame();
  registerHarakatSoundsGame();
  registerMarksWorkshopGame();
  registerMaddStretchGame();
  registerSyllableReadingGame();
  registerWordBuilderGame();
  registerWordMemoryGame();
}

/** Game ids of this folder in sufara order. */
export const ARABIC_GAME_IDS = ['letter-trace', 'letter-lanterns', 'alphabet-path', 'letter-dots', 'twin-letters', 'letter-forms', 'non-joiners', 'join-letters', 'harakat-sounds', 'marks-workshop', 'madd-stretch', 'syllable-reading', 'word-builder', 'word-memory'] as const;
