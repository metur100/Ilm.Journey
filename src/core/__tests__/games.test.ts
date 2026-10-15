import { defineNamespace } from '@/core/i18n';
import { hasArt } from '@/core/art';
import {
  applyLevelResult,
  clampStars,
  EMPTY_GAMES,
  factQuestion,
  gameAchievements,
  type GameDef,
  gameOfTheDay,
  getGame,
  isLevelUnlocked,
  listGames,
  registerGame,
  sanitizeGames,
  totalStars,
  useGamesStore,
  validateGame,
} from '@/core/games';
import { demoResult, starPositions } from '@/core/games/demo/DemoStarsGame';
import { DEMO_GAME_ID, demoGame, registerDemoGame } from '@/core/games/demo/register';
import { createGarden, EARN_TABLE, useGardenStore } from '@/core/garden';
import { getQuestCandidates, getQuestionByKey } from '@/core/registry';
import { createInitialData } from '@/core/services/engine';
import { XP } from '@/core/services/xp';
import { useAppStore } from '@/core/store/appStore';
import { TOPIC_IDS } from '@/core/models';
import { registerFeatures } from '@/features';

registerFeatures();
registerDemoGame();

const text = (en: string) => ({ en, de: en, bs: en });
const src = [{ sourceName: 'Quran', sourceReference: '6:74–79' }];

const testI18n = defineNamespace('game.test-game', {
  en: { title: 'Test', description: 'A test game', howTo: 'Tap' },
  de: { title: 'Test', description: 'Ein Testspiel', howTo: 'Tippen' },
  bs: { title: 'Test', description: 'Probna igra', howTo: 'Dodirni' },
});

const testGame: GameDef<{ n: number }> = {
  id: 'test-game',
  topicId: 'salah',
  i18n: testI18n,
  coverArt: 'garden.stars',
  component: () => null,
  levels: [
    { level: 1, config: { n: 1 }, facts: [{ id: 'fact-a', text: text('A'), sources: src }] },
    {
      level: 2,
      config: { n: 2 },
      facts: [{ id: 'fact-b', text: text('B'), sources: src, check: { type: 'trueFalse', statement: text('Not B'), correct: false } }],
    },
  ],
  cards: [
    {
      id: 'test-card',
      category: 'objects',
      art: 'object.lantern',
      title: text('Lantern'),
      fact: text('A'),
      sources: src,
      unlock: 'game:test-game:2',
      unlockTitle: text('Test'),
    },
  ],
  dev: true,
};

const result = (over: Partial<Parameters<typeof applyLevelResult>[3]> = {}) => ({ score: 10, maxScore: 10, stars: 3, mistakes: 0, factsMissed: [], ...over });

function resetStores() {
  useAppStore.setState({ ...createInitialData('en'), hydrated: true, celebrations: [] });
  useGamesStore.setState({ ...EMPTY_GAMES });
  useGardenStore.setState({ ...createGarden(), seeds: 0, water: 0 });
}

describe('game registry', () => {
  it('registers the demo game as a development fixture', () => {
    expect(getGame(DEMO_GAME_ID)).toBe(demoGame);
    expect(listGames({ includeDev: false }).some((g) => g.id === DEMO_GAME_ID)).toBe(false);
    expect(listGames({ includeDev: true }).some((g) => g.id === DEMO_GAME_ID)).toBe(true);
  });

  it('validates definitions', () => {
    expect(() => validateGame(testGame as GameDef<unknown>)).not.toThrow();
    expect(() => validateGame({ ...testGame, id: 'Bad Id' } as GameDef<unknown>)).toThrow(/kebab/);
    expect(() => validateGame({ ...testGame, i18n: demoGame.i18n } as GameDef<unknown>)).toThrow(/namespace/);
    expect(() => validateGame({ ...testGame, levels: [] } as GameDef<unknown>)).toThrow(/levels/);
    expect(() => validateGame({ ...testGame, levels: [testGame.levels[1]] } as GameDef<unknown>)).toThrow(/order/);
    const noSource = { ...testGame, levels: [{ level: 1, config: { n: 1 }, facts: [{ id: 'x', text: text('x'), sources: [] }] }] };
    expect(() => validateGame(noSource as GameDef<unknown>)).toThrow(/sources/);
    const dup = { ...testGame, levels: [testGame.levels[0], { ...testGame.levels[1], facts: testGame.levels[0].facts }] };
    expect(() => validateGame(dup as GameDef<unknown>)).toThrow(/duplicate/);
    const badCard = { ...testGame, cards: [{ ...testGame.cards![0], unlock: 'story:adam:complete' }] };
    expect(() => validateGame(badCard as GameDef<unknown>)).toThrow(/card/);
  });

  it('lists every registered game once, in a known topic, with existing cover art', () => {
    const games = listGames({ includeDev: true });
    expect(new Set(games.map((game) => game.id)).size).toBe(games.length);
    for (const game of games) {
      expect(TOPIC_IDS).toContain(game.topicId);
      expect({ id: game.id, cover: hasArt(game.coverArt) }).toEqual({ id: game.id, cover: true });
    }
  });

  it('picks a deterministic game of the day', () => {
    const list = listGames({ includeDev: true });
    expect(gameOfTheDay('2026-10-14', list)).toBe(gameOfTheDay('2026-10-14', list));
    expect(gameOfTheDay('2026-10-14', [])).toBeNull();
  });

  it('offers the game of the day as a quest', () => {
    const quests = getQuestCandidates({ day: '2026-10-14' }).filter((q) => q.kind === 'game');
    const today = gameOfTheDay('2026-10-14');
    expect(quests).toHaveLength(today ? 1 : 0);
    if (today) expect(quests[0].target).toBe(`game:${today.id}`);
  });
});

