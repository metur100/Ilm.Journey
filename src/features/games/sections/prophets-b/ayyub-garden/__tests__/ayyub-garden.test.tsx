import { hasArt } from '@/core/art';
import { getGame, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';

import { caresNeeded, grow, needOf } from '../logic';
import { AYYUB_GARDEN_ART, registerAyyubGardenGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerAyyubGardenGame();

describe('Garden of Patience (Ayyub)', () => {
  it('is valid, complete in en / de / bs and uses existing art', () => {
    const game = getGame('ayyub-garden')!;
    expect(() => validateGame(game)).not.toThrow();
    expect(namespaceProblems(game)).toEqual([]);
    for (const name of [...AYYUB_GARDEN_ART, game.coverArt]) expect(hasArt(name)).toBe(true);
  });

  it('grows beds step by step', () => {
    expect(needOf('empty')).toBe('seed');
    expect(grow('empty')).toBe('seeded');
    expect(needOf('seeded')).toBe('water');
    expect(grow(grow('dry'))).toBe('bloom');
    expect(needOf('bloom')).toBeNull();
    expect(caresNeeded(['empty', 'dry', 'sprout', 'bloom'])).toBe(6);
  });

  it.each([1, 2, 3] as const)('level %s plays to completion', async (level) => {
    const game = await renderGame(getGame('ayyub-garden')!, level);
    expect((await playToEnd(game, { maxSteps: 2000 })).stars).toBe(3);
    await game.unmount();
  });

  it('a wrong tool is a gentle mistake that sends the fact to review', async () => {
    const game = await renderGame(getGame('ayyub-garden')!, 2);
    const result = await playToEnd(game, { mistakes: 1, maxSteps: 2000 });
    expect(result.stars).toBe(2);
    expect(result.factsMissed).toEqual(['ayyub-answer']);
    await game.unmount();
  });
});
