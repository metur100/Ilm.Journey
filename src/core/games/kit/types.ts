import type { LocalizedText } from '../../models';

/*
 * Shared data types of the casual game kit (docs/GAMES-FRAMEWORK.md, chapter "Kit").
 * Engines are data-driven: a game passes items (id + face) and callbacks; the engine draws and animates.
 */

/** Text in a kit item: a plain string (already localized, numbers, Arabic) or a LocalizedText. */
export type KitText = string | LocalizedText;

/**
 * What a tile, card or slot shows. Any combination works:
 * - `art` only (picture tile), `label` only (word tile), `arabic` only (letter / word tile), or art + label.
 * - `arabic` is drawn right-to-left with the app's Arabic font; set `quran: true` only for verified Quran text from
 *   the generated data (Amiri Quran font).
 */
export interface KitFace {
  label?: KitText;
  /** Art library name (`<Art name>`), e.g. `object.lantern`. */
  art?: string;
  /** Arabic text (letters, words, an ayah fragment). */
  arabic?: string;
  /** `arabic` is verified Quran text (generated data) → Quran font. */
  quran?: boolean;
  /** Small caption under the label (e.g. a year, a reference). */
  sub?: KitText;
  /** Screen-reader label when the visible face is not enough (default: label / arabic). */
  a11y?: KitText;
}

/** Every engine item has a stable id (kebab-case recommended – used in test ids `tile-<id>`). */
export interface KitItem extends KitFace {
  id: string;
}

/** Reported by every engine when the round is finished. */
export interface KitDoneInfo {
  /** Wrong moves (wrong drop, wrong pair, wrong tap …). */
  mistakes: number;
  /** Ids of the items the learner got wrong at least once (map them to fact ids for `factsMissed`). */
  missed: string[];
  /** Elapsed milliseconds (always measured; show it only in Challenge mode). */
  ms: number;
}

export interface KitProgress {
  done: number;
  total: number;
}

/** Callbacks and options every engine accepts. */
export interface EngineProps {
  /** Called once when the round is finished (after the success animation). */
  onDone: (info: KitDoneInfo) => void;
  /** Every wrong move with the id of the item involved. */
  onMistake?: (itemId: string) => void;
  /** Progress inside the round (also forwarded to the shell's header progress bar). */
  onProgress?: (progress: KitProgress) => void;
  /**
   * Hints: `true` (default) shows the hint pointer after the learner waits and highlights the next target in guided
   * engines; `false` hides them (harder levels).
   */
  hints?: boolean;
  /** Override the reduced-motion setting (default: the GameBoard / system setting). */
  reducedMotion?: boolean;
  /** Show the calm challenge stopwatch (default: the learner's Challenge mode). */
  challenge?: boolean;
  /** Inline caption under the board before the first move (instruction). */
  prompt?: KitText;
  /** Seed for deterministic shuffling (default: game id + level). */
  seed?: string;
  /** Root test id (default: the engine name in kebab-case). */
  testID?: string;
}

/** A position inside a picture / scene as fractions (0..1) of its width and height. */
export interface KitPoint {
  x: number;
  y: number;
}

/** A rectangle inside a picture / scene as fractions (0..1). */
export interface KitBox {
  x: number;
  y: number;
  w: number;
  h: number;
}
