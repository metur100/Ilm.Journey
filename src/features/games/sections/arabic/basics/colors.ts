import { registerGame } from '@/core/games';
import { defineNamespace } from '@/core/i18n';

import { arabicGame, type LevelSpec } from '../shared/define';
import type { ConnectConfig } from '../shared/engineGames';
import { COLORS, connectPair, type WordLevel, vocabFact } from './data';
import { loadConnectGame } from './engines';

/*
 * Arabic Colours (ConnectPairs): colour words and their meanings. L1 the six basic colours with hints · L2 brown,
 * orange, purple, pink, grey, golden · L3 silver, olive, sky blue, crimson, turquoise, maroon.
 */

const COVER = 'object.lantern';

export const colorsI18n = defineNamespace('game.arabic-colors', {
  en: {
    title: 'Arabic Colours',
    description: 'Learn the Arabic names of the colours.',
    howTo: 'Draw a line from each colour word on the left to its meaning on the right.',
    'play.match': 'Connect each colour with its meaning.',
  },
  de: {
    title: 'Arabische Farben',
    description: 'Lerne die arabischen Namen der Farben.',
    howTo: 'Zieh eine Linie von jedem Farbwort links zu seiner Bedeutung rechts.',
    'play.match': 'Verbinde jede Farbe mit ihrer Bedeutung.',
  },
  bs: {
    title: 'Arapske boje',
    description: 'Nauči arapske nazive boja.',
    howTo: 'Povuci liniju od svake riječi za boju lijevo do njenog značenja desno.',
    'play.match': 'Spoji svaku boju s njenim značenjem.',
  },
});

const level = (group: WordLevel, hints: boolean): LevelSpec<ConnectConfig> => ({
  config: { pairs: group.words.map(connectPair), hints, prompt: 'play.match' },
  facts: group.facts.map((word) => vocabFact(word, COVER)),
});

export const arabicColorsGame = arabicGame<ConnectConfig>({
  id: 'arabic-colors',
  i18n: colorsI18n,
  coverArt: COVER,
  hintArt: 'kit.connect',
  load: loadConnectGame,
  levels: [level(COLORS[0], true), level(COLORS[1], false), level(COLORS[2], false)],
  order: 152,
});

export function registerArabicColorsGame(): void {
  registerGame(arabicColorsGame);
}
