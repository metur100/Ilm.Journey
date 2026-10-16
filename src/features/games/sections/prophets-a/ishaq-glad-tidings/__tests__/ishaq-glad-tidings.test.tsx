import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { ISHAQ_ART, ISHAQ_GAME_ID, registerIshaqGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerIshaqGame();

describe('Glad Tidings', () => {
  describeProphetGame(() => getGame(ISHAQ_GAME_ID)!, { art: ISHAQ_ART, mistakeLevel: 3 });
});
