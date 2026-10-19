import { getGame } from '@/core/games';

import { ARABIC_GAME_IDS, registerArabicGames } from '../index';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

registerArabicGames();

/** The ten "Arabic basics" games added to the Play section "Arabic" (topic `arabic`). */
const BASICS_IDS = [
  'arabic-greetings',
  'arabic-numbers',
  'arabic-colors',
  'arabic-family',
  'arabic-body',
  'arabic-food',
  'arabic-times',
  'arabic-opposites',
  'arabic-prayer-words',
  'arabic-phrases',
] as const;

describe('Arabic basics games', () => {
  it('registers the ten new games in the Arabic section', () => {
    expect(new Set(BASICS_IDS).size).toBe(10);
    for (const id of BASICS_IDS) {
      expect(ARABIC_GAME_IDS).toContain(id);
      const game = getGame(id);
      expect(game).toBeDefined();
      expect(game!.topicId).toBe('arabic');
    }
  });

  it.each(BASICS_IDS)('%s has three levels with language facts and enough pairs/items', (id) => {
    const game = getGame(id)!;
    expect(game.levels).toHaveLength(3);

    const factIds = new Set<string>();
    for (const level of game.levels) {
      expect(level.facts.length).toBeGreaterThanOrEqual(2);
      expect(level.facts.length).toBeLessThanOrEqual(3);

      // ConnectGame / MemoryGame use `pairs`, SequenceGame uses `items`. The prayer-times game starts with the
      // specified three-item warm-up (3 → 4 → 5), every other level has four or more pairs.
      const config = level.config as { pairs?: unknown[]; items?: unknown[] };
      const count = config.pairs?.length ?? config.items?.length ?? 0;
      expect(count).toBeGreaterThanOrEqual(config.items ? 3 : 4);

      for (const fact of level.facts) {
        expect(fact.kind).toBe('language');
        expect(fact.sources.length).toBeGreaterThan(0);
        expect(fact.sources.every((source) => source.sourceName.trim().length > 0)).toBe(true);
        expect(factIds.has(fact.id)).toBe(false);
        factIds.add(fact.id);
        for (const language of ['en', 'de', 'bs'] as const) expect(fact.text[language].trim()).not.toBe('');
      }
    }
  });
});
