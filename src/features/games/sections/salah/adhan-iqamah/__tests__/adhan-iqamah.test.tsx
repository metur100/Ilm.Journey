import { describeSalahGame } from '../../shared/gameTests';
import { ADHAN_ART, EZAN, EZAN_SABAH } from '../content';
import { registerAdhanGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerAdhanGame();

describeSalahGame('adhan-iqamah', ADHAN_ART);

it('the ezan has 15 phrases, Sabah two more', () => {
  expect(EZAN.reduce((n, p) => n + p.times, 0)).toBe(15);
  expect(EZAN_SABAH.reduce((n, p) => n + p.times, 0)).toBe(17);
});
