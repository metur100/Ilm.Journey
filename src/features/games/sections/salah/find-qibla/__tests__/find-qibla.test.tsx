import { registerLearnFeature } from '@/features/learn/register';

import { describeSalahGame } from '../../shared/gameTests';
import { CITIES, compassPoint, initialBearing, KAABA, QIBLA_ART, qiblaBearing, qiblaResult } from '../logic';
import { registerFindQiblaGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerLearnFeature();
registerFindQiblaGame();

describeSalahGame('find-qibla', QIBLA_ART);

describe('qibla maths', () => {
  it('computes the great-circle qibla of known cities', () => {
    expect(Math.round(qiblaBearing('sarajevo'))).toBeGreaterThan(130);
    expect(Math.round(qiblaBearing('sarajevo'))).toBeLessThan(140);
    expect(compassPoint(qiblaBearing('new-york'))).toBe('ne');
    expect(Object.keys(CITIES).length).toBe(10);
    expect(initialBearing(KAABA, KAABA)).toBe(0);
  });

  it('scores by the angular error and reports the level fact when far off', () => {
    expect(qiblaResult([3, 8, 5]).stars).toBe(3);
    const far = qiblaResult([90, 5], 'qibla-kaaba');
    expect(far.mistakes).toBe(1);
    expect(far.factsMissed).toEqual(['qibla-kaaba']);
  });
});
