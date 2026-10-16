import { hasArt } from '@/core/art';
import { getGame, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';

import { LEVEL_1, LEVEL_2, LEVEL_3, nextLamp } from '../content';
import { registerDhulkiflLampsGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerDhulkiflLampsGame();

describe('Lamps of Patience (Dhul-Kifl)', () => {
  it('is valid, complete in en / de / bs and uses existing art', () => {
    const game = getGame('dhulkifl-lanterns')!;
    expect(() => validateGame(game)).not.toThrow();
    expect(namespaceProblems(game)).toEqual([]);
    for (const name of ['prophet.dhulkifl-lamp', 'prophet.dhulkifl-lamp-lit', 'prophet.dhulkifl-lamp-unlit']) expect(hasArt(name)).toBe(true);
  });

  it('changes the play per level', () => {
    expect(nextLamp(LEVEL_1, [0])).toBe(1);
    expect(nextLamp(LEVEL_2, [])).toBeNull();
    expect(LEVEL_2.holdMs).toBeGreaterThan(LEVEL_1.holdMs);
    expect(nextLamp(LEVEL_3, [])).toBe(2);
    expect([...LEVEL_3.order].sort()).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it.each([1, 2, 3] as const)('level %s plays to completion', async (level) => {
    const game = await renderGame(getGame('dhulkifl-lanterns')!, level);
    expect((await playToEnd(game)).stars).toBe(3);
    await game.unmount();
  });

  it('a lamp out of order is a mistake', async () => {
    const game = await renderGame(getGame('dhulkifl-lanterns')!, 3);
    const result = await playToEnd(game, { mistakes: 1 });
    expect(result.stars).toBe(2);
    expect(result.factsMissed).toEqual(['dhulkifl-best']);
    await game.unmount();
  });

  it('lights a lamp only after a full, steady hold', async () => {
    jest.useFakeTimers();
    const game = await renderGame(getGame('dhulkifl-lanterns')!, 1);
    const lamp = game.root.findAll((n) => n.props.testID === 'lamp-0' && typeof n.props.onPressIn === 'function')[0];
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { act } = require('react-test-renderer') as { act: (cb: () => void) => Promise<void> };
    await act(() => lamp.props.onPressIn());
    await game.wait(300);
    await act(() => lamp.props.onPressOut());
    expect(game.texts()).toContain('A little longer');
    await act(() => lamp.props.onPressIn());
    await game.wait(LEVEL_1.holdMs + 50);
    expect(game.texts()).toContain('Lit: Patient');
    await game.unmount();
    jest.useRealTimers();
  });
});
