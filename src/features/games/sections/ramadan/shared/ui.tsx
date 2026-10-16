import { Pressable, type StyleProp, StyleSheet, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { sparklePath } from '@/core/art/kit';
import { AppText } from '@/core/components/ui/AppText';
import { Icon, type IconName } from '@/core/components/ui/Icon';
import { useKitColors } from '@/core/games/kit';
import { fonts, radius, spacing } from '@/core/theme';

/* Small shared pieces of the Ramadan boards: the gold action pill and the starry night backdrop. */

export function ActionButton({ label, onPress, disabled, icon = 'check', testID, style }: { label: string; onPress: () => void; disabled?: boolean; icon?: IconName; testID: string; style?: StyleProp<ViewStyle> }) {
  const k = useKitColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      testID={testID}
      style={({ pressed }) => [styles.action, { backgroundColor: pressed ? k.goldEdge : k.gold, opacity: disabled ? 0.45 : 1 }, style]}
    >
      <Icon name={icon} size={20} color={k.onGold} />
      <AppText variant="bodyBold" color={k.onGold} style={{ fontFamily: fonts.heavy }} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

/** Round icon button (48 dp) for steppers. */
export function RoundButton({ icon, label, onPress, testID, disabled }: { icon: IconName; label: string; onPress: () => void; testID: string; disabled?: boolean }) {
  const k = useKitColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      hitSlop={4}
      style={({ pressed }) => [styles.round, { backgroundColor: pressed ? k.accentSoft : k.tileFace, borderColor: k.tileBorder, opacity: disabled ? 0.4 : 1 }]}
    >
      <Icon name={icon} size={22} color={k.accentText} />
    </Pressable>
  );
}

/** Deterministic star field (fractions of the box). */
export const STAR_FIELD: [number, number, number][] = Array.from({ length: 34 }, (_, i) => {
  const x = ((i * 37 + 11) % 100) / 100;
  const y = ((i * 53 + 7) % 71) / 100;
  return [x, y, 0.7 + ((i * 13) % 10) / 10];
});

/** The warm Ramadan night: a deep indigo gradient with stars and two gold sparkles (artwork colours). */
export function NightBackdrop({ w, h, id, glow = true }: { w: number; h: number; id: string; glow?: boolean }) {
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0B0D24" />
          <Stop offset="0.65" stopColor="#1E2358" />
          <Stop offset="1" stopColor={glow ? '#3A3480' : '#2C3274'} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={w} height={h} fill={`url(#${id}-sky)`} />
      {STAR_FIELD.map(([x, y, r], i) => (
        <Circle key={i} cx={x * w} cy={y * h} r={r} fill="#FFFFFF" opacity={i % 3 === 0 ? 0.9 : 0.55} />
      ))}
      <Path d={sparklePath(w * 0.82, h * 0.14, 6)} fill="#FFE9A8" opacity={0.9} />
      <Path d={sparklePath(w * 0.12, h * 0.3, 4)} fill="#FFE9A8" opacity={0.8} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  action: { minHeight: 52, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg },
  round: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
