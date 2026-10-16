import type { DropMove, DropRule } from '../shared/SceneDrop';

/*
 * Pure rules of The Good Word Tree.
 * - `treeRule`: only good words grow the tree; hurtful words are refused (49:11).
 * - `goodOrSilentRule` (L3): good words go to the tree, hurtful ones into silence (Bukhari 6018: say good or stay
 *   silent) – every word has its place.
 */

export interface Word {
  id: string;
  good: boolean;
}

const open = (words: readonly Word[], placed: readonly DropMove[]) => words.filter((w) => !placed.some((p) => p.item === w.id));

export function treeRule(words: readonly Word[], hurtText: string): DropRule {
  const good = words.filter((w) => w.good);
  const isGood = (id: string) => !!words.find((w) => w.id === id)?.good;
  return {
    total: good.length,
    check: (_placed, move) => (isGood(move.item) ? true : hurtText),
    next: (placed) => {
      const w = open(good, placed)[0];
      return w ? { item: w.id, target: 'tree' } : null;
    },
    wrong: (placed) => {
      const w = open(words, placed).find((x) => !x.good);
      return w ? { item: w.id, target: 'tree' } : null;
    },
    done: (placed) => open(good, placed).length === 0,
  };
}

export function goodOrSilentRule(words: readonly Word[], treeText: string, silentText: string): DropRule {
  const target = (w: Word) => (w.good ? 'tree' : 'silent');
  return {
    total: words.length,
    check: (_placed, move) => {
      const w = words.find((x) => x.id === move.item)!;
      if (target(w) === move.target) return true;
      return w.good ? treeText : silentText;
    },
    next: (placed) => {
      const w = open(words, placed)[0];
      return w ? { item: w.id, target: target(w) } : null;
    },
    wrong: (placed) => {
      const w = open(words, placed)[0];
      return w ? { item: w.id, target: w.good ? 'silent' : 'tree' } : null;
    },
    done: (placed) => open(words, placed).length === 0,
  };
}

/** Tree stage 0–4 for `done` of `total` good words. */
export const treeStage = (done: number, total: number) => Math.min(4, Math.floor((done / Math.max(1, total)) * 4));
