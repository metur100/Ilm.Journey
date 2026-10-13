import { router } from 'expo-router';
import { View } from 'react-native';

import { CharacterEditor } from '@/core/components/character/CharacterEditor';
import { OnboardingFrame } from '@/core/components/onboarding/OnboardingFrame';
import { Button } from '@/core/components/ui/Button';
import { useI18n } from '@/core/i18n';
import { useOnboardingDraft } from '@/core/store/onboardingDraft';
import { makeStyles, radius, spacing } from '@/core/theme';

const useStyles = makeStyles((c) => ({
  editor: { backgroundColor: c.background, borderRadius: radius.xl, padding: spacing.lg },
}));

/** Step 5: create the hero (the learner's own avatar – never a prophet or real person). */
export default function CharacterStep() {
  const { t } = useI18n();
  const styles = useStyles();
  const character = useOnboardingDraft((s) => s.character);
  const setCharacter = useOnboardingDraft((s) => s.setCharacter);
  return (
    <OnboardingFrame
      step={5}
      title={t('onboarding.character.title')}
      subtitle={t('onboarding.character.body')}
      footer={<Button label={t('onboarding.next')} variant="gold" iconRight="chevron" onPress={() => router.push('/onboarding/how')} />}
    >
      <View style={styles.editor}>
        <CharacterEditor character={character} onChange={setCharacter} />
      </View>
    </OnboardingFrame>
  );
}
