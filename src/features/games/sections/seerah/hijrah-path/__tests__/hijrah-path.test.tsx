import { describeSeerahGame } from '../../shared/testing';
import { registerHijrahPathGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

describeSeerahGame('hijrah-path', registerHijrahPathGame);
