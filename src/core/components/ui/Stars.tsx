import { StyleSheet, View } from 'react-native';

import { useI18n } from '@/core/i18n';
import { useTheme } from '@/core/theme';

import { Icon } from './Icon';

export function Stars({ count, size = 16, dark }: { count: number; size?: number; dark?: boolean }) {
  const { t } = useI18n();
  const { c } = useTheme();
  return (
    <View style={styles.row} accessible accessibilityLabel={t('a11y.stars', { count })}>
      {[1, 2, 3].map((n) => (
        <Icon key={n} name={n <= count ? 'star' : 'starOutline'} size={size} color={n <= count ? c.gold : dark ? c.onNightMuted : c.locked} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: 2 } });
