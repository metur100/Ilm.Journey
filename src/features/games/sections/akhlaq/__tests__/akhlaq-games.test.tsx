import { act } from 'react-test-renderer';

import { hasArt } from '@/core/art';
import { getGame, validateGame } from '@/core/games';
import { activeProbes, namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';

import { AKHLAQ_GAMES, registerAkhlaqGames } from '..';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerAkhlaqGames();

const ids = AKHLAQ_GAMES.map((g) => g.id);
/** Games whose first move cannot be wrong (fair turns, the nearest door): one right move is played first. */
const STEP_FIRST = new Set(['share-the-plate', 'gifts-for-neighbours']);

describe.each(ids)('%s', (id) => {
  const game = () => getGame(id)!;

  it('is valid, has 3 levels and complete en / de / bs texts', () => {
    expect(() => validateGame(game())).not.toThrow();
    expect(game().levels).toHaveLength(3);
    expect(game().topicId).toBe('akhlaq');
    expect(namespaceProblems(game())).toEqual([]);
    expect(hasArt(game().coverArt)).toBe(true);
  });

  it.each([1, 2, 3] as const)('level %s plays to completion with 3 stars', async (level) => {
    const g = await renderGame(game(), level);
    const result = await playToEnd(g);
    expect(result.stars).toBe(3);
    expect(result.factsMissed).toEqual([]);
    await g.unmount();
  });

  it('reports mistakes and a missed fact', async () => {
    const g = await renderGame(game(), 2, { language: 'bs' });
    if (STEP_FIRST.has(id)) {
      await act(async () => {
        activeProbes()[0].step();
      });
      await g.wait(50);
    }
    const result = await playToEnd(g, { mistakes: 2 });
    expect(result.mistakes).toBeGreaterThan(0);
    expect(result.stars).toBeLessThan(3);
    const factIds = game().levels[1].facts.map((f) => f.id);
    expect(result.factsMissed.length).toBeGreaterThan(0);
    for (const f of result.factsMissed) expect(factIds).toContain(f);
    await g.unmount();
  });
});
