import { LANGUAGES, type LocalizedText, type Question, TOPIC_IDS } from '@/core/models';
import { AREAS, getQuestion, QUESTIONS, testQuestionsOfArea, unitOfQuestion, UNITS } from '@/features/learn/content';
import { MASTER_QUESTIONS } from '@/features/learn/services/progression';

/** Collects every LocalizedText-looking object inside a value. */
function localizedTexts(value: unknown, path = ''): { path: string; text: LocalizedText }[] {
  if (!value || typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;
  if ('en' in obj && 'de' in obj && 'bs' in obj) return [{ path, text: obj as unknown as LocalizedText }];
  return Object.entries(obj).flatMap(([k, v]) => localizedTexts(v, `${path}.${k}`));
}

function checkQuestionShape(q: Question) {
  switch (q.type) {
    case 'multipleChoice':
    case 'scenario':
    case 'fillBlank':
    case 'imageChoice': {
      const ids = q.options.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids).toContain(q.correctOptionId);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      if (q.type === 'fillBlank') for (const lang of LANGUAGES) expect(q.sentence[lang]).toContain('___');
      break;
    }
    case 'ordering':
      expect(q.items.length).toBeGreaterThanOrEqual(3);
      break;
    case 'matching':
    case 'memory':
      expect(q.pairs.length).toBeGreaterThanOrEqual(2);
      break;
    case 'categorize': {
      const cats = q.categories.map((c) => c.id);
      expect(cats.length).toBeGreaterThanOrEqual(2);
      for (const item of q.items) expect(cats).toContain(item.categoryId);
      break;
    }
    case 'trueFalse':
      expect(typeof q.correct).toBe('boolean');
      break;
    default:
      throw new Error(`Unexpected question type in knowledge-rpg content: ${q.type}`);
  }
}

describe('learn content (knowledge-rpg units)', () => {
  it('covers exactly the eight topics', () => {
    expect([...AREAS.map((a) => a.id)].sort()).toEqual([...TOPIC_IDS].sort());
    for (const topic of TOPIC_IDS) expect(UNITS.some((u) => u.areaId === topic)).toBe(true);
  });

  it('uses unique ids everywhere', () => {
    const unitIds = UNITS.map((u) => u.id);
    expect(new Set(unitIds).size).toBe(unitIds.length);
    const questionIds = QUESTIONS.map((q) => q.id);
    expect(new Set(questionIds).size).toBe(questionIds.length);
  });

  it('gives every unit a lesson, a practice question, test questions and sources', () => {
    for (const unit of UNITS) {
      expect(unit.lesson.length).toBeGreaterThan(0);
      expect(unit.sources.length).toBeGreaterThan(0);
      expect(unit.questions.map((q) => q.id)).toContain(unit.practiceId);
      expect(unit.testIds.length).toBeGreaterThanOrEqual(3);
      expect(unit.testIds).not.toContain(unit.practiceId);
      for (const id of unit.testIds) expect(unit.questions.map((q) => q.id)).toContain(id);
      for (const q of unit.questions) {
        expect(q.areaId).toBe(unit.areaId);
        expect(unitOfQuestion(q.id)).toBe(unit);
      }
    }
  });

  it('has enough test questions in every topic for a Master Challenge', () => {
    for (const topic of TOPIC_IDS) expect(testQuestionsOfArea(topic).length).toBeGreaterThanOrEqual(MASTER_QUESTIONS);
  });

  it('has valid question shapes and topics', () => {
    for (const q of QUESTIONS) {
      expect(q.topic.length).toBeGreaterThan(0);
      checkQuestionShape(q);
      expect(getQuestion(q.id)).toBe(q);
    }
  });

  it('uses all the knowledge-rpg question types', () => {
    const types = new Set(QUESTIONS.map((q) => q.type));
    for (const type of ['multipleChoice', 'trueFalse', 'matching', 'ordering', 'memory', 'imageChoice', 'scenario', 'fillBlank', 'categorize']) {
      expect(types).toContain(type);
    }
  });

  it('is fully translated', () => {
    for (const item of [...AREAS, ...UNITS]) {
      for (const { path, text } of localizedTexts(item)) {
        for (const lang of LANGUAGES) {
          expect({ path, lang, ok: typeof text[lang] === 'string' && text[lang].trim().length > 0 }).toEqual({ path, lang, ok: true });
        }
      }
    }
  });

  it('never invents source links', () => {
    for (const unit of UNITS) for (const source of unit.sources) expect(JSON.stringify(source)).not.toMatch(/https?:\/\//);
  });
});
