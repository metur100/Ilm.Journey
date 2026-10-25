import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { registerSalihGame, SALIH_ART, SALIH_GAME_ID } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerSalihGame();

describe('Water Days', () => {
  describeProphetGame(() => getGame(SALIH_GAME_ID)!, { art: SALIH_ART, mistakeLevel: 1 });
});
