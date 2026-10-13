import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Versioned AsyncStorage persistence – one key per store (`ilmjourney:app`, `ilmjourney:learn`,
 * `ilmjourney:stories`, `ilmjourney:seerah`, …).
 *
 * Every value is saved as `{ version, data }`. On load, `migrate` runs the step migrations from the
 * stored version up to the current one and then `sanitize` (usually `withDefaults`) repairs the shape.
 * Corrupt, unknown or future data never crashes the app – the store simply starts fresh.
 */

export const STORAGE_PREFIX = 'ilmjourney:';

export function storageKey(name: string): string {
  return `${STORAGE_PREFIX}${name}`;
}

export interface PersistSpec<T> {
  /** Full storage key, e.g. `storageKey('learn')`. */
  key: string;
  /** Current schema version (start at 1, bump when the shape changes). */
  version: number;
  /**
   * Step migrations: `migrations[n]` turns version-n data into version n+1 data.
   * Missing steps keep the data unchanged (sanitize then fills defaults).
   */
  migrations?: Record<number, (data: unknown) => unknown>;
  /** Turns migrated data into a valid value, or null when it is unusable. */
  sanitize: (data: unknown) => T | null;
}

interface Envelope {
  version: number;
  data: unknown;
}

function isEnvelope(raw: unknown): raw is Envelope {
  return !!raw && typeof raw === 'object' && typeof (raw as Envelope).version === 'number' && 'data' in (raw as object);
}

/** Pure migration step (exported for tests). */
export function migrate<T>(raw: unknown, spec: PersistSpec<T>): T | null {
  if (!isEnvelope(raw)) return null;
  if (!Number.isInteger(raw.version) || raw.version < 1 || raw.version > spec.version) return null;
  let data = raw.data;
  try {
    for (let v = raw.version; v < spec.version; v++) {
      const step = spec.migrations?.[v];
      if (step) data = step(data);
    }
    return spec.sanitize(data);
  } catch {
    return null;
  }
}

export async function loadPersisted<T>(spec: PersistSpec<T>): Promise<T | null> {
  try {
    const json = await AsyncStorage.getItem(spec.key);
    if (!json) return null;
    return migrate(JSON.parse(json), spec);
  } catch {
    // Corrupt data must never crash the app; the learner starts fresh instead.
    return null;
  }
}

export async function savePersisted<T>(spec: PersistSpec<T>, data: T): Promise<void> {
  const envelope: Envelope = { version: spec.version, data };
  await AsyncStorage.setItem(spec.key, JSON.stringify(envelope));
}

export async function clearPersisted(spec: Pick<PersistSpec<unknown>, 'key'>): Promise<void> {
  try {
    await AsyncStorage.removeItem(spec.key);
  } catch {
    // ignore
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Deep-merges stored data over defaults, keeping only values whose type matches the default
 * (wrong types fall back to the default). Objects whose default is empty (`{}`, used for maps like
 * progress records) and arrays are taken as stored when the type matches.
 */
export function withDefaults<T>(defaults: T, stored: unknown): T {
  if (stored === undefined || stored === null) return defaults;
  if (Array.isArray(defaults)) return (Array.isArray(stored) ? stored : defaults) as T;
  if (isPlainObject(defaults)) {
    if (!isPlainObject(stored)) return defaults;
    if (Object.keys(defaults).length === 0) return stored as T;
    const result: Record<string, unknown> = { ...defaults };
    for (const key of Object.keys(defaults)) result[key] = withDefaults((defaults as Record<string, unknown>)[key], stored[key]);
    // Keep optional fields that have no default (e.g. `completedAt`) when they are primitives.
    for (const key of Object.keys(stored)) {
      if (!(key in defaults) && stored[key] !== null && typeof stored[key] !== 'object') result[key] = stored[key];
    }
    return result as T;
  }
  if (defaults === null) return stored as T;
  return (typeof stored === typeof defaults ? stored : defaults) as T;
}

interface Subscribable<S> {
  subscribe: (listener: (state: S, previous: S) => void) => () => void;
  getState: () => S;
}

/** Shallow equality of two values (objects compared key by key with ===). */
function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!isPlainObject(a) || !isPlainObject(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((k) => a[k] === b[k]);
}

/**
 * Persists a zustand store shortly after every change of the selected data (debounced).
 * `select` may build a new object each time – it is compared shallowly. It returns undefined while
 * the store is not hydrated yet (nothing is saved then).
 */
export function autoSave<S, T>(store: Subscribable<S>, spec: PersistSpec<T>, select: (state: S) => T | undefined, delayMs = 300): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const unsubscribe = store.subscribe((state, previous) => {
    const next = select(state);
    if (next === undefined || shallowEqual(next, select(previous))) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const latest = select(store.getState());
      if (latest !== undefined) savePersisted(spec, latest).catch(() => undefined);
    }, delayMs);
  });
  return () => {
    if (timer) clearTimeout(timer);
    unsubscribe();
  };
}
