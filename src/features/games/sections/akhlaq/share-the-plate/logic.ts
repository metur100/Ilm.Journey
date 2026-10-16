import type { DropMove, DropRule } from '../shared/SceneDrop';

/*
 * Pure rule of Share the Plate: every plate gets the same share of every kind of food, given in fair turns – a plate
 * gets the next piece of a kind only when no other plate has fewer of that kind.
 */

export interface FoodPiece {
  id: string;
  kind: string;
}

export function shareRule(food: readonly FoodPiece[], plates: readonly string[], waitingText: string): DropRule {
  const kindOf = (id: string) => food.find((f) => f.id === id)?.kind ?? '';
  const count = (placed: readonly DropMove[], plate: string, kind: string) => placed.filter((p) => p.target === plate && kindOf(p.item) === kind).length;
  const fewest = (placed: readonly DropMove[], kind: string) => Math.min(...plates.map((p) => count(placed, p, kind)));
  const open = (placed: readonly DropMove[]) => food.filter((f) => !placed.some((p) => p.item === f.id));
  return {
    total: food.length,
    check: (placed, { item, target }) => {
      const kind = kindOf(item);
      return count(placed, target, kind) <= fewest(placed, kind) ? true : waitingText;
    },
    next: (placed) => {
      const piece = open(placed)[0];
      if (!piece) return null;
      const min = fewest(placed, piece.kind);
      return { item: piece.id, target: plates.find((p) => count(placed, p, piece.kind) === min)! };
    },
    wrong: (placed) => {
      for (const piece of open(placed)) {
        const min = fewest(placed, piece.kind);
        const full = plates.find((p) => count(placed, p, piece.kind) > min);
        if (full) return { item: piece.id, target: full };
      }
      return null;
    },
    done: (placed) => open(placed).length === 0,
  };
}

/** `n` pieces of one kind with ids `<kind>-1 … <kind>-n`. */
export const pieces = (kind: string, n: number): FoodPiece[] => Array.from({ length: n }, (_, i) => ({ id: `${kind}-${i + 1}`, kind }));
