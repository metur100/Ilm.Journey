import * as fs from 'fs';
import * as path from 'path';

import { LANGUAGES, type LocalizedText } from '@/core/models';
import { containsArabic } from '@/core/utils/text';
import { UNITS } from '@/features/learn/content';
import {
  ALPHABET,
  FACTS,
  getQuestLesson,
  getQuestQuestion,
  GOOD_DEEDS,
  LESSONS,
  PACKS,
  QUEST_QUESTIONS,
  QUEST_WORLD_LIST,
  QUESTS,
} from '@/features/learn/content/quests';
import { missingWordPuzzle } from '@/features/learn/quests/services/memorization';
import { factQuestionId } from '@/features/learn/quests/services/questions';
import { getAyah, getSurah } from '@/features/quran';

/** Ported from islam-quest `src/__tests__/content.test.ts` (prophets world removed) + Quran-reference checks. */

const CONTENT_DIR = path.resolve(__dirname, '..', 'content', 'quests');
const ISLAM_QUEST = path.resolve(__dirname, '..', '..', '..', '..', '..', 'islam-quest', 'src', 'data');

function localizedTexts(value: unknown, at = ''): { path: string; text: LocalizedText }[] {
  if (!value || typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;
  if ('en' in obj && 'de' in obj && 'bs' in obj) return [{ path: at, text: obj as unknown as LocalizedText }];
  return Object.entries(obj).flatMap(([k, v]) => localizedTexts(v, `${at}.${k}`));
}

describe('islam-quest content in Ilm Journey', () => {
  it('has the five ported worlds in order (no prophets world)', () => {
    expect(QUEST_WORLD_LIST.map((w) => w.id)).toEqual(['salah', 'quran', 'akhlaq', 'ramadan', 'arabic']);
    expect(QUESTS.some((q) => (q.worldId as string) === 'prophets')).toBe(false);
    expect(QUESTS).toHaveLength(29);
    expect(LESSONS).toHaveLength(38);
    expect(QUEST_QUESTIONS).toHaveLength(101);
    expect(FACTS).toHaveLength(18);
    expect(GOOD_DEEDS).toHaveLength(7);
  });

  it('uses unique ids (questions incl. fact questions are unique under the quest: prefix)', () => {
    for (const items of [QUESTS, LESSONS, QUEST_QUESTIONS, FACTS, GOOD_DEEDS]) {
      const ids = items.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
    const questionIds = [...QUEST_QUESTIONS.map((q) => q.id), ...FACTS.map((f) => factQuestionId(f.id))];
    expect(new Set(questionIds).size).toBe(questionIds.length);
  });

  it('keeps quest ids distinct from the unit ids of the same topic paths', () => {
    const unitIds = new Set(UNITS.map((u) => u.id));
    for (const quest of QUESTS) expect(unitIds.has(quest.id) ? `clash ${quest.id}` : quest.id).toBe(quest.id);
  });

  it('is translated into every language', () => {
    for (const pack of PACKS) {
      for (const { path: at, text } of localizedTexts(pack)) {
        for (const lang of LANGUAGES) {
          expect({ at, lang, ok: typeof text[lang] === 'string' && text[lang].trim().length > 0 }).toEqual({ at, lang, ok: true });
        }
      }
    }
    for (const fact of FACTS) for (const lang of LANGUAGES) expect(fact.text[lang].trim().length).toBeGreaterThan(0);
  });

  it('lists the right quests in every world in order', () => {
    for (const world of QUEST_WORLD_LIST) {
      const quests = QUESTS.filter((q) => q.worldId === world.id).sort((a, b) => a.order - b.order);
      expect(world.questIds).toEqual(quests.map((q) => q.id));
      expect(quests.map((q) => q.order)).toEqual(quests.map((_, i) => i + 1));
    }
  });

  it('references only existing lessons, questions and surahs, each within its own world', () => {
    for (const quest of QUESTS) {
      expect(quest.steps.length).toBeGreaterThan(0);
      for (const step of quest.steps) {
        if (step.kind === 'lesson') expect(getQuestLesson(step.lessonId)?.worldId).toBe(quest.worldId);
        if (step.kind === 'question') expect(getQuestQuestion(step.questionId)?.areaId).toBe(quest.worldId);
        if (step.kind === 'recite') expect(getSurah(step.surahNumber)?.ayahs.length).toBeGreaterThan(0);
        if (step.kind === 'tracing') {
          expect(step.letters.length).toBeGreaterThan(0);
          for (const letter of step.letters) expect(ALPHABET.some((a) => a.letter === letter)).toBe(true);
        }
      }
    }
  });

  it('uses every lesson and question in some quest', () => {
    const used = new Set(QUESTS.flatMap((q) => q.steps.map((s) => (s.kind === 'lesson' ? s.lessonId : s.kind === 'question' ? s.questionId : ''))));
    for (const lesson of LESSONS) expect(used.has(lesson.id) ? lesson.id : `unused ${lesson.id}`).toBe(lesson.id);
    for (const question of QUEST_QUESTIONS) expect(used.has(question.id) ? question.id : `unused ${question.id}`).toBe(question.id);
  });

  it('has well-formed questions; Quran references resolve against @/features/quran', () => {
    for (const q of QUEST_QUESTIONS) {
      switch (q.type) {
        case 'multipleChoice':
        case 'scenario':
          expect(q.options.length).toBeGreaterThanOrEqual(2);
          expect(q.options.some((o) => o.id === q.correctOptionId)).toBe(true);
          break;
        case 'ordering':
          expect(q.items.length).toBeGreaterThanOrEqual(3);
          break;
        case 'matching':
        case 'memory':
          expect(q.pairs.length).toBeGreaterThanOrEqual(3);
          break;
        case 'ayahOrder':
          expect(getSurah(q.surahNumber)?.ayahs.length).toBeGreaterThanOrEqual(3);
          break;
        case 'missingWord': {
          expect(getAyah(q.surahNumber, q.ayahNumber)).toBeDefined();
          const puzzle = missingWordPuzzle(q.surahNumber, q.ayahNumber, q.missingWordIndex);
          expect(puzzle).not.toBeNull();
          expect(puzzle!.choices).toHaveLength(4);
          expect(new Set(puzzle!.choices).size).toBe(4);
          break;
        }
        case 'trueFalse':
          expect(typeof q.correct).toBe('boolean');
          break;
        default:
          throw new Error(`unexpected type ${q.type} (${q.id})`);
      }
    }
  });

  it('attaches sources to every lesson about religious rulings or stories', () => {
    for (const lesson of LESSONS.filter((l) => l.worldId !== 'arabic' && l.id !== 'quran-structure' && l.id !== 'quran-makki-madani')) {
      expect({ id: lesson.id, hasSources: (lesson.sources?.length ?? 0) > 0 }).toEqual({ id: lesson.id, hasSources: true });
    }
  });

  it('only borrows sources from the lesson a question follows (never invents them)', () => {
    for (const q of QUEST_QUESTIONS) {
      for (const source of q.sources ?? []) {
        expect(source.sourceName.trim().length).toBeGreaterThan(0);
        expect(source.sourceReference.trim().length).toBeGreaterThan(0);
      }
    }
    const raw = PACKS.flatMap((p) => p.questions);
    const allLessonSources = new Set(LESSONS.flatMap((l) => (l.sources ?? []).map((s) => `${s.sourceName}|${s.sourceReference}`)));
    for (const q of QUEST_QUESTIONS) {
      const original = raw.find((r) => r.id === q.id);
      if (original?.sources?.length) expect(q.sources).toEqual(original.sources);
      else for (const s of q.sources ?? []) expect(allLessonSources.has(`${s.sourceName}|${s.sourceReference}`)).toBe(true);
    }
  });

  it('builds the 28-letter alphabet from the Arabic letter lessons', () => {
    expect(ALPHABET).toHaveLength(28);
    expect(new Set(ALPHABET.map((a) => a.letter)).size).toBe(28);
    expect(ALPHABET[0]).toMatchObject({ position: 1, letter: 'ا', name: 'alif' });
    expect(ALPHABET[27]).toMatchObject({ position: 28, letter: 'ي' });
  });
});

describe('copied, not retyped', () => {
  const sibling = fs.existsSync(ISLAM_QUEST) ? it : it.skip;

  /**
   * Every value is copied from islam-quest. The only deliberate differences are the GAMES-V3 §2 rewrites (truths stated
   * directly, no "Muslims believe / Muslims do …" framing): a text may differ only where islam-quest's text used
   * "Muslim…" / "Islam…"; ids, structure, answers and sources stay identical.
   */
  function diffTexts(ours: unknown, theirs: unknown, at: string, out: { at: string; theirs: string }[]): void {
    if (typeof ours === 'string' && typeof theirs === 'string') {
      if (ours !== theirs) out.push({ at, theirs });
      return;
    }
    if (Array.isArray(ours) && Array.isArray(theirs)) {
      expect({ at, length: ours.length }).toEqual({ at, length: theirs.length });
      ours.forEach((v, i) => diffTexts(v, theirs[i], `${at}[${i}]`, out));
      return;
    }
    if (ours && theirs && typeof ours === 'object' && typeof theirs === 'object') {
      expect({ at, keys: Object.keys(ours).sort() }).toEqual({ at, keys: Object.keys(theirs).sort() });
      for (const k of Object.keys(theirs)) diffTexts((ours as Record<string, unknown>)[k], (theirs as Record<string, unknown>)[k], `${at}.${k}`, out);
      return;
    }
    expect({ at, value: ours }).toEqual({ at, value: theirs });
  }

  sibling('the world files are identical to islam-quest (apart from the v3 phrasing rewrites)', () => {
    for (const world of ['salah', 'quran', 'akhlaq', 'ramadan', 'arabic']) {
      const ours = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, `${world}.json`), 'utf8'));
      const theirs = JSON.parse(fs.readFileSync(path.join(ISLAM_QUEST, 'content', `${world}.json`), 'utf8'));
      const changed: { at: string; theirs: string }[] = [];
      diffTexts(ours, theirs, world, changed);
      for (const c of changed) {
        // Only localized texts (en/de/bs) that framed things with "Muslim…" / "Islam…".
        expect({ at: c.at, text: /.(en|de|bs)$/.test(c.at) && /muslim|islam/i.test(c.theirs) }).toEqual({ at: c.at, text: true });
      }
    }
  });

  sibling('the prophets facts are extracted verbatim', () => {
    const theirs = JSON.parse(fs.readFileSync(path.join(ISLAM_QUEST, 'content', 'prophets.json'), 'utf8'));
    expect(FACTS.filter((f) => f.worldId === 'prophets')).toEqual(theirs.facts);
  });

  sibling('missing-word puzzles hide exactly the word islam-quest hid (same Quran text, same word split)', () => {
    const iq = JSON.parse(fs.readFileSync(path.join(ISLAM_QUEST, 'quran', 'surahs.json'), 'utf8')) as {
      surahs: { number: number; ayahs: { numberInSurah: number; arabic: string }[] }[];
    };
    // islam-quest's ayahWords(): tokens with an Arabic letter.
    const iqWords = (text: string) => text.split(/\s+/).filter((t) => containsArabic(t) && /[ء-يٱ]/.test(t));
    for (const q of QUEST_QUESTIONS) {
      if (q.type !== 'missingWord') continue;
      const original = iq.surahs.find((s) => s.number === q.surahNumber)?.ayahs.find((a) => a.numberInSurah === q.ayahNumber);
      expect(original).toBeDefined();
      expect(missingWordPuzzle(q.surahNumber, q.ayahNumber, q.missingWordIndex)?.answer).toBe(iqWords(original!.arabic)[q.missingWordIndex]);
    }
  });
});
