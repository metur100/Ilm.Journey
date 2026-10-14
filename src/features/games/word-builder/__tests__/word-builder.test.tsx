import type React from 'react';

import { hasArt } from '@/core/art';
import { type GameApi, type GameResultInput, getGame, validateGame } from '@/core/games';
import { translateNs } from '@/core/i18n';
import { LANGUAGE_SOURCES } from '@/core/models';
import { getQuestionByKey } from '@/core/registry';
import { registerFeatures } from '@/features';
import arabicQuests from '@/features/learn/content/quests/arabic.json';

import { setArabicVoiceForTests } from '../../ayah-builder/kit';
import { WORD_FACTS } from '../facts';
import { wordBuilderI18n } from '../i18n';
import { fitsSlot, missingIndex, missingOptions, pickWords, type WordBuilderConfig, wordLetters, wordMissedFacts, wordResult, wordTiles } from '../logic';
import { WORD_BUILDER_ART, WORD_BUILDER_ID, wordBuilderGame } from '../register';
import { WordBuilderGame } from '../WordBuilderGame';
import { BASIC_NOTE, getWord, WORDS } from '../words';

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
const t = (key: string, params?: Record<string, string | number>) => translateNs(wordBuilderI18n, 'en', key as never, params);
const config = (level: 1 | 2 | 3) => wordBuilderGame.levels[level - 1].config;

