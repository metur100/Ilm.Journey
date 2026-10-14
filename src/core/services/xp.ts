/**
 * XP rewards. XP comes from educational activity only and every reward is granted once per item
 * (`recordAnswer` once per question key, `awardXp` once per reason key), so repeating content or
 * tapping through answers cannot farm XP.
 *
 * Core grants `correctAnswer`, `reviewCorrect` and `dailyChallenge` itself. The other amounts are the
 * values of the source apps; features pass them to `awardXp(reason, amount)`.
 */
export const XP = {
  // core
  correctAnswer: 10,
  reviewCorrect: 5,
  dailyChallenge: 25,
  // learn – knowledge-rpg units and master challenges
  unitComplete: 30,
  perfectBonus: 10,
  masterPassed: 100,
  // learn – islam-quest beginner quests
  questLesson: 30,
  questComplete: 20,
  perfectQuestBonus: 10,
  // stories
  storyLessonLearned: 5,
  storyComplete: 50,
  perfectStoryBonus: 20,
  // seerah (sira had no XP; episodes are worth about a unit)
  episodeComplete: 40,
  perfectEpisodeQuizBonus: 10,
  // v2 mini-games (core/games): once per game level, plus a one-time bonus for a perfect level
  gameLevel: 15,
  gamePerfectBonus: 5,
} as const;

export interface LevelInfo {
  level: number;
  /** XP collected inside the current level. */
  xpIntoLevel: number;
  /** XP needed to go from the current level to the next one. */
  xpForNextLevel: number;
  /** 0..1 progress towards the next level. */
  progress: number;
  totalXp: number;
}

/** XP needed to go from `level` to `level + 1`: 100, 150, 200, … */
export function xpToAdvance(level: number): number {
  return 100 + (Math.max(1, level) - 1) * 50;
}

/** Total XP needed to reach `level` from level 1. */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpToAdvance(l);
  return total;
}

export function levelInfo(totalXp: number): LevelInfo {
  const xp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  let remaining = xp;
  while (remaining >= xpToAdvance(level)) {
    remaining -= xpToAdvance(level);
    level++;
  }
  const needed = xpToAdvance(level);
  return {
    level,
    xpIntoLevel: remaining,
    xpForNextLevel: needed,
    progress: remaining / needed,
    totalXp: xp,
  };
}

export function levelFromXp(totalXp: number): number {
  return levelInfo(totalXp).level;
}
