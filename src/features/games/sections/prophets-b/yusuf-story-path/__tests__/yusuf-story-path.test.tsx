import { hasArt } from '@/core/art';
import { getGame, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';

import { PATH_LEVELS, YUSUF_EVENTS } from '../content';
import { registerYusufStoryPathGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerYusufStoryPathGame();

describe("Yusuf's Story Trail", () => {
  it('is valid, complete in en / de / bs and uses existing art', () => {
    const game = getGame('yusuf-story-path')!;
    expect(() => validateGame(game)).not.toThrow();
    expect(namespaceProblems(game)).toEqual([]);
    for (const e of Object.values(YUSUF_EVENTS)) expect(hasArt(e.art)).toBe(true);
  });

  it('changes the play per level: path with hints, longer path, then order from memory', () => {
    expect(PATH_LEVELS.map((l) => [l.variant, l.hints, l.events.length])).toEqual([
      ['path', true, 4],
      ['path', false, 6],
      ['list', false, 7],
    ]);
  });

  it.each([1, 2, 3] as const)('level %s plays to completion', async (level) => {
    const game = await renderGame(getGame('yusuf-story-path')!, level);
    expect((await playToEnd(game)).stars).toBe(3);
    await game.unmount();
  });

  it('reports a mistake as the missed fact of the level', async () => {
    const game = await renderGame(getGame('yusuf-story-path')!, 2);
    const result = await playToEnd(game, { mistakes: 1 });
    expect(result.factsMissed).toEqual(['yusuf-honesty-trail']);
    await game.unmount();
  });
});
