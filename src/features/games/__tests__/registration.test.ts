import * as registry from '@/core/games/registry';
import { registerGames } from '@/features/games';

describe('game registration', () => {
  it('registers every game exactly once', () => {
    registry.clearGamesForTests();
    const spy = jest.spyOn(registry, 'registerGame');
    registerGames();
    const ids = spy.mock.calls.map(([def]) => def.id);
    spy.mockRestore();
    const counts = ids.reduce<Record<string, number>>((acc, id) => ({ ...acc, [id]: (acc[id] ?? 0) + 1 }), {});
    expect(Object.entries(counts).filter(([, n]) => n > 1)).toEqual([]);
    expect(ids.length).toBe(registry.listGames({ includeDev: true }).length);
    // The v2 games that moved into sections are still registered (by their section).
    for (const id of ['ark-of-nuh', 'yusuf-storehouse', 'yusuf-story-path', 'ayah-builder', 'surah-garden', 'ramadan-journey', 'build-the-masjid', 'good-deeds-day']) {
      expect({ id, registered: !!registry.getGame(id) }).toEqual({ id, registered: true });
    }
  });
});
