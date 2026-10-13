import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useFeedback } from '@/core/hooks/useFeedback';
import { makeStyles, radius, shadows, spacing } from '@/core/theme';

export type CardTone = 'default' | 'alt' | 'gold' | 'primary' | 'dark';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  tone?: CardTone;
  padded?: boolean;
  disabled?: boolean;
}

const useStyles = makeStyles((c) => ({
  card: { borderRadius: radius.lg, borderWidth: 1, ...shadows(c.shadow).card },
  padded: { padding: spacing.lg },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  default: { backgroundColor: c.surface, borderColor: c.border },
  alt: { backgroundColor: c.surfaceAlt, borderColor: c.border },
  gold: { backgroundColor: c.goldSoft, borderColor: c.goldBorder },
  primary: { backgroundColor: c.primarySoft, borderColor: c.primaryBorder },
  dark: { backgroundColor: c.nightSoft, borderColor: c.nightLine },
}));

/** Surface card. `tone="dark"` stays dark in both schemes – use `c.onNight*` text on it. */
export function Card({ children, onPress, style, accessibilityLabel, accessibilityHint, tone = 'default', padded = true, disabled }: CardProps) {
  const styles = useStyles();
  const feedback = useFeedback();
  const content = [styles.card, styles[tone], padded && styles.padded, style];

  if (!onPress) {
    return (
      <View style={content} accessibilityLabel={accessibilityLabel}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        feedback.tap();
        onPress();
      }}
      style={({ pressed }) => [...content, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}
