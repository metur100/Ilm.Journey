import { describeSalahGame } from '../../shared/gameTests';
import { TAYAMMUM_ART } from '../content';
import { registerTayammumGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerTayammumGame();

describeSalahGame('tayammum', TAYAMMUM_ART);
