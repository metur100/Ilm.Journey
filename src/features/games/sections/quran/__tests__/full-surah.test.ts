import { getGame } from '@/core/games';

import { registerQuranGames } from '..';
import { surah } from '../shared/quran';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(() => { throw new Error('offline'); }), setAudioModeAsync: jest.fn(() => Promise.resolve()) }));
registerQuranGames();

/** Every ayah 1..count of the surah, sorted. */
const allAyahs = (n: number) => Array.from({ length: surah(n).ayahCount }, (_, i) => i + 1);

describe('Quran ayah games use a complete surah in every level', () => {
  it('ayah-builder: all ayahs, in order, in every level', () => {
    const game = getGame('ayah-builder')!;
    for (const level of game.levels) {
      const config = level.config as { rounds: { surah: number; ayah: number }[] };
      const n = config.rounds[0].surah;
      expect(config.rounds.every((r) => r.surah === n)).toBe(true);
      expect(config.rounds.map((r) => r.ayah)).toEqual(allAyahs(n));
    }
  });

  it('missing-word: all ayahs, in order, in every level', () => {
    const game = getGame('missing-word')!;
    for (const level of game.levels) {
      const config = level.config as { rounds: { surah: number; ayah: number }[] };
      const n = config.rounds[0].surah;
      expect(config.rounds.every((r) => r.surah === n)).toBe(true);
      expect(config.rounds.map((r) => r.ayah)).toEqual(allAyahs(n));
    }
  });

  it('listen-and-order: every ayah of the surah in every level', () => {
    const game = getGame('listen-and-order')!;
    for (const level of game.levels) {
      const config = level.config as { surah: number; items: { id: string }[] };
      expect(config.items.map((i) => i.id)).toEqual(allAyahs(config.surah).map((a) => `a${a}`));
    }
  });

  it('surah-puzzle: each level names a complete Juz ʿAmma surah', () => {
    const game = getGame('surah-puzzle')!;
    for (const level of game.levels) {
      const config = level.config as { surah: number };
      expect(surah(config.surah).juz).toBe(30);
      expect(surah(config.surah).ayahs.length).toBe(surah(config.surah).ayahCount);
    }
  });

  it('uses the first surahs of the ilmihal across the ayah games', () => {
    const covered = new Set(
      ['ayah-builder', 'missing-word', 'listen-and-order', 'surah-puzzle'].flatMap((id) =>
        (getGame(id)!.levels as { config: { surah?: number; rounds?: { surah: number }[] } }[]).map((l) => l.config.surah ?? l.config.rounds![0].surah),
      ),
    );
    for (const n of [111, 112, 113, 114]) expect(covered).toContain(n);
  });
});
