import { hasArt } from '@/core/art';
import { getGame, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';

import { LEVEL_1, LEVEL_2, LEVEL_3 } from '../content';
import { registerDawudArmourGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerDawudArmourGame();

describe('Rings of Armour (Dawud)', () => {
  it('is valid, complete in en / de / bs and uses existing art', () => {
    const game = getGame('dawud-armour')!;
    expect(() => validateGame(game)).not.toThrow();
    expect(namespaceProblems(game)).toEqual([]);
    for (const name of ['prophet.dawud-ring', 'prophet.dawud-armour', 'prophet.dawud-chain', 'prophet.dawud-iron', 'prophet.dawud-mountains-birds']) expect(hasArt(name)).toBe(true);
  });

  it('changes the play per level', () => {
    expect([LEVEL_1.sizes.length, LEVEL_2.sizes.length, LEVEL_3.sizes.length]).toEqual([2, 3, 3]);
    expect([LEVEL_1.ghosts, LEVEL_2.ghosts, LEVEL_3.ghosts]).toEqual([true, true, false]);
    expect(LEVEL_3.given).toBeGreaterThan(0);
    for (const cfg of [LEVEL_1, LEVEL_2, LEVEL_3]) for (const s of cfg.links) expect(cfg.sizes).toContain(s);
  });

  it.each([1, 2, 3] as const)('level %s plays to completion', async (level) => {
    const game = await renderGame(getGame('dawud-armour')!, level);
    expect((await playToEnd(game)).stars).toBe(3);
    await game.unmount();
  });

  it('a ring of the wrong size is a mistake', async () => {
    const game = await renderGame(getGame('dawud-armour')!, 2);
    const result = await playToEnd(game, { mistakes: 1 });
    expect(result.stars).toBe(2);
    expect(result.factsMissed).toEqual(['measure-the-links']);
    await game.unmount();
  });
});
