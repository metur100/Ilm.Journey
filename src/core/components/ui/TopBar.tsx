import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useI18n } from '@/core/i18n';
import { spacing, TOUCH_TARGET, useTheme } from '@/core/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

interface TopBarProps {
  title?: string;
  onBack?: () => void;
  backIcon?: IconName;
  backLabel?: string;
  right?: React.ReactNode;
  /** On a dark header (hero / topic gradient). */
  dark?: boolean;
}

/** Header row with back button, centred title and optional right-hand action. */
export function TopBar({ title, onBack, backIcon = 'back', backLabel, right, dark }: TopBarProps) {
  const { t } = useI18n();
  const { c } = useTheme();
  const fg = dark ? c.onNight : c.text;
  const handleBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={backLabel ?? t('a11y.back')}
        onPress={handleBack}
        hitSlop={8}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <Icon name={backIcon} color={fg} size={26} />
      </Pressable>
      <AppText variant="heading" color={fg} style={styles.title} numberOfLines={1} accessibilityRole="header">
        {title ?? ''}
      </AppText>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, minHeight: 56, gap: spacing.sm },
  iconButton: { width: TOUCH_TARGET, height: TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
  title: { flex: 1, textAlign: 'center' },
  right: { minWidth: TOUCH_TARGET, alignItems: 'flex-end', justifyContent: 'center' },
});
