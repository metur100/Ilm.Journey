import type { Question } from '@/core/models';
import { evaluateAnswer, scoreQuiz } from '@/core/services/quiz';
import { getQuestQuestion } from '@/features/learn/content/quests';
import { addRepetition, allRepeated, applyMemorizationTest, EMPTY_MEMORIZATION, memorizationSummary, missingWordPuzzle, REPEATS, setAyahsLearned } from '@/features/learn/quests/services/memorization';
import { applyQuestComplete, EMPTY_QUEST_DATA, sanitizeQuestData, toggleRamadanDeed, totalRamadanDeeds } from '@/features/learn/quests/services/progress';
import { EMPTY_TRACE, endStroke, extendStroke, isTraced, REQUIRED_LENGTH, startStroke, traceProgress } from '@/features/learn/quests/services/tracing';
import { getSurah } from '@/features/quran';

const text = (s: string) => ({ en: s, de: s, bs: s });
const base = { topic: 't', prompt: text('p'), explanation: text('e') };

describe('quiz (ported from islam-quest)', () => {
  it('checks ayah order by ayah number', () => {
    const q: Question = { ...base, id: 'q', type: 'ayahOrder', surahNumber: 112 };
    expect(evaluateAnswer(q, { type: 'order', ids: ['1', '2', '3', '4'] }, { ayahCount: 4 })).toBe(true);
    expect(evaluateAnswer(q, { type: 'order', ids: ['2', '1', '3', '4'] }, { ayahCount: 4 })).toBe(false);
    expect(evaluateAnswer(q, { type: 'order', ids: ['1', '2', '3'] }, { ayahCount: 4 })).toBe(false);
  });

  it('checks the missing word against the puzzle built from the Quran data', () => {
    const q = getQuestQuestion('ikhlas-word-1');
    expect(q?.type).toBe('missingWord');
    if (q?.type !== 'missingWord') return;
    const puzzle = missingWordPuzzle(q.surahNumber, q.ayahNumber, q.missingWordIndex)!;
    expect(puzzle.choices).toContain(puzzle.answer);
    expect(evaluateAnswer(q, { type: 'word', word: puzzle.answer }, { missingWord: puzzle.answer })).toBe(true);
    const wrong = puzzle.choices.find((w) => w !== puzzle.answer)!;
    expect(evaluateAnswer(q, { type: 'word', word: wrong }, { missingWord: puzzle.answer })).toBe(false);
    // Deterministic: the same puzzle every time.
    expect(missingWordPuzzle(q.surahNumber, q.ayahNumber, q.missingWordIndex)).toEqual(puzzle);
  });

  it('rejects puzzles for unknown ayahs or word positions', () => {
    expect(missingWordPuzzle(2, 1, 0)).toBeNull();
    expect(missingWordPuzzle(112, 9, 0)).toBeNull();
    expect(missingWordPuzzle(112, 1, 99)).toBeNull();
  });

  it('scores stars like islam-quest (3 = perfect, 2 from 70 %, quests without questions count as complete)', () => {
    expect(scoreQuiz([true, true, true]).stars).toBe(3);
    expect(scoreQuiz([true, true, true, false]).stars).toBe(2);
    expect(scoreQuiz([true, false, false]).stars).toBe(1);
    expect(scoreQuiz([])).toEqual({ correct: 0, total: 0, percent: 100, stars: 3 });
  });
});

describe('tracing helpers', () => {
  it('sums the drawn length over strokes and ignores jitter', () => {
    let s = startStroke(EMPTY_TRACE, { x: 0, y: 0 });
    s = extendStroke(s, { x: 1, y: 0 }); // jitter (< 2 pt)
    expect(s.length).toBe(0);
    s = extendStroke(s, { x: 100, y: 0 });
    expect(s.length).toBe(100);
    expect(s.paths).toEqual(['M0.0 0.0 L100.0 0.0']);
    s = endStroke(s);
    s = extendStroke(s, { x: 0, y: 50 }); // a move after release starts a new stroke
    expect(s.paths).toHaveLength(2);
    expect(isTraced(s)).toBe(false);
    s = extendStroke(s, { x: 0, y: 50 + REQUIRED_LENGTH });
    expect(isTraced(s)).toBe(true);
    expect(traceProgress(s)).toBe(1);
    expect(traceProgress(EMPTY_TRACE)).toBe(0);
  });
});

