import { StyleSheet, View } from 'react-native';

import { AppText, type TextVariant } from '@/core/components/ui/AppText';
import { useTheme } from '@/core/theme';

import { type StoriesKey, useStoriesI18n } from '../i18n';
import type { Story } from '../models';

/** Plain prophet name with the honorific ("Muhammad ﷺ", "Nuh (peace be upon him)") for labels. */
export function prophetLabel(story: Story, l: (t: Story['prophetName']) => string, t: (key: StoriesKey) => string): string {
  return story.honorific === 'sallallahu-alayhi-wa-sallam'
    ? `${l(story.prophetName)} ﷺ`
    : `${l(story.prophetName)} (${t(`honorific.${story.honorific}`)})`;
}

/** Prophet's name with the respectful honorific (ﷺ for Muhammad, "peace be upon him" for the others). */
export function ProphetName({ story, variant = 'heading', dark }: { story: Story; variant?: TextVariant; dark?: boolean }) {
  const { t, l } = useStoriesI18n();
  const { c } = useTheme();
  const isMuhammad = story.honorific === 'sallallahu-alayhi-wa-sallam';
  return (
    <View style={styles.row} accessible accessibilityLabel={prophetLabel(story, l, t)}>
      <AppText variant={variant} color={dark ? c.onNight : c.text}>
        {l(story.prophetName)}
        {isMuhammad ? ' ﷺ' : ''}
      </AppText>
      {!isMuhammad ? (
        <AppText variant="tiny" color={dark ? c.onNightMuted : c.textMuted}>
          ({t(`honorific.${story.honorific}`)})
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 },
});
