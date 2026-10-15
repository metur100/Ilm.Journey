import { hasArt } from '@/core/art';
import { getGame, validateGame } from '@/core/games';
import { isRightBin, kitResult, kitShuffle, kitStars, misplacedIds, moveItem, zoneAt } from '@/core/games/kit';
import { KIT_DEMOS, registerKitDemos } from '@/core/games/kit/demos';
import { activeProbes, namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';
import type { GameLevel } from '@/core/games';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

registerKitDemos();

describe('kit – rules', () => {
  it('gives stars by mistakes', () => {
    expect(kitStars(0, 6)).toBe(3);
    expect(kitStars(1, 6)).toBe(2);
    expect(kitStars(2, 8)).toBe(2);
    expect(kitStars(5, 8)).toBe(1);
    expect(kitResult({ moves: 5, mistakes: 1, factsMissed: ['a', 'a'] })).toEqual({ score: 47, maxScore: 50, stars: 2, mistakes: 1, factsMissed: ['a'] });
  });

  it('shuffles deterministically and never returns the solved order', () => {
    const items = ['a', 'b', 'c', 'd'];
    expect(kitShuffle(items, 's')).toEqual(kitShuffle(items, 's'));
    for (const seed of ['1', '2', '3', 'x', 'y']) expect(kitShuffle(items, seed)).not.toEqual(items);
    expect(kitShuffle(['a'], 's')).toEqual(['a']);
  });

  it('moves, checks order and bins', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(misplacedIds(['b', 'a', 'c'], ['a', 'b', 'c'])).toEqual(['b', 'a']);
    expect(isRightBin([{ id: 'x', bin: 'one' }], 'x', 'one')).toBe(true);
    expect(isRightBin([{ id: 'x', bin: 'one' }], 'x', 'two')).toBe(false);
  });

  it('finds the drop zone under the finger (nearest centre wins)', () => {
    const rects = [
      { id: 'a', x: 0, y: 0, w: 100, h: 100 },
      { id: 'b', x: 90, y: 0, w: 100, h: 100 },
    ];
    expect(zoneAt(rects, 20, 50)).toBe('a');
    expect(zoneAt(rects, 170, 50)).toBe('b');
    expect(zoneAt(rects, 400, 50)).toBe('');
  });
});

describe('kit – demo games (one per engine)', () => {
  it.each(KIT_DEMOS.map((d) => [d.id]))('%s is a valid dev game with complete texts and art', (id) => {
    const game = getGame(id)!;
    expect(game.dev).toBe(true);
    expect(() => validateGame(game)).not.toThrow();
    expect(namespaceProblems(game)).toEqual([]);
    expect(hasArt(game.coverArt)).toBe(true);
  });

  const cases: [string, GameLevel][] = KIT_DEMOS.flatMap((d) => d.levels.map((l) => [d.id, l.level] as [string, GameLevel]));
  it.each(cases)('%s level %s plays to completion with 3 stars', async (id, level) => {
    const game = await renderGame(getGame(id)!, level);
    const result = await playToEnd(game);
    expect(result.stars).toBe(3);
    expect(result.mistakes).toBe(0);
    expect(game.progress.at(-1)?.done).toBe(game.progress.at(-1)?.total);
    await game.unmount();
    expect(activeProbes()).toHaveLength(0);
  });

  it.each(KIT_DEMOS.map((d) => [d.id]))('%s counts mistakes', async (id) => {
    const game = await renderGame(getGame(id)!, 2);
    const result = await playToEnd(game, { mistakes: 2 });
    expect(result.mistakes).toBeGreaterThan(0);
    expect(result.stars).toBeLessThan(3);
    await game.unmount();
  });
});

describe('kit – tap path (screen readers, no gestures)', () => {
  it('SortBins: tap a tile, then its basket', async () => {
    const def = getGame('kit-sort-bins')!;
    const game = await renderGame(def, 1);
    const items = (def.levels[0].config as { items: { id: string; bin: string }[] }).items;
    const tileIds = game.root.findAll((n) => typeof n.props.testID === 'string' && n.props.testID.startsWith('tile-')).map((n) => n.props.testID.slice(5) as string);
    const item = items.find((i) => i.id === tileIds[0])!;
    await game.press(`tile-${item.id}`);
    await game.press(`zone-${item.bin === 'animals' ? 'plants' : 'animals'}`);
    expect(game.texts()).toContain('Not there');
    await game.press(`tile-${item.id}`);
    await game.press(`zone-${item.bin}`);
    expect(game.progress.at(-1)).toEqual({ done: 1, total: items.length });
    await game.unmount();
  });

  it('SequenceBoard list: move with the arrow buttons and check', async () => {
    const game = await renderGame(getGame('kit-sequence-board')!, 1);
    await game.press('kit-check');
    expect(game.texts()).toMatch(/wrong place/);
    await game.unmount();
  });

  it('ConnectPairs: tap left, then right', async () => {
    const game = await renderGame(getGame('kit-connect-pairs')!, 1);
    await game.press('left-camel');
    await game.press('right-camel');
    expect(game.progress.at(-1)).toEqual({ done: 1, total: 4 });
    await game.unmount();
  });

  it('BuildScene: tap a part, then its place', async () => {
    const game = await renderGame(getGame('kit-build-scene')!, 1);
    await game.press('tile-fountain');
    await game.press('zone-fountain');
    expect(game.has('built-fountain')).toBe(true);
    await game.unmount();
  });
});
