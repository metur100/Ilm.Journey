import { ALL_PALETTES } from '@/core/theme';
import { contrastRatio } from '@/core/theme/contrast';
import { blockColors, precisionColor } from '@/features/seerah/theme';

/** Seerah colour pairs (statement labels, map precision, accents) stay readable in every scheme. */
describe('seerah colours', () => {
  const AA = 4.5;
  it.each(Object.entries(ALL_PALETTES))('meet WCAG AA in the %s palette', (_name, c) => {
    for (const kind of ['fact', 'interpretation', 'reflection'] as const) {
      const { fg, bg } = blockColors(c, kind);
      expect({ kind, ok: contrastRatio(fg, bg) >= AA }).toEqual({ kind, ok: true });
      expect({ kind, onSurface: contrastRatio(fg, c.surface) >= AA }).toEqual({ kind, onSurface: true });
    }
    for (const precision of ['historical', 'approximate', 'modern'] as const) {
      expect({ precision, ok: contrastRatio(precisionColor(c, precision), c.surface) >= AA }).toEqual({ precision, ok: true });
    }
    expect(contrastRatio(c.goldText, c.background)).toBeGreaterThanOrEqual(AA);
    expect(contrastRatio(c.gold, c.nightSoft)).toBeGreaterThanOrEqual(AA);
  });
});
