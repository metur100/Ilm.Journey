import { View } from 'react-native';

import { AppText } from '@/core/components/ui/AppText';
import { useI18n } from '@/core/i18n';
import type { Character } from '@/core/models';
import { makeStyles, spacing, useTheme } from '@/core/theme';

import { Avatar } from './Avatar';

interface CharacterCardProps {
  character: Character;
  name: string;
  level: number;
  size?: number;
  /** On a dark (night) header. */
  dark?: boolean;
}

const useStyles = makeStyles((c) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { backgroundColor: c.goldSoft, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 },
  texts: { flex: 1 },
}));

/** Avatar with name and level, used on Home and Profile. */
export function CharacterCard({ character, name, level, size = 84, dark }: CharacterCardProps) {
  const { t } = useI18n();
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
        <Avatar character={character} size={size * 0.95} />
      </View>
      <View style={styles.texts}>
        <AppText variant="title" color={dark ? c.onNight : c.text} numberOfLines={1}>
          {name}
        </AppText>
        <AppText variant="small" color={dark ? c.gold : c.goldText}>
          {t('common.level', { level })}
        </AppText>
      </View>
    </View>
  );
}
