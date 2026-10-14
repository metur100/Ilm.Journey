import { create } from 'zustand';

import { earn } from '../garden/earn';
import { milestoneFromTarget, streakMilestone } from '../garden/rules';
import type { AnswerMode, AnswerRef, AppData, Celebration, Character, Language, LearnerGroup, Profile, QuestEvent, Settings } from '../models';
import { collectFeatureMetrics, getQuestCandidates, hydrateFeatures, resetFeatures } from '../registry';
import {
  applyActivity,
  applyAnswer,
  applyAwardXp,
  applyDailyComplete,
  applyQuestEvent,
  applyQueueReview,
  applyReviewSessionComplete,
  APP_DATA_VERSION,
  createInitialData,
  ensureQuests,
  finalizeBadges,
  sanitizeAppData,
} from '../services/engine';
import { autoSave, clearPersisted, loadPersisted, type PersistSpec, storageKey } from '../storage';
import { toDayKey } from '../utils/date';

/** Persistence of the global store. */
export const APP_PERSIST: PersistSpec<AppData> = {
  key: storageKey('app'),
  version: APP_DATA_VERSION,
  sanitize: sanitizeAppData,
};

const DATA_KEYS = Object.keys(createInitialData()) as (keyof AppData)[];

export interface AppActions {
  /** Loads the global store and every registered feature store. Call once at app start. */
  hydrate: (deviceLanguage: Language) => Promise<void>;
  /** Regenerates today's quests when the day changed (or always with `force`). */
  refreshQuests: (force?: boolean) => void;
  /** Re-evaluates badges – call after feature progress changed without an XP award. */
  refreshBadges: () => void;
  completeOnboarding: (input: { name: string; character: Character; language: Language; learnerGroup: LearnerGroup }) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  /**
   * Records an answer to any question of any feature. Returns the XP granted (once per key, plus
   * quest XP). Practice answers are ignored. Mistakes enter the global review queue.
   */
  recordAnswer: (ref: AnswerRef, correct: boolean, mode: AnswerMode) => number;
  /** Grants XP once per reason key (idempotent). Returns the XP granted (0 when already granted). */
  awardXp: (reason: string, amount: number) => number;
  /** Meaningful learning happened today (finishing a lesson, story, episode …) – keeps the streak. */
  registerActivity: () => void;
  /** Reports a quest event, e.g. `{ type: 'complete', target: 'stories:story:adam' }`. Returns quest XP. */
  reportQuestEvent: (event: QuestEvent) => number;
  /**
   * Puts a question into the review queue without scoring it (no stats, no XP) – e.g. a game fact the learner
   * missed (`game:<gameId>:<factId>`, resolved through the registry like any other question key).
   */
  queueReview: (ref: AnswerRef) => void;
  completeDaily: (day: string) => number;
  completeReviewSession: () => void;
  /** Deletes all progress (global + every feature via registered resets). Settings are kept. */
  resetProgress: () => Promise<void>;
  dismissCelebration: () => void;
  setCelebrationsPaused: (paused: boolean) => void;
}

export interface AppStore extends AppData, AppActions {
  hydrated: boolean;
  /** Queued badge unlocks and level-ups, shown one at a time by CelebrationOverlay. */
  celebrations: Celebration[];
  /** While true (e.g. inside a unit or story), queued celebrations wait instead of interrupting. */
  celebrationsPaused: boolean;
}

/** The persisted part of the store. */
export function selectData(state: AppData): AppData {
  const data = {} as Record<string, unknown>;
  for (const key of DATA_KEYS) data[key] = state[key];
  return data as unknown as AppData;
}

