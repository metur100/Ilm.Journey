/* Shared Jest checks of the prophets-c games (import from tests only). */
import { hasArt } from '@/core/art';
import { type GameDef, validateGame } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame, type RenderedGame } from '@/core/games/kit/testing';

export interface GameTestOptions {
  /** Every art name the game draws. */
  art: string[];
  /** Level whose mistakes are reported as missed facts (default 2). */
  mistakeLevel?: 1 | 2 | 3;
  onIdle?: (game: RenderedGame) => Promise<boolean> | boolean;
}

/** Validity, translations, art, every level played to the end, mistakes → fewer stars and missed facts. */
export function describeProphetGame(def: () => GameDef<any>, options: GameTestOptions): void {
  it('is valid and complete in en / de / bs', () => {
    const game = def();
    expect(() => validateGame(game)).not.toThrow();
    expect(namespaceProblems(game)).toEqual([]);
    expect(game.topicId).toBe('prophets');
  });

  it('only draws existing art (never people)', () => {
    const game = def();
    const names = [
      game.coverArt,
      ...(game.hintArt ? [game.hintArt] : []),
      ...options.art,
      ...game.levels.flatMap((l) => l.facts.flatMap((f) => (f.art ? [f.art] : []))),
    ];
    for (const name of names) {
      expect({
        name,
        ok: hasArt(name) && !name.startsWith('body.') && !name.startsWith('pose.'),
      }).toEqual({ name, ok: true });
    }
  });

  it.each([1, 2, 3] as const)('level %s plays to completion with 3 stars', async (level) => {
    const game = await renderGame(def(), level);
    const result = await playToEnd(game, { onIdle: options.onIdle });
    expect(result.stars).toBe(3);
    expect(result.mistakes).toBe(0);
    await game.unmount();
  });

  it.each(['de', 'bs'] as const)('renders in %s', async (language) => {
    const game = await renderGame(def(), 1, { language });
    expect(game.texts().length).toBeGreaterThan(0);
    await game.unmount();
  });

  it('reports mistakes as missed facts', async () => {
    const level = options.mistakeLevel ?? 2;
    const game = await renderGame(def(), level);
    const result = await playToEnd(game, {
      mistakes: 2,
      onIdle: options.onIdle,
    });
    expect(result.mistakes).toBeGreaterThan(0);
    expect(result.stars).toBeLessThan(3);
    const factIds = def().levels.flatMap((l) => l.facts.map((f) => f.id));
    expect(result.factsMissed.length).toBeGreaterThan(0);
    for (const id of result.factsMissed) expect(factIds).toContain(id);
    await game.unmount();
  });
}
