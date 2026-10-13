import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { OnboardingFrame } from '@/core/components/onboarding/OnboardingFrame';
import { SceneView } from '@/core/components/scene/SceneView';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { useI18n } from '@/core/i18n';
import { spacing, useTheme } from '@/core/theme';

/** Step 1: welcome. */
export default function Welcome() {
  const { t } = useI18n();
  const { c } = useTheme();
  return (
    <OnboardingFrame
      step={1}
      showBack={false}
      footer={<Button label={t('onboarding.welcome.cta')} variant="gold" iconRight="chevron" onPress={() => router.push('/onboarding/language')} />}
    >
      <SceneView scene={{ sky: 'night', elements: ['stars', 'crescent', 'mountains', 'city', 'book'] }} height={210} />
      <View style={styles.texts}>
        <AppText variant="display" color={c.gold} align="center" accessibilityRole="header">
          {t('onboarding.welcome.title')}
        </AppText>
        <AppText variant="body" color={c.onNight} align="center">
          {t('onboarding.welcome.body')}
        </AppText>
        <AppText variant="tiny" color={c.onNightMuted} align="center">
          {t('app.credit')}
        </AppText>
      </View>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  texts: { gap: spacing.sm },
});
