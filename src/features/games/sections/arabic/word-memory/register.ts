import { registerGame } from '@/core/games';
import type { MemoryPair } from '@/core/games/kit';
import { defineNamespace } from '@/core/i18n';

import { arabicGame } from '../shared/define';
import type { MemoryConfig } from '../shared/engineGames';
import { FACTS, wordFact } from '../shared/facts';
import { getWord } from '../shared/words';

/*
 * Word Memory (MemoryPairs): flip two cards and find an Arabic word with its picture or its meaning. L1 four words with
 * pictures and a peek at the start · L2 the words of the lesson with their meanings · L3 six pairs, mixed, no peek.
 */

export const wordMemoryI18n = defineNamespace('game.word-memory', {
  en: {
    title: 'Word Memory',
    description: 'Flip the cards and find each Arabic word with its picture or meaning.',
    howTo: 'Tap two cards. When the word and its meaning match, they stay open.',
    'play.pictures': 'Remember where the cards are, then find each word with its picture.',
    'play.meanings': 'Find each Arabic word with its meaning.',
    'play.mixed': 'Pictures and meanings – find all six pairs.',
  },
  de: {
    title: 'Wörter-Memory',
    description: 'Dreh die Karten um und finde jedes arabische Wort mit seinem Bild oder seiner Bedeutung.',
    howTo: 'Tippe zwei Karten an. Passen Wort und Bedeutung zusammen, bleiben sie offen.',
    'play.pictures': 'Merk dir, wo die Karten liegen, und finde dann jedes Wort mit seinem Bild.',
    'play.meanings': 'Finde jedes arabische Wort mit seiner Bedeutung.',
    'play.mixed': 'Bilder und Bedeutungen – finde alle sechs Paare.',
  },
  bs: {
    title: 'Memori riječi',
    description: 'Okreći karte i pronađi svaku arapsku riječ s njenom slikom ili značenjem.',
    howTo: 'Dodirni dvije karte. Kad se riječ i značenje poklope, ostaju otvorene.',
    'play.pictures': 'Zapamti gdje su karte, pa pronađi svaku riječ s njenom slikom.',
    'play.meanings': 'Pronađi svaku arapsku riječ s njenim značenjem.',
    'play.mixed': 'Slike i značenja – pronađi svih šest parova.',
  },
});

export function wordPair(id: string, side: 'picture' | 'meaning'): MemoryPair {
  const word = getWord(id);
  return {
    id,
    a: { arabic: word.arabic, a11y: word.translit },
    b: side === 'picture' && word.art ? { art: word.art, a11y: word.meaning } : { label: word.meaning },
    caption: `${word.arabic} – ${word.translit}`,
  };
}

export const wordMemoryGame = arabicGame<MemoryConfig>({
  id: 'word-memory',
  i18n: wordMemoryI18n,
  coverArt: 'arabic.word-cards',
  hintArt: 'kit.cards',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  load: () => (require('../shared/engineGames') as typeof import('../shared/engineGames')).MemoryGame,
  levels: [
    {
      config: { pairs: ['kitab', 'nur', 'jamal', 'qamar'].map((id) => wordPair(id, 'picture')), peekMs: 2500, hints: true, prompt: 'play.pictures', factOf: { kitab: 'word-kitab', nur: 'word-nur' } },
      facts: [wordFact('kitab', ['nur', 'salam']), wordFact('nur', ['kitab', 'sabr'])],
    },
    {
      config: { pairs: ['salam', 'ilm', 'sabr', 'rahmah', 'masjid'].map((id) => wordPair(id, 'meaning')), hints: false, prompt: 'play.meanings', factOf: { salam: 'word-salam', ilm: 'word-ilm', masjid: 'masjid-sujud' } },
      facts: [wordFact('salam', ['ilm', 'sabr']), wordFact('ilm', ['salam', 'rahmah']), FACTS.masjid],
    },
    {
      config: {
        pairs: [wordPair('jannah', 'meaning'), wordPair('shams', 'picture'), wordPair('bab', 'picture'), wordPair('sabr', 'meaning'), wordPair('fil', 'picture'), wordPair('tamr', 'picture')],
        hints: false,
        prompt: 'play.mixed',
        factOf: { jannah: 'word-jannah', sabr: 'word-sabr' },
      },
      facts: [wordFact('jannah', ['sabr', 'nur']), wordFact('sabr', ['jannah', 'ilm'])],
    },
  ],
  teaches: { questionKeys: ['quest:arabic-words-match', 'quest:arabic-masjid-word'] },
  order: 140,
});

export function registerWordMemoryGame(): void {
  registerGame(wordMemoryGame);
}
