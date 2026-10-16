import { hasArt } from '@/core/art';
import { getGame, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';

import { addPiece, bestPiece, LEVEL_1, LEVEL_2, LEVEL_3, piecesNeeded, tilt } from '../logic';
import { registerShuaybScalesGame, SHUAYB_ART } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerShuaybScalesGame();

describe('Fair Measure (Shuayb)', () => {
  it('is valid, complete in en / de / bs and uses existing art', () => {
    const game = getGame('shuayb-scales')!;
    expect(() => validateGame(game)).not.toThrow();
    expect(namespaceProblems(game)).toEqual([]);
    for (const name of [...SHUAYB_ART, game.coverArt]) expect(hasArt(name)).toBe(true);
  });

  it('balances exactly and tilts toward the heavier pan', () => {
    expect(addPiece(6, [5], 1)).toBe('balanced');
    expect(addPiece(6, [5], 2)).toBe('over');
    expect(addPiece(6, [], 5)).toBe('more');
    expect(bestPiece(8, [5], [1, 2, 5])).toBe(2);
    expect(tilt(8, 2)).toBeLessThan(0);
    expect(tilt(3, 3)).toBe(0);
    for (const cfg of [LEVEL_1, LEVEL_2, LEVEL_3]) for (const r of cfg.rounds) expect(Number.isFinite(piecesNeeded(r.load, cfg.pieces))).toBe(true);
  });

  it.each([1, 2, 3] as const)('level %s plays to completion', async (level) => {
    const game = await renderGame(getGame('shuayb-scales')!, level);
    expect((await playToEnd(game, { maxSteps: 1000 })).stars).toBe(3);
    await game.unmount();
  });

  it('too much is a gentle mistake', async () => {
    const game = await renderGame(getGame('shuayb-scales')!, 1);
    const result = await playToEnd(game, { mistakes: 1, maxSteps: 1000 });
    expect(result.stars).toBe(2);
    expect(result.factsMissed).toEqual(['full-measure']);
    await game.unmount();
  });
});
