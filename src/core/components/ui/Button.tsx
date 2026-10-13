import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { useFeedback } from '@/core/hooks/useFeedback';
import { type Palette, radius, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'danger' | 'light';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'md' | 'lg';
  style?: ViewStyle;
  accessibilityHint?: string;
  silent?: boolean;
}

function palette(c: Palette, variant: ButtonVariant): { bg: string; fg: string; border?: string; pressed: string } {
  switch (variant) {
    case 'primary':
      return { bg: c.primary, fg: c.onPrimary, pressed: c.primaryText };
    case 'secondary':
      return { bg: c.surface, fg: c.primaryText, border: c.border, pressed: c.surfaceAlt };
    case 'gold':
      return { bg: c.gold, fg: c.onGold, pressed: c.goldBorder };
    case 'ghost':
      return { bg: 'transparent', fg: c.primaryText, pressed: c.primarySoft };
    case 'danger':
      return { bg: c.error, fg: c.onStatus, pressed: c.errorSoft };
    case 'light':
      // On dark headers and onboarding (always dark in both schemes).
      return { bg: 'rgba(255,255,255,0.14)', fg: c.onNight, border: 'rgba(255,255,255,0.3)', pressed: 'rgba(255,255,255,0.24)' };
  }
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  disabled,
  loading,
  fullWidth = true,
  size = 'lg',
  style,
  accessibilityHint,
  silent,
}: ButtonProps) {
  const { c } = useTheme();
  const colors = palette(c, variant);
  const feedback = useFeedback();
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={() => {
        if (!silent) feedback.tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: size === 'lg' ? 54 : TOUCH_TARGET,
          backgroundColor: pressed && variant !== 'primary' ? colors.pressed : colors.bg,
          borderColor: colors.border ?? 'transparent',
          borderWidth: colors.border ? 1.5 : 0,
          opacity: inactive ? 0.5 : pressed && variant === 'primary' ? 0.88 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={20} color={colors.fg} /> : null}
          <AppText variant="bodyBold" color={colors.fg} align="center" style={styles.label}>
            {label}
          </AppText>
          {iconRight ? <Icon name={iconRight} size={20} color={colors.fg} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { flexShrink: 1 },
});
