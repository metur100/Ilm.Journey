import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { useFeedback } from '@/core/hooks/useFeedback';
import { spacing, useTheme } from '@/core/theme';

import { AppText } from './AppText';
import { Icon, type IconKey } from './Icon';

interface ToggleRowProps {
  icon: IconKey;
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleRow({ icon, label, description, value, onChange }: ToggleRowProps) {
  const feedback = useFeedback();
  const { c, dark } = useTheme();
  return (
    <Pressable
      style={styles.row}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value }}
      onPress={() => {
        feedback.tap();
        onChange(!value);
      }}
    >
      <Icon name={icon} size={22} color={c.primaryText} />
      <View style={styles.texts}>
        <AppText variant="bodyBold">{label}</AppText>
        {description ? (
          <AppText variant="small" color={c.textMuted}>
            {description}
          </AppText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: c.primary, false: c.switchOff }}
        // In dark mode the surface colour would make the thumb invisible on the card.
        thumbColor={dark ? c.text : c.surface}
        importantForAccessibility="no"
        accessibilityElementsHidden
      />
    </Pressable>
  );
}

interface LinkRowProps {
  icon: IconKey;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}

export function LinkRow({ icon, label, value, onPress, danger }: LinkRowProps) {
  const feedback = useFeedback();
  const { c } = useTheme();
  const color = danger ? c.error : c.primaryText;
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={() => {
        feedback.tap();
        onPress();
      }}
    >
      <Icon name={icon} size={22} color={color} />
      <AppText variant="bodyBold" color={danger ? c.error : c.text} style={styles.texts}>
        {label}
      </AppText>
      {value ? (
        <AppText variant="small" color={c.textMuted}>
          {value}
        </AppText>
      ) : null}
      <Icon name="chevron" size={20} color={c.textMuted} />
    </Pressable>
  );
}

/** Row of mutually exclusive options (language, theme mode, …). */
export function ChoiceRow<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  const feedback = useFeedback();
  const { c } = useTheme();
  return (
    <View style={styles.choices} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            onPress={() => {
              feedback.tap();
              onChange(option.value);
            }}
            style={[
              styles.choice,
              { borderColor: active ? c.primary : c.border, backgroundColor: active ? c.primary : 'transparent' },
            ]}
          >
            <AppText variant="small" color={active ? c.onPrimary : c.text} align="center">
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.sm,
  },
  pressed: { opacity: 0.7 },
  texts: { flex: 1 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs, marginBottom: spacing.sm },
  choice: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 72,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
});
