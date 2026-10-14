import { Pressable, View } from 'react-native';

import { Art, hasArt } from '@/core/art';
import { Reactive } from '@/core/components/questions/motion';
import { AppText } from '@/core/components/ui/AppText';
import { Icon } from '@/core/components/ui/Icon';
import { useFeedback } from '@/core/hooks/useFeedback';
import { useI18n } from '@/core/i18n';
import { makeStyles, type Palette, radius, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';

export type OptionState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'dimmed';

interface AnswerOptionProps {
  label: string;
  state: OptionState;
  onPress: () => void;
  disabled?: boolean;
  marker?: string;
  script?: 'auto' | 'quran';
  /** Art library name (`category.name`); shown on the left when the library has the piece. */
  art?: string;
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

const ART_SIZE = 48;

const useStyles = makeStyles((c) => ({
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
  withArt: { paddingLeft: spacing.sm },
  pressed: { transform: [{ scale: 0.98 }] },
  dimmed: { opacity: 0.6 },
  marker: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  art: {
    width: Math.max(ART_SIZE, TOUCH_TARGET),
    height: Math.max(ART_SIZE, TOUCH_TARGET),
    borderRadius: radius.sm,
    backgroundColor: c.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: { flex: 1 },
  badge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
}));

/**
 * Large, clearly labelled answer button used by all choice-based questions.
 * After answering, the correct option flips over to its "correct" face with a pop and a soft glow; a wrong pick shakes
 * gently (all skipped under reduced motion).
 */
export function AnswerOption({ label, state, onPress, disabled, marker, script = 'auto', art }: AnswerOptionProps) {
  const feedback = useFeedback();
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const s = colorsFor(c, state);
  const stateLabel =
    state === 'correct' ? t('a11y.correct') : state === 'incorrect' ? t('a11y.incorrect') : state === 'selected' ? t('a11y.selected') : '';
  const showArt = !!art && hasArt(art);

  return (
    <Reactive
      reaction={state === 'correct' ? 'correct' : state === 'incorrect' ? 'incorrect' : 'idle'}
      face={state === 'correct'}
      flipAxis="x"
      radius={radius.md}
    >
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
          showArt && styles.withArt,
          { backgroundColor: s.bg, borderColor: s.border },
          pressed && !disabled && styles.pressed,
          state === 'dimmed' && styles.dimmed,
        ]}
      >
        {showArt ? (
          <View style={styles.art}>
            <Art name={art} size={ART_SIZE} />
          </View>
        ) : null}
        {marker && !showArt ? (
          <View style={[styles.marker, { borderColor: s.border }]}>
            <AppText variant="small" color={s.fg}>
              {marker}
            </AppText>
          </View>
        ) : null}
        <AppText variant="bodyBold" color={s.fg} style={styles.label} script={script}>
          {label}
        </AppText>
        {state === 'correct' ? (
          <View style={[styles.badge, { backgroundColor: c.success }]}>
            <Icon name="check" size={18} color={c.onStatus} strokeWidth={3} />
          </View>
        ) : null}
        {state === 'incorrect' ? <Icon name="close" size={22} color={c.error} strokeWidth={3} /> : null}
      </Pressable>
    </Reactive>
  );
}
