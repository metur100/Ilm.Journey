import { honestScalesGame, roundsSolvable } from '../honest-scales/register';

import { pieces, shareRule } from '../share-the-plate/logic';

import { nearestFirstRule } from '../gifts-for-neighbours/logic';

import { goodOrSilentRule, treeStage } from '../good-word-tree/logic';

it('every market order and every change can be weighed exactly', () => {
  for (const level of honestScalesGame.levels) expect(roundsSolvable(level.config.rounds)).toBe(true);
});

describe('share the plate', () => {
  const food = [...pieces('dates', 4), ...pieces('bread', 2)];
  const rule = shareRule(food, ['a', 'b'], 'wait');

  it('gives in fair turns and finishes with equal plates', () => {
    let placed: { item: string; target: string }[] = [];
    for (let move = rule.next(placed); move; move = rule.next(placed)) {
      expect(rule.check(placed, move)).toBe(true);
      placed = [...placed, move];
    }
    expect(rule.done(placed)).toBe(true);
    for (const plate of ['a', 'b']) expect(placed.filter((p) => p.target === plate)).toHaveLength(3);
  });

  it('refuses a second date on a plate while the other has none', () => {
    const placed = [{ item: 'dates-1', target: 'a' }];
    expect(rule.check(placed, { item: 'dates-2', target: 'a' })).toBe('wait');
    expect(rule.check(placed, { item: 'bread-1', target: 'a' })).toBe(true);
    expect(rule.wrong(placed)).toEqual({ item: 'dates-2', target: 'a' });
  });
});

describe('gifts for the neighbours', () => {
  const rule = nearestFirstRule(['a', 'b', 'c'], ['d1', 'd2', 'd3'], 'nearest', 'full');
  it('serves the nearest door first', () => {
    expect(rule.check([], { item: 'a', target: 'd2' })).toBe('nearest');
    expect(rule.check([], { item: 'a', target: 'd1' })).toBe(true);
    expect(rule.check([{ item: 'a', target: 'd1' }], { item: 'b', target: 'd1' })).toBe('full');
    expect(rule.next([{ item: 'a', target: 'd1' }])).toEqual({ item: 'b', target: 'd2' });
  });
});

describe('the good word tree', () => {
  it('grows in five stages', () => {
    expect([0, 1, 2, 3, 4].map((n) => treeStage(n, 4))).toEqual([0, 1, 2, 3, 4]);
    expect(treeStage(6, 6)).toBe(4);
  });
  it('puts kind words on the tree and hurtful ones into silence', () => {
    const rule = goodOrSilentRule([{ id: 'a', good: true }, { id: 'b', good: false }], 'tree', 'silent');
    expect(rule.check([], { item: 'b', target: 'tree' })).toBe('silent');
    expect(rule.check([], { item: 'a', target: 'silent' })).toBe('tree');
    expect(rule.check([], { item: 'b', target: 'silent' })).toBe(true);
  });
});
