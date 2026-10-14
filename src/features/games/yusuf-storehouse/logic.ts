import type { GameResultInput } from '@/core/games';

/*
 * Yusuf's Storehouse – pure rules (unit-tested in __tests__/yusuf-storehouse.test.ts).
 *
 * The king's dream as Yusuf explained it (Quran 12:43–49): seven good years – store what you harvest, except a
 * little to eat; then seven hard years that eat up what was stored; then a year of relief. The learner sorts every
 * good year's harvest into "eat now" or "store"; the hard years then take what they need from the storehouse.
 * L3 adds the rule card of 12:47 ("leave it in its ears"): in this game, grain kept in its ears keeps, while loose
 * grain in the storehouse spoils a little (one loose sack at the start of every hard year).
 */

export const GOOD_YEARS = 7;
export const HARD_YEARS = 7;

/** Grain kept in its ears (a sheaf) or threshed loose in a sack. */
export type GrainForm = 'ears' | 'loose';
export type Destination = 'eat' | 'store';

export interface Harvest {
  ears: number;
  loose: number;
}

export interface StorehouseConfig {
  /** The harvest of each of the seven good years. */
  harvests: Harvest[];
  /** Sacks the village needs from the storehouse in each of the seven hard years. */
  needs: number[];
  /** Sacks to eat at least in every good year ("except a little that you eat"). */
  minEat: number;
  /** L1: show the target (store / eat) and what the hard years will need. */
  hints: boolean;
  /** L3: loose grain spoils a little in the storehouse (the 12:47 rule card). */
  spoilage: boolean;
}

export interface HarvestItem {
  id: string;
  form: GrainForm;
}

/** The harvest of one good year as draggable items (ears first). */
export function harvestItems(year: number, harvest: Harvest): HarvestItem[] {
  return [
    ...Array.from({ length: harvest.ears }, (_, i) => ({ id: `y${year}-e${i}`, form: 'ears' as const })),
    ...Array.from({ length: harvest.loose }, (_, i) => ({ id: `y${year}-l${i}`, form: 'loose' as const })),
  ];
}

export const harvestSize = (h: Harvest) => h.ears + h.loose;

export interface Store {
  ears: number;
  loose: number;
}

export const emptyStore: Store = { ears: 0, loose: 0 };
export const storeTotal = (s: Store) => s.ears + s.loose;

/** Placements of one year: item id → destination. */
export type Placements = Record<string, Destination>;

export interface YearCheck {
  placed: number;
  eaten: number;
  stored: number;
  /** All items placed and enough kept to eat. */
  ready: boolean;
  /** Everything is placed but nothing (or too little) was kept to eat. */
  needsFood: boolean;
}

export function checkYear(items: HarvestItem[], placements: Placements, minEat: number): YearCheck {
  let eaten = 0;
  let stored = 0;
  for (const item of items) {
    if (placements[item.id] === 'eat') eaten++;
    else if (placements[item.id] === 'store') stored++;
  }
  const placed = eaten + stored;
  const all = placed === items.length;
  return { placed, eaten, stored, ready: all && eaten >= minEat, needsFood: all && eaten < minEat };
}

/** Adds what was stored this year to the storehouse. */
export function storeYear(store: Store, items: HarvestItem[], placements: Placements): Store {
  const next = { ...store };
  for (const item of items) if (placements[item.id] === 'store') next[item.form]++;
  return next;
}

/** L1 hint: how many sacks to store / eat in a year so that every hard year is covered. */
export function targetFor(config: StorehouseConfig, year: number): { store: number; eat: number } {
  const size = harvestSize(config.harvests[year]);
  return { store: size - config.minEat, eat: config.minEat };
}

export const totalNeed = (config: StorehouseConfig) => config.needs.reduce((a, b) => a + b, 0);

/** Most sacks that can be stored over the good years (everything except the little to eat). */
export const maxStorable = (config: StorehouseConfig) => config.harvests.reduce((a, h) => a + harvestSize(h) - config.minEat, 0);

