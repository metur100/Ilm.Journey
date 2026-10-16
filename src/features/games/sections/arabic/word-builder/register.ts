import { registerGame } from '@/core/games';
import { defineNamespace } from '@/core/i18n';

import { arabicGame } from '../shared/define';
import { FACTS, wordFact } from '../shared/facts';
import type { WordBuilderConfig } from './logic';

/*
 * Word Builder (v2 game, reworked on the kit's WordTiles; the id is kept for existing progress).
 * L1 three-letter words with hints · L2 longer words incl. the lesson words كِتَاب and مَسْجِد · L3 look-alike letters
 * (dots) in the tray.
 */

export const wordBuilderI18n = defineNamespace('game.word-builder', {
  en: {
    title: 'Word Builder',
    description: 'See the picture, hear the word and build it from its letters – right to left, joined like real writing.',
    howTo: 'Tap or drag the letters in reading order, starting on the right.',
    'play.promptHints': 'Build the word from the right – the glowing place is next.',
    'play.prompt': 'Build the word from the right.',
    'play.listen': 'Listen to the word',
  },
  de: {
    title: 'Wortbauer',
    description: 'Sieh das Bild, hör das Wort und bau es aus seinen Buchstaben – von rechts nach links, verbunden wie echte Schrift.',
    howTo: 'Tippe oder zieh die Buchstaben in Lesereihenfolge, rechts beginnend.',
    'play.promptHints': 'Bau das Wort von rechts – der leuchtende Platz ist der nächste.',
    'play.prompt': 'Bau das Wort von rechts.',
    'play.listen': 'Wort anhören',
  },
  bs: {
    title: 'Graditelj riječi',
    description: 'Pogledaj sliku, poslušaj riječ i sastavi je od njenih harfova – zdesna nalijevo, spojeno kao pravo pismo.',
    howTo: 'Dodiruj ili prevlači harfove redom čitanja, počevši zdesna.',
    'play.promptHints': 'Sastavi riječ zdesna – mjesto koje svijetli je sljedeće.',
    'play.prompt': 'Sastavi riječ zdesna.',
    'play.listen': 'Poslušaj riječ',
  },
});

const THREE = ['bab', 'shams', 'qamar', 'qalam', 'jamal', 'bayt', 'tamr', 'fil', 'nar', 'asal', 'khubz'];
const LONGER = ['nakhla', 'saa', 'khayma', 'halib', 'baqara', 'namla', 'samaka', 'miftah', 'mizan', 'zaytun', 'qindil', 'hamama', 'safina'];

export const wordBuilderGame = arabicGame<WordBuilderConfig>({
  id: 'word-builder',
  i18n: wordBuilderI18n,
  coverArt: 'object.book',
  hintArt: 'kit.tiles',
  load: () => (require('./WordBuilderGame') as typeof import('./WordBuilderGame')).WordBuilderGame,
  levels: [
    { config: { anchors: ['nur'], pool: THREE, words: 4, hints: true, distractors: false }, facts: [FACTS.joining, wordFact('nur', ['kitab', 'masjid'])] },
    { config: { anchors: ['kitab', 'masjid'], pool: LONGER, words: 4, hints: false, distractors: false }, facts: [wordFact('kitab', ['nur', 'masjid']), FACTS.masjid] },
    { config: { anchors: [], pool: [...THREE, ...LONGER], words: 4, hints: false, distractors: true }, facts: [FACTS.dots] },
  ],
  teaches: { questionKeys: ['quest:arabic-rtl', 'quest:arabic-masjid-word', 'quest:arabic-dots-ba'] },
  order: 130,
});

export function registerWordBuilderGame(): void {
  registerGame(wordBuilderGame);
}
