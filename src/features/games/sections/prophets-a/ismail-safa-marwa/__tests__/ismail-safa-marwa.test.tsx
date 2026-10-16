import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { ISMAIL_ART, ISMAIL_GAME_ID, registerIsmailGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerIsmailGame();

describe('Safa and Marwa', () => {
  describeProphetGame(() => getGame(ISMAIL_GAME_ID)!, { art: ISMAIL_ART, mistakeLevel: 3 });
});
