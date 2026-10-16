import { registerGame } from '@/core/games';
import { defineNamespace } from '@/core/i18n';

import { arabicGame } from '../shared/define';
import { FACTS, letterFact } from '../shared/facts';
import { lettersRange } from '../shared/letters';
import type { LetterTraceConfig } from './LetterTraceGame';

/*
 * Letter Tracing (TraceShape): the first step of the sufara – meet every letter (hear it, read its lesson line) and
 * trace it. L1 alif … dhal with hints · L2 ra … ghayn · L3 fa … ya, stricter.
 */

export const letterTraceI18n = defineNamespace('game.letter-trace', {
  en: {
    title: 'Letter Tracing',
    description: 'Meet the 28 letters one by one: hear each letter, read how it sounds and trace it with your finger.',
    howTo: 'Listen to the letter, then cover the big guide letter with your finger until it is traced.',
    'play.prompt': 'Trace the letter with your finger.',
    'play.listen': 'Listen to {name}',
  },
  de: {
    title: 'Buchstaben nachspuren',
    description: 'Lerne die 28 Buchstaben einzeln kennen: Hör jeden Buchstaben, lies, wie er klingt, und spur ihn mit dem Finger nach.',
    howTo: 'Hör dir den Buchstaben an und fahre den großen Buchstaben mit dem Finger nach, bis er ausgefüllt ist.',
    'play.prompt': 'Spur den Buchstaben mit dem Finger nach.',
    'play.listen': '{name} anhören',
  },
  bs: {
    title: 'Pisanje harfova',
    description: 'Upoznaj 28 harfova jedan po jedan: poslušaj svaki harf, pročitaj kako se izgovara i ispiši ga prstom.',
    howTo: 'Poslušaj harf, pa prstom prelazi preko velikog harfa dok ga ne ispišeš.',
    'play.prompt': 'Ispiši harf prstom.',
    'play.listen': 'Poslušaj {name}',
  },
});

const range = (from: number, to: number) => lettersRange(from, to).map((l) => l.letter);

export const letterTraceGame = arabicGame<LetterTraceConfig>({
  id: 'letter-trace',
  i18n: letterTraceI18n,
  coverArt: 'arabic.trace-tablet',
  hintArt: 'kit.trace',
  load: () => (require('./LetterTraceGame') as typeof import('./LetterTraceGame')).LetterTraceGame,
  levels: [
    { config: { letters: range(1, 9), hints: true, tolerance: 11 }, facts: [FACTS.alphabet, FACTS.order] },
    { config: { letters: range(10, 19), hints: false, tolerance: 9 }, facts: [FACTS.shin, FACTS.dad] },
    { config: { letters: range(20, 28), hints: false, tolerance: 8 }, facts: [FACTS.mim, letterFact('و')] },
  ],
  teaches: { questionKeys: ['quest:arabic-28', 'quest:arabic-alphabet-order', 'quest:arabic-shin', 'quest:arabic-mim'] },
  order: 10,
});

export function registerLetterTraceGame(): void {
  registerGame(letterTraceGame);
}
