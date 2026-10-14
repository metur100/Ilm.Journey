import type React from 'react';

import { hasArt } from '@/core/art';
import { type GameApi, type GameResultInput, getGame, validateGame } from '@/core/games';
import { translateNs } from '@/core/i18n';
import { getQuestionByKey } from '@/core/registry';
import { registerFeatures } from '@/features';
import quranQuests from '@/features/learn/content/quests/quran.json';
import { getSurah, listSurahs } from '@/features/quran';

import { AyahBuilderGame } from '../AyahBuilderGame';
import { AYAH_FACTS } from '../facts';
import { ayahBuilderI18n } from '../i18n';
import { type AyahBuilderConfig, ayahResult, ayahTiles, fitsNext, orderSurahs, planAyahs, scatter } from '../logic';
import { AYAH_BUILDER_ART, AYAH_BUILDER_ID, AYAH_POOLS, ayahBuilderGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(() => { throw new Error('offline'); }), setAudioModeAsync: jest.fn(() => Promise.resolve()) }));

registerFeatures();

interface ReactTestInstance {
  props: Record<string, any>;
  findAll: (predicate: (node: ReactTestInstance) => boolean) => ReactTestInstance[];
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { act, create } = require('react-test-renderer') as {
  act: (callback: () => Promise<unknown> | void) => Promise<void>;
  create: (element: React.ReactElement) => { root: ReactTestInstance; unmount: () => void };
};

const pressables = (root: ReactTestInstance, label: string) =>
  root.findAll((n) => typeof n.props.onPress === 'function' && n.props.accessibilityLabel === label && !n.props.disabled);
const press = async (node: ReactTestInstance | undefined) => {
  if (!node) throw new Error('control not found');
  await act(async () => node.props.onPress());
};
const t = (key: string, params?: Record<string, string | number>) => translateNs(ayahBuilderI18n, 'en', key as never, params);

function api<C>(config: C, level: 1 | 2 | 3, onComplete: (r: GameResultInput) => void): GameApi<C> {
  return {
    gameId: AYAH_BUILDER_ID,
    level,
    config,
    facts: [],
    onComplete,
    onExit: () => undefined,
    playSound: () => undefined,
    haptic: () => undefined,
    reducedMotion: true,
    challengeMode: false,
    language: 'en',
    t,
    l: (text) => text?.en ?? '',
  };
}

describe('Ayah Builder', () => {
  it('registers a valid game', () => {
    expect(getGame(AYAH_BUILDER_ID)).toBeDefined();
    expect(() => validateGame(getGame(AYAH_BUILDER_ID)!)).not.toThrow();
    for (const name of AYAH_BUILDER_ART) expect({ name, ok: hasArt(name) }).toEqual({ name, ok: true });
    expect(hasArt(ayahBuilderGame.coverArt)).toBe(true);
  });

  it('never alters Quran text: joined tiles give back every ayah exactly', () => {
    for (const surah of listSurahs()) {
      for (const ayah of surah.ayahs) {
        const tiles = ayahTiles(ayah.arabic);
        expect({ ref: `${surah.number}:${ayah.numberInSurah}`, same: tiles.join(' ') === ayah.arabic }).toEqual({ ref: `${surah.number}:${ayah.numberInSurah}`, same: true });
        for (const tile of tiles) expect(/[ء-يٱ-ۓ]/.test(tile)).toBe(true);
      }
    }
  });

  it('keeps standalone waqf / sajda / hizb marks attached to their word', () => {
    const opening = ayahTiles(getSurah(100)!.ayahs[8].arabic);
    expect(opening[0].startsWith('۞ ')).toBe(true);
    const sajda = ayahTiles(getSurah(84)!.ayahs[20].arabic);
    expect(sajda[sajda.length - 1].endsWith(' ۩')).toBe(true);
    expect(ayahTiles('بِ ۚ تَ')).toEqual(['بِ ۚ', 'تَ']);
  });

  it('orders surahs: started memorising first, then the memorisation order', () => {
    expect(orderSurahs(AYAH_POOLS.short, {}).map((s) => s.number)).toEqual([114, 113, 112, 108, 103]);
    expect(orderSurahs(AYAH_POOLS.short, { 108: [1], 103: [2] }).map((s) => s.number)).toEqual([108, 103, 114, 113, 112]);
    // Ayah numbers outside the surah do not count as started.
    expect(orderSurahs(AYAH_POOLS.short, { 108: [9] })[0].number).toBe(114);
  });

  it('plans plays deterministically and rotates through surahs and windows', () => {
    const l1 = ayahBuilderGame.levels[0].config;
    expect(planAyahs(l1, {}, 0)?.surah.number).toBe(114);
    expect(planAyahs(l1, {}, 0)?.rounds.length).toBe(6);
    expect(planAyahs(l1, {}, 1)?.surah.number).toBe(113);
    expect(planAyahs(l1, { 112: [1] }, 0)?.surah.number).toBe(112);
    const l2 = ayahBuilderGame.levels[1].config;
    const fatiha: AyahBuilderConfig = { ...l2, pool: [1] };
    expect(planAyahs(fatiha, {}, 0)?.rounds.map((r) => r.ayah.numberInSurah)).toEqual([1, 2, 3, 4]);
    expect(planAyahs(fatiha, {}, 1)?.rounds.map((r) => r.ayah.numberInSurah)).toEqual([4, 5, 6, 7]);
    const l3 = ayahBuilderGame.levels[2].config;
    for (let play = 0; play < 30; play++) {
      const plan = planAyahs(l3, {}, play)!;
      expect(plan.rounds.length).toBeGreaterThan(0);
      for (const r of plan.rounds) expect(r.tiles.length >= 5 && r.tiles.length <= 11).toBe(true);
    }
  });

  it('accepts the next word only, scatters tiles and scores to stars', () => {
    const tiles = ['ا', 'ب', 'ا'];
    expect(fitsNext(tiles, 0, 'ا')).toBe(true);
    expect(fitsNext(tiles, 0, 'ب')).toBe(false);
    expect(fitsNext(tiles, 3, 'ا')).toBe(false);
    const order = scatter(['a', 'b', 'c', 'd'], () => 0.999);
    expect([...order].sort()).toEqual([0, 1, 2, 3]);
    expect(order).not.toEqual([0, 1, 2, 3]);
    expect(ayahResult(20, 0)).toEqual({ score: 20, maxScore: 20, stars: 3, mistakes: 0, factsMissed: [] });
    expect(ayahResult(20, 4).stars).toBe(2);
    expect(ayahResult(20, 5).stars).toBe(1);
    expect(ayahResult(5, 2).stars).toBe(2);
    expect(ayahResult(3, 9).score).toBe(0);
  });

  it('copies facts from the Quran quest content and composes the rest from the data', () => {
    const lesson = (id: string) => quranQuests.lessons.find((l) => l.id === id)!;
    expect(AYAH_FACTS.falaqNas.text).toEqual(lesson('quran-falaq-nas').sections[0].body);
    expect(AYAH_FACTS.falaqNas.sources).toEqual(lesson('quran-falaq-nas').sources);
    expect(AYAH_FACTS.ikhlas.text).toEqual(lesson('quran-ikhlas').sections[0].body);
    expect(AYAH_FACTS.fatiha.text).toEqual(lesson('quran-fatiha').sections[0].body);
    expect(AYAH_FACTS.fatiha.sources).toEqual(lesson('quran-fatiha').sources);
    const iqra = quranQuests.facts.find((f) => f.id === 'quran-fact-iqra')!;
    expect(AYAH_FACTS.iqra.text).toEqual(iqra.text);
    expect(AYAH_FACTS.iqra.sources).toEqual(iqra.sources);
    expect(AYAH_FACTS.nasr.text.en).toBe('Surah An-Nasr means “Divine Support”. It has 3 ayahs and was revealed in Madinah.');
    expect(AYAH_FACTS.juzAmma.text.en).toContain('37 surahs');
    for (const fact of [AYAH_FACTS.falaqNas, AYAH_FACTS.fatiha]) expect(getQuestionByKey(fact.reviewKey)).toBeDefined();
  });

  it.each([1, 2, 3] as const)('plays level %i to the end with taps', async (level) => {
    const config = ayahBuilderGame.levels[level - 1].config;
    const plan = planAyahs(config, {}, 0)!;
    const done = jest.fn();
    let tree!: ReturnType<typeof create>;
    await act(async () => {
      tree = create(<AyahBuilderGame {...api(config, level, done)} />);
    });
    const root = tree.root;
    await press(pressables(root, 'Start')[0]);
    // One wrong word first (a gentle nudge, counted as a mistake).
    const first = plan.rounds[0].tiles;
    const wrong = first.find((w) => w !== first[0]);
    if (wrong) await press(pressables(root, t('a11y.tile', { word: wrong }))[0]);
    for (const [i, round] of plan.rounds.entries()) {
      for (const word of round.tiles) await press(pressables(root, t('a11y.tile', { word }))[0]);
      const label = i + 1 < plan.rounds.length ? t('play.nextAyah') : 'Continue';
      await press(pressables(root, label)[0]);
    }
    await press(pressables(root, t('play.finish'))[0]);
    expect(done).toHaveBeenCalledTimes(1);
    const total = plan.rounds.reduce((s, r) => s + r.tiles.length, 0);
    expect(done.mock.calls[0][0]).toMatchObject({ maxScore: total, mistakes: wrong ? 1 : 0, stars: wrong ? 2 : 3 });
    await act(async () => tree.unmount());
  }, 30000);
});
