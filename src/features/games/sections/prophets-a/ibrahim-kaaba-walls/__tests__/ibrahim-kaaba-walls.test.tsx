import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { IBRAHIM_ART, IBRAHIM_GAME_ID, registerIbrahimGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerIbrahimGame();

describe('Raising the House', () => {
  describeProphetGame(() => getGame(IBRAHIM_GAME_ID)!, { art: IBRAHIM_ART, mistakeLevel: 2 });
});
