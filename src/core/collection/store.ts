import { create } from 'zustand';

import { registerLifecycle } from '../registry';
import { autoSave, clearPersisted, loadPersisted, type PersistSpec, storageKey, withDefaults } from '../storage';

/** Persisted collection album state (`ilmjourney:collection`). Unlocks are derived, only "seen" is stored. */
export interface CollectionData {
  /** Ids of the cards the learner has opened (drives the "New" markers). */
  seen: string[];
}

export const EMPTY_COLLECTION: CollectionData = { seen: [] };

export function sanitizeCollectionData(raw: unknown): CollectionData | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = withDefaults(EMPTY_COLLECTION, raw);
  return { seen: [...new Set(data.seen.filter((id): id is string => typeof id === 'string' && id.length > 0))] };
}

export const COLLECTION_PERSIST: PersistSpec<CollectionData> = {
  key: storageKey('collection'),
  version: 1,
  migrations: {},
  sanitize: sanitizeCollectionData,
};

interface CollectionStore extends CollectionData {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  reset: () => Promise<void>;
  /** Marks a card as opened (removes its "New" marker). */
  markSeen: (id: string) => void;
}

export const useCollectionStore = create<CollectionStore>((set, get) => ({
  ...EMPTY_COLLECTION,
  hydrated: false,

  hydrate: async () => {
    const stored = await loadPersisted(COLLECTION_PERSIST);
    // Cards opened before hydration finished are kept.
    const seen = [...new Set([...(stored?.seen ?? []), ...get().seen])];
    set({ seen, hydrated: true });
  },

  reset: async () => {
    await clearPersisted(COLLECTION_PERSIST);
    set({ ...EMPTY_COLLECTION });
  },

  markSeen: (id) => {
    if (!get().seen.includes(id)) set({ seen: [...get().seen, id] });
  },
}));

/** Persists the collection state after changes (debounced). */
export function startCollectionAutoSave(): () => void {
  return autoSave(useCollectionStore, COLLECTION_PERSIST, (s) => (s.hydrated ? { seen: s.seen } : undefined));
}

/** Registers the collection store's lifecycle (hydrate at start, reset with "Reset progress", auto-save). */
export function registerCollectionCore(): void {
  registerLifecycle('collection', {
    hydrate: () => useCollectionStore.getState().hydrate(),
    reset: () => useCollectionStore.getState().reset(),
    autoSave: startCollectionAutoSave,
  });
}
