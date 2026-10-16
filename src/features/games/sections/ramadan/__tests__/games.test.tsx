import { hasArt } from '@/core/art';
import { getGame, registerGame, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';

import { RAMADAN_GAMES } from '../games';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

for (const game of RAMADAN_GAMES) if (!getGame(game.id)) registerGame(game);

const ids = RAMADAN_GAMES.map((g) => g.id);

describe('Ramadan games', () => {
  it.each(ids)('%s is valid, has 3 levels and complete texts in en / de / bs', (id) => {
    const game = getGame(id)!;
    expect(() => validateGame(game)).not.toThrow();
    expect(game.topicId).toBe('ramadan');
    expect(game.levels).toHaveLength(3);
    expect(namespaceProblems(game)).toEqual([]);
    expect(hasArt(game.coverArt)).toBe(true);
    for (const level of game.levels) for (const fact of level.facts) if (fact.art) expect(hasArt(fact.art)).toBe(true);
  });

  const cases = ids.flatMap((id) => ([1, 2, 3] as const).map((level) => [id, level] as const));

  it.each(cases)('%s level %s plays to completion with 3 stars', async (id, level) => {
    const game = await renderGame(getGame(id)!, level);
    const result = await playToEnd(game);
    expect(result.stars).toBe(3);
    expect(result.mistakes).toBe(0);
    await game.unmount();
  });

  it.each(ids)('%s reports a mistake as a missed fact of the level', async (id) => {
    const def = getGame(id)!;
    const game = await renderGame(def, 2);
    const result = await playToEnd(game, { mistakes: 1 });
    expect(result.mistakes).toBeGreaterThan(0);
    expect(result.stars).toBeLessThan(3);
    const levelFacts = def.levels[1].facts.map((f) => f.id);
    expect(result.factsMissed.length).toBeGreaterThan(0);
    for (const f of result.factsMissed) expect(levelFacts).toContain(f);
    await game.unmount();
  });

  it.each(ids)('%s renders in German and Bosnian', async (id) => {
    for (const language of ['de', 'bs'] as const) {
      const game = await renderGame(getGame(id)!, 1, { language });
      expect(game.texts().length).toBeGreaterThan(0);
      await game.unmount();
    }
  });
});
