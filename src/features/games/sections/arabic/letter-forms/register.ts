import { registerGame } from '@/core/games';
import type { ConnectPair } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { arabicGame } from '../shared/define';
import type { ConnectConfig } from '../shared/engineGames';
import { FACTS, letterFact } from '../shared/facts';
import { mustLetter } from '../shared/letters';
import { letterForm, type LetterPosition } from '../shared/script';

/*
 * Letter Forms (ConnectPairs): connect each letter on its own with the shape it takes inside a word – rendered as real
 * text with a joining stroke (بـ ـبـ ـب). L1 the start form with hints · L2 the end form · L3 the middle form of the
 * look-alike letters (ب ت ث ن ي), where only the dots tell them apart.
 */

export const letterFormsI18n = defineNamespace('game.letter-forms', {
  en: {
    title: 'Letter Forms',
    description: 'Inside a word a letter changes its shape. Connect every letter with its shape at the start, in the middle or at the end of a word.',
    howTo: 'Draw a line from a letter on the left to the same letter in its word form on the right.',
    'play.initial': 'Connect each letter with its shape at the START of a word.',
    'play.final': 'Connect each letter with its shape at the END of a word.',
    'play.medial': 'Connect each letter with its shape in the MIDDLE of a word – watch the dots.',
  },
  de: {
    title: 'Buchstabenformen',
    description: 'Im Wort ändert ein Buchstabe seine Form. Verbinde jeden Buchstaben mit seiner Form am Anfang, in der Mitte oder am Ende eines Wortes.',
    howTo: 'Zieh eine Linie von einem Buchstaben links zum selben Buchstaben in seiner Wortform rechts.',
    'play.initial': 'Verbinde jeden Buchstaben mit seiner Form am ANFANG eines Wortes.',
    'play.final': 'Verbinde jeden Buchstaben mit seiner Form am ENDE eines Wortes.',
    'play.medial': 'Verbinde jeden Buchstaben mit seiner Form in der MITTE eines Wortes – achte auf die Punkte.',
  },
  bs: {
    title: 'Oblici harfova',
    description: 'U riječi harf mijenja oblik. Spoji svaki harf s njegovim oblikom na početku, u sredini ili na kraju riječi.',
    howTo: 'Povuci liniju od harfa lijevo do istog harfa u obliku iz riječi desno.',
    'play.initial': 'Spoji svaki harf s njegovim oblikom na POČETKU riječi.',
    'play.final': 'Spoji svaki harf s njegovim oblikom na KRAJU riječi.',
    'play.medial': 'Spoji svaki harf s njegovim oblikom u SREDINI riječi – pazi na tačke.',
  },
});

export const formPairs = (letters: string[], position: LetterPosition): ConnectPair[] =>
  letters.map((letter) => {
    const info = mustLetter(letter);
    return { id: `l${info.position}`, left: { arabic: letter, label: info.name }, right: { arabic: letterForm(letter, position), a11y: info.name } };
  });

const level = (letters: string[], position: LetterPosition, hints: boolean) => ({ pairs: formPairs(letters, position), hints, prompt: `play.${position}` }) satisfies ConnectConfig;

export const letterFormsGame = arabicGame<ConnectConfig>({
  id: 'letter-forms',
  i18n: letterFormsI18n,
  coverArt: 'arabic.four-forms',
  hintArt: 'kit.connect',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  load: () => (require('../shared/engineGames') as typeof import('../shared/engineGames')).ConnectGame,
  levels: [
    { config: level(['ب', 'ج', 'س', 'ع'], 'initial', true), facts: [FACTS.fourForms] },
    { config: level(['ف', 'ق', 'ك', 'م', 'ه'], 'final', false), facts: [FACTS.shapes] },
    { config: level(['ب', 'ت', 'ث', 'ن', 'ي'], 'medial', false), facts: [FACTS.dots, letterFact('ن')] },
  ],
  teaches: { questionKeys: ['quest:arabic-rtl', 'quest:arabic-dots-ba'] },
  order: 60,
});

export function registerLetterFormsGame(): void {
  registerGame(letterFormsGame);
}
