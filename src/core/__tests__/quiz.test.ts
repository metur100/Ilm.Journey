import { parseQuestionKey, type Question, questionKey } from '@/core/models';
import { evaluateAnswer, isPerfect, scoreQuiz } from '@/core/services/quiz';

const text = { en: 'x', de: 'x', bs: 'x' };
const base = { id: 'q', areaId: 'salah' as const, topic: 't', prompt: text, explanation: text };

describe('evaluateAnswer (question superset)', () => {
  it('handles option-based questions of every app', () => {
    const options = [
      { id: 'a', text },
      { id: 'b', text },
    ];
    const types: Question[] = [
      { ...base, type: 'multipleChoice', options, correctOptionId: 'b' },
      { ...base, type: 'lessonChoice', options, correctOptionId: 'b' },
      { ...base, type: 'scenario', options: options.map((o) => ({ ...o, feedback: text })), correctOptionId: 'b' },
      { ...base, type: 'fillBlank', sentence: { en: 'a ___', de: 'a ___', bs: 'a ___' }, options, correctOptionId: 'b' },
      {
        ...base,
        type: 'imageChoice',
        options: [
          { id: 'a', element: 'mosque', label: text },
          { id: 'b', element: 'kaaba', label: text },
        ],
        correctOptionId: 'b',
      },
    ];
    for (const q of types) {
      expect(evaluateAnswer(q, { type: 'option', optionId: 'b' })).toBe(true);
      expect(evaluateAnswer(q, { type: 'option', optionId: 'a' })).toBe(false);
      expect(evaluateAnswer(q, { type: 'boolean', value: true })).toBe(false);
    }
  });

  it('handles true/false', () => {
    const q: Question = { ...base, type: 'trueFalse', correct: false };
    expect(evaluateAnswer(q, { type: 'boolean', value: false })).toBe(true);
    expect(evaluateAnswer(q, { type: 'boolean', value: true })).toBe(false);
  });

  it('handles ordering', () => {
    const q: Question = { ...base, type: 'ordering', items: ['1', '2', '3'].map((id) => ({ id, text })) };
    expect(evaluateAnswer(q, { type: 'order', ids: ['1', '2', '3'] })).toBe(true);
    expect(evaluateAnswer(q, { type: 'order', ids: ['2', '1', '3'] })).toBe(false);
    expect(evaluateAnswer(q, { type: 'order', ids: ['1', '2'] })).toBe(false);
  });

  it('allows one mistake in matching and accepts a finished memory board', () => {
    const pairs = [{ id: 'p', left: text, right: text }];
    expect(evaluateAnswer({ ...base, type: 'matching', pairs }, { type: 'pairs', mistakes: 1 })).toBe(true);
    expect(evaluateAnswer({ ...base, type: 'matching', pairs }, { type: 'pairs', mistakes: 2 })).toBe(false);
    expect(evaluateAnswer({ ...base, type: 'memory', pairs }, { type: 'memory', moves: 12 })).toBe(true);
  });

  it('handles categorization', () => {
    const q: Question = {
      ...base,
      type: 'categorize',
      categories: [
        { id: 'fard', label: text },
        { id: 'sunnah', label: text },
      ],
      items: [
        { id: 'i1', text, categoryId: 'fard' },
        { id: 'i2', text, categoryId: 'sunnah' },
      ],
    };
    expect(evaluateAnswer(q, { type: 'categories', assignment: { i1: 'fard', i2: 'sunnah' } })).toBe(true);
    expect(evaluateAnswer(q, { type: 'categories', assignment: { i1: 'sunnah', i2: 'sunnah' } })).toBe(false);
  });

  it('handles the story find and map games', () => {
    const find: Question = {
      ...base,
      type: 'find',
      items: [
        { id: 'ark', element: 'ark', label: text },
        { id: 'rain', element: 'rain', label: text },
        { id: 'well', element: 'well', label: text },
      ],
      correctIds: ['ark', 'rain'],
    };
    expect(evaluateAnswer(find, { type: 'selection', ids: ['rain', 'ark'] })).toBe(true);
    expect(evaluateAnswer(find, { type: 'selection', ids: ['ark'] })).toBe(false);
    expect(evaluateAnswer(find, { type: 'selection', ids: ['ark', 'rain', 'well'] })).toBe(false);

    const map: Question = { ...base, type: 'map', places: ['makkah', 'egypt'], correctPlace: 'egypt' };
    expect(evaluateAnswer(map, { type: 'place', place: 'egypt' })).toBe(true);
    expect(evaluateAnswer(map, { type: 'place', place: 'makkah' })).toBe(false);
  });

  it('handles the Quran memorization types with renderer context', () => {
    const missing: Question = { ...base, type: 'missingWord', surahNumber: 112, ayahNumber: 1, missingWordIndex: 2 };
    expect(evaluateAnswer(missing, { type: 'word', word: 'هُوَ' }, { missingWord: 'هُوَ' })).toBe(true);
    expect(evaluateAnswer(missing, { type: 'word', word: 'اللَّهُ' }, { missingWord: 'هُوَ' })).toBe(false);
    expect(evaluateAnswer(missing, { type: 'word', word: 'هُوَ' })).toBe(false);

    const order: Question = { ...base, type: 'ayahOrder', surahNumber: 112 };
    expect(evaluateAnswer(order, { type: 'order', ids: ['1', '2', '3', '4'] }, { ayahCount: 4 })).toBe(true);
    expect(evaluateAnswer(order, { type: 'order', ids: ['2', '1', '3', '4'] }, { ayahCount: 4 })).toBe(false);
    expect(evaluateAnswer(order, { type: 'order', ids: ['1', '2'] }, { ayahCount: 4 })).toBe(false);
  });
});

describe('scoring', () => {
  it('scores quizzes', () => {
    expect(scoreQuiz([true, true, true, true])).toMatchObject({ correct: 4, total: 4, percent: 100, stars: 3 });
    expect(scoreQuiz([true, true, true, false])).toMatchObject({ percent: 75, stars: 2 });
    expect(scoreQuiz([true, false, false, false])).toMatchObject({ percent: 25, stars: 1 });
    expect(isPerfect([true, true])).toBe(true);
    expect(isPerfect([true, false])).toBe(false);
    expect(isPerfect([])).toBe(false);
  });
});

describe('question keys', () => {
  it('builds and parses global keys', () => {
    expect(questionKey('learn', 'salah-wudu-q3')).toBe('learn:salah-wudu-q3');
    expect(parseQuestionKey('stories:adam-q2')).toEqual({ feature: 'stories', id: 'adam-q2' });
    expect(parseQuestionKey('seerah:e01:q4')).toEqual({ feature: 'seerah', id: 'e01:q4' });
    expect(parseQuestionKey('nokey')).toBeNull();
    expect(parseQuestionKey(':x')).toBeNull();
    expect(parseQuestionKey('x:')).toBeNull();
  });
});