describe('facts as review questions', () => {
  beforeAll(() => registerGame(testGame));

  it('builds true/false and choice questions from facts', () => {
    const plain = factQuestion(testGame as GameDef<unknown>, testGame.levels[0].facts[0]);
    expect(plain).toMatchObject({ type: 'trueFalse', correct: true, areaId: 'salah', sources: src, id: 'test-game:fact-a' });
    const check = factQuestion(testGame as GameDef<unknown>, testGame.levels[1].facts[0]);
    expect(check).toMatchObject({ type: 'trueFalse', correct: false, prompt: text('Not B'), explanation: text('B') });
    const choice = factQuestion(demoGame as GameDef<unknown>, demoGame.levels[0].facts[0]);
    expect(choice).toMatchObject({ type: 'multipleChoice', correctOptionId: 'o0' });
  });

  it('resolves game fact keys through the registry', () => {
    const resolved = getQuestionByKey('game:test-game:fact-a');
    expect(resolved?.question.type).toBe('trueFalse');
    expect(resolved?.topicArea).toBe('salah');
    expect(resolved?.context?.title?.en).toBe('Test');
    expect(getQuestionByKey('game:test-game:missing')).toBeUndefined();
    expect(getQuestionByKey('game:nope:fact-a')).toBeUndefined();
  });

  it('gives every fact of every registered game sources', () => {
    for (const game of listGames({ includeDev: true })) {
      for (const level of game.levels) for (const fact of level.facts) expect(fact.sources.length).toBeGreaterThan(0);
    }
  });
});

describe('level progress (pure)', () => {
  it('keeps the best stars and score, counts plays', () => {
    const first = applyLevelResult(EMPTY_GAMES, 'g', 1, result({ stars: 2, score: 6 }), '2026-10-14T10:00:00Z');
    expect(first.firstCompletion).toBe(true);
    const worse = applyLevelResult(first.data, 'g', 1, result({ stars: 1, score: 2 }), '2026-10-14T11:00:00Z');
    expect(worse.bestStars).toBe(2);
    expect(worse.bestScore).toBe(6);
    expect(worse.newBest).toBe(false);
    const better = applyLevelResult(worse.data, 'g', 1, result({ stars: 3, score: 10 }), '2026-10-14T12:00:00Z');
    expect(better.newBest).toBe(true);
    expect(better.data.games.g.levels['1']).toMatchObject({ stars: 3, bestScore: 10, plays: 3 });
    expect(better.data.games.g.plays).toBe(3);
    expect(totalStars(better.data, 'g')).toBe(3);
    expect(gameAchievements(better.data)).toEqual(['game:g:1']);
  });

  it('opens levels in order and clamps stars', () => {
    expect(isLevelUnlocked(EMPTY_GAMES, 'g', 1)).toBe(true);
    expect(isLevelUnlocked(EMPTY_GAMES, 'g', 2)).toBe(false);
    const done = applyLevelResult(EMPTY_GAMES, 'g', 1, result(), 'now').data;
    expect(isLevelUnlocked(done, 'g', 2)).toBe(true);
    expect(clampStars(0)).toBe(1);
    expect(clampStars(7)).toBe(3);
    expect(clampStars(Number.NaN)).toBe(1);
  });

  it('repairs corrupt stored progress', () => {
    expect(sanitizeGames('x')).toBeNull();
    const repaired = sanitizeGames({ games: { g: { levels: { '1': { stars: 9, lastPlayed: 'x' }, '4': {} }, plays: -1 }, bad: 3 }, challengeMode: 'yes' })!;
    expect(repaired.games.g.levels['1']?.stars).toBe(3);
    expect(Object.keys(repaired.games.g.levels)).toEqual(['1']);
    expect(repaired.games.g.plays).toBe(0);
    expect(repaired.challengeMode).toBe(false);
  });
});

