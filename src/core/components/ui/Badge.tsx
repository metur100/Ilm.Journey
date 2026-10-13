import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { badgeName, useI18n } from '@/core/i18n';
import type { BadgeId } from '@/core/models';
import { getBadge } from '@/core/services/badges';
import { spacing, useTheme } from '@/core/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

interface BadgeProps {
  id: BadgeId;
  earned: boolean;
  size?: number;
  showLabel?: boolean;
}

/** Eight-pointed star medal. Unearned badges are shown greyed out with a lock. */
export function Badge({ id, earned, size = 72, showLabel = true }: BadgeProps) {
  const { t } = useI18n();
  const { c } = useTheme();
  const def = getBadge(id);
  const color = earned ? (def?.color ?? c.gold) : c.locked;
  const name = t(badgeName(id));

  return (
    <View style={[styles.root, { width: showLabel ? size + 24 : size }]} accessible accessibilityLabel={`${name}${earned ? '' : `, ${t('badges.locked')}`}`}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Path d="M50 4 61 22 82 18 78 39 96 50 78 61 82 82 61 78 50 96 39 78 18 82 22 61 4 50 22 39 18 18 39 22Z" fill={color} />
          <Circle cx={50} cy={50} r={30} fill="#FFFFFF" opacity={earned ? 0.95 : 0.7} />
          <Circle cx={50} cy={50} r={30} fill="none" stroke={color} strokeWidth={3} />
        </Svg>
        <View style={styles.icon}>
          <Icon name={earned ? (def?.icon ?? 'star') : 'lock'} size={size * 0.36} color={earned ? color : c.locked} />
        </View>
      </View>
      {showLabel ? (
        <AppText variant="tiny" align="center" color={earned ? c.text : c.textMuted} numberOfLines={2}>
          {name}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', gap: spacing.xs },
  icon: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});
