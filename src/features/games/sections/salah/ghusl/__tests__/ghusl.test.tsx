import { hasArt } from '@/core/art';
import { getGame, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';

import { rubCoverage } from '../../shared/ScrubWash';
import { GHUSL_ART } from '../content';
import { registerGhuslGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerGhuslGame();

describe('ghusl', () => {
  const game = getGame('ghusl')!;

  it('is valid and complete in en / de / bs', () => {
    expect(() => validateGame(game)).not.toThrow();
    expect(namespaceProblems(game)).toEqual([]);
    expect(GHUSL_ART.filter((a) => !hasArt(a))).toEqual([]);
  });

  it.each([1, 2, 3] as const)('level %s plays to completion with 3 stars', async (level) => {
    const g = await renderGame(game, level);
    expect((await playToEnd(g)).stars).toBe(3);
    await g.unmount();
  });

  it.each([2, 3] as const)('level %s reports mistakes as missed facts of the level', async (level) => {
    const g = await renderGame(game, level, { language: 'de' });
    const result = await playToEnd(g, { mistakes: 1 });
    expect(result.mistakes).toBeGreaterThan(0);
    const ids = game.levels[level - 1].facts.map((f) => f.id);
    expect(result.factsMissed.length).toBeGreaterThan(0);
    expect(result.factsMissed.every((id) => ids.includes(id))).toBe(true);
    await g.unmount();
  });

  it('rubbing fills a card gradually and three taps fill it', async () => {
    expect(rubCoverage(0, 100, 100)).toBeCloseTo(100 / 220);
    expect(rubCoverage(0.9, 500, 100)).toBe(1);
    const g = await renderGame(game, 1);
    await g.press('scrub-mouth');
    await g.press('scrub-mouth');
    await g.press('scrub-mouth');
    expect(g.progress[g.progress.length - 1]).toEqual({ done: 1, total: 9 });
    await g.unmount();
  });
});
