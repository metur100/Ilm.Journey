import { useMemo, useSyncExternalStore } from 'react';

import { toDayKey } from '../utils/date';
import { EMPTY_GAME_PROGRESS, isLevelUnlocked, isNewGame, levelProgress, totalStars } from './progress';
import { gameOfTheDay, getGamesVersion, listGames, subscribeGames } from './registry';
import { useGamesStore } from './store';
import { GAME_LEVELS, type GameLevel } from './types';

/** Registered games visible to the learner (re-renders when games register, e.g. after fast refresh). */
export function useGames() {
  const version = useSyncExternalStore(subscribeGames, getGamesVersion, getGamesVersion);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => listGames(), [version]);
}

/** Today's game (null when no game is registered). */
export function useGameOfTheDay() {
  const games = useGames();
  const today = toDayKey(new Date());
  return useMemo(() => gameOfTheDay(today, games), [games, today]);
}

/** Progress of one game: best stars per level, unlock state, totals and the "new" marker. */
export function useGameProgress(gameId: string) {
  const data = useGamesStore((s) => s.games);
  const challengeMode = useGamesStore((s) => s.challengeMode);
  return useMemo(() => {
    const state = { games: data, challengeMode };
    const progress = data[gameId] ?? EMPTY_GAME_PROGRESS;
    return {
      progress,
      totalStars: totalStars(state, gameId),
      isNew: isNewGame(state, gameId),
      level: (level: GameLevel) => levelProgress(state, gameId, level),
      isUnlocked: (level: GameLevel) => isLevelUnlocked(state, gameId, level),
      completedLevels: GAME_LEVELS.filter((l) => !!levelProgress(state, gameId, l)).length,
    };
  }, [data, challengeMode, gameId]);
}
