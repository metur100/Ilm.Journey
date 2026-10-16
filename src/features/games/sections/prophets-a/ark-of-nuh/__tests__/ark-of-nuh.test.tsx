import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { ARK_ART, ARK_GAME_ID, registerArkOfNuhGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerArkOfNuhGame();

describe('Ark of Nuh', () => {
  describeProphetGame(() => getGame(ARK_GAME_ID)!, { art: ARK_ART, mistakeLevel: 1 });
});
