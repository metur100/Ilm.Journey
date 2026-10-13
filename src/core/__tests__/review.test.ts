import type { AnswerRef, ReviewItem } from '@/core/models';
import { dueItems, isDue, MAX_BOX, nextReviewDate, pendingKeys, recordMistake, recordSuccess, topicWeakness } from '@/core/services/review';

const NOW = '2026-10-06T10:00:00.000Z';
const day = (n: number) => new Date(new Date(NOW).getTime() + n * 86_400_000).toISOString();
const ref = (key: string, topic = 't'): AnswerRef => ({ key, topic });

describe('spaced review', () => {
  it('creates a due item on the first mistake, keyed by the global question key', () => {
    const item = recordMistake(undefined, { key: 'learn:q1', topic: 'wudu', topicArea: 'salah' }, NOW);
    expect(item).toMatchObject({ key: 'learn:q1', topic: 'wudu', topicArea: 'salah', box: 0, incorrectCount: 1, correctCount: 0, mastered: false });
    expect(isDue(item, NOW)).toBe(true);
  });

  it('moves up a box with growing intervals after correct answers', () => {
    let item = recordMistake(undefined, ref('learn:q1'), NOW);
    item = recordSuccess(item, NOW);
    expect(item.box).toBe(1);
    expect(item.nextReviewDate).toBe(day(1));
    expect(isDue(item, NOW)).toBe(false);
    expect(isDue(item, day(1))).toBe(true);

    item = recordSuccess(item, day(1));
    expect(item.box).toBe(2);
    expect(item.nextReviewDate).toBe(day(4));
  });

  it('marks an item as mastered after the last box', () => {
    let item: ReviewItem = { ...recordMistake(undefined, ref('learn:q1'), NOW), box: MAX_BOX };
    item = recordSuccess(item, NOW);
    expect(item.mastered).toBe(true);
    expect(isDue(item, day(100))).toBe(false);
  });

  it('a new mistake sends the item back to box 0 and keeps history', () => {
    let item = recordSuccess(recordMistake(undefined, ref('stories:q1'), NOW), NOW);
    item = recordMistake(item, ref('stories:q1'), day(1));
    expect(item.box).toBe(0);
    expect(item.incorrectCount).toBe(2);
    expect(item.correctCount).toBe(1);
    expect(item.lastSeen).toBe(day(1));
  });

  it('prioritises the least known items and weakest topics across features', () => {
    const items: Record<string, ReviewItem> = {
      'learn:a': { ...recordMistake(undefined, ref('learn:a', 'easy'), NOW), box: 1, nextReviewDate: NOW },
      'stories:b': recordMistake(undefined, ref('stories:b', 'hard'), NOW),
      'seerah:c': { ...recordMistake(undefined, ref('seerah:c', 'hard'), NOW), incorrectCount: 3 },
      'learn:d': { ...recordMistake(undefined, ref('learn:d', 'x'), NOW), nextReviewDate: day(2) },
      'quest:e': { ...recordMistake(undefined, ref('quest:e', 'x'), NOW), mastered: true },
    };
    expect(dueItems(items, NOW).map((i) => i.key)).toEqual(['seerah:c', 'stories:b', 'learn:a']);
    expect(topicWeakness(Object.values(items))).toEqual({ easy: 1, hard: 4, x: 1 });
    expect(nextReviewDate(items)).toBe(NOW);
    expect(pendingKeys(items).sort()).toEqual(['learn:a', 'learn:d', 'seerah:c', 'stories:b']);
  });

  it('returns no next date when everything is mastered', () => {
    expect(nextReviewDate({})).toBeNull();
  });
});
