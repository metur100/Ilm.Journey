import { describeSeerahGame } from '../../shared/testing';
import { registerTheTrenchGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

describeSeerahGame('the-trench', registerTheTrenchGame);
