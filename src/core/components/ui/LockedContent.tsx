import { View } from 'react-native';

import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

const useStyles = makeStyles((c) => ({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: c.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dark: { backgroundColor: 'rgba(0,0,0,0.28)' },
  text: { flex: 1 },
}));

/** Explains why something is locked and what unlocks it. */
export function LockedContent({ message, dark }: { message: string; dark?: boolean }) {
  const { c } = useTheme();
  const styles = useStyles();
  const color = dark ? c.onNight : c.textMuted;
  return (
    <View style={[styles.root, dark && styles.dark]} accessible accessibilityLabel={message}>
      <Icon name="lock" size={18} color={color} />
      <AppText variant="small" color={color} style={styles.text}>
        {message}
      </AppText>
    </View>
  );
}