describe('recite helpers', () => {
  it('needs three repetitions of every ayah', () => {
    const ayahs = [1, 2];
    let counts: Record<number, number> = {};
    for (let i = 0; i < REPEATS; i++) counts = addRepetition(counts, 1);
    expect(allRepeated(counts, ayahs)).toBe(false);
    for (let i = 0; i < REPEATS + 2; i++) counts = addRepetition(counts, 2);
    expect(counts[2]).toBe(REPEATS);
    expect(allRepeated(counts, ayahs)).toBe(true);
    expect(allRepeated({}, [])).toBe(false);
  });
});

describe('memorization helpers', () => {
  const ikhlas = getSurah(112)!;

  it('marks ayahs as learned within the surah only', () => {
    const m = setAyahsLearned(EMPTY_MEMORIZATION, ikhlas, [3, 1, 1, 9, 0], true, 'now');
    expect(m.learned).toEqual([1, 3]);
    expect(setAyahsLearned(m, ikhlas, [1], false, 'now').learned).toEqual([3]);
  });

  it('records self-tests: known ayahs become learned, the best result is kept', () => {
    const first = applyMemorizationTest(EMPTY_MEMORIZATION, ikhlas, [1, 2, 3, 4], 'now');
    expect(first).toMatchObject({ learned: [1, 2, 3, 4], tests: 1, bestTest: 100 });
    const second = applyMemorizationTest(first, ikhlas, [1], 'now');
    expect(second).toMatchObject({ tests: 2, bestTest: 100, learned: [1, 2, 3, 4] });
  });

  it('summarises all 38 surahs (571 ayahs)', () => {
    expect(memorizationSummary({ memorization: {} })).toEqual({ learned: 0, total: 571, surahsComplete: 0 });
    expect(memorizationSummary({ memorization: { '112': { learned: [1, 2, 3, 4], tests: 0, bestTest: 0 } } })).toMatchObject({ learned: 4, surahsComplete: 1 });
  });
});

describe('quest progress', () => {
  it('keeps the best result and the first completion date', () => {
    const a = applyQuestComplete(EMPTY_QUEST_DATA, 'salah-q1', [true, false], '2026-01-01');
    expect(a).toMatchObject({ firstCompletion: true, perfect: false });
    expect(a.data.quests['salah-q1']).toMatchObject({ completed: true, attempts: 1, bestStars: 1, bestScore: 50, completedAt: '2026-01-01' });
    const b = applyQuestComplete(a.data, 'salah-q1', [true, true], '2026-02-01');
    expect(b).toMatchObject({ firstCompletion: false, perfect: true });
    expect(b.data.quests['salah-q1']).toMatchObject({ attempts: 2, bestStars: 3, bestScore: 100, completedAt: '2026-01-01' });
    expect(b.data.perfectQuests).toEqual(['salah-q1']);
  });

  it('sanitizes corrupt stored data without crashing', () => {
    expect(sanitizeQuestData('broken')).toBeNull();
    expect(sanitizeQuestData([])).toBeNull();
    const clean = sanitizeQuestData({
      quests: { a: { completed: true, bestStars: 9, bestScore: -1, attempts: 'x' }, b: 'nope' },
      completedLessons: ['x', 3, 'x'],
      memorization: { '112': { learned: [2, 'a', 2, 1, -1], tests: 1 } },
      ramadanDeeds: { '1': ['quran', 5], '2': 'kind' },
      duasFavourite: 'oops',
    });
    expect(clean).toMatchObject({
      quests: { a: { completed: true, bestStars: 3, bestScore: 0, attempts: 0 } },
      completedLessons: ['x'],
      memorization: { '112': { learned: [1, 2], tests: 1, bestTest: 0 } },
      ramadanDeeds: { '1': ['quran'] },
      duasFavourite: [],
    });
    expect(clean?.quests.b).toBeUndefined();
  });

  it('toggles Ramadan deeds per day (1–30 only)', () => {
    let deeds = toggleRamadanDeed({}, 1, 'quran');
    deeds = toggleRamadanDeed(deeds, 2, 'kind');
    deeds = toggleRamadanDeed(deeds, 31, 'kind');
    expect(totalRamadanDeeds(deeds)).toBe(2);
    deeds = toggleRamadanDeed(deeds, 1, 'quran');
    expect(deeds['1']).toEqual([]);
    expect(totalRamadanDeeds(deeds)).toBe(1);
  });
});
