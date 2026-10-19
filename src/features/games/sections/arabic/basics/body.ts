import { registerGame } from '@/core/games';
import { defineNamespace } from '@/core/i18n';

import { arabicGame, type LevelSpec } from '../shared/define';
import type { ConnectConfig } from '../shared/engineGames';
import { BODY, connectPair, type WordLevel, vocabFact } from './data';
import { loadConnectGame } from './engines';

/*
 * Arabic Body (ConnectPairs): parts of the body. L1 head, eye, hand, heart, foot, ear with hints · L2 face and mouth
 * words · L3 shoulder, stomach, back, finger, arm, knee.
 */

const COVER = 'body.head';

export const bodyI18n = defineNamespace('game.arabic-body', {
  en: {
    title: 'Arabic Body Parts',
    description: 'Learn the Arabic words for parts of the body.',
    howTo: 'Draw a line from each body part on the left to its meaning on the right.',
    'play.match': 'Connect each body part with its meaning.',
  },
  de: {
    title: 'Arabische Körperteile',
    description: 'Lerne die arabischen Wörter für Körperteile.',
    howTo: 'Zieh eine Linie von jedem Körperteil links zu seiner Bedeutung rechts.',
    'play.match': 'Verbinde jedes Körperteil mit seiner Bedeutung.',
  },
  bs: {
    title: 'Arapski dijelovi tijela',
    description: 'Nauči arapske riječi za dijelove tijela.',
    howTo: 'Povuci liniju od svakog dijela tijela lijevo do njegovog značenja desno.',
    'play.match': 'Spoji svaki dio tijela s njegovim značenjem.',
  },
});

const level = (group: WordLevel, hints: boolean): LevelSpec<ConnectConfig> => ({
  config: { pairs: group.words.map(connectPair), hints, prompt: 'play.match' },
  facts: group.facts.map((word) => vocabFact(word, COVER)),
});

export const arabicBodyGame = arabicGame<ConnectConfig>({
  id: 'arabic-body',
  i18n: bodyI18n,
  coverArt: COVER,
  hintArt: 'kit.connect',
  load: loadConnectGame,
  levels: [level(BODY[0], true), level(BODY[1], false), level(BODY[2], false)],
  order: 154,
});

export function registerArabicBodyGame(): void {
  registerGame(arabicBodyGame);
}
