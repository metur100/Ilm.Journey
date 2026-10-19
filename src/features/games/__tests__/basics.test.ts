import { listGames } from '@/core/games';
import { TOPIC_BASICS } from '@/core/games/basics';
import { LANGUAGES, TOPIC_IDS } from '@/core/models';
import { registerFeatures } from '@/features';

registerFeatures();

describe('topic basics shown before every game', () => {
  it('has a sourced, translated fact for every topic', () => {
    for (const topic of TOPIC_IDS) {
      const fact = TOPIC_BASICS[topic];
      expect(fact).toBeDefined();
      expect(fact.id.startsWith(`${topic}-`)).toBe(true);
      expect(fact.sources.length).toBeGreaterThan(0);
      for (const lang of LANGUAGES) expect(fact.text[lang].trim().length).toBeGreaterThan(20);
    }
  });

  it('uses unique fact ids', () => {
    const ids = TOPIC_IDS.map((t) => TOPIC_BASICS[t].id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('marks the Arabic and Sufara facts as language facts', () => {
    expect(TOPIC_BASICS.sufara.kind).toBe('language');
    expect(TOPIC_BASICS.arabic.kind).toBe('language');
    expect(TOPIC_BASICS.salah.kind).toBeUndefined();
  });

  it('every registered game has the basics of its topic', () => {
    const games = listGames();
    expect(games.length).toBeGreaterThan(40);
    for (const game of games) expect(TOPIC_BASICS[game.topicId]).toBeDefined();
  });
});
