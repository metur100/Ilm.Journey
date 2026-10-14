import type { Href } from 'expo-router';
import type { ComponentType } from 'react';

import type { AchievementKey, BadgeMetrics, CollectionCard, DayKey, Language, LocalizedText, Question, QuestionType, SourceRef, TopicId } from './models';
import { parseQuestionKey } from './models';
import { mergeMetrics } from './services/badges';
import type { DailyCandidate } from './services/daily';
import type { QuestCandidate } from './services/quests';

/**
 * Content registry: the only way core learns about feature content.
 *
 * Every feature calls the `register*` functions from its `src/features/<feature>/register.ts`
 * (imported once by `src/features/index.ts`). Registrations are keyed by feature (or question
 * prefix / type), so registering again replaces the previous entry (fast refresh, tests).
 * See docs/FEATURE-PORTING.md for examples.
 */

// ---------------------------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------------------------

/** Where a question comes from – shown above it in the review centre and daily challenge. */
export interface QuestionContext {
  /** e.g. the unit, story or episode title. */
  title?: LocalizedText;
  topicArea?: TopicId;
  icon?: string;
}

export interface QuestionLookup {
  get(id: string): Question | undefined;
  context?(id: string): QuestionContext | undefined;
}

export interface ResolvedQuestion {
  key: string;
  prefix: string;
  question: Question;
  context?: QuestionContext;
  /** Learning topic: context topic, else the question's `areaId`. */
  topicArea?: TopicId;
}

const questionLookups = new Map<string, QuestionLookup>();

/**
 * Registers the questions of a feature under a key prefix (`learn`, `quest`, `stories`, `seerah`).
 * The global key of a question is `"<prefix>:<question.id>"`.
 */
export function registerQuestions(prefix: string, lookup: QuestionLookup): void {
  if (prefix.includes(':')) throw new Error(`Question prefix must not contain ":" (${prefix})`);
  questionLookups.set(prefix, lookup);
}

/** Looks up any question of any feature by its global key. */
export function getQuestionByKey(key: string): ResolvedQuestion | undefined {
  const parsed = parseQuestionKey(key);
  if (!parsed) return undefined;
  const lookup = questionLookups.get(parsed.feature);
  const question = lookup?.get(parsed.id);
  if (!lookup || !question) return undefined;
  const context = lookup.context?.(parsed.id);
  return { key, prefix: parsed.feature, question, context, topicArea: context?.topicArea ?? question.areaId };
}

export function getQuestionPrefixes(): string[] {
  return [...questionLookups.keys()];
}

// ---------------------------------------------------------------------------------------------
// Question renderers (extension point of QuestionView)
// ---------------------------------------------------------------------------------------------

export interface AnswerResult {
  correct: boolean;
  /** Human-readable correct answer, shown when the learner was not right. */
  correctAnswer: string;
  /** Extra feedback for the chosen option (scenario questions). */
  extraFeedback?: string;
}

export interface QuestionComponentProps<Q extends Question = Question> {
  question: Q;
  onAnswered: (result: AnswerResult) => void;
  locked: boolean;
}

export interface QuestionRenderer<Q extends Question = Question> {
  Component: ComponentType<QuestionComponentProps<Q>>;
  /** Hide "Correct answer: …" in the feedback panel (e.g. for ordering-like games). */
  hideCorrectAnswer?: boolean;
}

const renderers = new Map<QuestionType, QuestionRenderer>();

/**
 * Registers the renderer for a question type that needs feature data:
 * `missingWord` / `ayahOrder` (Quran data – learn), `map` (story places – stories).
 * Core types can be overridden too, but should not be.
 */
export function registerQuestionRenderer<T extends QuestionType>(type: T, renderer: QuestionRenderer<Extract<Question, { type: T }>>): void {
  renderers.set(type, renderer as unknown as QuestionRenderer);
}

export function getQuestionRenderer(type: QuestionType): QuestionRenderer | undefined {
  return renderers.get(type);
}

// ---------------------------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------------------------

/** Resolves `question.sourceIds` (Seerah) to displayable references. Return [] if not yours. */
export type SourceResolver = (ids: readonly string[], question: Question) => SourceRef[];

const sourceResolvers = new Map<string, SourceResolver>();

export function registerSourceResolver(feature: string, resolver: SourceResolver): void {
  sourceResolvers.set(feature, resolver);
}

/** `question.sources`, or the first non-empty resolution of `question.sourceIds`. */
export function resolveSources(question: Question): SourceRef[] {
  if (question.sources && question.sources.length > 0) return question.sources;
  if (!question.sourceIds || question.sourceIds.length === 0) return [];
  for (const resolver of sourceResolvers.values()) {
    const result = resolver(question.sourceIds, question);
    if (result.length > 0) return result;
  }
  return [];
}

// ---------------------------------------------------------------------------------------------
// Progress (badges, knowledge radar, home "continue" + "recently completed")
// ---------------------------------------------------------------------------------------------

