import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { springPairs } from '../logic';
import { MUSA_ART, registerMusaSpringsGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerMusaSpringsGame();

describe('Musa – River, Sea and Springs', () => {
  describeProphetGame(() => getGame('musa-springs')!, { art: MUSA_ART, mistakeLevel: 3 });

  it('has twelve different tribes and springs', () => {
    expect(new Set(springPairs(12).map((p) => p.id)).size).toBe(12);
  });
});
