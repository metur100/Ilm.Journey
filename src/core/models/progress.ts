import type { BadgeId } from './badges';
import type { DayKey, Language, LocalizedText, TopicId } from './common';

// ---------- Profile ----------

export type SkinTone = 0 | 1 | 2 | 3 | 4 | 5;
export type HairStyle = 'short' | 'curly' | 'long' | 'buzz' | 'bun';
export type Headwear = 'none' | 'kufi' | 'hijab' | 'cap';
export type Outfit = 'thobe' | 'hoodie' | 'jacket' | 'abaya';
export type Accessory = 'none' | 'glasses' | 'backpack' | 'scarf' | 'lantern';

/** The learner's own customisable hero (never used for prophets or other real persons). */
export interface Character {
  skinTone: SkinTone;
  hairStyle: HairStyle;
  hairColor: number;
  headwear: Headwear;
  outfit: Outfit;
  outfitColor: number;
  accessory: Accessory;
}

/**
 * Who is learning – asked during onboarding. Used ONLY for recommendations (what to show first)
 * and tone; it never locks or hides content.
 */
export type LearnerGroup = 'child' | 'teen' | 'adult';

export const LEARNER_GROUPS: readonly LearnerGroup[] = ['child', 'teen', 'adult'];

export interface Profile {
  name: string;
  character: Character;
  learnerGroup: LearnerGroup;
}

// ---------- Settings ----------

export type ThemeMode = 'system' | 'light' | 'dark';

export interface Settings {
  language: Language;
  themeMode: ThemeMode;
  /** UI sounds. */
  sound: boolean;
  haptics: boolean;
  /** Read lesson/story text aloud with the device's text-to-speech. */
  narration: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  highContrast: boolean;
  /** One optional daily learning reminder (local notification). */
  reminderEnabled: boolean;
  /** Local hour (0–23) of the reminder. */
  reminderHour: number;
}

// ---------- Learning state ----------

export interface ReviewItem {
  /** Global question key `"<feature>:<id>"`. */
  key: string;
  /** Review-weakness grouping (the question's `topic`). */
  topic: string;
  /** Learning topic, when known (used for "answer 5 Salah questions" quests). */
  topicArea?: TopicId;
  box: number;
  correctCount: number;
  incorrectCount: number;
  lastSeen: string;
  nextReviewDate: string;
  mastered: boolean;
}

export interface StreakState {
  current: number;
  longest: number;
  lastActiveDay: DayKey | null;
}

export interface Stats {
  questionsAnswered: number;
  correctAnswers: number;
  reviewsCorrect: number;
  reviewSessions: number;
}

export type QuestKind = 'daily' | 'learning' | 'knowledge' | 'review' | 'challenge' | 'story' | 'episode';

/** What counts towards a quest of the day. */
export type QuestGoal =
  | { type: 'dailyChallenge' }
  | { type: 'correctAnswers'; topicArea: TopicId; count: number }
  | { type: 'reviewAnswers'; count: number }
  /** Completing a feature item, e.g. target `learn:unit:salah-basics` or `stories:story:adam`. */
  | { type: 'complete'; target: string; title: LocalizedText };

/** A quest of the day. Quests are regenerated per calendar day from the learner's situation. */
export interface Quest {
  id: string;
  kind: QuestKind;
  goal: QuestGoal;
  progress: number;
  target: number;
  completed: boolean;
  xp: number;
}

/** Events that move quests forward. Features report `complete` events via `reportQuestEvent`. */
export type QuestEvent =
  | { type: 'answer'; topicArea?: TopicId; correct: boolean; review: boolean }
  | { type: 'dailyComplete' }
  | { type: 'complete'; target: string };

export type AnswerMode = 'practice' | 'test' | 'master' | 'review' | 'daily' | 'quiz';

/** Reference to an answered question for `recordAnswer`. */
export interface AnswerRef {
  /** Global question key `"<feature>:<id>"`. */
  key: string;
  /** The question's `topic` (review weakness grouping). */
  topic: string;
  /** Learning topic, when the question belongs to one of the eight topics. */
  topicArea?: TopicId;
}

/** Everything the global store persists (`ilmjourney:app`). */
export interface AppData {
  version: number;
  onboarded: boolean;
  settings: Settings;
  profile: Profile;
  xp: number;
  /** Derived from `xp`, kept for convenience. */
  level: number;
  /** XP already granted per reason key (makes `awardXp` idempotent). */
  xpAwards: Record<string, number>;
  streak: StreakState;
  /** Spaced-review queue keyed by global question key. */
  review: Record<string, ReviewItem>;
  /** Question keys answered correctly at least once (XP is granted once per key). */
  correctlyAnswered: string[];
  /** Badge id → ISO date earned. */
  badges: Partial<Record<BadgeId, string>>;
  stats: Stats;
  dailyCompleted: DayKey[];
  questDay: DayKey | null;
  quests: Quest[];
}

export type Celebration = { kind: 'badge'; id: BadgeId } | { kind: 'level'; level: number };
