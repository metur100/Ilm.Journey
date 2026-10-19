import { registerGame } from '@/core/games';
import { defineNamespace } from '@/core/i18n';

import { arabicGame, type LevelSpec } from '../shared/define';
import type { ConnectConfig } from '../shared/engineGames';
import { OPPOSITES, oppositeFact, oppositePair, type OppositeLevel } from './data';
import { loadConnectGame } from './engines';

/*
 * Arabic Opposites (ConnectPairs): connect each word with its opposite. Both sides show the Arabic word with its
 * transliteration and meaning, so the pair itself teaches the two words. L1 the six basic pairs · L2 more adjective
 * pairs · L3 a third set.
 */

const COVER = 'object.scales';

export const oppositesI18n = defineNamespace('game.arabic-opposites', {
  en: {
    title: 'Arabic Opposites',
    description: 'Learn pairs of Arabic words that mean the opposite.',
    howTo: 'Draw a line from each word on the left to its opposite on the right.',
    'play.match': 'Connect each word with its opposite.',
  },
  de: {
    title: 'Arabische Gegenteile',
    description: 'Lerne Paare arabischer Wörter mit entgegengesetzter Bedeutung.',
    howTo: 'Zieh eine Linie von jedem Wort links zu seinem Gegenteil rechts.',
    'play.match': 'Verbinde jedes Wort mit seinem Gegenteil.',
  },
  bs: {
    title: 'Arapske suprotnosti',
    description: 'Nauči parove arapskih riječi suprotnog značenja.',
    howTo: 'Povuci liniju od svake riječi lijevo do njene suprotnosti desno.',
    'play.match': 'Spoji svaku riječ s njenom suprotnošću.',
  },
});

const level = (group: OppositeLevel, hints: boolean): LevelSpec<ConnectConfig> => ({
  config: { pairs: group.pairs.map(oppositePair), hints, prompt: 'play.match' },
  facts: group.facts.map((pair) => oppositeFact(pair.a, pair.b, COVER)),
});

export const arabicOppositesGame = arabicGame<ConnectConfig>({
  id: 'arabic-opposites',
  i18n: oppositesI18n,
  coverArt: COVER,
  hintArt: 'kit.connect',
  load: loadConnectGame,
  levels: [level(OPPOSITES[0], true), level(OPPOSITES[1], false), level(OPPOSITES[2], false)],
  order: 157,
});

export function registerArabicOppositesGame(): void {
  registerGame(arabicOppositesGame);
}
