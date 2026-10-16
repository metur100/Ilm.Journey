import * as fs from 'fs';
import * as path from 'path';

import { hasArt } from '@/core/art';
import { type GameDef, getGame, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';

import { HISTORY_GAMES, registerHistoryGames } from '..';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerHistoryGames();

const LEARN_DIR = path.resolve(__dirname, '../../../../learn/content/history');
const learnIds = new Set(
  fs.readdirSync(LEARN_DIR).flatMap((f) => (JSON.parse(fs.readFileSync(path.join(LEARN_DIR, f), 'utf8')).questions as { id: string }[]).map((q) => `learn:${q.id}`)),
);
const FORBIDDEN = /muslims? believe|muslime glauben|muslimani vjeruju|for muslims|für muslime|za muslimane/i;

describe.each(HISTORY_GAMES.map((g) => [g.id, g] as [string, GameDef<any>]))('%s', (id, def) => {
  it('is registered, valid and complete in en / de / bs', () => {
    expect(getGame(id)).toBe(def);
    expect(def.topicId).toBe('history');
    expect(() => validateGame(def)).not.toThrow();
    expect(namespaceProblems(def)).toEqual([]);
  });

  it('has sourced facts in three languages, existing art and review keys', () => {
    expect(hasArt(def.coverArt)).toBe(true);
    for (const level of def.levels) {
      expect(level.facts.length).toBeGreaterThan(0);
      for (const fact of level.facts) {
        expect(fact.sources.length).toBeGreaterThan(0);
        for (const lang of ['en', 'de', 'bs'] as const) {
          expect(fact.text[lang].trim().length).toBeGreaterThan(10);
          expect(fact.text[lang]).not.toMatch(FORBIDDEN);
        }
        if (fact.art) expect({ art: fact.art, ok: hasArt(fact.art) }).toEqual({ art: fact.art, ok: true });
        if (fact.reviewKey) expect({ key: fact.reviewKey, ok: learnIds.has(fact.reviewKey) }).toEqual({ key: fact.reviewKey, ok: true });
      }
    }
  });

  it.each([1, 2, 3] as const)('level %s plays to completion with 3 stars', async (level) => {
    const game = await renderGame(def, level);
    const result = await playToEnd(game);
    expect(result.stars).toBe(3);
    expect(result.factsMissed).toEqual([]);
    await game.unmount();
  });

  it('reports mistakes as missed facts of the level', async () => {
    const game = await renderGame(def, 2, { language: 'bs' });
    const result = await playToEnd(game, { mistakes: 2 });
    expect(result.mistakes).toBeGreaterThan(0);
    expect(result.stars).toBeLessThan(3);
    const ids = def.levels[1].facts.map((f) => f.id);
    for (const missed of result.factsMissed) expect(ids).toContain(missed);
    await game.unmount();
  });
});