export interface HardYear {
  /** 0-based hard year. */
  year: number;
  need: number;
  /** Loose sacks that spoiled at the start of the year (L3). */
  spoiled: number;
  /** Sacks taken from the storehouse for the village. */
  given: number;
  covered: boolean;
  after: Store;
}

/**
 * One hard year: (L3) one loose sack spoils first, then the village takes what it needs – loose grain first (it is
 * ready to use), then grain from the ears.
 */
export function hardYear(store: Store, year: number, need: number, spoilage: boolean): HardYear {
  let { ears, loose } = store;
  let spoiled = 0;
  if (spoilage && loose > 0) {
    loose--;
    spoiled = 1;
  }
  const fromLoose = Math.min(loose, need);
  loose -= fromLoose;
  const fromEars = Math.min(ears, need - fromLoose);
  ears -= fromEars;
  const given = fromLoose + fromEars;
  return { year, need, spoiled, given, covered: given === need, after: { ears, loose } };
}

export interface HardYearsOutcome {
  years: HardYear[];
  /** Hard years fully covered before the storehouse ran short. */
  covered: number;
  allCovered: boolean;
  spoiled: number;
  left: Store;
}

/** Runs all hard years until the storehouse runs short (the remaining years are not covered). */
export function simulateHardYears(store: Store, config: Pick<StorehouseConfig, 'needs' | 'spoilage'>): HardYearsOutcome {
  const years: HardYear[] = [];
  let current = store;
  let spoiled = 0;
  for (let i = 0; i < config.needs.length; i++) {
    const year = hardYear(current, i, config.needs[i], config.spoilage);
    years.push(year);
    spoiled += year.spoiled;
    current = year.after;
    if (!year.covered) break;
  }
  const covered = years.filter((y) => y.covered).length;
  return { years, covered, allCovered: covered === config.needs.length, spoiled, left: current };
}

/**
 * Result after the hard years were all covered. Stars: 3 on the first plan, 2 on the second, 1 later.
 * Score 70 (10 per hard year) minus 15 per extra plan, at least 20. A failed plan sends the planning fact to
 * review; spoiled loose grain sends the "leave it in its ears" fact (12:47).
 */
export function storehouseResult(input: { attempts: number; spoiledEver: boolean; planFactId: string; earsFactId?: string }): GameResultInput {
  const retries = Math.max(0, input.attempts - 1);
  const factsMissed: string[] = [];
  if (retries > 0) factsMissed.push(input.planFactId);
  if (input.spoiledEver && input.earsFactId) factsMissed.push(input.earsFactId);
  return {
    score: Math.max(20, 70 - retries * 15),
    maxScore: 70,
    stars: retries === 0 ? 3 : retries === 1 ? 2 : 1,
    mistakes: retries,
    factsMissed,
  };
}

// ---------- levels ----------

const repeat = <T>(value: T, n: number): T[] => Array.from({ length: n }, () => value);

/** L1: 3 sacks a year, 2 needed per hard year – store 2, eat 1 (target shown). */
export const LEVEL_1: StorehouseConfig = {
  harvests: repeat({ ears: 0, loose: 3 }, GOOD_YEARS),
  needs: repeat(2, HARD_YEARS),
  minEat: 1,
  hints: true,
  spoilage: false,
};

/** L2: harvests and needs vary, no hints (one sack to spare). */
export const LEVEL_2: StorehouseConfig = {
  harvests: [3, 4, 3, 4, 3, 3, 4].map((loose) => ({ ears: 0, loose })),
  needs: [2, 3, 2, 3, 2, 2, 2],
  minEat: 1,
  hints: false,
  spoilage: false,
};

/** L3: every harvest is 2 sheaves in the ear + 1 loose sack; loose grain spoils a little – eat the loose one. */
export const LEVEL_3: StorehouseConfig = {
  harvests: repeat({ ears: 2, loose: 1 }, GOOD_YEARS),
  needs: repeat(2, HARD_YEARS),
  minEat: 1,
  hints: false,
  spoilage: true,
};
