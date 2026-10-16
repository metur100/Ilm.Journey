import { describeSeerahGame } from '../../shared/testing';
import { registerHudaybiyyahTreatyGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

describeSeerahGame('hudaybiyyah-treaty', registerHudaybiyyahTreatyGame);
