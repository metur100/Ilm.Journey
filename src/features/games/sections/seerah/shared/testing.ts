/* Jest-only helpers for the Seerah games (never import from app code). */
import { hasArt } from '@/core/art';
import { getGame, type GameDef, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';

import { levelArt, levelTexts, type SeerahLevelConfig } from './SeerahGame';

/** The standard test suite of a Seerah section game. */
export function describeSeerahGame(id: string, register: () => void): void {
  register();
  const game = () => getGame(id) as GameDef<SeerahLevelConfig>;

  describe(`seerah game ${id}`, () => {
    it('is valid and complete in en / de / bs', () => {
      expect(() => validateGame(game() as unknown as GameDef<unknown>)).not.toThrow();
      expect(namespaceProblems(game() as unknown as GameDef<unknown>)).toEqual([]);
    });

    it('uses existing art, existing i18n keys, and sourced facts (direct wording: src/core/__tests__/phrasing.test.ts)', () => {
      const g = game();
      const dict = (g.i18n.dictionaries as unknown as Record<string, Record<string, string>>).en;
      const missingArt = [g.coverArt, ...(g.hintArt ? [g.hintArt] : []), ...g.levels.flatMap((l) => levelArt(l.config)), ...g.levels.flatMap((l) => l.facts.map((f) => f.art ?? '').filter(Boolean))].filter((a) => !hasArt(a));
      expect(missingArt).toEqual([]);
      const missingKeys = g.levels.flatMap((l) => levelTexts(l.config)).filter((s): s is { key: string } => 'key' in s).map((s) => s.key).filter((k) => !(k in dict));
      expect(missingKeys).toEqual([]);
      for (const l of g.levels) {
        for (const f of l.facts) {
          expect(f.sources.length).toBeGreaterThan(0);
          for (const lang of ['en', 'de', 'bs'] as const) {
            expect(f.text[lang]?.trim()).toBeTruthy();
          }
        }
        // Every mapped fact id is a fact of the game.
        const ids = new Set(g.levels.flatMap((x) => x.facts.map((f) => f.id)));
        for (const factId of Object.values(l.config.factMap ?? {})) expect(ids.has(factId)).toBe(true);
      }
    });

    it.each([1, 2, 3] as const)('level %s plays to completion with 3 stars', async (level) => {
      const r = await renderGame(game(), level);
      expect((await playToEnd(r)).stars).toBe(3);
      await r.unmount();
    });

    it('reports a mistake as a missed fact', async () => {
      let found = false;
      for (const level of [1, 2, 3] as const) {
        if (!Object.keys(game().levels[level - 1].config.factMap ?? {}).length) continue;
        const r = await renderGame(game(), level);
        const result = await playToEnd(r, { mistakes: 1 });
        await r.unmount();
        if (result.mistakes > 0) {
          expect(result.factsMissed.length).toBeGreaterThan(0);
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });
  });
}
