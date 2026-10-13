import { View } from 'react-native';

import { useI18n } from '@/core/i18n';
import { levelInfo } from '@/core/services/xp';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { AppText } from './AppText';
import { ProgressBar } from './ProgressBar';

interface XPBarProps {
  xp: number;
  /** On a dark (night) header. */
  dark?: boolean;
}

const useStyles = makeStyles((c) => ({
  root: { gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelPill: { backgroundColor: c.gold, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 2 },
  next: { opacity: 0.9 },
}));

export function XPBar({ xp, dark }: XPBarProps) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const info = levelInfo(xp);
  const fg = dark ? c.onNight : c.text;
  const muted = dark ? c.onNightMuted : c.textMuted;

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <View style={styles.levelPill}>
          <AppText variant="small" color={c.onGold}>
            {t('common.level', { level: info.level })}
          </AppText>
        </View>
        <AppText variant="small" color={muted}>
          {info.xpIntoLevel} / {info.xpForNextLevel} XP
        </AppText>
      </View>
      <ProgressBar
        progress={info.progress}
        color={c.gold}
        trackColor={dark ? 'rgba(255,255,255,0.18)' : c.track}
        accessibilityLabel={t('a11y.xpBar', { xp: info.xpIntoLevel, total: info.xpForNextLevel })}
      />
      <AppText variant="tiny" color={fg} style={styles.next}>
        {t('profile.xpToNext', { xp: info.xpForNextLevel - info.xpIntoLevel, level: info.level + 1 })}
      </AppText>
    </View>
  );
}
