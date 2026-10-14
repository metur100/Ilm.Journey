import type React from 'react';

import { hasArt } from '@/core/art';
import { type GameApi, type GameDef, type GameResultInput, getGame, validateGame } from '@/core/games';
import { translateNs } from '@/core/i18n';
import { factSourceProblem, LANGUAGE_SOURCES } from '@/core/models';
import { getCollectionCards, getQuestionByKey } from '@/core/registry';
import { registerFeatures } from '@/features';
import arabicHarakat from '@/features/learn/content/arabic/arabic-harakat.json';
import { ALPHABET } from '@/features/learn/content/quests';
import arabicQuests from '@/features/learn/content/quests/arabic.json';

import { setArabicVoiceForTests } from '../../ayah-builder/kit';
import { LANTERN_FACTS } from '../facts';
import { letterLanternsI18n } from '../i18n';
import { LETTERS } from '../letters';
import { LetterLanternsGame } from '../LetterLanternsGame';
import { buildSteps, distractors, FORM_LETTERS, lanternMissedFacts, lanternResult, type LetterLanternsConfig, syllableReading } from '../logic';
import { LETTER_LANTERNS_ART, LETTER_LANTERNS_ID, letterLanternsGame } from '../register';
import { formsInWord, letterForm, partialWord, positionsInWord, splitLetters, TATWEEL } from '../script';

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
const t = (key: string, params?: Record<string, string | number>) => translateNs(letterLanternsI18n, 'en', key as never, params);
const config = (level: 1 | 2 | 3) => letterLanternsGame.levels[level - 1].config;

describe('Arabic script helpers', () => {
  it('splits letters with their marks without losing anything', () => {
    for (const word of ['كِتَاب', 'مَسْجِد', 'جَنَّة', 'هُدْهُد', 'مَاء']) expect(splitLetters(word).map((l) => l.text).join('')).toBe(word);
    expect(splitLetters('جَنَّة').map((l) => l.base)).toEqual(['ج', 'ن', 'ة']);
  });

  it('generates letter forms as real text with tatweel', () => {
    expect(letterForm('ب', 'isolated')).toBe('ب');
    expect(letterForm('ب', 'initial')).toBe(`ب${TATWEEL}`);
    expect(letterForm('ب', 'medial')).toBe(`${TATWEEL}ب${TATWEEL}`);
    expect(letterForm('ب', 'final')).toBe(`${TATWEEL}ب`);
    // Letters that never join forward have no own initial / medial shape.
    expect(letterForm('ا', 'initial')).toBe('ا');
    expect(letterForm('د', 'medial')).toBe(`${TATWEEL}د`);
    expect(formsInWord('كِتَاب')).toEqual([`كِ${TATWEEL}`, `${TATWEEL}تَ${TATWEEL}`, `${TATWEEL}ا`, 'ب']);
    expect(positionsInWord(splitLetters('مَاء'))).toEqual(['initial', 'final', 'isolated']);
    expect(partialWord('كِتَاب', 2)).toBe(`كِتَ${TATWEEL}`);
    expect(partialWord('كِتَاب', 3)).toBe('كِتَا');
    expect(partialWord('كِتَاب', 4)).toBe('كِتَاب');
    expect(FORM_LETTERS).not.toContain('ا');
    expect(FORM_LETTERS).toContain('ع');
  });
});

