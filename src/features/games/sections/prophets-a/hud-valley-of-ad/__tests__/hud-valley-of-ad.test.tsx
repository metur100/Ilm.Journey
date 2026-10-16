import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { HUD_ART, HUD_GAME_ID, registerHudGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerHudGame();

describe('The Valley of ʿAd', () => {
  describeProphetGame(() => getGame(HUD_GAME_ID)!, { art: HUD_ART, mistakeLevel: 2 });
});
