import type { GameResultInput } from '@/core/games';
import type { Language } from '@/core/models';
import { hashString, seededRandom, shuffle } from '@/core/utils/random';

import { DOTS_GROUP, HARAKA_NAMES, HARAKAT, type Haraka, LETTERS, lookAlikes, SYLLABLE_LETTERS } from './letters';
import { hasAllForms, letterForm, type LetterPosition } from './script';

/*
 * Letter Lanterns rules (pure): which letter is asked, what the lanterns carry, scoring and missed facts.
 * L1 isolated letters · L2 the same letter in its initial / medial / final form (real text with tatweel) ·
 * L3 a letter with fatha / kasra / damma, found by its sound.
 */

export type LanternMode = 'isolated' | 'forms' | 'harakat';

export type FactRule = 'dotsConfusion' | 'formMistakes' | 'vowelConfusion';

export interface LetterLanternsConfig {
  mode: LanternMode;
  /** Letters to find per play. */
  targets: number;
  /** Lanterns in the sky per step. */
  lanterns: number;
  /** Seconds a lantern needs to rise through the sky (slower = calmer). */
  riseSeconds: number;
  /** Which level fact is sent to review for which kind of mistake. */
  factRules: readonly { factId: string; rule: FactRule }[];
}

export interface LanternOption {
  /** Unique in the step. */
  id: string;
  /** Text on the lantern (a letter, a form with tatweel, or a letter with a haraka). */
  text: string;
  letter: string;
  haraka?: Haraka;
  correct: boolean;
}

export interface LanternStep {
  letter: string;
  /** What is shown as the target (isolated letter; for harakat the syllable). */
  text: string;
  /** What the voice says. */
  say: string;
  haraka?: Haraka;
  position?: LetterPosition;
  options: LanternOption[];
}

const FORM_POSITIONS: readonly LetterPosition[] = ['initial', 'medial', 'final'];

/** Letters with all four shapes (they join on both sides) – used for the forms level. */
export const FORM_LETTERS: readonly string[] = LETTERS.map((l) => l.letter).filter(hasAllForms);

/** `count` letters of `pool`, a block that moves on with every play (wraps around). */
export function letterBlock<T>(pool: readonly T[], count: number, playIndex: number): T[] {
  const n = Math.min(count, pool.length);
  const start = (Math.max(0, Math.floor(playIndex)) * n) % pool.length;
  return Array.from({ length: n }, (_, i) => pool[(start + i) % pool.length]);
}

const sharesName = (a: string, b: string) => {
  const x = LETTERS.find((l) => l.letter === a);
  const y = LETTERS.find((l) => l.letter === b);
  return !!x && !!y && (['en', 'de', 'bs'] as const).some((lang) => x.name[lang] === y.name[lang]);
};

/** Distractor letters: look-alikes first (they teach the dots), then others – never one with the same name. */
export function distractors(letter: string, pool: readonly string[], count: number, random: () => number): string[] {
  const alike = shuffle(lookAlikes(letter).filter((l) => pool.includes(l)), random);
  const others = shuffle(
    pool.filter((l) => l !== letter && !alike.includes(l)),
    random,
  );
  const picked: string[] = [];
  for (const l of [...alike.slice(0, 2), ...others, ...alike.slice(2)]) {
    if (picked.length >= count) break;
    if (!picked.includes(l) && !sharesName(letter, l)) picked.push(l);
  }
  return picked;
}

export const syllable = (letter: string, haraka: Haraka) => letter + HARAKAT[haraka].mark;

/** Latin reading of a syllable in the learner's language (bs writes fatha as "e", like the lesson: بَ be). */
export function syllableReading(letter: string, haraka: Haraka, language: Language): string {
  const consonant = SYLLABLE_LETTERS.find((s) => s.letter === letter)?.consonant ?? '';
  return consonant + HARAKAT[haraka].vowel[language];
}

/** The steps of one play (deterministic for the same seed and play). */
export function buildSteps(config: LetterLanternsConfig, playIndex: number, seed: string): LanternStep[] {
  const random = seededRandom(hashString(`${seed}:${playIndex}`));
  const others = Math.max(1, config.lanterns - 1);

  if (config.mode === 'harakat') {
    const pool = SYLLABLE_LETTERS.map((s) => s.letter);
    const letters = shuffle(letterBlock(pool, config.targets, playIndex), random);
    return letters.map((letter, i) => {
      const haraka = HARAKA_NAMES[Math.floor(random() * HARAKA_NAMES.length)];
      const other = distractors(letter, pool, 1, random)[0] ?? pool[(pool.indexOf(letter) + 1) % pool.length];
      const options: LanternOption[] = [
        ...HARAKA_NAMES.map((h) => ({ id: `${i}-${letter}-${h}`, text: syllable(letter, h), letter, haraka: h, correct: h === haraka })),
        { id: `${i}-${other}-${haraka}`, text: syllable(other, haraka), letter: other, haraka, correct: false },
      ].slice(0, Math.max(config.lanterns, 3));
      return { letter, text: syllable(letter, haraka), say: syllable(letter, haraka), haraka, options: shuffle(options, random) };
    });
  }

  const pool = config.mode === 'forms' ? FORM_LETTERS : LETTERS.map((l) => l.letter);
  const letters = shuffle(letterBlock(pool, config.targets, playIndex), random);
  return letters.map((letter, i) => {
    const position = config.mode === 'forms' ? FORM_POSITIONS[(i + playIndex) % FORM_POSITIONS.length] : undefined;
    const show = (l: string) => (position ? letterForm(l, position) : l);
    const options: LanternOption[] = [letter, ...distractors(letter, pool, others, random)].map((l) => ({
      id: `${i}-${l}`,
      text: show(l),
      letter: l,
      correct: l === letter,
    }));
    return { letter, text: letter, say: letter, position, options: shuffle(options, random) };
  });
}

export interface WrongTap {
  step: LanternStep;
  tapped: LanternOption;
}

/** Facts the learner really got wrong: confused dotted letters, many form mistakes, or confused harakat. */
export function lanternMissedFacts(rules: LetterLanternsConfig['factRules'], wrong: readonly WrongTap[]): string[] {
  return rules
    .filter(({ rule }) => {
      if (rule === 'dotsConfusion') return wrong.some((w) => DOTS_GROUP.includes(w.step.letter) && DOTS_GROUP.includes(w.tapped.letter));
      if (rule === 'formMistakes') return wrong.length >= 3;
      return wrong.filter((w) => w.tapped.letter === w.step.letter && w.tapped.haraka !== w.step.haraka).length >= 2;
    })
    .map((r) => r.factId);
}

/** Two points per lantern, one off per wrong tap; stars 3 / 2 / 1 for 0 / ≤ 2 / more wrong taps. */
export function lanternResult(targets: number, wrong: readonly WrongTap[], rules: LetterLanternsConfig['factRules']): GameResultInput {
  const mistakes = wrong.length;
  return {
    score: Math.max(0, targets * 2 - mistakes),
    maxScore: targets * 2,
    stars: mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1,
    mistakes,
    factsMissed: lanternMissedFacts(rules, wrong),
  };
}
