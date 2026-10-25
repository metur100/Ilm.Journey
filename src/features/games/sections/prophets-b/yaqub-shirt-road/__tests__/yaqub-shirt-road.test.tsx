import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { classifyTap, ROAD, solveRoad } from '../logic';
import { registerYaqubRoadGame, YAQUB_ROAD_ART } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerYaqubRoadGame();

describe('Yaqub – Beautiful Patience', () => {
  describeProphetGame(() => getGame('yaqub-shirt-road')!, { art: YAQUB_ROAD_ART, mistakeLevel: 2 });

  it('the road level has a way that passes both wells', () => {
    const road = solveRoad(ROAD);
    expect(road).not.toBeNull();
    expect(road![0]).toBe(ROAD.start);
    expect(road![road!.length - 1]).toBe(ROAD.goal);
    for (const w of ROAD.wells) expect(road).toContain(w);
  });

  it('classifies taps', () => {
    expect(classifyTap(ROAD, [ROAD.start], ROAD.rocks[0])).toBe('rock');
    expect(classifyTap(ROAD, [ROAD.start], ROAD.start + 1)).toBe('extend');
    expect(classifyTap(ROAD, [ROAD.start, ROAD.start + 1], ROAD.start)).toBe('undo');
    expect(classifyTap(ROAD, [ROAD.start], ROAD.goal)).toBe('far');
  });
});
