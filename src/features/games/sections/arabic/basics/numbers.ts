import { registerGame } from '@/core/games';
import { defineNamespace } from '@/core/i18n';

import { arabicGame, type LevelSpec } from '../shared/define';
import type { MemoryConfig } from '../shared/engineGames';
import { NUMBERS, type NumberWord, numberFact, numberPair } from './data';
import { loadMemoryGame } from './engines';

/*
 * Arabic Numbers (MemoryPairs): the number words 1–10 and their Arabic-Indic numeral. L1 one to four with a peek ·
 * L2 three to seven · L3 six to ten.
 */

const COVER = 'object.clock';

export const numbersI18n = defineNamespace('game.arabic-numbers', {
  en: {
    title: 'Arabic Numbers',
    description: 'Learn the Arabic words for the numbers from one to ten.',
    howTo: 'Flip two cards and find each number word with its numeral.',
    'play.find': 'Find each number word with its numeral.',
  },
  de: {
    title: 'Arabische Zahlen',
    description: 'Lerne die arabischen Wörter für die Zahlen von eins bis zehn.',
    howTo: 'Dreh zwei Karten um und finde jedes Zahlwort mit seiner Ziffer.',
    'play.find': 'Finde jedes Zahlwort mit seiner Ziffer.',
  },
  bs: {
    title: 'Arapski brojevi',
    description: 'Nauči arapske riječi za brojeve od jedan do deset.',
    howTo: 'Okreni dvije karte i pronađi svaku riječ za broj s njenom cifrom.',
    'play.find': 'Pronađi svaku riječ za broj s njenom cifrom.',
  },
});

const level = (numbers: NumberWord[], facts: NumberWord[], hints: boolean, peekMs?: number): LevelSpec<MemoryConfig> => ({
  config: { pairs: numbers.map(numberPair), hints, peekMs, prompt: 'play.find' },
  facts: facts.map((x) => numberFact(x, COVER)),
});

export const arabicNumbersGame = arabicGame<MemoryConfig>({
  id: 'arabic-numbers',
  i18n: numbersI18n,
  coverArt: COVER,
  hintArt: 'kit.cards',
  load: loadMemoryGame,
  levels: [
    level(NUMBERS.slice(0, 4), [NUMBERS[0], NUMBERS[1], NUMBERS[2]], true, 2200),
    level(NUMBERS.slice(2, 7), [NUMBERS[3], NUMBERS[4], NUMBERS[5]], false),
    level(NUMBERS.slice(5, 10), [NUMBERS[7], NUMBERS[8], NUMBERS[9]], false),
  ],
  order: 151,
});

export function registerArabicNumbersGame(): void {
  registerGame(arabicNumbersGame);
}
