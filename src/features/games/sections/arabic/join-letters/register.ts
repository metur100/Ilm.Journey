import { registerGame } from '@/core/games';
import { defineNamespace } from '@/core/i18n';

import { arabicGame } from '../shared/define';
import { FACTS } from '../shared/facts';
import type { JoinLettersConfig } from './JoinLettersGame';

/*
 * Join the Letters – spajanje harfova (LetterJoin), the heart of the sufara path. Repeatable: every play takes the next
 * block of letters / words. L1 two letters (incl. lam + alif → لا) · L2 three-letter words · L3 words with letters that
 * do not join forward (ا د ر ز و) and look-alike letters in the tray.
 */

export const joinLettersI18n = defineNamespace('game.join-letters', {
  en: {
    title: 'Join the Letters',
    description: 'Put the separate letters together and watch them join into one word – the heart of reading Arabic.',
    howTo: 'Drag or tap the letters in reading order, starting on the right. The word joins above.',
    'play.promptPairs': 'Join the two letters – the first one goes on the right.',
    'play.prompt': 'Join the letters into the word, from right to left.',
  },
  de: {
    title: 'Buchstaben verbinden',
    description: 'Setz die einzelnen Buchstaben zusammen und sieh zu, wie sie sich zu einem Wort verbinden – das Herz des arabischen Lesens.',
    howTo: 'Zieh oder tippe die Buchstaben in Lesereihenfolge, rechts beginnend. Oben verbindet sich das Wort.',
    'play.promptPairs': 'Verbinde die zwei Buchstaben – der erste kommt nach rechts.',
    'play.prompt': 'Verbinde die Buchstaben zum Wort, von rechts nach links.',
  },
  bs: {
    title: 'Spajanje harfova',
    description: 'Sastavi odvojene harfove i gledaj kako se spajaju u jednu riječ – srce čitanja arapskog.',
    howTo: 'Prevuci ili dodirni harfove redom čitanja, počevši zdesna. Riječ se spaja iznad.',
    'play.promptPairs': 'Spoji dva harfa – prvi ide desno.',
    'play.prompt': 'Spoji harfove u riječ, zdesna nalijevo.',
  },
});

/** Two-letter joins of the sufara (first letter on the right). */
const PAIRS = [
  ['ب', 'ت'],
  ['ل', 'ا'],
  ['ن', 'ب'],
  ['س', 'م'],
  ['ف', 'ي'],
  ['ك', 'م'],
  ['ع', 'ن'],
  ['ه', 'ل'],
  ['ج', 'د'],
  ['ق', 'ل'],
  ['ش', 'ر'],
  ['ط', 'ب'],
];
const THREE = ['nur', 'ilm', 'sabr', 'shams', 'qamar', 'qalam', 'jamal', 'bayt', 'tamr', 'fil', 'asal', 'khubz', 'bab', 'nar'];
const NON_JOINING = ['kitab', 'salam', 'zaytun', 'mizan', 'miftah', 'saa', 'masjid', 'rahmah', 'hamama', 'halib', 'bab', 'nar'];

export const joinLettersGame = arabicGame<JoinLettersConfig>({
  id: 'join-letters',
  i18n: joinLettersI18n,
  coverArt: 'arabic.join-letters',
  hintArt: 'kit.join',
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  load: () => (require('./JoinLettersGame') as typeof import('./JoinLettersGame')).JoinLettersGame,
  levels: [
    { config: { pairs: PAIRS, count: 5, hints: true, extra: false }, facts: [FACTS.joining, FACTS.lamAlif] },
    { config: { words: THREE, count: 4, hints: false, extra: false }, facts: [FACTS.shapes] },
    { config: { words: NON_JOINING, count: 4, hints: false, extra: true }, facts: [FACTS.nonJoiners, FACTS.nonJoinersBefore] },
  ],
  teaches: { questionKeys: ['quest:arabic-rtl'] },
  order: 80,
});

export function registerJoinLettersGame(): void {
  registerGame(joinLettersGame);
}
