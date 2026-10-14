import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { useTheme } from '../theme/useTheme';
import { fonts } from '../theme/tokens';
import { star8Path } from './kit';
import { C } from './palette';

export type LetterCardTone = 'gold' | 'teal' | 'night' | 'rose';

export interface ArabicLetterCardProps {
  /** Any Arabic letter or short string (rendered as text in Noto Naskh Arabic – never drawn). */
  letter: string;
  /** Card width in dp; the card is 140 × 182 (aspect 0.77). */
  size?: number;
  tone?: LetterCardTone;
  /** Draw for a dark surface (default: current theme). */
  dark?: boolean;
  /** Accessibility label (e.g. the letter's name). Defaults to the letter itself. */
  label?: string;
  style?: StyleProp<ViewStyle>;
}

const W = 140;
const H = 182;

const TONES: Record<LetterCardTone, { light: [string, string, string]; dark: [string, string, string] }> = {
  // [frame, background, letter]
  gold: { light: [C.gold, C.cream, C.night], dark: [C.gold, C.nightSoft, C.goldLight] },
  teal: { light: [C.tealMid, '#E6F5F2', '#0A5B52'], dark: [C.tealLight, '#13383A', '#9BEADD'] },
  night: { light: [C.gold, C.night, C.goldLight], dark: [C.gold, C.night, C.goldLight] },
  rose: { light: [C.berry, '#FCEBEE', C.plum], dark: [C.rose, '#3D1D2A', C.pinkPale] },
};

/** Decorative card showing an Arabic letter (Noto Naskh Arabic text on an ornamented frame). */
export function ArabicLetterCard({ letter, size = 120, tone = 'gold', dark, label, style }: ArabicLetterCardProps) {
  const theme = useTheme();
  const isDark = dark ?? theme.dark;
  const [frame, bg, ink] = isDark ? TONES[tone].dark : TONES[tone].light;
  const height = Math.round((size * H) / W);
  const corner = (x: number, y: number, r: number) => (
    <G key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${r})`}>
      <Path d="M0 0H22A22 22 0 0 1 0 22Z" fill={frame} opacity={0.9} />
      <Path d={star8Path(8, 8, 5)} fill={bg} />
    </G>
  );
  return (
    <View
      style={[{ width: size, height }, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label ?? letter}
    >
      <Svg width={size} height={height} viewBox={`0 0 ${W} ${H}`} style={StyleSheet.absoluteFill}>
        <Rect x={0} y={3} width={W} height={H - 3} rx={18} fill={isDark ? '#000000' : C.ink} opacity={isDark ? 0.35 : 0.1} />
        <Rect x={0} y={0} width={W} height={H - 4} rx={18} fill={frame} />
        <Rect x={6} y={6} width={W - 12} height={H - 16} rx={13} fill={bg} />
        <Rect x={12} y={12} width={W - 24} height={H - 28} rx={9} fill="none" stroke={frame} strokeWidth={1.4} opacity={0.7} />
        <Circle cx={W / 2} cy={(H - 4) / 2} r={46} fill={frame} opacity={0.12} />
        <Path d={star8Path(W / 2, (H - 4) / 2, 56)} fill="none" stroke={frame} strokeWidth={1.2} opacity={0.35} />
        {corner(12, 12, 0)}
        {corner(W - 12, 12, 90)}
        {corner(W - 12, H - 16, 180)}
        {corner(12, H - 16, 270)}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center, { paddingBottom: (size * 4) / W }]} importantForAccessibility="no-hide-descendants">
        <Text
          allowFontScaling={false}
          style={{ fontFamily: fonts.arabic, fontSize: size * 0.46, lineHeight: size * 0.8, color: ink, textAlign: 'center', includeFontPadding: false }}
        >
          {letter}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
