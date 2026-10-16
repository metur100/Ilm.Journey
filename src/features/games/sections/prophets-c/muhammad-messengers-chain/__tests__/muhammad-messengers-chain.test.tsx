import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { registerMuhammadGame, MUHAMMAD_ART, MUHAMMAD_ID } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerMuhammadGame();

describe('The Chain of the Messengers', () => {
  describeProphetGame(() => getGame(MUHAMMAD_ID)!, { art: MUHAMMAD_ART });
});
