import { registerGame } from '@/core/games';
import { defineNamespace } from '@/core/i18n';

import { arabicGame } from '../shared/define';
import { FACTS, letterFact } from '../shared/facts';
import { lettersRange, SUFARA_LETTER_ORDER } from '../shared/letters';
import type { LetterLanternsConfig } from './logic';

/*
 * Letter Lanterns (v2 game, reworked on the kit's CatchGame; the id is kept for existing progress).
 * L1 hear and see the letter, catch its lanterns · L2 catch the letter in its word shapes · L3 the voice only.
 */

export const letterLanternsI18n = defineNamespace('game.letter-lanterns', {
  en: {
    title: 'Letter Lanterns',
    description: 'Lanterns with Arabic letters float down the night sky. Catch the ones that carry the letter you hear.',
    howTo: 'Listen to the letter, then move the basket under its lanterns – or tap a lantern to catch it.',
    'play.prompt.isolated': 'Catch three lanterns with {name}.',
    'play.prompt.forms': 'Catch {name} in every shape it takes inside a word.',
    'play.promptSound': 'Listen – then catch three lanterns with that letter.',
    'play.listen': 'Listen to the letter',
  },
  de: {
    title: 'Buchstaben-Laternen',
    description: 'Laternen mit arabischen Buchstaben schweben vom Nachthimmel. Fang die, die den Buchstaben tragen, den du hörst.',
    howTo: 'Hör dir den Buchstaben an und schieb den Korb unter seine Laternen – oder tippe eine Laterne an.',
    'play.prompt.isolated': 'Fang drei Laternen mit {name}.',
    'play.prompt.forms': 'Fang {name} in jeder Form, die es im Wort annimmt.',
    'play.promptSound': 'Hör genau hin – und fang drei Laternen mit diesem Buchstaben.',
    'play.listen': 'Buchstaben anhören',
  },
  bs: {
    title: 'Fenjeri harfova',
    description: 'Fenjeri s arapskim harfovima lebde niz noćno nebo. Uhvati one koji nose harf koji čuješ.',
    howTo: 'Poslušaj harf, pa pomjeri korpu ispod njegovih fenjera – ili dodirni fenjer da ga uhvatiš.',
    'play.prompt.isolated': 'Uhvati tri fenjera s harfom {name}.',
    'play.prompt.forms': 'Uhvati {name} u svakom obliku koji ima u riječi.',
    'play.promptSound': 'Poslušaj – pa uhvati tri fenjera s tim harfom.',
    'play.listen': 'Poslušaj harf',
  },
});

const range = (from: number, to: number) => lettersRange(from, to).map((l) => l.letter);

export const letterLanternsGame = arabicGame<LetterLanternsConfig>({
  id: 'letter-lanterns',
  i18n: letterLanternsI18n,
  coverArt: 'object.lantern-ramadan',
  hintArt: 'kit.catch',
  load: () => (require('./LetterLanternsGame') as typeof import('./LetterLanternsGame')).LetterLanternsGame,
  levels: [
    { config: { mode: 'isolated', pool: range(1, 14), rounds: 4, hints: true }, facts: [FACTS.dots, FACTS.alphabet] },
    { config: { mode: 'forms', pool: [...SUFARA_LETTER_ORDER], rounds: 4, hints: false }, facts: [FACTS.joining] },
    { config: { mode: 'sound', pool: range(15, 28), rounds: 4, hints: false }, facts: [letterFact('ع')] },
  ],
  teaches: { questionKeys: ['quest:arabic-dots-ba', 'quest:arabic-28', 'quest:arabic-rtl'] },
  order: 20,
});

export function registerLetterLanternsGame(): void {
  registerGame(letterLanternsGame);
}
