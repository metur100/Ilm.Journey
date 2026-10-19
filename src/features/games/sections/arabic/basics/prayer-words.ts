import { registerGame } from '@/core/games';
import { defineNamespace } from '@/core/i18n';

import { arabicGame, type LevelSpec } from '../shared/define';
import type { MemoryConfig } from '../shared/engineGames';
import { memoryPair, PRAYER_WORDS, type WordLevel, vocabFact } from './data';
import { loadMemoryGame } from './engines';

/*
 * Prayer Words (MemoryPairs): words of the prayer and the masjid. L1 prayer, wudu, masjid, qibla, imam, adhan with a
 * peek · L2 the parts of the prayer · L3 mat, niche, pulpit, muezzin, sermon, Friday.
 */

const COVER = 'object.prayer-mat';

export const prayerWordsI18n = defineNamespace('game.arabic-prayer-words', {
  en: {
    title: 'Prayer Words',
    description: 'Learn the Arabic words of the prayer and the masjid.',
    howTo: 'Flip two cards and find each word with its meaning.',
    'play.find': 'Find each prayer word with its meaning.',
  },
  de: {
    title: 'Gebetswörter',
    description: 'Lerne die arabischen Wörter des Gebets und der Moschee.',
    howTo: 'Dreh zwei Karten um und finde jedes Wort mit seiner Bedeutung.',
    'play.find': 'Finde jedes Gebetswort mit seiner Bedeutung.',
  },
  bs: {
    title: 'Riječi namaza',
    description: 'Nauči arapske riječi namaza i džamije.',
    howTo: 'Okreni dvije karte i pronađi svaku riječ s njenim značenjem.',
    'play.find': 'Pronađi svaku riječ namaza s njenim značenjem.',
  },
});

const level = (group: WordLevel, hints: boolean, peekMs?: number): LevelSpec<MemoryConfig> => ({
  config: { pairs: group.words.map(memoryPair), hints, peekMs, prompt: 'play.find' },
  facts: group.facts.map((word) => vocabFact(word, COVER)),
});

export const arabicPrayerWordsGame = arabicGame<MemoryConfig>({
  id: 'arabic-prayer-words',
  i18n: prayerWordsI18n,
  coverArt: COVER,
  hintArt: 'kit.cards',
  load: loadMemoryGame,
  levels: [level(PRAYER_WORDS[0], true, 2200), level(PRAYER_WORDS[1], false), level(PRAYER_WORDS[2], false)],
  order: 158,
});

export function registerArabicPrayerWordsGame(): void {
  registerGame(arabicPrayerWordsGame);
}
