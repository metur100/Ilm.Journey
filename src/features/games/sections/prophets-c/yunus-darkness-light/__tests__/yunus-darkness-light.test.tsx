import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { registerYunusGame, YUNUS_ART, YUNUS_ID } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerYunusGame();

describe('Light in the Darknesses', () => {
  describeProphetGame(() => getGame(YUNUS_ID)!, { art: YUNUS_ART });
});
