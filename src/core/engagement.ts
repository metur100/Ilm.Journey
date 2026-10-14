import { registerCollectionCore } from './collection/store';
import { registerDemoGame } from './games/demo/register';
import { gameAchievements } from './games/progress';
import { factQuestion, findFact, gameOfTheDay, gameTarget, gameTitle, getGame } from './games/registry';
import { startGamesAutoSave, useGamesStore } from './games/store';
import { startGardenAutoSave, useGardenStore } from './garden/store';
import { registerAchievements, registerLifecycle, registerProgress, registerQuestions, registerQuestProvider } from './registry';
import { topicThemes } from './theme/topics';

/**
 * Registers the core v2 engagement systems with the registry: the games and garden stores (hydrate / reset /
 * auto-save), game fact review questions (`game:<gameId>:<factId>`), game achievements for the collection album,
 * "play today's game" quests and the demo game fixture. Called once from `registerFeatures()` before hydration.
 */
export function registerEngagement(): void {
  registerLifecycle('games', {
    hydrate: () => useGamesStore.getState().hydrate(),
    reset: () => useGamesStore.getState().reset(),
    autoSave: startGamesAutoSave,
  });
  registerCollectionCore();
  registerLifecycle('garden', {
    hydrate: () => useGardenStore.getState().hydrate(),
    reset: () => useGardenStore.getState().reset(),
    autoSave: startGardenAutoSave,
  });

  // Screens that read feature progress (home, play shelf, collection) re-render when games or the garden change.
  registerProgress('games', { subscribe: (listener) => useGamesStore.subscribe(listener) });
  registerProgress('garden', { subscribe: (listener) => useGardenStore.subscribe(listener) });

  // Missed game facts come back in the review centre as questions built from the fact (`factQuestion`).
  registerQuestions('game', {
    get: (id) => {
      const split = id.indexOf(':');
      const game = split > 0 ? getGame(id.slice(0, split)) : undefined;
      const fact = game ? findFact(game, id.slice(split + 1)) : undefined;
      return game && fact ? factQuestion(game, fact) : undefined;
    },
    context: (id) => {
      const game = getGame(id.slice(0, Math.max(0, id.indexOf(':'))));
      return game ? { title: gameTitle(game), topicArea: game.topicId, icon: topicThemes[game.topicId].icon } : undefined;
    },
  });

  registerAchievements('games', () => gameAchievements(useGamesStore.getState()));

  // Today's quests include the game of the day.
  registerQuestProvider('games', ({ day }) => {
    const game = gameOfTheDay(day);
    return game ? [{ id: `game-${game.id}`, kind: 'game', target: gameTarget(game.id), title: gameTitle(game), topicArea: game.topicId, priority: 6 }] : [];
  });

  registerDemoGame();
}
