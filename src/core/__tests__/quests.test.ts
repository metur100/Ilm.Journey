import { BADGES, mergeMetrics } from '@/core/services/badges';
import { generateQuests, MAX_QUESTS, progressQuests, QUEST_XP, type QuestCandidate } from '@/core/services/quests';

const text = { en: 'x', de: 'x', bs: 'x' };
const DAY = '2026-10-06';
const candidate = (id: string, priority = 0): QuestCandidate => ({ id, kind: 'learning', target: `t:${id}`, title: text, topicArea: 'quran', priority });

describe('quests of the day', () => {
  it('always has the daily challenge and a knowledge quest, at most five quests', () => {
    const quests = generateQuests(DAY, [candidate('a'), candidate('b'), candidate('c'), candidate('d'), candidate('e')], 3);
    expect(quests[0]).toMatchObject({ id: `${DAY}-daily`, kind: 'daily', xp: QUEST_XP.daily });
    expect(quests.map((q) => q.kind)).toEqual(expect.arrayContaining(['daily', 'learning', 'knowledge', 'review']));
    expect(quests.length).toBe(MAX_QUESTS);
  });

  it('uses the best candidate first and its topic for the knowledge quest', () => {
    const quests = generateQuests(DAY, [candidate('low', 1), { ...candidate('high', 10), topicArea: 'arabic' }], 0);
    expect(quests[1].id).toBe(`${DAY}-high`);
    expect(quests.find((q) => q.kind === 'knowledge')?.goal).toEqual({ type: 'correctAnswers', topicArea: 'arabic', count: 5 });
    expect(quests.some((q) => q.kind === 'review')).toBe(false);
  });

  it('progresses quests from events and pays XP once', () => {
    let quests = generateQuests(DAY, [candidate('a')], 1);
    let result = progressQuests(quests, { type: 'complete', target: 't:a' });
    expect(result.xp).toBe(QUEST_XP.learning);
    quests = result.quests;
    expect(progressQuests(quests, { type: 'complete', target: 't:a' }).xp).toBe(0);

    for (let i = 0; i < 5; i++) {
      result = progressQuests(quests, { type: 'answer', topicArea: 'quran', correct: true, review: false });
      quests = result.quests;
    }
    expect(quests.find((q) => q.kind === 'knowledge')?.completed).toBe(true);
    // Answers of another topic do not count.
    const other = progressQuests(generateQuests(DAY, [candidate('a')], 0), { type: 'answer', topicArea: 'salah', correct: true, review: false });
    expect(other.quests.find((q) => q.kind === 'knowledge')?.progress).toBe(0);

    result = progressQuests(quests, { type: 'answer', correct: true, review: true });
    expect(result.quests.find((q) => q.kind === 'review')?.completed).toBe(true);
    expect(progressQuests(quests, { type: 'dailyComplete' }).quests[0].completed).toBe(true);
  });
});

describe('badge list', () => {
  it('has unique ids and the merged groups of all four apps', () => {
    const ids = BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(28);
    expect(new Set(BADGES.map((b) => b.group))).toEqual(new Set(['journey', 'topics', 'stories', 'seerah']));
  });

  it('sums metrics and ignores non-numbers', () => {
    expect(mergeMetrics({ perfectRuns: 1 }, { perfectRuns: 2, lessonsCompleted: Number.NaN })).toEqual({ perfectRuns: 3 });
  });
});