describe('completing a level (shell flow through the store)', () => {
  beforeAll(() => registerGame(testGame));
  beforeEach(resetStores);

  it('grants XP once per level, the perfect bonus once, and keeps the best stars', () => {
    const complete = useGamesStore.getState().completeLevel;
    const first = complete('test-game', 1, result({ stars: 2, mistakes: 1, score: 8 }));
    expect(first.xp).toBeGreaterThanOrEqual(XP.gameLevel);
    expect(first.perfect).toBe(false);
    expect(useAppStore.getState().xpAwards['game:test-game:1']).toBe(XP.gameLevel);

    const perfect = complete('test-game', 1, result());
    expect(perfect.perfect).toBe(true);
    expect(perfect.xp).toBe(XP.gamePerfectBonus); // level XP already granted, bonus once
    expect(perfect.newBest).toBe(true);

    const again = complete('test-game', 1, result({ stars: 1, score: 1, mistakes: 5 }));
    expect(again.xp).toBe(0);
    expect(again.bestStars).toBe(3);
    expect(useGamesStore.getState().games['test-game'].levels['1']?.plays).toBe(3);
  });

  it('earns seeds once per level and water for the activity', () => {
    const complete = useGamesStore.getState().completeLevel;
    const first = complete('test-game', 1, result());
    expect(first.seeds).toBe(EARN_TABLE.milestones.gameLevel.seeds);
    expect(first.water).toBe(1);
    const second = complete('test-game', 1, result());
    expect(second.seeds).toBe(0);
    expect(useAppStore.getState().streak.current).toBe(1);
  });

  it('turns missed facts into review items', () => {
    const summary = useGamesStore.getState().completeLevel('test-game', 1, result({ factsMissed: ['fact-a', 'fact-a', 'unknown'] }));
    expect(summary.reviewKeys).toEqual(['game:test-game:fact-a']);
    const item = useAppStore.getState().review['game:test-game:fact-a'];
    expect(item).toMatchObject({ box: 0, topicArea: 'salah', topic: 'game:test-game' });
    expect(useAppStore.getState().stats.questionsAnswered).toBe(0); // queued, not scored
  });

  it('queues the existing question when a fact names a reviewKey', () => {
    const summary = useGamesStore.getState().completeLevel(DEMO_GAME_ID, 2, result({ factsMissed: ['everything-sets'] }));
    expect(summary.reviewKeys).toEqual(['stories:ibrahim-sky']);
    expect(getQuestionByKey('stories:ibrahim-sky')).toBeDefined();
  });

  it('unlocks the collection card of a level', () => {
    const complete = useGamesStore.getState().completeLevel;
    expect(complete('test-game', 1, result()).newCards).toEqual([]);
    const second = complete('test-game', 2, result());
    expect(second.newCards.map((c) => c.id)).toEqual(['test-card']);
    expect(complete('test-game', 2, result()).newCards).toEqual([]);
  });

  it('completes the game-of-the-day quest', () => {
    useAppStore.setState({
      quests: [{ id: 'q', kind: 'game', goal: { type: 'complete', target: 'game:test-game', title: text('Test') }, progress: 0, target: 1, completed: false, xp: 15 }],
    });
    useGamesStore.getState().completeLevel('test-game', 1, result());
    expect(useAppStore.getState().quests[0].completed).toBe(true);
  });
});

describe('demo game', () => {
  it('places stars deterministically without overlap', () => {
    const a = starPositions(8, 'demo:3');
    expect(a).toEqual(starPositions(8, 'demo:3'));
    expect(a).toHaveLength(8);
    const cells = new Set(a.map((p) => `${Math.floor(p.x * 4)}-${Math.floor(p.y * 3)}`));
    expect(cells.size).toBe(8);
  });

  it('scores taps and reports missed facts after many mistakes', () => {
    expect(demoResult(3, 0, ['f'])).toEqual({ score: 30, maxScore: 30, stars: 3, mistakes: 0, factsMissed: [] });
    expect(demoResult(3, 2, ['f']).stars).toBe(2);
    expect(demoResult(3, 9, ['f'])).toMatchObject({ score: 0, stars: 1, factsMissed: ['f'] });
  });
});
