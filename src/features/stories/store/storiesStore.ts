import { create } from 'zustand';

import { isPerfect, type QuizScore, scoreQuiz } from '@/core/services/quiz';
import { XP } from '@/core/services/xp';
import { autoSave, clearPersisted, loadPersisted, type PersistSpec, storageKey, withDefaults } from '@/core/storage';
import { useAppStore } from '@/core/store/appStore';

import { getStory, LESSONS, SCENES, STORIES } from '../content';
import type { StoriesData, StoryProgress, StoryRun } from '../models';
import { EMPTY_STORIES } from '../services/progress';
import { buildStoryFlow, scenesReached } from '../services/storyFlow';

export const STORIES_VERSION = 1;

/** Quest-of-the-day / completion target of a story. */
export const storyTarget = (storyId: string) => `stories:story:${storyId}`;
/** XP reason keys (idempotent `awardXp`). */
export const storyXpReason = (storyId: string, event: 'complete' | 'perfect') => `stories:${storyId}:${event}`;
export const lessonXpReason = (lessonId: string) => `stories:${lessonId}:learned`;

const isString = (v: unknown): v is string => typeof v === 'string';
const knownLessons = new Set(LESSONS.map((l) => l.id));
const knownScenes = new Set(SCENES.map((s) => s.id));

function sanitizeProgress(raw: unknown): StoryProgress | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = withDefaults<StoryProgress>({ completed: false, bestStars: 0, bestScore: 0, attempts: 0 }, raw);
  return {
    completed: p.completed === true,
    bestStars: Math.max(0, Math.min(3, Math.round(p.bestStars))),
    bestScore: Math.max(0, Math.min(100, Math.round(p.bestScore))),
    attempts: Math.max(0, Math.round(p.attempts)),
    ...(isString(p.completedAt) ? { completedAt: p.completedAt } : {}),
  };
}

function sanitizeRun(raw: unknown): StoryRun | null {
  if (!raw || typeof raw !== 'object') return null;
  const run = raw as Partial<StoryRun>;
  const story = isString(run.storyId) ? getStory(run.storyId) : undefined;
  if (!story || typeof run.stepIndex !== 'number' || !Number.isInteger(run.stepIndex)) return null;
  const flowLength = buildStoryFlow(story).length;
  if (run.stepIndex < 0 || run.stepIndex >= flowLength) return null;
  const results = Array.isArray(run.results) ? run.results.filter((r): r is boolean => typeof r === 'boolean') : [];
  return {
    storyId: story.id,
    stepIndex: run.stepIndex,
    results,
    xpEarned: typeof run.xpEarned === 'number' && Number.isFinite(run.xpEarned) ? Math.max(0, run.xpEarned) : 0,
    updatedAt: isString(run.updatedAt) ? run.updatedAt : new Date(0).toISOString(),
  };
}

/** Repairs stored stories progress (unknown stories/lessons/scenes and wrong shapes are dropped). */
export function sanitizeStoriesData(raw: unknown): StoriesData | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const data = withDefaults(EMPTY_STORIES, raw);
  const stories: Record<string, StoryProgress> = {};
  for (const [id, value] of Object.entries(data.stories ?? {})) {
    const progress = getStory(id) ? sanitizeProgress(value) : null;
    if (progress) stories[id] = progress;
  }
  const unique = (list: unknown[], known: Set<string>) => [...new Set(list.filter(isString).filter((id) => known.has(id)))];
  return {
    stories,
    completedScenes: unique(data.completedScenes, knownScenes),
    learnedLessons: unique(data.learnedLessons, knownLessons),
    perfectStories: unique(data.perfectStories, new Set(STORIES.map((s) => s.id))),
    run: sanitizeRun((raw as { run?: unknown }).run),
  };
}

export const STORIES_PERSIST: PersistSpec<StoriesData> = {
  key: storageKey('stories'),
  version: STORIES_VERSION,
  migrations: {},
  sanitize: sanitizeStoriesData,
};

export type RewardLineKind = 'learning' | 'storyComplete' | 'perfectBonus' | 'quest';

export interface StoryOutcome {
  score: QuizScore;
  firstCompletion: boolean;
  perfect: boolean;
  /** XP of this completion (story, perfect bonus, quest of the day). */
  xp: number;
  lines: { kind: RewardLineKind; xp: number }[];
}

