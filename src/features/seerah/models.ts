import type { LocalizedText, MatchingQuestion, MultipleChoiceQuestion, OrderingQuestion, SceneSpec, TrueFalseQuestion } from '@/core/models';

/*
 * Seerah content model (ported from the sira app). Content lives in JSON next to `content/index.ts`.
 */

// ---------- Sources ----------

export type SourceType = 'quran' | 'hadith' | 'seerah' | 'history' | 'biography';

/**
 * A verifiable reference. `url` is only set for stable, well-known addresses
 * (quran.com, sunnah.com); it is never guessed.
 */
export interface Source {
  id: string;
  title: string;
  author: string | null;
  type: SourceType;
  reference: string;
  url: string | null;
  notes: LocalizedText | null;
}

// ---------- Text blocks ----------

/**
 * Every statement is labelled so the reader always knows what kind of claim it is:
 * - fact: established by the Quran, authentic hadith or broad agreement of the Seerah sources
 * - interpretation: a historical reading, an approximate date or a point where sources differ
 * - reflection: a lesson or thought for the reader, not a historical claim
 */
export type BlockKind = 'fact' | 'interpretation' | 'reflection';

export interface ContentBlock {
  kind: BlockKind;
  text: LocalizedText;
  sourceIds: string[];
}

// ---------- People ----------

/** saw: ﷺ (the Prophet) · ra / raha: رضي الله عنه / عنها · rh: رحمه الله · none */
export type Honorific = 'saw' | 'ra' | 'raha' | 'rh' | 'none';

export type PersonKind = 'prophet' | 'family' | 'companion' | 'quraysh' | 'other' | 'group';

export interface Person {
  id: string;
  name: LocalizedText;
  arabicName: string;
  honorific: Honorific;
  kind: PersonKind;
  role: LocalizedText;
  relationship: LocalizedText;
  bio: ContentBlock[];
  sourceIds: string[];
}

// ---------- Places & routes ----------

/** historical: securely identified · approximate: exact spot uncertain · modern: present-day reference only */
export type Precision = 'historical' | 'approximate' | 'modern';

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Place {
  id: string;
  name: LocalizedText;
  arabicName: string;
  kind: 'city' | 'mountain' | 'cave' | 'battlefield' | 'site' | 'region';
  precision: Precision;
  /** Omitted when the place lies outside the map (e.g. Abyssinia). */
  coords: Coordinates | null;
  whyItMatters: LocalizedText;
  description: ContentBlock[];
  /** Explains how the location is known or why it is approximate. */
  locationNote: LocalizedText;
  sourceIds: string[];
}

export interface Route {
  id: string;
  name: LocalizedText;
  eventId: string;
  points: Coordinates[];
  /** Routes are always drawn as approximate; the note says what is known. */
  note: LocalizedText;
}

// ---------- Events ----------

export type Era = 'before' | 'makkah' | 'madinah';

export interface EventDate {
  /** Used for chronological ordering only. */
  sortKey: number;
  label: LocalizedText;
  certainty: 'established' | 'approximate' | 'disputed';
  note: LocalizedText | null;
}

export interface SeerahEvent {
  id: string;
  title: LocalizedText;
  date: EventDate;
  era: Era;
  summary: ContentBlock[];
  placeIds: string[];
  peopleIds: string[];
  episodeId: string | null;
  relatedEventIds: string[];
  themeIds: string[];
  sourceIds: string[];
}

export interface Theme {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
}

// ---------- Episodes ----------

/** Scene elements as stored in the sira JSON (mapped to core SceneView elements by `toSceneSpec`). */
export type SiraSceneElement =
  | 'stars'
  | 'crescent'
  | 'mountains'
  | 'dunes'
  | 'city'
  | 'kaaba'
  | 'mosque'
  | 'cave'
  | 'palms'
  | 'caravan'
  | 'tents'
  | 'lamp'
  | 'scroll'
  | 'sea';

export interface SiraScene {
  sky: 'night' | 'dawn' | 'day' | 'dusk';
  elements: SiraSceneElement[];
}

export interface Lesson {
  title: LocalizedText;
  text: LocalizedText;
  themeId: string;
}

export interface ReflectionQuestion {
  id: string;
  prompt: LocalizedText;
  /** Ready-made reflections the reader can choose instead of writing. */
  options: LocalizedText[];
}

export interface EpisodeSources {
  primary: string[];
  secondary: string[];
  further: string[];
}

export interface Episode {
  id: string;
  order: number;
  era: Era;
  title: LocalizedText;
  subtitle: LocalizedText;
  period: LocalizedText;
  scene: SiraScene;
  introduction: LocalizedText;
  context: ContentBlock[];
  mainEvent: ContentBlock[];
  mainEventId: string;
  events: string[];
  people: string[];
  places: string[];
  routes: string[];
  questions: string[];
  lessons: Lesson[];
  reflectionQuestions: ReflectionQuestion[];
  sources: EpisodeSources;
  themeIds: string[];
}

/** Sira questions are core questions with `episodeId`, `kind` and `sourceIds` (topic/areaId added by the loader). */
export type SeerahQuestion = (MultipleChoiceQuestion | TrueFalseQuestion | OrderingQuestion | MatchingQuestion) & {
  episodeId: string;
  sourceIds: string[];
};

export type { SceneSpec };

// ---------- Progress (feature store) ----------

export type EpisodeStep =
  | 'introduction'
  | 'context'
  | 'timeline'
  | 'mainEvent'
  | 'people'
  | 'locations'
  | 'explore'
  | 'challenge'
  | 'lesson'
  | 'reflection'
  | 'sources';

export interface EpisodeProgress {
  /** Last step reached, so the journey can be continued. */
  step: EpisodeStep;
  startedAt: string;
  /** Last time the reader moved in this episode (home "Continue"). */
  updatedAt: string;
  completedAt: string | null;
  bestScore: number | null;
}

export interface QuizResult {
  episodeId: string;
  correct: number;
  total: number;
  percent: number;
  date: string;
}

export type BookmarkType = 'episode' | 'event' | 'person' | 'place' | 'source';

export interface Bookmark {
  type: BookmarkType;
  id: string;
  createdAt: string;
}

export interface Reflection {
  questionId: string;
  episodeId: string;
  /** Free text written by the reader (never judged). */
  text: string;
  /** Index of a chosen ready-made reflection, if any. */
  optionIndex: number | null;
  updatedAt: string;
}

export type DiscoveryType = 'event' | 'person' | 'place';

/** Everything the Seerah store persists (`ilmjourney:seerah`). Global XP/review/badges live in core. */
export interface SeerahData {
  episodes: Record<string, EpisodeProgress>;
  lastEpisodeId: string | null;
  quizResults: QuizResult[];
  /** Episodes whose knowledge challenge was finished without a mistake (badge metric `perfectRuns`). */
  perfectEpisodes: string[];
  bookmarks: Bookmark[];
  reflections: Record<string, Reflection>;
  /** Discovery type → id → ISO date discovered. */
  discovered: Record<DiscoveryType, Record<string, string>>;
}
