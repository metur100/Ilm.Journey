import { getGame } from '@/core/games';

import { describeQuranGame } from '../../shared/testing';
import { registerSignsGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(() => { throw new Error('offline'); }), setAudioModeAsync: jest.fn(() => Promise.resolve()) }));
registerSignsGame();

describeQuranGame(() => getGame('signs-in-the-sky')!, { mistakeLevel: 2 });
