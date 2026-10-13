import { checkPalette, checkTopicTheme, contrastRatio } from '@/core/theme/contrast';
import { ALL_PALETTES, darkPalette, lightPalette, paletteFor } from '@/core/theme/palettes';
import { topicThemes } from '@/core/theme/topics';
import { resolveScheme } from '@/core/theme/useTheme';
import { TOPIC_IDS } from '@/core/models';

describe('colour scheme', () => {
  it('uses the dark palette for "dark" and for "system" when the device is dark', () => {
    expect(resolveScheme('dark', 'light')).toBe('dark');
    expect(resolveScheme('dark', null)).toBe('dark');
    expect(resolveScheme('system', 'dark')).toBe('dark');
    expect(paletteFor(resolveScheme('system', 'dark'), false)).toBe(darkPalette);
    expect(paletteFor(resolveScheme('dark', 'light'), false)).toBe(darkPalette);
  });

  it('uses the light palette for "light" and for "system" when the device is light or unknown', () => {
    expect(resolveScheme('light', 'dark')).toBe('light');
    expect(resolveScheme('system', 'light')).toBe('light');
    expect(resolveScheme('system', null)).toBe('light');
    expect(resolveScheme('system', undefined)).toBe('light');
    expect(paletteFor('light', false)).toBe(lightPalette);
  });

  it('returns stable high-contrast palettes with full-strength muted text', () => {
    const contrast = paletteFor('dark', true);
    expect(paletteFor('dark', true)).toBe(contrast);
    expect(contrast.textMuted).toBe(contrast.text);
    expect(paletteFor('light', true).textMuted).toBe(paletteFor('light', true).text);
  });

  it('palettes define the same colour keys', () => {
    const keys = Object.keys(lightPalette).sort();
    for (const palette of Object.values(ALL_PALETTES)) expect(Object.keys(palette).sort()).toEqual(keys);
  });
});

describe('contrast (WCAG AA)', () => {
  it('computes known ratios', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });

  it.each(Object.entries(ALL_PALETTES))('every text pair of the %s palette passes', (_name, palette) => {
    const failing = checkPalette(palette).filter((r) => !r.ok);
    expect(failing).toEqual([]);
  });

  it('white text is readable on every topic header', () => {
    expect(Object.keys(topicThemes).sort()).toEqual([...TOPIC_IDS].sort());
    for (const theme of Object.values(topicThemes)) expect(checkTopicTheme(theme).filter((r) => !r.ok)).toEqual([]);
  });
});
