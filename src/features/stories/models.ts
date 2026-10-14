import type { LocalizedText, Question, SceneElement, SceneSpec, SourceRef } from '@/core/models';

/** Stories feature types (story-of-the-prophets). Questions use the core `Question` superset. */

export type Honorific = 'alayhis-salam' | 'sallallahu-alayhi-wa-sallam';

export interface StoryScene {
  id: string;
  title: LocalizedText;
  text: LocalizedText;
  scene: SceneSpec;
  /** Question shown right after this scene (interaction / question). */
  interactionId?: string;
  sources?: SourceRef[];
}

/** A value taught by the story ("What did we learn?"). */
export interface StoryLesson {
  id: string;
  /** Value tag, e.g. "sabr" – used for value-based badges. */
  value: string;
  title: LocalizedText;
  explanation: LocalizedText;
  example: LocalizedText;
  reflection: LocalizedText;
}

export interface Story {
  id: string;
  order: number;
  prophetName: LocalizedText;
  honorific: Honorific;
  title: LocalizedText;
  description: LocalizedText;
  /** Where the story takes place (shown on the timeline card). */
  place: LocalizedText;
  /** Symbolic object representing the story on the map – never a person. */
  symbol: SceneElement;
  cover: SceneSpec;
  intro: LocalizedText;
  scenes: StoryScene[];
  miniGameId: string;
  quizIds: string[];
  lessons: StoryLesson[];
  questions: Question[];
  sources: SourceRef[];
}

export type QuestionRole = 'interaction' | 'question' | 'miniGame' | 'quiz';

export type FlowStep =
  | { kind: 'intro' }
  | { kind: 'scene'; sceneId: string }
  | { kind: 'question'; questionId: string; role: QuestionRole }
  | { kind: 'lessons' };

/** Places of the stylised story map (approximate positions, not exact geography). */
export type MapPlaceId = 'makkah' | 'madinah' | 'egypt' | 'jerusalem' | 'judi' | 'mesopotamia';

export interface StoryProgress {
  completed: boolean;
  bestStars: number;
  bestScore: number;
  attempts: number;
  completedAt?: string;
}

/** A story the learner left part-way through; "Continue story" resumes here. */
export interface StoryRun {
  storyId: string;
  stepIndex: number;
  /** Results of the scored question steps answered so far. */
  results: boolean[];
  /** XP earned in this run (answers + lessons), shown on the reward screen. */
  xpEarned: number;
  updatedAt: string;
}

/** Everything the stories store persists (`ilmjourney:stories`). */
export interface StoriesData {
  stories: Record<string, StoryProgress>;
  completedScenes: string[];
  learnedLessons: string[];
  /** Stories finished at least once without a mistake (`perfectRuns` badge metric). */
  perfectStories: string[];
  run: StoryRun | null;
}
