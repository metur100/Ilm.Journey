import { registerGame } from '@/core/games';
import type { SortItem } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { arabicGame } from '../shared/define';
import { FACTS } from '../shared/facts';
import { mustLetter, NON_JOINERS } from '../shared/letters';
import type { NonJoinersConfig } from './NonJoinersGame';

/*
 * Non-joining letters (ا د ذ ر ز و). L1 sort letters: "joins the next letter" / "never joins the next letter"
 * (SortBins) · L2 build the bridges inside words with one break, with hints · L3 words with several breaks, no hints.
 */

export const nonJoinersI18n = defineNamespace('game.non-joiners', {
  en: {
    title: 'Letter Bridges',
    description: 'Six letters never join the letter after them: ا د ذ ر ز و. Find where a word holds hands and where it breaks.',
    howTo: 'Tap every gap where the two letters join. After ا د ذ ر ز و there is no bridge.',
    'play.sort': 'Does this letter join the letter after it?',
    'play.bridges': 'Tap the gaps where the letters join – then the word appears.',
    'play.noBridge': '{letter} ({name}) never joins the letter after it.',
    'bin.joins': 'Joins the next',
    'bin.never': 'Never joins the next',
    'a11y.gap': 'Gap between {a} and {b}',
  },
  de: {
    title: 'Buchstabenbrücken',
    description: 'Sechs Buchstaben verbinden sich nie mit dem Buchstaben danach: ا د ذ ر ز و. Finde, wo sich ein Wort die Hand gibt und wo es abbricht.',
    howTo: 'Tippe jede Lücke an, an der sich zwei Buchstaben verbinden. Nach ا د ذ ر ز و gibt es keine Brücke.',
    'play.sort': 'Verbindet sich dieser Buchstabe mit dem Buchstaben danach?',
    'play.bridges': 'Tippe die Lücken an, an denen sich die Buchstaben verbinden – dann erscheint das Wort.',
    'play.noBridge': '{letter} ({name}) verbindet sich nie mit dem Buchstaben danach.',
    'bin.joins': 'Verbindet sich',
    'bin.never': 'Verbindet sich nie',
    'a11y.gap': 'Lücke zwischen {a} und {b}',
  },
  bs: {
    title: 'Mostovi harfova',
    description: 'Šest harfova se nikad ne spaja sa sljedećim: ا د ذ ر ز و. Pronađi gdje se riječ drži za ruke, a gdje se prekida.',
    howTo: 'Dodirni svaku prazninu gdje se dva harfa spajaju. Poslije ا د ذ ر ز و nema mosta.',
    'play.sort': 'Spaja li se ovaj harf sa sljedećim harfom?',
    'play.bridges': 'Dodirni praznine gdje se harfovi spajaju – tada se pojavi riječ.',
    'play.noBridge': '{letter} ({name}) se nikad ne spaja sa sljedećim harfom.',
    'bin.joins': 'Spaja se',
    'bin.never': 'Nikad se ne spaja',
    'a11y.gap': 'Praznina između {a} i {b}',
  },
});

const label = (key: 'bin.joins' | 'bin.never') => ({ en: nonJoinersI18n.dictionaries.en[key], de: nonJoinersI18n.dictionaries.de[key], bs: nonJoinersI18n.dictionaries.bs[key] });

const SORT_LETTERS = ['ا', 'ب', 'د', 'م', 'ر', 'ل', 'ز', 'س', 'و', 'ذ', 'ك', 'ن'];
const sortItems: SortItem[] = SORT_LETTERS.map((letter) => {
  const info = mustLetter(letter);
  return { id: `l${info.position}`, arabic: letter, label: info.name, bin: NON_JOINERS.includes(letter) ? 'never' : 'joins' };
});

export const nonJoinersGame = arabicGame<NonJoinersConfig>({
  id: 'non-joiners',
  i18n: nonJoinersI18n,
  coverArt: 'arabic.broken-link',
  hintArt: 'arabic.broken-link',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  load: () => (require('./NonJoinersGame') as typeof import('./NonJoinersGame')).NonJoinersGame,
  levels: [
    {
      config: { sort: { bins: [{ id: 'joins', label: label('bin.joins'), art: 'kit.basket' }, { id: 'never', label: label('bin.never'), art: 'kit.crate' }], items: sortItems, hints: true, prompt: 'play.sort' }, hints: true },
      facts: [FACTS.nonJoiners],
    },
    { config: { words: ['bab', 'nur', 'salam', 'rahmah', 'kitab'], hints: true }, facts: [FACTS.nonJoinersBefore] },
    { config: { words: ['zaytun', 'mizan', 'nar', 'miftah', 'saa'], hints: false }, facts: [FACTS.joining] },
  ],
  teaches: { questionKeys: ['quest:arabic-rtl'] },
  order: 70,
});

export function registerNonJoinersGame(): void {
  registerGame(nonJoinersGame);
}
