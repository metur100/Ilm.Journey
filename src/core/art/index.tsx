import React, { useId, useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg from 'react-native-svg';

import { useTheme } from '../theme/useTheme';
import { categories, definitions, type ArtCategory, type KnownArtName } from './catalogue';
import { makeCtx, type ArtDef } from './kit';
import { defToSvg } from './svgString';

/**
 * Art library entry point (see docs/GAMES.md "Art library"). Every illustration in the app is referenced by name:
 * `<Art name="object.ark" size={96} />`. Pieces are flat SVG drawings (react-native-svg) registered in `catalogue`.
 *
 * - Width = `size`; height follows the piece's aspect unless `height` is given (then `fit` decides contain/cover).
 * - `dark` defaults to the current theme; pass it explicitly to match a surface (e.g. a night sky in light mode).
 * - `tint` recolours the neutral figures (`body.*`, `pose.*`); `thirsty` fades garden plants ("needs water").
 * - Unknown names render an empty box of the requested size so screens keep their layout; `hasArt()` lets tests
 *   check that every referenced name exists.
 */
export type ArtName = KnownArtName | (string & {});

export interface ArtProps {
  name: ArtName;
  /** Width in dp; height follows the piece's aspect ratio unless `height` is given. */
  size?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  /** Accessibility label; omit for decorative art. */
  label?: string;
  /** Draw for a dark surface (default: current theme). */
  dark?: boolean;
  /** Figure tone for `body.*` / `pose.*` (default warm sand). */
  tint?: string;
  /** Garden plants look thirsty (faded colours) – never dead. */
  thirsty?: boolean;
  /** When both size and height are given: `contain` (default) letterboxes, `cover` crops (good for skies). */
  fit?: 'contain' | 'cover';
}

export interface ArtPieceProps {
  width: number;
  height: number;
  dark: boolean;
  tint?: string;
  thirsty?: boolean;
  fit?: 'contain' | 'cover';
}

export type ArtPiece = React.ComponentType<ArtPieceProps>;

export interface ArtEntry {
  piece: ArtPiece;
  /** Intrinsic width / height. */
  aspect: number;
  category: ArtCategory;
  def: ArtDef;
}

function makePiece(name: string, def: ArtDef): ArtPiece {
  function Piece({ width, height, dark, tint, thirsty = false, fit = 'contain' }: ArtPieceProps) {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
    const ctx = useMemo(() => makeCtx(`a${uid}`, { dark, tint, thirsty }), [uid, dark, tint, thirsty]);
    const content = useMemo(() => def.draw(ctx), [ctx]);
    return (
      <Svg width={width} height={height} viewBox={`0 0 ${def.w} ${def.h}`} preserveAspectRatio={fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}>
        {content}
      </Svg>
    );
  }
  Piece.displayName = `Art(${name})`;
  return React.memo(Piece);
}

export const catalogue: Record<string, ArtEntry> = Object.fromEntries(
  Object.entries(definitions).map(([name, def]) => [
    name,
    { piece: makePiece(name, def), aspect: def.w / def.h, category: name.split('.')[0] as ArtCategory, def },
  ]),
);

/** All piece names, in catalogue order (grouped by category). */
export const artNames: ArtName[] = Object.keys(catalogue);
export const artCategories = Object.keys(categories) as ArtCategory[];

export function hasArt(name: ArtName): boolean {
  return Object.prototype.hasOwnProperty.call(catalogue, name);
}

/** Intrinsic aspect (width / height) of a piece, 1 for unknown names. */
export function artAspect(name: ArtName): number {
  return catalogue[name]?.aspect ?? 1;
}

/** Standalone SVG markup of a piece (dev tools, share images, web). */
export function svgString(name: ArtName, opts: { dark?: boolean; tint?: string; thirsty?: boolean; width?: number; height?: number } = {}): string {
  const entry = catalogue[name];
  if (!entry) throw new Error(`Unknown art: ${name}`);
  return defToSvg(entry.def, opts);
}

const warned = new Set<string>();

export function Art({ name, size = 64, height, style, label, dark, tint, thirsty, fit }: ArtProps) {
  const theme = useTheme();
  const entry = hasArt(name) ? catalogue[name] : undefined;
  const h = height ?? Math.round(size / (entry?.aspect ?? 1));
  if (!entry && __DEV__ && !warned.has(name)) {
    warned.add(name);
    console.warn(`[art] unknown piece "${name}"`);
  }
  const Piece = entry?.piece;
  return (
    <View
      style={[{ width: size, height: h }, style]}
      accessible={!!label}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
    >
      {Piece ? <Piece width={size} height={h} dark={dark ?? theme.dark} tint={tint} thirsty={thirsty} fit={fit} /> : null}
    </View>
  );
}

export { ArabicLetterCard, type ArabicLetterCardProps, type LetterCardTone } from './ArabicLetterCard';
export type { ArtCategory, KnownArtName } from './catalogue';
export { HIJAZ_POINTS, MAKKAH, projectHijaz, projectWorld, SKY_H, SKY_HORIZON, SKY_SUN, SKY_W, type SkyTime } from './pieces/sky';
