import React from 'react';
import { View, type ViewStyle } from 'react-native';

/**
 * Art library entry point (see docs/GAMES.md "Art library"). Every illustration in the app is referenced by name:
 * `<Art name="object.ark" size={96} />`. Pieces are SVG components registered in `catalogue`.
 *
 * Stub: the art agent replaces the catalogue with the real pieces. Unknown names render an empty box of the
 * requested size so screens keep their layout; `hasArt()` lets tests check that every referenced name exists.
 */
export type ArtName = string;

export interface ArtProps {
  name: ArtName;
  /** Width in dp; height follows the piece's aspect ratio unless `height` is given. */
  size?: number;
  height?: number;
  style?: ViewStyle;
  /** Accessibility label; omit for decorative art. */
  label?: string;
}

export type ArtPiece = React.ComponentType<{ width: number; height: number; dark: boolean }>;

export const catalogue: Record<ArtName, { piece: ArtPiece; aspect: number }> = {};

export function hasArt(name: ArtName): boolean {
  return name in catalogue;
}

export function Art({ name, size = 64, height, style, label }: ArtProps) {
  const entry = catalogue[name];
  const h = height ?? Math.round(size / (entry?.aspect ?? 1));
  return (
    <View
      style={[{ width: size, height: h }, style]}
      accessible={!!label}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
    />
  );
}
