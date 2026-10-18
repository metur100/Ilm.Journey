import type { LocalizedText, Question, SceneSpec, SourceRef, TopicId } from '@/core/models';

/**
 * islam-quest content model (copied JSON in `features/learn/content/quests/`).
 *
 * islam-quest's worlds map 1:1 to Learn topics, except that the letter and harakat quests of its "arabic" world belong
 * to the topic Sufara (content/quests/index.ts SUFARA_QUEST_IDS). Its "prophets" world is not ported as quests – the
 * Stories tab covers those stories – only its general facts are kept (daily pool / tips).
 */
export type QuestWorldId = 'salah' | 'quran' | 'akhlaq' | 'ramadan' | 'sufara' | 'arabic';

export const QUEST_WORLDS: readonly QuestWorldId[] = ['salah', 'quran', 'akhlaq', 'ramadan', 'sufara', 'arabic'];

export function isQuestWorld(value: unknown): value is QuestWorldId {
  return typeof value === 'string' && (QUEST_WORLDS as readonly string[]).includes(value);
}

/** islam-quest world metadata (kept so the JSON stays identical to the source app; unlocking is by topic path). */
export interface QuestWorld {
  id: QuestWorldId;
  order: number;
  title: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  scene: SceneSpec;
  questIds: string[];
  unlockRequirement: { worldId: string; questsCompleted: number } | null;
}

export interface QuestLessonSection {
  heading?: LocalizedText;
  body: LocalizedText;
  /** Optional Arabic word or phrase shown large (never Quran text – that comes from `@/features/quran`). */
  arabic?: string;
  transliteration?: string;
}

export interface QuestLesson {
  id: string;
  worldId: QuestWorldId;
  topic: string;
  title: LocalizedText;
  summary: LocalizedText;
  sections: QuestLessonSection[];
  /** Shown when scholars hold different valid positions on the topic. */
  differenceNote?: LocalizedText;
  sources?: SourceRef[];
  scene?: SceneSpec;
}

export interface LearnedValue {
  title: LocalizedText;
  body: LocalizedText;
}

/** islam-quest question labels; `interactive` maps to the core label `interaction`. */
export type QuestQuestionLabel = 'interactive' | 'challenge' | 'quiz';

export type QuestStep =
  | { kind: 'intro'; title: LocalizedText; body: LocalizedText; scene: SceneSpec }
  | { kind: 'story'; title?: LocalizedText; body: LocalizedText; scene: SceneSpec; sources?: SourceRef[] }
  | { kind: 'lesson'; lessonId: string }
  | { kind: 'question'; questionId: string; label?: QuestQuestionLabel }
  | { kind: 'learned'; values: LearnedValue[] }
  | { kind: 'tracing'; letters: string[] }
  | { kind: 'recite'; surahNumber: number };

export type QuestKind = 'lesson' | 'story' | 'game' | 'memorization';

export interface BeginnerQuest {
  id: string;
  worldId: QuestWorldId;
  order: number;
  kind: QuestKind;
  title: LocalizedText;
  description: LocalizedText;
  steps: QuestStep[];
  sources?: SourceRef[];
}

/** A short "Did you know?" fact (daily pool, Ramadan tips). */
export interface Fact {
  id: string;
  /** islam-quest world id (`prophets` facts are kept as well). */
  worldId: QuestWorldId | 'prophets';
  text: LocalizedText;
  sources?: SourceRef[];
}

export interface GoodDeed {
  id: string;
  label: LocalizedText;
}

/** A core question with the islam-quest world id of its pack (`areaId` is set to the topic on load). */
export type QuestQuestion = Question & { worldId?: QuestWorldId; areaId: TopicId };

// ---------- Progress (`ilmjourney:quest`) ----------

export interface QuestProgress {
  completed: boolean;
  bestStars: number;
  bestScore: number;
  attempts: number;
  completedAt?: string;
}

/** Self-check progress of one surah in the memorization tool. */
export interface SurahMemorization {
  /** Ayah numbers the learner marked as learned (sorted, unique). */
  learned: number[];
  /** Number of "test myself" rounds finished. */
  tests: number;
  /** Best "test myself" result in percent. */
  bestTest: number;
  updatedAt?: string;
}

export interface QuestData {
  quests: Record<string, QuestProgress>;
  /** Lessons read (XP once each; badge metric `lessonsCompleted`). */
  completedLessons: string[];
  /** Quests finished at least once without a mistake (badge metric `perfectRuns`). */
  perfectQuests: string[];
  /** Recite practice sessions per surah number (from memorization quest steps). */
  recitePractice: Record<string, number>;
  /** Quran memorization tool progress per surah number. */
  memorization: Record<string, SurahMemorization>;
  /** Quranic duas the learner marked. */
  duasLearned: string[];
  duasFavourite: string[];
  /** Arabic letters traced at least once in the alphabet tool (letter characters). */
  tracedLetters: string[];
  /** Ramadan good-deed tracker: day number (1–30) → completed deed ids. */
  ramadanDeeds: Record<string, string[]>;
}
