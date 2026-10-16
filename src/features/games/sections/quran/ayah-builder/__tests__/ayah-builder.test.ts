import { getGame } from '@/core/games';
import { getAyah } from '@/features/quran';

import { describeQuranGame } from '../../shared/testing';
import { ayahTiles } from '../../shared/quran';
import { type AyahBuilderConfig, registerAyahBuilderGame } from '../register';

jest.mock('@/core/services/sound', () => ({ playSound: jest.fn() }));
jest.mock('expo-audio', () => ({ createAudioPlayer: jest.fn(() => { throw new Error('offline'); }), setAudioModeAsync: jest.fn(() => Promise.resolve()) }));
registerAyahBuilderGame();

describeQuranGame(() => getGame('ayah-builder')!);

describe('ayah builder content', () => {
  it('tiles joined give back the exact ayah, distractors never equal a target word', () => {
    for (const level of getGame('ayah-builder')!.levels) {
      for (const r of (level.config as AyahBuilderConfig).rounds) {
        expect(r.target.map((t) => t.arabic).join(' ')).toBe(getAyah(r.surah, r.ayah)!.arabic);
        const own = new Set(r.target.map((t) => t.arabic));
        for (const d of r.distractors) expect(own.has(d.arabic)).toBe(false);
      }
    }
  });

  it('keeps waqf marks attached to their word', () => {
    expect(ayahTiles('a ۚ b').length).toBeGreaterThan(0);
    const text = getAyah(112, 1)!.arabic;
    expect(ayahTiles(text).join(' ')).toBe(text);
  });
});
