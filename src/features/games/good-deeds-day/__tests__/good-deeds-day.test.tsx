import { act } from 'react-test-renderer';

import { hasArt } from '@/core/art';
import { allFacts, getGame, validateGame } from '@/core/games';
import { activeProbes, namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';

import { choice, DILEMMAS, EVERYDAY, FLOWERS, WHOLE_DAY } from '../content';
import { momentRule, wholeDayRule } from '../logic';
import { DEEDS_GAME_ID, registerGoodDeedsDayGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerGoodDeedsDayGame();
const game = () => getGame(DEEDS_GAME_ID)!;

it('is valid with 3 levels and complete texts', () => {
  expect(() => validateGame(game())).not.toThrow();
  expect(game().levels).toHaveLength(3);
  expect(namespaceProblems(game())).toEqual([]);
  for (const fact of allFacts(game())) expect(fact.sources.length).toBeGreaterThan(0);
});

it('every moment is a content scenario with one good option, feedback and a picture', () => {
  for (const m of [...EVERYDAY, ...DILEMMAS, ...WHOLE_DAY]) {
    const q = choice(m.question);
    expect(q.correctIndex).toBeGreaterThanOrEqual(0);
    expect(q.sources.length).toBeGreaterThan(0);
    for (const o of q.options) expect(o.text.bs && o.text.de && o.text.en).toBeTruthy();
    expect(hasArt(m.art)).toBe(true);
  }
  for (const f of [...FLOWERS, game().coverArt]) expect(hasArt(f)).toBe(true);
});

it('rules: only the good option fits a moment; deeds go to their own moment', () => {
  const rule = momentRule(['option-0', 'option-1'], 1, (i) => `feedback ${i}`);
  expect(rule.check([], { item: 'option-0', target: 'moment' })).toBe('feedback 0');
  expect(rule.check([], { item: 'option-1', target: 'moment' })).toBe(true);
  const day = wholeDayRule(['a', 'b'], 'other');
  expect(day.check([], { item: 'deed-a', target: 'b' })).toBe('other');
  expect(day.next([{ item: 'deed-a', target: 'a' }])).toEqual({ item: 'deed-b', target: 'b' });
});

it.each([1, 2, 3] as const)('level %s plays to completion with 3 stars', async (level) => {
  const g = await renderGame(game(), level);
  const result = await playToEnd(g);
  expect(result.stars).toBe(3);
  await g.unmount();
});

it('a second try reports the moment’s fact for review', async () => {
  const g = await renderGame(game(), 2, { language: 'de' });
  await act(async () => {
    activeProbes()[0].mistake?.();
  });
  const result = await playToEnd(g);
  expect(result.mistakes).toBe(1);
  expect(result.factsMissed).toEqual(['sidq']);
  await g.unmount();
});
