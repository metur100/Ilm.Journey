import { View } from 'react-native';

import { useI18n } from '@/core/i18n';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

interface StreakDisplayProps {
  days: number;
  activeToday: boolean;
  compact?: boolean;
  /** On a dark (night) header. */
  dark?: boolean;
}

const FLAME = '#F28C28';

const useStyles = makeStyles((c) => ({
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: c.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  compactDark: { backgroundColor: 'rgba(255,255,255,0.14)' },
  full: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flameCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceAlt },
  flameActive: { backgroundColor: c.goldSoft },
  texts: { flex: 1 },
}));

export function StreakDisplay({ days, activeToday, compact, dark }: StreakDisplayProps) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const label = t(days === 1 ? 'streak.day' : 'streak.days', { count: days });
  const flameColor = activeToday ? FLAME : dark ? c.onNightMuted : c.locked;

  if (compact) {
    return (
      <View style={[styles.compact, dark && styles.compactDark]} accessible accessibilityLabel={`${t('streak.label')}: ${label}`}>
        <Icon name="flame" size={18} color={flameColor} />
        <AppText variant="small" color={dark ? c.onNight : c.text}>
          {days}
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.full} accessible accessibilityLabel={`${t('streak.label')}: ${label}`}>
      <View style={[styles.flameCircle, activeToday && styles.flameActive]}>
        <Icon name="flame" size={26} color={flameColor} />
      </View>
      <View style={styles.texts}>
        <AppText variant="heading">{label}</AppText>
        <AppText variant="small" color={c.textMuted}>
          {activeToday ? t('streak.today') : t('streak.notToday')}
        </AppText>
      </View>
    </View>
  );
}
