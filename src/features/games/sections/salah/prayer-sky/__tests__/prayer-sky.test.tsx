import { registerLearnFeature } from '@/features/learn/register';

import { describeSalahGame } from '../../shared/gameTests';
import { PRAYER_IDS } from '../content';
import { PRAYER_SPOT, prayerAt, SKY_ART, sunDirection } from '../logic';
import { registerPrayerSkyGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerLearnFeature();
registerPrayerSkyGame();

describeSalahGame('prayer-sky', SKY_ART, [1, 2]); // memory (L3) only counts forgetting, which a probe cannot play

it('every prayer spot lies in its own time, and the hint points the right way', () => {
  for (const p of PRAYER_IDS) expect(prayerAt(PRAYER_SPOT[p])).toBe(p);
  expect(sunDirection(0.9, 'fajr')).toBe('earlier');
  expect(sunDirection(0.1, 'asr')).toBe('later');
  expect(prayerAt(0.5)).toBeNull(); // the sun at its very top is no prayer time
});
