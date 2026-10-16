import { getGame } from '@/core/games';

import { describeQuranGame } from '../../shared/testing';
import { registerSurahMessagesGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerSurahMessagesGame();

describeQuranGame(() => getGame('surah-messages')!);
