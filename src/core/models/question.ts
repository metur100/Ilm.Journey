import type { LocalizedText, SourceRef, TopicId } from './common';
import type { SceneElement } from './scene';

/**
 * Question superset of all four source apps.
 *
 * | type           | origin                         | rendered by                         |
 * | -------------- | ------------------------------ | ----------------------------------- |
 * | multipleChoice | all                            | core ChoiceQuestion                 |
 * | trueFalse      | all                            | core TrueFalseQuestion              |
 * | ordering       | all                            | core OrderingQuestion               |
 * | matching       | all                            | core MatchingQuestion               |
 * | memory         | rpg, islam-quest, stories      | core MemoryQuestion                 |
 * | scenario       | rpg, islam-quest, stories      | core ChoiceQuestion                 |
 * | imageChoice    | knowledge-rpg                  | core ImageChoiceQuestion            |
 * | fillBlank      | knowledge-rpg                  | core FillBlankQuestion              |
 * | categorize     | knowledge-rpg                  | core CategorizeQuestion             |
 * | lessonChoice   | story-of-the-prophets          | core ChoiceQuestion                 |
 * | find           | story-of-the-prophets          | core FindQuestion                   |
 * | missingWord    | islam-quest (Quran data)       | extension renderer (learn/quran)    |
 * | ayahOrder      | islam-quest (Quran data)       | extension renderer (learn/quran)    |
 * | map            | story-of-the-prophets (places) | extension renderer (stories)        |
 *
 * Types whose rendering needs feature data (Quran text, story places) are rendered through
 * `registerQuestionRenderer()` in `core/registry.ts`; see docs/FEATURE-PORTING.md.
 */
export type QuestionType =
  | 'multipleChoice'
  | 'trueFalse'
  | 'ordering'
  | 'matching'
  | 'memory'
  | 'scenario'
  | 'imageChoice'
  | 'fillBlank'
  | 'categorize'
  | 'lessonChoice'
  | 'find'
  | 'map'
  | 'missingWord'
  | 'ayahOrder';

/** Seerah question labels (what the question trains); shown as the label pill. */
export type QuestionKind = 'general' | 'timeline' | 'sequence' | 'connection' | 'personEvent' | 'placeEvent' | 'eventLesson';

export interface QuestionBase {
  /** Unique inside its feature. The global key is `"<feature>:<id>"` (see `questionKey`). */
  id: string;
  /** Topic key used to find weak topics in the review system (free text, e.g. "wudu"). */
  topic: string;
  prompt: LocalizedText;
  explanation: LocalizedText;
  sources?: SourceRef[];
  /** Seerah: ids of the feature's source records, resolved via `registerSourceResolver`. */
  sourceIds?: string[];
  /** Seerah: question label. */
  kind?: QuestionKind;
  // ---- Optional feature context (keep it to these simple ids) ----
  /** Learn topic (knowledge-rpg `areaId`, islam-quest `worldId` mapped to a topic). */
  areaId?: TopicId;
  /** Stories: prophet story id. */
  storyId?: string;
  /** Seerah: episode id. */
  episodeId?: string;
}

export interface AnswerOption {
  id: string;
  text: LocalizedText;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multipleChoice';
  options: AnswerOption[];
  correctOptionId: string;
}

/** "Choose the correct lesson": multiple-choice mechanics with its own label. */
export interface LessonChoiceQuestion extends QuestionBase {
  type: 'lessonChoice';
  options: AnswerOption[];
  correctOptionId: string;
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'trueFalse';
  correct: boolean;
}

export interface MatchingPair {
  id: string;
  left: LocalizedText;
  right: LocalizedText;
}

export interface MatchingQuestion extends QuestionBase {
  type: 'matching';
  pairs: MatchingPair[];
}

export interface MemoryQuestion extends QuestionBase {
  type: 'memory';
  pairs: MatchingPair[];
}

/** Items are listed in the correct order; the UI shuffles them. `timeline` is a display hint. */
export interface OrderingQuestion extends QuestionBase {
  type: 'ordering';
  timeline?: boolean;
  items: AnswerOption[];
}

export interface ImageOption {
  id: string;
  element: SceneElement;
  label: LocalizedText;
}

/** Image selection: pick the one illustration that answers the question. */
export interface ImageChoiceQuestion extends QuestionBase {
  type: 'imageChoice';
  options: ImageOption[];
  correctOptionId: string;
}

export interface ScenarioOption extends AnswerOption {
  feedback: LocalizedText;
}

export interface ScenarioQuestion extends QuestionBase {
  type: 'scenario';
  options: ScenarioOption[];
  correctOptionId: string;
}

/** Fill in the blank: `sentence` contains "___" where the missing word goes. */
export interface FillBlankQuestion extends QuestionBase {
  type: 'fillBlank';
  sentence: LocalizedText;
  options: AnswerOption[];
  correctOptionId: string;
}

export interface Category {
  id: string;
  label: LocalizedText;
}

export interface CategorizeItem {
  id: string;
  text: LocalizedText;
  categoryId: string;
}

/** Categorization: sort every item into the right group. */
export interface CategorizeQuestion extends QuestionBase {
  type: 'categorize';
  categories: Category[];
  items: CategorizeItem[];
}

export interface FindItem {
  id: string;
  element: SceneElement;
  label: LocalizedText;
}

/** Find game: select every object that belongs to the story among illustrated objects. */
export interface FindQuestion extends QuestionBase {
  type: 'find';
  items: FindItem[];
  correctIds: string[];
}

/** Map interaction: tap the right place (place ids are defined by the feature that renders it). */
export interface MapQuestion extends QuestionBase {
  type: 'map';
  places: string[];
  correctPlace: string;
}

/** Quran memorization: one word of a verified ayah is hidden (text comes from generated Quran data). */
export interface MissingWordQuestion extends QuestionBase {
  type: 'missingWord';
  surahNumber: number;
  ayahNumber: number;
  missingWordIndex: number;
}

/** Quran memorization: put the ayahs of a short surah in order. */
export interface AyahOrderQuestion extends QuestionBase {
  type: 'ayahOrder';
  surahNumber: number;
}

export type Question =
  | MultipleChoiceQuestion
  | LessonChoiceQuestion
  | TrueFalseQuestion
  | MatchingQuestion
  | MemoryQuestion
  | OrderingQuestion
  | ImageChoiceQuestion
  | ScenarioQuestion
  | FillBlankQuestion
  | CategorizeQuestion
  | FindQuestion
  | MapQuestion
  | MissingWordQuestion
  | AyahOrderQuestion;

/** What the player submitted, normalised for evaluation. */
export type AnswerInput =
  | { type: 'option'; optionId: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'order'; ids: string[] }
  | { type: 'pairs'; mistakes: number }
  | { type: 'memory'; moves: number }
  | { type: 'categories'; assignment: Record<string, string> }
  | { type: 'selection'; ids: string[] }
  | { type: 'place'; place: string }
  | { type: 'word'; word: string };

/** Globally unique question key: `"<feature>:<questionId>"`, e.g. `learn:salah-wudu-q3`. */
export function questionKey(feature: string, questionId: string): string {
  return `${feature}:${questionId}`;
}

/** Splits a question key at the first colon. Returns null for malformed keys. */
export function parseQuestionKey(key: string): { feature: string; id: string } | null {
  const index = key.indexOf(':');
  if (index <= 0 || index === key.length - 1) return null;
  return { feature: key.slice(0, index), id: key.slice(index + 1) };
}
