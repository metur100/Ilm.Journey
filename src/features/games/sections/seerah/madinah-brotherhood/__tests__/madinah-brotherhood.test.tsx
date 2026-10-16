import { describeSeerahGame } from '../../shared/testing';
import { registerMadinahBrotherhoodGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

describeSeerahGame('madinah-brotherhood', registerMadinahBrotherhoodGame);
