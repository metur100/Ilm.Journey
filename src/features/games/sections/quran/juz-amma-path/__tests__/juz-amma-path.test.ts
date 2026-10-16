import { getGame } from '@/core/games';

import { describeQuranGame } from '../../shared/testing';
import { registerJuzPathGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(() => { throw new Error('offline'); }), setAudioModeAsync: jest.fn(() => Promise.resolve()) }));
registerJuzPathGame();

describeQuranGame(() => getGame('juz-amma-path')!, { mistakeLevel: 2 });
