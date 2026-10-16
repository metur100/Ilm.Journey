import { hasArt } from '@/core/art';
import { getGame, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';

import { classifyTap, LEVEL_1, LEVEL_2, LEVEL_3, solveRoad } from '../logic';
import { registerYaqubRoadGame, YAQUB_ROAD_ART } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerYaqubRoadGame();

describe("The Shirt's Road (Yaqub)", () => {
  it('is valid, complete in en / de / bs and uses existing art', () => {
    const game = getGame('yaqub-shirt-road')!;
    expect(() => validateGame(game)).not.toThrow();
    expect(namespaceProblems(game)).toEqual([]);
    for (const name of [...YAQUB_ROAD_ART, game.coverArt]) expect(hasArt(name)).toBe(true);
  });

  it('has a road on every level; level 3 passes both wells', () => {
    for (const cfg of [LEVEL_1, LEVEL_2, LEVEL_3]) {
      const road = solveRoad(cfg);
      expect(road).not.toBeNull();
      expect(road![0]).toBe(cfg.start);
      expect(road![road!.length - 1]).toBe(cfg.goal);
      for (const w of cfg.wells) expect(road).toContain(w);
    }
  });

  it('classifies taps', () => {
    const cfg = LEVEL_3;
    expect(classifyTap(cfg, [cfg.start], cfg.rocks[0])).toBe('rock');
    expect(classifyTap(cfg, [cfg.start], cfg.start + 1)).toBe('extend');
    expect(classifyTap(cfg, [cfg.start, cfg.start + 1], cfg.start)).toBe('undo');
    expect(classifyTap(cfg, [cfg.start], cfg.goal)).toBe('far');
  });

  it.each([1, 2, 3] as const)('level %s plays to completion', async (level) => {
    const game = await renderGame(getGame('yaqub-shirt-road')!, level);
    expect((await playToEnd(game)).stars).toBe(3);
    await game.unmount();
  });

  it('reports mistakes as missed facts', async () => {
    const game = await renderGame(getGame('yaqub-shirt-road')!, 2);
    const result = await playToEnd(game, { mistakes: 2 });
    expect(result.stars).toBeLessThan(3);
    expect(result.factsMissed).toEqual(['beautiful-patience']);
    await game.unmount();
  });
});
