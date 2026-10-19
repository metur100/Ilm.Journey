import { migrate } from '@/core/storage';

import { migrateSufaraLessonId } from '../sufara/migrate';
import { EMPTY_QUEST_DATA } from '../quests/services/progress';
import { QUEST_PERSIST } from '../quests/store/questStore';
import { EMPTY_LEARN } from '../services/progression';
import { LEARN_PERSIST } from '../store/learnStore';

describe('Sufara lesson-id migration', () => {
  it('maps the old positional letter lessons to the lesson that teaches the same letter', () => {
    expect(migrateSufaraLessonId('sufara-01')).toBe('sufara-01'); // elif
    expect(migrateSufaraLessonId('sufara-02')).toBe('sufara-05'); // be
    expect(migrateSufaraLessonId('sufara-03')).toBe('sufara-06'); // te/se
    expect(migrateSufaraLessonId('sufara-16')).toBe('sufara-19'); // lam-elif/ya
    expect(migrateSufaraLessonId('sufara-17')).toBe('sufara-20'); // review
    expect(migrateSufaraLessonId('sufara-18')).toBe('sufara-02'); // fatha
    expect(migrateSufaraLessonId('sufara-19')).toBe('sufara-03'); // kasra
    expect(migrateSufaraLessonId('sufara-20')).toBe('sufara-04'); // damma
    expect(migrateSufaraLessonId('sufara-21')).toBe('sufara-21'); // sukun
    expect(migrateSufaraLessonId('sufara-27')).toBe('sufara-27'); // words
    expect(migrateSufaraLessonId('salah-what')).toBe('salah-what');
  });

  it('migrates completed Sufara lessons in quest data v1 and de-duplicates them', () => {
    const raw = { version: 1, data: { ...EMPTY_QUEST_DATA, completedLessons: ['sufara-02', 'sufara-18', 'sufara-02', 'salah-what'] } };
    const data = migrate(raw, QUEST_PERSIST)!;
    expect(data.completedLessons).toEqual(['sufara-05', 'sufara-02', 'salah-what']);
  });

  it('migrates the remembered Sufara lesson of the Continue card', () => {
    const raw = { version: 1, data: { ...EMPTY_LEARN, lastVisited: { topic: 'sufara', itemId: 'sufara-03', at: '2026-10-20T00:00:00.000Z' } } };
    const data = migrate(raw, LEARN_PERSIST)!;
    expect(data.lastVisited?.itemId).toBe('sufara-06');
  });
});
