import { type Palette, topicThemes } from '@/core/theme';

import type { BlockKind, Precision } from './models';

/**
 * Seerah colours derived from the shared palette (light/dark/high contrast are handled by the palette):
 * established fact → info, historical interpretation → gold, reflection → primary.
 */
export function blockColors(c: Palette, kind: BlockKind): { fg: string; bg: string } {
  if (kind === 'fact') return { fg: c.info, bg: c.infoSoft };
  if (kind === 'interpretation') return { fg: c.goldText, bg: c.goldSoft };
  return { fg: c.primaryText, bg: c.primarySoft };
}

/** Marker / label colour of a map location by how securely it is identified. */
export function precisionColor(c: Palette, precision: Precision): string {
  if (precision === 'historical') return c.primaryText;
  if (precision === 'approximate') return c.goldText;
  return c.textMuted;
}

/** Accent of the Seerah topic (filled icon circles with `c.onAccent` on top). */
export const SEERAH_ACCENT = topicThemes.seerah.accent;
export const SEERAH_GRADIENT = topicThemes.seerah.gradient;

/**
 * Map artwork colours (land, sea, grid lines) – illustration colours from the sira map, one set per
 * scheme. Text on the map always sits on `c.surface` labels.
 */
export function mapColors(dark: boolean): { land: string; sea: string; line: string } {
  return dark ? { land: '#1F2A45', sea: '#111C30', line: '#6F6550' } : { land: '#EADDC1', sea: '#C7D5DB', line: '#B49A6A' };
}
