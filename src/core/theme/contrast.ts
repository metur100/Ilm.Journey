import type { Palette } from './palettes';
import type { TopicTheme } from './topics';

/** WCAG relative luminance of a #RRGGBB colour. */
export function luminance(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16);
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel((n >> 16) & 0xff) + 0.7152 * channel((n >> 8) & 0xff) + 0.0722 * channel(n & 0xff);
}

/** WCAG contrast ratio (1..21) between two #RRGGBB colours. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

type ColorKey = { [K in keyof Palette]: Palette[K] extends string ? K : never }[keyof Palette];

export interface ContrastPair {
  fg: ColorKey;
  bg: ColorKey | 'headerTop' | 'headerBottom';
  /** Large/bold text (at least 18.66 px bold or 24 px) only needs 3:1. */
  large?: boolean;
}

const TEXT_BACKGROUNDS = ['background', 'surface', 'surfaceAlt', 'primarySoft', 'goldSoft', 'successSoft', 'errorSoft', 'infoSoft'] as const;

/** Every foreground/background combination the UI uses for text. */
export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  ...TEXT_BACKGROUNDS.map((bg) => ({ fg: 'text' as const, bg })),
  { fg: 'textMuted', bg: 'background' },
  { fg: 'textMuted', bg: 'surface' },
  { fg: 'textMuted', bg: 'surfaceAlt' },
  { fg: 'primaryText', bg: 'background' },
  { fg: 'primaryText', bg: 'surface' },
  { fg: 'primaryText', bg: 'primarySoft' },
  { fg: 'goldText', bg: 'background' },
  { fg: 'goldText', bg: 'surface' },
  { fg: 'goldText', bg: 'goldSoft' },
  { fg: 'onPrimary', bg: 'primary' },
  { fg: 'onGold', bg: 'gold' },
  { fg: 'onNight', bg: 'night' },
  { fg: 'onNight', bg: 'nightSoft' },
  { fg: 'onNight', bg: 'headerTop' },
  { fg: 'onNight', bg: 'headerBottom' },
  { fg: 'onNightMuted', bg: 'night' },
  { fg: 'onNightMuted', bg: 'nightSoft' },
  { fg: 'onNightMuted', bg: 'headerBottom' },
  { fg: 'gold', bg: 'night' },
  { fg: 'gold', bg: 'headerBottom' },
  { fg: 'success', bg: 'successSoft' },
  { fg: 'success', bg: 'surface' },
  { fg: 'error', bg: 'errorSoft' },
  { fg: 'error', bg: 'surface' },
  { fg: 'error', bg: 'background' },
  { fg: 'info', bg: 'infoSoft' },
  { fg: 'onStatus', bg: 'success' },
  { fg: 'onStatus', bg: 'error' },
  { fg: 'onStatus', bg: 'info' },
];

export interface ContrastResult {
  pair: string;
  ratio: number;
  required: number;
  ok: boolean;
}

/** Checks all text pairs of a palette against WCAG AA (4.5:1, large text 3:1). */
export function checkPalette(p: Palette): ContrastResult[] {
  return CONTRAST_PAIRS.map(({ fg, bg, large }) => {
    const bgColor = bg === 'headerTop' ? p.headerGradient[0] : bg === 'headerBottom' ? p.headerGradient[1] : p[bg];
    const ratio = contrastRatio(p[fg], bgColor);
    const required = large ? 3 : 4.5;
    return { pair: `${fg} on ${bg}`, ratio: Math.round(ratio * 100) / 100, required, ok: ratio >= required };
  });
}

/** White text on topic headers: body text sits on the gradient start (4.5:1), titles may reach the end (large, 3:1). */
export function checkTopicTheme(theme: TopicTheme): ContrastResult[] {
  const [start, end] = theme.gradient;
  const pairs: [string, string, number][] = [
    ['white on gradient start', start, 4.5],
    ['white on gradient end (large)', end, 3],
    ['white on accent (icons, large)', theme.accent, 3],
  ];
  return pairs.map(([pair, bg, required]) => {
    const ratio = contrastRatio('#FFFFFF', bg);
    return { pair, ratio: Math.round(ratio * 100) / 100, required, ok: ratio >= required };
  });
}
