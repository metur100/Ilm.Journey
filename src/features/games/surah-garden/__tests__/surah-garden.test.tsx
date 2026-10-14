import type React from 'react';

import { hasArt } from '@/core/art';
import { type GameApi, type GameResultInput, getGame, validateGame } from '@/core/games';
import { translateNs } from '@/core/i18n';
import { getQuestionByKey } from '@/core/registry';
import { registerFeatures } from '@/features';
import quranUnit from '@/features/learn/content/quran/quran-structure.json';
import { getSurah, type Surah } from '@/features/quran';

import { GARDEN_FACTS } from '../facts';
import { surahGardenI18n } from '../i18n';
import { compatible, gardenResult, isMatch, missedFacts, openingLength, openingText, pickSurahs, type SurahGardenConfig } from '../logic';
import { SURAH_GARDEN_ART, SURAH_GARDEN_ID, surahGardenGame } from '../register';
import { SurahGardenGame } from '../SurahGardenGame';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));

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
const control = (root: ReactTestInstance, label: string) =>
  root.findAll((n) => typeof n.props.onPress === 'function' && n.props.accessibilityLabel === label && !n.props.disabled)[0];
const press = async (node: ReactTestInstance | undefined, what = '') => {
  if (!node) throw new Error(`control not found ${what}`);
  await act(async () => node.props.onPress());
};
const t = (key: string, params?: Record<string, string | number>) => translateNs(surahGardenI18n, 'en', key as never, params);

const config = (level: 1 | 2 | 3) => surahGardenGame.levels[level - 1].config;
const surah = (n: number) => getSurah(n) as Surah;

function answerLabel(cfg: SurahGardenConfig, s: Surah, all: Surah[]): string {
  if (cfg.mode === 'meaning') return t('a11y.answer', { text: s.nameMeaningLocalized?.en || s.nameMeaning });
  if (cfg.mode === 'ayahCount') return t('a11y.answer', { text: t('play.ayahs', { count: s.ayahCount }) });
  const o = openingText(s, openingLength(all));
  return t('a11y.answer', { text: o.more ? `${o.text} …` : o.text });
}

