import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { star8Path } from '../../art/kit';
import { AppText } from '../../components/ui/AppText';
import { Icon, type IconName } from '../../components/ui/Icon';
import type { TopicId } from '../../models';
import { radius, spacing, TOUCH_TARGET, topicThemes, useTheme } from '../../theme';

export interface GameHeaderProps {
  title: string;
  subtitle?: string;
  topic: TopicId;
  onBack: () => void;
  backIcon?: IconName;
  backLabel: string;
  /** 0..1 shows the level progress bar under the title (play phase). */
  progress?: number;
  progressLabel?: string;
  right?: ReactNode;
  reducedMotion?: boolean;
}

/**
 * The one header of every game screen (intro, how to play, levels, play, result): the topic gradient with a back /
 * close button, the game title, a subtitle (topic, stars or level) and – while playing – the level progress.
 * Games never draw their own title.
 */
export function GameHeader({ title, subtitle, topic, onBack, backIcon = 'back', backLabel, progress, progressLabel, right, reducedMotion }: GameHeaderProps) {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const theme = topicThemes[topic];
  const p = useSharedValue(progress ?? 0);
  useEffect(() => {
    p.set(reducedMotion ? (progress ?? 0) : withTiming(progress ?? 0, { duration: 400 }));
  }, [progress, p, reducedMotion]);
  const fill = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(1, p.value)) * 100}%` }));
  return (
    <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.bar, { paddingTop: insets.top + spacing.xs }]} testID="game-header">
      <View pointerEvents="none" style={styles.deco} importantForAccessibility="no-hide-descendants">
        <Svg width={130} height={130} viewBox="0 0 120 120">
          <Path d={star8Path(60, 60, 54)} fill="none" stroke={c.onAccent} strokeOpacity={0.13} strokeWidth={3} />
          <Path d={star8Path(60, 60, 32)} fill={c.onAccent} fillOpacity={0.07} />
        </Svg>
      </View>
      <View style={styles.row}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={backLabel} hitSlop={6} style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]} testID="game-header-back">
          <Icon name={backIcon} size={24} color={c.onAccent} />
        </Pressable>
        <View style={styles.titles}>
          <AppText variant="heading" color={c.onAccent} numberOfLines={1} accessibilityRole="header" testID="game-header-title">
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="tiny" color={c.onAccent} numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      {progress !== undefined ? (
        <View
          style={styles.track}
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={progressLabel}
          accessibilityValue={{ min: 0, max: 100, now: Math.round((progress ?? 0) * 100) }}
          testID="game-header-progress"
        >
          <Animated.View style={[styles.fill, { backgroundColor: c.gold }, fill]} />
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bar: { paddingHorizontal: spacing.sm, paddingBottom: spacing.md, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl, overflow: 'hidden' },
  deco: { position: 'absolute', right: -28, top: -18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 52 },
  back: { width: TOUCH_TARGET, height: TOUCH_TARGET, borderRadius: TOUCH_TARGET / 2, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  titles: { flex: 1, gap: 0 },
  subtitle: { opacity: 0.88 },
  right: { minWidth: TOUCH_TARGET, alignItems: 'flex-end', justifyContent: 'center', paddingRight: spacing.xs },
  track: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.22)', marginTop: spacing.sm, marginHorizontal: spacing.sm, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
});