export interface ContinueItem {
  /** Unique, e.g. `learn:unit:salah-basics`. */
  key: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  icon: string;
  topicArea?: TopicId;
  href: Href;
  /** ISO time of the last activity – the most recent item across features wins. */
  updatedAt: string;
  /** 0..1 progress inside the item, when known. */
  progress?: number;
}

export interface CompletedItem {
  key: string;
  title: LocalizedText;
  subtitle?: LocalizedText;
  icon: string;
  topicArea?: TopicId;
  href?: Href;
  completedAt: string;
}

export interface ProgressReporter {
  /** Subscribe to the feature store so screens update when feature progress changes. */
  subscribe?(listener: () => void): () => void;
  /** Badge metrics (see `BadgeMetric`); shared metrics are summed across features. */
  metrics?(): BadgeMetrics;
  /** Question keys per topic for the knowledge radar (scored questions only). */
  topicQuestionKeys?(): Partial<Record<TopicId, readonly string[]>>;
  /** The item to continue on the home screen (null when nothing is in progress). */
  continueItem?(): ContinueItem | null;
  /** Recently completed items (newest first is not required – core sorts). */
  recentlyCompleted?(): CompletedItem[];
}

const reporters = new Map<string, ProgressReporter>();
const reporterUnsubscribes = new Map<string, () => void>();
let progressVersion = 0;
const versionListeners = new Set<() => void>();

function bumpProgressVersion() {
  progressVersion++;
  for (const listener of versionListeners) listener();
}

export function registerProgress(feature: string, reporter: ProgressReporter): void {
  reporterUnsubscribes.get(feature)?.();
  reporters.set(feature, reporter);
  const unsubscribe = reporter.subscribe?.(bumpProgressVersion);
  if (unsubscribe) reporterUnsubscribes.set(feature, unsubscribe);
  bumpProgressVersion();
}

/** Increments whenever a registered feature store changes (for `useSyncExternalStore`). */
export function getProgressVersion(): number {
  return progressVersion;
}

export function subscribeProgress(listener: () => void): () => void {
  versionListeners.add(listener);
  return () => versionListeners.delete(listener);
}

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/** Sum of all feature metrics (core metrics are added by the store). */
export function collectFeatureMetrics(): BadgeMetrics {
  return mergeMetrics(...[...reporters.values()].map((r) => safe(() => r.metrics?.() ?? {}, {})));
}

export function collectTopicQuestionKeys(): Partial<Record<TopicId, readonly string[]>>[] {
  return [...reporters.values()].map((r) => safe(() => r.topicQuestionKeys?.() ?? {}, {}));
}

/** The most recently active item across all features. */
export function getContinueItem(): ContinueItem | null {
  const items = [...reporters.values()]
    .map((r) => safe(() => r.continueItem?.() ?? null, null))
    .filter((i): i is ContinueItem => i !== null);
  items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return items[0] ?? null;
}

export function getRecentlyCompleted(limit = 5): CompletedItem[] {
  return [...reporters.values()]
    .flatMap((r) => safe(() => r.recentlyCompleted?.() ?? [], []))
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, limit);
}

// ---------------------------------------------------------------------------------------------
// Daily challenge & quests of the day
// ---------------------------------------------------------------------------------------------

const dailyPools = new Map<string, () => DailyCandidate[]>();

/** Questions a feature offers for the daily challenge (scored, self-contained questions). */
export function registerDailyPool(feature: string, pool: () => DailyCandidate[]): void {
  dailyPools.set(feature, pool);
}

export function getDailyCandidates(): DailyCandidate[] {
  return [...dailyPools.values()].flatMap((pool) => safe(pool, []));
}

export interface QuestContext {
  day: DayKey;
}

const questProviders = new Map<string, (context: QuestContext) => QuestCandidate[]>();

/** Suggestions for today's quests (e.g. the next unit, story or episode). */
export function registerQuestProvider(feature: string, provider: (context: QuestContext) => QuestCandidate[]): void {
  questProviders.set(feature, provider);
}

export function getQuestCandidates(context: QuestContext): QuestCandidate[] {
  return [...questProviders.values()].flatMap((provider) => safe(() => provider(context), []));
}

// ---------------------------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------------------------

export interface SearchResult {
  key: string;
  feature: string;
  title: string;
  subtitle?: string;
  icon: string;
  href: Href;
  /** Higher is better (default 0). */
  score?: number;
}

export type SearchProvider = (query: string, language: Language) => SearchResult[];

const searchProviders = new Map<string, SearchProvider>();

/** Search across the app (the Seerah search screen can extend to everything through this). */
export function registerSearch(feature: string, provider: SearchProvider): void {
  searchProviders.set(feature, provider);
}

export function searchAll(query: string, language: Language, limit = 50): SearchResult[] {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];
  return [...searchProviders.values()]
    .flatMap((provider) => safe(() => provider(trimmed, language), []))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || a.title.localeCompare(b.title))
    .slice(0, limit);
}

