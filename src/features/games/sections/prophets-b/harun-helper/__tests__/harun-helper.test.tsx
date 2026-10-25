import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { DUA, REQUESTS } from '../content';
import { HARUN_ART, registerHarunHelperGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerHarunHelperGame();

describe('Harun – the Helper', () => {
  describeProphetGame(() => getGame('harun-helper')!, { art: HARUN_ART, mistakeLevel: 2 });

  it('level 1 asks for every request of the dua (20:25–32)', () => {
    expect(DUA.ids).toEqual(REQUESTS.map((r) => r.id));
  });
});
