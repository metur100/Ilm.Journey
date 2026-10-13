import { Pressable, View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Icon, type IconKey } from '@/core/components/ui/Icon';
import { useFeedback } from '@/core/hooks/useFeedback';
import { makeStyles, radius, spacing, useTheme } from '@/core/theme';

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon: IconKey;
}

const useStyles = makeStyles((c) => ({
  list: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  optionActive: { backgroundColor: c.gold, borderColor: c.gold },
  texts: { flex: 1, gap: 2 },
}));

/** Large radio list on the dark onboarding background. */
export function ChoiceList<T extends string>({ options, value, onChange }: { options: ChoiceOption<T>[]; value: T; onChange: (value: T) => void }) {
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {options.map((option) => {
        const active = option.value === value;
        const fg = active ? c.onGold : c.onNight;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.description ? `${option.label}. ${option.description}` : option.label}
            onPress={() => {
              feedback.tap();
              onChange(option.value);
            }}
            style={[styles.option, active && styles.optionActive]}
          >
            <Icon name={option.icon} size={24} color={fg} />
            <View style={styles.texts}>
              <AppText variant="bodyBold" color={fg}>
                {option.label}
              </AppText>
              {option.description ? (
                <AppText variant="small" color={active ? c.onGold : c.onNightMuted}>
                  {option.description}
                </AppText>
              ) : null}
            </View>
            {active ? <Icon name="check" size={22} color={c.onGold} strokeWidth={3} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
