import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/core/components/ui/AppText';
import { Icon } from '@/core/components/ui/Icon';
import { useKitColors } from '@/core/games/kit';
import { fonts, radius, spacing, TOUCH_TARGET } from '@/core/theme';

/*
 * Small shared pieces of the Arabic / Sufara boards: big Arabic text (app Arabic font, RTL, room for harakat above and
 * below), the round "listen" button and the Arabic-style rhombus dots.
 */

/** Arabic text in the app's Arabic font, right-to-left, with a line height that keeps harakat clear of the edges. */
export function ArabicText({ children, size = 40, color, bold = true, style, testID }: { children: string; size?: number; color?: string; bold?: boolean; style?: object; testID?: string }) {
  const k = useKitColors();
  return (
    <AppText
      script="arabic"
      align="center"
      color={color ?? k.text}
      testID={testID}
      style={[{ fontFamily: bold ? fonts.arabicBold : fonts.arabic, fontSize: size, lineHeight: Math.round(size * 1.75), writingDirection: 'rtl' }, style]}
    >
      {children}
    </AppText>
  );
}

/** Round speaker button (48 dp) that says Arabic text. */
export function ListenButton({ onPress, label, size = TOUCH_TARGET, style, testID = 'arabic-listen' }: { onPress: () => void; label: string; size?: number; style?: StyleProp<ViewStyle>; testID?: string }) {
  const k = useKitColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      hitSlop={6}
      style={({ pressed }) => [styles.listen, { width: size, height: size, borderRadius: size / 2, backgroundColor: k.accentSoft, borderColor: k.accent, opacity: pressed ? 0.75 : 1 }, style]}
    >
      <Icon name="speaker" size={size * 0.46} color={k.accent} />
    </Pressable>
  );
}

/** One to three rhombus dots (the way dots are written in Arabic script), side by side or 2 + 1 for three. */
export function Dots({ count, size = 12, color }: { count: number; size?: number; color?: string }) {
  const k = useKitColors();
  const fill = color ?? k.text;
  const d = (cx: number, cy: number) => `M${cx} ${cy - size / 2}L${cx + size / 2} ${cy}L${cx} ${cy + size / 2}L${cx - size / 2} ${cy}Z`;
  const w = size * 2.6;
  const h = count === 3 ? size * 2.2 : size * 1.2;
  const pts: [number, number][] =
    count === 1 ? [[w / 2, h / 2]] : count === 2 ? [[w / 2 - size * 0.7, h / 2], [w / 2 + size * 0.7, h / 2]] : [[w / 2, size * 0.6], [w / 2 - size * 0.7, h - size * 0.6], [w / 2 + size * 0.7, h - size * 0.6]];
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {pts.slice(0, count).map(([x, y], i) => (
        <Path key={i} d={d(x, y)} fill={fill} />
      ))}
    </Svg>
  );
}

/** A row with the listen button and a short target text (e.g. "Ba" or "ba"). Not a heading – a play control. */
export function TargetBar({ text, onListen, listenLabel, arabic, children }: { text?: string; onListen?: () => void; listenLabel: string; arabic?: string; children?: React.ReactNode }) {
  const k = useKitColors();
  return (
    <View style={[styles.target, { backgroundColor: k.tileFace, borderColor: k.tileBorder }]}>
      {onListen ? <ListenButton onPress={onListen} label={listenLabel} /> : null}
      <View style={styles.targetText}>
        {text ? (
          <AppText variant="bodyBold" color={k.text} numberOfLines={2}>
            {text}
          </AppText>
        ) : null}
        {children}
      </View>
      {arabic ? <ArabicText size={34}>{arabic}</ArabicText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  listen: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  target: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.lg, borderWidth: 1.5, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, minHeight: 60 },
  targetText: { flex: 1, gap: 2 },
});
