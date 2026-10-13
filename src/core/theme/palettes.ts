/**
 * Colour palettes of the playful Ilm Journey design (night / gold / teal, from knowledge-rpg and
 * islam-quest) in light and dark, each with a high-contrast variant.
 *
 * Rules:
 * - Never import a palette directly in a component – use `useTheme()` / `makeStyles()` so the
 *   current scheme and accessibility settings apply.
 * - `night*` / `onNight*` are for the always-dark surfaces (hero headers, tab bar, onboarding).
 * - `*Text` colours are safe for text on `background`, `surface` and their `*Soft` tint.
 * - `on*` colours are for text/icons on the matching filled colour.
 * Text pairs are checked against WCAG AA by `src/core/__tests__/theme.test.ts` (`npm run check:contrast`).
 */
export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  primaryText: string;
  primarySoft: string;
  primaryBorder: string;
  gold: string;
  onGold: string;
  goldText: string;
  goldSoft: string;
  goldBorder: string;
  night: string;
  nightSoft: string;
  nightLine: string;
  onNight: string;
  onNightMuted: string;
  success: string;
  successSoft: string;
  error: string;
  errorSoft: string;
  info: string;
  infoSoft: string;
  /** Text/icons on filled success / error / info colours. */
  onStatus: string;
  /** Text/icons on topic accents and gradients (white in every scheme; checked per topic). */
  onAccent: string;
  locked: string;
  overlay: string;
  /** Progress bar track on light surfaces. */
  track: string;
  switchOff: string;
  shadow: string;
  /** Hero header gradient (top → bottom). */
  headerGradient: [string, string];
}

export const lightPalette: Palette = {
  background: '#FBF5EA',
  surface: '#FFFFFF',
  surfaceAlt: '#F4EEE2',
  border: '#E6DCCB',
  text: '#1D1F33',
  textMuted: '#555A75',
  primary: '#0F7A6E',
  onPrimary: '#FFFFFF',
  primaryText: '#0A5B52',
  primarySoft: '#D7F0EC',
  primaryBorder: '#B4E0D9',
  gold: '#F2B544',
  onGold: '#14173A',
  goldText: '#875900',
  goldSoft: '#FDF0D2',
  goldBorder: '#F0D49A',
  night: '#14173A',
  nightSoft: '#232861',
  nightLine: '#343B7A',
  onNight: '#FFFFFF',
  onNightMuted: '#C9CCEA',
  success: '#1B7B44',
  successSoft: '#DDF3E5',
  error: '#BA3426',
  errorSoft: '#FBE3E0',
  info: '#2862BA',
  infoSoft: '#E1ECFB',
  onStatus: '#FFFFFF',
  onAccent: '#FFFFFF',
  locked: '#8D90A6',
  overlay: 'rgba(10, 12, 35, 0.6)',
  track: 'rgba(29, 31, 51, 0.08)',
  switchOff: '#CFCABF',
  shadow: '#1D1F33',
  headerGradient: ['#14173A', '#2E3380'],
};

export const darkPalette: Palette = {
  background: '#0E1128',
  surface: '#181C3B',
  surfaceAlt: '#20254A',
  border: '#2F3563',
  text: '#F2EFE7',
  textMuted: '#B4B8D6',
  primary: '#3DBDAA',
  onPrimary: '#06201C',
  primaryText: '#72DCCB',
  primarySoft: '#13383A',
  primaryBorder: '#1E5552',
  gold: '#F2B544',
  onGold: '#14173A',
  goldText: '#F4C66A',
  goldSoft: '#352A12',
  goldBorder: '#5A4520',
  night: '#090B1E',
  nightSoft: '#1A1E44',
  nightLine: '#2C3268',
  onNight: '#FFFFFF',
  onNightMuted: '#C2C6E6',
  success: '#5FD08F',
  successSoft: '#143326',
  error: '#F28B7F',
  errorSoft: '#3D1D1A',
  info: '#86B4F7',
  infoSoft: '#172846',
  onStatus: '#0E1128',
  onAccent: '#FFFFFF',
  locked: '#6D7096',
  overlay: 'rgba(0, 0, 0, 0.65)',
  track: 'rgba(255, 255, 255, 0.12)',
  switchOff: '#4A4F75',
  shadow: '#000000',
  headerGradient: ['#0B0D24', '#262B6E'],
};

/** High contrast: muted text becomes full-strength text, borders get stronger, surfaces more extreme. */
function withHighContrast(p: Palette, dark: boolean): Palette {
  return {
    ...p,
    textMuted: p.text,
    onNightMuted: p.onNight,
    border: dark ? '#8A93B0' : '#6E6250',
    background: dark ? '#000000' : '#FFFDF7',
    surface: dark ? '#0B0E1F' : '#FFFFFF',
    surfaceAlt: dark ? '#151935' : '#F7F1E4',
    primaryText: dark ? '#9BEADD' : '#06463F',
    goldText: dark ? '#FFD88A' : '#6E4800',
  };
}

const PALETTES = {
  light: lightPalette,
  dark: darkPalette,
  lightContrast: withHighContrast(lightPalette, false),
  darkContrast: withHighContrast(darkPalette, true),
} as const;

export type ColorScheme = 'light' | 'dark';

/** Returns a stable palette object (safe as a cache key) for the scheme and contrast setting. */
export function paletteFor(scheme: ColorScheme, highContrast: boolean): Palette {
  if (scheme === 'dark') return highContrast ? PALETTES.darkContrast : PALETTES.dark;
  return highContrast ? PALETTES.lightContrast : PALETTES.light;
}

export const ALL_PALETTES: Record<keyof typeof PALETTES, Palette> = PALETTES;
