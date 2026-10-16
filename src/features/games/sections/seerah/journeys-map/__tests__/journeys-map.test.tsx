import { describeSeerahGame } from '../../shared/testing';
import { registerJourneysMapGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

describeSeerahGame('journeys-map', registerJourneysMapGame);
