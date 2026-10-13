import React from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { useStatusBar } from '@/core/hooks/useStatusBar';
import { spacing, useTheme } from '@/core/theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  /** Defaults to the theme background. */
  background?: string;
  contentStyle?: ViewStyle;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

/** Safe-area aware, theme-coloured page container with optional scrolling, sticky header and footer. */
export function Screen({ children, scroll = true, edges = ['top', 'left', 'right'], background, contentStyle, header, footer }: ScreenProps) {
  const { c } = useTheme();
  useStatusBar(false);
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: background ?? c.background }]} edges={edges}>
      {header}
      {scroll ? (
        <ScrollView contentContainerStyle={[styles.content, contentStyle]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>
      )}
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fill: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
});
