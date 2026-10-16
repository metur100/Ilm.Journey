import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { ADAM_NAMES_ART, ADAM_NAMES_ID, registerAdamNamesGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerAdamNamesGame();

describe('Names in the Garden', () => {
  describeProphetGame(() => getGame(ADAM_NAMES_ID)!, { art: ADAM_NAMES_ART });
});
