import { Pressable, TextInput, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { AppText } from '@/core/components/ui/AppText';
import { Icon, type IconName } from '@/core/components/ui/Icon';
import { ProgressBar } from '@/core/components/ui/ProgressBar';
import { useFeedback } from '@/core/hooks/useFeedback';
import { fonts, makeStyles, radius, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';

import { useSeerahI18n } from '../i18n';
import type { BookmarkType } from '../models';
import { isBookmarked } from '../services/engine';
import { useSeerahStore } from '../store/seerahStore';

const useStyles = makeStyles((c) => ({
  flex: { flex: 1 },
  iconButton: { width: TOUCH_TARGET, height: TOUCH_TARGET, borderRadius: TOUCH_TARGET / 2, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.md, minHeight: TOUCH_TARGET },
  chipIdle: { backgroundColor: c.surface, borderColor: c.border },
  chipSelected: { backgroundColor: c.primary, borderColor: c.primary },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, minHeight: 52, backgroundColor: c.surface, borderColor: c.border },
  searchInput: { flex: 1, fontFamily: fonts.regular, minHeight: TOUCH_TARGET, color: c.text },
  chapter: { gap: spacing.xs },
  stat: { flexBasis: '47%', flexGrow: 1, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: 4, backgroundColor: c.surface, borderColor: c.border },
}));

interface IconButtonProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  color?: string;
  size?: number;
  selected?: boolean;
}

/** Round 48 dp icon button with a screen-reader label. */
export function IconButton({ icon, label, onPress, color, size = 22, selected }: IconButtonProps) {
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected === undefined ? undefined : { selected }}
      onPress={() => {
        feedback.tap();
        onPress();
      }}
      hitSlop={6}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
    >
      <Icon name={icon} size={size} color={color ?? c.text} />
    </Pressable>
  );
}

export function FilterChip({ label, selected, onPress, icon }: { label: string; selected: boolean; onPress: () => void; icon?: IconName }) {
  const { c } = useTheme();
  const styles = useStyles();
  const feedback = useFeedback();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={() => {
        feedback.tap();
        onPress();
      }}
      style={({ pressed }) => [styles.chip, selected ? styles.chipSelected : styles.chipIdle, pressed && styles.pressed]}
    >
      {icon ? <Icon name={icon} size={16} color={selected ? c.onPrimary : c.textMuted} /> : null}
      <AppText variant="small" color={selected ? c.onPrimary : c.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

interface SearchBarProps {
  value: string;
  onChangeText?: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  /** When set, the bar acts as a button that opens the search screen. */
  onPress?: () => void;
}

export function SearchBar({ value, onChangeText, placeholder, autoFocus, onPress }: SearchBarProps) {
  const { c, scale } = useTheme();
  const styles = useStyles();
  const { t } = useSeerahI18n();
  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="search" accessibilityLabel={placeholder} style={styles.search}>
        <Icon name="search" size={20} color={c.textMuted} />
        <AppText variant="body" color={c.textMuted} style={styles.flex}>
          {placeholder}
        </AppText>
      </Pressable>
    );
  }
  return (
    <View style={styles.search}>
      <Icon name="search" size={20} color={c.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.textMuted}
        autoFocus={autoFocus}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={placeholder}
        maxFontSizeMultiplier={1.6}
        style={[styles.searchInput, { fontSize: 16 * scale }]}
      />
      {value ? <IconButton icon="close" label={t('search.clear')} onPress={() => onChangeText?.('')} size={18} color={c.textMuted} /> : null}
    </View>
  );
}

export function BookmarkButton({ type, id, onNight }: { type: BookmarkType; id: string; onNight?: boolean }) {
  const { c } = useTheme();
  const { t } = useSeerahI18n();
  const marked = useSeerahStore((s) => isBookmarked(s.bookmarks, type, id));
  const toggle = useSeerahStore((s) => s.toggleBookmark);
  return (
    <IconButton
      icon={marked ? 'bookmarkFilled' : 'bookmark'}
      label={marked ? t('bookmark.remove') : t('bookmark.add')}
      selected={marked}
      onPress={() => toggle(type, id)}
      color={marked ? (onNight ? c.gold : c.goldText) : onNight ? c.onNight : c.textMuted}
    />
  );
}

/** Eight-pointed star (two overlapping squares) as an SVG path. */
export function star8(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI / 8) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.62;
    pts.push(`${(cx + Math.cos(angle) * rad).toFixed(2)},${(cy + Math.sin(angle) * rad).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

/** A small eight-pointed star between two lines – a quiet divider. */
export function Ornament({ color, width = 120 }: { color: string; width?: number }) {
  const mid = width / 2;
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={width} height={14}>
        <Line x1={0} y1={7} x2={mid - 12} y2={7} stroke={color} strokeWidth={1} opacity={0.6} />
        <Line x1={mid + 12} y1={7} x2={width} y2={7} stroke={color} strokeWidth={1} opacity={0.6} />
        <Path d={star8(mid, 7, 6)} fill={color} />
      </Svg>
    </View>
  );
}

interface ChapterHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  onNight?: boolean;
}

/** Section title with a small geometric ornament (sira's chapter header). */
export function ChapterHeader({ label, title, subtitle, onNight }: ChapterHeaderProps) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.chapter}>
      {label ? (
        <AppText variant="label" color={onNight ? c.gold : c.goldText}>
          {label.toUpperCase()}
        </AppText>
      ) : null}
      <AppText variant="title" color={onNight ? c.onNight : c.text} accessibilityRole="header">
        {title}
      </AppText>
      <Ornament color={onNight ? c.gold : c.goldText} />
      {subtitle ? (
        <AppText variant="body" color={onNight ? c.onNightMuted : c.textMuted}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

export function StatTile({ label, value, progress }: { label: string; value: string; progress?: number }) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <AppText variant="title" color={c.goldText}>
        {value}
      </AppText>
      <AppText variant="tiny" color={c.textMuted}>
        {label}
      </AppText>
      {progress !== undefined ? <ProgressBar progress={progress} height={5} color={c.gold} /> : null}
    </View>
  );
}
