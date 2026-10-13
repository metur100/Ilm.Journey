import { Pressable, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Icon } from '@/core/components/ui/Icon';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useI18n } from '@/core/i18n';
import { makeStyles, type Palette, radius, spacing, useTheme } from '@/core/theme';

export type OptionState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'dimmed';

interface AnswerOptionProps {
  label: string;
  state: OptionState;
  onPress: () => void;
  disabled?: boolean;
  marker?: string;
  script?: 'auto' | 'quran';
}

function colorsFor(c: Palette, state: OptionState): { bg: string; border: string; fg: string } {
  switch (state) {
    case 'selected':
      return { bg: c.primarySoft, border: c.primary, fg: c.text };
    case 'correct':
      return { bg: c.successSoft, border: c.success, fg: c.text };
    case 'incorrect':
      return { bg: c.errorSoft, border: c.error, fg: c.text };
    case 'dimmed':
      return { bg: c.surface, border: c.border, fg: c.textMuted };
    default:
      return { bg: c.surface, border: c.border, fg: c.text };
  }
}

const useStyles = makeStyles(() => ({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  dimmed: { opacity: 0.6 },
  marker: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1 },
}));

/** Large, clearly labelled answer button used by all choice-based questions. */
export function AnswerOption({ label, state, onPress, disabled, marker, script = 'auto' }: AnswerOptionProps) {
  const feedback = useFeedback();
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const s = colorsFor(c, state);
  const stateLabel =
    state === 'correct' ? t('a11y.correct') : state === 'incorrect' ? t('a11y.incorrect') : state === 'selected' ? t('a11y.selected') : '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={stateLabel ? `${label}, ${stateLabel}` : label}
      accessibilityState={{ disabled: !!disabled, selected: state === 'selected' }}
      disabled={disabled}
      onPress={() => {
        feedback.tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.option,
        { backgroundColor: s.bg, borderColor: s.border },
        pressed && !disabled && styles.pressed,
        state === 'dimmed' && styles.dimmed,
      ]}
    >
      {marker ? (
        <View style={[styles.marker, { borderColor: s.border }]}>
          <AppText variant="small" color={s.fg}>
            {marker}
          </AppText>
        </View>
      ) : null}
      <AppText variant="bodyBold" color={s.fg} style={styles.label} script={script}>
        {label}
      </AppText>
      {state === 'correct' ? <Icon name="check" size={22} color={c.success} strokeWidth={3} /> : null}
      {state === 'incorrect' ? <Icon name="close" size={22} color={c.error} strokeWidth={3} /> : null}
    </Pressable>
  );
}
