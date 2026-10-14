import { localizedFrom, translateNs } from '../i18n';
import { type DayKey, factSourceProblem, type LocalizedText, type Question } from '../models';
import { registerCollectionCards } from '../registry';
import { dayNumber } from '../utils/date';
import type { GameDef, GameFact, GameTextKey } from './types';

/**
 * Game registry (v2 mini-games). Games live in `src/features/games/<id>/` and call `registerGame(def)` from their
 * `register.ts` (listed in `src/features/games/index.ts`). See docs/GAMES-FRAMEWORK.md.
 */

const games = new Map<string, GameDef<unknown>>();
const listeners = new Set<() => void>();
let version = 0;

const REQUIRED_TEXT: readonly GameTextKey[] = ['title', 'description', 'howTo'];
const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Throws a descriptive error when a game definition breaks the framework rules (caught early in tests). */
export function validateGame(def: GameDef<unknown>): void {
  const fail = (msg: string) => {
    throw new Error(`Game "${def.id}": ${msg}`);
  };
  if (!ID_PATTERN.test(def.id)) fail('id must be kebab-case');
  if (def.i18n.name !== `game.${def.id}`) fail(`i18n namespace must be named "game.${def.id}"`);
  for (const key of REQUIRED_TEXT) if (!def.i18n.dictionaries.en[key]) fail(`i18n key "${key}" missing`);
  if (def.levels.length < 1 || def.levels.length > 3) fail('needs 1–3 levels');
  def.levels.forEach((l, i) => {
    if (l.level !== i + 1) fail('levels must be 1..n in order');
    if (l.facts.length < 1 || l.facts.length > 3) fail(`level ${l.level} needs 1–3 facts`);
  });
  const factIds = new Set<string>();
  for (const fact of allFacts(def)) {
    if (!ID_PATTERN.test(fact.id)) fail(`fact id "${fact.id}" must be kebab-case`);
    if (factIds.has(fact.id)) fail(`duplicate fact id "${fact.id}"`);
    factIds.add(fact.id);
    const sourceProblem = factSourceProblem(fact.kind, fact.sources);
    if (sourceProblem) fail(`fact "${fact.id}" ${sourceProblem}`);
    if (fact.check?.type === 'choice' && (fact.check.correctIndex < 0 || fact.check.correctIndex >= fact.check.options.length)) {
      fail(`fact "${fact.id}" has an invalid choice check`);
    }
  }
  for (const card of def.cards ?? []) {
    const match = /^game:([^:]+):([123])$/.exec(card.unlock);
    if (!match || match[1] !== def.id || Number(match[2]) > def.levels.length) fail(`card "${card.id}" must unlock with game:${def.id}:<level>`);
  }
}

/** Registers (or replaces) a game. Also registers its collection cards. */
export function registerGame<C>(def: GameDef<C>): void {
  const game = def as unknown as GameDef<unknown>;
  validateGame(game);
  games.set(def.id, game);
  if (def.cards?.length) registerCollectionCards(`game:${def.id}`, def.cards);
  version++;
  for (const listener of listeners) listener();
}

export function getGame(id: string): GameDef<unknown> | undefined {
  return games.get(id);
}

declare const __DEV__: boolean | undefined;
/** Development fixtures (e.g. the demo game) are listed only in development builds. */
export const SHOW_DEV_GAMES: boolean = typeof __DEV__ !== 'undefined' && !!__DEV__;

/** Registered games, sorted by topic order of registration, then `order`, then id. */
export function listGames(options: { includeDev?: boolean } = {}): GameDef<unknown>[] {
  const includeDev = options.includeDev ?? SHOW_DEV_GAMES;
  return [...games.values()].filter((g) => includeDev || !g.dev).sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id));
}

export function subscribeGames(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getGamesVersion(): number {
  return version;
}

/** Removes every game (tests only). */
export function clearGamesForTests(): void {
  games.clear();
  version++;
}

// ---------- helpers ----------

export function allFacts(def: Pick<GameDef<unknown>, 'levels'>): GameFact[] {
  return def.levels.flatMap((l) => l.facts);
}

export function findFact(def: GameDef<unknown>, factId: string): GameFact | undefined {
  return allFacts(def).find((f) => f.id === factId);
}

/** The game's title in every language (for registry contexts and quests). */
export function gameTitle(def: GameDef<unknown>): LocalizedText {
  return localizedFrom((lang) => translateNs(def.i18n, lang, 'title'));
}

/** Global review key of a game fact: `game:<gameId>:<factId>`. */
export const gameFactKey = (gameId: string, factId: string) => `game:${gameId}:${factId}`;

/** XP reason / achievement key of a game level: `game:<gameId>:<level>`. */
export const gameLevelKey = (gameId: string, level: number) => `game:${gameId}:${level}`;

/** Quest target of "play today's game" (any level counts). */
export const gameTarget = (gameId: string) => `game:${gameId}`;

/** Deterministic game of the day (same game all day, rotates through the shelf). */
export function gameOfTheDay(day: DayKey, list: readonly GameDef<unknown>[] = listGames()): GameDef<unknown> | null {
  if (list.length === 0) return null;
  const sorted = [...list].sort((a, b) => a.id.localeCompare(b.id));
  return sorted[dayNumber(day) % sorted.length];
}

/**
 * Builds the review question of a fact (shown by the review centre through the `game` question prefix):
 * the fact's `check` when given, else a true/false question whose statement is the fact itself.
 */
export function factQuestion(def: GameDef<unknown>, fact: GameFact): Question {
  const base = {
    id: `${def.id}:${fact.id}`,
    topic: `game:${def.id}`,
    areaId: def.topicId,
    explanation: fact.text,
    sources: fact.sources,
  };
  const check = fact.check;
  if (check?.type === 'choice') {
    return {
      ...base,
      type: 'multipleChoice',
      prompt: check.prompt,
      options: check.options.map((text, i) => ({ id: `o${i}`, text })),
      correctOptionId: `o${check.correctIndex}`,
    };
  }
  if (check?.type === 'trueFalse') return { ...base, type: 'trueFalse', prompt: check.statement, correct: check.correct };
  return { ...base, type: 'trueFalse', prompt: fact.text, correct: true };
}
