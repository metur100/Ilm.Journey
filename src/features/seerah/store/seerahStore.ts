import { create } from 'zustand';

import type { QuizScore } from '@/core/services/quiz';
import { XP } from '@/core/services/xp';
import { autoSave, clearPersisted, loadPersisted, type PersistSpec, storageKey } from '@/core/storage';
import { useAppStore } from '@/core/store/appStore';

import { EPISODES, EVENTS, PEOPLE, PLACES } from '../content';
import type { BookmarkType, DiscoveryType, EpisodeStep, SeerahData } from '../models';
import {
  applyDiscover,
  applyEpisodeComplete,
  applyEpisodeStep,
  applyReflection,
  applyToggleBookmark,
  createEmptySeerah,
  type ReflectionInput,
  sanitizeSeerahData,
  SEERAH_XP,
} from '../services/engine';
import type { ContentCounts } from '../services/progress';

export const SEERAH_VERSION = 1;

export const SEERAH_PERSIST: PersistSpec<SeerahData> = {
  key: storageKey('seerah'),
  version: SEERAH_VERSION,
  migrations: {},
  sanitize: sanitizeSeerahData,
};

export const CONTENT_COUNTS: ContentCounts = {
  episodes: EPISODES,
  events: EVENTS.length,
  people: PEOPLE.length,
  places: PLACES.length,
};

/** Quest-of-the-day / completion target of an episode. */
export const episodeTarget = (episodeId: string) => `seerah:episode:${episodeId}`;
/** XP reason keys (idempotent per item). */
export const xpReason = {
  complete: (episodeId: string) => `seerah:${episodeId}:complete`,
  perfect: (episodeId: string) => `seerah:${episodeId}:perfect`,
  discovery: (type: DiscoveryType, id: string) => `seerah:discover:${type}:${id}`,
  reflection: (questionId: string) => `seerah:reflection:${questionId}`,
};

export interface EpisodeOutcome {
  score: QuizScore;
  firstCompletion: boolean;
  perfect: boolean;
  /** XP from completion, perfect bonus and quests (answer XP is counted by the screen). */
  xp: number;
}

interface SeerahStore extends SeerahData {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  reset: () => Promise<void>;
  setEpisodeStep: (episodeId: string, step: EpisodeStep) => void;
  completeEpisode: (episodeId: string, results: readonly boolean[]) => EpisodeOutcome;
  /** Records discoveries; returns the XP granted for new ones. */
  discover: (type: DiscoveryType, ids: readonly string[]) => number;
  toggleBookmark: (type: BookmarkType, id: string) => void;
  /** Saves (or with empty input removes) a reflection; returns the XP granted. */
  saveReflection: (input: ReflectionInput) => number;
}

export const pickSeerah = (s: SeerahData): SeerahData => ({
  episodes: s.episodes,
  lastEpisodeId: s.lastEpisodeId,
  quizResults: s.quizResults,
  perfectEpisodes: s.perfectEpisodes,
  bookmarks: s.bookmarks,
  reflections: s.reflections,
  discovered: s.discovered,
});

export const useSeerahStore = create<SeerahStore>((set, get) => ({
  ...createEmptySeerah(),
  hydrated: false,

  hydrate: async () => {
    const stored = await loadPersisted(SEERAH_PERSIST);
    set({ ...(stored ?? createEmptySeerah()), hydrated: true });
  },

  reset: async () => {
    await clearPersisted(SEERAH_PERSIST);
    set({ ...createEmptySeerah() });
  },

  setEpisodeStep: (episodeId, step) => {
    const before = pickSeerah(get());
    const next = applyEpisodeStep(before, episodeId, step, new Date());
    if (next !== before) set(next);
  },

  completeEpisode: (episodeId, results) => {
    const { data, score, firstCompletion, perfect } = applyEpisodeComplete(pickSeerah(get()), episodeId, results, new Date());
    // Feature store first, so the badge metrics see the new progress.
    set(data);
    const app = useAppStore.getState();
    let xp = app.awardXp(xpReason.complete(episodeId), XP.episodeComplete);
    if (perfect) xp += app.awardXp(xpReason.perfect(episodeId), XP.perfectEpisodeQuizBonus);
    app.registerActivity();
    xp += app.reportQuestEvent({ type: 'complete', target: episodeTarget(episodeId) });
    app.refreshBadges();
    return { score, firstCompletion, perfect, xp };
  },

  discover: (type, ids) => {
    let data = pickSeerah(get());
    const now = new Date();
    const fresh: string[] = [];
    for (const id of ids) {
      const result = applyDiscover(data, type, id, now);
      data = result.data;
      if (result.isNew) fresh.push(id);
    }
    if (fresh.length === 0) return 0;
    set(data);
    const app = useAppStore.getState();
    let xp = 0;
    for (const id of fresh) xp += app.awardXp(xpReason.discovery(type, id), SEERAH_XP.discovery);
    app.refreshBadges();
    return xp;
  },

  toggleBookmark: (type, id) => set(applyToggleBookmark(pickSeerah(get()), type, id, new Date())),

  saveReflection: (input) => {
    const { data, isNew } = applyReflection(pickSeerah(get()), input, new Date());
    set(data);
    const app = useAppStore.getState();
    const xp = isNew ? app.awardXp(xpReason.reflection(input.questionId), SEERAH_XP.reflection) : 0;
    app.refreshBadges();
    return xp;
  },
}));

/** Persists Seerah progress after changes (debounced). */
export function startSeerahAutoSave(): () => void {
  return autoSave(useSeerahStore, SEERAH_PERSIST, (s) => (s.hydrated ? pickSeerah(s) : undefined));
}
