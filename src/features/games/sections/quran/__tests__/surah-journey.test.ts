import { getGame } from '@/core/games';

import { registerQuranGames } from '..';
import { FIRST_FIFTEEN, surahJourneyGame } from '../surah-journey/register';
import { surah } from '../shared/quran';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(() => { throw new Error('offline'); }), setAudioModeAsync: jest.fn(() => Promise.resolve()) }));
registerQuranGames();

describe('Surah Journey', () => {
  it('is registered with three levels of five complete surahs', () => {
    expect(getGame('surah-journey')).toBe(surahJourneyGame);
    expect(surahJourneyGame.levels).toHaveLength(3);
    for (const level of surahJourneyGame.levels) {
      const config = level.config as { surahs: number[] };
      expect(config.surahs).toHaveLength(5);
      for (const n of config.surahs) expect(surah(n).ayahs).toHaveLength(surah(n).ayahCount);
    }
  });

  it('covers exactly the first fifteen surahs of the ilmihal', () => {
    const all = surahJourneyGame.levels.flatMap((l) => (l.config as { surahs: number[] }).surahs);
    expect(all).toEqual([...FIRST_FIFTEEN]);
    expect(new Set(all).size).toBe(15);
    expect(all[0]).toBe(1);
    expect(all).toContain(114);
    expect(all).toContain(101);
  });
});
