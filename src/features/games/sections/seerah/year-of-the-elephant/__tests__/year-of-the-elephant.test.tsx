import { describeSeerahGame } from '../../shared/testing';
import { registerYearOfTheElephantGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

describeSeerahGame('year-of-the-elephant', registerYearOfTheElephantGame);
