import { registerGame, type GameDef } from '@/core/games';

import { WORDS_FACTS } from './content';
import { wordsI18n } from './i18n';
import { WordsGame, type WordsConfig } from './WordsGame';

/** Words of Salah: texts to positions, the ayahs of Al-Fatiha in order, Rabbena (2:201) word by word. */
export const wordsGame: GameDef<WordsConfig> = {
  id: 'salah-words',
  topicId: 'salah',
  i18n: wordsI18n,
  coverArt: 'salah.prayer-tashahhud',
  hintArt: 'salah.prayer-ruku',
  component: WordsGame,
  levels: [
    { level: 1, config: { mode: 'places' }, facts: [WORDS_FACTS.places] },
    { level: 2, config: { mode: 'fatiha' }, facts: [WORDS_FACTS.fatiha, WORDS_FACTS.seven] },
    { level: 3, config: { mode: 'rabbena' }, facts: [WORDS_FACTS.rabbena] },
  ],
  order: 50,
};

export function registerWordsGame(): void {
  registerGame(wordsGame);
}
