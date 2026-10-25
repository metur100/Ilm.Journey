import { getGame } from '@/core/games';
import { renderGame } from '@/core/games/kit/testing';

import { describeProphetGame } from '../../shared/gameTest';
import { LAMPS, nextLamp } from '../content';
import { DHULKIFL_ART, registerDhulkiflLampsGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerDhulkiflLampsGame();

describe('Dhul-Kifl – Lamps of Patience', () => {
  describeProphetGame(() => getGame('dhulkifl-lanterns')!, { art: DHULKIFL_ART, mistakeLevel: 2 });

  it('lights the lamps in order', () => {
    expect(nextLamp(LAMPS, [])).toBe(0);
    expect(nextLamp(LAMPS, [0])).toBe(1);
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
    await game.wait(LAMPS.holdMs + 50);
    expect(game.texts()).toContain('Lit: Patient');
    await game.unmount();
    jest.useRealTimers();
  });
});
