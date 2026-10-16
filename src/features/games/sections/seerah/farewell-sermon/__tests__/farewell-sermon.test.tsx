import { describeSeerahGame } from '../../shared/testing';
import { registerFarewellSermonGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

describeSeerahGame('farewell-sermon', registerFarewellSermonGame);
