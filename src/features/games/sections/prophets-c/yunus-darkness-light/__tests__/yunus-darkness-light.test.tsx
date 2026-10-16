import { getGame } from '@/core/games';

import { describeProphetGame } from '../../shared/gameTest';
import { registerYunusGame, YUNUS_ARABIC_TILES, YUNUS_ART, YUNUS_ID } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
registerYunusGame();

describe('Light in the Darknesses', () => {
  describeProphetGame(() => getGame(YUNUS_ID)!, { art: YUNUS_ART });
});

it('takes the Arabic tiles of the dua only from the generated Quran data (21:87)', () => {
  const { getDua } = jest.requireActual('@/features/quran') as typeof import('@/features/quran');
  const arabic = getDua('yunus-in-the-darkness')!.ayahs[0].arabic;
  expect(YUNUS_ARABIC_TILES).toHaveLength(5);
  expect(arabic.endsWith(YUNUS_ARABIC_TILES.join(' '))).toBe(true);
});
