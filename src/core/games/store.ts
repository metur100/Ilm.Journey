import { create } from 'zustand';

import { useGardenStore } from '../garden/store';
import { type CollectionCard, questionKey } from '../models';
import { collectAchievements, getCollectionCards } from '../registry';
import { XP } from '../services/xp';
import { autoSave, clearPersisted, loadPersisted, type PersistSpec, storageKey } from '../storage';
import { useAppStore } from '../store/appStore';
import {
  applyLevelResult,
  EMPTY_GAME_PROGRESS,
  EMPTY_GAMES,
  type GamesData,
  isPerfect,
  sanitizeGames,
} from './progress';
import { findFact, gameLevelKey, gameTarget, getGame } from './registry';
import type { GameLevel, GameResultInput } from './types';

export const GAMES_PERSIST: PersistSpec<GamesData> = {
  key: storageKey('games'),
  version: 1,
  migrations: {},
  sanitize: sanitizeGames,
};

/** Everything the result screen shows after a level. */
export interface LevelSummary {
  stars: 1 | 2 | 3;
  bestStars: number;
  bestScore: number;
  score: number;
  maxScore: number;
  perfect: boolean;
  firstCompletion: boolean;
  newBest: boolean;
  /** XP granted now (0 when the level was already rewarded – XP once per level, perfect bonus once). */
  xp: number;
  seeds: number;
  water: number;
  /** Collection cards unlocked by this play. */
  newCards: CollectionCard[];
  /** Review keys queued for missed facts. */
  reviewKeys: string[];
}

export interface GamesStore extends GamesData {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  reset: () => Promise<void>;
  setChallengeMode: (on: boolean) => void;
  markIntroSeen: (gameId: string) => void;
  /**
   * Records a finished level and hands out the rewards, in this order: game progress → XP (`game:<id>:<level>` once,
   * perfect bonus once) → activity (streak, water) → quest events (seeds via the garden milestone, "play today's
   * game" quest) → review items for missed facts. Returns the summary for the result screen.
   */
  completeLevel: (gameId: string, level: GameLevel, result: GameResultInput, now?: Date) => LevelSummary;
}

const pick = (s: GamesData): GamesData => ({ games: s.games, challengeMode: s.challengeMode });

export const useGamesStore = create<GamesStore>((set, get) => ({
  ...EMPTY_GAMES,
  hydrated: false,

  hydrate: async () => {
    const stored = await loadPersisted(GAMES_PERSIST);
    set({ ...(stored ?? EMPTY_GAMES), hydrated: true });
  },

  reset: async () => {
    await clearPersisted(GAMES_PERSIST);
    set({ ...EMPTY_GAMES });
  },

  setChallengeMode: (on) => set({ challengeMode: on }),

  markIntroSeen: (gameId) => {
    const game = get().games[gameId] ?? EMPTY_GAME_PROGRESS;
    if (game.introSeen) return;
    set({ games: { ...get().games, [gameId]: { ...game, introSeen: true } } });
  },

  completeLevel: (gameId, level, result, now = new Date()) => {
    const def = getGame(gameId);
    const cardsBefore = collectAchievements();
    const gardenBefore = useGardenStore.getState();
    const seedsBefore = gardenBefore.seedsEarned;
    const waterBefore = gardenBefore.waterEarned;

    // 1. Feature (game) progress first – badges and achievements read it.
    const outcome = applyLevelResult(pick(get()), gameId, level, result, now.toISOString());
    set(outcome.data);

    // 2. XP once per level (+ one-time perfect bonus), activity, quest events.
    const app = useAppStore.getState();
    const perfect = isPerfect(result);
    let xp = app.awardXp(gameLevelKey(gameId, level), XP.gameLevel);
    if (perfect) xp += app.awardXp(`${gameLevelKey(gameId, level)}:perfect`, XP.gamePerfectBonus);
    app.registerActivity();
    xp += app.reportQuestEvent({ type: 'complete', target: gameLevelKey(gameId, level) });
    xp += app.reportQuestEvent({ type: 'complete', target: gameTarget(gameId) });

    // 3. Missed facts → review queue (`game:<id>:<factId>`, or the fact's existing question key).
    const reviewKeys: string[] = [];
    for (const factId of new Set(result.factsMissed)) {
      const fact = def ? findFact(def, factId) : undefined;
      if (!def || !fact) continue;
      const key = fact.reviewKey ?? questionKey('game', `${gameId}:${fact.id}`);
      app.queueReview({ key, topic: `game:${gameId}`, topicArea: def.topicId });
      reviewKeys.push(key);
    }

    const cardsAfter = collectAchievements();
    const newCards = getCollectionCards().filter((c) => cardsAfter.has(c.unlock) && !cardsBefore.has(c.unlock));
    const garden = useGardenStore.getState();
    return {
      stars: outcome.stars,
      bestStars: outcome.bestStars,
      bestScore: outcome.bestScore,
      score: result.score,
      maxScore: result.maxScore,
      perfect,
      firstCompletion: outcome.firstCompletion,
      newBest: outcome.newBest,
      xp,
      seeds: garden.seedsEarned - seedsBefore,
      water: garden.waterEarned - waterBefore,
      newCards,
      reviewKeys,
    };
  },
}));

export function startGamesAutoSave(): () => void {
  return autoSave(useGamesStore, GAMES_PERSIST, (s) => (s.hydrated ? pick(s) : undefined));
}