describe('Letter Lanterns', () => {
  it('registers a valid game with existing art', () => {
    expect(() => validateGame(getGame(LETTER_LANTERNS_ID)!)).not.toThrow();
    for (const name of LETTER_LANTERNS_ART) expect({ name, ok: hasArt(name) }).toEqual({ name, ok: true });
  });

  it('copies its letters from the Arabic letter lessons', () => {
    expect(LETTERS.map((l) => [l.position, l.letter, l.translit])).toEqual(ALPHABET.map((a) => [a.position, a.letter, a.name]));
    for (const l of LETTERS) {
      const content = ALPHABET.find((a) => a.letter === l.letter)!;
      for (const lang of ['en', 'de', 'bs'] as const) expect(content.description[lang].startsWith(`${l.name[lang]} – `)).toBe(true);
    }
  });

  it('builds steps with exactly one right lantern and fitting distractors', () => {
    for (const level of [1, 2, 3] as const) {
      for (let play = 0; play < 6; play++) {
        const steps = buildSteps(config(level), play, 'seed');
        expect(steps).toHaveLength(8);
        for (const step of steps) {
          expect(step.options.filter((o) => o.correct)).toHaveLength(1);
          expect(new Set(step.options.map((o) => o.text)).size).toBe(step.options.length);
          expect(step.options.length).toBe(4);
          if (level === 2) {
            const right = step.options.find((o) => o.correct)!;
            expect(right.text).toBe(letterForm(step.letter, step.position!));
            expect(right.text).toContain(TATWEEL);
          }
          if (level === 3) expect(step.options.filter((o) => o.letter === step.letter)).toHaveLength(3);
        }
      }
    }
    expect(buildSteps(config(1), 0, 'a')).toEqual(buildSteps(config(1), 0, 'a'));
    // Same-name letters (ت / ط are both "Ta") never share a step.
    expect(distractors('ت', LETTERS.map((l) => l.letter), 10, () => 0.5)).not.toContain('ط');
    expect(syllableReading('ب', 'fatha', 'en')).toBe('ba');
    expect(syllableReading('ب', 'fatha', 'bs')).toBe('be');
    expect(syllableReading('م', 'damma', 'de')).toBe('mu');
  });

  it('only sends a fact to review when that fact was really missed', () => {
    const [step] = buildSteps({ ...config(1) }, 0, 'x');
    const ba = { ...step, letter: 'ب' };
    const tapped = (letter: string, haraka?: 'fatha' | 'kasra' | 'damma') => ({ id: letter, text: letter, letter, haraka, correct: false });
    expect(lanternMissedFacts(config(1).factRules, [{ step: ba, tapped: tapped('ت') }])).toEqual([LANTERN_FACTS.dots.id]);
    expect(lanternMissedFacts(config(1).factRules, [{ step: ba, tapped: tapped('م') }])).toEqual([]);
    const bu = { ...step, letter: 'ب', haraka: 'damma' as const };
    expect(lanternMissedFacts(config(3).factRules, [{ step: bu, tapped: tapped('ب', 'fatha') }])).toEqual([]);
    expect(lanternMissedFacts(config(3).factRules, [{ step: bu, tapped: tapped('ب', 'fatha') }, { step: bu, tapped: tapped('ب', 'kasra') }])).toEqual([LANTERN_FACTS.harakat.id]);
    expect(lanternResult(8, [], config(1).factRules)).toEqual({ score: 16, maxScore: 16, stars: 3, mistakes: 0, factsMissed: [] });
  });

  it('copies language facts from the Arabic content and cites the neutral alphabet reference', () => {
    const question = (id: string) => arabicQuests.questions.find((q) => q.id === id)!;
    expect(LANTERN_FACTS.dots.text).toEqual(question('arabic-dots-ba').explanation);
    expect(LANTERN_FACTS.alphabet.text).toEqual(question('arabic-28').explanation);
    expect(LANTERN_FACTS.joining.text).toEqual(arabicQuests.facts.find((f) => f.id === 'arabic-fact-rtl')!.text);
    for (const lang of ['en', 'de', 'bs'] as const) expect(arabicHarakat.lesson[0].body[lang].startsWith(LANTERN_FACTS.harakat.text[lang])).toBe(true);
    for (const fact of Object.values(LANTERN_FACTS)) {
      expect(fact.kind).toBe('language');
      expect(fact.sources).toEqual([LANGUAGE_SOURCES.alphabet]);
      expect(getQuestionByKey(fact.reviewKey)).toBeDefined();
    }
  });

  it.each([1, 2, 3] as const)('plays level %i (reduced motion: lanterns in a grid)', async (level) => {
    jest.useFakeTimers();
    setArabicVoiceForTests(false);
    const cfg = config(level);
    const steps = buildSteps(cfg, 0, `${LETTER_LANTERNS_ID}:${level}`);
    const done = jest.fn();
    const api: GameApi<LetterLanternsConfig> = {
      gameId: LETTER_LANTERNS_ID,
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
      tree = create(<LetterLanternsGame {...api} />);
    });
    const root = tree.root;
    await press(control(root, 'Start'), 'start');
    for (const [i, step] of steps.entries()) {
      if (i === 0) {
        const wrong = step.options.find((o) => !o.correct)!;
        await press(control(root, t('a11y.lantern', { text: wrong.text })), 'wrong');
      }
      const right = step.options.find((o) => o.correct)!;
      await press(control(root, t('a11y.lantern', { text: right.text })), `step ${i}`);
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
    }
    await press(control(root, t('play.finish')), 'finish');
    expect(done).toHaveBeenCalledTimes(1);
    expect(done.mock.calls[0][0]).toMatchObject({ maxScore: 16, score: 15, mistakes: 1, stars: 2 });
    await act(async () => tree.unmount());
    jest.useRealTimers();
  }, 30000);
});

describe('Language facts and sources (letter cards fix)', () => {
  it('gives the Arabic letter cards a neutral language source instead of a Quran verse', () => {
    const letters = getCollectionCards().filter((c) => c.category === 'letters');
    expect(letters.length).toBeGreaterThan(0);
    for (const card of letters) {
      expect(card.kind).toBe('language');
      expect(card.sources).toEqual([LANGUAGE_SOURCES.alphabet]);
      expect(card.sources.some((s) => s.sourceName === 'Quran')).toBe(false);
    }
  });

  it('keeps the source rule strict for religious facts and honest for language facts', () => {
    expect(factSourceProblem(undefined, [{ sourceName: 'Quran', sourceReference: '5:6' }])).toBeNull();
    expect(factSourceProblem(undefined, [LANGUAGE_SOURCES.alphabet])).not.toBeNull();
    expect(factSourceProblem('religious', [])).not.toBeNull();
    expect(factSourceProblem('language', [LANGUAGE_SOURCES.alphabet])).toBeNull();
    expect(factSourceProblem('language', [LANGUAGE_SOURCES.alphabet, { sourceName: 'Quran', sourceReference: '12:2' }])).not.toBeNull();
    expect(factSourceProblem('language', [{ sourceName: 'Quran', sourceReference: '12:2' }])).not.toBeNull();
    const game = getGame(LETTER_LANTERNS_ID) as GameDef<unknown>;
    const withFacts = (fact: object): GameDef<unknown> => ({ ...game, levels: [{ ...game.levels[0], facts: [{ ...game.levels[0].facts[0], ...fact }] }] });
    expect(() => validateGame(withFacts({ sources: [LANGUAGE_SOURCES.alphabet, { sourceName: 'Quran', sourceReference: '12:2' }] }))).toThrow(/Quran verse/);
    expect(() => validateGame(withFacts({ kind: undefined }))).toThrow(/religious source/);
  });
});
