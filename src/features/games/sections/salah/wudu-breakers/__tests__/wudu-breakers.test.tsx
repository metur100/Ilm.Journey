import { describeSalahGame } from '../../shared/gameTests';
import { BREAKERS_ART } from '../content';
import { registerBreakersGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerBreakersGame();

describeSalahGame('wudu-breakers', BREAKERS_ART);
