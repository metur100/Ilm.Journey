import type { DropRule } from '../sections/akhlaq/shared/SceneDrop';

/*
 * Pure rules of A Day of Good Deeds.
 * - `momentRule`: one moment, the content's options as tiles – only the good option grows the garden; any other
 *   option is answered with its own gentle feedback from the content.
 * - `wholeDayRule` (L3): the good deeds of the day, each to its moment.
 */

export function momentRule(options: readonly string[], correct: number, feedback: (index: number) => string): DropRule {
  const id = (i: number) => `option-${i}`;
  return {
    total: 1,
    check: (_placed, move) => {
      const index = options.indexOf(move.item);
      return index === correct ? true : feedback(index);
    },
    next: (placed) => (placed.length ? null : { item: options[correct] ?? id(correct), target: 'moment' }),
    wrong: (placed) => {
      const other = options.findIndex((_, i) => i !== correct);
      return placed.length || other < 0 ? null : { item: options[other], target: 'moment' };
    },
    done: (placed) => placed.length > 0,
  };
}

export function wholeDayRule(moments: readonly string[], wrongText: string): DropRule {
  // Tile `deed-<moment>` belongs to target `<moment>`.
  const open = (placed: Parameters<DropRule['next']>[0]) => moments.filter((m) => !placed.some((p) => p.target === m));
  return {
    total: moments.length,
    check: (_placed, move) => (move.item === `deed-${move.target}` ? true : wrongText),
    next: (placed) => {
      const m = open(placed)[0];
      return m ? { item: `deed-${m}`, target: m } : null;
    },
    wrong: (placed) => {
      const [a, b] = open(placed);
      return a && b ? { item: `deed-${a}`, target: b } : null;
    },
    done: (placed) => open(placed).length === 0,
  };
}
