import { router } from 'expo-router';
import { useState } from 'react';
import { TextInput } from 'react-native';

import { CharacterEditor } from '@/core/components/character/CharacterEditor';
import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { Screen } from '@/core/components/ui/Screen';
import { TopBar } from '@/core/components/ui/TopBar';
import { useI18n } from '@/core/i18n';
import { useAppStore } from '@/core/store/appStore';
import { fonts, makeStyles, radius, spacing, useTheme } from '@/core/theme';
import { isValidName, MAX_NAME_LENGTH } from '@/core/utils/validation';

const useStyles = makeStyles((c) => ({
  input: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.surface,
    paddingHorizontal: spacing.lg,
    fontSize: 18,
    fontFamily: fonts.bold,
    color: c.text,
  },
}));

/** Edit the hero and name from the profile. */
export default function CharacterScreen() {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const [character, setDraft] = useState(profile.character);
  const [name, setName] = useState(profile.name);
  const valid = isValidName(name);

  const save = () => {
    if (!valid) return;
    updateProfile({ character, name });
    router.back();
  };

  return (
    <Screen header={<TopBar title={t('character.title')} />}>
      <AppText variant="label" color={c.textMuted}>
        {t('character.name').toUpperCase()}
      </AppText>
      <TextInput
        value={name}
        onChangeText={(v) => setName(v.slice(0, MAX_NAME_LENGTH))}
        placeholder={t('onboarding.name.placeholder')}
        placeholderTextColor={c.textMuted}
        accessibilityLabel={t('character.name')}
        maxLength={MAX_NAME_LENGTH}
        style={styles.input}
      />
      {!valid ? (
        <AppText variant="small" color={c.error}>
          {t('onboarding.name.error')}
        </AppText>
      ) : null}
      <CharacterEditor character={character} onChange={setDraft} />
      <Button label={t('common.save')} icon="check" onPress={save} disabled={!valid} />
    </Screen>
  );
}
