import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStatusBar } from '@/core/hooks/useStatusBar';
import { spacing, useTheme } from '@/core/theme';

import { PatternBackground } from './PatternBackground';

interface HeroHeaderProps {
  children: React.ReactNode;
  /** Defaults to the theme's night header gradient; topic screens pass the topic gradient. */
  gradient?: [string, string];
}

/** Night-sky header with geometric pattern at the top of the main screens. Text on it uses `c.onNight*`. */
export function HeroHeader({ children, gradient }: HeroHeaderProps) {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  useStatusBar(true);
  return (
    <LinearGradient colors={gradient ?? c.headerGradient} style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
      <PatternBackground />
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  content: { gap: spacing.lg },
});
