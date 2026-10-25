import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { registerYusufStoryPathGame, YUSUF_PATH_ART } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerYusufStoryPathGame();

describe('Yusuf – the Best of Stories', () => {
  describeProphetGame(() => getGame('yusuf-story-path')!, { art: YUSUF_PATH_ART, mistakeLevel: 2 });
});
