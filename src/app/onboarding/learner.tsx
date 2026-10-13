import { router } from 'expo-router';

import { ChoiceList } from '@/core/components/onboarding/ChoiceList';
import { OnboardingFrame } from '@/core/components/onboarding/OnboardingFrame';
import { Button } from '@/core/components/ui/Button';
import { type CoreKey, useI18n } from '@/core/i18n';
import { LEARNER_GROUPS, type LearnerGroup } from '@/core/models';
import { useOnboardingDraft } from '@/core/store/onboardingDraft';

const ICONS: Record<LearnerGroup, string> = { child: 'star', teen: 'compass', adult: 'book' };

/** Step 3: who is learning (only used for recommendations and tone). */
export default function LearnerStep() {
  const { t } = useI18n();
  const learnerGroup = useOnboardingDraft((s) => s.learnerGroup);
  const setLearnerGroup = useOnboardingDraft((s) => s.setLearnerGroup);
  return (
    <OnboardingFrame
      step={3}
      title={t('onboarding.learner.title')}
      subtitle={t('onboarding.learner.body')}
      footer={<Button label={t('onboarding.next')} variant="gold" iconRight="chevron" onPress={() => router.push('/onboarding/name')} />}
    >
      <ChoiceList
        options={LEARNER_GROUPS.map((group) => ({
          value: group,
          label: t(`learner.${group}` as CoreKey),
          description: t(`learner.${group}.desc` as CoreKey),
          icon: ICONS[group],
        }))}
        value={learnerGroup}
        onChange={setLearnerGroup}
      />
    </OnboardingFrame>
  );
}
