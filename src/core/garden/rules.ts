import type { DayKey } from '../models';
import { daysBetween } from '../utils/date';
import { fitsSpot, GARDEN_SPOTS, getGardenElement, grows, nextSpotFor, REMOVED_GARDEN_ELEMENTS } from './elements';

/**
 * Pure rules of the Ilm Garden (no React, time passed in) – earning, unlocking, planting, watering, thirst.
 *
 * - **Water drops** come from learning activity (any meaningful activity, at most `DAILY_WATER_CAP` per day).
 * - **Seeds** come from milestones (finished game level, beginner quest, unit, Master Challenge, story, Seerah
 *   episode, every 7-day streak). Each milestone pays once (idempotent per milestone key).
 * - Seeds unlock elements (`seedCost`, once); unlocked elements are planted on free spots for free.
 * - Watering (one drop, once per day) makes plants grow: sprout → young → full.
 * - Thirst grows with the days since the last learning or watering – but never kills anything: the garden only
 *   looks thirsty and one activity restores it.
 */

export type MilestoneKind = 'gameLevel' | 'quest' | 'unit' | 'master' | 'story' | 'episode' | 'streak7';

export type EarnEvent =
  /** Meaningful learning happened (answer, lesson, story, episode, game, review, daily challenge). */
  | { type: 'activity' }
  /** A milestone was reached; `id` makes it idempotent (e.g. the unit id, `adam`, `wudu-flow:2`, `7`). */
  | { type: 'milestone'; kind: MilestoneKind; id: string };

/** What every event earns – the one table to tune the economy. */
export const EARN_TABLE: { activity: { water: number }; milestones: Record<MilestoneKind, { seeds: number }> } = {
  activity: { water: 1 },
  milestones: {
    gameLevel: { seeds: 1 },
    quest: { seeds: 2 },
    unit: { seeds: 2 },
    story: { seeds: 3 },
    episode: { seeds: 3 },
    master: { seeds: 4 },
    streak7: { seeds: 5 },
  },
};

/** Water drops that activity can earn per calendar day. */
export const DAILY_WATER_CAP = 3;
/** The watering can holds at most this many drops. */
export const MAX_WATER = 9;
/** Waterings a plant needs to reach the young / full stage. */
export const GROWTH_STAGES = [0, 1, 3] as const;
/** Starting gift so a new learner can plant right away. */
export const STARTING_SEEDS = 2;
export const STARTING_WATER = 1;
/** The first sapling stands in a flower bed of the middle row. */
const STARTING_SPOT = 6;

export interface PlacedElement {
  elementId: string;
  /** Index into `GARDEN_SPOTS`. */
  spot: number;
  plantedAt: string;
  /** Number of waterings since planting (drives the growth stage). */
  waterings: number;
}

/** Persisted garden (`ilmjourney:garden`). */
export interface GardenData {
  placed: PlacedElement[];
  /** Elements bought with seeds (free elements are available without being listed). */
  unlocked: string[];
  seeds: number;
  water: number;
  lastWatered: DayKey | null;
  lastActivityDay: DayKey | null;
  /** Day and amount of water earned that day (daily cap). */
  waterDay: DayKey | null;
  waterToday: number;
  /** Milestone key → ISO date it paid out. */
  milestones: Record<string, string>;
  /** Totals for statistics. */
  seedsEarned: number;
  waterEarned: number;
}

export function createGarden(): GardenData {
  return {
    placed: [{ elementId: 'sapling', spot: STARTING_SPOT, plantedAt: new Date(0).toISOString(), waterings: 0 }],
    unlocked: [],
    seeds: STARTING_SEEDS,
    water: STARTING_WATER,
    lastWatered: null,
    lastActivityDay: null,
    waterDay: null,
    waterToday: 0,
    milestones: {},
    seedsEarned: 0,
    waterEarned: 0,
  };
}

export interface EarnResult {
  data: GardenData;
  seeds: number;
  water: number;
}

export const milestoneKey = (kind: MilestoneKind, id: string) => `${kind}:${id}`;

/** Applies an earning event (pure). Milestones pay once; water respects the daily cap and the can size. */
export function applyEarn(data: GardenData, event: EarnEvent, today: DayKey, nowIso: string): EarnResult {
  if (event.type === 'activity') {
    const waterToday = data.waterDay === today ? data.waterToday : 0;
    const room = Math.min(DAILY_WATER_CAP - waterToday, MAX_WATER - data.water);
    const water = Math.max(0, Math.min(EARN_TABLE.activity.water, room));
    const next: GardenData = {
      ...data,
      lastActivityDay: today,
      waterDay: today,
      waterToday: waterToday + water,
      water: data.water + water,
      waterEarned: data.waterEarned + water,
    };
    return { data: next, seeds: 0, water };
  }
  const key = milestoneKey(event.kind, event.id);
  if (key in data.milestones) return { data, seeds: 0, water: 0 };
  const seeds = EARN_TABLE.milestones[event.kind].seeds;
  return {
    data: { ...data, milestones: { ...data.milestones, [key]: nowIso }, seeds: data.seeds + seeds, seedsEarned: data.seedsEarned + seeds },
    seeds,
    water: 0,
  };
}

