import { describeSeerahGame } from '../../shared/testing';
import { registerPeopleOfTheSeerahGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

describeSeerahGame('people-of-the-seerah', registerPeopleOfTheSeerahGame);