describe('Surah Garden', () => {
  it('registers a valid game with existing art', () => {
    expect(() => validateGame(getGame(SURAH_GARDEN_ID)!)).not.toThrow();
    for (const name of SURAH_GARDEN_ART) expect({ name, ok: hasArt(name) }).toEqual({ name, ok: true });
  });

  it('picks six surahs incl. the anchors whose answer cards never look alike', () => {
    for (const level of [1, 2, 3] as const) {
      const cfg = config(level);
      for (let play = 0; play < 25; play++) {
        const picked = pickSurahs(cfg, `seed:${level}:${play}`);
        expect(picked).toHaveLength(6);
        expect(new Set(picked.map((s) => s.number)).size).toBe(6);
        for (const a of cfg.anchors) expect(picked.map((s) => s.number)).toContain(a);
        for (const a of picked) for (const b of picked) if (a !== b) expect(compatible(cfg.mode, a, b)).toBe(true);
        if (cfg.mode === 'opening') {
          const k = openingLength(picked);
          const texts = picked.map((s) => openingText(s, k).text);
          expect(new Set(texts).size).toBe(6);
        }
      }
    }
    expect(pickSurahs(config(1), 'x')).toEqual(pickSurahs(config(1), 'x'));
  });

  it('keeps look-alike answers apart (two surahs mean “The Dawn”, 113 and 114 open alike)', () => {
    expect(compatible('meaning', surah(89), surah(113))).toBe(false);
    expect(compatible('ayahCount', surah(112), surah(106))).toBe(false);
    expect(compatible('ayahCount', surah(112), surah(108))).toBe(true);
    expect(compatible('opening', surah(113), surah(114))).toBe(true);
    expect(openingLength([surah(113), surah(114)])).toBe(4);
    expect(openingText(surah(103), 2)).toEqual({ text: surah(103).ayahs[0].arabic, more: false });
    // Opening words are Quran text from the data: a prefix of ayah 1, never changed.
    expect(surah(112).ayahs[0].arabic.startsWith(openingText(surah(112), 2).text)).toBe(true);
  });

  it('matches, sends only facts of wrongly matched surahs to review and scores', () => {
    expect(isMatch(112, 112)).toBe(true);
    expect(isMatch(112, 114)).toBe(false);
    const facts = config(1).factSurahs;
    expect(missedFacts(facts, new Set([114, 112]))).toEqual([GARDEN_FACTS.ikhlasMeaning.id]);
    expect(missedFacts(facts, new Set())).toEqual([]);
    expect(gardenResult(6, 0, [])).toEqual({ score: 12, maxScore: 12, stars: 3, mistakes: 0, factsMissed: [] });
    expect(gardenResult(6, 2, []).stars).toBe(2);
    expect(gardenResult(6, 3, ['x'])).toMatchObject({ stars: 1, score: 9, factsMissed: ['x'] });
  });

  it('copies or composes its facts from the content and the data', () => {
    const q3 = quranUnit.questions.find((q) => q.id === 'quran-structure-3')!;
    expect(GARDEN_FACTS.fatihaOpening.text).toEqual(q3.explanation);
    expect(GARDEN_FACTS.fatihaOpening.sources).toEqual(q3.sources);
    expect(GARDEN_FACTS.ikhlasMeaning.text.en).toBe('Surah Al-Ikhlaas means “Sincerity”. It has 4 ayahs and was revealed in Makkah.');
    expect(GARDEN_FACTS.ikhlasOpening.text.en).toContain(surah(112).ayahs[0].transliteration);
    expect(GARDEN_FACTS.ikhlasOpening.text.de).toContain(surah(112).ayahs[0].translation.de);
    for (const key of [GARDEN_FACTS.fatihaOpening.reviewKey, GARDEN_FACTS.kawtharCount.reviewKey]) expect(getQuestionByKey(key)).toBeDefined();
  });

  it.each([1, 2, 3] as const)('plays level %i: tap a surah, then its partner, until the garden blooms', async (level) => {
    const cfg = config(level);
    const picked = pickSurahs(cfg, `${SURAH_GARDEN_ID}:${level}:0`);
    const done = jest.fn();
    const api: GameApi<SurahGardenConfig> = {
      gameId: SURAH_GARDEN_ID,
      level,
      config: cfg,
      facts: [],
      onComplete: done as (r: GameResultInput) => void,
      onExit: () => undefined,
      playSound: () => undefined,
      haptic: () => undefined,
      reducedMotion: true,
      challengeMode: false,
      language: 'en',
      t,
      l: (text) => text?.en ?? '',
    };
    let tree!: ReturnType<typeof create>;
    await act(async () => {
      tree = create(<SurahGardenGame {...api} />);
    });
    const root = tree.root;
    await press(control(root, 'Start'), 'start');
    // A wrong pair first: the first surah onto the partner of the second.
    const [a, b] = picked;
    await press(control(root, t('a11y.surah', { name: a.nameTransliterated })), 'surah');
    await press(control(root, answerLabel(cfg, b, picked)), 'wrong partner');
    for (const s of picked) {
      await press(control(root, t('a11y.surah', { name: s.nameTransliterated })), s.nameTransliterated);
      await press(control(root, answerLabel(cfg, s, picked)), `partner of ${s.number}`);
    }
    await press(control(root, t('play.finish')), 'finish');
    expect(done).toHaveBeenCalledTimes(1);
    const result = done.mock.calls[0][0] as GameResultInput;
    expect(result).toMatchObject({ maxScore: 12, score: 11, mistakes: 1, stars: 2 });
    expect(result.factsMissed).toEqual(missedFacts(cfg.factSurahs, new Set([a.number, b.number])));
    await act(async () => tree.unmount());
  }, 30000);
});
