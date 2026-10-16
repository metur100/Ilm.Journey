import { registerLearnFeature } from '@/features/learn/register';

import { describeSalahGame } from '../../shared/gameTests';
import { MASJID_ART, MASJID_FACTS } from '../content';
import { registerMasjidGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerLearnFeature();
registerMasjidGame();

describeSalahGame('masjid-manners', MASJID_ART);

it('copies the masjid lesson texts with their sources', () => {
  expect(MASJID_FACTS.place.sources.length).toBeGreaterThan(0);
  expect(MASJID_FACTS.manners.text.bs).toContain('selamom');
});
