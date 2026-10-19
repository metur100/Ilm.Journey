import { registerGame } from '@/core/games';
import { defineNamespace } from '@/core/i18n';

import { arabicGame, type LevelSpec } from '../shared/define';
import type { ConnectConfig } from '../shared/engineGames';
import { connectPair, GREETINGS, type WordLevel, vocabFact } from './data';
import { loadConnectGame } from './engines';

/*
 * Arabic Greetings (ConnectPairs): everyday greetings and phrases. L1 the greetings with hints · L2 common phrases
 * with Allah's name · L3 replies and short questions.
 */

const COVER = 'object.scroll';

export const greetingsI18n = defineNamespace('game.arabic-greetings', {
  en: {
    title: 'Arabic Greetings',
    description: 'Learn the greetings and everyday phrases of Arabic.',
    howTo: 'Draw a line from each Arabic phrase on the left to its meaning on the right.',
    'play.match': 'Connect each phrase with its meaning.',
  },
  de: {
    title: 'Arabische Grüße',
    description: 'Lerne die Grüße und Alltagsfloskeln des Arabischen.',
    howTo: 'Zieh eine Linie von jeder arabischen Redewendung links zu ihrer Bedeutung rechts.',
    'play.match': 'Verbinde jede Redewendung mit ihrer Bedeutung.',
  },
  bs: {
    title: 'Arapski pozdravi',
    description: 'Nauči pozdrave i svakodnevne izraze na arapskom.',
    howTo: 'Povuci liniju od svakog arapskog izraza lijevo do njegovog značenja desno.',
    'play.match': 'Spoji svaki izraz s njegovim značenjem.',
  },
});

const level = (group: WordLevel, hints: boolean): LevelSpec<ConnectConfig> => ({
  config: { pairs: group.words.map(connectPair), hints, prompt: 'play.match' },
  facts: group.facts.map((word) => vocabFact(word, COVER)),
});

export const arabicGreetingsGame = arabicGame<ConnectConfig>({
  id: 'arabic-greetings',
  i18n: greetingsI18n,
  coverArt: COVER,
  hintArt: 'kit.connect',
  load: loadConnectGame,
  levels: [level(GREETINGS[0], true), level(GREETINGS[1], false), level(GREETINGS[2], false)],
  order: 150,
});

export function registerArabicGreetingsGame(): void {
  registerGame(arabicGreetingsGame);
}
