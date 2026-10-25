import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { ARMOUR } from '../content';
import { DAWUD_ART, registerDawudArmourGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerDawudArmourGame();

describe('Dawud – Patience, Iron and Praise', () => {
  describeProphetGame(() => getGame('dawud-armour')!, { art: DAWUD_ART, mistakeLevel: 2 });

  it('the armour level only asks for sizes it offers', () => {
    for (const s of ARMOUR.links) expect(ARMOUR.sizes).toContain(s);
  });
});