/**
 * Maps a completion target (`reportQuestEvent({ type: 'complete', target })`) to a milestone.
 * Targets follow `<prefix>:<kind>:<id>` (see docs/FEATURE-PORTING.md): `learn:unit:<id>`, `learn:master:<topic>`,
 * `stories:story:<id>`, `seerah:episode:<id>`, beginner quests `quest:<id>` and game levels `game:<id>:<level>`.
 */
export function milestoneFromTarget(target: string): EarnEvent | null {
  const parts = target.split(':');
  if (parts.length < 2 || parts.some((p) => p.length === 0)) return null;
  const [prefix, second, ...rest] = parts;
  if (prefix === 'game') return parts.length === 3 && /^[123]$/.test(parts[2]) ? { type: 'milestone', kind: 'gameLevel', id: `${second}:${parts[2]}` } : null;
  if (prefix === 'quest') return parts.length === 2 ? { type: 'milestone', kind: 'quest', id: second } : null;
  const id = rest.join(':');
  if (!id) return null;
  if (second === 'unit' || second === 'master' || second === 'story' || second === 'episode') return { type: 'milestone', kind: second, id };
  return null;
}

/** Every completed 7-day stretch of the streak pays once (7, 14, 21 …). */
export function streakMilestone(current: number): EarnEvent | null {
  return current > 0 && current % 7 === 0 ? { type: 'milestone', kind: 'streak7', id: String(current) } : null;
}

// ---------- unlocking & planting ----------

export type UnlockState = 'available' | 'buyable' | 'tooExpensive' | 'levelLocked';

/** Whether the learner can plant the element now, can unlock it with seeds, or must reach a level first. */
export function unlockState(data: GardenData, elementId: string, level: number): UnlockState {
  const element = getGardenElement(elementId);
  if (!element || element.minLevel > level) return 'levelLocked';
  if (element.seedCost === 0 || data.unlocked.includes(elementId)) return 'available';
  return data.seeds >= element.seedCost ? 'buyable' : 'tooExpensive';
}

/** Pays the seed cost once. Returns null when the element cannot be unlocked. */
export function unlockElement(data: GardenData, elementId: string, level: number): GardenData | null {
  const state = unlockState(data, elementId, level);
  if (state !== 'buyable') return null;
  const element = getGardenElement(elementId)!;
  return { ...data, seeds: data.seeds - element.seedCost, unlocked: [...data.unlocked, elementId] };
}

export function isSpotFree(data: GardenData, spot: number): boolean {
  return spot >= 0 && spot < GARDEN_SPOTS.length && Number.isInteger(spot) && !data.placed.some((p) => p.spot === spot);
}

export function freeSpots(data: GardenData): number[] {
  return GARDEN_SPOTS.map((_, i) => i).filter((i) => isSpotFree(data, i));
}

/**
 * Plants an available element on a free spot of a fitting kind (water on a water spot, trees in the grove, birds in
 * the sky …). Returns null when the element is locked, the spot taken or the wrong kind of place.
 */
export function plantElement(data: GardenData, elementId: string, spot: number, level: number, nowIso: string): GardenData | null {
  const element = getGardenElement(elementId);
  if (!element || unlockState(data, elementId, level) !== 'available' || !isSpotFree(data, spot) || !fitsSpot(element, spot)) return null;
  return { ...data, placed: [...data.placed, { elementId, spot, plantedAt: nowIso, waterings: 0 }] };
}

/** Removes the element on a spot (it stays unlocked and can be planted again). */
export function removeElement(data: GardenData, spot: number): GardenData {
  return { ...data, placed: data.placed.filter((p) => p.spot !== spot) };
}

// ---------- watering, growth & thirst ----------

export function canWater(data: GardenData, today: DayKey): boolean {
  return data.water > 0 && data.lastWatered !== today;
}

/** Uses one drop: the garden is fresh again and every growing plant moves towards its next stage. */
export function waterGarden(data: GardenData, today: DayKey): GardenData | null {
  if (!canWater(data, today)) return null;
  return {
    ...data,
    water: data.water - 1,
    lastWatered: today,
    placed: data.placed.map((p) => {
      const element = getGardenElement(p.elementId);
      return element && grows(element) ? { ...p, waterings: p.waterings + 1 } : p;
    }),
  };
}