export const useAppStore = create<AppStore>((set, get) => {
  /** Applies badges and queues celebrations (new badges, level-ups) after every step. */
  const commit = (next: AppData) => {
    const before = get();
    // Garden: every 7-day stretch of the streak plants seeds (see core/garden/earn.ts).
    if (next.streak !== before.streak) {
      const streak = streakMilestone(next.streak.current);
      if (streak) earn(streak);
    }
    const { data, newBadges } = finalizeBadges(next, collectFeatureMetrics(), new Date());
    const celebrations: Celebration[] = [
      ...before.celebrations,
      ...(data.level > before.level ? [{ kind: 'level' as const, level: data.level, from: before.level }] : []),
      ...newBadges.map((id) => ({ kind: 'badge' as const, id })),
    ];
    set({ ...data, celebrations });
  };

  /** Meaningful learning waters the garden (a few drops per day, see EARN_TABLE / DAILY_WATER_CAP). */
  const learned = () => earn({ type: 'activity' });

  return {
    ...createInitialData('en'),
    hydrated: false,
    celebrations: [],
    celebrationsPaused: false,

    hydrate: async (deviceLanguage) => {
      const [stored] = await Promise.all([loadPersisted(APP_PERSIST), hydrateFeatures()]);
      set({ ...(stored ?? createInitialData(deviceLanguage)), hydrated: true });
      get().refreshQuests();
      // Badges silently catch up (e.g. after an update added a badge) without a celebration burst.
      const { data } = finalizeBadges(selectData(get()), collectFeatureMetrics(), new Date());
      set({ badges: data.badges });
    },

    refreshQuests: (force = false) => {
      const day = toDayKey(new Date());
      const current = selectData(get());
      const next = ensureQuests(current, day, getQuestCandidates({ day }), force);
      if (next !== current) set({ questDay: next.questDay, quests: next.quests });
    },

    refreshBadges: () => commit(selectData(get())),

    completeOnboarding: ({ name, character, language, learnerGroup }) => {
      const state = get();
      set({
        onboarded: true,
        profile: { ...state.profile, name: name.trim(), character, learnerGroup },
        settings: { ...state.settings, language },
      });
      get().refreshQuests(true);
    },

    updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

    updateProfile: (patch) => {
      const profile = { ...get().profile, ...patch };
      set({ profile: { ...profile, name: profile.name.trim() } });
    },

    recordAnswer: (ref, correct, mode) => {
      const { data, xp } = applyAnswer(selectData(get()), ref, correct, mode, new Date());
      commit(data);
      if (mode !== 'practice') learned();
      return xp;
    },

    awardXp: (reason, amount) => {
      const { data, xp } = applyAwardXp(selectData(get()), reason, amount);
      commit(data);
      return xp;
    },

    registerActivity: () => {
      commit(applyActivity(selectData(get()), new Date()));
      learned();
    },

    reportQuestEvent: (event) => {
      const { data, xp } = applyQuestEvent(selectData(get()), event);
      commit(data);
      // Completing a unit, master, quest, story, episode or game level plants seeds once (core/garden/earn.ts).
      const milestone = event.type === 'complete' ? milestoneFromTarget(event.target) : null;
      if (milestone) earn(milestone);
      return xp;
    },

    queueReview: (ref) => commit(applyQueueReview(selectData(get()), ref, new Date())),

    completeDaily: (day) => {
      const { data, xp } = applyDailyComplete(selectData(get()), day, new Date());
      commit(data);
      learned();
      return xp;
    },

    completeReviewSession: () => {
      commit(applyReviewSessionComplete(selectData(get()), new Date()));
      learned();
    },

    resetProgress: async () => {
      const settings = get().settings;
      await clearPersisted(APP_PERSIST);
      await resetFeatures();
      set({ ...createInitialData(settings.language), settings, celebrations: [], celebrationsPaused: false });
    },

    dismissCelebration: () => set({ celebrations: get().celebrations.slice(1) }),
    setCelebrationsPaused: (paused) => set({ celebrationsPaused: paused }),
  };
});

/** Persists the global store shortly after every change of its data (debounced). */
export function startAppAutoSave(): () => void {
  return autoSave(useAppStore, APP_PERSIST, (s) => (s.hydrated ? selectData(s) : undefined));
}