// ---------------------------------------------------------------------------------------------
// Lifecycle (hydrate on start, reset with "Reset progress")
// ---------------------------------------------------------------------------------------------

export interface FeatureLifecycle {
  /** Load the feature store from storage (called once at app start, before the splash hides). */
  hydrate?(): Promise<void>;
  /** Clear the feature store and its storage (called by `resetProgress`). */
  reset?(): Promise<void> | void;
  /** Start persisting the store after changes (use `autoSave` from core/storage); returns a stop function. */
  autoSave?(): () => void;
}

const lifecycles = new Map<string, FeatureLifecycle>();

export function registerLifecycle(feature: string, lifecycle: FeatureLifecycle): void {
  lifecycles.set(feature, { ...lifecycles.get(feature), ...lifecycle });
}

/** Shorthand for `registerLifecycle(feature, { reset })`. */
export function registerReset(feature: string, reset: () => Promise<void> | void): void {
  registerLifecycle(feature, { reset });
}

export async function hydrateFeatures(): Promise<void> {
  await Promise.all([...lifecycles.values()].map((l) => l.hydrate?.().catch(() => undefined)));
}

/** Starts the auto-save of every feature store; returns a function that stops them all. */
export function startFeatureAutoSaves(): () => void {
  const stops = [...lifecycles.values()].map((l) => l.autoSave?.()).filter((s): s is () => void => typeof s === 'function');
  return () => stops.forEach((stop) => stop());
}

export async function resetFeatures(): Promise<void> {
  await Promise.all(
    [...lifecycles.values()].map(async (l) => {
      try {
        await l.reset?.();
      } catch {
        // A failing feature reset must not block the others.
      }
    }),
  );
}

// ---------------------------------------------------------------------------------------------
// UI extension points (home sections, profile links)
// ---------------------------------------------------------------------------------------------

export interface HomeSection {
  id: string;
  /** Sections are sorted by order; core cards use 0–100 (continue 10, daily 20, quests 40, recent 80). */
  order: number;
  Component: ComponentType;
}

const homeSections = new Map<string, HomeSection>();

/** Adds a card to the home screen (e.g. "Today's Seerah"). */
export function registerHomeSection(section: HomeSection): void {
  homeSections.set(section.id, section);
}

export function getHomeSections(): HomeSection[] {
  return [...homeSections.values()].sort((a, b) => a.order - b.order);
}

export interface ProfileLink {
  id: string;
  order: number;
  icon: string;
  label: (language: Language) => string;
  href: Href;
}

const profileLinks = new Map<string, ProfileLink>();

/** Adds a row to the profile's "More" section (e.g. Seerah bookmarks and reflections). */
export function registerProfileLink(link: ProfileLink): void {
  profileLinks.set(link.id, link);
}

export function getProfileLinks(): ProfileLink[] {
  return [...profileLinks.values()].sort((a, b) => a.order - b.order);
}

// ---------------------------------------------------------------------------------------------
// Achievements & collection cards (v2 engagement: collection album, unlock rules)
// ---------------------------------------------------------------------------------------------

/**
 * Reports the achievement keys a feature's learner has earned (see `AchievementKey` in core/models/collection),
 * e.g. `story:adam:complete`, `episode:e01`, `letter:ب:traced`. Must be cheap and pure (read the feature store).
 */
export type AchievementProvider = () => Iterable<AchievementKey>;

const achievementProviders = new Map<string, AchievementProvider>();

export function registerAchievements(feature: string, provider: AchievementProvider): void {
  achievementProviders.set(feature, provider);
}

/** Every achievement key earned so far, across all features. */
export function collectAchievements(): Set<AchievementKey> {
  const all = new Set<AchievementKey>();
  for (const provider of achievementProviders.values()) {
    for (const key of safe(() => [...provider()], [] as AchievementKey[])) all.add(key);
  }
  return all;
}

const collectionCards = new Map<string, CollectionCard[]>();

/**
 * Registers the collection cards a feature contributes (built from its existing content – facts and sources
 * are copied, never invented). Registering again under the same feature replaces its cards.
 */
export function registerCollectionCards(feature: string, cards: CollectionCard[]): void {
  collectionCards.set(feature, cards);
  bumpProgressVersion();
}

/** All registered cards in registration order (features in registration order, cards as given). */
export function getCollectionCards(): CollectionCard[] {
  return [...collectionCards.values()].flat();
}

// ---------------------------------------------------------------------------------------------

/** Removes every registration (tests only). */
export function clearRegistryForTests(): void {
  questionLookups.clear();
  renderers.clear();
  sourceResolvers.clear();
  for (const unsubscribe of reporterUnsubscribes.values()) unsubscribe();
  reporterUnsubscribes.clear();
  reporters.clear();
  dailyPools.clear();
  questProviders.clear();
  searchProviders.clear();
  lifecycles.clear();
  homeSections.clear();
  profileLinks.clear();
  achievementProviders.clear();
  collectionCards.clear();
  bumpProgressVersion();
}
