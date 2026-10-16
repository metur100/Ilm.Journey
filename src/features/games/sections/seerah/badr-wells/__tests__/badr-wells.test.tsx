import { describeSeerahGame } from '../../shared/testing';
import { registerBadrWellsGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

describeSeerahGame('badr-wells', registerBadrWellsGame);
