import type { EpisodeConfig } from '../../prophets-story/episode';

/*
 * The Shirt's Road – pure rules. The learner lays a road across the desert, cell by cell, from Egypt (start) to
 * Yaqub's home in Canaan (goal), around rocks. On level 3 the caravan must also stop at every well on the way.
 */

export interface RoadConfig {
  cols: number;
  rows: number;
  /** Cell indices (row * cols + col). */
  start: number;
  goal: number;
  rocks: number[];
  /** Wells the road must pass through (level 3). */
  wells: number[];
  hints: boolean;
}

export const cellOf = (cfg: Pick<RoadConfig, 'cols'>, i: number) => ({ c: i % cfg.cols, r: Math.floor(i / cfg.cols) });

export function neighbours(cfg: Pick<RoadConfig, 'cols' | 'rows'>, i: number): number[] {
  const { c, r } = cellOf(cfg, i);
  const out: number[] = [];
  if (c > 0) out.push(i - 1);
  if (c < cfg.cols - 1) out.push(i + 1);
  if (r > 0) out.push(i - cfg.cols);
  if (r < cfg.rows - 1) out.push(i + cfg.cols);
  return out;
}

export const isNeighbour = (cfg: Pick<RoadConfig, 'cols' | 'rows'>, a: number, b: number) => neighbours(cfg, a).includes(b);

export type StepKind = 'extend' | 'undo' | 'rock' | 'far' | 'used' | 'wellsFirst' | 'arrive';

/** What a tap on `cell` does to the road `path` (path[0] = start). */
export function classifyTap(cfg: RoadConfig, path: readonly number[], cell: number): StepKind {
  const head = path[path.length - 1];
  if (path.length > 1 && cell === path[path.length - 2]) return 'undo';
  if (cfg.rocks.includes(cell)) return 'rock';
  if (path.includes(cell)) return 'used';
  if (!isNeighbour(cfg, head, cell)) return 'far';
  if (cell === cfg.goal) return cfg.wells.every((w) => path.includes(w)) ? 'arrive' : 'wellsFirst';
  return 'extend';
}

/**
 * Shortest road from start to goal that passes every well (breadth-first search over cell + wells visited). Cells
 * are never used twice. Returns the cell list including start and goal, or null when there is none.
 */
export function solveRoad(cfg: RoadConfig): number[] | null {
  const allWells = (1 << cfg.wells.length) - 1;
  const wellBit = (cell: number) => {
    const k = cfg.wells.indexOf(cell);
    return k >= 0 ? 1 << k : 0;
  };
  interface Node {
    cell: number;
    mask: number;
    path: number[];
  }
  const queue: Node[] = [{ cell: cfg.start, mask: wellBit(cfg.start), path: [cfg.start] }];
  const seen = new Set<string>([`${cfg.start}:${wellBit(cfg.start)}`]);
  while (queue.length) {
    const node = queue.shift()!;
    for (const next of neighbours(cfg, node.cell)) {
      if (cfg.rocks.includes(next) || node.path.includes(next)) continue;
      const mask = node.mask | wellBit(next);
      if (next === cfg.goal) {
        if (mask === allWells) return [...node.path, next];
        continue;
      }
      const key = `${next}:${mask}`;
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push({ cell: next, mask, path: [...node.path, next] });
    }
  }
  return null;
}

/** The learner's next correct cell when the road so far follows the solution, else null. */
export function nextOnSolution(solution: readonly number[], path: readonly number[]): number | null {
  for (let i = 0; i < path.length; i++) if (solution[i] !== path[i]) return null;
  return solution[path.length] ?? null;
}

const at = (cols: number, c: number, r: number) => r * cols + c;

/** L3 of the Yaqub game: the caravan brings the shirt and must rest at both wells on the way. */
export const ROAD: RoadConfig = {
  cols: 6,
  rows: 5,
  start: at(6, 0, 0),
  goal: at(6, 5, 4),
  rocks: [at(6, 1, 1), at(6, 2, 1), at(6, 3, 3), at(6, 4, 3), at(6, 4, 0), at(6, 1, 4), at(6, 5, 1)],
  wells: [at(6, 0, 3), at(6, 4, 2)],
  hints: false,
};

export type YaqubConfig = RoadConfig | EpisodeConfig;
