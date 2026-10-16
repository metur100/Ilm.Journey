import { defineNamespace } from '@/core/i18n';
import { registerGame } from '@/core/games';
import type { SortBin, SortItem } from '@/core/games/kit';
import type { LocalizedText } from '@/core/models';

import { arabicGame } from '../shared/define';
import type { SortConfig } from '../shared/engineGames';
import { FACTS, letterFact } from '../shared/facts';
import { mustLetter } from '../shared/letters';

/*
 * Twin Letters (SortBins): letters that share one body and differ only by their dots are sorted into the basket that
 * shows their dotless body (ٮ, ح, د …). L1 two families with hints · L2 three families · L3 four families of the
 * "heavy" letters, no hints.
 */

export const twinLettersI18n = defineNamespace('game.twin-letters', {
  en: {
    title: 'Twin Letters',
    description: 'Many letters share one body and differ only by their dots. Sort every letter into the basket with its body.',
    howTo: 'Drag each letter into the basket that shows the same shape without dots.',
    'play.prompt': 'Which body does this letter have? Look past the dots.',
    'bin.a11y': 'Letters shaped like {shape}',
  },
  de: {
    title: 'Zwillingsbuchstaben',
    description: 'Viele Buchstaben haben denselben Körper und unterscheiden sich nur durch Punkte. Sortiere jeden Buchstaben in den Korb mit seinem Körper.',
    howTo: 'Zieh jeden Buchstaben in den Korb mit derselben Form ohne Punkte.',
    'play.prompt': 'Welchen Körper hat dieser Buchstabe? Schau an den Punkten vorbei.',
    'bin.a11y': 'Buchstaben mit der Form {shape}',
  },
  bs: {
    title: 'Harfovi blizanci',
    description: 'Mnogi harfovi imaju isto tijelo i razlikuju se samo po tačkama. Razvrstaj svaki harf u korpu s njegovim tijelom.',
    howTo: 'Prevuci svaki harf u korpu koja pokazuje isti oblik bez tačaka.',
    'play.prompt': 'Koje tijelo ima ovaj harf? Pogledaj mimo tačaka.',
    'bin.a11y': 'Harfovi oblika {shape}',
  },
});

const binA11y = (shape: string): LocalizedText => ({
  en: twinLettersI18n.dictionaries.en['bin.a11y'].replace('{shape}', shape),
  de: twinLettersI18n.dictionaries.de['bin.a11y'].replace('{shape}', shape),
  bs: twinLettersI18n.dictionaries.bs['bin.a11y'].replace('{shape}', shape),
});

/** A family basket: id, the dotless body and its letters. */
const FAMILIES: Record<string, { shape: string; letters: string[] }> = {
  ba: { shape: 'ٮ', letters: ['ب', 'ت', 'ث'] },
  ha: { shape: 'ح', letters: ['ج', 'ح', 'خ'] },
  dal: { shape: 'د', letters: ['د', 'ذ'] },
  ra: { shape: 'ر', letters: ['ر', 'ز'] },
  sin: { shape: 'س', letters: ['س', 'ش'] },
  sad: { shape: 'ص', letters: ['ص', 'ض'] },
  ta: { shape: 'ط', letters: ['ط', 'ظ'] },
  ayn: { shape: 'ع', letters: ['ع', 'غ'] },
};

export const bin = (id: string): SortBin => ({ id, arabic: FAMILIES[id].shape, a11y: binA11y(FAMILIES[id].shape), art: 'kit.basket' });

export const itemsOf = (families: string[]): SortItem[] =>
  families.flatMap((family) =>
    FAMILIES[family].letters.map((letter) => {
      const info = mustLetter(letter);
      return { id: `l${info.position}`, arabic: letter, label: info.name, bin: family };
    }),
  );

const level = (families: string[], hints: boolean, facts: ReturnType<typeof letterFact>[]) => ({
  config: { bins: families.map(bin), items: itemsOf(families), hints, prompt: 'play.prompt' } satisfies SortConfig,
  facts,
});

export const twinLettersGame = arabicGame<SortConfig>({
  id: 'twin-letters',
  i18n: twinLettersI18n,
  coverArt: 'arabic.twin-letters',
  hintArt: 'kit.basket',
  load: () => (require('../shared/engineGames') as typeof import('../shared/engineGames')).SortGame,
  levels: [level(['ba', 'ha'], true, [FACTS.dots, letterFact('ج')]), level(['dal', 'ra', 'sin'], false, [FACTS.shin, letterFact('ز')]), level(['ba', 'sad', 'ta', 'ayn'], false, [FACTS.dad, letterFact('غ')])],
  teaches: { questionKeys: ['quest:arabic-dots-ba', 'quest:arabic-shin'] },
  order: 50,
});

export function registerTwinLettersGame(): void {
  registerGame(twinLettersGame);
}
