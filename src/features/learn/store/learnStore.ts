import { create } from 'zustand';

import { isTopicId, type TopicId } from '@/core/models';
import { isPerfect, type QuizScore, scoreQuiz } from '@/core/services/quiz';
import { XP } from '@/core/services/xp';
import { autoSave, clearPersisted, loadPersisted, type PersistSpec, storageKey, withDefaults } from '@/core/storage';
import { useAppStore } from '@/core/store/appStore';

import type { LearnData } from '../models';
import { EMPTY_LEARN, masterPassed } from '../services/progression';
import { migrateLearnDataV1 } from '../sufara/migrate';

export const LEARN_VERSION = 2;

/** Sanitizes stored learn progress (wrong shapes fall back to defaults). */
export function sanitizeLearnData(raw: unknown): LearnData | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = withDefaults(EMPTY_LEARN, raw);
  data.masters = Object.fromEntries(Object.entries(data.masters).filter(([topic]) => isTopicId(topic)));
  data.perfectUnits = data.perfectUnits.filter((id) => typeof id === 'string');
  if (data.lastVisited && (!isTopicId(data.lastVisited.topic) || typeof data.lastVisited.itemId !== 'string')) data.lastVisited = null;
  return data;
}

export const LEARN_PERSIST: PersistSpec<LearnData> = {
  key: storageKey('learn'),
  version: LEARN_VERSION,
  migrations: { 1: migrateLearnDataV1 },
  sanitize: sanitizeLearnData,
};

/** Quest-of-the-day / completion targets reported to the global store. */
export const unitTarget = (unitId: string) => `learn:unit:${unitId}`;
export const masterTarget = (topic: TopicId) => `learn:master:${topic}`;

export interface UnitOutcome {
  score: QuizScore;
  firstCompletion: boolean;
  /** XP from completion, perfect bonus and quests (answer XP is counted by the screen). */
  xp: number;
}

export interface MasterOutcome {
  score: QuizScore;
  passed: boolean;
  firstPass: boolean;
  xp: number;
}

interface LearnStore extends LearnData {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  reset: () => Promise<void>;
  /** Remembers the opened path item for "Continue". */
  visit: (topic: TopicId, itemId: string) => void;
  completeUnit: (unitId: string, topic: TopicId, results: readonly boolean[]) => UnitOutcome;
  completeMaster: (topic: TopicId, results: readonly boolean[]) => MasterOutcome;
}

const pick = (s: LearnData): LearnData => ({ units: s.units, masters: s.masters, perfectUnits: s.perfectUnits, lastVisited: s.lastVisited });

export const useLearnStore = create<LearnStore>((set, get) => ({
  ...EMPTY_LEARN,
  hydrated: false,

  hydrate: async () => {
    const stored = await loadPersisted(LEARN_PERSIST);
    set({ ...(stored ?? EMPTY_LEARN), hydrated: true });
  },

  reset: async () => {
    await clearPersisted(LEARN_PERSIST);
    set({ ...EMPTY_LEARN });
  },

  visit: (topic, itemId) => set({ lastVisited: { topic, itemId, at: new Date().toISOString() } }),

  completeUnit: (unitId, topic, results) => {
    const score = scoreQuiz(results);
    const before = get().units[unitId];
    const firstCompletion = !before?.completed;
    const perfect = isPerfect(results);
    const nowIso = new Date().toISOString();
    // Update the feature store first so badge metrics see the new progress.
    set({
      units: {
        ...get().units,
        [unitId]: {
          completed: true,
          attempts: (before?.attempts ?? 0) + 1,
          bestScore: Math.max(before?.bestScore ?? 0, score.percent),
          completedAt: before?.completedAt ?? nowIso,
        },
      },
      perfectUnits: perfect && !get().perfectUnits.includes(unitId) ? [...get().perfectUnits, unitId] : get().perfectUnits,
      lastVisited: { topic, itemId: unitId, at: nowIso },
    });
    const app = useAppStore.getState();
    let xp = app.awardXp(`learn:unit:${unitId}:complete`, XP.unitComplete);
    if (perfect) xp += app.awardXp(`learn:unit:${unitId}:perfect`, XP.perfectBonus);
    app.registerActivity();
    xp += app.reportQuestEvent({ type: 'complete', target: unitTarget(unitId) });
    return { score, firstCompletion, xp };
  },

  completeMaster: (topic, results) => {
    const score = scoreQuiz(results);
    const passed = masterPassed(score.percent, score.total);
    const before = get().masters[topic];
    const firstPass = passed && !before?.passed;
    const nowIso = new Date().toISOString();
    set({
      masters: {
        ...get().masters,
        [topic]: {
          passed: passed || before?.passed === true,
          attempts: (before?.attempts ?? 0) + 1,
          bestScore: Math.max(before?.bestScore ?? 0, score.percent),
          passedAt: before?.passedAt ?? (passed ? nowIso : undefined),
        },
      },
      lastVisited: { topic, itemId: `master-${topic}`, at: nowIso },
    });
    const app = useAppStore.getState();
    let xp = 0;
    if (passed) xp += app.awardXp(`learn:master:${topic}:passed`, XP.masterPassed);
    app.registerActivity();
    if (passed) xp += app.reportQuestEvent({ type: 'complete', target: masterTarget(topic) });
    return { score, passed, firstPass, xp };
  },
}));

/** Persists learn progress after changes (debounced). */
export function startLearnAutoSave(): () => void {
  return autoSave(useLearnStore, LEARN_PERSIST, (s) => (s.hydrated ? pick(s) : undefined));
}