interface StoriesStore extends StoriesData {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  reset: () => Promise<void>;
  /** Saves the current position so "Continue story" can resume, and marks reached scenes. */
  saveStep: (storyId: string, stepIndex: number, results: boolean[], xpEarned: number) => void;
  /** "What did we learn?" – each lesson counts (and earns XP) once. Returns the XP granted. */
  learnLessons: (storyId: string) => number;
  /** Finishes a story run: progress, stars, XP (once), streak and the quest of the day. */
  completeStory: (storyId: string, results: readonly boolean[]) => StoryOutcome | null;
}

const pick = (s: StoriesData): StoriesData => ({
  stories: s.stories,
  completedScenes: s.completedScenes,
  learnedLessons: s.learnedLessons,
  perfectStories: s.perfectStories,
  run: s.run,
});

export const useStoriesStore = create<StoriesStore>((set, get) => ({
  ...EMPTY_STORIES,
  hydrated: false,

  hydrate: async () => {
    const stored = await loadPersisted(STORIES_PERSIST);
    set({ ...(stored ?? EMPTY_STORIES), hydrated: true });
  },

  reset: async () => {
    await clearPersisted(STORIES_PERSIST);
    set({ ...EMPTY_STORIES });
  },

  saveStep: (storyId, stepIndex, results, xpEarned) => {
    const story = getStory(storyId);
    if (!story) return;
    const state = get();
    const reached = scenesReached(story, stepIndex).filter((id) => !state.completedScenes.includes(id));
    set({
      run: { storyId, stepIndex, results: [...results], xpEarned, updatedAt: new Date().toISOString() },
      completedScenes: reached.length ? [...state.completedScenes, ...reached] : state.completedScenes,
    });
  },

  learnLessons: (storyId) => {
    const story = getStory(storyId);
    if (!story) return 0;
    const fresh = story.lessons.filter((l) => !get().learnedLessons.includes(l.id));
    if (fresh.length === 0) return 0;
    // Feature store first, so the badge metrics (Sabr Champion) see the new lessons.
    set({ learnedLessons: [...get().learnedLessons, ...fresh.map((l) => l.id)] });
    const app = useAppStore.getState();
    return fresh.reduce((sum, lesson) => sum + app.awardXp(lessonXpReason(lesson.id), XP.storyLessonLearned), 0);
  },

  completeStory: (storyId, results) => {
    const story = getStory(storyId);
    if (!story) return null;
    const score = scoreQuiz(results);
    const perfect = isPerfect(results);
    const state = get();
    const before = state.stories[storyId];
    const firstCompletion = !before?.completed;
    const missingScenes = story.scenes.map((s) => s.id).filter((id) => !state.completedScenes.includes(id));
    set({
      run: null,
      completedScenes: [...state.completedScenes, ...missingScenes],
      perfectStories: perfect && !state.perfectStories.includes(storyId) ? [...state.perfectStories, storyId] : state.perfectStories,
      stories: {
        ...state.stories,
        [storyId]: {
          completed: true,
          attempts: (before?.attempts ?? 0) + 1,
          bestStars: Math.max(before?.bestStars ?? 0, score.stars),
          bestScore: Math.max(before?.bestScore ?? 0, score.percent),
          completedAt: new Date().toISOString(),
        },
      },
    });
    const app = useAppStore.getState();
    const lines: StoryOutcome['lines'] = [];
    const completeXp = app.awardXp(storyXpReason(storyId, 'complete'), XP.storyComplete);
    if (completeXp > 0) lines.push({ kind: 'storyComplete', xp: completeXp });
    if (perfect) {
      const bonus = app.awardXp(storyXpReason(storyId, 'perfect'), XP.perfectStoryBonus);
      if (bonus > 0) lines.push({ kind: 'perfectBonus', xp: bonus });
    }
    app.registerActivity();
    const questXp = app.reportQuestEvent({ type: 'complete', target: storyTarget(storyId) });
    if (questXp > 0) lines.push({ kind: 'quest', xp: questXp });
    return { score, firstCompletion, perfect, xp: lines.reduce((sum, l) => sum + l.xp, 0), lines };
  },
}));

/** Persists stories progress after changes (debounced). */
export function startStoriesAutoSave(): () => void {
  return autoSave(useStoriesStore, STORIES_PERSIST, (s) => (s.hydrated ? pick(s) : undefined));
}
