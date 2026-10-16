import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { registerYahyaGame, YAHYA_ART, YAHYA_ID } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerYahyaGame();

describe('What Yahya Was', () => {
  describeProphetGame(() => getGame(YAHYA_ID)!, { art: YAHYA_ART });
});
