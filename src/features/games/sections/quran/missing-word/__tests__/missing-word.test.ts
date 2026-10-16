import { getGame } from '@/core/games';

import { describeQuranGame } from '../../shared/testing';
import { registerMissingWordGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(() => { throw new Error('offline'); }), setAudioModeAsync: jest.fn(() => Promise.resolve()) }));
registerMissingWordGame();

describeQuranGame(() => getGame('missing-word')!, { mistakeLevel: 2 });

it('gaps are real words and distractors never equal a word of the ayah', () => {
  for (const level of getGame('missing-word')!.levels) {
    for (const r of (level.config as { rounds: { words: { arabic?: string }[]; gaps: number[]; distractors: { arabic?: string }[] }[] }).rounds) {
      expect(r.gaps.length).toBeGreaterThan(0);
      const own = new Set(r.words.map((w) => w.arabic));
      for (const d of r.distractors) expect(own.has(d.arabic)).toBe(false);
    }
  }
});
