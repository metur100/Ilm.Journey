import { router } from 'expo-router';
import { View } from 'react-native';

import { Avatar } from '@/core/components/character/Avatar';
import { OnboardingFrame } from '@/core/components/onboarding/OnboardingFrame';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { useI18n } from '@/core/i18n';
import { useAppStore } from '@/core/store/appStore';
import { useOnboardingDraft } from '@/core/store/onboardingDraft';
import { makeStyles, useTheme } from '@/core/theme';

const useStyles = makeStyles((c) => ({
  avatar: {
    alignSelf: 'center',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: c.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
}));

/** Step 7: start – commits the onboarding choices to the global store. */
export default function StartStep() {
  const { t, language } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const { name, character, learnerGroup } = useOnboardingDraft();

  const finish = () => {
    completeOnboarding({ name, character, language, learnerGroup });
    router.replace('/(tabs)');
  };

  return (
    <OnboardingFrame
      step={7}
      title={t('onboarding.start.title')}
      footer={<Button label={t('onboarding.start.cta')} variant="gold" icon="play" onPress={finish} />}
    >
      <View style={styles.avatar}>
        <Avatar character={character} size={130} />
      </View>
      <AppText variant="heading" color={c.gold} align="center">
        {name}
      </AppText>
      <AppText variant="body" color={c.onNight} align="center">
        {t('onboarding.start.body')}
      </AppText>
    </OnboardingFrame>
  );
}
