import { useEffect } from 'react';
import { View } from 'react-native';

import { AppModal } from '@/core/components/ui/AppModal';
import { AppText } from '@/core/components/ui/AppText';
import { Badge } from '@/core/components/ui/Badge';
import { Button } from '@/core/components/ui/Button';
import { Icon } from '@/core/components/ui/Icon';
import { useFeedback } from '@/core/hooks/useFeedback';
import { badgeDescription, badgeName, useI18n } from '@/core/i18n';
import { useAppStore } from '@/core/store/appStore';
import { makeStyles, spacing, useTheme } from '@/core/theme';

const useStyles = makeStyles((c) => ({
  content: { alignItems: 'center', gap: spacing.md },
  levelCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: c.goldSoft,
    borderWidth: 4,
    borderColor: c.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: { position: 'absolute', bottom: 18 },
}));

/** Shows queued badge unlocks and level-ups one at a time, unless paused (e.g. mid-unit or mid-story). */
export function CelebrationOverlay() {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const next = useAppStore((s) => s.celebrations[0]);
  const paused = useAppStore((s) => s.celebrationsPaused);
  const dismiss = useAppStore((s) => s.dismissCelebration);
  const visible = !!next && !paused;

  useEffect(() => {
    if (visible) feedback.reward();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, next]);

  if (!next) return null;

  return (
    <AppModal visible={visible} onClose={dismiss}>
      <View style={styles.content}>
        {next.kind === 'badge' ? (
          <>
            <AppText variant="label" color={c.goldText}>
              {t('reward.newBadge').toUpperCase()}
            </AppText>
            <Badge id={next.id} earned size={120} showLabel={false} />
            <AppText variant="title" align="center">
              {t(badgeName(next.id))}
            </AppText>
            <AppText variant="body" align="center" color={c.textMuted}>
              {t(badgeDescription(next.id))}
            </AppText>
          </>
        ) : (
          <>
            <View style={styles.levelCircle}>
              <Icon name="star" size={56} color={c.gold} />
              <AppText variant="display" color={c.text} style={styles.levelNumber}>
                {next.level}
              </AppText>
            </View>
            <AppText variant="title" align="center">
              {t('celebrate.levelTitle')}
            </AppText>
            <AppText variant="body" align="center" color={c.textMuted}>
              {t('celebrate.levelBody', { level: next.level })}
            </AppText>
          </>
        )}
        <Button label={t('common.continue')} onPress={dismiss} />
      </View>
    </AppModal>
  );
}
