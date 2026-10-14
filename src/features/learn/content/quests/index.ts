import type { SourceRef, TopicId } from '@/core/models';

import type { BeginnerQuest, Fact, GoodDeed, QuestLesson, QuestQuestion, QuestWorld, QuestWorldId } from '../../quests/models';
import akhlaq from './akhlaq.json';
import arabic from './arabic.json';
import prophetsFacts from './prophets-facts.json';
import quran from './quran.json';
import ramadan from './ramadan.json';
import salah from './salah.json';

/**
 * islam-quest content, copied verbatim from `islam-quest/src/data/content/<world>.json` (salah, quran, akhlaq,
 * ramadan, arabic). The prophets world is not ported (Stories tab); only its three general facts are kept in
 * `prophets-facts.json` (extracted by script). Ids stay as in the source app – they are made unique app-wide by the
 * `quest:` prefix of question keys, XP reasons and quest targets (see docs/FEATURE-PORTING.md).
 */
export interface WorldPack {
  world: QuestWorld;
  lessons: QuestLesson[];
  questions: QuestQuestion[];
  quests: BeginnerQuest[];
  facts: Fact[];
  goodDeeds?: GoodDeed[];
}

// JSON imports are widened by TypeScript (e.g. `type: string`); the content test verifies the shape.
export const PACKS: readonly WorldPack[] = [salah, quran, akhlaq, ramadan, arabic].map((pack) => pack as unknown as WorldPack);

export const QUEST_WORLD_LIST: readonly QuestWorld[] = PACKS.map((p) => p.world).sort((a, b) => a.order - b.order);
export const QUESTS: readonly BeginnerQuest[] = PACKS.flatMap((p) => p.quests);
export const LESSONS: readonly QuestLesson[] = PACKS.flatMap((p) => p.lessons);
export const FACTS: readonly Fact[] = [...PACKS.flatMap((p) => p.facts), ...(prophetsFacts.facts as Fact[])];
export const GOOD_DEEDS: readonly GoodDeed[] = PACKS.flatMap((p) => p.goodDeeds ?? []);

const byId = <T extends { id: string }>(items: readonly T[]) => new Map(items.map((item) => [item.id, item] as const));

const questMap = byId(QUESTS);
const lessonMap = byId(LESSONS);
const factMap = byId(FACTS);

/** The quest (and step position) each question is asked in. */
const questOfQuestion = new Map<string, BeginnerQuest>();
/** Sources of the lesson taught right before a question inside its quest (fallback for questions without own sources). */
const lessonSourcesOfQuestion = new Map<string, SourceRef[]>();
for (const quest of QUESTS) {
  let lessonSources: SourceRef[] | undefined;
  for (const step of quest.steps) {
    if (step.kind === 'lesson') lessonSources = lessonMap.get(step.lessonId)?.sources;
    if (step.kind === 'question') {
      if (!questOfQuestion.has(step.questionId)) questOfQuestion.set(step.questionId, quest);
      if (lessonSources?.length && !lessonSourcesOfQuestion.has(step.questionId)) lessonSourcesOfQuestion.set(step.questionId, lessonSources);
    }
  }
}

/**
 * Questions as core questions: `areaId` = the topic (islam-quest `worldId`). A question without its own sources
 * shows the sources of the lesson it follows in its quest (never invented ones).
 */
export const QUEST_QUESTIONS: readonly QuestQuestion[] = PACKS.flatMap((p) =>
  p.questions.map((q): QuestQuestion => {
    const fallback = q.sources?.length ? undefined : lessonSourcesOfQuestion.get(q.id);
    return { ...q, areaId: p.world.id as TopicId, ...(fallback ? { sources: fallback } : {}) };
  }),
);
const questionMap = byId(QUEST_QUESTIONS);

export const getQuest = (id: string): BeginnerQuest | undefined => questMap.get(id);
export const getQuestLesson = (id: string): QuestLesson | undefined => lessonMap.get(id);
export const getQuestQuestion = (id: string): QuestQuestion | undefined => questionMap.get(id);
export const getFact = (id: string): Fact | undefined => factMap.get(id);
export const questOfQuestionId = (questionId: string): BeginnerQuest | undefined => questOfQuestion.get(questionId);

/** Quests of a topic in their order (empty for topics without islam-quest content). */
export function questsOfTopic(topic: TopicId | QuestWorldId): BeginnerQuest[] {
  return QUESTS.filter((q) => q.worldId === topic).sort((a, b) => a.order - b.order);
}

export function questionsOfTopic(topic: TopicId): QuestQuestion[] {
  return QUEST_QUESTIONS.filter((q) => q.areaId === topic);
}

/** The quest that teaches a lesson (lessons unlock with their quest). */
export function questForLesson(lessonId: string): BeginnerQuest | undefined {
  return QUESTS.find((q) => q.steps.some((s) => s.kind === 'lesson' && s.lessonId === lessonId));
}

/** Lessons of a quest in step order. */
export function lessonsOfQuest(quest: BeginnerQuest): QuestLesson[] {
  return quest.steps.flatMap((s) => (s.kind === 'lesson' ? [lessonMap.get(s.lessonId)].filter((l): l is QuestLesson => l !== undefined) : []));
}

/** Scored question steps of a quest. */
export function questionIdsOfQuest(quest: BeginnerQuest): string[] {
  return quest.steps.flatMap((s) => (s.kind === 'question' ? [s.questionId] : []));
}

export function factsOf(...worlds: Fact['worldId'][]): Fact[] {
  return FACTS.filter((f) => worlds.includes(f.worldId));
}

/**
 * The 28 letters of the alphabet, taken from the Arabic letter lessons (`arabic-letters-1` … `-4`):
 * letter, transliterated name and the lesson's description (pronunciation hint) in every language.
 */
export interface AlphabetLetter {
  /** 1–28 in alphabet order. */
  position: number;
  letter: string;
  name: string;
  description: QuestLesson['sections'][number]['body'];
  lessonId: string;
}

export const ALPHABET: readonly AlphabetLetter[] = ['arabic-letters-1', 'arabic-letters-2', 'arabic-letters-3', 'arabic-letters-4']
  .flatMap((id) => {
    const lesson = lessonMap.get(id);
    return (lesson?.sections ?? []).filter((s) => s.arabic && s.transliteration).map((s) => ({ section: s, lessonId: id }));
  })
  .map(({ section, lessonId }, index) => ({
    position: index + 1,
    letter: section.arabic ?? '',
    name: section.transliteration ?? '',
    description: section.body,
    lessonId,
  }));

export const getLetter = (position: number): AlphabetLetter | undefined => ALPHABET.find((l) => l.position === position);
