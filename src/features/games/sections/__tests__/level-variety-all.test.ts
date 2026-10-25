import { type GameDef, listGames } from '@/core/games';
import { registerFeatures } from '@/features';

import { episodeItemIds, isEpisodeConfig, isLessonFact } from '../prophets-story/episode';

/*
 * Owner feedback: "the content repeats – always similar games from one level to the next, just harder". These checks
 * run over EVERY registered game (dev demos excluded):
 * - each level teaches its own "You learned" facts (no fact id or fact text repeats in another level);
 * - no two levels have the same config;
 * - two levels share at most half of their items (ids found anywhere in the level config, or the strings of
 *   string lists like `things: ['sun', 'moon']`);
 * - prophets: each level is a different event of the prophet's life – the levels share no item at all – and its last
 *   "You learned" card is the lesson (pouka) of that event (`lessonFact`).
 */

registerFeatures();

/**
 * Games whose levels still share more than half of their items, each with the reason it is intended. Keep this list
 * short: a new entry needs a reason a reviewer would accept.
 */
const OVERLAP_ALLOWED: Record<string, string> = {
  'golden-age-scholars': 'Only five scholars are in the content; each level links them to a new facet (field → famous work → city).',
  'harakat-sounds': 'The three short vowels are the subject itself; each level adds a new skill (two marks → all three → by ear).',
};

/** Item ids of a level: every `id` and every string of a string list anywhere in the config (episodes: their items). */
export function levelItemIds(config: unknown): Set<string> {
  if (isEpisodeConfig(config)) return new Set(episodeItemIds(config.episode));
  const out = new Set<string>();
  const walk = (v: unknown) => {
    if (Array.isArray(v)) {
      if (v.length > 1 && v.every((x) => typeof x === 'string')) v.forEach((x) => out.add(`s:${x as string}`));
      else v.forEach(walk);
    } else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) {
        if (k === 'id' && typeof x === 'string') out.add(x);
        else walk(x);
      }
    }
  };
  walk(config);
  return out;
}

const shared = (a: Set<string>, b: Set<string>) => [...a].filter((id) => b.has(id));

const games = (listGames({ includeDev: false }) as GameDef<unknown>[]).filter((g) => !g.dev);
const pairsOf = (g: GameDef<unknown>) => g.levels.flatMap((a, i) => g.levels.slice(i + 1).map((b) => [a, b] as const));

describe('no game repeats the same content in its levels', () => {
  it('finds the games', () => expect(games.length).toBeGreaterThan(100));

  it.each(games.map((g) => [g.id, g] as const))('%s: every level teaches its own facts', (_id, game) => {
    const problems: string[] = [];
    for (const [a, b] of pairsOf(game)) {
      for (const f of a.facts) {
        const same = b.facts.find((g) => g.id === f.id || g.text.en === f.text.en);
        if (same) problems.push(`L${a.level}/L${b.level}: ${f.id}`);
      }
      if (JSON.stringify(a.config) === JSON.stringify(b.config)) problems.push(`L${a.level}/L${b.level}: same config`);
    }
    expect(problems).toEqual([]);
  });

  it.each(games.filter((g) => !OVERLAP_ALLOWED[g.id]).map((g) => [g.id, g] as const))('%s: levels share at most half of their items', (_id, game) => {
    const problems: string[] = [];
    for (const [a, b] of pairsOf(game)) {
      const ia = levelItemIds(a.config);
      const ib = levelItemIds(b.config);
      const both = shared(ia, ib);
      const min = Math.min(ia.size, ib.size);
      if (min >= 3 && both.length / min > 0.5) problems.push(`L${a.level}/L${b.level} share ${both.length}/${min}: ${both.join(', ')}`);
    }
    expect(problems).toEqual([]);
  });

  it('the allow-list only names existing games', () => {
    for (const id of Object.keys(OVERLAP_ALLOWED)) expect(games.map((g) => g.id)).toContain(id);
  });
});

describe('prophets: three events of the prophet’s life, each with its lesson', () => {
  const prophets = games.filter((g) => g.topicId === 'prophets');

  it('covers every prophets game', () => expect(prophets.length).toBeGreaterThanOrEqual(25));

  it.each(prophets.map((g) => [g.id, g] as const))('%s: each level ends with a lesson (pouka)', (_id, game) => {
    expect(game.levels).toHaveLength(3);
    for (const level of game.levels) {
      const last = level.facts[level.facts.length - 1];
      expect({ level: level.level, lesson: last.id, ok: isLessonFact(last) }).toEqual({ level: level.level, lesson: last.id, ok: true });
    }
  });

  it.each(prophets.map((g) => [g.id, g] as const))('%s: the levels share no item (a different event each)', (_id, game) => {
    const problems: string[] = [];
    for (const [a, b] of pairsOf(game)) {
      const both = shared(levelItemIds(a.config), levelItemIds(b.config));
      if (both.length) problems.push(`L${a.level}/L${b.level}: ${both.join(', ')}`);
    }
    expect(problems).toEqual([]);
  });
});
