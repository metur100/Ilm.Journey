import { hasArt } from '@/core/art';
import { getGame, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';

import { LEVEL_3, REQUESTS } from '../content';
import { registerHarunHelperGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerHarunHelperGame();

describe('Speak & Support (Harun)', () => {
  it('is valid, complete in en / de / bs and uses existing art', () => {
    const game = getGame('harun-helper')!;
    expect(() => validateGame(game)).not.toThrow();
    expect(namespaceProblems(game)).toEqual([]);
    for (const r of REQUESTS) expect(hasArt(r.art!)).toBe(true);
  });

  it('orders the whole dua of 20:25–34 on level 3', () => {
    expect(LEVEL_3.ids).toEqual(REQUESTS.map((r) => r.id));
  });

  it.each([1, 2, 3] as const)('level %s plays to completion', async (level) => {
    const game = await renderGame(getGame('harun-helper')!, level);
    expect((await playToEnd(game)).stars).toBeGreaterThanOrEqual(3);
    await game.unmount();
  });

  it('a wrong order on level 3 sends the fact to review', async () => {
    const game = await renderGame(getGame('harun-helper')!, 3);
    const result = await playToEnd(game, { mistakes: 1 });
    expect(result.factsMissed).toEqual(['glorify-much']);
    await game.unmount();
  });
});
