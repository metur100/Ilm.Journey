import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { registerIsaGame, ISA_ART, ISA_ID } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerIsaGame();

describe('The Palm Tree and the Stream', () => {
  describeProphetGame(() => getGame(ISA_ID)!, { art: ISA_ART });
});
