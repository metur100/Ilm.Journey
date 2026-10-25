import { getGame } from '@/core/games';

import { describeQuranGame, isQuranText } from '../../shared/testing';
import { openingWords, registerSurahGardenGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerSurahGardenGame();

describeQuranGame(() => getGame('surah-garden')!, { mistakeLevel: 3 });

it('opening cards are the first words of ayah 1', () => {
  for (const n of [1, 112, 113, 107, 110, 109]) expect(isQuranText(openingWords(n).text)).toBe(true);
});
