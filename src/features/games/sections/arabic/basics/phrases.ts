import { registerGame } from '@/core/games';
import { defineNamespace } from '@/core/i18n';

import { arabicGame, type LevelSpec } from '../shared/define';
import type { ConnectConfig } from '../shared/engineGames';
import { connectPair, PHRASES, type WordLevel, vocabFact } from './data';
import { loadConnectGame } from './engines';

/*
 * Arabic Phrases (ConnectPairs): common phrases and duas. L1 thanks, praise, forgiveness and the shahada words ·
 * L2 daily dhikr and duas · L3 longer phrases.
 */

const COVER = 'object.pen';

export const phrasesI18n = defineNamespace('game.arabic-phrases', {
  en: {
    title: 'Arabic Phrases',
    description: 'Learn common Arabic phrases and duas.',
    howTo: 'Draw a line from each phrase on the left to its meaning on the right.',
    'play.match': 'Connect each phrase with its meaning.',
  },
  de: {
    title: 'Arabische Wendungen',
    description: 'Lerne häufige arabische Wendungen und Duas.',
    howTo: 'Zieh eine Linie von jeder Wendung links zu ihrer Bedeutung rechts.',
    'play.match': 'Verbinde jede Wendung mit ihrer Bedeutung.',
  },
  bs: {
    title: 'Arapski izrazi',
    description: 'Nauči česte arapske izraze i dove.',
    howTo: 'Povuci liniju od svakog izraza lijevo do njegovog značenja desno.',
    'play.match': 'Spoji svaki izraz s njegovim značenjem.',
  },
});

const level = (group: WordLevel, hints: boolean): LevelSpec<ConnectConfig> => ({
  config: { pairs: group.words.map(connectPair), hints, prompt: 'play.match' },
  facts: group.facts.map((word) => vocabFact(word, COVER)),
});

export const arabicPhrasesGame = arabicGame<ConnectConfig>({
  id: 'arabic-phrases',
  i18n: phrasesI18n,
  coverArt: COVER,
  hintArt: 'kit.connect',
  load: loadConnectGame,
  levels: [level(PHRASES[0], true), level(PHRASES[1], false), level(PHRASES[2], false)],
  order: 159,
});

export function registerArabicPhrasesGame(): void {
  registerGame(arabicPhrasesGame);
}
