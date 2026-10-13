import { router } from 'expo-router';
import { View } from 'react-native';

import { OnboardingFrame } from '@/core/components/onboarding/OnboardingFrame';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Icon, type IconName } from '@/core/components/ui/Icon';
import { type CoreKey, useI18n } from '@/core/i18n';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

const STEPS: { id: 'learn' | 'practice' | 'remember' | 'grow'; icon: IconName }[] = [
  { id: 'learn', icon: 'book' },
  { id: 'practice', icon: 'sparkle' },
  { id: 'remember', icon: 'refresh' },
  { id: 'grow', icon: 'star' },
];

const useStyles = makeStyles((c) => ({
  list: { gap: spacing.md },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.md, padding: spacing.md },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.gold, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
}));

/** Step 6: how the journey works. */
export default function HowStep() {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <OnboardingFrame
      step={6}
      title={t('onboarding.how.title')}
      footer={<Button label={t('onboarding.next')} variant="gold" iconRight="chevron" onPress={() => router.push('/onboarding/start')} />}
    >
      <View style={styles.list}>
        {STEPS.map((step) => (
          <View key={step.id} style={styles.step} accessible>
            <View style={styles.icon}>
              <Icon name={step.icon} size={22} color={c.onGold} />
            </View>
            <View style={styles.texts}>
              <AppText variant="bodyBold" color={c.onNight}>
                {t(`onboarding.how.${step.id}.title` as CoreKey)}
              </AppText>
              <AppText variant="small" color={c.onNightMuted}>
                {t(`onboarding.how.${step.id}.body` as CoreKey)}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </OnboardingFrame>
  );
}