describe('Word Builder', () => {
  it('registers a valid game; every word has a picture', () => {
    expect(() => validateGame(getGame(WORD_BUILDER_ID)!)).not.toThrow();
    for (const name of WORD_BUILDER_ART) expect({ name, ok: hasArt(name) }).toEqual({ name, ok: true });
    expect(new Set(WORDS.map((w) => w.id)).size).toBe(WORDS.length);
  });

  it('copies lesson words verbatim and marks every added word', () => {
    const lesson = arabicQuests.lessons.find((l) => l.id === 'arabic-words')!;
    for (const word of WORDS) {
      if (word.origin === 'content') {
        const section = lesson.sections.find((s) => s.arabic === word.arabic);
        expect({ id: word.id, found: !!section }).toEqual({ id: word.id, found: true });
        expect(section?.transliteration).toBe(word.translit);
        expect(section?.body).toEqual(word.meaning);
        expect(word.note).toBeUndefined();
      } else {
        expect(word.note).toBe(BASIC_NOTE);
        expect(lesson.sections.some((s) => s.arabic === word.arabic)).toBe(false);
      }
    }
  });

  it('has enough words for every level', () => {
    for (const level of [1, 2, 3] as const) {
      const cfg = config(level);
      for (let play = 0; play < 8; play++) {
        const words = pickWords(cfg, play, 'seed');
        expect(words).toHaveLength(cfg.words);
        for (const a of cfg.anchors) expect(words.map((w) => w.id)).toContain(a);
        for (const w of words) {
          const n = wordLetters(w).length;
          expect(n >= cfg.minLetters && n <= cfg.maxLetters).toBe(true);
          if (cfg.mode === 'missing') expect(missingIndex(w)).not.toBeNull();
        }
      }
    }
  });

  it('validates slots right to left by letter, and offers look-alike options', () => {
    const kitab = getWord('kitab')!;
    expect(wordLetters(kitab).map((l) => l.base)).toEqual(['ك', 'ت', 'ا', 'ب']);
    expect(fitsSlot(kitab, 0, 'ك')).toBe(true);
    expect(fitsSlot(kitab, 0, 'ت')).toBe(false);
    expect(fitsSlot(kitab, 1, 'ت')).toBe(true);
    expect(fitsSlot(kitab, 4, 'ب')).toBe(false);
    // Equal letters are interchangeable (هُدْهُد has two ه and two د).
    const hudhud = getWord('hudhud')!;
    expect(fitsSlot(hudhud, 3, 'د')).toBe(true);
    const tiles = wordTiles(kitab, () => 0.1);
    expect(tiles.map((x) => x.base).sort()).toEqual(['ا', 'ب', 'ت', 'ك'].sort());
    expect(tiles.map((x) => x.base)).not.toEqual(['ك', 'ت', 'ا', 'ب']);
    expect(missingIndex(kitab)).toBe(1);
    const options = missingOptions(kitab, 4, () => 0.3);
    expect(options).toHaveLength(4);
    expect(new Set(options).size).toBe(4);
    expect(options).toContain('ت');
    expect(options.filter((o) => ['ب', 'ث', 'ن', 'ي'].includes(o)).length).toBeGreaterThanOrEqual(2);
  });

  it('scores to stars and reports only really missed facts', () => {
    expect(wordResult(12, [], config(1).factRules)).toEqual({ score: 12, maxScore: 12, stars: 3, mistakes: 0, factsMissed: [] });
    const m = (word: string, expected: string, chosen: string) => ({ word, expected, chosen });
    expect(wordMissedFacts(config(3).factRules, [m('kitab', 'ت', 'ث')])).toEqual([WORD_FACTS.dots.id]);
    expect(wordMissedFacts(config(3).factRules, [m('jamal', 'ج', 'خ')])).toEqual([]);
    expect(wordMissedFacts(config(2).factRules, [m('kitab', 'ك', 'ا'), m('kitab', 'ت', 'ا')])).toEqual([WORD_FACTS.kitab.id]);
    expect(wordMissedFacts(config(1).factRules, [m('bab', 'ب', 'ا'), m('bab', 'ب', 'ا'), m('nur', 'ن', 'ر')])).toEqual([WORD_FACTS.joining.id]);
    expect(wordResult(12, [m('a', 'b', 'c'), m('a', 'b', 'c'), m('a', 'b', 'c')], []).stars).toBe(1);
  });

  it('copies language facts from the content with neutral sources', () => {
    const lesson = arabicQuests.lessons.find((l) => l.id === 'arabic-words')!;
    const kitab = lesson.sections.find((s) => s.arabic === 'كِتَاب')!;
    expect(WORD_FACTS.kitab.text.en).toBe(`${kitab.arabic} (${kitab.transliteration}) – ${kitab.body.en}`);
    expect(WORD_FACTS.masjid.text).toEqual(arabicQuests.facts.find((f) => f.id === 'arabic-fact-masjid')!.text);
    for (const fact of [WORD_FACTS.nur, WORD_FACTS.kitab, WORD_FACTS.masjid]) {
      expect(fact.kind).toBe('language');
      expect(fact.sources).toEqual([LANGUAGE_SOURCES.vocabulary]);
    }
    expect(getQuestionByKey(WORD_FACTS.masjid.reviewKey)).toBeDefined();
  });

  it.each([1, 2, 3] as const)('plays level %i with taps until every picture appears', async (level) => {
    setArabicVoiceForTests(false);
    const cfg = config(level);
    const words = pickWords(cfg, 0, `${WORD_BUILDER_ID}:${level}`);
    const done = jest.fn();
    const api: GameApi<WordBuilderConfig> = {
      gameId: WORD_BUILDER_ID,
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
      tree = create(<WordBuilderGame {...api} />);
    });
    const root = tree.root;
    await press(control(root, 'Start'), 'start');
    let points = 0;
    for (const [i, word] of words.entries()) {
      const letters = wordLetters(word);
      if (cfg.mode === 'missing') {
        points += 1;
        const answer = letters[missingIndex(word)!].base;
        if (i === 0) {
          const wrongTile = root.findAll((n) => typeof n.props.onPress === 'function' && /^Letter /.test(String(n.props.accessibilityLabel)) && n.props.accessibilityLabel !== t('a11y.tile', { letter: answer }))[0];
          await press(wrongTile, 'wrong option');
        }
        await press(control(root, t('a11y.tile', { letter: answer })), answer);
      } else {
        points += letters.length;
        if (i === 0) {
          const wrong = letters.find((l) => l.base !== letters[0].base)!;
          await press(control(root, t('a11y.tile', { letter: wrong.base })), 'wrong tile');
        }
        for (const l of letters) await press(control(root, t('a11y.tile', { letter: l.base })), l.base);
      }
      await press(control(root, i + 1 < words.length ? t('play.nextWord') : 'Continue'), 'next');
    }
    await press(control(root, t('play.finish')), 'finish');
    expect(done).toHaveBeenCalledTimes(1);
    expect(done.mock.calls[0][0]).toMatchObject({ maxScore: points, score: points - 1, mistakes: 1, stars: 2 });
    await act(async () => tree.unmount());
  }, 30000);
});
