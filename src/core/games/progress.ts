import type { GameLevel, GameResultInput } from './types';

/** Progress of one level. */
export interface GameLevelProgress {
  /** Best stars (1–3) – a worse replay never lowers it. */
  stars: number;
  bestScore: number;
  maxScore: number;
  plays: number;
  firstCompletedAt: string;
  lastPlayed: string;
}

export interface GameProgress {
  levels: Partial<Record<`${GameLevel}`, GameLevelProgress>>;
  plays: number;
  lastPlayed: string | null;
  /** The intro + how-to were shown once (later visits open the level select directly). */
  introSeen: boolean;
}

/** Persisted game progress (`ilmjourney:games`). */
export interface GamesData {
  games: Record<string, GameProgress>;
  /** Learner opted into Challenge mode (timers allowed). */
  challengeMode: boolean;
}

export const EMPTY_GAMES: GamesData = { games: {}, challengeMode: false };

export const EMPTY_GAME_PROGRESS: GameProgress = { levels: {}, plays: 0, lastPlayed: null, introSeen: false };

export function clampStars(stars: number): 1 | 2 | 3 {
  if (!Number.isFinite(stars)) return 1;
  return Math.max(1, Math.min(3, Math.round(stars))) as 1 | 2 | 3;
}

/** A perfect level: no mistakes, full score and no missed facts. */
export function isPerfect(result: GameResultInput): boolean {
  return result.mistakes === 0 && result.score >= result.maxScore && result.factsMissed.length === 0;
}

export interface LevelOutcome {
  data: GamesData;
  stars: 1 | 2 | 3;
  /** Best stars after this play. */
  bestStars: number;
  bestScore: number;
  firstCompletion: boolean;
  newBest: boolean;
}

/** Records a finished level (pure): best stars/score kept, plays counted. */
export function applyLevelResult(data: GamesData, gameId: string, level: GameLevel, result: GameResultInput, nowIso: string): LevelOutcome {
  const stars = clampStars(result.stars);
  const game = data.games[gameId] ?? EMPTY_GAME_PROGRESS;
  const key = `${level}` as const;
  const previous = game.levels[key];
  const score = Math.max(0, Math.floor(result.score));
  const next: GameLevelProgress = {
    stars: Math.max(previous?.stars ?? 0, stars),
    bestScore: Math.max(previous?.bestScore ?? 0, score),
    maxScore: Math.max(0, Math.floor(result.maxScore)),
    plays: (previous?.plays ?? 0) + 1,
    firstCompletedAt: previous?.firstCompletedAt ?? nowIso,
    lastPlayed: nowIso,
  };
  return {
    data: {
      ...data,
      games: { ...data.games, [gameId]: { ...game, levels: { ...game.levels, [key]: next }, plays: game.plays + 1, lastPlayed: nowIso, introSeen: true } },
    },
    stars,
    bestStars: next.stars,
    bestScore: next.bestScore,
    firstCompletion: !previous,
    newBest: !!previous && (score > previous.bestScore || stars > previous.stars),
  };
}

export function levelProgress(data: GamesData, gameId: string, level: GameLevel): GameLevelProgress | undefined {
  return data.games[gameId]?.levels[`${level}`];
}

/** Level 1 is always open; every further level opens when the previous one was completed. */
export function isLevelUnlocked(data: GamesData, gameId: string, level: GameLevel): boolean {
  return level === 1 || !!levelProgress(data, gameId, (level - 1) as GameLevel);
}

/** Sum of best stars over the levels of a game. */
export function totalStars(data: GamesData, gameId: string): number {
  return Object.values(data.games[gameId]?.levels ?? {}).reduce((sum, l) => sum + (l?.stars ?? 0), 0);
}

/** "New" marker on the shelf: never played. */
export function isNewGame(data: GamesData, gameId: string): boolean {
  return !data.games[gameId] || data.games[gameId].plays === 0;
}

/** Achievement keys `game:<id>:<level>` of every completed level. */
export function gameAchievements(data: GamesData): string[] {
  return Object.entries(data.games).flatMap(([id, g]) => Object.keys(g.levels).map((level) => `game:${id}:${level}`));
}

/** Repairs stored game progress. */
export function sanitizeGames(raw: unknown): GamesData | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<GamesData>;
  const games: Record<string, GameProgress> = {};
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);
  if (r.games && typeof r.games === 'object') {
    for (const [id, g] of Object.entries(r.games)) {
      if (!g || typeof g !== 'object') continue;
      const levels: GameProgress['levels'] = {};
      for (const key of ['1', '2', '3'] as const) {
        const l = (g.levels as Record<string, GameLevelProgress> | undefined)?.[key];
        if (!l || typeof l !== 'object' || typeof l.lastPlayed !== 'string') continue;
        levels[key] = {
          stars: Math.max(1, Math.min(3, num(l.stars) || 1)),
          bestScore: num(l.bestScore),
          maxScore: num(l.maxScore),
          plays: Math.max(1, num(l.plays)),
          firstCompletedAt: typeof l.firstCompletedAt === 'string' ? l.firstCompletedAt : l.lastPlayed,
          lastPlayed: l.lastPlayed,
        };
      }
      games[id] = { levels, plays: num(g.plays), lastPlayed: typeof g.lastPlayed === 'string' ? g.lastPlayed : null, introSeen: g.introSeen === true };
    }
  }
  return { games, challengeMode: r.challengeMode === true };
}
