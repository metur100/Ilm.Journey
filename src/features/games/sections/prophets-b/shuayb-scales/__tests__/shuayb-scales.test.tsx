import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { addPiece, bestPiece, piecesNeeded, SCALES, tilt } from '../logic';
import { registerShuaybScalesGame, SHUAYB_ART } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerShuaybScalesGame();

describe('Shuayb – the Fair Measure', () => {
  describeProphetGame(() => getGame('shuayb-scales')!, { art: SHUAYB_ART, mistakeLevel: 2 });

  it('balances exactly and tilts toward the heavier pan', () => {
    expect(addPiece(6, [5], 1)).toBe('balanced');
    expect(addPiece(6, [5], 2)).toBe('over');
    expect(addPiece(6, [], 5)).toBe('more');
    expect(bestPiece(8, [5], [1, 2, 5])).toBe(2);
    expect(tilt(8, 2)).toBeLessThan(0);
    expect(tilt(3, 3)).toBe(0);
    for (const r of SCALES.rounds) expect(Number.isFinite(piecesNeeded(r.load, SCALES.pieces))).toBe(true);
  });
});
