import { router } from 'expo-router';

import { ChoiceList } from '@/core/components/onboarding/ChoiceList';
import { OnboardingFrame } from '@/core/components/onboarding/OnboardingFrame';
import { Button } from '@/core/components/ui/Button';
import { LANGUAGE_NAMES, useI18n } from '@/core/i18n';
import { LANGUAGES } from '@/core/models';
import { useAppStore } from '@/core/store/appStore';

/** Step 2: language (applies immediately). */
export default function LanguageStep() {
  const { t, language } = useI18n();
  const updateSettings = useAppStore((s) => s.updateSettings);
  return (
    <OnboardingFrame
      step={2}
      title={t('onboarding.language.title')}
      subtitle={t('onboarding.language.body')}
      footer={<Button label={t('onboarding.next')} variant="gold" iconRight="chevron" onPress={() => router.push('/onboarding/learner')} />}
    >
      <ChoiceList
        options={LANGUAGES.map((lang) => ({ value: lang, label: LANGUAGE_NAMES[lang], icon: 'globe' }))}
        value={language}
        onChange={(lang) => updateSettings({ language: lang })}
      />
    </OnboardingFrame>
  );
}