/** 0 = sprout, 1 = young, 2 = full. Decorations, water and creatures are always "full". */
export function growthStage(placed: PlacedElement): 0 | 1 | 2 {
  const element = getGardenElement(placed.elementId);
  if (!element || !grows(element)) return 2;
  if (placed.waterings >= GROWTH_STAGES[2]) return 2;
  return placed.waterings >= GROWTH_STAGES[1] ? 1 : 0;
}

export type ThirstLevel = 0 | 1 | 2;

/**
 * 0 = lush (learned or watered today/yesterday), 1 = a little thirsty (2–3 days), 2 = thirsty (4+ days).
 * Capped at 2: nothing ever dies – one activity makes the garden lush again.
 */
export function thirstLevel(data: Pick<GardenData, 'lastWatered' | 'lastActivityDay'>, today: DayKey): ThirstLevel {
  const days = [data.lastWatered, data.lastActivityDay]
    .filter((d): d is DayKey => !!d)
    .map((d) => daysBetween(d, today))
    .filter((d) => d >= 0);
  if (days.length === 0) return 0;
  const since = Math.min(...days);
  if (since <= 1) return 0;
  return since <= 3 ? 1 : 2;
}

// ---------- sanitizing ----------

const isDay = (v: unknown): v is DayKey => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

/**
 * Places stored elements onto valid spots: unknown or removed elements are dropped; an element on a spot of the
 * wrong kind (a fountain in the sky), on a taken spot or an invalid one moves to the first free fitting spot – or,
 * when none is free, leaves the garden (it stays unlocked and can be planted again).
 */
export function repairPlacement(placed: readonly PlacedElement[]): PlacedElement[] {
  const known = placed.filter((p) => !!getGardenElement(p.elementId));
  const used = new Set<number>();
  const kept = new Set<PlacedElement>();
  for (const p of known) {
    if (used.has(p.spot) || !fitsSpot(getGardenElement(p.elementId)!, p.spot)) continue;
    used.add(p.spot);
    kept.add(p);
  }
  const result: PlacedElement[] = [];
  for (const p of known) {
    if (kept.has(p)) {
      result.push(p);
      continue;
    }
    const free = GARDEN_SPOTS.map((_, i) => i).filter((i) => !used.has(i));
    const spot = nextSpotFor(getGardenElement(p.elementId)!, free);
    if (spot === null) continue;
    used.add(spot);
    result.push({ ...p, spot });
  }
  return result;
}

/** Repairs stored garden data (unknown or removed elements, wrong/duplicate/invalid spots, negative counters). */
export function sanitizeGarden(raw: unknown): GardenData | null {
  if (!raw || typeof raw !== 'object') return null;
  const base = createGarden();
  const r = raw as Partial<GardenData>;
  const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback);
  const stored = (Array.isArray(r.placed) ? r.placed : base.placed).filter(
    (p): p is PlacedElement => !!p && typeof p === 'object' && typeof p.elementId === 'string' && typeof p.spot === 'number',
  );
  const placed = repairPlacement(
    stored.map((p) => ({ elementId: p.elementId, spot: p.spot, plantedAt: typeof p.plantedAt === 'string' ? p.plantedAt : base.placed[0].plantedAt, waterings: num(p.waterings, 0) })),
  );
  const unlockedRaw = Array.isArray(r.unlocked) ? [...new Set(r.unlocked.filter((id): id is string => typeof id === 'string'))] : [];
  // Seeds paid for elements that were taken out of the garden come back.
  const refund = unlockedRaw.reduce((sum, id) => sum + (Object.prototype.hasOwnProperty.call(REMOVED_GARDEN_ELEMENTS, id) ? REMOVED_GARDEN_ELEMENTS[id] : 0), 0);
  return {
    placed,
    unlocked: unlockedRaw.filter((id) => !!getGardenElement(id)),
    seeds: num(r.seeds, base.seeds) + refund,
    water: Math.min(MAX_WATER, num(r.water, base.water)),
    lastWatered: isDay(r.lastWatered) ? r.lastWatered : null,
    lastActivityDay: isDay(r.lastActivityDay) ? r.lastActivityDay : null,
    waterDay: isDay(r.waterDay) ? r.waterDay : null,
    waterToday: num(r.waterToday, 0),
    milestones:
      r.milestones && typeof r.milestones === 'object' && !Array.isArray(r.milestones)
        ? Object.fromEntries(Object.entries(r.milestones).filter(([, v]) => typeof v === 'string'))
        : {},
    seedsEarned: num(r.seedsEarned, 0),
    waterEarned: num(r.waterEarned, 0),
  };
}
