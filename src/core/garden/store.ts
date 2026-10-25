import { create } from 'zustand';

import { autoSave, clearPersisted, loadPersisted, type PersistSpec, storageKey } from '../storage';
import { toDayKey } from '../utils/date';
import {
  applyEarn,
  createGarden,
  type EarnEvent,
  type EarnResult,
  type GardenData,
  plantElement,
  removeElement,
  sanitizeGarden,
  unlockElement,
  waterGarden,
} from './rules';

export const GARDEN_PERSIST: PersistSpec<GardenData> = {
  key: storageKey('garden'),
  version: 2,
  migrations: {
    // v1 → v2: spots got kinds (grove, water, bed, path, sky) and new positions – the old indices meant other places,
    // so every element is placed again on a fitting free spot by `sanitizeGarden`.
    1: (data) => {
      if (!data || typeof data !== 'object') return data;
      const d = data as { placed?: unknown };
      return Array.isArray(d.placed) ? { ...d, placed: d.placed.map((p: unknown) => (p && typeof p === 'object' ? { ...p, spot: -1 } : p)) } : data;
    },
  },
  sanitize: sanitizeGarden,
};

export interface GardenStore extends GardenData {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  reset: () => Promise<void>;
  /** Applies an earning event; returns what it earned (see `earn()` – the one entry point for features). */
  applyEvent: (event: EarnEvent, now?: Date) => EarnResult;
  unlock: (elementId: string, level: number) => boolean;
  plant: (elementId: string, spot: number, level: number, now?: Date) => boolean;
  remove: (spot: number) => void;
  waterPlants: (now?: Date) => boolean;
}

export function pickGarden(s: GardenData): GardenData {
  return {
    placed: s.placed,
    unlocked: s.unlocked,
    seeds: s.seeds,
    water: s.water,
    lastWatered: s.lastWatered,
    lastActivityDay: s.lastActivityDay,
    waterDay: s.waterDay,
    waterToday: s.waterToday,
    milestones: s.milestones,
    seedsEarned: s.seedsEarned,
    waterEarned: s.waterEarned,
  };
}

/** The learner's Ilm Garden (`ilmjourney:garden`). Earning goes through `earn()` in `core/garden/earn.ts`. */
export const useGardenStore = create<GardenStore>((set, get) => ({
  ...createGarden(),
  hydrated: false,

  hydrate: async () => {
    const stored = await loadPersisted(GARDEN_PERSIST);
    set({ ...(stored ?? createGarden()), hydrated: true });
  },

  reset: async () => {
    await clearPersisted(GARDEN_PERSIST);
    set({ ...createGarden() });
  },

  applyEvent: (event, now = new Date()) => {
    const current = pickGarden(get());
    const result = applyEarn(current, event, toDayKey(now), now.toISOString());
    if (result.data !== current) set(result.data);
    return result;
  },

  unlock: (elementId, level) => {
    const next = unlockElement(pickGarden(get()), elementId, level);
    if (!next) return false;
    set(next);
    return true;
  },

  plant: (elementId, spot, level, now = new Date()) => {
    const next = plantElement(pickGarden(get()), elementId, spot, level, now.toISOString());
    if (!next) return false;
    set(next);
    return true;
  },

  remove: (spot) => set(removeElement(pickGarden(get()), spot)),

  waterPlants: (now = new Date()) => {
    const next = waterGarden(pickGarden(get()), toDayKey(now));
    if (!next) return false;
    set(next);
    return true;
  },
}));

export function startGardenAutoSave(): () => void {
  return autoSave(useGardenStore, GARDEN_PERSIST, (s) => (s.hydrated ? pickGarden(s) : undefined));
}
