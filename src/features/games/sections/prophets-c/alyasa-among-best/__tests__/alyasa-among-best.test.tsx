import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { registerAlyasaGame, ALYASA_ART, ALYASA_ID } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerAlyasaGame();

describe('Among the Best', () => {
  describeProphetGame(() => getGame(ALYASA_ID)!, { art: ALYASA_ART });
});
