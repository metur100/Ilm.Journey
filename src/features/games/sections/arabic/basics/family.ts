import { registerGame } from '@/core/games';
import { defineNamespace } from '@/core/i18n';

import { arabicGame, type LevelSpec } from '../shared/define';
import type { MemoryConfig } from '../shared/engineGames';
import { FAMILY, memoryPair, type WordLevel, vocabFact } from './data';
import { loadMemoryGame } from './engines';

/*
 * Arabic Family (MemoryPairs): family words and their meanings. L1 parents and siblings with a peek · L2
 * grandparents and aunts/uncles · L3 husband, wife, grandchildren, child and family.
 */

const COVER = 'garden.palm';

export const familyI18n = defineNamespace('game.arabic-family', {
  en: {
    title: 'Arabic Family',
    description: 'Learn the Arabic words for the members of a family.',
    howTo: 'Flip two cards and find each family word with its meaning.',
    'play.find': 'Find each family word with its meaning.',
  },
  de: {
    title: 'Arabische Familie',
    description: 'Lerne die arabischen Wörter für die Mitglieder einer Familie.',
    howTo: 'Dreh zwei Karten um und finde jedes Familienwort mit seiner Bedeutung.',
    'play.find': 'Finde jedes Familienwort mit seiner Bedeutung.',
  },
  bs: {
    title: 'Arapska porodica',
    description: 'Nauči arapske riječi za članove porodice.',
    howTo: 'Okreni dvije karte i pronađi svaku riječ za člana porodice s njenim značenjem.',
    'play.find': 'Pronađi svaku riječ za člana porodice s njenim značenjem.',
  },
});

const level = (group: WordLevel, hints: boolean, peekMs?: number): LevelSpec<MemoryConfig> => ({
  config: { pairs: group.words.map(memoryPair), hints, peekMs, prompt: 'play.find' },
  facts: group.facts.map((word) => vocabFact(word, COVER)),
});

export const arabicFamilyGame = arabicGame<MemoryConfig>({
  id: 'arabic-family',
  i18n: familyI18n,
  coverArt: COVER,
  hintArt: 'kit.cards',
  load: loadMemoryGame,
  levels: [level(FAMILY[0], true, 2500), level(FAMILY[1], false), level(FAMILY[2], false)],
  order: 153,
});

export function registerArabicFamilyGame(): void {
  registerGame(arabicFamilyGame);
}
