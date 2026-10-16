import { honestScalesGame, roundsSolvable } from '../honest-scales/register';

it('every market order and every change can be weighed exactly', () => {
  for (const level of honestScalesGame.levels) expect(roundsSolvable(level.config.rounds)).toBe(true);
});

import { pieces, shareRule } from '../share-the-plate/logic';

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
