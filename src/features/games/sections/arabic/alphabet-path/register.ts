import { registerGame } from '@/core/games';
import type { KitItem } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { arabicGame } from '../shared/define';
import type { SequenceConfig } from '../shared/engineGames';
import { FACTS, letterFact } from '../shared/facts';
import { mustLetter } from '../shared/letters';

/*
 * Alphabet Path (SequenceBoard): lay the letters on the stepping stones in the order of the alphabet (the sufara order).
 * L1 alif … ha with hints · L2 kha … shin · L3 seven letters from the whole alphabet, ordered in a list from memory.
 */

export const alphabetPathI18n = defineNamespace('game.alphabet-path', {
  en: {
    title: 'Alphabet Path',
    description: 'Walk the path of the alphabet: put the letters on the stones in the order of the sufara.',
    howTo: 'Drag the next letter of the alphabet onto the glowing stone.',
    'play.path': 'Which letter comes next in the alphabet?',
    'play.list': 'Put these letters in the order of the alphabet, then tap Check.',
  },
  de: {
    title: 'Alphabet-Pfad',
    description: 'Geh den Pfad des Alphabets: Lege die Buchstaben in der Reihenfolge der Sufara auf die Steine.',
    howTo: 'Zieh den nächsten Buchstaben des Alphabets auf den leuchtenden Stein.',
    'play.path': 'Welcher Buchstabe kommt als Nächstes im Alphabet?',
    'play.list': 'Bring diese Buchstaben in die Reihenfolge des Alphabets und tippe auf Prüfen.',
  },
  bs: {
    title: 'Staza harfova',
    description: 'Prođi stazom pisma: poredaj harfove na kamenove redom kao u sufari.',
    howTo: 'Prevuci sljedeći harf pisma na kamen koji svijetli.',
    'play.path': 'Koji harf dolazi sljedeći u pismu?',
    'play.list': 'Poredaj ove harfove redom kao u pismu, pa dodirni Provjeri.',
  },
});

export const letterItems = (letters: string[]): KitItem[] =>
  letters.map((letter) => {
    const info = mustLetter(letter);
    return { id: `l${info.position}`, arabic: letter, label: info.name };
  });

export const alphabetPathGame = arabicGame<SequenceConfig>({
  id: 'alphabet-path',
  i18n: alphabetPathI18n,
  coverArt: 'arabic.alphabet-path',
  hintArt: 'kit.path-stone',
  load: () => (require('../shared/engineGames') as typeof import('../shared/engineGames')).SequenceGame,
  levels: [
    { config: { items: letterItems(['ا', 'ب', 'ت', 'ث', 'ج', 'ح']), variant: 'path', columns: 3, hints: true, prompt: 'play.path' }, facts: [FACTS.order] },
    { config: { items: letterItems(['خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش']), variant: 'path', columns: 4, hints: false, prompt: 'play.path' }, facts: [letterFact('خ'), FACTS.shin] },
    { config: { items: letterItems(['ج', 'د', 'س', 'ع', 'ف', 'م', 'ي']), variant: 'list', hints: false, prompt: 'play.list' }, facts: [FACTS.alphabet, FACTS.mim] },
  ],
  teaches: { questionKeys: ['quest:arabic-alphabet-order', 'quest:arabic-28'] },
  order: 30,
});

export function registerAlphabetPathGame(): void {
  registerGame(alphabetPathGame);
}
