import { getGame } from '@/core/games';
import { playToEnd, renderGame } from '@/core/games/kit/testing';

import { describeProphetGame } from '../../shared/gameTest';
import { caresNeeded, grow, needOf } from '../logic';
import { AYYUB_GARDEN_ART, registerAyyubGardenGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerAyyubGardenGame();

describe('Ayyub – the Garden of Patience', () => {
  describeProphetGame(() => getGame('ayyub-garden')!, { art: AYYUB_GARDEN_ART, mistakeLevel: 2 });

  it('grows beds step by step', () => {
    expect(needOf('empty')).toBe('seed');
    expect(grow('empty')).toBe('seeded');
    expect(needOf('seeded')).toBe('water');
    expect(grow(grow('dry'))).toBe('bloom');
    expect(needOf('bloom')).toBeNull();
    expect(caresNeeded(['empty', 'dry', 'sprout', 'bloom'])).toBe(6);
  });

  it('a wrong tool in the garden is a gentle mistake that sends the fact to review', async () => {
    const game = await renderGame(getGame('ayyub-garden')!, 3);
    const result = await playToEnd(game, { mistakes: 1, maxSteps: 2000 });
    expect(result.stars).toBe(2);
    expect(result.factsMissed).toEqual(['ayyub-answer']);
    await game.unmount();
  });
});
