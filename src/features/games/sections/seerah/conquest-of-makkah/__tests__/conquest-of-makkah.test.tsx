import { describeSeerahGame } from '../../shared/testing';
import { registerConquestOfMakkahGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

describeSeerahGame('conquest-of-makkah', registerConquestOfMakkahGame);
