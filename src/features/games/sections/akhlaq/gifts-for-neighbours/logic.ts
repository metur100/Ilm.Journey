import type { DropRule } from '../shared/SceneDrop';

/*
 * Pure rules of Gifts for the Neighbours.
 * - `everyDoor`: every door gets one gift, in any order.
 * - `nearestFirst`: the gift goes to the nearest door that has none yet (Sahih al-Bukhari 6020).
 * `doors` are listed from the nearest to the farthest.
 */

export function everyDoorRule(gifts: readonly string[], doors: readonly string[], fullText: string): DropRule {
  const served = (placed: Parameters<DropRule['next']>[0]) => doors.filter((d) => placed.some((p) => p.target === d));
  const openGifts = (placed: Parameters<DropRule['next']>[0]) => gifts.filter((g) => !placed.some((p) => p.item === g));
  return {
    total: doors.length,
    check: (placed, move) => (served(placed).includes(move.target) ? fullText : true),
    next: (placed) => {
      const door = doors.find((d) => !served(placed).includes(d));
      const gift = openGifts(placed)[0];
      return door && gift ? { item: gift, target: door } : null;
    },
    wrong: (placed) => {
      const door = served(placed)[0];
      const gift = openGifts(placed)[0];
      return door && gift ? { item: gift, target: door } : null;
    },
    done: (placed) => served(placed).length === doors.length,
  };
}

export function nearestFirstRule(gifts: readonly string[], doors: readonly string[], nearestText: string, fullText: string): DropRule {
  const base = everyDoorRule(gifts, doors, fullText);
  const nextDoor = (placed: Parameters<DropRule['next']>[0]) => doors.find((d) => !placed.some((p) => p.target === d));
  return {
    ...base,
    check: (placed, move) => {
      const full = base.check(placed, move);
      if (full !== true) return full;
      return move.target === nextDoor(placed) ? true : nearestText;
    },
    wrong: (placed) => {
      const door = nextDoor(placed);
      const farther = doors.find((d) => d !== door && !placed.some((p) => p.target === d));
      const gift = gifts.find((g) => !placed.some((p) => p.item === g));
      return farther && gift ? { item: gift, target: farther } : null;
    },
  };
}
