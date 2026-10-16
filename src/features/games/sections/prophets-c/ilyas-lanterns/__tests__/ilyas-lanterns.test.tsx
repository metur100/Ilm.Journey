import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { registerIlyasGame, ILYAS_ART, ILYAS_ID } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerIlyasGame();

describe('Lanterns of the Call', () => {
  describeProphetGame(() => getGame(ILYAS_ID)!, { art: ILYAS_ART });
});
