import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Button } from '@/core/components/ui/Button';
import { useFeedback } from '@/core/hooks/useFeedback';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { useQuestI18n } from '../i18n';
import { useQuestStore } from '../store/questStore';
import { TracingPad, useScreenReader } from './TracingPad';

const useStyles = makeStyles(() => ({ root: { gap: spacing.md } }));

/** Quest step: trace several letters one after another; the next letter unlocks once enough has been traced. */
export function TracingStep({ letters, onDone }: { letters: string[]; onDone: () => void }) {
  const { t } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  const screenReader = useScreenReader();
  const markLetterTraced = useQuestStore((s) => s.markLetterTraced);
  const [index, setIndex] = useState(0);
  const [traced, setTraced] = useState(false);
  const letter = letters[index];
  const last = index + 1 >= letters.length;

  const next = () => {
    feedback.success();
    if (last) {
      onDone();
      return;
    }
    setIndex(index + 1);
    setTraced(false);
  };

  return (
    <View style={styles.root}>
      <AppText variant="title" accessibilityRole="header">
        {t('tracing.title')}
      </AppText>
      <AppText variant="body" color={c.textMuted}>
        {t('tracing.hint')}
      </AppText>
      <AppText variant="small" color={c.textMuted}>
        {t('tracing.progress', { current: index + 1, total: letters.length })}
      </AppText>
      <TracingPad key={`${index}-${letter}`} letter={letter} onChange={setTraced} onTraced={() => markLetterTraced(letter)} />
      <Button label={last ? t('common.continue') : t('tracing.next')} iconRight="chevron" onPress={next} disabled={!traced && !screenReader} />
    </View>
  );
}
