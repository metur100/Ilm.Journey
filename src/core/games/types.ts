import type { ComponentType } from 'react';

import type { CoreKey, Namespace, Params } from '../i18n';
import type { CollectionCard, Language, LocalizedText, SourceRef, TopicId } from '../models';
import type { SoundName } from '../services/sound';

/** Game levels: easy → harder. */
export type GameLevel = 1 | 2 | 3;

export const GAME_LEVELS: readonly GameLevel[] = [1, 2, 3];

/**
 * Optional review question for a fact. Without it, `factQuestion` asks a true/false question whose statement is the
 * fact itself (always true) – give a `trueFalse` statement that can be false, or a `choice`, for better review.
 * Texts must come from existing content (no new claims).
 */
export type FactCheck =
  | { type: 'trueFalse'; statement: LocalizedText; correct: boolean }
  | { type: 'choice'; prompt: LocalizedText; options: LocalizedText[]; correctIndex: number };

/** A "You learned" fact shown after a level, with its sources (copied from existing content). */
export interface GameFact {
  /** Unique inside the game (kebab-case); the review key is `game:<gameId>:<factId>`. */
  id: string;
  text: LocalizedText;
  /** At least one source (Quran surah:ayah, hadith collection, Ibn Hisham …). */
  sources: SourceRef[];
  /** Optional illustration for the fact card. */
  art?: string;
  /** Optional review question built by `factQuestion`. */
  check?: FactCheck;
  /**
   * Optional existing global question key (e.g. `learn:salah-wudu-3`) to queue for review instead of the
   * generated fact question when the learner misses this fact.
   */
  reviewKey?: string;
}

export interface GameLevelDef<C> {
  level: GameLevel;
  /** Per-level configuration passed to the game component (e.g. pairs count, which ayahs, how many steps). */
  config: C;
  /** 1–3 facts shown on the result screen of this level. */
  facts: GameFact[];
}

/** Text keys every game namespace (`game.<id>`) must define. */
export type GameTextKey = 'title' | 'description' | 'howTo';

/** Result the game reports when a level is finished (`api.onComplete`). */
export interface GameResultInput {
  score: number;
  maxScore: number;
  /** 1–3 (clamped); there is no "failed" level – no lives, no game over. */
  stars: number;
  mistakes: number;
  /** Ids of facts (of this level or the game) the learner got wrong – they become review items. */
  factsMissed: string[];
}

export type HapticKind = 'tap' | 'success' | 'warning' | 'selection';

/** Everything a game component receives from the GameShell. */
export interface GameApi<C = unknown> {
  gameId: string;
  level: GameLevel;
  config: C;
  /** Facts of the current level (e.g. to reveal them during play). */
  facts: GameFact[];
  /** Finish the level – the shell shows the result screen. Call once. */
  onComplete: (result: GameResultInput) => void;
  /** Leave the level without a result (back to the level select). */
  onExit: () => void;
  /** UI sounds; respects the learner's sound setting. */
  playSound: (name: SoundName) => void;
  /** Haptic feedback; respects the learner's vibration setting. */
  haptic: (kind: HapticKind) => void;
  /** System or in-app "reduce motion": no continuous or large movement, use fades / instant changes. */
  reducedMotion: boolean;
  /** Challenge mode chosen by the learner – the only case where a game may use a timer. */
  challengeMode: boolean;
  language: Language;
  /** Translates keys of the game namespace (`game.<id>`) and core keys. */
  t: (key: string, params?: Params) => string;
  /** Localizes content text. */
  l: (text: LocalizedText | undefined) => string;
}

export interface GameDef<C = unknown> {
  /** kebab-case, unique (e.g. `wudu-flow`). Route: `/game/<id>`, i18n namespace `game.<id>`, XP `game:<id>:<level>`. */
  id: string;
  topicId: TopicId;
  /** Namespace `game.<id>` with at least `title`, `description`, `howTo` (+ the game's own keys). */
  i18n: Namespace<string>;
  /** Art library name of the cover illustration (shelf card + intro). */
  coverArt: string;
  /** Art shown in the animated "how to play" hint (defaults to the cover). */
  hintArt?: string;
  /** Exactly the levels 1..n (n ≤ 3), in order. */
  levels: GameLevelDef<C>[];
  component: ComponentType<GameApi<C>>;
  /** Collection cards this game unlocks; their `unlock` must be `game:<id>:<level>`. */
  cards?: CollectionCard[];
  /** Topic area / existing question keys the game practises (radar & recommendations; optional). */
  teaches?: { questionKeys?: string[] };
  /** Shelf order inside the topic (default 0). */
  order?: number;
  /** Development fixture: hidden from the Play tab, game of the day and quests in production builds. */
  dev?: boolean;
}

/** Helper type: a CoreKey or a key of the game namespace. */
export type GameKey = GameTextKey | CoreKey | (string & {});
