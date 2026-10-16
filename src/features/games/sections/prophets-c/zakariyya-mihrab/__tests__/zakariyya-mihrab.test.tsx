import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { registerZakariyyaGame, ZAKARIYYA_ART, ZAKARIYYA_ID } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerZakariyyaGame();

describe('The Mihrab', () => {
  describeProphetGame(() => getGame(ZAKARIYYA_ID)!, { art: ZAKARIYYA_ART });
});
