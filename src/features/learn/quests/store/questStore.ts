import { create } from 'zustand';

import type { QuizScore } from '@/core/services/quiz';
import { XP } from '@/core/services/xp';
import { autoSave, clearPersisted, loadPersisted, type PersistSpec, storageKey } from '@/core/storage';
import { useAppStore } from '@/core/store/appStore';
import { getSurah } from '@/features/quran';

import { migrateQuestDataV1, migrateQuestDataV2 } from '../../sufara/migrate';
import type { QuestData } from '../models';
import { applyMemorizationTest, memorizationOf, setAyahsLearned } from '../services/memorization';
import { applyQuestComplete, EMPTY_QUEST_DATA, sanitizeQuestData, toggleInList, toggleRamadanDeed } from '../services/progress';
import { QUEST_PREFIX } from '../services/questions';

export const QUEST_VERSION = 3;

/** `ilmjourney:quest` – islam-quest progress (quests, lessons, memorization, duas, tracing, Ramadan deeds). */
export const QUEST_PERSIST: PersistSpec<QuestData> = {
  key: storageKey('quest'),
  version: QUEST_VERSION,
  migrations: { 1: migrateQuestDataV1, 2: migrateQuestDataV2 },
  sanitize: sanitizeQuestData,
};

/** Keys used with the core (see docs/FEATURE-PORTING.md "Keys and naming"). */
export const questTarget = (questId: string) => `${QUEST_PREFIX}:${questId}`;
export const questXpReason = (questId: string, event: 'complete' | 'perfect') => `${QUEST_PREFIX}:${questId}:${event}`;
export const lessonXpReason = (lessonId: string) => `${QUEST_PREFIX}:lesson:${lessonId}:read`;

export type RewardLineKind = 'questComplete' | 'perfectBonus' | 'quests';

export interface QuestOutcome {
  score: QuizScore;
  firstCompletion: boolean;
  perfect: boolean;
  /** XP granted by completion, perfect bonus and today's quests (answer/lesson XP is counted by the player). */
  xp: number;
  lines: { kind: RewardLineKind; xp: number }[];
}

interface QuestStore extends QuestData {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  reset: () => Promise<void>;
  /** Marks a lesson as read; returns the XP granted (only the first time). */
  completeLesson: (lessonId: string) => number;
  completeQuest: (questId: string, results: readonly boolean[]) => QuestOutcome;
  practiseRecite: (surahNumber: number) => void;
  setAyahLearned: (surahNumber: number, ayah: number, learned: boolean) => void;
  recordMemorizationTest: (surahNumber: number, knownAyahs: readonly number[]) => void;
  toggleDuaLearned: (duaId: string) => void;
  toggleDuaFavourite: (duaId: string) => void;
  markLetterTraced: (letter: string) => void;
  toggleRamadanDeed: (day: number, deedId: string) => void;
}

export const pickQuestData = (s: QuestData): QuestData => ({
  quests: s.quests,
  completedLessons: s.completedLessons,
  perfectQuests: s.perfectQuests,
  recitePractice: s.recitePractice,
  memorization: s.memorization,
  duasLearned: s.duasLearned,
  duasFavourite: s.duasFavourite,
  tracedLetters: s.tracedLetters,
  ramadanDeeds: s.ramadanDeeds,
});

export const useQuestStore = create<QuestStore>((set, get) => ({
  ...EMPTY_QUEST_DATA,
  hydrated: false,

  hydrate: async () => {
    const stored = await loadPersisted(QUEST_PERSIST);
    set({ ...(stored ?? EMPTY_QUEST_DATA), hydrated: true });
  },

  reset: async () => {
    await clearPersisted(QUEST_PERSIST);
    set({ ...EMPTY_QUEST_DATA });
  },

  completeLesson: (lessonId) => {
    const first = !get().completedLessons.includes(lessonId);
    // Feature store first, then the core (badges read our metrics).
    if (first) set({ completedLessons: [...get().completedLessons, lessonId] });
    const app = useAppStore.getState();
    const xp = app.awardXp(lessonXpReason(lessonId), XP.questLesson);
    // Reading a lesson is meaningful learning (as in islam-quest) and keeps the streak alive.
    app.registerActivity();
    return xp;
  },

  completeQuest: (questId, results) => {
    const completion = applyQuestComplete(pickQuestData(get()), questId, results, new Date().toISOString());
    set(completion.data);
    const app = useAppStore.getState();
    const lines: QuestOutcome['lines'] = [];
    const complete = app.awardXp(questXpReason(questId, 'complete'), XP.questComplete);
    if (complete > 0) lines.push({ kind: 'questComplete', xp: complete });
    if (completion.perfect) {
      const bonus = app.awardXp(questXpReason(questId, 'perfect'), XP.perfectQuestBonus);
      if (bonus > 0) lines.push({ kind: 'perfectBonus', xp: bonus });
    }
    app.registerActivity();
    const questXp = app.reportQuestEvent({ type: 'complete', target: questTarget(questId) });
    if (questXp > 0) lines.push({ kind: 'quests', xp: questXp });
    return {
      score: completion.score,
      firstCompletion: completion.firstCompletion,
      perfect: completion.perfect,
      xp: lines.reduce((sum, l) => sum + l.xp, 0),
      lines,
    };
  },

  practiseRecite: (surahNumber) => {
    const key = String(surahNumber);
    set({ recitePractice: { ...get().recitePractice, [key]: (get().recitePractice[key] ?? 0) + 1 } });
  },

  setAyahLearned: (surahNumber, ayah, learned) => {
    const surah = getSurah(surahNumber);
    if (!surah) return;
    const memo = setAyahsLearned(memorizationOf(get(), surahNumber), surah, [ayah], learned, new Date().toISOString());
    set({ memorization: { ...get().memorization, [String(surahNumber)]: memo } });
  },

  recordMemorizationTest: (surahNumber, knownAyahs) => {
    const surah = getSurah(surahNumber);
    if (!surah) return;
    const memo = applyMemorizationTest(memorizationOf(get(), surahNumber), surah, knownAyahs, new Date().toISOString());
    set({ memorization: { ...get().memorization, [String(surahNumber)]: memo } });
    // A finished self-test is meaningful learning (streak).
    useAppStore.getState().registerActivity();
  },

  toggleDuaLearned: (duaId) => set({ duasLearned: toggleInList(get().duasLearned, duaId) }),
  toggleDuaFavourite: (duaId) => set({ duasFavourite: toggleInList(get().duasFavourite, duaId) }),

  markLetterTraced: (letter) => {
    if (!get().tracedLetters.includes(letter)) set({ tracedLetters: [...get().tracedLetters, letter] });
  },

  toggleRamadanDeed: (day, deedId) => set({ ramadanDeeds: toggleRamadanDeed(get().ramadanDeeds, day, deedId) }),
}));

/** Persists quest progress after changes (debounced). */
export function startQuestAutoSave(): () => void {
  return autoSave(useQuestStore, QUEST_PERSIST, (s) => (s.hydrated ? pickQuestData(s) : undefined));
}
