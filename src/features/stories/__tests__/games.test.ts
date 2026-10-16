import { clearGamesForTests, getGame } from '@/core/games';
import { STORIES } from '@/features/stories/content';
import { STORY_GAMES } from '@/features/stories/content/games';
import { PROPHET_ORDER } from '@/features/stories/content/order';
import { registerGames } from '@/features/games';

describe('story games', () => {
  beforeAll(() => {
    clearGamesForTests();
    registerGames();
  });

  it('links every prophet story to its registered game(s)', () => {
    expect(Object.keys(STORY_GAMES).sort()).toEqual(Object.keys(PROPHET_ORDER).sort());
    for (const story of STORIES) expect({ id: story.id, games: (STORY_GAMES[story.id] ?? []).length > 0 }).toEqual({ id: story.id, games: true });
    for (const [storyId, ids] of Object.entries(STORY_GAMES)) {
      expect(STORIES.some((s) => s.id === storyId)).toBe(true);
      for (const id of ids) expect({ storyId, id, registered: !!getGame(id) }).toEqual({ storyId, id, registered: true });
    }
  });
});
