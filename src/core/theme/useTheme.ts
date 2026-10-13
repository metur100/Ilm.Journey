import { useMemo } from 'react';
import { type ImageStyle, StyleSheet, type TextStyle, useColorScheme, type ViewStyle } from 'react-native';

import type { ThemeMode } from '../models';
import { useAppStore } from '../store/appStore';
import { type ColorScheme, type Palette, paletteFor } from './palettes';
import { LARGE_TEXT_SCALE } from './tokens';

/** Resolves the colour scheme from the setting and the system scheme. */
export function resolveScheme(mode: ThemeMode, system: string | null | undefined): ColorScheme {
  if (mode === 'dark') return 'dark';
  if (mode === 'light') return 'light';
  return system === 'dark' ? 'dark' : 'light';
}

export interface ThemeInfo {
  /** Current palette. */
  c: Palette;
  dark: boolean;
  scheme: ColorScheme;
  highContrast: boolean;
  /** Font scale of the large-text setting. */
  scale: number;
}

/** Current colours according to the theme mode (system/light/dark) and accessibility settings. */
export function useTheme(): ThemeInfo {
  const system = useColorScheme();
  const mode = useAppStore((s) => s.settings.themeMode);
  const highContrast = useAppStore((s) => s.settings.highContrast);
  const largeText = useAppStore((s) => s.settings.largeText);
  const scheme = resolveScheme(mode, system);
  return useMemo(
    () => ({
      c: paletteFor(scheme, highContrast),
      dark: scheme === 'dark',
      scheme,
      highContrast,
      scale: largeText ? LARGE_TEXT_SCALE : 1,
    }),
    [scheme, highContrast, largeText],
  );
}

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Creates a hook that returns theme-aware styles, built once per palette and cached.
 *
 *   const useStyles = makeStyles((c) => ({ root: { backgroundColor: c.background } }));
 *   function MyScreen() { const styles = useStyles(); … }
 */
export function makeStyles<T extends NamedStyles<T>>(factory: (c: Palette, info: { dark: boolean }) => T): () => T {
  const cache = new WeakMap<Palette, T>();
  return function useStyles(): T {
    const { c, dark } = useTheme();
    let styles = cache.get(c);
    if (!styles) {
      styles = StyleSheet.create(factory(c, { dark })) as T;
      cache.set(c, styles);
    }
    return styles;
  };
}
