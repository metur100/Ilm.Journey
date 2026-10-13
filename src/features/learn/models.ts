import type { LocalizedText, Question, SceneSpec, SourceRef, TopicId } from '@/core/models';

/**
 * knowledge-rpg "area" metadata (areas.json, copied as is). In Ilm Journey every area is one of the
 * eight topics and all are open from the start – the `map` and `unlock` fields are kept only so the
 * content file stays identical to the source app.
 */
export interface Area {
  id: TopicId;
  order: number;
  name: LocalizedText;
  statName: LocalizedText;
  description: LocalizedText;
  scene: SceneSpec;
  map: { x: number; y: number };
  unlock: { areaId: TopicId; unitsCompleted: number } | null;
}

export interface LessonSection {
  heading?: LocalizedText;
  body: LocalizedText;
  arabic?: string;
  transliteration?: string;
}

/**
 * A knowledge-rpg learning unit: LEARN (lesson) → PRACTICE (one easy interaction, not scored)
 * → TEST (scored questions) → EXPLANATION (summary) → REWARD.
 */
export interface Unit {
  id: string;
  areaId: TopicId;
  order: number;
  title: LocalizedText;
  description: LocalizedText;
  difficulty: 1 | 2 | 3;
  lesson: LessonSection[];
  /** Shown when scholars hold different valid positions. */
  differenceNote?: LocalizedText;
  practiceId: string;
  testIds: string[];
  /** Short "why it matters" summary shown after the test. */
  explanation: LocalizedText;
  sources: SourceRef[];
  questions: Question[];
}

export interface UnitProgress {
  completed: boolean;
  bestScore: number;
  attempts: number;
  completedAt?: string;
}

export interface MasterProgress {
  passed: boolean;
  bestScore: number;
  attempts: number;
  passedAt?: string;
}

/** Persisted learn progress (`ilmjourney:learn`). */
export interface LearnData {
  units: Record<string, UnitProgress>;
  masters: Partial<Record<TopicId, MasterProgress>>;
  /** Units finished with every test answer correct (badge metric `perfectRuns`). */
  perfectUnits: string[];
  /** Last opened path item – drives the home "Continue" card and today's learning quest. */
  lastVisited: { topic: TopicId; itemId: string; at: string } | null;
}
