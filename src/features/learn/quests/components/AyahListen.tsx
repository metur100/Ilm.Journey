import { Pressable } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { Icon } from '@/core/components/ui/Icon';
import { makeStyles, radius, spacing, TOUCH_TARGET, useTheme } from '@/core/theme';

import { useQuestI18n } from '../i18n';

const useStyles = makeStyles((c) => ({
  listen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: c.primarySoft,
    alignSelf: 'flex-start',
  },
  active: { backgroundColor: c.primary },
}));

/** "Listen" pill for one ayah (streamed recitation, see services/recitation). */
export function AyahListen({ playing, onPress, label }: { playing: boolean; onPress: () => void; label?: string }) {
  const { t } = useQuestI18n();
  const { c } = useTheme();
  const styles = useStyles();
  const text = playing ? t('recite.stop') : t('recite.play');
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label ? `${text}: ${label}` : text}
      accessibilityState={{ selected: playing }}
      style={[styles.listen, playing && styles.active]}
      hitSlop={4}
    >
      <Icon name={playing ? 'stop' : 'play'} size={16} color={playing ? c.onPrimary : c.primaryText} />
      <AppText variant="small" color={playing ? c.onPrimary : c.primaryText}>
        {text}
      </AppText>
    </Pressable>
  );
}
