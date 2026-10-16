import { describeSalahGame } from '../../shared/gameTests';
import { fatihaAyahs, rabbenaWords, WORDS_ART } from '../content';
import { registerWordsGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerWordsGame();

describeSalahGame('salah-words', WORDS_ART);

it('takes the Arabic from the generated Quran data', () => {
  expect(fatihaAyahs()).toHaveLength(7);
  const words = rabbenaWords();
  expect(words[0].arabic.replace(/[ً-ٰٟ]/g, '').startsWith('ربن')).toBe(true);
  expect(words.length).toBeGreaterThan(8);
});
