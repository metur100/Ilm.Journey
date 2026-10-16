import { honestScalesGame, roundsSolvable } from '../honest-scales/register';

it('every market order and every change can be weighed exactly', () => {
  for (const level of honestScalesGame.levels) expect(roundsSolvable(level.config.rounds)).toBe(true);
});
