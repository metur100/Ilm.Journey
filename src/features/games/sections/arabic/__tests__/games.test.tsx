import { hasArt } from '@/core/art';
import { getGame, validateGame, type GameDef, type GameLevel } from '@/core/games';
import { namespaceProblems, playToEnd, renderGame, type RenderedGame } from '@/core/games/kit/testing';

import { ARABIC_GAME_IDS, registerArabicGames } from '../index';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
jest.mock('@/core/services/speech', () => ({
  speakArabic: jest.fn(() => true),
  stopSpeaking: jest.fn(),
  arabicVoiceStatus: jest.fn(() => 'available'),
  detectArabicVoice: jest.fn(() => Promise.resolve('available')),
  onArabicVoiceStatus: jest.fn(() => () => undefined),
}));

registerArabicGames();

/** Presses the "next" style controls some boards show between rounds. */
async function idle(game: RenderedGame): Promise<boolean> {
  for (const id of ['arabic-next', 'kit-finish-continue']) {
    if (game.has(id)) {
      await game.press(id);
      return true;
    }
  }
  return false;
}

const games = (): GameDef<unknown>[] => ARABIC_GAME_IDS.map((id) => getGame(id)!);

describe('Arabic / Sufara games', () => {
  it('registers at least the planned games in sufara order', () => {
    const orders = games().map((g) => g.order ?? 0);
    expect([...orders].sort((a, b) => a - b)).toEqual(orders);
    for (const game of games()) expect(game.topicId).toBe('arabic');
  });

  it.each(ARABIC_GAME_IDS)('%s is valid, complete in en / de / bs and its art exists', (id) => {
    const game = getGame(id)!;
    expect(() => validateGame(game)).not.toThrow();
    expect(namespaceProblems(game)).toEqual([]);
    expect(hasArt(game.coverArt)).toBe(true);
    if (game.hintArt) expect(hasArt(game.hintArt)).toBe(true);
    for (const level of game.levels) {
      for (const fact of level.facts) {
        expect(fact.kind).toBe('language');
        if (fact.art) expect(hasArt(fact.art)).toBe(true);
        for (const lang of ['en', 'de', 'bs'] as const) expect(fact.text[lang].trim()).not.toBe('');
      }
    }
  });

  const cases = ARABIC_GAME_IDS.flatMap((id) => ([1, 2, 3] as GameLevel[]).map((level) => [id, level] as const));

  it.each(cases)('%s level %s plays to completion with 3 stars', async (id, level) => {
    const game = await renderGame(getGame(id)!, level);
    const result = await playToEnd(game, { onIdle: idle, maxSteps: 600 });
    expect(result.stars).toBe(3);
    expect(result.factsMissed).toEqual([]);
    await game.unmount();
  });

  it.each(ARABIC_GAME_IDS)('%s reports mistakes as missed facts (level 2)', async (id) => {
    const def = getGame(id)!;
    const game = await renderGame(def, 2);
    const result = await playToEnd(game, { mistakes: 2, onIdle: idle, maxSteps: 600 });
    expect(result.mistakes).toBeGreaterThan(0);
    expect(result.stars).toBeLessThan(3);
    expect(result.factsMissed.length).toBeGreaterThan(0);
    for (const factId of result.factsMissed) expect(def.levels[1].facts.map((f) => f.id)).toContain(factId);
    await game.unmount();
  });

  it.each(['de', 'bs'] as const)('renders level 1 of every game in %s', async (language) => {
    for (const def of games()) {
      const game = await renderGame(def, 1, { language });
      expect(game.texts().length).toBeGreaterThan(0);
      await game.unmount();
    }
  });
});
