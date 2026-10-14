import { Pressable, StyleSheet, View } from 'react-native';

import { spacing, useTheme } from '@/core/theme';

import { AppText } from './AppText';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  /** On a dark (night) background. */
  dark?: boolean;
}

export function SectionHeader({ title, actionLabel, onAction, dark }: SectionHeaderProps) {
  const { c } = useTheme();
  return (
    <View style={styles.row}>
      <AppText variant="heading" color={dark ? c.onNight : c.text} accessibilityRole="header" style={styles.title}>
        {title}
      </AppText>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={10} style={styles.action}>
          <AppText variant="small" color={dark ? c.gold : c.primaryText}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  // flexGrow: Android sometimes measures a title a fraction too narrow and wraps its last word out of view ("Tvoj put").
  title: { flexShrink: 1, flexGrow: 1 },
  action: { minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing.xs },
});
