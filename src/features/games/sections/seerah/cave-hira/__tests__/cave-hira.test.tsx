import { describeSeerahGame } from '../../shared/testing';
import { registerCaveHiraGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

describeSeerahGame('cave-hira', registerCaveHiraGame);
