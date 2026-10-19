import { registerGame } from '@/core/games';
import { defineNamespace } from '@/core/i18n';

import { arabicGame, type LevelSpec } from '../shared/define';
import type { ConnectConfig } from '../shared/engineGames';
import { connectPair, FOOD, type WordLevel, vocabFact } from './data';
import { loadConnectGame } from './engines';

/*
 * Arabic Food (ConnectPairs): food and drink. L1 bread, water, dates, milk, honey, fish with hints · L2 rice, meat,
 * chicken, fruit, apple, banana · L3 orange, grapes, olives, cheese, eggs, tea.
 */

const COVER = 'food.bread';

export const foodI18n = defineNamespace('game.arabic-food', {
  en: {
    title: 'Arabic Food',
    description: 'Learn the Arabic words for food and drink.',
    howTo: 'Draw a line from each food word on the left to its meaning on the right.',
    'play.match': 'Connect each food word with its meaning.',
  },
  de: {
    title: 'Arabisches Essen',
    description: 'Lerne die arabischen Wörter für Speisen und Getränke.',
    howTo: 'Zieh eine Linie von jedem Wort für Speisen links zu seiner Bedeutung rechts.',
    'play.match': 'Verbinde jedes Wort für Speisen mit seiner Bedeutung.',
  },
  bs: {
    title: 'Arapska hrana',
    description: 'Nauči arapske riječi za hranu i piće.',
    howTo: 'Povuci liniju od svake riječi za hranu lijevo do njenog značenja desno.',
    'play.match': 'Spoji svaku riječ za hranu s njenim značenjem.',
  },
});

const level = (group: WordLevel, hints: boolean): LevelSpec<ConnectConfig> => ({
  config: { pairs: group.words.map(connectPair), hints, prompt: 'play.match' },
  facts: group.facts.map((word) => vocabFact(word, COVER)),
});

export const arabicFoodGame = arabicGame<ConnectConfig>({
  id: 'arabic-food',
  i18n: foodI18n,
  coverArt: COVER,
  hintArt: 'kit.connect',
  load: loadConnectGame,
  levels: [level(FOOD[0], true), level(FOOD[1], false), level(FOOD[2], false)],
  order: 155,
});

export function registerArabicFoodGame(): void {
  registerGame(arabicFoodGame);
}
