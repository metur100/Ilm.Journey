/**
 * Game framework (v2): register games, read progress, render them inside the GameShell.
 * Guide for game authors: docs/GAMES-FRAMEWORK.md.
 */
export * from './hooks';
export * from './progress';
export * from './registry';
export { GAMES_PERSIST, type LevelSummary, startGamesAutoSave, useGamesStore, type GamesStore } from './store';
export * from './types';
