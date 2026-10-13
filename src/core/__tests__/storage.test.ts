import AsyncStorage from '@react-native-async-storage/async-storage';

import { APP_DATA_VERSION, createInitialData, sanitizeAppData } from '@/core/services/engine';
import { clearPersisted, loadPersisted, migrate, type PersistSpec, savePersisted, storageKey, withDefaults } from '@/core/storage';
import { APP_PERSIST } from '@/core/store/appStore';

beforeEach(async () => {
  await AsyncStorage.clear();
});

interface Demo {
  count: number;
  names: string[];
  nested: { flag: boolean; label: string };
  map: Record<string, number>;
}

const DEFAULTS: Demo = { count: 0, names: [], nested: { flag: false, label: 'x' }, map: {} };

const spec: PersistSpec<Demo> = {
  key: storageKey('demo'),
  version: 3,
  migrations: {
    // v1 stored `total` instead of `count`
    1: (data) => {
      const { total, ...rest } = data as { total?: number };
      return { ...rest, count: total ?? 0 };
    },
    // v2 → v3: names became an array
    2: (data) => {
      const d = data as { names?: string };
      return { ...d, names: typeof d.names === 'string' ? d.names.split(',') : d.names };
    },
  },
  sanitize: (data) => withDefaults(DEFAULTS, data),
};

describe('versioned storage', () => {
  it('uses one ilmjourney key per store', () => {
    expect(APP_PERSIST.key).toBe('ilmjourney:app');
    expect(storageKey('learn')).toBe('ilmjourney:learn');
  });

  it('round-trips data in a version envelope', async () => {
    const value: Demo = { count: 3, names: ['a'], nested: { flag: true, label: 'y' }, map: { a: 1 } };
    await savePersisted(spec, value);
    expect(JSON.parse((await AsyncStorage.getItem(spec.key))!)).toEqual({ version: 3, data: value });
    expect(await loadPersisted(spec)).toEqual(value);
  });

  it('runs step migrations from old versions', () => {
    expect(migrate({ version: 1, data: { total: 7, names: 'a,b' } }, spec)).toEqual({ ...DEFAULTS, count: 7, names: ['a', 'b'] });
    expect(migrate({ version: 2, data: { count: 2, names: 'c' } }, spec)).toEqual({ ...DEFAULTS, count: 2, names: ['c'] });
  });

  it('never crashes on empty, corrupt, unknown or future data', async () => {
    expect(await loadPersisted(spec)).toBeNull();
    await AsyncStorage.setItem(spec.key, 'nope{');
    expect(await loadPersisted(spec)).toBeNull();
    expect(migrate(null, spec)).toBeNull();
    expect(migrate({ count: 1 }, spec)).toBeNull();
    expect(migrate({ version: 4, data: {} }, spec)).toBeNull();
    expect(migrate({ version: 0, data: {} }, spec)).toBeNull();
    const throwing: PersistSpec<Demo> = { ...spec, migrations: { 1: () => { throw new Error('bad'); } } };
    expect(migrate({ version: 1, data: {} }, throwing)).toBeNull();
  });

  it('repairs wrong field types with defaults and keeps maps as stored', () => {
    expect(withDefaults(DEFAULTS, { count: 'many', names: 'x', nested: { flag: 'yes', label: 'ok' }, map: { b: 2 } })).toEqual({
      count: 0,
      names: [],
      nested: { flag: false, label: 'ok' },
      map: { b: 2 },
    });
  });

  it('clears data', async () => {
    await savePersisted(spec, DEFAULTS);
    await clearPersisted(spec);
    expect(await AsyncStorage.getItem(spec.key)).toBeNull();
  });
});

describe('global data migration', () => {
  it('fills defaults for partial data and drops broken review items', () => {
    const data = sanitizeAppData({
      xp: 120,
      settings: { language: 'bs', themeMode: 'neon' },
      profile: { name: 'Amina', learnerGroup: 'robot' },
      review: {
        'learn:q1': { key: 'learn:q1', topic: 'wudu', box: 1, nextReviewDate: '2026-10-01', mastered: false, correctCount: 1, incorrectCount: 1, lastSeen: '2026-10-01' },
        'learn:q2': { key: 'other', topic: 'x', box: 0, nextReviewDate: '2026-10-01', mastered: false },
        broken: 42,
      },
    })!;
    expect(data.version).toBe(APP_DATA_VERSION);
    expect(data.xp).toBe(120);
    expect(data.level).toBe(2);
    expect(data.settings.language).toBe('bs');
    expect(data.settings.themeMode).toBe('system');
    expect(data.settings.highContrast).toBe(false);
    expect(data.profile.name).toBe('Amina');
    expect(data.profile.learnerGroup).toBe('child');
    expect(Object.keys(data.review)).toEqual(['learn:q1']);
    expect(data.stats.reviewSessions).toBe(0);
  });

  it('loads stored global data through the app spec', async () => {
    const data = { ...createInitialData('de'), onboarded: true, xp: 30 };
    await savePersisted(APP_PERSIST, data);
    expect(await loadPersisted(APP_PERSIST)).toEqual({ ...data, level: 1 });
  });
});
