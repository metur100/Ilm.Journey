import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { LUT_ART, LUT_GAME_ID, registerLutGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerLutGame();

describe('The Night Journey', () => {
  describeProphetGame(() => getGame(LUT_GAME_ID)!, { art: LUT_ART, mistakeLevel: 1 });
});
