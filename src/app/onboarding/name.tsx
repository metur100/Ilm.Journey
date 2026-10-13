import { router } from 'expo-router';
import { useState } from 'react';
import { TextInput } from 'react-native';

import { OnboardingFrame } from '@/core/components/onboarding/OnboardingFrame';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { useI18n } from '@/core/i18n';
import { useOnboardingDraft } from '@/core/store/onboardingDraft';
import { fonts, makeStyles, radius, spacing, useTheme } from '@/core/theme';
import { isValidName, MAX_NAME_LENGTH } from '@/core/utils/validation';

const useStyles = makeStyles((c) => ({
  input: {
    minHeight: 56,
    borderRadius: radius.lg,
    backgroundColor: c.surface,
    paddingHorizontal: spacing.lg,
    fontSize: 20,
    fontFamily: fonts.bold,
    color: c.text,
    textAlign: 'center',
  },
}));

/** Step 4: the learner's name (stays on the device). */
export default function NameStep() {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const name = useOnboardingDraft((s) => s.name);
  const setName = useOnboardingDraft((s) => s.setName);
  const [touched, setTouched] = useState(false);
  const valid = isValidName(name);

  const next = () => {
    setTouched(true);
    if (valid) router.push('/onboarding/character');
  };

  return (
    <OnboardingFrame
      step={4}
      title={t('onboarding.name.title')}
      subtitle={t('onboarding.name.body')}
      footer={<Button label={t('onboarding.next')} variant="gold" iconRight="chevron" onPress={next} disabled={touched && !valid} />}
    >
      <TextInput
        value={name}
        onChangeText={(v) => setName(v.slice(0, MAX_NAME_LENGTH))}
        placeholder={t('onboarding.name.placeholder')}
        placeholderTextColor={c.textMuted}
        accessibilityLabel={t('onboarding.name.title')}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={MAX_NAME_LENGTH}
        returnKeyType="done"
        onSubmitEditing={next}
        onBlur={() => setTouched(true)}
        style={styles.input}
      />
      {touched && !valid ? (
        <AppText variant="small" color={c.gold} align="center" accessibilityLiveRegion="polite">
          {t('onboarding.name.error')}
        </AppText>
      ) : null}
    </OnboardingFrame>
  );
}
