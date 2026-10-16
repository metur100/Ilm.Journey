import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { IDRIS_ART, IDRIS_GAME_ID, registerIdrisGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerIdrisGame();

describe('The High Station', () => {
  describeProphetGame(() => getGame(IDRIS_GAME_ID)!, { art: IDRIS_ART, mistakeLevel: 3 });
});
