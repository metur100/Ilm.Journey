import { describeSalahGame } from '../../shared/gameTests';
import { CONDITIONS_ART, FARZ_ITEMS } from '../content';
import { registerConditionsGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerConditionsGame();

describeSalahGame('salah-conditions', CONDITIONS_ART);

it('has six conditions and six pillars', () => {
  expect(FARZ_ITEMS.filter((i) => i.bin === 'sart')).toHaveLength(6);
  expect(FARZ_ITEMS.filter((i) => i.bin === 'rukn')).toHaveLength(6);
});
