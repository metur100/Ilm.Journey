/**
 * Ark of Nuh moved into the prophets-a section (`src/features/games/sections/prophets-a/ark-of-nuh`). This re-export
 * keeps existing imports working; registering twice is harmless (the registry replaces the game by id).
 */
export { ARK_GAME_ID, arkGame, registerArkOfNuhGame } from '../sections/prophets-a/ark-of-nuh/register';
