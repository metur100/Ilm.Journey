import { hasArt } from '@/core/art';
import { getGame, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';

import { springPairs } from '../logic';
import { registerMusaSpringsGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerMusaSpringsGame();

describe('Twelve Springs (Musa)', () => {
  it('is valid, complete in en / de / bs and has art for all twelve tribes', () => {
    const game = getGame('musa-springs')!;
    expect(() => validateGame(game)).not.toThrow();
    expect(namespaceProblems(game)).toEqual([]);
    const pairs = springPairs(12);
    expect(new Set(pairs.map((p) => p.id)).size).toBe(12);
    for (const p of pairs) expect(hasArt(p.left.art!) && hasArt(p.right.art!)).toBe(true);
  });

  it.each([1, 2, 3] as const)('level %s plays to completion', async (level) => {
    const game = await renderGame(getGame('musa-springs')!, level);
    expect((await playToEnd(game)).stars).toBe(3);
    await game.unmount();
  });

  it('a wrong line is a mistake that sends the fact to review', async () => {
    const game = await renderGame(getGame('musa-springs')!, 1);
    const result = await playToEnd(game, { mistakes: 1 });
    expect(result.factsMissed).toEqual(['twelve-springs']);
    await game.unmount();
  });
});
