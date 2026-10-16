import { clearGamesForTests, getGame } from '@/core/games';
import { registerGames } from '@/features/games';
import { EPISODES } from '@/features/seerah/content';
import { EPISODE_GAMES } from '@/features/seerah/games';

describe('episode games', () => {
  beforeAll(() => {
    clearGamesForTests();
    registerGames();
  });

  it('links every episode to a registered game', () => {
    expect(Object.keys(EPISODE_GAMES).sort()).toEqual(EPISODES.map((e) => e.id).sort());
    for (const [episodeId, id] of Object.entries(EPISODE_GAMES)) expect({ episodeId, id, registered: !!getGame(id) }).toEqual({ episodeId, id, registered: true });
  });
});
