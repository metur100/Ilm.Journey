/* Test helper of the salah section (Jest only – import it from tests, never from app code). */
import { hasArt } from '@/core/art';
import { getGame, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame } from '@/core/games/kit/testing';
import { findForbiddenPhrases } from '@/core/i18n/phrasing';

/**
 * Standard checks of a salah game: valid definition, en / de / bs complete, every art name exists, every level plays
 * to completion with 3 stars, and wrong moves are reported as missed facts of the level being played.
 */
export function describeSalahGame(id: string, art: readonly string[], mistakeLevels: readonly (1 | 2 | 3)[] = [1, 2, 3]): void {
  describe(`${id} (standard checks)`, () => {
    const game = () => getGame(id)!;

    it('is valid and complete in en / de / bs, with sourced facts', () => {
      expect(() => validateGame(game())).not.toThrow();
      expect(namespaceProblems(game())).toEqual([]);
      expect(art.filter((a) => !hasArt(a))).toEqual([]);
      expect(hasArt(game().coverArt)).toBe(true);
      for (const level of game().levels) {
        for (const fact of level.facts) {
          expect(fact.sources.length).toBeGreaterThan(0);
          for (const lang of ['en', 'de', 'bs'] as const) expect(fact.text[lang]?.trim()).toBeTruthy();
          // State truths directly (GAMES-V3 §2) – the same patterns as the repository-wide phrasing scan.
          for (const lang of ['en', 'de', 'bs'] as const) expect({ fact: fact.id, lang, hits: findForbiddenPhrases(fact.text[lang] ?? '') }).toEqual({ fact: fact.id, lang, hits: [] });
        }
      }
    });

    it.each([1, 2, 3] as const)('level %s plays to completion with 3 stars', async (level) => {
      const g = await renderGame(game(), level);
      expect((await playToEnd(g)).stars).toBe(3);
      await g.unmount();
    });

    if (mistakeLevels.length > 0) {
      it.each(mistakeLevels)('level %s reports mistakes as missed facts of the level', async (level) => {
        const g = await renderGame(game(), level, { language: 'bs' });
        const result = await playToEnd(g, { mistakes: 1 });
        expect(result.mistakes).toBeGreaterThan(0);
        expect(result.stars).toBeLessThan(3);
        const ids = game().levels[level - 1].facts.map((f) => f.id);
        expect(result.factsMissed.length).toBeGreaterThan(0);
        expect(result.factsMissed.every((f) => ids.includes(f))).toBe(true);
        await g.unmount();
      });
    }
  });
}
