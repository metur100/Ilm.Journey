import { registerGame, type GameFact } from '@/core/games';
import type { ConnectPair } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';
import { LANGUAGE_SOURCES, type LocalizedText } from '@/core/models';

import { arabicGame } from '../shared/define';
import type { ConnectConfig } from '../shared/engineGames';
import { LETTER_LESSON } from '../shared/lessonText';
import { LETTERS, letterInfo } from '../shared/letters';

/*
 * Sufara Review: every letter of the Bosnian sufara, in course order (elif … lam-elif, ya), matched with its name.
 * Three levels of 10 / 10 / 9 pairs – the whole alphabet, not only the letters of one lesson.
 */

const LAM_ELIF = 'لا';
const ALL_LETTERS: readonly string[] = LETTERS.flatMap((l) => (l.letter === 'ي' ? [LAM_ELIF, l.letter] : [l.letter]));

const nameOf = (letter: string): LocalizedText =>
  letter === LAM_ELIF ? { en: 'Lam-alif', de: 'Lam-Alif', bs: 'Lam-elif' } : letterInfo(letter)!.name;

const pair = (letter: string): ConnectPair => ({
  id: letter,
  left: { arabic: letter, a11y: nameOf(letter) },
  right: { label: nameOf(letter) },
});

const fact = (id: string, text: LocalizedText): GameFact => ({
  id,
  kind: 'language',
  text,
  sources: [LANGUAGE_SOURCES.alphabet],
  art: 'object.pen',
});

const factIdOf = (letter: string): string => `sufara-letter-${String(ALL_LETTERS.indexOf(letter) + 1).padStart(2, '0')}`;

const letterFact = (letter: string): GameFact => {
  const name = nameOf(letter).bs;
  const line = letter === LAM_ELIF ? { en: 'Lam and alif joined into one sign.', de: 'Lam und Alif zu einem Zeichen verbunden.', bs: 'Lam i elif spojeni u jedan znak.' } : LETTER_LESSON[letter];
  return fact(factIdOf(letter), { en: `${name}: ${line.en}`, de: `${name}: ${line.de}`, bs: `${name}: ${line.bs}` });
};

const level = (letters: readonly string[], hints: boolean, facts: GameFact[]) => ({
  config: { pairs: letters.map(pair), hints, prompt: 'play.prompt', factOf: Object.fromEntries(letters.map((l) => [l, factIdOf(l)])) },
  facts,
});

const first = ALL_LETTERS.slice(0, 10);
const second = ALL_LETTERS.slice(10, 20);
const third = ALL_LETTERS.slice(20);

export const sufaraReviewI18n = defineNamespace('game.sufara-review', {
  en: {
    title: 'Sufara Review',
    description: 'All 28 letters and lam-alif: match every letter with its name.',
    howTo: 'Draw a line between each Arabic letter and its name. The letters follow the order of the sufara.',
    'play.prompt': 'Match the letter with its name.',
  },
  de: {
    title: 'Sufara-Wiederholung',
    description: 'Alle 28 Buchstaben und Lam-Alif: Ordne jedem Buchstaben seinen Namen zu.',
    howTo: 'Zieh eine Linie zwischen dem arabischen Buchstaben und seinem Namen. Die Buchstaben folgen der Sufara-Reihenfolge.',
    'play.prompt': 'Ordne den Buchstaben seinem Namen zu.',
  },
  bs: {
    title: 'Ponavljanje sufare',
    description: 'Svih 28 harfova i lam-elif: spoji svaki harf s njegovim imenom.',
    howTo: 'Povuci liniju između arapskog harfa i njegovog imena. Harfovi idu redoslijedom sufare.',
    'play.prompt': 'Spoji harf s njegovim imenom.',
  },
});

export const sufaraReviewGame = arabicGame<ConnectConfig>({
  id: 'sufara-review',
  i18n: sufaraReviewI18n,
  coverArt: 'arabic.sufara-book',
  hintArt: 'object.pen',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  load: () => (require('../shared/engineGames') as typeof import('../shared/engineGames')).ConnectGame,
  levels: [level(first, true, [letterFact(first[0]), letterFact(first[first.length - 1])]), level(second, false, [letterFact(second[0]), letterFact(second[second.length - 1])]), level(third, false, [letterFact(third[0]), letterFact(third[third.length - 1])])],
  order: 125,
});

export function registerSufaraReviewGame(): void {
  registerGame(sufaraReviewGame);
}
